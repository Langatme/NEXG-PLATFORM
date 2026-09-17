const http = require("node:http");
const bigAgent = new http.Agent({ maxSockets: 50, keepAlive: true });
const dfltAgent = new http.Agent({ keepAlive: true });
function get(path, agent) {
  return new Promise((resolve) => {
    const t = Date.now();
    const rq = http.get({ host: "localhost", port: 3000, path, agent }, (rs) => {
      rs.resume();
      rs.on("end", () => resolve({ ms: Date.now() - t, ok: rs.statusCode < 400 }));
    });
    rq.on("error", () => resolve({ ms: Date.now() - t, ok: false }));
  });
}
function summ(label, arr, wall) {
  const s = arr.map((r) => r.ms).sort((a, b) => a - b);
  console.log(`${label} wall=${wall}ms p50=${s[Math.floor(s.length / 2)]} max=${s[s.length - 1]} err=${arr.filter((r) => !r.ok).length}`);
}
(async () => {
  for (let i = 0; i < 3; i++) await get("/health", dfltAgent);
  let t0 = Date.now();
  summ("BURST x20 /health default-sockets", await Promise.all(Array.from({ length: 20 }, () => get("/health", dfltAgent))), Date.now() - t0);
  t0 = Date.now();
  summ("BURST x20 /merchants 50-sockets", await Promise.all(Array.from({ length: 20 }, () => get("/merchants", bigAgent))), Date.now() - t0);
  t0 = Date.now();
  summ("BURST x50 /merchants 50-sockets", await Promise.all(Array.from({ length: 50 }, () => get("/merchants", bigAgent))), Date.now() - t0);
  bigAgent.destroy(); dfltAgent.destroy();
})().catch((e) => { console.error("DIAG2_FAIL", e.message); process.exit(1); });
