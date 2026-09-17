import { Router } from "express";
import { query } from "../db.js";
import { composeHome } from "../composer.js";
import { embed, toVectorLiteral } from "../embeddings.js";
import { requireRoles } from "../auth.js";

export const discovery = Router();
export const adminSearch = Router();

// Simple 60s in-memory cache (lightweight; Redis later if needed)
const cache = new Map<string, { at: number; body: any }>();

// Domain API (not screen API): same endpoint serves Consumer/Merchant/Host discovery.
discovery.get("/home", async (req, res) => {
  const { lat, lng, time, category, q } = req.query as any;
  const key = JSON.stringify({ lat, lng, time, category, q });
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 60_000) return res.json(hit.body);

  const nearby = await query(
    `SELECT id, name FROM merchants WHERE is_active = true
     AND ($1::text IS NULL OR category_id = $1) ORDER BY rating DESC LIMIT 10`,
    [category ?? null]
  );
  const popular = await query(
    `SELECT id, title AS name FROM catalog_items LIMIT 10`
  );
  const body = {
    data: {
      context: { lat: lat ?? null, lng: lng ?? null, time: time ?? null, category: category ?? null },
      sections: composeHome({
        lastSearch: q ?? null,
        nearbyOpen: nearby as any,
        popular: popular as any,
        timeOfDay: (time as any) ?? undefined,
      }),
    },
  };
  cache.set(key, { at: Date.now(), body });
  res.json(body);
});

// Future-Admin semantic search over projections (vectors are projections, never truth).
// POST /admin/search { query } -> cosine-ranked chunks + linked entities. Admin-only.
adminSearch.post("/search", requireRoles(["admin"]), async (req, res) => {
  const { query: q, limit } = req.body ?? {};
  if (!q) return res.status(422).json({ error: "query required" });
  const vec = await embed(String(q));
  const rows = await query(
    `SELECT entity_type, entity_id, chunk, embedding <=> $1::vector AS distance
     FROM nexg_documents ORDER BY embedding <=> $1::vector LIMIT $2`,
    [toVectorLiteral(vec), Math.min(Number(limit ?? 20), 50)]
  );
  res.json({ data: rows });
});

// Index helper: fire-and-forget (callers use `void`). Vectors are projections —
// indexing must never fail a write. Logs and drops on error (re-indexable later).
export async function indexDocument(entity_type: string, entity_id: string, chunk: string) {
  try {
    const vec = await embed(`${entity_type} ${entity_id} ${chunk}`);
    await query(
      `INSERT INTO nexg_documents (entity_type, entity_id, chunk, embedding)
       VALUES ($1,$2,$3,$4::vector)`,
      [entity_type, entity_id, chunk, toVectorLiteral(vec)]
    );
  } catch (e) {
    console.error(`indexDocument drop ${entity_type}/${entity_id}:`, (e as Error).message);
  }
}
