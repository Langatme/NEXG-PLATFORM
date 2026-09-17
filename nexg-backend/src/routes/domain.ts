import { Router } from "express";
import { query } from "../db.js";
import { appendNclEvent } from "../ledger.js";
import { indexDocument } from "./discovery.js";
import { createTaskForOrder } from "./deliveries.js";
import { newId, requireMerchantScope, requireRoles, type Role } from "../auth.js";

export const categories = Router();
export const merchants = Router();
export const catalog = Router();
export const experiences = Router();
export const search = Router();
export const orders = Router();
export const bookings = Router();
export const media = Router();
export const ledger = Router();
export const requests = Router();
export const units = Router(); // H-05: property → units (own table, own-property scope).
export const promos = Router(); // M-13: promos engine + coupons.
export const customers = Router(); // M-11: derived customer view (no new table).
export const finance = Router(); // M-12: readonly derived finance summary.
export const staff = Router(); // M-14: scoped staff list.

// Domain APIs — no screen-specific endpoints (no /home-screen-data).

categories.get("/", async (_req, res) => {
  const rows = await query(`SELECT * FROM categories ORDER BY sort`);
  res.json({ data: rows });
});

categories.get("/:id", async (req, res) => {
  const rows = await query(`SELECT * FROM categories WHERE id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "not_found" });
  const subs = await query(`SELECT * FROM subcategories WHERE category_id = $1`, [req.params.id]);
  res.json({ data: { ...rows[0], subcategories: subs } });
});

merchants.get("/", async (req, res) => {
  const { category, vertical, q, limit, offset } = req.query as any;
  const lim = Math.min(Number(limit ?? 1000), 2000);
  const off = Math.max(Number(offset ?? 0), 0);
  const rows = await query(
    `SELECT * FROM merchants WHERE is_active = true
     AND ($1::text IS NULL OR category_id = $1)
     AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%')
     AND ($3::text IS NULL OR $3 = ANY(verticals))
     ORDER BY rating DESC LIMIT $4 OFFSET $5`,
    [category ?? null, q ?? null, vertical ?? null, lim, off]
  );
  res.json({ data: rows, total: rows.length, limit: lim, offset: off });
});

merchants.get("/:id", async (req, res) => {
  const rows = await query(`SELECT * FROM merchants WHERE id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "not_found" });
  const sections = await query(
    `SELECT * FROM catalog_sections WHERE merchant_id = $1 ORDER BY sort`,
    [req.params.id]
  );
  res.json({ data: { ...rows[0], sections } });
});

catalog.get("/items", async (req, res) => {
  // CB-06: pagination (limit/cursor via offset) + total + filters.
  const { merchant, q, section, available, min_price, max_price, limit, offset } = req.query as any;
  const lim = Math.min(Number(limit ?? 200), 500);
  const off = Math.max(Number(offset ?? 0), 0);
  const rows = await query(
    `SELECT * FROM catalog_items
     WHERE ($1::text IS NULL OR merchant_id = $1)
       AND ($2::text IS NULL OR title ILIKE '%' || $2 || '%' OR name ILIKE '%' || $2 || '%')
       AND ($3::text IS NULL OR section_id = $3)
       AND ($4::text IS NULL OR is_available = ($4 = 'true'))
       AND ($5::int IS NULL OR price_kes >= $5)
       AND ($6::int IS NULL OR price_kes <= $6)
     ORDER BY title LIMIT $7 OFFSET $8`,
    [merchant ?? null, q ?? null, section ?? null, available ?? null,
     min_price ?? null, max_price ?? null, lim, off]
  );
  const total = await query(
    `SELECT count(*)::int AS n FROM catalog_items
     WHERE ($1::text IS NULL OR merchant_id = $1)
       AND ($2::text IS NULL OR title ILIKE '%' || $2 || '%' OR name ILIKE '%' || $2 || '%')`,
    [merchant ?? null, q ?? null]
  );
  res.json({ data: rows, total: (total[0] as any).n, limit: lim, offset: off });
});

catalog.get("/items/:id", async (req, res) => {
  const rows = await query(`SELECT * FROM catalog_items WHERE id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "not_found" });
  const variants = await query(`SELECT * FROM item_variants WHERE item_id = $1`, [req.params.id]);
  const addons = await query(`SELECT * FROM addon_groups WHERE item_id = $1`, [req.params.id]);
  res.json({ data: { ...rows[0], variants, addon_groups: addons } });
});

// Catalog writes (M4): own merchant only (or admin). NCL each; menu edits never
// rewrite history — past order_lines keep their snapshot prices.
function assertOwnMerchant(req: any, merchantId: string | null | undefined, res: any): boolean {
  const roles: string[] = req.auth?.roles ?? [];
  if (roles.includes("admin")) return true;
  if (!req.auth?.merchant_id || (merchantId && merchantId !== req.auth.merchant_id)) {
    res.status(403).json({ error: "cross_merchant_forbidden" });
    return false;
  }
  return true;
}

const STAFF: Role[] = ["merchant_owner", "merchant_staff", "admin"];

catalog.post(
  "/sections",
  requireRoles(STAFF),
  async (req: any, res) => {
    const { merchant_id, name, subtitle } = req.body ?? {};
    if (!merchant_id || !name) return res.status(422).json({ error: "merchant_id + name required" });
    if (!assertOwnMerchant(req, merchant_id, res)) return;
    const id = `${merchant_id}_s${Date.now().toString(36)}`;
    const rows = await query(
      `INSERT INTO catalog_sections (id, merchant_id, name, sort, subtitle) VALUES ($1,$2,$3,0,$4) RETURNING *`,
      [id, merchant_id, name, subtitle ?? null]
    );
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "catalog.section_created",
      entity_type: "section", entity_id: id, idempotency_key: id, new_state: { merchant_id, name }, source: "nexg-api",
    });
    res.status(201).json({ data: rows[0] });
  }
);

// Sections U/D (M complete): rename + delete (409 when items reference).
catalog.patch(
  "/sections/:id",
  requireRoles(STAFF),
  async (req: any, res) => {
    const s = (await query(`SELECT * FROM catalog_sections WHERE id = $1`, [req.params.id]))[0] as any;
    if (!s) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, s.merchant_id, res)) return;
    const patch: Record<string, unknown> = {};
    for (const f of ["name", "subtitle", "sort"] as const) if (req.body?.[f] !== undefined) patch[f] = req.body[f];
    if (!Object.keys(patch).length) return res.status(422).json({ error: "nothing to update" });
    const sets = Object.keys(patch).map((k, i) => `${k} = $${i + 2}`).join(", ");
    await query(`UPDATE catalog_sections SET ${sets} WHERE id = $1`, [req.params.id, ...Object.values(patch)]);
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "catalog.section_updated",
      entity_type: "section", entity_id: s.id, idempotency_key: `${s.id}:${Date.now()}`,
      prev_state: { name: s.name }, new_state: patch, source: "nexg-api",
    });
    const updated = await query(`SELECT * FROM catalog_sections WHERE id = $1`, [req.params.id]);
    res.json({ data: updated[0] });
  }
);

catalog.delete(
  "/sections/:id",
  requireRoles(STAFF),
  async (req: any, res) => {
    const s = (await query(`SELECT * FROM catalog_sections WHERE id = $1`, [req.params.id]))[0] as any;
    if (!s) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, s.merchant_id, res)) return;
    const refs = await query(`SELECT count(*) AS n FROM catalog_items WHERE section_id = $1`, [s.id]);
    if (Number((refs[0] as any).n) > 0) return res.status(409).json({ error: "section_has_items", hint: "move items first" });
    await query(`DELETE FROM catalog_sections WHERE id = $1`, [s.id]);
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "catalog.section_deleted",
      entity_type: "section", entity_id: s.id, idempotency_key: `${s.id}:deleted`,
      prev_state: { name: s.name }, new_state: {}, source: "nexg-api",
    });
    res.json({ data: { deleted: s.id } });
  }
);

catalog.post(
  "/items",
  requireRoles(STAFF),
  async (req: any, res) => {
    const { merchant_id, section_id, name, description, price_kes, tags, is_popular, duration_min, capabilities, item_type } = req.body ?? {};
    if (!merchant_id || !name || price_kes === undefined)
      return res.status(422).json({ error: "merchant_id + name + price_kes required" });
    if (!assertOwnMerchant(req, merchant_id, res)) return;
    if (section_id) {
      const s = await query(`SELECT merchant_id FROM catalog_sections WHERE id = $1`, [section_id]);
      if (!s[0]) return res.status(422).json({ error: "unknown section" });
      if ((s[0] as any).merchant_id !== merchant_id && !req.auth.roles.includes("admin"))
        return res.status(403).json({ error: "cross_merchant_forbidden" });
    }
    const caps: string[] = Array.isArray(capabilities) && capabilities.length ? capabilities : ["add"];
    const allowedCaps = ["add", "book", "reserve", "quote", "request", "view"];
    for (const c of caps) if (!allowedCaps.includes(c)) return res.status(422).json({ error: `unknown capability ${c}` });
    const id = `${merchant_id}_i${Date.now().toString(36)}`;
    const rows = await query(
      `INSERT INTO catalog_items (id, merchant_id, section_id, title, name, description, price_kes, tags, is_popular, duration_min, capabilities, item_type, is_available)
       VALUES ($1,$2,$3,$4,$4,$5,$6,$7,$8,$9,$10,$11,true) RETURNING *`,
      [id, merchant_id, section_id ?? null, name, description ?? "", Math.round(Number(price_kes)), tags ?? [], !!is_popular, duration_min ?? null, caps, item_type ?? "food"]
    );
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "catalog.item_created",
      entity_type: "item", entity_id: id, idempotency_key: id, new_state: { merchant_id, name, capabilities: caps }, source: "nexg-api",
    });
    void indexDocument("item", id, `item ${name} ${description ?? ""} merchant ${merchant_id}`);
    res.status(201).json({ data: rows[0] });
  }
);

catalog.patch(
  "/items/:id",
  requireRoles(STAFF),
  async (req: any, res) => {
    const rows = await query(`SELECT * FROM catalog_items WHERE id = $1`, [req.params.id]);
    const item: any = rows[0];
    if (!item) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, item.merchant_id, res)) return;
    const patch: Record<string, unknown> = {};
    for (const f of ["name", "description", "tags", "is_popular", "duration_min", "is_available", "section_id"] as const) {
      if (req.body?.[f] !== undefined) patch[f] = req.body[f];
    }
    if (req.body?.price_kes !== undefined) patch.price_kes = Math.round(Number(req.body.price_kes));
    if (patch.title === undefined && patch.name !== undefined) patch.title = patch.name;
    if (!Object.keys(patch).length) return res.status(422).json({ error: "nothing to update" });
    const sets = Object.keys(patch).map((k, i) => `${k} = $${i + 2}`).join(", ");
    const vals = Object.values(patch);
    await query(`UPDATE catalog_items SET ${sets} WHERE id = $1`, [req.params.id, ...vals]);
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "catalog.item_updated",
      entity_type: "item", entity_id: item.id, idempotency_key: `${item.id}:${Date.now()}`,
      prev_state: { price_kes: item.price_kes, is_available: item.is_available },
      new_state: patch, source: "nexg-api",
    });
    const updated = await query(`SELECT * FROM catalog_items WHERE id = $1`, [req.params.id]);
    res.json({ data: updated[0] });
  }
);

catalog.delete(
  "/items/:id",
  requireRoles(STAFF),
  async (req: any, res) => {
    const rows = await query(`SELECT * FROM catalog_items WHERE id = $1`, [req.params.id]);
    const item: any = rows[0];
    if (!item) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, item.merchant_id, res)) return;
    const refs = await query(
      `SELECT (SELECT count(*) FROM order_lines WHERE item_id = $1) AS orders,
              (SELECT count(*) FROM bookings WHERE item_id = $1) AS bookings`,
      [req.params.id]
    );
    const r: any = refs[0];
    if (Number(r.orders) + Number(r.bookings) > 0)
      return res.status(409).json({ error: "referenced_by_history", detail: r, hint: "set is_available=false instead" });
    await query(`DELETE FROM catalog_items WHERE id = $1`, [req.params.id]);
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "catalog.item_deleted",
      entity_type: "item", entity_id: item.id, idempotency_key: `${item.id}:deleted`,
      prev_state: { name: item.name }, new_state: {}, source: "nexg-api",
    });
    res.json({ data: { deleted: item.id } });
  }
);

catalog.post(
  "/items/:id/variants",
  requireRoles(STAFF),
  async (req: any, res) => {
    const item = (await query(`SELECT merchant_id FROM catalog_items WHERE id = $1`, [req.params.id]))[0] as any;
    if (!item) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, item.merchant_id, res)) return;
    const { name, price_delta_kes } = req.body ?? {};
    if (!name) return res.status(422).json({ error: "name required" });
    const id = `${req.params.id}__v${Date.now().toString(36)}`;
    const rows = await query(
      `INSERT INTO item_variants (id, item_id, name, price_delta_kes) VALUES ($1,$2,$3,$4) RETURNING *`,
      [id, req.params.id, name, Math.round(Number(price_delta_kes ?? 0))]
    );
    res.status(201).json({ data: rows[0] });
  }
);

catalog.post(
  "/items/:id/addons",
  requireRoles(STAFF),
  async (req: any, res) => {
    const item = (await query(`SELECT merchant_id FROM catalog_items WHERE id = $1`, [req.params.id]))[0] as any;
    if (!item) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, item.merchant_id, res)) return;
    const { name = "Add-ons", required = false, multi = true, options = [] } = req.body ?? {};
    const id = `${req.params.id}__addons`;
    const rows = await query(
      `INSERT INTO addon_groups (id, item_id, name, required, multi, options)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, required=EXCLUDED.required, multi=EXCLUDED.multi, options=EXCLUDED.options
       RETURNING *`,
      [id, req.params.id, name, !!required, !!multi, JSON.stringify(options)]
    );
    res.status(201).json({ data: rows[0] });
  }
);

// Variants U/D + addon delete (M complete)
catalog.patch(
  "/variants/:id",
  requireRoles(STAFF),
  async (req: any, res) => {
    const v = (await query(
      `SELECT v.*, i.merchant_id FROM item_variants v JOIN catalog_items i ON i.id = v.item_id WHERE v.id = $1`,
      [req.params.id]
    ))[0] as any;
    if (!v) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, v.merchant_id, res)) return;
    const patch: Record<string, unknown> = {};
    if (req.body?.name !== undefined) patch.name = req.body.name;
    if (req.body?.price_delta_kes !== undefined) patch.price_delta_kes = Math.round(Number(req.body.price_delta_kes));
    if (!Object.keys(patch).length) return res.status(422).json({ error: "nothing to update" });
    const sets = Object.keys(patch).map((k, i) => `${k} = $${i + 2}`).join(", ");
    await query(`UPDATE item_variants SET ${sets} WHERE id = $1`, [req.params.id, ...Object.values(patch)]);
    const updated = await query(`SELECT * FROM item_variants WHERE id = $1`, [req.params.id]);
    res.json({ data: updated[0] });
  }
);

catalog.delete(
  "/variants/:id",
  requireRoles(STAFF),
  async (req: any, res) => {
    const v = (await query(
      `SELECT v.id, i.merchant_id FROM item_variants v JOIN catalog_items i ON i.id = v.item_id WHERE v.id = $1`,
      [req.params.id]
    ))[0] as any;
    if (!v) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, v.merchant_id, res)) return;
    await query(`DELETE FROM item_variants WHERE id = $1`, [req.params.id]);
    res.json({ data: { deleted: req.params.id } });
  }
);

catalog.delete(
  "/addons/:id",
  requireRoles(STAFF),
  async (req: any, res) => {
    const g = (await query(
      `SELECT g.id, i.merchant_id FROM addon_groups g JOIN catalog_items i ON i.id = g.item_id WHERE g.id = $1`,
      [req.params.id]
    ))[0] as any;
    if (!g) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, g.merchant_id, res)) return;
    await query(`DELETE FROM addon_groups WHERE id = $1`, [req.params.id]);
    res.json({ data: { deleted: req.params.id } });
  }
);

// M-10: catalog publish — no schema change (availability is the live flag).
// Emits idempotent hash-chained NCL `catalog.published` with live counts so
// merchant app publish flow + SSE `merchant:<id>` assertions have a contract.
catalog.post(
  "/publish",
  requireRoles(STAFF),
  async (req: any, res) => {
    const { merchant_id } = req.body ?? {};
    if (!merchant_id) return res.status(422).json({ error: "merchant_id required" });
    if (!assertOwnMerchant(req, merchant_id, res)) return;
    const counts = (await query(
      `SELECT count(*) FILTER (WHERE is_available = true) AS live,
              count(*) AS total,
              (SELECT count(*) FROM catalog_sections WHERE merchant_id = $1) AS sections
       FROM catalog_items WHERE merchant_id = $1`,
      [merchant_id]
    ))[0] as any;
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "catalog.published",
      entity_type: "merchant", entity_id: merchant_id, idempotency_key: `${merchant_id}:published:${Date.now()}`,
      new_state: {
        merchant_id,
        live_items: Number(counts.live ?? 0),
        total_items: Number(counts.total ?? 0),
        sections: Number(counts.sections ?? 0),
      },
      source: "nexg-api",
    });
    res.status(201).json({
      data: {
        merchant_id,
        live_items: Number(counts.live ?? 0),
        total_items: Number(counts.total ?? 0),
        sections: Number(counts.sections ?? 0),
      },
    });
  }
);

merchants.post(
  "/",
  requireRoles(["merchant_owner", "merchant_staff", "host_owner", "host_staff", "admin"]),
  async (req: any, res) => {
    const { name, kind = "rest", vertical = "food", category_id, description } = req.body ?? {};
    if (!name) return res.status(422).json({ error: "name required" });
    const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "merchant";
    const id = `mrc_${slug}_${Date.now().toString(36)}`;
    const rows = await query(
      `INSERT INTO merchants (id, name, kind, vertical, category_id, description, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,true) RETURNING *`,
      [id, name, kind, vertical, category_id ?? null, description ?? ""]
    );
    // No dead clicks: every merchant opens with at least one section (empty menu never renders blank).
    const secId = `${id}_s0`;
    await query(
      `INSERT INTO catalog_sections (id, merchant_id, name, sort, subtitle) VALUES ($1,$2,'General',0,'New') ON CONFLICT DO NOTHING`,
      [secId, id]
    );
    const sampleItemId = `${id}_i0`;
    await query(
      `INSERT INTO catalog_items (id, merchant_id, section_id, title, name, description, price_kes, capabilities, is_available)
       VALUES ($1,$2,$3,'Welcome item','Welcome item','New merchant — edit me',100,'{add}',true) ON CONFLICT DO NOTHING`,
      [sampleItemId, id, secId]
    );
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "merchant.onboarded",
      entity_type: "merchant", entity_id: id, idempotency_key: id,
      new_state: { merchant_id: id, name }, source: "nexg-api",
    });
    void indexDocument("merchant", id, `merchant ${id} ${name} ${kind} ${vertical}`);
    res.status(201).json({ data: rows[0] });
  }
);

merchants.patch(
  "/:id",
  requireRoles(["merchant_owner", "merchant_staff", "host_owner", "host_staff", "admin"]),
  async (req: any, res) => {
    const rows = await query(`SELECT id FROM merchants WHERE id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, req.params.id, res)) return;
    const patch: Record<string, unknown> = {};
    // H-05: property editors — media keys, amenities[], policies[] (validated below).
    for (const f of ["is_open", "is_active", "description", "eta_min", "min_order_kes", "image", "hero_image_key"] as const) {
      if (req.body?.[f] !== undefined) patch[f] = req.body[f];
    }
    for (const f of ["amenities", "policies"] as const) {
      const v = req.body?.[f];
      if (v !== undefined) {
        if (!Array.isArray(v) || !v.every((s) => typeof s === "string"))
          return res.status(422).json({ error: "invalid_list", field: f });
        patch[f] = v;
      }
    }
    if (!Object.keys(patch).length) return res.status(422).json({ error: "nothing to update" });
    const sets = Object.keys(patch).map((k, i) => `${k} = $${i + 2}`).join(", ");
    await query(`UPDATE merchants SET ${sets} WHERE id = $1`, [req.params.id, ...Object.values(patch)]);
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "merchant.updated",
      entity_type: "merchant", entity_id: req.params.id, idempotency_key: `${req.params.id}:${Date.now()}`,
      new_state: patch, source: "nexg-api",
    });
    const updated = await query(`SELECT * FROM merchants WHERE id = $1`, [req.params.id]);
    res.json({ data: updated[0] });
  }
);

merchants.delete(
  "/:id",
  requireRoles(["admin"]),
  async (req, res) => {
    const rows = await query(`SELECT id FROM merchants WHERE id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "not_found" });
    // Protect history: refuse when orders/bookings reference the merchant.
    const refs = await query(
      `SELECT (SELECT count(*) FROM orders WHERE merchant_id = $1) AS orders,
              (SELECT count(*) FROM bookings WHERE merchant_id = $1) AS bookings`,
      [req.params.id]
    );
    const r: any = refs[0];
    if (Number(r.orders) + Number(r.bookings) > 0)
      return res.status(409).json({ error: "referenced_by_history" });
    await query(`DELETE FROM merchants WHERE id = $1`, [req.params.id]);
    await appendNclEvent({
      actor_type: "user", actor_id: (req as any).auth.sub, event_type: "merchant.deleted",
      entity_type: "merchant", entity_id: req.params.id, idempotency_key: `${req.params.id}:deleted`,
      prev_state: {}, new_state: {}, source: "nexg-api",
    });
    res.json({ data: { deleted: req.params.id } });
  }
);

// Units (H-05, HST-012→015): own table, own-property scope, NCL each.
// History guard: a unit with bookings pinned to it cannot be deleted (409).
const HOST_ROLES: Role[] = ["host_owner", "host_staff", "admin"];

function newUnitId(): string {
  const t = Date.now().toString(36);
  const abc = "0123456789abcdefghijklmnopqrstuvwxyz";
  let r = "";
  for (let i = 0; i < 6; i++) r += abc[Math.floor(Math.random() * abc.length)];
  return `unt_${t}_${r}`;
}

units.get(
  "/",
  requireRoles([...HOST_ROLES, "consumer"]),
  requireMerchantScope((req) => (req.query.property as string) ?? null),
  async (req: any, res) => {
    const property = (req.query.property as string) ?? req.auth.merchant_id ?? null;
    if (!property) return res.status(422).json({ error: "property required" });
    // Staff are bound to their own property; consumer-role reads (incl. guests)
    // are list-scoped by ?property, same posture as bookings/requests lists.
    if (req.auth.merchant_id && !assertOwnMerchant(req, property, res)) return;
    const rows = await query(`SELECT * FROM units WHERE property_id = $1 ORDER BY created_at`, [property]);
    res.json({ data: rows });
  }
);

units.post(
  "/",
  requireRoles(HOST_ROLES),
  async (req: any, res) => {
    const { property_id, name, unit_type = "room", capacity = 2, price_kes = null } = req.body ?? {};
    if (!property_id || !name) return res.status(422).json({ error: "property_id + name required" });
    if (!assertOwnMerchant(req, property_id, res)) return;
    const prop = await query(`SELECT id FROM merchants WHERE id = $1`, [property_id]);
    if (!prop[0]) return res.status(404).json({ error: "unknown_property" });
    const id = newUnitId();
    const rows = await query(
      `INSERT INTO units (id, property_id, name, unit_type, capacity, price_kes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id, property_id, name, unit_type, Number(capacity) || 2, price_kes ?? null]
    );
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "unit.added",
      entity_type: "unit", entity_id: id, idempotency_key: id,
      new_state: { merchant_id: property_id, property_id, unit_id: id, name }, source: "nexg-api",
    });
    res.status(201).json({ data: rows[0] });
  }
);

units.patch(
  "/:id",
  requireRoles(HOST_ROLES),
  async (req: any, res) => {
    const rows = await query(`SELECT * FROM units WHERE id = $1`, [req.params.id]);
    const unit: any = rows[0];
    if (!unit) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, unit.property_id, res)) return;
    const patch: Record<string, unknown> = {};
    for (const f of ["name", "unit_type", "capacity", "price_kes", "is_active"] as const) {
      if (req.body?.[f] !== undefined) patch[f] = req.body[f];
    }
    if (!Object.keys(patch).length) return res.status(422).json({ error: "nothing to update" });
    const sets = Object.keys(patch).map((k, i) => `${k} = $${i + 2}`).join(", ");
    await query(`UPDATE units SET ${sets} WHERE id = $1`, [req.params.id, ...Object.values(patch)]);
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "unit.updated",
      entity_type: "unit", entity_id: req.params.id, idempotency_key: `${req.params.id}:${Date.now()}`,
      prev_state: { property_id: unit.property_id }, new_state: { merchant_id: unit.property_id, ...patch }, source: "nexg-api",
    });
    const updated = await query(`SELECT * FROM units WHERE id = $1`, [req.params.id]);
    res.json({ data: updated[0] });
  }
);

units.delete(
  "/:id",
  requireRoles(HOST_ROLES),
  async (req: any, res) => {
    const rows = await query(`SELECT * FROM units WHERE id = $1`, [req.params.id]);
    const unit: any = rows[0];
    if (!unit) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, unit.property_id, res)) return;
    const refs = await query(`SELECT count(*) AS n FROM bookings WHERE unit_id = $1`, [req.params.id]);
    if (Number((refs[0] as any).n) > 0)
      return res.status(409).json({ error: "referenced_by_bookings" });
    await query(`DELETE FROM units WHERE id = $1`, [req.params.id]);
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "unit.deleted",
      entity_type: "unit", entity_id: req.params.id, idempotency_key: `${req.params.id}:deleted`,
      prev_state: { property_id: unit.property_id }, new_state: { merchant_id: unit.property_id }, source: "nexg-api",
    });
    res.json({ data: { deleted: req.params.id } });
  }
);

experiences.get("/", async (req, res) => {
  // CB-03: sessions source. Experiences are catalog_items with book/reserve capabilities.
  // Sunset condition for mock getSessions(): when this returns non-empty, apps must use it.
  const { limit } = req.query as any;
  const rows = await query(
    `SELECT * FROM catalog_items WHERE capabilities && ARRAY['book','reserve'] LIMIT $1`,
    [Math.min(Number(limit ?? 100), 200)]
  );
  if (rows.length) return res.json({ data: rows, source: "backend" });
  // Fallback until merchants publish bookable items: popular items shaped as experiences
  // so consumer getSessions() has a live source (mock-ownership ends here).
  const fallback = await query(`SELECT * FROM catalog_items WHERE is_popular = true LIMIT $1`, [
    Math.min(Number(limit ?? 20), 50),
  ]);
  res.json({ data: fallback, source: rows.length ? "backend" : "fallback-popular", mock_sunset: "use backend when source=backend" });
});

search.get("/", async (req: any, res) => {
  const q = String(req.query.q ?? "");
  if (!q) return res.json({ data: { suggestions: [], merchants: [], items: [] } });
  // CB-02: persist search for ranking (best-effort, never fails search). account_id when authed.
  try {
    let accountId: string | null = null;
    const header = req.headers.authorization ?? "";
    if (header.startsWith("Bearer ")) {
      const { verifyToken } = await import("../auth.js");
      try {
        const c: any = verifyToken(header.slice(7));
        accountId = c.account_id ?? null;
      } catch {}
    }
    await query(`INSERT INTO search_history (account_id, query) VALUES ($1::uuid,$2)`, [accountId, q]);
  } catch {}
  // Parity with consumer mock search: name + category/tags/description, not just name.
  // tags matched via array_to_string so the trgm GIN index applies (unnest can't).
  const merch = await query(
    `SELECT * FROM merchants WHERE name ILIKE '%' || $1 || '%'
      OR category_label ILIKE '%' || $1 || '%'
      OR description ILIKE '%' || $1 || '%'
      OR tags_text(tags) ILIKE '%' || $1 || '%'
     LIMIT 10`,
    [q]
  );
  const items = await query(
    `SELECT * FROM catalog_items WHERE title ILIKE '%' || $1 || '%' OR name ILIKE '%' || $1 || '%'
      OR description ILIKE '%' || $1 || '%'
      OR tags_text(tags) ILIKE '%' || $1 || '%'
     LIMIT 20`,
    [q]
  );
  res.json({ data: { query: q, merchants: merch, items, suggestions: [] } });
});

search.get("/suggestions", async (req: any, res) => {
  // CB-02: data-driven ranking from search_history + popular fallback.
  const q = String(req.query.q ?? "");
  const popular = await query(
    `SELECT query, count(*)::int AS n FROM search_history
     WHERE ($1::text IS NULL OR $1 = '' OR query ILIKE '%' || $1 || '%')
     GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
    [q || null]
  );
  const recent: unknown[] = [];
  res.json({ data: { suggestions: popular.map((p: any) => p.query), popular, recent } });
});

orders.post(
  "/",
  requireRoles(["consumer", "merchant_owner", "merchant_staff", "host_owner", "admin"]),
  async (req: any, res) => {
    const { merchant_id, lines, payment_method, idempotency_key, promo_code } = req.body ?? {};
    if (!merchant_id || !Array.isArray(lines) || !lines.length)
      return res.status(422).json({ error: "merchant_id + lines[] required" });
    // Server-side price truth: resolvable items are repriced from catalog.
    // Mismatch → 422 (client tampering or stale menu). Custom lines (no item_id)
    // keep client prices (catering/specials) — flagged in a later milestone.
    const priced: Array<{ item_id: string | null; title: string; qty: number; unit: number }> = [];
    for (const l of lines) {
      const qty = Math.max(1, Math.min(99, Number(l.qty) || 1));
      if (!l.title) return res.status(422).json({ error: "line title required" });
      if (l.item_id) {
        const rows = await query(`SELECT price_kes, is_available FROM catalog_items WHERE id = $1`, [l.item_id]);
        if (!rows[0]) return res.status(422).json({ error: `unknown item ${l.item_id}` });
        if ((rows[0] as any).is_available === false)
          return res.status(422).json({ error: "out_of_stock", item_id: l.item_id });
        if (Number(l.unit_price_kes) !== Number((rows[0] as any).price_kes))
          return res.status(422).json({
            error: "stale_price",
            item_id: l.item_id,
            current_price_kes: Number((rows[0] as any).price_kes),
          });
        priced.push({ item_id: l.item_id, title: l.title, qty, unit: Number((rows[0] as any).price_kes) });
      } else {
        priced.push({ item_id: null, title: l.title, qty, unit: Math.max(0, Number(l.unit_price_kes) || 0) });
      }
    }
    const subtotal = priced.reduce((s, l) => s + l.qty * l.unit, 0);
    const fees = 49;
    // M-13: promo apply (invalid/expired→422, double-redeem→409).
    let discount = 0;
    let promo: any = null;
    if (promo_code) {
      const prows = await query(`SELECT * FROM promos WHERE code = $1 AND merchant_id = $2`, [String(promo_code).toUpperCase(), merchant_id]);
      promo = prows[0] as any;
      if (!promo || promo.is_active === false) return res.status(422).json({ error: "invalid_promo" });
      const now = Date.now();
      if ((promo.starts_at && new Date(promo.starts_at).getTime() > now) || (promo.ends_at && new Date(promo.ends_at).getTime() < now))
        return res.status(422).json({ error: "expired_promo" });
      if (subtotal < Number(promo.min_order_kes ?? 0)) return res.status(422).json({ error: "promo_min_not_met", min_order_kes: promo.min_order_kes });
      if (Number(promo.max_uses ?? 0) > 0 && Number(promo.used_count ?? 0) >= Number(promo.max_uses))
        return res.status(422).json({ error: "promo_exhausted" });
      const dup = await query(`SELECT id FROM coupons WHERE promo_id = $1 AND account_id = $2::uuid`, [promo.id, req.auth.account_id]);
      if (dup[0]) return res.status(409).json({ error: "double_redeem" });
      discount = promo.kind === "percent" ? Math.floor((subtotal * Number(promo.value_kes)) / 100) : Math.min(Number(promo.value_kes), subtotal);
    }
    const total = subtotal - discount + fees;
    const id = newId("ord");
    try {
      await query(
        `INSERT INTO orders (id, account_id, merchant_id, status, subtotal_kes, fees_kes, total_kes, payment_method, idempotency_key)
         VALUES ($1,$2,$3,'PLACED',$4,$5,$6,$7,$8)`,
        [id, req.auth.account_id, merchant_id, subtotal, fees, total, payment_method ?? "mpesa", idempotency_key ?? id]
      );
      for (const l of priced) {
        await query(
          `INSERT INTO order_lines (order_id, item_id, title, qty, unit_price_kes, line_total_kes)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [id, l.item_id, l.title, l.qty, l.unit, l.qty * l.unit]
        );
      }
      await appendNclEvent({
        actor_type: "user",
        actor_id: req.auth.sub,
        event_type: "order.placed",
        entity_type: "order",
        entity_id: id,
        idempotency_key: idempotency_key ?? id,
        new_state: { merchant_id, total_kes: total, ...(promo ? { promo_code: promo.code, discount_kes: discount } : {}) },
        source: "nexg-api",
      });
      if (promo) {
        try {
          await query(`UPDATE promos SET used_count = used_count + 1 WHERE id = $1`, [promo.id]);
          await query(
            `INSERT INTO coupons (id, promo_id, code, account_id, status) VALUES ($1,$2,$3,$4::uuid,'redeemed') ON CONFLICT (promo_id, account_id) DO NOTHING`,
            [`${promo.id}_${id}`, promo.id, promo.code, req.auth.account_id]
          );
          await appendNclEvent({
            actor_type: "user", actor_id: req.auth.sub, event_type: "promo.redeemed",
            entity_type: "promo", entity_id: promo.id, idempotency_key: `${promo.id}:${id}`,
            new_state: { merchant_id, order_id: id, code: promo.code, discount_kes: discount }, source: "nexg-api",
          });
        } catch { /* redemption bookkeeping must not fail the order */ }
      }
      void indexDocument(
        "order",
        id,
        `order ${id} merchant ${merchant_id} items ${priced.map((l) => l.title).join(", ")} total ${total}`
      );
      res.status(201).json({ data: { id, status: "PLACED", subtotal_kes: subtotal, fees_kes: fees, discount_kes: discount, total_kes: total } });
    } catch (err: any) {
      if (err?.code === "23505") return res.status(409).json({ error: "idempotent_replay" });
      throw err;
    }
  }
);

// Reads (M0): staff see their merchant's orders; consumers see their own; admin sees all.
// R-01: riders see only orders assigned via delivery_tasks.rider_account_id
// (OFFERED pool stays visible via GET /rider/jobs, not here).
orders.get(
  "/",
  requireRoles(["consumer", "merchant_owner", "merchant_staff", "rider", "host_owner", "admin"]),
  requireMerchantScope((req) => (req.query.merchant as string) ?? null),
  async (req: any, res) => {
    const { merchant, status, mine, since, limit, offset } = req.query as any;
    const roles: string[] = req.auth.roles ?? [];
    const lim = Math.min(Number(limit ?? 100), 500);
    const off = Math.max(Number(offset ?? 0), 0);
    // R-01 assignment-scoped rider reads (no merchant anchor, no leak).
    if (roles.includes("rider") && !roles.includes("admin")) {
      const rows = await query(
        `SELECT o.* FROM orders o
         WHERE o.id IN (SELECT order_id FROM delivery_tasks WHERE rider_account_id = $1::uuid)
          AND ($2::text IS NULL OR o.merchant_id = $2)
          AND ($3::text IS NULL OR o.status = $3)
          AND ($4::timestamptz IS NULL OR o.created_at > $4)
        ORDER BY o.created_at DESC LIMIT $5 OFFSET $6`,
        [req.auth.account_id, merchant ?? null, status ?? null, since ?? null, lim, off]
      );
      res.json({ data: rows, total: rows.length, limit: lim, offset: off });
      return;
    }
    const scopedMerchant =
      roles.includes("admin") ? merchant ?? null : req.auth.merchant_id ?? merchant ?? null;
    const rows = await query(
      `SELECT * FROM orders
       WHERE ($1::text IS NULL OR merchant_id = $1)
         AND ($2::text IS NULL OR status = $2)
         AND ($3::text IS NULL OR account_id = $3::uuid)
         AND ($4::timestamptz IS NULL OR created_at > $4)
       ORDER BY created_at DESC LIMIT $5 OFFSET $6`,
      [scopedMerchant, status ?? null, mine === "1" ? req.auth.account_id : null, since ?? null, lim, off]
    );
    res.json({ data: rows, total: rows.length, limit: lim, offset: off });
  }
);

orders.get(
  "/:id",
  requireRoles(["consumer", "merchant_owner", "merchant_staff", "rider", "host_owner", "admin"]),
  async (req: any, res) => {    const rows = await query(`SELECT * FROM orders WHERE id = $1`, [req.params.id]);
    const order: any = rows[0];
    if (!order) return res.status(404).json({ error: "not_found" });
    const roles: string[] = req.auth.roles ?? [];
    const staffScoped =
      roles.some((r) => ["merchant_owner", "merchant_staff", "rider", "host_owner", "host_staff"].includes(r)) &&
      !roles.includes("admin");
    // R-01: rider detail reads require an assigned or OFFERED task for the order.
    if (roles.includes("rider") && !roles.includes("admin")) {
      const link = await query(
        `SELECT 1 FROM delivery_tasks WHERE order_id = $1 AND (rider_account_id = $2::uuid OR status = 'OFFERED') LIMIT 1`,
        [order.id, req.auth.account_id]
      );
      if (!link[0]) return res.status(403).json({ error: "not_your_order" });
    } else if (staffScoped && req.auth.merchant_id && order.merchant_id !== req.auth.merchant_id)
      return res.status(403).json({ error: "cross_merchant_forbidden" });
    if (roles.length === 1 && roles[0] === "consumer" && order.account_id !== req.auth.account_id)
      return res.status(403).json({ error: "forbidden" });
    const lines = await query(`SELECT * FROM order_lines WHERE order_id = $1`, [req.params.id]);
    res.json({ data: { ...order, lines } });
  }
);

// Status transitions (M1): guarded state machine, NCL per transition, idempotent replay.
// accept→CONFIRMED, reject→CANCELLED (reason required), preparing→PREPARING,
// ready→READY, handoff→PICKED, complete→DELIVERED, cancel→CANCELLED, refund→CANCELLED+reversal.
// CB-01: consumer-cancel → CANCELLED (consumer own order, PLACED/CONFIRMED only).
const ORDER_TRANSITIONS: Record<string, { from: string[]; to: string; event: string }> = {
  accept: { from: ["PLACED"], to: "CONFIRMED", event: "order.accepted" },
  reject: { from: ["PLACED"], to: "CANCELLED", event: "order.rejected" },
  preparing: { from: ["CONFIRMED"], to: "PREPARING", event: "order.preparing" },
  ready: { from: ["PREPARING"], to: "READY", event: "order.ready" },
  handoff: { from: ["READY"], to: "PICKED", event: "order.handed_off" },
  complete: { from: ["PICKED", "READY"], to: "DELIVERED", event: "order.delivered" },
  cancel: { from: ["PLACED", "CONFIRMED", "PREPARING"], to: "CANCELLED", event: "order.cancelled" },
  refund: { from: ["DELIVERED", "CANCELLED"], to: "CANCELLED", event: "order.refunded" },
  "consumer-cancel": { from: ["PLACED", "CONFIRMED"], to: "CANCELLED", event: "order.cancelled" },
};

orders.patch(
  "/:id",
  requireRoles(["consumer", "merchant_owner", "merchant_staff", "admin"]),
  requireMerchantScope(() => null), // staff must carry a merchant scope; target checked below (consumers bypass)
  async (req: any, res) => {
    const { action, reason } = req.body ?? {};
    const t = ORDER_TRANSITIONS[action];
    if (!t) return res.status(422).json({ error: "unknown_action", allowed: Object.keys(ORDER_TRANSITIONS) });
    if ((action === "reject" || action === "cancel") && !reason)
      return res.status(422).json({ error: "reason required" });
    const rows = await query(`SELECT * FROM orders WHERE id = $1`, [req.params.id]);
    const order: any = rows[0];
    if (!order) return res.status(404).json({ error: "not_found" });
    const roles: string[] = req.auth.roles ?? [];
    const isConsumerOnly = roles.length === 1 && roles[0] === "consumer";
    if (isConsumerOnly) {
      // CB-01: consumers may only consumer-cancel own orders.
      if (action !== "consumer-cancel") return res.status(403).json({ error: "consumers may only consumer-cancel own orders" });
      if (order.account_id !== req.auth.account_id) return res.status(403).json({ error: "forbidden" });
    } else {
      if (action === "consumer-cancel") {
        // Staff/admin path for consumer-cancel: must own merchant or be admin, order must be own-account? allow staff to cancel on behalf.
        if (!roles.includes("admin") && req.auth.merchant_id !== order.merchant_id)
          return res.status(403).json({ error: "cross_merchant_forbidden" });
      } else {
        if (!roles.includes("admin") && req.auth.merchant_id !== order.merchant_id)
          return res.status(403).json({ error: "cross_merchant_forbidden" });
      }
    }
    if (!t.from.includes(order.status)) {
      // Idempotent replay: same action already applied → return current state.
      const prior = await query(
        `SELECT new_state FROM ncl_events WHERE idempotency_key = $1`,
        [`${order.id}:${action}`]
      );
      if (prior[0] && (prior[0] as any).new_state?.status === order.status)
        return res.json({ data: { ...order, replayed: true } });
      return res.status(422).json({ error: "illegal_transition", from: order.status, action });
    }
    await query(`UPDATE orders SET status = $1 WHERE id = $2`, [t.to, order.id]);
    await appendNclEvent({
      actor_type: "user",
      actor_id: req.auth.sub,
      event_type: t.event,
      entity_type: "order",
      entity_id: order.id,
      idempotency_key: `${order.id}:${action}`,
      prev_state: { status: order.status },
      new_state: { status: t.to, merchant_id: order.merchant_id, ...(reason ? { reason } : {}) },
      source: "nexg-api",
    });
    if (action === "handoff") {
      // Fulfilment starts here: offer the delivery to riders.
      await createTaskForOrder(order.id, order.merchant_id);
    }
    if (["cancel", "refund", "reject", "consumer-cancel"].includes(action)) {
      // R gap (c): merchant-cancel propagation — cancel non-terminal tasks for this order.
      const tasks = await query(
        `SELECT id, status FROM delivery_tasks WHERE order_id = $1 AND status NOT IN ('DELIVERED','FAILED','CANCELLED')`,
        [order.id]
      );
      for (const task of tasks as any[]) {
        await query(`UPDATE delivery_tasks SET status = 'CANCELLED', updated_at = now() WHERE id = $1`, [task.id]);
        await appendNclEvent({
          actor_type: "system", actor_id: "dispatch", event_type: "delivery.cancelled",
          entity_type: "delivery", entity_id: task.id, idempotency_key: `${task.id}:cancel:order-${action}`,
          prev_state: { status: task.status },
          new_state: { status: "CANCELLED", order_id: order.id, merchant_id: order.merchant_id, reason: "order cancelled" },
          source: "nexg-api",
        });
      }
    }
    const updated = await query(`SELECT * FROM orders WHERE id = $1`, [order.id]);
    res.json({ data: updated[0] });
  }
);

// CB-07: scoped order-events read (consumer-own / staff-scoped alternative to admin ledger).
orders.get(
  "/:id/events",
  requireRoles(["consumer", "merchant_owner", "merchant_staff", "rider", "host_owner", "host_staff", "admin"]),
  async (req: any, res) => {
    const order = (await query(`SELECT * FROM orders WHERE id = $1`, [req.params.id]))[0] as any;
    if (!order) return res.status(404).json({ error: "not_found" });
    const roles: string[] = req.auth.roles ?? [];
    if (!roles.includes("admin")) {
      if (req.auth.merchant_id) {
        if (order.merchant_id !== req.auth.merchant_id)
          return res.status(403).json({ error: "cross_merchant_forbidden" });
      } else if (order.account_id !== req.auth.account_id) {
        return res.status(403).json({ error: "forbidden" });
      }
    }
    const { limit } = req.query as any;
    const rows = await query(
      `SELECT seq, event_type, entity_type, entity_id, prev_state, new_state, created_at
       FROM ncl_events WHERE entity_type = 'order' AND entity_id = $1
       ORDER BY seq ASC LIMIT $2`,
      [order.id, Math.min(Number(limit ?? 100), 500)]
    );
    res.json({ data: rows });
  }
);

bookings.post(
  "/",
  requireRoles(["consumer", "host_owner", "host_staff", "admin"]),
  async (req: any, res) => {
    const { merchant_id, item_id, scheduled_for, guests, idempotency_key, unit_id } = req.body ?? {};
    // CB-05/H-02 validation (backward-compat: existing tests omit item/date — default sensibly, validate when provided).
    if (!merchant_id) return res.status(422).json({ error: "merchant_id required" });
    const m = await query(`SELECT id FROM merchants WHERE id = $1`, [merchant_id]);
    if (!m[0]) return res.status(422).json({ error: "unknown merchant_id" });
    // H-05: optional stay-unit link — unit must exist on the same property.
    if (unit_id) {
      const u = await query(`SELECT id, property_id FROM units WHERE id = $1`, [unit_id]);
      if (!u[0]) return res.status(422).json({ error: "unknown unit_id" });
      if ((u[0] as any).property_id !== merchant_id)
        return res.status(422).json({ error: "unit_wrong_property" });
    }
    if (item_id) {
      const it = await query(`SELECT id, merchant_id FROM catalog_items WHERE id = $1`, [item_id]);
      if (!it[0]) return res.status(422).json({ error: `unknown item ${item_id}` });
    }
    const g = guests === undefined ? 1 : Number(guests);
    if (!Number.isInteger(g) || g < 1 || g > 50) return res.status(422).json({ error: "guests must be 1..50" });
    let sched: string | null = scheduled_for ?? null;
    if (sched) {
      const d = new Date(sched);
      if (isNaN(d.getTime())) return res.status(422).json({ error: "invalid scheduled_for" });
      if (d.getTime() < Date.now() - 60_000) return res.status(422).json({ error: "scheduled_for in past" });
      sched = d.toISOString();
    } else {
      sched = new Date(Date.now() + 864e5).toISOString(); // default tomorrow for legacy callers
    }
    // Overlap guard: same account + same merchant + same item + same hour → 409.
    // Only when item_id is known (room/service). Generic bookings without item may coexist
    // (existing M3 tests create several per user+merchant in the same hour).
    if (item_id) {
      const overlap = await query(
        `SELECT id FROM bookings WHERE account_id = $1::uuid AND merchant_id = $2
         AND item_id = $3 AND status IN ('CONFIRMED','CHECKED_IN')
         AND date_trunc('hour', scheduled_for) = date_trunc('hour', $4::timestamptz) LIMIT 1`,
        [req.auth.account_id, merchant_id, item_id, sched]
      );
      if (overlap[0]) return res.status(409).json({ error: "double_book", hint: "modify existing booking instead" });
    }
    const id = newId("bkg");
    // Real totals: item price * guests when item known, else 0 (pay at property).
    let total = 0;
    if (item_id) {
      const it = await query(`SELECT price_kes FROM catalog_items WHERE id = $1`, [item_id]);
      total = Number((it[0] as any)?.price_kes ?? 0) * g;
    }
    try {
      await query(
        `INSERT INTO bookings (id, account_id, merchant_id, item_id, status, scheduled_for, guests, total_kes, idempotency_key, unit_id)
         VALUES ($1,$2,$3,$4,'CONFIRMED',$5,$6,$7,$8,$9)`,
        [id, req.auth.account_id, merchant_id, item_id ?? null, sched, g, total, idempotency_key ?? id, unit_id ?? null]
      );
    } catch (err: any) {
      if (err?.code === "23505") return res.status(409).json({ error: "idempotent_replay" });
      throw err;
    }
    await appendNclEvent({
      actor_type: "user",
      actor_id: req.auth.sub,
      event_type: "booking.confirmed",
      entity_type: "booking",
      entity_id: id,
      idempotency_key: idempotency_key ?? id,
      new_state: { merchant_id, item_id: item_id ?? null, scheduled_for: sched, guests: g, total_kes: total, unit_id: unit_id ?? null },
      source: "nexg-api",
    });
    void indexDocument("booking", id, `booking ${id} merchant ${merchant_id} item ${item_id}`);
    res.status(201).json({ data: { id, status: "CONFIRMED", scheduled_for: sched, guests: g, total_kes: total } });
  }
);

// Reads (M0): calendar + detail for host staff (scoped), consumers (own), admin (all).
bookings.get(
  "/",
  requireRoles(["consumer", "host_owner", "host_staff", "merchant_owner", "merchant_staff", "admin"]),
  requireMerchantScope((req) => (req.query.merchant as string) ?? null),
  async (req: any, res) => {
    const { merchant, from, to, mine, since, status, limit, offset } = req.query as any;
    const roles: string[] = req.auth.roles ?? [];
    const scopedMerchant =
      roles.includes("admin") ? merchant ?? null : req.auth.merchant_id ?? merchant ?? null;
    const lim = Math.min(Number(limit ?? 500), 500);
    const off = Math.max(Number(offset ?? 0), 0);
    const rows = await query(
      `SELECT * FROM bookings
       WHERE ($1::text IS NULL OR merchant_id = $1)
         AND ($2::timestamptz IS NULL OR scheduled_for >= $2)
         AND ($3::timestamptz IS NULL OR scheduled_for < $3)
         AND ($4::text IS NULL OR account_id = $4::uuid)
         AND ($5::timestamptz IS NULL OR created_at > $5)
         AND ($6::text IS NULL OR status = $6)
       ORDER BY created_at DESC LIMIT $7 OFFSET $8`,
      [scopedMerchant, from ?? null, to ?? null, mine === "1" ? req.auth.account_id : null, since ?? null, status ?? null, lim, off]
    );
    res.json({ data: rows, total: rows.length, limit: lim, offset: off });
  }
);

bookings.get(
  "/:id",
  requireRoles(["consumer", "host_owner", "host_staff", "merchant_owner", "merchant_staff", "admin"]),
  async (req: any, res) => {
    const rows = await query(`SELECT * FROM bookings WHERE id = $1`, [req.params.id]);
    const booking: any = rows[0];
    if (!booking) return res.status(404).json({ error: "not_found" });
    const roles: string[] = req.auth.roles ?? [];
    if (!roles.includes("admin")) {
      if (req.auth.merchant_id) {
        if (booking.merchant_id !== req.auth.merchant_id)
          return res.status(403).json({ error: "cross_merchant_forbidden" });
      } else if (booking.account_id !== req.auth.account_id) {
        return res.status(403).json({ error: "forbidden" });
      }
    }
    res.json({ data: booking });
  }
);

// Stay lifecycle transitions (M3): guarded, NCL each, idempotent replay.
const BOOKING_TRANSITIONS: Record<string, { from: string[]; to: string; event: string }> = {
  modify: { from: ["CONFIRMED"], to: "CONFIRMED", event: "booking.modified" },
  checkin: { from: ["CONFIRMED"], to: "CHECKED_IN", event: "stay.checked_in" },
  checkout: { from: ["CHECKED_IN"], to: "COMPLETED", event: "stay.checked_out" },
  cancel: { from: ["CONFIRMED"], to: "CANCELLED", event: "booking.cancelled" },
  no_show: { from: ["CONFIRMED"], to: "NO_SHOW", event: "booking.no_show" },
};

bookings.patch(
  "/:id",
  requireRoles(["consumer", "host_owner", "host_staff", "admin"]),
  async (req: any, res) => {
    const { action, scheduled_for, guests, reason, unit_id } = req.body ?? {};
    const t = BOOKING_TRANSITIONS[action];
    if (!t) return res.status(422).json({ error: "unknown_action", allowed: Object.keys(BOOKING_TRANSITIONS) });
    const rows = await query(`SELECT * FROM bookings WHERE id = $1`, [req.params.id]);
    const booking: any = rows[0];
    if (!booking) return res.status(404).json({ error: "not_found" });
    const roles: string[] = req.auth.roles ?? [];
    const isStaff = roles.some((r) => ["host_owner", "host_staff", "admin"].includes(r));
    if (!roles.includes("admin")) {
      if (req.auth.merchant_id) {
        if (booking.merchant_id !== req.auth.merchant_id)
          return res.status(403).json({ error: "cross_merchant_forbidden" });
      } else if (booking.account_id !== req.auth.account_id) {
        return res.status(403).json({ error: "forbidden" });
      } else if (action !== "cancel" && action !== "modify") {
        return res.status(403).json({ error: "consumers may only cancel|modify own bookings" });
      }
    }
    if (!isStaff && !["cancel", "modify"].includes(action))
      return res.status(403).json({ error: "forbidden" });
    if ((action === "cancel" || action === "no_show") && !reason && isStaff && action === "cancel")
      return res.status(422).json({ error: "reason required" });
    if (!t.from.includes(booking.status)) {
      const prior = await query(`SELECT new_state FROM ncl_events WHERE idempotency_key = $1`, [
        `${booking.id}:${action}`,
      ]);
      if (prior[0] && (prior[0] as any).new_state?.status === booking.status)
        return res.json({ data: { ...booking, replayed: true } });
      return res.status(422).json({ error: "illegal_transition", from: booking.status, action });
    }
    if (action === "modify") {
      // H-05: staff may pin a unit to the stay (validated: exists + same property).
      let unit = booking.unit_id ?? null;
      if (unit_id !== undefined) {
        if (!isStaff) return res.status(403).json({ error: "forbidden" });
        const u = await query(`SELECT id, property_id FROM units WHERE id = $1`, [unit_id]);
        if (!u[0]) return res.status(422).json({ error: "unknown unit_id" });
        if ((u[0] as any).property_id !== booking.merchant_id)
          return res.status(422).json({ error: "unit_wrong_property" });
        unit = unit_id;
      }
      await query(`UPDATE bookings SET scheduled_for = COALESCE($1, scheduled_for), guests = COALESCE($2, guests), unit_id = $3 WHERE id = $4`, [
        scheduled_for ?? null,
        guests ?? null,
        unit,
        booking.id,
      ]);
    } else {
      await query(`UPDATE bookings SET status = $1 WHERE id = $2`, [t.to, booking.id]);
    }
    await appendNclEvent({
      actor_type: "user",
      actor_id: req.auth.sub,
      event_type: t.event,
      entity_type: "booking",
      entity_id: booking.id,
      idempotency_key: `${booking.id}:${action}`,
      prev_state: { status: booking.status, scheduled_for: booking.scheduled_for },
      new_state: {
        status: action === "modify" ? booking.status : t.to,
        merchant_id: booking.merchant_id,
        ...(scheduled_for ? { scheduled_for } : {}),
        ...(guests ? { guests } : {}),
        ...(reason ? { reason } : {}),
      },
      source: "nexg-api",
    });
    const updated = await query(`SELECT * FROM bookings WHERE id = $1`, [booking.id]);
    res.json({ data: updated[0] });
  }
);

// Admin-ready ledger reads (M0): replay any entity's story. Admin-only.
ledger.get(
  "/events",
  requireRoles(["admin"]),
  async (req, res) => {
    const { entity_type, entity_id, event_type, limit } = req.query as any;
    const rows = await query(
      `SELECT seq, event_id, tenant, actor_type, actor_id, event_type, entity_type, entity_id,
              correlation_id, causation_id, prev_state, new_state, hash, created_at
       FROM ncl_events
       WHERE ($1::text IS NULL OR entity_type = $1)
         AND ($2::text IS NULL OR entity_id = $2)
         AND ($3::text IS NULL OR event_type = $3)
       ORDER BY seq DESC LIMIT $4`,
      [entity_type ?? null, entity_id ?? null, event_type ?? null, Math.min(Number(limit ?? 100), 500)]
    );
    res.json({ data: rows });
  }
);

// Service / housekeeping / maintenance requests (M3).
// Consumers raise requests against their own bookings; staff manage the board.
requests.post(
  "/",
  requireRoles(["consumer", "host_owner", "host_staff", "merchant_owner", "merchant_staff", "admin"]),
  async (req: any, res) => {
    const { merchant_id, booking_id, kind = "service", title, detail, origin } = req.body ?? {};
    if (!merchant_id || !title) return res.status(422).json({ error: "merchant_id + title required" });
    if (!["service", "housekeeping", "maintenance"].includes(kind))
      return res.status(422).json({ error: "unknown kind" });
    // H-11: additive origin passthrough (e.g. origin:'qr' from guest QR scan).
    if (origin !== undefined && (typeof origin !== "string" || origin.length > 32))
      return res.status(422).json({ error: "invalid origin" });
    const roles: string[] = req.auth.roles ?? [];
    if (!roles.includes("admin") && req.auth.merchant_id && req.auth.merchant_id !== merchant_id)
      return res.status(403).json({ error: "cross_merchant_forbidden" });
    if (booking_id) {
      const b = await query(`SELECT account_id FROM bookings WHERE id = $1`, [booking_id]);
      if (!b[0]) return res.status(422).json({ error: "unknown booking" });
      const own = (b[0] as any).account_id === req.auth.account_id;
      if (!own && !req.auth.merchant_id && !roles.includes("admin"))
        return res.status(403).json({ error: "forbidden" });
    }
    const id = newId("evt").replace("evt_", "req_");
    const rows = await query(
      `INSERT INTO service_requests (id, merchant_id, booking_id, account_id, kind, title, detail, status, origin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'REQUESTED',$8) RETURNING *`,
      [id, merchant_id, booking_id ?? null, req.auth.account_id, kind, title, detail ?? "", origin ?? null]
    );
    await appendNclEvent({
      actor_type: "user",
      actor_id: req.auth.sub,
      event_type: "request.created",
      entity_type: "request",
      entity_id: id,
      idempotency_key: id,
      new_state: { merchant_id, booking_id: booking_id ?? null, kind, title, origin: origin ?? null },
      source: "nexg-api",
    });
    res.status(201).json({ data: rows[0] });
  }
);

requests.get(
  "/",
  requireRoles(["consumer", "host_owner", "host_staff", "merchant_owner", "merchant_staff", "rider", "admin"]),
  requireMerchantScope((req) => (req.query.merchant as string) ?? null),
  async (req: any, res) => {
    const { merchant, status, kind, booking, mine, assignee, since, limit, offset, origin } = req.query as any;
    const roles: string[] = req.auth.roles ?? [];
    const lim = Math.min(Number(limit ?? 200), 500);
    const off = Math.max(Number(offset ?? 0), 0);
    // R-01: rider-reachable requests scoped to merchants of assigned tasks.
    if (roles.includes("rider") && !roles.includes("admin")) {
      const rows = await query(
        `SELECT * FROM service_requests
         WHERE merchant_id IN (SELECT merchant_id FROM delivery_tasks WHERE rider_account_id = $1::uuid)
          AND ($2::text IS NULL OR merchant_id = $2)
          AND ($3::text IS NULL OR status = $3)
          AND ($4::text IS NULL OR kind = $4)
          AND ($5::text IS NULL OR booking_id = $5)
          AND ($6::timestamptz IS NULL OR created_at > $6)
          AND ($7::text IS NULL OR origin = $7)
        ORDER BY created_at DESC LIMIT $8 OFFSET $9`,
        [req.auth.account_id, merchant ?? null, status ?? null, kind ?? null, booking ?? null, since ?? null, origin ?? null, lim, off]
      );
      res.json({ data: rows, total: rows.length, limit: lim, offset: off });
      return;
    }
    const scopedMerchant =
      roles.includes("admin") ? merchant ?? null : req.auth.merchant_id ?? merchant ?? null;
    const rows = await query(
      `SELECT * FROM service_requests
       WHERE ($1::text IS NULL OR merchant_id = $1)
         AND ($2::text IS NULL OR status = $2)
         AND ($3::text IS NULL OR kind = $3)
         AND ($4::text IS NULL OR booking_id = $4)
         AND ($5::text IS NULL OR account_id = $5::uuid)
         AND ($6::text IS NULL OR assignee = $6)
         AND ($7::timestamptz IS NULL OR created_at > $7)
         AND ($8::text IS NULL OR origin = $8)
       ORDER BY created_at DESC LIMIT $9 OFFSET $10`,
      [scopedMerchant, status ?? null, kind ?? null, booking ?? null,
       mine === "1" ? req.auth.account_id : null, assignee ?? null, since ?? null, origin ?? null, lim, off]
    );
    res.json({ data: rows, total: rows.length, limit: lim, offset: off });
  }
);

const REQUEST_TRANSITIONS: Record<string, { from: string[]; to: string; event: string }> = {
  assign: { from: ["REQUESTED"], to: "ASSIGNED", event: "request.assigned" },
  start: { from: ["ASSIGNED", "REQUESTED"], to: "IN_PROGRESS", event: "request.started" },
  inspect: { from: ["IN_PROGRESS"], to: "INSPECTED", event: "request.inspected" },
  verify: { from: ["IN_PROGRESS", "INSPECTED"], to: "COMPLETED", event: "request.verified" },
  complete: { from: ["IN_PROGRESS", "ASSIGNED", "INSPECTED"], to: "COMPLETED", event: "request.completed" },
  cancel: { from: ["REQUESTED", "ASSIGNED"], to: "CANCELLED", event: "request.cancelled" },
};

requests.patch(
  "/:id",
  requireRoles(["consumer", "host_owner", "host_staff", "merchant_owner", "merchant_staff", "admin"]),
  async (req: any, res) => {
    const { action, assignee } = req.body ?? {};
    const t = REQUEST_TRANSITIONS[action];
    if (!t) return res.status(422).json({ error: "unknown_action", allowed: Object.keys(REQUEST_TRANSITIONS) });
    const rows = await query(`SELECT * FROM service_requests WHERE id = $1`, [req.params.id]);
    const task: any = rows[0];
    if (!task) return res.status(404).json({ error: "not_found" });
    const roles: string[] = req.auth.roles ?? [];
    const isConsumerOnly = roles.length === 1 && roles[0] === "consumer";
    if (isConsumerOnly) {
      // H-04: consumer may only cancel own request.
      if (action !== "cancel") return res.status(403).json({ error: "consumers may only cancel own requests" });
      if (task.account_id !== req.auth.account_id) return res.status(403).json({ error: "forbidden" });
    } else {
      if (!roles.includes("admin") && req.auth.merchant_id !== task.merchant_id)
        return res.status(403).json({ error: "cross_merchant_forbidden" });
    }
    if (!t.from.includes(task.status)) {
      const prior = await query(`SELECT new_state FROM ncl_events WHERE idempotency_key = $1`, [
        `${task.id}:${action}`,
      ]);
      if (prior[0] && (prior[0] as any).new_state?.status === task.status)
        return res.json({ data: { ...task, replayed: true } });
      return res.status(422).json({ error: "illegal_transition", from: task.status, action });
    }
    await query(`UPDATE service_requests SET status = $1, assignee = COALESCE($2, assignee), updated_at = now() WHERE id = $3`, [
      t.to,
      assignee ?? null,
      task.id,
    ]);
    await appendNclEvent({
      actor_type: "user",
      actor_id: req.auth.sub,
      event_type: t.event,
      entity_type: "request",
      entity_id: task.id,
      idempotency_key: `${task.id}:${action}`,
      prev_state: { status: task.status },
      new_state: { status: t.to, merchant_id: task.merchant_id, ...(assignee ? { assignee } : {}) },
      source: "nexg-api",
    });
    const updated = await query(`SELECT * FROM service_requests WHERE id = $1`, [task.id]);
    res.json({ data: updated[0] });
  }
);

media.get("/", async (req, res) => {
  const { entity_type, entity_id } = req.query as any;
  const rows = await query(
    `SELECT * FROM media_assets WHERE ($1::text IS NULL OR entity_type = $1)
     AND ($2::text IS NULL OR entity_id = $2) ORDER BY sort LIMIT 100`,
    [entity_type ?? null, entity_id ?? null]
  );
  res.json({ data: rows });
});

// CB-04: persist media record (presigned PUT happens client-side, then POST here).
media.post(
  "/",
  requireRoles(["consumer", "merchant_owner", "merchant_staff", "rider", "host_owner", "host_staff", "admin"]),
  async (req: any, res) => {
    const { entity_type, entity_id, url, key, kind = "image", variant = "medium", sort = 0 } = req.body ?? {};
    if (!entity_type || !entity_id || (!url && !key))
      return res.status(422).json({ error: "entity_type + entity_id + url|key required" });
    // M-10 hardening: staff may only attach media to their own merchant scope.
    if (!req.auth.roles.includes("admin")) {
      if (entity_type === "item") {
        const item = (await query(`SELECT merchant_id FROM catalog_items WHERE id = $1`, [entity_id]))[0] as any;
        if (!item) return res.status(422).json({ error: "unknown item" });
        if (!assertOwnMerchant(req, item.merchant_id, res)) return;
      } else if (entity_type === "merchant") {
        if (!assertOwnMerchant(req, entity_id, res)) return;
      }
    }
    const finalUrl = url ?? `http://localhost:9000/nexg-media/${key}`;
    const rows = await query(
      `INSERT INTO media_assets (entity_type, entity_id, kind, url, variant, sort)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [entity_type, entity_id, kind, finalUrl, variant, Number(sort) || 0]
    );
    await appendNclEvent({
      actor_type: "user", actor_id: (req as any).auth.sub, event_type: "media.attached",
      entity_type, entity_id, idempotency_key: `${entity_type}:${entity_id}:${Date.now()}`,
      new_state: { url: finalUrl, kind }, source: "nexg-api",
    });
    res.status(201).json({ data: rows[0] });
  }
);

// M-13 promos engine: CRUD + coupons + apply-in-order-create.
promos.get(
  "/",
  requireRoles(["merchant_owner", "merchant_staff", "admin"]),
  requireMerchantScope((req) => (req.query.merchant as string) ?? null),
  async (req: any, res) => {
    const { merchant } = req.query as any;
    const scoped = req.auth.roles.includes("admin") ? merchant ?? null : req.auth.merchant_id ?? merchant ?? null;
    const rows = await query(
      `SELECT *, (SELECT count(*)::int FROM coupons WHERE promo_id = promos.id) AS redemptions
       FROM promos WHERE ($1::text IS NULL OR merchant_id = $1) ORDER BY created_at DESC LIMIT 200`,
      [scoped]
    );
    res.json({ data: rows, total: rows.length });
  }
);

promos.post(
  "/",
  requireRoles(["merchant_owner", "merchant_staff", "admin"]),
  async (req: any, res) => {
    const { merchant_id, code, title = "", description = "", kind = "percent", value_kes = 0, min_order_kes = 0, max_uses = 0, starts_at, ends_at } = req.body ?? {};
    if (!merchant_id || !code) return res.status(422).json({ error: "merchant_id + code required" });
    if (!assertOwnMerchant(req, merchant_id, res)) return;
    if (!["percent", "fixed"].includes(kind)) return res.status(422).json({ error: "unknown kind" });
    const v = Math.round(Number(value_kes) || 0);
    if (kind === "percent" && (v < 1 || v > 90)) return res.status(422).json({ error: "percent 1..90 required" });
    if (v < 0) return res.status(422).json({ error: "value_kes >= 0 required" });
    const id = `${merchant_id}_p${Date.now().toString(36)}`;
    try {
      const rows = await query(
        `INSERT INTO promos (id, merchant_id, code, title, description, kind, value_kes, min_order_kes, max_uses, starts_at, ends_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [id, merchant_id, String(code).toUpperCase(), title, description, kind, v, Math.round(Number(min_order_kes) || 0), Math.round(Number(max_uses) || 0), starts_at ?? null, ends_at ?? null]
      );
      await appendNclEvent({
        actor_type: "user", actor_id: req.auth.sub, event_type: "promo.created",
        entity_type: "promo", entity_id: id, idempotency_key: id,
        new_state: { merchant_id, code: String(code).toUpperCase(), kind, value_kes: v }, source: "nexg-api",
      });
      res.status(201).json({ data: rows[0] });
    } catch (err: any) {
      if (err?.code === "23505") return res.status(409).json({ error: "code_taken" });
      throw err;
    }
  }
);

promos.patch(
  "/:id",
  requireRoles(["merchant_owner", "merchant_staff", "admin"]),
  async (req: any, res) => {
    const rows = await query(`SELECT * FROM promos WHERE id = $1`, [req.params.id]);
    const promo: any = rows[0];
    if (!promo) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, promo.merchant_id, res)) return;
    const patch: Record<string, unknown> = {};
    for (const f of ["title", "description", "is_active", "starts_at", "ends_at"] as const) {
      if (req.body?.[f] !== undefined) patch[f] = req.body[f];
    }
    for (const f of ["value_kes", "min_order_kes", "max_uses"] as const) {
      if (req.body?.[f] !== undefined) patch[f] = Math.round(Number(req.body[f]) || 0);
    }
    if (!Object.keys(patch).length) return res.status(422).json({ error: "nothing to update" });
    const sets = Object.keys(patch).map((k, i) => `${k} = $${i + 2}`).join(", ");
    await query(`UPDATE promos SET ${sets} WHERE id = $1`, [req.params.id, ...Object.values(patch)]);
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "promo.updated",
      entity_type: "promo", entity_id: promo.id, idempotency_key: `${promo.id}:${Date.now()}`,
      prev_state: { title: promo.title }, new_state: patch, source: "nexg-api",
    });
    const updated = await query(`SELECT * FROM promos WHERE id = $1`, [req.params.id]);
    res.json({ data: updated[0] });
  }
);

promos.post(
  "/:id/coupons",
  requireRoles(["merchant_owner", "merchant_staff", "admin"]),
  async (req: any, res) => {
    const rows = await query(`SELECT * FROM promos WHERE id = $1`, [req.params.id]);
    const promo: any = rows[0];
    if (!promo) return res.status(404).json({ error: "not_found" });
    if (!assertOwnMerchant(req, promo.merchant_id, res)) return;
    const id = `${promo.id}_c${Date.now().toString(36)}`;
    const crows = await query(
      `INSERT INTO coupons (id, promo_id, code, account_id, status) VALUES ($1,$2,$3,$4,'redeemed') RETURNING *`,
      [id, promo.id, promo.code, req.body?.account_id ?? null]
    );
    await appendNclEvent({
      actor_type: "user", actor_id: req.auth.sub, event_type: "promo.coupon_issued",
      entity_type: "promo", entity_id: promo.id, idempotency_key: id,
      new_state: { merchant_id: promo.merchant_id, code: promo.code }, source: "nexg-api",
    });
    res.status(201).json({ data: crows[0] });
  }
);

// M-11 customers: derived view from orders + bookings (no new table).
customers.get(
  "/",
  requireRoles(["merchant_owner", "merchant_staff", "admin"]),
  requireMerchantScope((req) => (req.query.merchant as string) ?? null),
  async (req: any, res) => {
    const { merchant } = req.query as any;
    const scoped = req.auth.roles.includes("admin") ? merchant ?? null : req.auth.merchant_id ?? merchant ?? null;
    if (!scoped) return res.status(422).json({ error: "merchant required" });
    const rows = await query(
      `SELECT o.account_id AS id, count(*)::int AS orders, sum(o.total_kes)::int AS total_kes,
              max(o.created_at) AS last_order_at,
              (SELECT count(*)::int FROM bookings b WHERE b.merchant_id = $1 AND b.account_id = o.account_id) AS bookings
       FROM orders o WHERE o.merchant_id = $1 AND o.account_id IS NOT NULL
       GROUP BY o.account_id ORDER BY total_kes DESC NULLS LAST LIMIT 200`,
      [scoped]
    );
    res.json({ data: rows, total: rows.length });
  }
);

// M-12 finance summary: readonly derived (no balance mutations — payouts/GL post-v1).
// H-08: host roles reuse the SAME endpoint (host-flavored readonly; no duplicate).
finance.get(
  "/summary",
  requireRoles(["merchant_owner", "merchant_staff", "host_owner", "host_staff", "admin"]),
  requireMerchantScope((req) => (req.query.merchant as string) ?? null),
  async (req: any, res) => {
    const { merchant } = req.query as any;
    const scoped = req.auth.roles.includes("admin") ? merchant ?? null : req.auth.merchant_id ?? merchant ?? null;
    if (!scoped) return res.status(422).json({ error: "merchant required" });
    const agg = (await query(
      `SELECT count(*)::int AS orders,
              coalesce(sum(total_kes) FILTER (WHERE status <> 'CANCELLED'),0)::int AS revenue_kes,
              coalesce(sum(fees_kes) FILTER (WHERE status <> 'CANCELLED'),0)::int AS fees_kes,
              coalesce(avg(total_kes) FILTER (WHERE status <> 'CANCELLED'),0)::int AS avg_order_kes,
              count(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled
       FROM orders WHERE merchant_id = $1`,
      [scoped]
    ))[0] as any;
    const byStatus = await query(
      `SELECT status, count(*)::int AS n, coalesce(sum(total_kes),0)::int AS total_kes
       FROM orders WHERE merchant_id = $1 GROUP BY status ORDER BY n DESC`,
      [scoped]
    );
    const promosRow = (await query(`SELECT count(*)::int AS n FROM promos WHERE merchant_id = $1`, [scoped]))[0] as any;
    res.json({ data: { merchant_id: scoped, ...agg, by_status: byStatus, promos: promosRow.n } });
  }
);

// M-14 staff list: scoped single-merchant accounts. H-07: host roles reuse the SAME
// endpoint (single owner across merchant/host — no duplicate staff endpoint).
staff.get(
  "/",
  requireRoles(["merchant_owner", "merchant_staff", "host_owner", "host_staff", "admin"]),
  requireMerchantScope((req) => (req.query.merchant as string) ?? null),
  async (req: any, res) => {
    const { merchant } = req.query as any;
    const scoped = req.auth.roles.includes("admin") ? merchant ?? null : req.auth.merchant_id ?? merchant ?? null;
    if (!scoped) return res.status(422).json({ error: "merchant required" });
    const rows = await query(
      `SELECT a.id, a.kind, a.merchant_id, a.created_at, p.phone, p.display_name
       FROM accounts a LEFT JOIN persons p ON p.id = a.person_id
       WHERE a.merchant_id = $1 ORDER BY a.created_at ASC LIMIT 200`,
      [scoped]
    );
    res.json({ data: rows, total: rows.length });
  }
);
