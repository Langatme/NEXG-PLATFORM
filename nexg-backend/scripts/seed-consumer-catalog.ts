// Seeds backend from the consumer mock catalog (single source of truth, no hand-typing).
// Run: node --import tsx scripts/seed-consumer-catalog.ts
// Idempotent: all inserts are upserts.
import { pool } from "../src/db.js";
import { taxonomy } from "../db/seed-data/taxonomy.js";
import { nexgCategories } from "../db/seed-data/categories.js";
import {
  getSeedMerchantsByCategory,
  nexgMenuCategories,
  nexgMerchants,
  nexgOfferings,
} from "../db/seed-data/catalog.js";

const expType = (fulfillment: string) =>
  fulfillment === "booking" ? "book" : fulfillment === "service" ? "request" : "order";

async function main() {
  // Merchant -> category via the catalog's own selector (handles curated + generated)
  const merchantCategory = new Map<string, string>();
  for (const c of nexgCategories) {
    for (const m of getSeedMerchantsByCategory(c.id)) {
      if (!merchantCategory.has(m.id)) merchantCategory.set(m.id, c.id);
    }
  }
  for (const m of nexgMerchants) {
    if (!merchantCategory.has(m.id) && m.id.startsWith("mrc_g_")) {
      merchantCategory.set(m.id, m.id.slice("mrc_g_".length).split("_")[0] ?? null as any);
    }
  }

  // 1. Categories
  let i = 0;
  for (const c of nexgCategories) {
    await pool.query(
      `INSERT INTO categories (id, name, experience_type, sort, emoji, short_label, verticals, fulfillment)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, experience_type=EXCLUDED.experience_type,
         sort=EXCLUDED.sort, emoji=EXCLUDED.emoji, short_label=EXCLUDED.short_label,
         verticals=EXCLUDED.verticals, fulfillment=EXCLUDED.fulfillment`,
      [c.id, c.name, expType(c.fulfillment), i++, c.emoji, c.shortLabel ?? null, c.verticals, c.fulfillment]
    );
  }

  // 2. Subcategories (namespace on collision to keep PK unique)
  const seen = new Set<string>();
  for (const cat of taxonomy) {
    for (const s of cat.subcategories) {
      const id = seen.has(s.id) ? `${cat.id}__${s.id}` : s.id;
      seen.add(s.id);
      await pool.query(
        `INSERT INTO subcategories (id, category_id, name, label)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE SET category_id=EXCLUDED.category_id, name=EXCLUDED.name, label=EXCLUDED.label`,
        [id, cat.id, s.label, s.label]
      );
    }
  }

  // 3. Merchants
  for (const m of nexgMerchants) {
    await pool.query(
      `INSERT INTO merchants (id, name, kind, vertical, verticals, category_id, category_label,
         description, rating, review_count, price_level, address, lat, lng, distance_km, is_open,
         opening_hours, tags, eta_min, min_order_kes, hero_image_key, accent_emoji, policies, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,true)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, kind=EXCLUDED.kind, vertical=EXCLUDED.vertical,
         verticals=EXCLUDED.verticals, category_id=EXCLUDED.category_id, category_label=EXCLUDED.category_label,
         description=EXCLUDED.description, rating=EXCLUDED.rating, review_count=EXCLUDED.review_count,
         price_level=EXCLUDED.price_level, address=EXCLUDED.address, lat=EXCLUDED.lat, lng=EXCLUDED.lng,
         distance_km=EXCLUDED.distance_km, is_open=EXCLUDED.is_open, opening_hours=EXCLUDED.opening_hours,
         tags=EXCLUDED.tags, eta_min=EXCLUDED.eta_min, min_order_kes=EXCLUDED.min_order_kes,
         hero_image_key=EXCLUDED.hero_image_key, accent_emoji=EXCLUDED.accent_emoji, policies=EXCLUDED.policies`,
      [
        m.id, m.name, m.kind, m.verticals[0] ?? "food", m.verticals,
        merchantCategory.get(m.id) ?? null, m.categoryLabel, m.description, m.rating,
        m.reviewCount, m.priceLevel, m.location.address, m.location.latitude, m.location.longitude,
        m.distanceKm, m.isOpen, JSON.stringify(m.openingHours), m.tags, m.etaMin ?? null,
        m.minOrderKes ?? null, m.heroImageKey ?? null, m.accentEmoji, m.policies ?? [],
      ]
    );
    // Hero media row (key reference until S3 URLs land)
    if (m.heroImageKey) {
      await pool.query(
        `INSERT INTO media_assets (entity_type, entity_id, kind, url, variant, sort)
         VALUES ('merchant',$1,'hero',$2,'medium',0)
         ON CONFLICT DO NOTHING`,
        [m.id, `media://${m.heroImageKey}`]
      );
    }
  }

  // 4. Sections
  for (const s of nexgMenuCategories) {
    await pool.query(
      `INSERT INTO catalog_sections (id, merchant_id, name, sort, subtitle)
       VALUES ($1,$2,$3,0,$4)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, subtitle=EXCLUDED.subtitle`,
      [s.id, s.merchantId, s.title, s.subtitle ?? null]
    );
  }

  // 5. Items + variants + addon groups
  for (const it of nexgOfferings) {
    const caps =
      (it as { capability?: string }).capability === "book"
        ? "{book}"
        : (it as { capability?: string }).capability === "request"
          ? "{request}"
          : "{add}";
    const itemType = caps === "{add}" ? "food" : "service";
    await pool.query(
      `INSERT INTO catalog_items (id, merchant_id, section_id, title, name, description, price_kes,
         image, image_key, item_type, capabilities, tags, is_popular, duration_min, is_available)
       VALUES ($1,$2,$3,$4,$4,$5,$6,$7,$7,$11,$12,$8,$9,$10,true)
       ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, name=EXCLUDED.name,
         description=EXCLUDED.description, price_kes=EXCLUDED.price_kes, image_key=EXCLUDED.image_key,
         item_type=EXCLUDED.item_type, capabilities=EXCLUDED.capabilities,
         tags=EXCLUDED.tags, is_popular=EXCLUDED.is_popular, duration_min=EXCLUDED.duration_min`,
      [
        it.id, it.merchantId, it.sectionId, it.name, it.description, it.priceKes,
        it.imageKey ? `media://${it.imageKey}` : null, it.tags ?? [],
        it.isPopular ?? false, it.durationMin ?? null, itemType, caps,
      ]
    );
    const variants = it.options?.variants ?? [];
    for (const v of variants) {
      await pool.query(
        `INSERT INTO item_variants (id, item_id, name, price_delta_kes)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, price_delta_kes=EXCLUDED.price_delta_kes`,
        [`${it.id}__${v.id}`, it.id, v.label, v.priceDeltaKes ?? 0]
      );
    }
    const addons = it.options?.addons ?? [];
    if (addons.length) {
      await pool.query(
        `INSERT INTO addon_groups (id, item_id, name, required, multi, options)
         VALUES ($1,$2,'Add-ons',false,true,$3)
         ON CONFLICT (id) DO UPDATE SET options=EXCLUDED.options`,
        [
          `${it.id}__addons`,
          it.id,
          JSON.stringify(addons.map((a) => ({ id: a.id, label: a.label, priceKes: a.priceKes ?? 0 }))),
        ]
      );
    }
  }

  // Repair: orphan generated merchant displaced by the mrc_002 slug fix (one-time, idempotent)
  await pool.query(`DELETE FROM catalog_sections WHERE merchant_id = 'mrc_g_restaurants-food_caf'`);
  await pool.query(`DELETE FROM merchants WHERE id = 'mrc_g_restaurants-food_caf'`);

  // Backfill demo categories (init.sql seeds predate display columns)
  await pool.query(
    `UPDATE categories SET emoji = '🍔', verticals = '{food}', fulfillment = 'delivery'
     WHERE id = 'food' AND emoji IS NULL`
  );
  await pool.query(
    `UPDATE categories SET emoji = '🛒', verticals = '{grocery}', fulfillment = 'delivery'
     WHERE id = 'grocery' AND emoji IS NULL`
  );

  // Demo merchants (init.sql seeds) get a minimal real catalog + demo subcategories,
  // so every clickable resolves (Backend Prompt §5: no empty pages).
  const demos: Array<{ merchant: string; category: string; sub: string; section: string; items: Array<[string, string, number]> }> = [
    { merchant: "mrc_demo_001", category: "food", sub: "demo-grill", section: "Demo Grill", items: [["demo_burger", "Demo Smash Burger", 750], ["demo_fries", "Demo Fries", 300]] },
    { merchant: "mrc_demo_002", category: "grocery", sub: "demo-essentials", section: "Demo Essentials", items: [["demo_milk", "Demo Fresh Milk", 120], ["demo_bread", "Demo Bread", 90]] },
    { merchant: "mrc_demo_003", category: "wellness", sub: "demo-spa", section: "Demo Treatments", items: [["demo_massage", "Demo Deep-Tissue Massage", 2500], ["demo_facial", "Demo Facial", 1800]] },
  ];
  for (const d of demos) {
    await pool.query(
      `INSERT INTO subcategories (id, category_id, name, label) VALUES ($1,$2,$3,$3)
       ON CONFLICT (id) DO NOTHING`,
      [`${d.category}__${d.sub}`, d.category, d.sub]
    );
    const secId = `${d.merchant}_s0`;
    await pool.query(
      `INSERT INTO catalog_sections (id, merchant_id, name, sort) VALUES ($1,$2,$3,0)
       ON CONFLICT (id) DO NOTHING`,
      [secId, d.merchant, d.section]
    );
    for (const [id, name, price] of d.items) {
      await pool.query(
        `INSERT INTO catalog_items (id, merchant_id, section_id, title, name, description, price_kes, capabilities, is_available)
         VALUES ($1,$2,$3,$4,$4,'Demo seed item for click-through QA.',$5,'{add}',true)
         ON CONFLICT (id) DO NOTHING`,
        [id, d.merchant, secId, name, price]
      );
    }
  }

  const n = await pool.query(
    `SELECT (SELECT count(*) FROM categories) AS cats, (SELECT count(*) FROM subcategories) AS subs,
            (SELECT count(*) FROM merchants) AS merchants, (SELECT count(*) FROM catalog_sections) AS sections,
            (SELECT count(*) FROM catalog_items) AS items, (SELECT count(*) FROM item_variants) AS variants,
            (SELECT count(*) FROM addon_groups) AS addon_groups`
  );
  console.log("seeded:", JSON.stringify(n.rows[0]));
  // Bulk loads bypass autovacuum stats; analyze so the planner sees real row counts.
  await pool.query(
    "ANALYZE merchants; ANALYZE catalog_items; ANALYZE catalog_sections; ANALYZE subcategories; ANALYZE categories;"
  );
  await pool.end();
}

main().catch((e) => {
  console.error("SEED_FAIL", e);
  process.exit(1);
});
