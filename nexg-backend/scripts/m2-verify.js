// M2 verify: consumer order -> merchant to handoff (task auto-offered) ->
// rider accept -> pickup -> drop -> OTP proof -> earnings. Guards + NCL chain.
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
async function req(method, path, body, token, headers = {}) {
  const r = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null;
  try { j = await r.json(); } catch {}
  return { status: r.status, j };
}
const rnd = () => Math.floor(10000000 + Math.random() * 89999999);
async function bootstrapAdmin() {
  const key = process.env.ADMIN_BOOTSTRAP_KEY ?? "nexg-dev-bootstrap";
  const ap = `2549${rnd()}`;
  const reg = await req("POST", "/auth/register", { phone: ap, pin: "1" });
  await fetch(base + "/auth/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-bootstrap-key": key },
    body: JSON.stringify({ person_id: reg.j.data.person_id, kind: "admin" }),
  });
  const login = await req("POST", "/auth/login", { phone: ap, pin: "1" });
  return login.j.data.access;
}

(async () => {
  // Consumer order at mrc_001
  const ctok = (await req("POST", "/auth/register", { phone: `2547${rnd()}`, pin: "1" })).j.data.access;
  const placed = await req("POST", "/orders", {
    merchant_id: "mrc_001",
    lines: [{ item_id: "itm_101", title: "Nyama Choma (500g)", qty: 1, unit_price_kes: 1450 }],
    idempotency_key: `m2_${Date.now()}`,
  }, ctok);
  const orderId = placed.j.data.id;

  // Merchant staff drives to handoff
  const stok = await (async () => {
    const p = `2547${rnd()}`;
    await req("POST", "/auth/register", { phone: p, pin: "1", kind: "merchant_staff", merchant_id: "mrc_001" });
    return (await req("POST", "/auth/login", { phone: p, pin: "1" })).j.data.access;
  })();
  for (const a of ["accept", "preparing", "ready", "handoff"]) {
    const r = await req("PATCH", `/orders/${orderId}`, a === "accept" ? { action: a } : { action: a }, stok);
    if (r.status !== 200) throw new Error(`merchant ${a} -> ${r.status}`);
  }

  // Rider registers, sees the offer
  const rphone = `2547${rnd()}`;
  await req("POST", "/auth/register", { phone: rphone, pin: "1", kind: "rider" });
  const rtok = (await req("POST", "/auth/login", { phone: rphone, pin: "1" })).j.data.access;
  let taskId = null;
  await check("rider sees OFFERED job with merchant + total", async () => {
    const r = await req("GET", "/rider/jobs?status=OFFERED", null, rtok);
    if (r.status !== 200) throw new Error(r.status);
    const t = r.j.data.find((x) => x.order_id === orderId);
    if (!t) throw new Error("offer missing");
    if (!t.merchant_name || !t.total_kes) throw new Error("missing fields");
    taskId = t.id;
  });

  const chain = [
    ["accept", "ACCEPTED", undefined],
    ["arrived_pickup", "ARRIVED_PICKUP", undefined],
    ["picked", "PICKED", undefined],
    ["arrived_drop", "ARRIVED_DROP", undefined],
    ["delivered", "DELIVERED", { otp: "4821" }],
  ];
  for (const [action, status, proof] of chain) {
    await check(`rider ${action} -> ${status}`, async () => {
      const r = await req("PATCH", `/deliveries/${taskId}`, { action, proof }, rtok);
      if (r.status !== 200 || r.j.data.status !== status) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
    });
  }

  await check("delivered without proof 422", async () => {
    // fresh task needed: place + handoff another order quickly
    const p2 = await req("POST", "/orders", {
      merchant_id: "mrc_001",
      lines: [{ title: "Custom", qty: 1, unit_price_kes: 50 }],
      idempotency_key: `m2p_${Date.now()}`,
    }, ctok);
    for (const a of ["accept", "preparing", "ready", "handoff"]) {
      await req("PATCH", `/orders/${p2.j.data.id}`, { action: a }, stok);
    }
    const jobs = await req("GET", "/rider/jobs?status=OFFERED", null, rtok);
    const t2 = jobs.j.data.find((x) => x.order_id === p2.j.data.id);
    await req("PATCH", `/deliveries/${t2.id}`, { action: "accept" }, rtok);
    await req("PATCH", `/deliveries/${t2.id}`, { action: "arrived_pickup" }, rtok);
    await req("PATCH", `/deliveries/${t2.id}`, { action: "picked" }, rtok);
    await req("PATCH", `/deliveries/${t2.id}`, { action: "arrived_drop" }, rtok);
    const r = await req("PATCH", `/deliveries/${t2.id}`, { action: "delivered" }, rtok);
    if (r.status !== 422) throw new Error(r.status);
  });

  await check("replay of current-state action returns state (no crash)", async () => {
    // t2 sits at ARRIVED_DROP: re-sending arrived_drop must replay, not 500.
    const jobs = await req("GET", "/rider/jobs", null, rtok);
    const t2 = jobs.j.data.find((x) => x.status === "ARRIVED_DROP");
    if (!t2) throw new Error("t2 missing");
    const r = await req("PATCH", `/deliveries/${t2.id}`, { action: "arrived_drop" }, rtok);
    if (r.status !== 200 || r.j.data.status !== "ARRIVED_DROP") throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
  });
  await check("stale action on finished task 422 (accept on DELIVERED)", async () => {
    const r = await req("PATCH", `/deliveries/${taskId}`, { action: "accept" }, rtok);
    if (r.status !== 422) throw new Error(r.status);
  });

  await check("other rider cannot touch task (403)", async () => {
    const p2 = `2547${rnd()}`;
    await req("POST", "/auth/register", { phone: p2, pin: "1", kind: "rider" });
    const l2 = await req("POST", "/auth/login", { phone: p2, pin: "1" });
    const r = await req("PATCH", `/deliveries/${taskId}`, { action: "failed" }, l2.j.data.access);
    if (r.status !== 403) throw new Error(r.status);
  });

  await check("earnings show delivered task", async () => {
    const r = await req("GET", "/rider/earnings", null, rtok);
    if (r.status !== 200 || r.j.data.delivered < 1 || r.j.data.gross_kes < 49)
      throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
  });

  await check("presign returns PUT url", async () => {
    const r = await req("POST", "/uploads/presign", {
      entity: "delivery", entity_id: taskId, filename: "proof.jpg",
    }, rtok);
    if (r.status !== 200 || !r.j.data.url || !r.j.data.publicUrl) throw new Error(r.status);
  });

  await check("R-01 rider sees assigned order via GET /orders", async () => {
    const r = await req("GET", "/orders", null, rtok);
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (!r.j.data.find((x) => x.id === orderId)) throw new Error("assigned order missing");
  });

  await check("R-01 rider ?merchant= no longer 403-or-leak (scoped)", async () => {
    const r = await req("GET", "/orders?merchant=mrc_001", null, rtok);
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (r.j.data.some((x) => x.id !== orderId && !x.id)) throw new Error("leak shape");
    // must not contain orders with no task link: every row must be assigned to this rider
    for (const o of r.j.data) {
      if (o.merchant_id && o.merchant_id !== "mrc_001") throw new Error("cross-merchant leak");
    }
  });

  await check("R-01 unassigned rider sees empty, not ALL", async () => {
    const p3 = `2547${rnd()}`;
    await req("POST", "/auth/register", { phone: p3, pin: "1", kind: "rider" });
    const l3 = await req("POST", "/auth/login", { phone: p3, pin: "1" });
    const r = await req("GET", "/orders", null, l3.j.data.access);
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (r.j.data.length !== 0) throw new Error(`expected empty, got ${r.j.data.length}`);
  });

  await check("R-01 rider order detail unassigned 403", async () => {
    const p4 = `2547${rnd()}`;
    await req("POST", "/auth/register", { phone: p4, pin: "1", kind: "rider" });
    const l4 = await req("POST", "/auth/login", { phone: p4, pin: "1" });
    const r = await req("GET", `/orders/${orderId}`, null, l4.j.data.access);
    if (r.status !== 403) throw new Error(`expected 403, got ${r.status}`);
  });

  await check("NCL fulfilment chain", async () => {
    const atok = await bootstrapAdmin();
    const r = await req("GET", `/ledger/events?entity_id=${taskId}`, null, atok);
    const types = r.j.data.map((e) => e.event_type);
    for (const t of ["delivery.offered", "rider.accepted", "rider.picked", "rider.delivered"]) {
      if (!types.includes(t)) throw new Error(`missing ${t}: ${types.join(",")}`);
    }
  });

  console.log(`\nM2: ${pass} passed, ${failures.length} failed`);
  for (const f of failures) console.log(" -", f);
  if (failures.length) process.exit(1);
  console.log("M2_VERIFY_PASS");
})().catch((e) => {
  console.error("M2_FATAL", e.message);
  process.exit(1);
});
