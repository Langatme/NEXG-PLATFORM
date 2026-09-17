// Consumer click-through QA: every path in the Backend Prompt §42 matrix must resolve.
// Home→category→item · Home→restaurant→menu→item→addons · Explore→category→merchant→item
// Search→suggestion→merchant→item · Popular→result · Recent→result (data layer for all).
const base = "http://localhost:3000";
let pass = 0;
let fail = 0;
const failures = [];

async function get(path) {
  const r = await fetch(base + path);
  if (!r.ok) throw new Error(`${path} -> ${r.status}`);
  return (await r.json()).data;
}
async function check(name, fn) {
  try {
    await fn();
    pass++;
  } catch (e) {
    fail++;
    failures.push(`${name}: ${e.message}`);
  }
}
const need = (obj, fields, ctx) => {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null) throw new Error(`${ctx} missing ${f}`);
  }
};

(async () => {
  // Categories + subcategories (rails)
  const cats = await get("/categories");
  await check(`categories>=21 (got ${cats.length})`, async () => {
    if (cats.length < 21) throw new Error("too few");
  });
  for (const c of cats) {
    await check(`category ${c.id} detail+subs`, async () => {
      const d = await get(`/categories/${c.id}`);
      if (!Array.isArray(d.subcategories) || !d.subcategories.length) throw new Error("no subs");
      need(d, ["id", "name", "emoji", "fulfillment"], `category ${c.id}`);
    });
  }

  // Merchants: every card must open (no dead clicks)
  const merchants = await get("/merchants");
  await check(`merchants>=130 (got ${merchants.length})`, async () => {
    if (merchants.length < 130) throw new Error("too few");
  });
  const itemIds = [];
  for (const m of merchants) {
    await check(`merchant ${m.id} card fields`, async () => {
      need(m, ["id", "name", "kind", "rating", "description"], `merchant ${m.id}`);
    });
    await check(`merchant ${m.id} detail+menu`, async () => {
      const d = await get(`/merchants/${m.id}`);
      if (!Array.isArray(d.sections) || !d.sections.length) throw new Error("no sections");
      const items = await get(`/catalog/items?merchant=${m.id}`);
      if (!items.length) throw new Error("no items");
      for (const it of items.slice(0, 3)) itemIds.push(it.id);
    });
  }

  // Vertical rails (Explore filters)
  for (const v of ["food", "wellness", "beauty", "experiences", "transport", "shopping"]) {
    await check(`vertical ${v} non-empty`, async () => {
      const r = await get(`/merchants?vertical=${v}`);
      if (!r.length) throw new Error("empty rail");
    });
  }

  // Item pages: sample every ~16th + known configured items (variants/addons = no empty pages)
  const allItems = await get("/catalog/items?merchant=mrc_001");
  await check("mrc_001 has items", async () => {
    if (!allItems.length) throw new Error("empty");
  });
  const sample = [...new Set([...itemIds.filter((_, i) => i % 16 === 0), "itm_101", "itm_111", "itm_102"])];
  for (const id of sample) {
    await check(`item ${id} detail`, async () => {
      const d = await get(`/catalog/items/${id}`);
      need(d, ["id", "merchant_id", "price_kes"], `item ${id}`);
      if (!d.name && !d.title) throw new Error("no name");
    });
  }
  await check("itm_101 variants+addons (Nyama Choma config)", async () => {
    const d = await get("/catalog/items/itm_101");
    if (!d.variants?.length) throw new Error("no variants");
    if (!d.addon_groups?.length) throw new Error("no addon groups");
    if (!d.addon_groups[0].options?.length) throw new Error("no addon options");
  });

  // Search paths (parity with mock: pizza is empty on both sides → must not crash)
  for (const q of ["burger", "spa", "safari", "laundry", "nyama", "coffee"]) {
    await check(`search '${q}' hits`, async () => {
      const r = await get(`/search?q=${encodeURIComponent(q)}`);
      if (!r.merchants.length && !r.items.length) throw new Error("no hits");
    });
  }
  await check("search 'pizza' parity (empty, no crash)", async () => {
    await get("/search?q=pizza");
  });

  // Discovery composer sections
  await check("discovery/home ordered sections", async () => {
    const d = await get("/discovery/home?category=restaurants-food&q=burger");
    const keys = d.sections.map((s) => s.key);
    if (keys[0] !== "relevant") throw new Error(`expected relevant first, got ${keys[0]}`);
  });

  // Vector admin search (M0: locked → bootstrap admin → hits)
  await check("admin vector search locked (401)", async () => {
    const r = await fetch(base + "/admin/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "grilled goat meat" }),
    });
    if (r.status !== 401) throw new Error(`expected 401, got ${r.status}`);
  });
  await check("admin vector search hits", async () => {
    const aphone = "2549" + String(Math.floor(10000000 + Math.random() * 89999999));
    const reg = await (await fetch(base + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: aphone, pin: "1234" }),
    })).json();
    const key = process.env.ADMIN_BOOTSTRAP_KEY ?? "nexg-dev-bootstrap";
    await fetch(base + "/auth/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bootstrap-key": key },
      body: JSON.stringify({ person_id: reg.data.person_id, kind: "admin" }),
    });
    const login = await (await fetch(base + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: aphone, pin: "1234" }),
    })).json();
    const r = await fetch(base + "/admin/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${login.data.access}` },
      body: JSON.stringify({ query: "grilled goat meat", limit: 5 }),
    });
    const j = await r.json();
    if (!j.data?.length) throw new Error("no hits");
  });

  // Media rows for hero rendering
  await check("merchant media rows", async () => {
    const r = await get("/media?entity_type=merchant&entity_id=mrc_001");
    if (!r.length) throw new Error("no media");
  });

  console.log(`\nQA: ${pass} passed, ${fail} failed`);
  if (failures.length) {
    console.log("FAILURES:");
    for (const f of failures.slice(0, 20)) console.log(" -", f);
    process.exit(1);
  }
  console.log("CONSUMER_QA_PASS");
})().catch((e) => {
  console.error("QA_FATAL", e.message);
  process.exit(1);
});
