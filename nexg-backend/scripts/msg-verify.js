// MSG verify: single shared messaging system — consumer↔staff over one table,
// one NCL message.sent fan-out, read by notifications/inbox/threads in every app.
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
  // Consumer places an order at mrc_001
  const cphone = `2547${rnd()}`;
  const creg = await req("POST", "/auth/register", { phone: cphone, pin: "1234" });
  const ctok = creg.j.data.access;
  const placed = await req("POST", "/orders", {
    merchant_id: "mrc_001",
    lines: [{ item_id: "itm_101", title: "Nyama Choma (500g)", qty: 1, unit_price_kes: 1450 }],
    idempotency_key: `msg_${Date.now()}`,
  }, ctok);
  const orderId = placed.j.data.id;

  // Staff at mrc_001
  const sphone = `2547${rnd()}`;
  await req("POST", "/auth/register", { phone: sphone, pin: "1234", kind: "merchant_staff", merchant_id: "mrc_001" });
  const slogin = await req("POST", "/auth/login", { phone: sphone, pin: "1234" });
  const stok = slogin.j.data.access;

  // 1. Consumer contacts merchant about the order (order thread)
  let mid1 = null;
  await check("consumer posts to order thread 201", async () => {
    const r = await req("POST", "/messages", {
      entity_type: "order", entity_id: orderId, recipient_role: "merchant_staff",
      body: "Is my choma spicy?",
    }, ctok);
    if (r.status !== 201 || !r.j.data.id) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
    mid1 = r.j.data.id;
    if (r.j.data.thread_key !== `order:${orderId}`) throw new Error(`thread ${r.j.data.thread_key}`);
  });

  // 2. Staff reads the thread via merchant scope
  await check("staff reads order thread", async () => {
    const r = await req("GET", `/messages?thread_key=order:${orderId}`, null, stok);
    if (r.status !== 200 || !r.j.data.some((m) => m.id === mid1)) throw new Error(`${r.status} ${JSON.stringify(r.j)?.slice(0, 200)}`);
  });

  // 3. Staff replies, consumer reads both
  await check("staff replies, consumer reads both", async () => {
    const w = await req("POST", "/messages", {
      entity_type: "order", entity_id: orderId, body: "Medium spice, 10 min.",
    }, stok);
    if (w.status !== 201) throw new Error(w.status);
    const r = await req("GET", `/messages?thread_key=order:${orderId}`, null, ctok);
    if (r.status !== 200 || r.j.data.length < 2) throw new Error(`${r.status} len=${r.j?.data?.length}`);
  });

  // 4. Per-consumer merchant contact thread
  await check("merchant contact thread isolated per consumer", async () => {
    const r = await req("POST", "/messages", {
      merchant_id: "mrc_001", recipient_role: "merchant_staff", body: "Do you cater events?",
    }, ctok);
    if (r.status !== 201) throw new Error(`${r.status} ${JSON.stringify(r.j)}`);
    if (!r.j.data.thread_key.endsWith(creg.j.data.account_id)) throw new Error(`thread ${r.j.data.thread_key}`);
    const other = `2547${rnd()}`;
    const oreg = await req("POST", "/auth/register", { phone: other, pin: "1234" });
    const mine = await req("GET", "/messages/threads", null, oreg.j.data.access);
    if (mine.status !== 200 || (mine.j.data ?? []).some((t) => t.thread_key === r.j.data.thread_key))
      throw new Error("cross-consumer thread leak");
  });

  // 5. Guards
  await check("empty body 422", async () => {
    const r = await req("POST", "/messages", { entity_type: "order", entity_id: orderId, body: "  " }, ctok);
    if (r.status !== 422) throw new Error(r.status);
  });
  await check("cross-merchant staff 403", async () => {
    const p2 = `2547${rnd()}`;
    await req("POST", "/auth/register", { phone: p2, pin: "1", kind: "merchant_staff", merchant_id: "mrc_003" });
    const l2 = await req("POST", "/auth/login", { phone: p2, pin: "1" });
    const r = await req("GET", `/messages?thread_key=order:${orderId}`, null, l2.j.data.access);
    if (r.status !== 403) throw new Error(r.status);
  });

  // 6. NCL fan-out + inbox (the single system every surface reads)
  await check("NCL message.sent exists with routing keys", async () => {
    const key = process.env.ADMIN_BOOTSTRAP_KEY ?? "nexg-dev-bootstrap";
    const ap = `2549${rnd()}`;
    const reg = await req("POST", "/auth/register", { phone: ap, pin: "1" });
    await fetch(base + "/auth/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bootstrap-key": key },
      body: JSON.stringify({ person_id: reg.j.data.person_id, kind: "admin" }),
    });
    const login = await req("POST", "/auth/login", { phone: ap, pin: "1" });
    const r = await req("GET", `/ledger/events?entity_id=${mid1}`, null, login.j.data.access);
    const ev = (r.j.data ?? []).find((e) => e.event_type === "message.sent");
    if (!ev) throw new Error("no message.sent in ledger");
    if (ev.new_state?.thread_key !== `order:${orderId}`) throw new Error("missing routing keys");
  });
  await check("consumer inbox carries message.sent", async () => {
    const r = await req("GET", "/inbox?limit=30", null, ctok);
    if (r.status !== 200 || !r.j.data.some((e) => e.type === "message.sent")) throw new Error(r.status);
  });
  await check("threads list shows order thread", async () => {
    const r = await req("GET", "/messages/threads", null, ctok);
    if (r.status !== 200 || !r.j.data.some((t) => t.thread_key === `order:${orderId}`)) throw new Error(r.status);
  });

  console.log(`\nMSG: ${pass} passed, ${failures.length} failed`);
  for (const f of failures) console.log(" -", f);
  if (failures.length) process.exit(1);
  console.log("MSG_VERIFY_PASS");
})().catch((e) => {
  console.error("MSG_FATAL", e.message);
  process.exit(1);
});
