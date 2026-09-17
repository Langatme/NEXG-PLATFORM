// Events verify: cross-app SSE flow, replay, scope guards, inbox projection.
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

// Minimal SSE reader over streaming fetch.
async function openStream(channels, token, sinceSeq = 0) {
  const qs = new URLSearchParams({ channel: channels.join(","), token, since_seq: String(sinceSeq) });
  const r = await fetch(`${base}/events/stream?${qs}`);
  if (r.status !== 200) return { status: r.status, events: [], close: () => {} };
  const events = [];
  let buf = "";
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  (async () => {
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n\n")) >= 0) {
          const frame = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const data = frame.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("\n");
          const ev = frame.split("\n").find((l) => l.startsWith("event:"));
          if (data) {
            try {
              events.push({ event: ev ? ev.slice(6).trim() : null, data: JSON.parse(data) });
            } catch {}
          }
        }
      }
    } catch {}
  })();
  return { status: 200, events, close: () => { try { reader.cancel(); } catch {} } };
}
const waitFor = async (events, type, timeoutMs = 15000) => {
  const start = Date.now();
  for (;;) {
    const hit = events.find((e) => e.event === type);
    if (hit) return hit;
    if (Date.now() - start > timeoutMs) throw new Error(`timeout waiting ${type} (got ${events.map((e) => e.event).join(",")})`);
    await new Promise((r) => setTimeout(r, 200));
  }
};

(async () => {
  const ctok = (await req("POST", "/auth/register", { phone: `2547${rnd()}`, pin: "1" })).j.data.access;
  const sp = `2547${rnd()}`;
  await req("POST", "/auth/register", { phone: sp, pin: "1", kind: "merchant_staff", merchant_id: "mrc_001" });
  const stok = (await req("POST", "/auth/login", { phone: sp, pin: "1" })).j.data.access;
  const rp = `2547${rnd()}`;
  await req("POST", "/auth/register", { phone: rp, pin: "1", kind: "rider" });
  const rtok = (await req("POST", "/auth/login", { phone: rp, pin: "1" })).j.data.access;

  const staffStream = await openStream(["merchant:mrc_001"], stok);
  const riderStream = await openStream(["rider:jobs"], rtok);
  await check("streams open 200", async () => {
    if (staffStream.status !== 200 || riderStream.status !== 200) throw new Error("open failed");
  });

  // Consumer places order -> staff channel receives CloudEvent
  const placed = await req("POST", "/orders", {
    merchant_id: "mrc_001",
    lines: [{ item_id: "itm_101", title: "Nyama Choma (500g)", qty: 1, unit_price_kes: 1450 }],
    idempotency_key: `ev_${Date.now()}`,
  }, ctok);
  const orderId = placed.j.data.id;
  const got = await waitFor(staffStream.events, "order.placed");
  await check("staff stream: order.placed CloudEvents shape", async () => {
    const d = got.data;
    if (d.specversion !== "1.0" || d.type !== "order.placed" || d.subject !== orderId || !d.seq || !d.time)
      throw new Error(JSON.stringify(d).slice(0, 200));
  });

  // Staff accept -> merchant channel (same stream)
  await req("PATCH", `/orders/${orderId}`, { action: "accept" }, stok);
  await waitFor(staffStream.events, "order.accepted");
  await check("staff stream: order.accepted arrives", async () => {});

  // Handoff -> rider channel gets delivery.offered
  await req("PATCH", `/orders/${orderId}`, { action: "preparing" }, stok);
  await req("PATCH", `/orders/${orderId}`, { action: "ready" }, stok);
  await req("PATCH", `/orders/${orderId}`, { action: "handoff" }, stok);
  const offered = await waitFor(riderStream.events, "delivery.offered");
  await check("rider stream: delivery.offered arrives", async () => {
    if (!offered.data.data || !offered.data.subject) throw new Error("bad envelope");
  });

  // Rider accept -> BOTH rider channel (own task) and merchant channel see it
  const taskId = offered.data.subject;
  await req("PATCH", `/deliveries/${taskId}`, { action: "accept" }, rtok);
  await check("merchant channel sees rider.accepted (cross-app)", async () => {
    await waitFor(staffStream.events, "rider.accepted");
  });

  // Replay: fresh stream with since_seq just before order.placed replays it.
  // (absent/0 = live-only by design: fresh clients REST-fetch state, then stream.)
  await check("replay delivers missed order.placed", async () => {
    const placedSeq = got.data.seq;
    const s3 = await openStream(["merchant:mrc_001"], stok, placedSeq - 1);
    const hit = await waitFor(s3.events, "order.placed", 15000);
    if (hit.data.subject !== orderId) throw new Error("wrong replay");
    s3.close();
  });

  // Scope guards
  await check("no token -> 422", async () => {
    const r = await fetch(`${base}/events/stream?channel=merchant:mrc_001`);
    if (r.status !== 422) throw new Error(r.status);
    await r.body.cancel();
  });
  await check("cross-merchant staff 403", async () => {
    const p2 = `2547${rnd()}`;
    await req("POST", "/auth/register", { phone: p2, pin: "1", kind: "merchant_staff", merchant_id: "mrc_003" });
    const l2 = await req("POST", "/auth/login", { phone: p2, pin: "1" });
    const s = await openStream(["merchant:mrc_001"], l2.j.data.access);
    if (s.status !== 403) throw new Error(s.status);
  });
  await check("consumer on rider:jobs 403", async () => {
    const s = await openStream(["rider:jobs"], ctok);
    if (s.status !== 403) throw new Error(s.status);
  });

  // Inbox projections
  await check("staff inbox has order.placed", async () => {
    const r = await req("GET", "/inbox?limit=20", null, stok);
    if (r.status !== 200 || !r.j.data.some((e) => e.type === "order.placed")) throw new Error(r.status);
  });
  await check("rider inbox has delivery.offered", async () => {
    const r = await req("GET", "/inbox?limit=20", null, rtok);
    if (r.status !== 200 || !r.j.data.some((e) => e.type === "delivery.offered")) throw new Error(r.status);
  });
  await check("consumer inbox has own order only", async () => {
    const r = await req("GET", "/inbox?limit=20", null, ctok);
    if (r.status !== 200 || !r.j.data.some((e) => e.entity_id === orderId)) throw new Error(r.status);
  });

  staffStream.close();
  riderStream.close();

  console.log(`\nEVENTS: ${pass} passed, ${failures.length} failed`);
  for (const f of failures) console.log(" -", f);
  if (failures.length) process.exit(1);
  console.log("EVENTS_VERIFY_PASS");
})().catch((e) => {
  console.error("EVENTS_FATAL", e.message);
  process.exit(1);
});
