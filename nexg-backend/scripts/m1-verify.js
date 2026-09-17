// M1 verify: merchant orders loop — staff list → accept→preparing→ready→handoff→complete,
// guards (illegal 422, replay, cross-merchant 403, reject-reason 422), NCL chain.
const base = "http://localhost:3000";
let pass = 0;
const failures = [];
async function check(name, fn) {
  try {
    await fn();
    pass++;
  } catch (e) {
    failures.push(`${name}: ${e.message}`);
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
  return { status: r.status, j };
}
const rnd = () => Math.floor(10000000 + Math.random() * 89999999);

(async () => {
  // Consumer places an order at mrc_001 (correct catalog price itm_101=1450)
  const cphone = `2547${rnd()}`;
  const creg = await req("POST", "/auth/register", { phone: cphone, pin: "1234" });
  const ctok = creg.j.data.access;
  const placed = await req("POST", "/orders", {
    merchant_id: "mrc_001",
    lines: [{ item_id: "itm_101", title: "Nyama Choma (500g)", qty: 1, unit_price_kes: 1450 }],
    idempotency_key: `m1_${Date.now()}`,
  }, ctok);
  const orderId = placed.j.data.id;

  // Staff at mrc_001
  const sphone = `2547${rnd()}`;
  await req("POST", "/auth/register", { phone: sphone, pin: "1234", kind: "merchant_staff", merchant_id: "mrc_001" });
  const slogin = await req("POST", "/auth/login", { phone: sphone, pin: "1234" });
  const stok = slogin.j.data.access;
  await check("staff token scoped to mrc_001", async () => {
    const payload = JSON.parse(Buffer.from(stok.split(".")[1], "base64").toString());
    if (payload.merchant_id !== "mrc_001") throw new Error(JSON.stringify(payload.scope));
  });

  await check("staff sees PLACED order in queue", async () => {
    const r = await req("GET", "/orders?merchant=mrc_001&status=PLACED", null, stok);
    if (r.status !== 200 || !r.j.data.some((o) => o.id === orderId)) throw new Error(r.status);
  });

  const chain = [
    ["accept", "CONFIRMED"],
    ["preparing", "PREPARING"],
    ["ready", "READY"],
    ["handoff", "PICKED"],
    ["complete", "DELIVERED"],
  ];
  for (const [action, status] of chain) {
    await check(`transition ${action} -> ${status}`, async () => {
      const r = await req("PATCH", `/orders/${orderId}`, { action }, stok);
      if (r.status !== 200 || r.j.data.status !== status) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
    });
  }

  await check("illegal transition 422 (accept on DELIVERED)", async () => {
    const r = await req("PATCH", `/orders/${orderId}`, { action: "accept" }, stok);
    if (r.status !== 422) throw new Error(r.status);
  });

  // Fresh order for reject + replay checks
  const placed2 = await req("POST", "/orders", {
    merchant_id: "mrc_001",
    lines: [{ title: "Custom", qty: 1, unit_price_kes: 100 }],
    idempotency_key: `m1b_${Date.now()}`,
  }, ctok);
  const order2 = placed2.j.data.id;
  await check("reject without reason 422", async () => {
    const r = await req("PATCH", `/orders/${order2}`, { action: "reject" }, stok);
    if (r.status !== 422) throw new Error(r.status);
  });
  await check("reject with reason -> CANCELLED", async () => {
    const r = await req("PATCH", `/orders/${order2}`, { action: "reject", reason: "Out of stock" }, stok);
    if (r.status !== 200 || r.j.data.status !== "CANCELLED") throw new Error(r.status);
  });
  await check("double-reject replays (no crash, CANCELLED)", async () => {
    const r = await req("PATCH", `/orders/${order2}`, { action: "reject", reason: "x" }, stok);
    if (r.status !== 200 || r.j.data.status !== "CANCELLED") throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
  });

  // Cross-merchant staff cannot transition
  await check("cross-merchant transition 403", async () => {
    const s2 = `2547${rnd()}`;
    await req("POST", "/auth/register", { phone: s2, pin: "1", kind: "merchant_staff", merchant_id: "mrc_003" });
    const l2 = await req("POST", "/auth/login", { phone: s2, pin: "1" });
    const r = await req("PATCH", `/orders/${orderId}`, { action: "refund" }, l2.j.data.access);
    if (r.status !== 403) throw new Error(r.status);
  });

  // NCL chain for the order
  await check("NCL chain has placed→delivered", async () => {
    const key = process.env.ADMIN_BOOTSTRAP_KEY ?? "nexg-dev-bootstrap";
    const ap = `2549${rnd()}`;
    const reg = await req("POST", "/auth/register", { phone: ap, pin: "1" });
    await fetch(base + "/auth/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bootstrap-key": key },
      body: JSON.stringify({ person_id: reg.j.data.person_id, kind: "admin" }),
    });
    const login = await req("POST", "/auth/login", { phone: ap, pin: "1" });
    const r = await req("GET", `/ledger/events?entity_id=${orderId}`, null, login.j.data.access);
    const types = r.j.data.map((e) => e.event_type);
    for (const t of ["order.placed", "order.accepted", "order.preparing", "order.ready", "order.handed_off", "order.delivered"]) {
      if (!types.includes(t)) throw new Error(`missing ${t}: ${types.join(",")}`);
    }
  });

  // Merchant catalog + finance reads behind staff token
  await check("staff catalog read", async () => {
    const r = await req("GET", "/catalog/items?merchant=mrc_001", null, stok);
    if (r.status !== 200 || !r.j.data.length) throw new Error(r.status);
  });

  console.log(`\nM1: ${pass} passed, ${failures.length} failed`);
  for (const f of failures) console.log(" -", f);
  if (failures.length) process.exit(1);
  console.log("M1_VERIFY_PASS");
})().catch((e) => {
  console.error("M1_FATAL", e.message);
  process.exit(1);
});
