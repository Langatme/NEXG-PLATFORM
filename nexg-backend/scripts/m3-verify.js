// M3 verify: consumer books -> host modify -> checkin -> service request lifecycle ->
// checkout -> guards (consumer checkin 403, cross-merchant 403, illegal 422, replay) -> NCL.
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

(async () => {
  const ctok = (await req("POST", "/auth/register", { phone: `2547${rnd()}`, pin: "1" })).j.data.access;
  const created = await req("POST", "/bookings", {
    merchant_id: "mrc_003",
    scheduled_for: new Date(Date.now() + 864e5).toISOString(),
    guests: 2,
    idempotency_key: `m3_${Date.now()}`,
  }, ctok);
  const bookingId = created.j.data.id;

  const hphone = `2547${rnd()}`;
  await req("POST", "/auth/register", { phone: hphone, pin: "1", kind: "host_staff", merchant_id: "mrc_003" });
  const htok = (await req("POST", "/auth/login", { phone: hphone, pin: "1" })).j.data.access;
  await check("staff token scoped to mrc_003", async () => {
    const payload = JSON.parse(Buffer.from(htok.split(".")[1], "base64").toString());
    if (payload.merchant_id !== "mrc_003") throw new Error("no scope");
  });

  await check("calendar lists booking", async () => {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 7 * 864e5).toISOString();
    const r = await req("GET", `/bookings?merchant=mrc_003&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, null, htok);
    if (r.status !== 200 || !r.j.data.some((b) => b.id === bookingId)) throw new Error(r.status);
  });

  await check("modify guests", async () => {
    const r = await req("PATCH", `/bookings/${bookingId}`, { action: "modify", guests: 3 }, htok);
    if (r.status !== 200 || r.j.data.guests !== 3) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
  });
  await check("checkin -> CHECKED_IN", async () => {
    const r = await req("PATCH", `/bookings/${bookingId}`, { action: "checkin" }, htok);
    if (r.status !== 200 || r.j.data.status !== "CHECKED_IN") throw new Error(r.status);
  });

  // Service request lifecycle on the stay
  let reqId = null;
  await check("consumer raises request on own booking", async () => {
    const r = await req("POST", "/requests", {
      merchant_id: "mrc_003", booking_id: bookingId, kind: "housekeeping", title: "Extra towels",
    }, ctok);
    if (r.status !== 201) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
    reqId = r.j.data.id;
  });
  for (const [action, status] of [["assign", "ASSIGNED"], ["start", "IN_PROGRESS"], ["inspect", "INSPECTED"], ["verify", "COMPLETED"]]) {
    await check(`request ${action} -> ${status}`, async () => {
      const r = await req("PATCH", `/requests/${reqId}`, { action, assignee: action === "assign" ? "Mary" : undefined }, htok);
      if (r.status !== 200 || r.j.data.status !== status) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
    });
  }

  await check("checkout -> COMPLETED", async () => {
    const r = await req("PATCH", `/bookings/${bookingId}`, { action: "checkout" }, htok);
    if (r.status !== 200 || r.j.data.status !== "COMPLETED") throw new Error(r.status);
  });

  // Guards
  await check("consumer checkin 403", async () => {
    const b2 = await req("POST", "/bookings", { merchant_id: "mrc_003", idempotency_key: `m3g_${Date.now()}` }, ctok);
    const r = await req("PATCH", `/bookings/${b2.j.data.id}`, { action: "checkin" }, ctok);
    if (r.status !== 403) throw new Error(r.status);
  });
  await check("consumer cancels own booking", async () => {
    const b3 = await req("POST", "/bookings", { merchant_id: "mrc_003", idempotency_key: `m3c_${Date.now()}` }, ctok);
    const r = await req("PATCH", `/bookings/${b3.j.data.id}`, { action: "cancel", reason: "change of plans" }, ctok);
    if (r.status !== 200 || r.j.data.status !== "CANCELLED") throw new Error(r.status);
  });
  await check("illegal transition 422 (checkout on CONFIRMED)", async () => {
    const b4 = await req("POST", "/bookings", { merchant_id: "mrc_003", idempotency_key: `m3i_${Date.now()}` }, ctok);
    const r = await req("PATCH", `/bookings/${b4.j.data.id}`, { action: "checkout" }, htok);
    if (r.status !== 422) throw new Error(r.status);
  });
  await check("cross-merchant 403", async () => {
    const p2 = `2547${rnd()}`;
    await req("POST", "/auth/register", { phone: p2, pin: "1", kind: "host_staff", merchant_id: "mrc_005" });
    const l2 = await req("POST", "/auth/login", { phone: p2, pin: "1" });
    const r = await req("PATCH", `/bookings/${bookingId}`, { action: "cancel", reason: "x" }, l2.j.data.access);
    if (r.status !== 403) throw new Error(r.status);
  });
  await check("replay checkin returns state", async () => {
    const r = await req("PATCH", `/bookings/${bookingId}`, { action: "checkin" }, htok);
    // booking is COMPLETED now: not a replay of checkin -> must be 422, not 500
    if (r.status !== 422) throw new Error(r.status);
  });

  await check("NCL stay chain", async () => {
    const atok = await bootstrapAdmin();
    const r = await req("GET", `/ledger/events?entity_id=${bookingId}`, null, atok);
    const types = r.j.data.map((e) => e.event_type);
    for (const t of ["booking.confirmed", "booking.modified", "stay.checked_in", "stay.checked_out"]) {
      if (!types.includes(t)) throw new Error(`missing ${t}: ${types.join(",")}`);
    }
  });

  console.log(`\nM3: ${pass} passed, ${failures.length} failed`);
  for (const f of failures) console.log(" -", f);
  if (failures.length) process.exit(1);
  console.log("M3_VERIFY_PASS");
})().catch((e) => {
  console.error("M3_FATAL", e.message);
  process.exit(1);
});
