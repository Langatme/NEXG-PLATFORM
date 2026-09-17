const fs = require("fs");
const { Client } = require("pg");

(async () => {
  const c = new Client({
    connectionString:
      process.env.DATABASE_URL ??
      "postgres://nexg:nexg_dev_password@localhost:5433/nexg",
  });
  await c.connect();
  const which = process.argv[2] || "db/migrations/003_hnsw.sql";
  await c.query(fs.readFileSync(which, "utf8"));
  const r = await c.query(
    "SELECT indexname FROM pg_indexes WHERE tablename = 'nexg_documents'"
  );
  console.log("indexes:", JSON.stringify(r.rows));
  const n = await c.query(
    "SELECT (SELECT count(*) FROM nexg_documents) AS docs, (SELECT count(*) FROM ncl_events) AS ncl, (SELECT count(*) FROM orders) AS orders"
  );
  console.log("counts:", JSON.stringify(n.rows[0]));
  await c.end();
})().catch((e) => {
  console.error("APPLY_FAIL", e.message);
  process.exit(1);
});
