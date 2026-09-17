const base = "http://localhost:3000";
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
  const t = (n) => console.log("STEP", n);
  const phone = `2547${Math.floor(10000000 + Math.random() * 89999999)}`;
  t("register-consumer");
  console.log(JSON.stringify(await req("POST", "/auth/register", { phone, pin: "1234" })));
  t("register-staff");
  console.log(JSON.stringify(await req("POST", "/auth/register", { phone: `2547${Math.floor(10000000 + Math.random() * 89999999)}`, pin: "1234", kind: "merchant_staff", merchant_id: "mrc_001" })).slice(0, 200));
  t("done");
})().catch((e) => console.log("FATAL", e.message));
