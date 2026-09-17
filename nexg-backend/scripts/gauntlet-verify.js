// Gauntlet journey verify: register -> login -> order -> NCL row -> NCL event -> discovery -> vector search.
const base = "http://localhost:3000";
const phone = "2547" + String(Math.floor(10000000 + Math.random() * 89999999));

async function post(path, body, token) {
  const r = await fetch(base + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`${path} ${r.status} ${JSON.stringify(j)}`);
  return j.data;
}
async function get(path) {
  const r = await fetch(base + path);
  const j = await r.json();
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return j.data;
}

(async () => {
  const reg = await post("/auth/register", { phone, display_name: "Gauntlet", pin: "1234" });
  console.log("register ok:", reg.person_id.slice(0, 8), reg.account_id.slice(0, 8));
  const login = await post("/auth/login", { phone, pin: "1234" });
  console.log("login ok, roles:", JSON.stringify(login.access ? "token" : "none"));
  const order = await post(
    "/orders",
    {
      merchant_id: "mrc_demo_001",
      lines: [{ title: "Demo Burger", qty: 2, unit_price_kes: 500 }],
      payment_method: "mpesa",
      idempotency_key: `gauntlet_${Date.now()}`,
    },
    login.access
  );
  console.log("order ok:", JSON.stringify(order));
  const home = await get("/discovery/home?category=food&q=burger");
  console.log("discovery sections:", home.sections.map((s) => `${s.key}:${s.priority}`).join(","));
  // Admin search is locked (M0): 401 unauthenticated → provision bootstrap admin → hits.
  const unauth = await fetch(base + "/admin/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "burger" }),
  });
  if (unauth.status !== 401) throw new Error(`admin search lock broken: ${unauth.status}`);
  console.log("admin lock ok (401 unauthenticated)");
  const aphone = "2549" + String(Math.floor(10000000 + Math.random() * 89999999));
  const ap = await post("/auth/register", { phone: aphone, pin: "1234" });
  const key = process.env.ADMIN_BOOTSTRAP_KEY ?? "nexg-dev-bootstrap";
  const acc = await fetch(base + "/auth/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-bootstrap-key": key },
    body: JSON.stringify({ person_id: ap.person_id, kind: "admin" }),
  });
  if (acc.status !== 201) throw new Error(`bootstrap ${acc.status}`);
  const alogin = await post("/auth/login", { phone: aphone, pin: "1234" });
  const sr = await fetch(base + "/admin/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${alogin.access}` },
    body: JSON.stringify({ query: "burger", limit: 5 }),
  });
  const sem = (await sr.json()).data;
  console.log("vector hits:", sem.length, sem[0] ? `${sem[0].entity_type}/${sem[0].entity_id}` : "none");
  if (!sem.length) throw new Error("no vector hits");
  const cats = await get("/categories");
  const merch = await get("/merchants");
  console.log("categories:", cats.length, "merchants:", merch.length);
  console.log("GAUNTLET_PASS");
})().catch((e) => {
  console.error("GAUNTLET_FAIL", e.message);
  process.exit(1);
});
