const fs = require("fs");
const dir = "C:/Users/lenovo/Desktop/nexg-platform/nexg-backend/docs";
const files = fs.readdirSync(dir).filter((f) => f.startsWith("perf-baseline")).sort();
const latest = JSON.parse(fs.readFileSync(`${dir}/${files.pop()}`, "utf8"));
for (const r of latest.rows) {
  if (/auth\/(login|register)$/.test(r.name)) console.log(r.name, "n=" + r.n, "err=" + r.err, "p50=" + r.p50, "p99=" + r.p99);
}
console.log("totalReqs", latest.totalReqs, "totalErr", latest.totalErr, "rps", latest.rps.toFixed(1));
