const { Client } = require("pg");

(async () => {
  const c = new Client({
    connectionString:
      process.env.DATABASE_URL ??
      "postgres://nexg:nexg_dev_password@localhost:5433/nexg",
  });
  await c.connect();
  const show = async (title, q, params = []) => {
    console.log(`\n### ${title}`);
    const r = await c.query(q, params);
    for (const row of r.rows) console.log(JSON.stringify(row).slice(0, 300));
  };

  await show("extensions", "SELECT extname, extversion FROM pg_extension ORDER BY 1");
  await show(
    "tables + sizes",
    `SELECT relname AS t, n_live_tup AS rows, pg_size_pretty(pg_total_relation_size(relid)) AS size
     FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC`
  );
  await show(
    "indexes + scans (unused = 0 scans)",
    `SELECT relname AS t, indexrelname AS idx, idx_scan FROM pg_stat_user_indexes ORDER BY 1, 2`
  );
  await show(
    "tables missing indexes (seq scans)",
    `SELECT relname, seq_scan, idx_scan FROM pg_stat_user_tables ORDER BY seq_scan DESC`
  );
  await show("pg version + settings", "SELECT version()");
  await show(
    "memory settings",
    `SELECT name, setting, unit FROM pg_settings WHERE name IN
     ('shared_buffers','effective_cache_size','work_mem','maintenance_work_mem','max_connections',
      'autovacuum_vacuum_scale_factor','log_min_duration_statement','track_activity_query_size')`
  );

  // Hot-query plans (our actual API SQL shapes)
  const plans = [
    ["merchants list", `EXPLAIN SELECT * FROM merchants WHERE is_active = true AND ($1::text IS NULL OR category_id = $1) AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%') AND ($3::text IS NULL OR $3 = ANY(verticals)) ORDER BY rating DESC LIMIT 500`, [null, "spa", null]],
    ["search merchants ILIKE/trgm", `EXPLAIN SELECT * FROM merchants WHERE name ILIKE '%spa%' OR category_label ILIKE '%spa%' OR description ILIKE '%spa%' OR tags_text(tags) ILIKE '%spa%' LIMIT 10`],
    ["catalog by merchant", `EXPLAIN SELECT * FROM catalog_items WHERE merchant_id = 'mrc_001' ORDER BY title LIMIT 200`],
    ["order lines join", `EXPLAIN SELECT * FROM order_lines WHERE order_id = (SELECT id FROM orders LIMIT 1)`],
    ["ledger replay", `EXPLAIN SELECT seq, event_id FROM ncl_events WHERE entity_type='order' AND entity_id='x' ORDER BY seq DESC LIMIT 100`],
    ["vector search", `EXPLAIN SELECT entity_type, entity_id FROM nexg_documents ORDER BY embedding <=> (SELECT embedding FROM nexg_documents LIMIT 1)::vector LIMIT 20`],
    ["rider jobs join", `EXPLAIN SELECT d.*, m.name FROM delivery_tasks d JOIN merchants m ON m.id=d.merchant_id JOIN orders o ON o.id=d.order_id WHERE d.status='OFFERED' ORDER BY d.created_at DESC LIMIT 100`],
  ];
  for (const [name, q, p] of plans) {
    console.log(`\n### plan: ${name}`);
    try {
      const r = await c.query(q, p ?? []);
      for (const row of r.rows) console.log("  " + row["QUERY PLAN"]);
    } catch (e) {
      console.log("  PLAN_FAIL " + e.message);
    }
  }
  await c.end();
})().catch((e) => {
  console.error("AUDIT_FAIL", e.message);
  process.exit(1);
});
