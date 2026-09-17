// Full-platform perf harness: EVERY endpoint + journeys, percentiles, RPS, errors.
// Usage: node scripts/perf.js [--concurrency=10 --iters=30 --soakSec=60]
// Output: docs/perf-baseline-<ts>.json + console table. Treat as production code.
const fs = require("fs");
const path = require("path");

const base = "http://localhost:3000";
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const CONC = Number(args.concurrency ?? 10);
const ITERS = Number(args.iters ?? 30);
const SOAK = Number(args.soakSec ?? 60);

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rnd(arr.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = {};
function rec(name, ms, ok, extra = {}) {
  (results[name] ??= { lat: [], err: 0, n: 0, extra: {} }).lat.push(ms);
  results[name].n++;
  if (!ok) results[name].err++;
  Object.assign(results[name].extra, extra);
}
async function timed(name, fn) {
  const t = Date.now();
  try {
    await fn();
    rec(name, Date.now() - t, true);
  } catch (e) {
    // 429 = load shed by design (fast-fail), not a failure. Tracked separately.
    const shed = String(e.message).includes("-> 429");
    if (shed) {
      rec(name, Date.now() - t, true);
      results[name].shed = (results[name].shed ?? 0) + 1;
    } else {
      rec(name, Date.now() - t, false, { lastError: String(e.message).slice(0, 120) });
    }
  }
}
async function req(method, path, body, token) {
  const r = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null;
  try { j = await r.json(); } catch {}
  if (r.status >= 400) throw new Error(`${method} ${path} -> ${r.status}`);
  return j.data;
}
async function runConcurrent(n, times, fn) {
  const pool = Array.from({ length: n }, async () => {
    for (let i = 0; i < times; i++) await fn(i);
  });
  await Promise.all(pool);
}

const QUERIES = ["burger", "spa", "nyama", "safari", "coffee", "laundry", "pizza", "massage", "mandazi", "tilapia"];
let TOK = {};
let MERCHANTS = [];
let ITEMS = [];

async function setup() {
  const p = () => `2547${Math.floor(10000000 + Math.random() * 89999999)}`;
  const reg = async (body) => (await req("POST", "/auth/register", body)).access;
  TOK.consumer = await reg({ phone: p(), pin: "1" });
  const sp = p();
  await req("POST", "/auth/register", { phone: sp, pin: "1", kind: "merchant_staff", merchant_id: "mrc_001" });
  TOK.staff = (await req("POST", "/auth/login", { phone: sp, pin: "1" })).access;
  const rp = p();
  await req("POST", "/auth/register", { phone: rp, pin: "1", kind: "rider" });
  TOK.rider = (await req("POST", "/auth/login", { phone: rp, pin: "1" })).access;
  const ap = `2549${Math.floor(10000000 + Math.random() * 89999999)}`;
  const areg = await req("POST", "/auth/register", { phone: ap, pin: "1" });
  const key = process.env.ADMIN_BOOTSTRAP_KEY ?? "nexg-dev-bootstrap";
  await fetch(base + "/auth/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-bootstrap-key": key },
    body: JSON.stringify({ person_id: areg.person_id, kind: "admin" }),
  });
  TOK.admin = (await req("POST", "/auth/login", { phone: ap, pin: "1" })).access;
  MERCHANTS = (await req("GET", "/merchants")).map((m) => m.id);
  ITEMS = [];
  for (const mid of MERCHANTS.slice(0, 20)) {
    const items = await req("GET", `/catalog/items?merchant=${mid}`);
    for (const it of items.slice(0, 3)) ITEMS.push(it);
  }
  console.log(`setup: merchants=${MERCHANTS.length} items=${ITEMS.length}`);
}

function pct(a, p) {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}

async function main() {
  await setup();
  console.log(`warm-up + load: concurrency=${CONC} iters=${ITERS} soak=${SOAK}s`);

  // Warm-up (not measured)
  await runConcurrent(3, 5, async () => {
    await req("GET", "/merchants");
    await req("GET", `/catalog/items?merchant=${pick(MERCHANTS)}`);
  });

  const S = [];
  const scen = (name, fn) => S.push([name, fn]);

  // ---- Reads: every GET surface ----
  scen("GET /health", () => req("GET", "/health"));
  scen("GET /categories", () => req("GET", "/categories"));
  scen("GET /categories/:id", () => req("GET", "/categories/restaurants-food"));
  scen("GET /merchants", () => req("GET", "/merchants"));
  scen("GET /merchants?vertical", () => req("GET", `/merchants?vertical=${pick(["food", "wellness", "beauty", "experiences", "transport", "shopping"])}`));
  scen("GET /merchants/:id", () => req("GET", `/merchants/${pick(MERCHANTS)}`));
  scen("GET /catalog/items", () => req("GET", `/catalog/items?merchant=${pick(MERCHANTS)}`));
  scen("GET /catalog/items/:id", () => req("GET", `/catalog/items/${pick(ITEMS).id}`));
  scen("GET /experiences", () => req("GET", "/experiences"));
  scen("GET /search", () => req("GET", `/search?q=${pick(QUERIES)}`));
  scen("GET /search/suggestions", () => req("GET", "/search/suggestions"));
  scen("GET /media", () => req("GET", "/media?entity_type=merchant&entity_id=mrc_001"));
  scen("GET /discovery/home", () => req("GET", `/discovery/home?category=restaurants-food&q=${pick(QUERIES)}`));
  scen("GET /orders (staff)", () => req("GET", "/orders?merchant=mrc_001", null, TOK.staff));
  scen("GET /orders/:id (staff)", async () => {
    const list = await req("GET", "/orders?merchant=mrc_001", null, TOK.staff);
    if (list.length) await req("GET", `/orders/${pick(list).id}`, null, TOK.staff);
  });
  scen("GET /bookings (staff)", () => req("GET", "/bookings?merchant=mrc_003", null, TOK.admin));
  scen("GET /requests (staff)", () => req("GET", "/requests?merchant=mrc_003", null, TOK.admin));
  scen("GET /rider/jobs", () => req("GET", "/rider/jobs", null, TOK.rider));
  scen("GET /rider/earnings", () => req("GET", "/rider/earnings", null, TOK.rider));
  scen("GET /ledger/events (admin)", () => req("GET", "/ledger/events?limit=50", null, TOK.admin));
  scen("GET /inbox consumer", () => req("GET", "/inbox?limit=20", null, TOK.consumer));
  scen("GET /inbox staff", () => req("GET", "/inbox?limit=20", null, TOK.staff));
  scen("POST /admin/search", () => req("POST", "/admin/search", { query: pick(QUERIES), limit: 5 }, TOK.admin));

  // ---- Writes: every mutation surface ----
  scen("POST /auth/register", () => req("POST", "/auth/register", { phone: `2547${Math.floor(10000000 + Math.random() * 89999999)}`, pin: "1" }));
  scen("POST /auth/login", async () => {
    const p = `2547${Math.floor(10000000 + Math.random() * 89999999)}`;
    await req("POST", "/auth/register", { phone: p, pin: "1" });
    await req("POST", "/auth/login", { phone: p, pin: "1" });
  });
  scen("POST /auth/refresh", async () => {
    const p = `2547${Math.floor(10000000 + Math.random() * 89999999)}`;
    const r = await req("POST", "/auth/register", { phone: p, pin: "1" });
    await req("POST", "/auth/refresh", { refresh: r.refresh });
  });
  scen("POST /orders", () =>
    req("POST", "/orders", {
      merchant_id: "mrc_001",
      lines: [{ item_id: "itm_101", title: "Nyama Choma (500g)", qty: 1 + rnd(3), unit_price_kes: 1450 }],
      idempotency_key: `perf_${Date.now()}_${rnd(1e9)}`,
    }, TOK.consumer)
  );
  scen("POST /bookings", () =>
    req("POST", "/bookings", {
      merchant_id: "mrc_003", guests: 1 + rnd(4),
      scheduled_for: new Date(Date.now() + 864e5).toISOString(),
      idempotency_key: `perfb_${Date.now()}_${rnd(1e9)}`,
    }, TOK.consumer)
  );
  scen("PATCH /orders (accept)", async () => {
    const o = await req("POST", "/orders", {
      merchant_id: "mrc_001",
      lines: [{ title: "Perf", qty: 1, unit_price_kes: 100 }],
      idempotency_key: `perfa_${Date.now()}_${rnd(1e9)}`,
    }, TOK.consumer);
    await req("PATCH", `/orders/${o.id}`, { action: "accept" }, TOK.staff);
  });
  scen("POST /requests", () =>
    req("POST", "/requests", { merchant_id: "mrc_003", title: `Perf towels ${rnd(1e6)}` }, TOK.consumer)
  );
  scen("POST /catalog/items", () =>
    req("POST", "/catalog/items", { merchant_id: "mrc_001", name: `Perf item ${rnd(1e6)}`, price_kes: 500 }, TOK.staff)
  );
  scen("PATCH /catalog/items", async () => {
    // Own-merchant item only (cross-merchant PATCH is 403 by design — scope test lives in m4).
    const created = await req("POST", "/catalog/items", {
      merchant_id: "mrc_001", name: `Perf patched ${rnd(1e6)}`, price_kes: 100,
    }, TOK.staff);
    await req("PATCH", `/catalog/items/${created.id}`, { price_kes: 150 }, TOK.staff);
  });
  scen("PATCH /merchants/:id", () => req("PATCH", "/merchants/mrc_001", { eta_min: "20-30 min" }, TOK.staff));
  scen("POST /uploads/presign", () =>
    req("POST", "/uploads/presign", { entity: "delivery", entity_id: "perf", filename: "p.jpg" }, TOK.rider)
  );

  // ---- Journey: consumer browse→search→order→track (with think time) ----
  scen("journey: browse→order", async () => {
    await req("GET", "/categories");
    await sleep(50 + rnd(150));
    const m = await req("GET", "/merchants?vertical=food");
    await sleep(50 + rnd(150));
    const mid = pick(m).id;
    await req("GET", `/merchants/${mid}`);
    const items = await req("GET", `/catalog/items?merchant=${mid}`);
    const it = pick(items.length ? items : ITEMS);
    await req("GET", `/catalog/items/${it.id}`);
    await sleep(100 + rnd(300));
    const o = await req("POST", "/orders", {
      merchant_id: it.merchant_id ?? mid,
      lines: [{ item_id: it.id, title: it.name ?? it.title, qty: 1, unit_price_kes: it.price_kes }],
      idempotency_key: `perfj_${Date.now()}_${rnd(1e9)}`,
    }, TOK.consumer);
    await req("GET", `/orders/${o.id}`, null, TOK.consumer);
  });

  // ---- Spike: 50 concurrent on hottest read ----
  scen("spike GET /merchants x50", async () => {
    await Promise.all(Array.from({ length: 50 }, () => req("GET", "/merchants")));
  });

  const t0 = Date.now();
  for (const [name, fn] of S) {
    await runConcurrent(CONC, ITERS, async () => timed(name, fn));
    process.stdout.write(`.`);
  }
  console.log("");

  // ---- Soak: mixed random traffic ----
  const soakEnd = Date.now() + SOAK * 1000;
  const workers = Array.from({ length: CONC }, async () => {
    while (Date.now() < soakEnd) {
      const [name, fn] = pick(S);
      await timed(`soak:${name}`, fn);
      await sleep(50 + rnd(250));
    }
  });
  await Promise.all(workers);
  const totalSec = (Date.now() - t0) / 1000;

  // ---- SSE event latency: place order, measure stream arrival ----
  await timed("sse order.placed latency", async () => {
    const ctrl = new AbortController();
    const qs = new URLSearchParams({ channel: "merchant:mrc_001", token: TOK.staff });
    const streamP = fetch(`${base}/events/stream?${qs}`, { signal: ctrl.signal }).then(async (r) => {
      const rd = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      const start = Date.now();
      for (;;) {
        const { done, value } = await rd.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const f = buf.slice(0, i);
          buf = buf.slice(i + 2);
          if (f.includes("event: order.placed")) {
            ctrl.abort();
            return Date.now() - placedAt;
          }
        }
        if (Date.now() - start > 15000) throw new Error("sse timeout");
      }
      throw new Error("stream closed");
    });
    await sleep(500);
    var placedAt = Date.now();
    await req("POST", "/orders", {
      merchant_id: "mrc_001",
      lines: [{ title: "SSE probe", qty: 1, unit_price_kes: 10 }],
      idempotency_key: `perfsse_${Date.now()}`,
    }, TOK.consumer);
    const ms = await streamP;
    if (ms > 5000) throw new Error(`slow event ${ms}ms`);
  });

  // ---- Report ----
  let totalReqs = 0;
  let totalErr = 0;
  let totalShed = 0;
  const rows = [];
  for (const [name, s] of Object.entries(results)) {
    totalReqs += s.n;
    totalErr += s.err;
    totalShed += s.shed ?? 0;
    rows.push({
      name,
      n: s.n,
      err: s.err,
      errPct: ((100 * s.err) / s.n).toFixed(1),
      avg: Math.round(s.lat.reduce((a, b) => a + b, 0) / s.lat.length),
      p50: pct(s.lat, 50),
      p90: pct(s.lat, 90),
      p95: pct(s.lat, 95),
      p99: pct(s.lat, 99),
      max: Math.max(...s.lat),
      ...(s.extra.lastError && s.err ? { lastError: s.extra.lastError } : {}),
    });
  }
  rows.sort((a, b) => b.p99 - a.p99);
  console.log(`\nAPI perf baseline: ${totalReqs} reqs in ${totalSec.toFixed(0)}s (${(totalReqs / totalSec).toFixed(0)} RPS overall), errors: ${totalErr}, shed(429): ${totalShed}`);
  console.log("name | n err% shed | avg p50 p90 p95 p99 max (ms)");
  for (const r of rows) {
    console.log(
      `${r.name} | ${r.n} ${r.errPct}% shed=${results[r.name].shed ?? 0} | ${r.avg} ${r.p50} ${r.p90} ${r.p95} ${r.p99} ${r.max}${r.lastError ? " !! " + r.lastError : ""}`
    );
  }
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const out = path.join(__dirname, "..", "docs", `perf-baseline-${ts}.json`);
  fs.writeFileSync(out, JSON.stringify({ ts: new Date().toISOString(), conc: CONC, iters: ITERS, soakSec: SOAK, totalReqs, totalErr, rps: totalReqs / totalSec, rows }, null, 1));
  console.log(`wrote ${out}`);
  const slow = rows.filter((r) => r.p99 > 500 && r.n > 5);
  if (slow.length || totalErr > 0) {
    console.log(`THRESHOLDS: ${slow.length} scenarios p99>500ms, ${totalErr} errors`);
  } else {
    console.log("THRESHOLDS: all green (p99<=500ms, 0 errors)");
  }
}

main().catch((e) => {
  console.error("PERF_FATAL", e);
  process.exit(1);
});
