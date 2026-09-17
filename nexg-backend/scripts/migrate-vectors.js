const fs = require("fs");
const { Client } = require("pg");

(async () => {
  const c = new Client({
    connectionString:
      process.env.DATABASE_URL ??
      "postgres://nexg:nexg_dev_password@localhost:5433/nexg",
  });
  await c.connect();
  const sql = fs.readFileSync("db/migrations/002_vectors.sql", "utf8");
  await c.query(sql);
  const checks = [
    "SELECT extname FROM pg_extension WHERE extname='vector'",
    "SELECT count(*) AS merchants FROM merchants",
    "SELECT count(*) AS docs FROM nexg_documents",
  ];
  for (const q of checks) {
    const r = await c.query(q);
    console.log(q, JSON.stringify(r.rows));
  }
  await c.end();
})().catch((e) => {
  console.error("MIGRATE_FAIL", e.message);
  process.exit(1);
});
