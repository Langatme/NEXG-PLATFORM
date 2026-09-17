const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: "postgres://nexg:nexg_dev_password@localhost:5433/nexg" });
  await c.connect();
  const q = async (label, sql) => {
    const r = await c.query(sql);
    console.log(label, JSON.stringify(r.rows));
  };
  const NEWM = "merchant_id LIKE '%!_!_%' ESCAPE '!'";
  const NEWI = "id LIKE '%!_!_%' ESCAPE '!'";
  await q("new-merchants:", `SELECT count(*) AS n FROM merchants WHERE ${NEWI}`);
  await q("min-sections:", `SELECT MIN(s) AS m FROM (SELECT count(*) AS s FROM catalog_sections WHERE ${NEWM} GROUP BY merchant_id) t`);
  await q("min-items:", `SELECT MIN(s) AS m FROM (SELECT count(*) AS s FROM catalog_items WHERE ${NEWM} GROUP BY merchant_id) t`);
  await q("caps:", `SELECT capabilities, count(*) AS n FROM catalog_items WHERE ${NEWM} GROUP BY 1 ORDER BY 1`);
  await q("sub-coverage:", `SELECT MIN(c) AS min_per_sub, count(*) AS subs FROM (SELECT count(DISTINCT m.id) AS c FROM subcategories s LEFT JOIN merchants m ON m.category_id = s.category_id AND m.${NEWI} GROUP BY s.category_id) t`);
  const per = await c.query(
    "SELECT m.category_id, COUNT(*) AS merchants, (SELECT COUNT(*) FROM subcategories s WHERE s.category_id = m.category_id AND s.id LIKE '%!_!_%' ESCAPE '!') AS subs FROM merchants m WHERE m.id LIKE '%!_!_%' ESCAPE '!' GROUP BY 1 ORDER BY 1"
  );
  let ok = per.rows.length === 21;
  for (const row of per.rows) {
    if (Number(row.merchants) !== Number(row.subs) * 4) { ok = false; console.log("MISMATCH", JSON.stringify(row)); }
  }
  console.log("per-cat-subs-x4:", JSON.stringify(per.rows.map((r) => `${r.category_id}:${r.merchants}/${r.subs}`)), "ok:", ok);
  await c.end();
})().catch((e) => { console.error("DB_FAIL", e.message); process.exit(1); });
