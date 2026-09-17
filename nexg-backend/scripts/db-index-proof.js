const { Client } = require("pg");

(async () => {
  const c = new Client({
    connectionString:
      process.env.DATABASE_URL ??
      "postgres://nexg:nexg_dev_password@localhost:5433/nexg",
  });
  await c.connect();
  await c.query("SET enable_seqscan = off");
  for (const [name, q] of [
    ["search merchants trgm", `EXPLAIN SELECT * FROM merchants WHERE name ILIKE '%spa%' OR category_label ILIKE '%spa%' OR description ILIKE '%spa%' OR tags_text(tags) ILIKE '%spa%' LIMIT 10`],
    ["search items trgm", `EXPLAIN SELECT * FROM catalog_items WHERE title ILIKE '%bur%' OR name ILIKE '%bur%' LIMIT 20`],
    ["catalog by merchant", `EXPLAIN SELECT * FROM catalog_items WHERE merchant_id = 'mrc_001' ORDER BY title LIMIT 200`],
    ["lines by order", `EXPLAIN SELECT * FROM order_lines WHERE order_id = 'ord_x'`],
  ]) {
    console.log(`### ${name} (seqscan off)`);
    const r = await c.query(q);
    for (const row of r.rows) console.log("  " + row["QUERY PLAN"]);
  }
  await c.end();
})().catch((e) => {
  console.error("PROOF_FAIL", e.message);
  process.exit(1);
});
