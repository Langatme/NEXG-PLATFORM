const { Client } = require("pg");

(async () => {
  const c = new Client({
    connectionString:
      process.env.DATABASE_URL ??
      "postgres://nexg:nexg_dev_password@localhost:5433/nexg",
  });
  await c.connect();
  for (const q of [
    "SELECT id, merchant_id, title FROM catalog_items WHERE id IN ('itm_101','itm_102','itm_111','itm_112')",
    "SELECT id FROM catalog_items WHERE merchant_id = 'mrc_002' ORDER BY id LIMIT 12",
    "SELECT count(*) AS pizza FROM catalog_items WHERE title ILIKE '%pizza%' OR name ILIKE '%pizza%'",
    "SELECT count(*) AS coffee FROM catalog_items WHERE title ILIKE '%coffee%' OR name ILIKE '%coffee%' OR description ILIKE '%coffee%'",
    "SELECT id, name FROM merchants WHERE name ILIKE '%pizza%' OR name ILIKE '%coffee%'",
    "SELECT c.id, count(s.id) AS subs FROM categories c LEFT JOIN subcategories s ON s.category_id = c.id WHERE c.id IN ('food','grocery','wellness') GROUP BY c.id",
  ]) {
    const r = await c.query(q);
    console.log(q.slice(0, 60), "=>", JSON.stringify(r.rows).slice(0, 400));
  }
  await c.end();
})().catch((e) => {
  console.error("INSPECT_FAIL", e.message);
  process.exit(1);
});
