// H-05 verify: property editors (media/amenities/policies) + units CRUD +
// guards (unknown 404, cross-property 403, delete-with-bookings 409) + NCL.
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
async function bootstrapAdmin() {
  const key = process.env.ADMIN_BOOTSTRAP_KEY ?? "nexg-dev-bootstrap";
  const ap = `2549${rnd()}`;
  const reg = await req("POST", "/auth/register", { phone: ap, pin: "1" });
  await fetch(base + "/auth/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-bootstrap-key": key },
    body: JSON.stringify({ person_id: reg.j.data.person_id, kind: "admin" }),
  });
  return (await req("POST", "/auth/login", { phone: ap, pin: "1" })).j.data.access;
}
async function hostToken(merchant) {
  const phone = `2547${rnd()}`;
  await req("POST", "/auth/register", { phone, pin: "1", kind: "host_staff", merchant_id: merchant });
  return (await req("POST", "/auth/login", { phone, pin: "1" })).j.data.access;
}

(async () => {
  const htok = await hostToken("mrc_003");

  await check("property editors: amenities+policies+hero key", async () => {
    const r = await req("PATCH", "/merchants/mrc_003", {
      amenities: ["wifi", "pool"], policies: ["no-smoking"], hero_image_key: "prop/mrc_003/hero.jpg",
    }, htok);
    if (r.status !== 200) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
    if (r.j.data.amenities?.length !== 2 || r.j.data.policies?.length !== 1) throw new Error("patch not persisted");
  });
  await check("property editors: invalid list 422", async () => {
    const r = await req("PATCH", "/merchants/mrc_003", { amenities: "wifi" }, htok);
    if (r.status !== 422) throw new Error(r.status);
  });

  let unitId = null;
  await check("units create -> 201 + NCL unit.added", async () => {
    const r = await req("POST", "/units", { property_id: "mrc_003", name: "Suite 101", unit_type: "suite", capacity: 4, price_kes: 12000 }, htok);
    if (r.status !== 201) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
    unitId = r.j.data.id;
    const atok = await bootstrapAdmin();
    const n = await req("GET", `/ledger/events?entity_id=${unitId}`, null, atok);
    if (!n.j.data.some((e) => e.event_type === "unit.added")) throw new Error("missing unit.added NCL");
  });
  await check("units list scoped", async () => {
    const r = await req("GET", "/units?property=mrc_003", null, htok);
    if (r.status !== 200 || !r.j.data.some((u) => u.id === unitId)) throw new Error(r.status);
  });
  await check("units patch (toggle active + rename)", async () => {
    const r = await req("PATCH", `/units/${unitId}`, { name: "Suite 101A", is_active: false }, htok);
    if (r.status !== 200 || r.j.data.name !== "Suite 101A" || r.j.data.is_active !== false) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
    const r2 = await req("PATCH", `/units/${unitId}`, { is_active: true }, htok);
    if (r2.status !== 200 || r2.j.data.is_active !== true) throw new Error("re-publish failed");
  });
  await check("units unknown 404", async () => {
    const r = await req("PATCH", "/units/unt_missing_zzz", { name: "x" }, htok);
    if (r.status !== 404) throw new Error(r.status);
  });
  await check("units cross-property 403", async () => {
    const other = await hostToken("mrc_005");
    const r = await req("PATCH", `/units/${unitId}`, { name: "hijack" }, other);
    if (r.status !== 403) throw new Error(r.status);
    const r2 = await req("DELETE", `/units/${unitId}`, undefined, other);
    if (r2.status !== 403) throw new Error(`delete ${r2.status}`);
  });
  await check("units delete-with-bookings 409", async () => {
    const ctok = (await req("POST", "/auth/register", { phone: `2547${rnd()}`, pin: "1" })).j.data.access;
    const b = await req("POST", "/bookings", { merchant_id: "mrc_003", unit_id: unitId, idempotency_key: `h5_${Date.now()}` }, ctok);
    if (b.status !== 201) throw new Error(`booking ${b.status} ${JSON.stringify(b.j)}`);
    const r = await req("DELETE", `/units/${unitId}`, undefined, htok);
    if (r.status !== 409) throw new Error(r.status);
  });
  await check("units delete clean 200", async () => {
    const c = await req("POST", "/units", { property_id: "mrc_003", name: "Temp Room" }, htok);
    const r = await req("DELETE", `/units/${c.j.data.id}`, undefined, htok);
    if (r.status !== 200) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
  });

  console.log(`\nH5: ${pass} passed, ${failures.length} failed`);
  for (const f of failures) console.log(" -", f);
  if (failures.length) process.exit(1);
  console.log("H5_VERIFY_PASS");
})().catch((e) => {
  console.error("H5_FATAL", e.message);
  process.exit(1);
});
