const { Pool } = require("pg");
const pool = new Pool({ connectionString: "postgres://nexg:nexg_dev_password@localhost:5433/nexg", max: 20 });
(async () => {
  const ex = await pool.query(`EXPLAIN (ANALYZE, BUFFERS, TIMING OFF)
    SELECT * FROM merchants WHERE is_active = true
    AND (NULL::text IS NULL OR category_id = NULL)
    AND (NULL::text IS NULL OR name ILIKE '%' || NULL || '%')
    AND (NULL::text IS NULL OR NULL = ANY(verticals))
    ORDER BY rating DESC LIMIT 500 OFFSET 0`);
  console.log(ex.rows.map((r) => r["QUERY PLAN"]).join("\n"));
  const one = async () => {
    const t = Date.now();
    await pool.query("SELECT count(*) FROM catalog_items");
    return Date.now() - t;
  };
  console.log("warm singles:", await one(), await one(), await one(), "ms");
  const t0 = Date.now();
  const rs = await Promise.all(Array.from({ length: 20 }, () => one()));
  rs.sort((a, b) => a - b);
  console.log(`BURST x20 direct-pg wall=${Date.now() - t0}ms p50=${rs[10]} max=${rs[19]}`);
  const mx = await pool.query("SHOW max_connections");
  console.log("max_connections=" + mx.rows[0].max_connections);
  await pool.end();
})().catch((e) => { console.error("DIAG3_FAIL", e.message); process.exit(1); });
