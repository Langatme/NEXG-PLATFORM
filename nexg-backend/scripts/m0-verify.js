// M0 verify: role auth, scopes, refresh, price truth, reads, locked admin search.
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
  try {
    j = await r.json();
  } catch {}
  return { status: r.status, j };
}
const rnd = () => Math.floor(10000000 + Math.random() * 89999999);

(async () => {
  const phone = `2547${rnd()}`;
  const reg = await req("POST", "/auth/register", { phone, pin: "1234" });
  await check("consumer register 201", async () => {
    if (reg.status !== 201) throw new Error(reg.status);
  });
  const consumerToken = reg.j.data.access;

  // Staff register anchored to merchant
  const sphone = `2547${rnd()}`;
  const staff = await req("POST", "/auth/register", {
    phone: sphone, pin: "1234", kind: "merchant_staff", merchant_id: "mrc_001",
  });
  await check("staff register 201 + scope", async () => {
    if (staff.status !== 201) throw new Error(staff.status + " " + JSON.stringify(staff.j));
  });
  const staffToken = staff.j.data.access;

  await check("owner kind rejected for self-register", async () => {
    const r = await req("POST", "/auth/register", { phone: `2547${rnd()}`, pin: "1", kind: "merchant_owner" });
    if (r.status !== 422) throw new Error(r.status);
  });
  await check("staff without merchant rejected", async () => {
    const r = await req("POST", "/auth/register", { phone: `2547${rnd()}`, pin: "1", kind: "merchant_staff" });
    if (r.status !== 422) throw new Error(r.status);
  });
  await check("rider registers without merchant", async () => {
    const r = await req("POST", "/auth/register", { phone: `2547${rnd()}`, pin: "1", kind: "rider" });
    if (r.status !== 201) throw new Error(r.status);
  });

  // Refresh rotation
  const ref = await req("POST", "/auth/refresh", { refresh: reg.j.data.refresh });
  await check("refresh 200 + new access", async () => {
    if (ref.status !== 200 || !ref.j.data.access) throw new Error(ref.status);
  });
  await check("refresh token rejected as access", async () => {
    const r = await req("GET", "/orders?mine=1", null, reg.j.data.refresh);
    if (r.status !== 401) throw new Error(r.status);
  });

  // Order with correct price (itm_101 = 1450)
  const order = await req("POST", "/orders", {
    merchant_id: "mrc_001",
    lines: [{ item_id: "itm_101", title: "Nyama Choma (500g)", qty: 1, unit_price_kes: 1450 }],
    idempotency_key: `m0_${Date.now()}`,
  }, consumerToken);
  await check("order 201 server math", async () => {
    if (order.status !== 201) throw new Error(order.status + " " + JSON.stringify(order.j));
    if (order.j.data.subtotal_kes !== 1450 || order.j.data.total_kes !== 1499) throw new Error(JSON.stringify(order.j.data));
  });
  const orderId = order.j.data.id;
  await check("order id collision-safe format", async () => {
    if (!/^ord_[a-z0-9]+_[a-z0-9]{6}$/.test(orderId)) throw new Error(orderId);
  });

  // Stale price rejected
  await check("stale price 422", async () => {
    const r = await req("POST", "/orders", {
      merchant_id: "mrc_001",
      lines: [{ item_id: "itm_101", title: "X", qty: 1, unit_price_kes: 1 }],
      idempotency_key: `m0stale_${Date.now()}`,
    }, consumerToken);
    if (r.status !== 422 || r.j.error !== "stale_price") throw new Error(r.status + " " + JSON.stringify(r.j));
  });

  // Reads: consumer own order
  await check("consumer reads own order", async () => {
    const r = await req("GET", `/orders/${orderId}`, null, consumerToken);
    if (r.status !== 200 || !r.j.data.lines?.length) throw new Error(r.status);
  });
  await check("consumer order list mine=1", async () => {
    const r = await req("GET", "/orders?mine=1", null, consumerToken);
    if (r.status !== 200 || !r.j.data.length) throw new Error(r.status);
  });
  // Staff reads own merchant's orders
  await check("staff reads own merchant orders", async () => {
    const r = await req("GET", "/orders?merchant=mrc_001", null, staffToken);
    if (r.status !== 200 || !r.j.data.length) throw new Error(r.status + " " + JSON.stringify(r.j));
  });
  // Cross-merchant forbidden
  await check("staff cross-merchant order list 403", async () => {
    const r = await req("GET", "/orders?merchant=mrc_003", null, staffToken);
    if (r.status !== 403) throw new Error(r.status);
  });
  await check("staff cross-merchant order detail 403", async () => {
    const other = await req("POST", "/orders", {
      merchant_id: "mrc_003",
      lines: [{ title: "Custom", qty: 1, unit_price_kes: 100 }],
      idempotency_key: `m0x_${Date.now()}`,
    }, consumerToken);
    const r = await req("GET", `/orders/${other.j.data.id}`, null, staffToken);
    if (r.status !== 403) throw new Error(r.status);
  });
  // Second consumer cannot read first consumer's order
  await check("consumer cross-account 403", async () => {
    const p2 = `2547${rnd()}`;
    const r2 = await req("POST", "/auth/register", { phone: p2, pin: "1" });
    const r = await req("GET", `/orders/${orderId}`, null, r2.j.data.access);
    if (r.status !== 403) throw new Error(r.status);
  });

  // Bookings: create + scoped reads
  const booking = await req("POST", "/bookings", {
    merchant_id: "mrc_003", scheduled_for: new Date(Date.now() + 864e5).toISOString(), guests: 2,
    idempotency_key: `m0b_${Date.now()}`,
  }, consumerToken);
  await check("booking 201 new id format", async () => {
    if (booking.status !== 201 || !booking.j.data.id.startsWith('bkg_')) throw new Error(booking.status);
  });
  await check("consumer reads own booking", async () => {
    const r = await req("GET", `/bookings/${booking.j.data.id}`, null, consumerToken);
    if (r.status !== 200) throw new Error(r.status);
  });

  // Admin search locked
  await check("admin search unauthenticated 401", async () => {
    const r = await req("POST", "/admin/search", { query: "x" });
    if (r.status !== 401) throw new Error(r.status);
  });
  await check("admin search consumer 403", async () => {
    const r = await req("POST", "/admin/search", { query: "x" }, consumerToken);
    if (r.status !== 403) throw new Error(r.status);
  });

  console.log(`\nM0: ${pass} passed, ${failures.length} failed`);
  for (const f of failures) console.log(" -", f);
  if (failures.length) process.exit(1);
  console.log("M0_VERIFY_PASS");
})().catch((e) => {
  console.error("M0_FATAL", e.message);
  process.exit(1);
});
