const base = "http://localhost:3000";
async function req(method, path, body, token) {
  const t = Date.now();
  const r = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const ms = Date.now() - t;
  if (!r.ok) return { ms, status: r.status, err: true };
  return { ms, status: r.status, data: await r.json() };
}
const show = (label, r, extra = "") => console.log(label, `ms=${r.ms}`, `status=${r.status}`, extra);
(async () => {
  const p = () => `2547${Math.floor(10000000 + Math.random() * 89999999)}`;
  const _consumer = (await req("POST", "/auth/register", { phone: p(), pin: "1" })).data?.data ?? {};
  const sp = p();
  await req("POST", "/auth/register", { phone: sp, pin: "1", kind: "merchant_staff", merchant_id: "mrc_001" });
  const staff = await req("POST", "/auth/login", { phone: sp, pin: "1" });
  const ap = `2549${Math.floor(10000000 + Math.random() * 89999999)}`;
  const areg = await req("POST", "/auth/register", { phone: ap, pin: "1" });
  await fetch(base + "/auth/accounts", { method: "POST", headers: { "Content-Type": "application/json", "x-bootstrap-key": "nexg-dev-bootstrap" }, body: JSON.stringify({ person_id: areg.data?.data?.person_id ?? areg.data?.person_id, kind: "admin" }) });
  const admin = await req("POST", "/auth/login", { phone: ap, pin: "1" });
  const TOK = { staff: staff.data?.data?.access ?? staff.data?.access, admin: admin.data?.data?.access ?? admin.data?.access };

  show("GET /search?q=pizza", await req("GET", "/search?q=pizza"));
  show("GET /search?q=spa", await req("GET", "/search?q=spa"));
  show("POST /admin/search", await req("POST", "/admin/search", { query: "pizza", limit: 5 }, TOK.admin));
  show("GET /merchants", await req("GET", "/merchants"));
  show("GET /discovery/home", await req("GET", "/discovery/home?category=restaurants-food&q=pizza"));
  show("GET /catalog/items?merchant", await req("GET", "/catalog/items?merchant=mrc_001"));
  show("POST /catalog/items", await req("POST", "/catalog/items", { merchant_id: "mrc_001", name: "Diag item", price_kes: 500 }, TOK.staff));
  const t0 = Date.now();
  const burst = await Promise.all(Array.from({ length: 20 }, () => req("GET", "/merchants")));
  const lats = burst.map((r) => r.ms).sort((a, b) => a - b);
  console.log(`BURST x20 /merchants total=${Date.now() - t0}ms p50=${lats[10]} max=${lats[19]} err=${burst.filter((r) => r.err).length}`);
  const docs = await req("GET", "/ledger/events?limit=5", null, TOK.admin);
  show("GET /ledger/events", docs);
})().catch((e) => { console.error("DIAG_FAIL", e.message); process.exit(1); });
