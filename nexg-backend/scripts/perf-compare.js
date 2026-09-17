const fs = require("fs");
const oldB = JSON.parse(fs.readFileSync("docs/perf-baseline-2026-09-11T17-57-35-536Z.json", "utf8"));
const newB = JSON.parse(fs.readFileSync("docs/perf-baseline-2026-09-14T18-28-18-407Z.json", "utf8"));
const oldRows = new Map(oldB.rows.map((r) => [r.name, r]));
const keys = ["GET /discovery/home", "GET /merchants", "GET /categories", "GET /categories/:id", "GET /search/suggestions", "GET /merchants?vertical"];
for (const k of keys) {
  const o = oldRows.get(k), n = newB.rows.find((r) => r.name === k);
  if (o && n) console.log(k, `old p50=${o.p50} p99=${o.p99} err=${o.err}`, `| new p50=${n.p50} p99=${n.p99} err=${n.err}`);
  else console.log(k, "MISSING", !!o, !!n);
}
console.log("--- rows with errors (new):");
for (const r of newB.rows) if (r.err > 0) console.log(r.name, "n=" + r.n, "err=" + r.err, "p50=" + r.p50, "p99=" + r.p99);
console.log("--- worst p99 (new):");
for (const r of [...newB.rows].sort((a, b) => b.p99 - a.p99).slice(0, 8)) console.log(r.name, "p99=" + r.p99, "err=" + r.err);
