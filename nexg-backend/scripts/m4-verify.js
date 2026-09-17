// M4 verify: catalog CRUD + availability + since-poll + MinIO presign roundtrip.
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
  const p = `2547${rnd()}`;
  await req("POST", "/auth/register", { phone: p, pin: "1", kind: "merchant_staff", merchant_id: "mrc_001" });
  const stok = (await req("POST", "/auth/login", { phone: p, pin: "1" })).j.data.access;

  let itemId = null;
  await check("create item 201", async () => {
    const r = await req("POST", "/catalog/items", {
      merchant_id: "mrc_001", name: `M4 Test Item ${Date.now() % 100000}`, price_kes: 999,
    }, stok);
    if (r.status !== 201) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
    itemId = r.j.data.id;
  });
  await check("patch price", async () => {
    const r = await req("PATCH", `/catalog/items/${itemId}`, { price_kes: 1111 }, stok);
    if (r.status !== 200 || r.j.data.price_kes !== 1111) throw new Error(r.status);
  });
  await check("toggle availability off", async () => {
    const r = await req("PATCH", `/catalog/items/${itemId}`, { is_available: false }, stok);
    if (r.status !== 200 || r.j.data.is_available !== false) throw new Error(r.status);
  });
  await check("add variant + addon group", async () => {
    const v = await req("POST", `/catalog/items/${itemId}/variants`, { name: "Large", price_delta_kes: 200 }, stok);
    if (v.status !== 201) throw new Error(v.status);
    const a = await req("POST", `/catalog/items/${itemId}/addons`, {
      name: "Extras", options: [{ id: "x1", label: "Extra", priceKes: 50 }],
    }, stok);
    if (a.status !== 201 || a.j.data.options.length !== 1) throw new Error(a.status);
  });
  await check("delete clean item 200", async () => {
    const r = await req("DELETE", `/catalog/items/${itemId}`, null, stok);
    if (r.status !== 200) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
  });
  await check("delete referenced item 409 (history preserved)", async () => {
    const r = await req("DELETE", "/catalog/items/itm_101", null, stok);
    if (r.status !== 409) throw new Error(r.status);
  });
  await check("cross-merchant create 403", async () => {
    const p2 = `2547${rnd()}`;
    await req("POST", "/auth/register", { phone: p2, pin: "1", kind: "merchant_staff", merchant_id: "mrc_003" });
    const l2 = await req("POST", "/auth/login", { phone: p2, pin: "1" });
    const r = await req("POST", "/catalog/items", { merchant_id: "mrc_001", name: "X", price_kes: 1 }, l2.j.data.access);
    if (r.status !== 403) throw new Error(r.status);
  });
  await check("merchant open toggle", async () => {
    const r = await req("PATCH", "/merchants/mrc_001", { is_open: false }, stok);
    if (r.status !== 200 || r.j.data.is_open !== false) throw new Error(r.status);
    const back = await req("PATCH", "/merchants/mrc_001", { is_open: true }, stok);
    if (back.status !== 200) throw new Error(back.status);
  });
  await check("since-poll params accepted", async () => {
    const since = new Date(Date.now() - 864e5).toISOString();
    for (const path of [
      `/orders?merchant=mrc_001&since=${encodeURIComponent(since)}`,
      `/bookings?merchant=mrc_001&since=${encodeURIComponent(since)}`,
    ]) {
      const r = await req("GET", path, null, stok);
      if (r.status !== 200 || !Array.isArray(r.j.data)) throw new Error(`${path} ${r.status}`);
    }
  });
  await check("MinIO presign PUT roundtrip", async () => {
    const r = await req("POST", "/uploads/presign", {
      entity: "delivery", entity_id: "m4probe", filename: "probe.bin", content_type: "application/octet-stream",
    }, stok);
    if (r.status !== 200 || !r.j.data.url) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
    const put = await fetch(r.j.data.url, { method: "PUT", body: "m4-proof-bytes", headers: { "Content-Type": "application/octet-stream" } });
    if (!put.ok) throw new Error(`PUT ${put.status}`);
    const get = await fetch(r.j.data.publicUrl, { method: "GET" });
    if (!get.ok) throw new Error(`GET ${get.status}`);
    const text = await get.text();
    if (text !== "m4-proof-bytes") throw new Error("roundtrip mismatch");
  });

  console.log(`\nM4: ${pass} passed, ${failures.length} failed`);
  for (const f of failures) console.log(" -", f);
  if (failures.length) process.exit(1);
  console.log("M4_VERIFY_PASS");
})().catch((e) => {
  console.error("M4_FATAL", e.message);
  process.exit(1);
});
