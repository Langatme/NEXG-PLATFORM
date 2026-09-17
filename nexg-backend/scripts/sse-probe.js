const base = "http://localhost:3000";
async function req(method, path, body, token) {
  const r = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null;
  try { j = await r.json(); } catch {}
  if (r.status >= 400) throw new Error(`${method} ${path} -> ${r.status} ${JSON.stringify(j).slice(0, 150)}`);
  return j.data;
}
(async () => {
  const stok = (await req("POST", "/auth/register", { phone: `2547${Math.floor(10000000 + Math.random() * 89999999)}`, pin: "1", kind: "merchant_staff", merchant_id: "mrc_001" })).access;
  const ctok = (await req("POST", "/auth/register", { phone: `2547${Math.floor(10000000 + Math.random() * 89999999)}`, pin: "1" })).access;
  for (let round = 1; round <= 3; round++) {
    const ctrl = new AbortController();
    const seen = [];
    const qs = new URLSearchParams({ channel: "merchant:mrc_001", token: stok });
    const streamP = fetch(`${base}/events/stream?${qs}`, { signal: ctrl.signal }).then(async (r) => {
      if (r.status !== 200) throw new Error(`stream open ${r.status}`);
      const rd = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      const start = Date.now();
      for (;;) {
        const { done, value } = await rd.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const f = buf.slice(0, i);
          buf = buf.slice(i + 2);
          const ev = f.split("\n").find((l) => l.startsWith("event:"));
          if (ev) seen.push(ev.slice(6).trim());
          if (seen.includes("order.placed")) {
            ctrl.abort();
            return Date.now() - placedAt;
          }
        }
        if (Date.now() - start > 12000) throw new Error(`timeout (seen: ${seen.join(",")})`);
      }
      throw new Error("closed");
    });
    await new Promise((r) => setTimeout(r, 400));
    var placedAt = Date.now();
    await req("POST", "/orders", {
      merchant_id: "mrc_001",
      lines: [{ title: "SSE probe", qty: 1, unit_price_kes: 10 }],
      idempotency_key: `sse${round}_${Date.now()}`,
    }, ctok);
    try {
      console.log(`round ${round}: event in ${await streamP}ms`);
    } catch (e) {
      console.log(`round ${round}: FAIL ${e.message}`);
    }
    try { ctrl.abort(); } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
})().catch((e) => console.log("FATAL", e.message));
