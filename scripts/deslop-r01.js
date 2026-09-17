// R-01 regression coverage plan (DRAFT — no backend change):
// Rider scope-trap: assigned-own / unassigned-403 / omitted-scoped.
// Run: node scripts/deslop-r01.js [--live]
// Default (--plan): static repo assertions only (backend trap code present,
// rider app calls scoped endpoints only). --live: mirrors the m2-verify R-01
// block against a running backend (needs ADMIN_BOOTSTRAP_KEY for N/A steps).
// Style follows nexg-backend/scripts/*-verify.js (check/req, pass/fail, exit 1).
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LIVE = process.argv.includes("--live");
const base = process.env.NEXG_API_BASE ?? "http://localhost:3000";
let pass = 0;
const failures = [];
async function check(name, fn) {
  try {
    await fn();
    pass++;
    console.log(` ok - ${name}`);
  } catch (e) {
    failures.push(`${name}: ${e.message}`);
    console.log(` FAIL - ${name}: ${e.message}`);
  }
}
function mustContain(file, needle, label) {
  const body = fs.readFileSync(file, "utf8");
  if (!body.includes(needle)) throw new Error(`${label} missing in ${path.basename(file)}`);
}
async function req(method, p, body, token) {
  const r = await fetch(base + p, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null;
  try { j = await r.json(); } catch {}
  return { status: r.status, j };
}
const rnd = () => Math.floor(10000000 + Math.random() * 89999999);

(async () => {
  // PLAN: static guards — the trap must stay in backend, app must stay scoped.
  await check("plan: domain.ts assigned-only subquery (omitted-scoped)", async () => {
    mustContain(path.join(ROOT, "nexg-backend", "src", "routes", "domain.ts"), "not_your_order", "detail 403 guard");
  });
  await check("plan: deliveries.ts assertRider 403 guards", async () => {
    mustContain(path.join(ROOT, "nexg-backend", "src", "routes", "deliveries.ts"), "not_your_task", "rider task guard");
  });
  await check("plan: rider app reads scoped endpoints only (getJobs/getRiderProfile)", async () => {
    const jobs = path.join(ROOT, "nexg-rider-app", "app", "(tabs)", "jobs.tsx");
    const body = fs.readFileSync(jobs, "utf8");
    if (!body.includes("getJobs(")) throw new Error("jobs screen must call getJobs()");
    if (body.includes("fetch(") && body.includes("/orders")) throw new Error("jobs screen must not hit /orders directly");
  });
  await check("plan: no MapLibre / no new native deps in rider scope", async () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "nexg-rider-app", "package.json"), "utf8"));
    for (const d of Object.keys(pkg.dependencies ?? {})) {
      if (/maplibre/i.test(d)) throw new Error(`banned dep ${d}`);
    }
  });

  if (!LIVE) {
    console.log("\nR-01 PLAN (draft, static only):");
    console.log(" 1. assigned-own: rider GET /orders contains own assigned order (live: --live)");
    console.log(" 2. omitted-scoped: rider GET /orders?merchant=mrc_001 -> 200 scoped, no cross-merchant leak");
    console.log(" 3. unassigned-403: fresh rider GET /orders/:id -> 403 not_your_order; unassigned GET /orders -> []");
    console.log(" Live parity lives in nexg-backend/scripts/m2-verify.js R-01 block; promote these there when green.");
  } else {
    // LIVE: same three R-01 probes as m2-verify (needs running backend, no backend change).
    const ctok = (await req("POST", "/auth/register", { phone: `2547${rnd()}`, pin: "1" })).j.data.access;
    const placed = await req("POST", "/orders", {
      merchant_id: "mrc_001",
      lines: [{ title: "R-01 probe", qty: 1, unit_price_kes: 50 }],
      idempotency_key: `r01_${Date.now()}`,
    }, ctok);
    const orderId = placed.j.data.id;
    const stok = await (async () => {
      const p = `2547${rnd()}`;
      await req("POST", "/auth/register", { phone: p, pin: "1", kind: "merchant_staff", merchant_id: "mrc_001" });
      return (await req("POST", "/auth/login", { phone: p, pin: "1" })).j.data.access;
    })();
    for (const a of ["accept", "preparing", "ready", "handoff"]) {
      await req("PATCH", `/orders/${orderId}`, { action: a }, stok);
    }
    const rphone = `2547${rnd()}`;
    await req("POST", "/auth/register", { phone: rphone, pin: "1", kind: "rider" });
    const rtok = (await req("POST", "/auth/login", { phone: rphone, pin: "1" })).j.data.access;
    const jobs = await req("GET", "/rider/jobs?status=OFFERED", null, rtok);
    const task = jobs.j.data.find((x) => x.order_id === orderId);
    if (task) await req("PATCH", `/deliveries/${task.id}`, { action: "accept" }, rtok);

    await check("live: assigned-own (GET /orders has own order)", async () => {
      const r = await req("GET", "/orders", null, rtok);
      if (r.status !== 200) throw new Error(`status ${r.status}`);
      if (!r.j.data.find((x) => x.id === orderId)) throw new Error("assigned order missing");
    });
    await check("live: omitted-scoped (?merchant= scoped, no leak)", async () => {
      const r = await req("GET", "/orders?merchant=mrc_001", null, rtok);
      if (r.status !== 200) throw new Error(`status ${r.status}`);
      for (const o of r.j.data) {
        if (o.merchant_id && o.merchant_id !== "mrc_001") throw new Error("cross-merchant leak");
      }
    });
    await check("live: unassigned-403 + unassigned empty (not ALL)", async () => {
      const p = `2547${rnd()}`;
      await req("POST", "/auth/register", { phone: p, pin: "1", kind: "rider" });
      const l = await req("POST", "/auth/login", { phone: p, pin: "1" });
      const list = await req("GET", "/orders", null, l.j.data.access);
      if (list.status !== 200 || list.j.data.length !== 0) throw new Error(`expected empty, got ${list.status}/${list.j.data.length}`);
      const det = await req("GET", `/orders/${orderId}`, null, l.j.data.access);
      if (det.status !== 403) throw new Error(`expected 403, got ${det.status}`);
    });
  }

  console.log(`\nR01: ${pass} passed, ${failures.length} failed`);
  for (const f of failures) console.log(" -", f);
  if (failures.length) process.exit(1);
  console.log(LIVE ? "R01_VERIFY_PASS" : "R01_PLAN_PASS");
})().catch((e) => {
  console.error("R01_FATAL", e.message);
  process.exit(1);
});
