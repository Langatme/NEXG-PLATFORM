// Seed vector index for demo merchants so POST /admin/search returns rows from day one.
// Stub embeddings now; re-run after switching EMBEDDINGS_PROVIDER to re-index.
const { Client } = require("pg");

async function main() {
  const c = new Client({
    connectionString:
      process.env.DATABASE_URL ??
      "postgres://nexg:nexg_dev_password@localhost:5433/nexg",
  });
  await c.connect();
  // Dynamic import of TS via tsx is unavailable here; replicate stub (same algorithm as embeddings.ts)
  const DIM = 1536;
  const stub = (text) => {
    let h = 2166136261;
    const out = Array.from({ length: DIM }, () => 0);
    for (let i = 0; i < DIM; i++) {
      h ^= text.charCodeAt(i % Math.max(text.length, 1)) + i * 31;
      h = Math.imul(h, 16777619);
      out[i] = ((h >>> 8) % 2000) / 1000 - 1;
    }
    const norm = Math.sqrt(out.reduce((s, v) => s + v * v, 0)) || 1;
    return `[${out.map((v) => v / norm).join(",")}]`;
  };
  const { rows } = await c.query("SELECT id, name, kind, vertical FROM merchants");
  for (const m of rows) {
    const chunk = `merchant ${m.id} ${m.name} ${m.kind} ${m.vertical}`;
    await c.query(
      `INSERT INTO nexg_documents (entity_type, entity_id, chunk, embedding)
       VALUES ('merchant',$1,$2,$3::vector)
       ON CONFLICT DO NOTHING`,
      [m.id, chunk, stub(chunk)]
    );
    console.log("indexed", m.id);
  }
  const n = await c.query("SELECT count(*) AS docs FROM nexg_documents");
  console.log("docs:", JSON.stringify(n.rows[0]));
  await c.end();
}

main().catch((e) => {
  console.error("SEED_INDEX_FAIL", e.message);
  process.exit(1);
});
