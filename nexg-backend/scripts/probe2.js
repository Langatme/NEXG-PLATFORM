const base = "http://localhost:3000";
const rnd = () => Math.floor(10000000 + Math.random() * 89999999);
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
(async () => {
  const ctok = (await req("POST", "/auth/register", { phone: `2547${rnd()}`, pin: "1" })).j.data.access;
  const sp = `2547${rnd()}`;
  console.log("staff reg:", (await req("POST", "/auth/register", { phone: sp, pin: "1", kind: "merchant_staff", merchant_id: "mrc_001" })).status);
  const slogin = await req("POST", "/auth/login", { phone: sp, pin: "1" });
  console.log("staff login:", slogin.status);
  const stok = slogin.j.data.access;
  const placed = await req("POST", "/orders", {
    merchant_id: "mrc_001",
    lines: [{ item_id: "itm_101", title: "Nyama Choma (500g)", qty: 1, unit_price_kes: 1450 }],
    idempotency_key: `evdbg_${Date.now()}`,
  }, ctok);
  console.log("place:", placed.status, placed.j.data.id);
  const a = await req("PATCH", `/orders/${placed.j.data.id}`, { action: "accept" }, stok);
  console.log("accept:", a.status, JSON.stringify(a.j).slice(0, 200));
  const ncl = await req("GET", `/ledger/events?entity_id=${placed.j.data.id}`, null, stok);
  console.log("ledger as staff:", ncl.status);
})().catch((e) => console.log("FATAL", e.message));
