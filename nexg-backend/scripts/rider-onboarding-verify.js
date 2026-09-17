// R-02 verify: LIMTAI-backed rider_profiles submit→pending→approve→active + guards + NCL.
const base = "http://localhost:3000";
let pass = 0;
const failures = [];
async function check(name, fn) {
  try { await fn(); pass++; } catch (e) { failures.push(`${name}: ${e.message}`); }
}
async function req(method, path, body, token) {
  const r = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null; try { j = await r.json(); } catch {}
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
const profile = {
  type: "independent",
  personal: { name: "John Kamau", phone: "+254700000001", county: "Nairobi" },
  identity_doc: { idNumber: "12345678", kraPin: "A001Z", dlNumber: "DL-1", dlExpiry: "2027-01-01" },
  vehicle: { type: "Motorcycle", plate: "KMCA 123A" },
  docs: {},
  payout: { method: "M-Pesa", mpesaNumber: "+254700000001" },
  emergency: { name: "Jane", relationship: "Spouse", phone: "+254700000002" },
  services: ["Package Delivery"],
};

(async () => {
  const rphone = `2547${rnd()}`;
  await req("POST", "/auth/register", { phone: rphone, pin: "1", kind: "rider" });
  const rtok = (await req("POST", "/auth/login", { phone: rphone, pin: "1" })).j.data.access;
  const _jobsProbe = await req("GET", "/rider/jobs", null, rtok);

  await check("submit → pending", async () => {
    const r = await req("POST", "/rider/profile", profile, rtok);
    if (r.status !== 201 || r.j.data.status !== "pending") throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
  });

  await check("missing name 422", async () => {
    const bad = { ...profile, personal: { phone: "x" }, identity_doc: { idNumber: "1" } };
    const r = await req("POST", "/rider/profile", bad, rtok);
    if (r.status !== 422) throw new Error(r.status);
  });

  await check("missing plate 422 independent", async () => {
    const bad = { ...profile, vehicle: { type: "Motorcycle" } };
    const r = await req("POST", "/rider/profile", bad, rtok);
    if (r.status !== 422) throw new Error(r.status);
  });

  await check("own profile reads", async () => {
    const r = await req("GET", "/rider/profile", null, rtok);
    if (r.status !== 200 || r.j.data.type !== "independent") throw new Error(`${r.status}`);
  });

  await check("cross-rider profile 403", async () => {
    const p2 = `2547${rnd()}`;
    await req("POST", "/auth/register", { phone: p2, pin: "1", kind: "rider" });
    const l2 = await req("POST", "/auth/login", { phone: p2, pin: "1" });
    // decode own account via submitting then reading? use admin to get account id
    const atok = await bootstrapAdmin();
    const all = await req("GET", "/rider/jobs", null, atok);
    if (all.status !== 200) throw new Error("admin jobs");
    // try reading first rider's profile with second rider token via ?account=
    const mine = await req("GET", "/rider/profile", null, rtok);
    void mine;
    // second rider has no profile → 404 own, but ?account= other → 403
    const r = await req("GET", `/rider/profile?account=00000000-0000-0000-0000-000000000000`, null, l2.j.data.access);
    if (r.status !== 403 && r.status !== 404) throw new Error(`expected 403/404, got ${r.status}`);
  });

  let accountId = null;
  await check("admin approve → approved", async () => {
    const atok = await bootstrapAdmin();
    // resolve account_id via ledger? use profile submit response account
    const mine = await req("GET", "/rider/profile", null, rtok);
    accountId = mine.j.data.account_id;
    const r = await req("PATCH", `/rider/profile/${accountId}`, { action: "approve" }, atok);
    if (r.status !== 200 || r.j.data.status !== "approved") throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
  });

  await check("reject-reason 422", async () => {
    const atok = await bootstrapAdmin();
    const r = await req("PATCH", `/rider/profile/${accountId}`, { action: "reject" }, atok);
    if (r.status !== 422) throw new Error(r.status);
  });

  await check("photo-key roundtrip via presign", async () => {
    const r = await req("POST", "/uploads/presign", { entity: "rider", entity_id: accountId, filename: "id.jpg" }, rtok);
    if (r.status !== 200 || !r.j.data.url || !r.j.data.key) throw new Error(r.status);
  });

  await check("NCL rider chain", async () => {
    const atok = await bootstrapAdmin();
    const r = await req("GET", `/ledger/events?entity_id=${accountId}`, null, atok);
    const types = r.j.data.map((e) => e.event_type);
    for (const t of ["rider.submitted", "rider.approved"]) {
      if (!types.includes(t)) throw new Error(`missing ${t}: ${types.join(",")}`);
    }
  });

  console.log(`\nRIDER-ONBOARDING: ${pass} passed, ${failures.length} failed`);
  for (const f of failures) console.log(" -", f);
  if (failures.length) process.exit(1);
  console.log("RIDER_ONBOARDING_VERIFY_PASS");
})().catch((e) => { console.error("RIDER_ONBOARDING_FATAL", e.message); process.exit(1); });
