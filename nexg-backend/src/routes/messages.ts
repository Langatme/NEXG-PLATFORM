import { Router } from "express";
import { query } from "../db.js";
import { appendNclEvent } from "../ledger.js";
import { requireRoles } from "../auth.js";

// Single shared event-driven messaging for ALL apps (consumer/merchant/rider/host/admin/ops).
// One `messages` table; every send emits idempotent hash-chained NCL `message.sent`
// carrying routing keys, fanned out over the existing Postgres LISTEN/NOTIFY → SSE.
// Notifications, inbox, conversations, contact merchant/rider/host/support all read this.

export const messages = Router();
const ROLES = ["consumer", "merchant_owner", "merchant_staff", "rider", "host_owner", "host_staff", "admin"] as const;

function preview(body: string): string {
  return body.length > 200 ? body.slice(0, 200) : body;
}

async function deriveMerchant(entity_type?: string | null, entity_id?: string | null): Promise<string | null> {
  if (!entity_type || !entity_id) return null;
  try {
    if (entity_type === "merchant") return entity_id;
    if (entity_type === "order") {
      const r = await query(`SELECT merchant_id FROM orders WHERE id = $1`, [entity_id]);
      return (r[0] as any)?.merchant_id ?? null;
    }
    if (entity_type === "booking") {
      const r = await query(`SELECT merchant_id FROM bookings WHERE id = $1`, [entity_id]);
      return (r[0] as any)?.merchant_id ?? null;
    }
    if (entity_type === "delivery") {
      const r = await query(`SELECT merchant_id FROM delivery_tasks WHERE id = $1`, [entity_id]);
      return (r[0] as any)?.merchant_id ?? null;
    }
  } catch {
    // derivation is best-effort; explicit merchant_id wins
  }
  return null;
}

async function ownsEntity(account_id: string, entity_type?: string | null, entity_id?: string | null): Promise<boolean> {
  if (!entity_type || !entity_id) return false;
  if (entity_type === "order" || entity_type === "booking") {
    const t = entity_type === "order" ? "orders" : "bookings";
    const r = await query(`SELECT account_id FROM ${t} WHERE id = $1`, [entity_id]);
    return (r[0] as any)?.account_id === account_id;
  }
  return false;
}

async function senderInThread(account_id: string, thread_key: string): Promise<boolean> {
  const r = await query(`SELECT 1 FROM messages WHERE thread_key = $1 AND sender_account = $2::uuid LIMIT 1`, [
    thread_key,
    account_id,
  ]);
  return !!r[0];
}

messages.post(
  "/",
  requireRoles([...ROLES]),
  async (req: any, res) => {
    const { thread_key, entity_type, entity_id, merchant_id, recipient_role, body, idempotency_key } = req.body ?? {};
    if (!body || typeof body !== "string" || !body.trim() || body.length > 2000)
      return res.status(422).json({ error: "body required (1..2000 chars)" });
    const roles: string[] = req.auth.roles ?? [];
    const isAdmin = roles.includes("admin");
    const merchant = merchant_id ?? (await deriveMerchant(entity_type, entity_id));
    const key: string =
      thread_key ?? (entity_type && entity_id ? `${entity_type}:${entity_id}` : `support:${req.auth.account_id}`);
    const sender_role: string = roles.includes("consumer") && roles.length === 1 ? "consumer" : roles[0] ?? "consumer";

    if (!isAdmin) {
      if (req.auth.merchant_id) {
        // Staff: only threads of my merchant.
        if (merchant && merchant !== req.auth.merchant_id)
          return res.status(403).json({ error: "cross_merchant_forbidden" });
        if (!merchant) return res.status(422).json({ error: "merchant thread required (merchant_id or entity)" });
      } else if (roles.includes("rider")) {
        if (recipient_role && !["consumer", "merchant_staff", "support"].includes(recipient_role))
          return res.status(422).json({ error: "unknown recipient_role" });
        // Riders may write in threads of orders assigned to them (dispatch keeps them in the loop).
        if (entity_type === "order" && entity_id) {
          const a = await query(
            `SELECT 1 FROM delivery_tasks WHERE order_id = $1 AND rider_account_id = $2::uuid LIMIT 1`,
            [entity_id, req.auth.account_id]
          );
          if (!a[0] && recipient_role !== "support")
            return res.status(403).json({ error: "not_your_delivery" });
        }
      } else {
        // Consumer: own support thread, own entity, prior participation, or per-consumer merchant contact thread.
        const ownSupport = key === `support:${req.auth.account_id}`;
        const ownEntity = await ownsEntity(req.auth.account_id, entity_type, entity_id);
        const prior = await senderInThread(req.auth.account_id, key);
        const ownContact = merchant != null && key === `merchant:${merchant}:${req.auth.account_id}`;
        if (!ownSupport && !ownEntity && !prior && !ownContact)
          return res.status(403).json({ error: "not_your_thread" });
      }
    }

    const rows = await query(
      `INSERT INTO messages (thread_key, entity_type, entity_id, merchant_id, sender_account, sender_role, recipient_role, body)
       VALUES ($1,$2,$3,$4,$5::uuid,$6,$7,$8) RETURNING *`,
      [key, entity_type ?? null, entity_id ?? null, merchant, req.auth.account_id, sender_role, recipient_role ?? null, body.trim()]
    );
    const msg: any = rows[0];
    await appendNclEvent({
      actor_type: "user",
      actor_id: req.auth.sub,
      event_type: "message.sent",
      entity_type: "message",
      entity_id: msg.id,
      idempotency_key: idempotency_key ?? msg.id,
      new_state: {
        thread_key: key,
        merchant_id: merchant,
        entity_type: entity_type ?? null,
        entity_id: entity_id ?? null,
        recipient_role: recipient_role ?? null,
        sender_account: req.auth.account_id,
        preview: preview(body.trim()),
      },
      source: "nexg-api",
    });
    res.status(201).json({ data: msg });
  }
);

messages.get(
  "/",
  requireRoles([...ROLES]),
  async (req: any, res) => {
    const { thread_key, entity_type, entity_id, merchant, since, limit, offset } = req.query as any;
    const roles: string[] = req.auth.roles ?? [];
    const lim = Math.min(Number(limit ?? 100), 500);
    const off = Math.max(Number(offset ?? 0), 0);
    let rows: unknown[];
    if (roles.includes("admin")) {
      rows = await query(
        `SELECT * FROM messages m
         WHERE ($1::text IS NULL OR m.thread_key = $1)
           AND ($2::text IS NULL OR m.entity_type = $2)
           AND ($3::text IS NULL OR m.entity_id = $3)
           AND ($4::text IS NULL OR m.merchant_id = $4)
           AND ($5::timestamptz IS NULL OR m.created_at > $5)
         ORDER BY m.created_at ASC LIMIT $6 OFFSET $7`,
        [thread_key ?? null, entity_type ?? null, entity_id ?? null, merchant ?? null, since ?? null, lim, off]
      );
    } else if (req.auth.merchant_id) {
      const mid = req.auth.merchant_id as string;
      if (merchant && merchant !== mid) return res.status(403).json({ error: "cross_merchant_forbidden" });
      // Explicit 403 (not silent empty) when a named thread/entity belongs elsewhere.
      if (thread_key) {
        const t = await query(`SELECT merchant_id FROM messages WHERE thread_key = $1 LIMIT 1`, [thread_key]);
        if (t[0] && (t[0] as any).merchant_id && (t[0] as any).merchant_id !== mid)
          return res.status(403).json({ error: "cross_merchant_forbidden" });
      }
      if (!thread_key && entity_type && entity_id) {
        const dm = await deriveMerchant(entity_type, entity_id);
        if (dm && dm !== mid) return res.status(403).json({ error: "cross_merchant_forbidden" });
      }
      rows = await query(
        `SELECT * FROM messages m
         WHERE m.merchant_id = $1
           AND ($2::text IS NULL OR m.thread_key = $2)
           AND ($3::text IS NULL OR m.entity_type = $3)
           AND ($4::text IS NULL OR m.entity_id = $4)
           AND ($5::timestamptz IS NULL OR m.created_at > $5)
         ORDER BY m.created_at ASC LIMIT $6 OFFSET $7`,
        [mid, thread_key ?? null, entity_type ?? null, entity_id ?? null, since ?? null, lim, off]
      );
    } else if (roles.includes("rider")) {
      rows = await query(
        `SELECT * FROM messages m
         WHERE (m.sender_account = $1::uuid OR m.recipient_role = 'rider'
           OR m.thread_key IN (SELECT thread_key FROM messages WHERE sender_account = $1::uuid)
           OR (m.entity_type = 'order' AND m.entity_id IN
             (SELECT order_id FROM delivery_tasks WHERE rider_account_id = $1::uuid)))
           AND ($2::text IS NULL OR m.thread_key = $2)
           AND ($3::timestamptz IS NULL OR m.created_at > $3)
         ORDER BY m.created_at ASC LIMIT $4 OFFSET $5`,
        [req.auth.account_id, thread_key ?? null, since ?? null, lim, off]
      );
    } else {
      // Consumer: own support thread, own entities, merchant-contact threads, prior participation.
      const mine = await query<{ id: string }>(
        `SELECT id FROM orders WHERE account_id = $1 UNION SELECT id FROM bookings WHERE account_id = $1`,
        [req.auth.account_id]
      );
      const ids = (mine as any[]).map((r) => r.id);
      rows = await query(
        `SELECT * FROM messages m
         WHERE (m.thread_key = 'support:' || $1
           OR m.sender_account = $1::uuid
           OR (m.entity_id = ANY($2) AND m.entity_id IS NOT NULL)
           OR m.thread_key LIKE 'merchant:%:' || $1
           OR m.thread_key IN (SELECT thread_key FROM messages WHERE sender_account = $1::uuid))
           AND ($3::text IS NULL OR m.thread_key = $3)
           AND ($4::text IS NULL OR m.entity_type = $4)
           AND ($5::text IS NULL OR m.entity_id = $5)
           AND ($6::timestamptz IS NULL OR m.created_at > $6)
         ORDER BY m.created_at ASC LIMIT $7 OFFSET $8`,
        [req.auth.account_id, ids.length ? ids : null, thread_key ?? null, entity_type ?? null, entity_id ?? null, since ?? null, lim, off]
      );
    }
    res.json({ data: rows });
  }
);

messages.get(
  "/threads",
  requireRoles([...ROLES]),
  async (req: any, res) => {
    const { limit } = req.query as any;
    const lim = Math.min(Number(limit ?? 50), 200);
    const roles: string[] = req.auth.roles ?? [];
    let latest: any[];
    if (roles.includes("admin")) {
      latest = await query(
        `SELECT DISTINCT ON (thread_key) * FROM messages ORDER BY thread_key, created_at DESC LIMIT $1`,
        [lim]
      );
    } else if (req.auth.merchant_id) {
      latest = await query(
        `SELECT DISTINCT ON (thread_key) * FROM messages WHERE merchant_id = $1 ORDER BY thread_key, created_at DESC LIMIT $2`,
        [req.auth.merchant_id, lim]
      );
    } else if (roles.includes("rider")) {
      latest = await query(
        `SELECT DISTINCT ON (thread_key) * FROM messages
         WHERE sender_account = $1::uuid OR recipient_role = 'rider'
            OR (entity_type = 'order' AND entity_id IN
              (SELECT order_id FROM delivery_tasks WHERE rider_account_id = $1::uuid))
         ORDER BY thread_key, created_at DESC LIMIT $2`,
        [req.auth.account_id, lim]
      );
    } else {
      const mine = await query<{ id: string }>(
        `SELECT id FROM orders WHERE account_id = $1 UNION SELECT id FROM bookings WHERE account_id = $1`,
        [req.auth.account_id]
      );
      const ids = (mine as any[]).map((r) => r.id);
      latest = await query(
        `SELECT DISTINCT ON (thread_key) * FROM messages
         WHERE thread_key = 'support:' || $1
            OR sender_account = $1::uuid
            OR (entity_id = ANY($2) AND entity_id IS NOT NULL)
            OR thread_key LIKE 'merchant:%:' || $1
         ORDER BY thread_key, created_at DESC LIMIT $3`,
        [req.auth.account_id, ids.length ? ids : null, lim]
      );
    }
    latest.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const counts = await Promise.all(
      latest.map(async (t: any) => {
        const c = await query(`SELECT count(*)::int AS n FROM messages WHERE thread_key = $1`, [t.thread_key]);
        return { thread_key: t.thread_key, count: (c[0] as any).n, latest: t };
      })
    );
    res.json({ data: counts });
  }
);
