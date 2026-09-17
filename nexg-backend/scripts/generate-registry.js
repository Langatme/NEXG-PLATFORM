// Generates docs/EXPERIENCE_REGISTRY.json (411 entries) from verbatim doc enumerations.
// Source: registry_enums.txt extracted from the 22 planning docs (no hand-typing, no skips).
// Each entry: id, platform, name, route, requiredData, media, actions, capabilities,
// workflow, states, api, tables, nclEvents, adminView.
const fs = require("fs");
const path = require("path");

const SRC = "C:\\Users\\lenovo\\AppData\\Local\\Temp\\opencode\\registry_enums.txt";
const OUT = path.join(__dirname, "..", "docs", "EXPERIENCE_REGISTRY.json");

const PLATFORM_META = {
  CNS: {
    platform: "consumer",
    api: ["GET /categories", "GET /merchants", "GET /catalog/items", "GET /search", "POST /orders", "POST /bookings", "GET /discovery/home"],
    tables: ["categories", "merchants", "catalog_items", "orders", "bookings", "search_history"],
    nclEvents: ["search.performed", "order.placed", "booking.confirmed"],
    adminView: "Admin -> Consumer activity -> orders/bookings/search trends",
    capabilities: ["browse", "search", "view", "order", "book", "reserve", "track", "pay"],
  },
  MRC: {
    platform: "merchant",
    api: ["GET /merchants/:id", "GET /catalog/items?merchant=", "POST /orders", "GET /media"],
    tables: ["merchants", "catalog_sections", "catalog_items", "item_variants", "addon_groups", "orders", "media_assets"],
    nclEvents: ["order.accepted", "order.rejected", "order.ready", "catalog.published", "payout.initiated"],
    adminView: "Admin -> Merchant detail -> orders/payouts/audit",
    capabilities: ["view", "order", "pay", "message"],
  },
  RDR: {
    platform: "rider",
    api: ["GET /orders", "POST /orders/:id/accept", "POST /delivery/proof"],
    tables: ["orders", "order_lines"],
    nclEvents: ["rider.assigned", "rider.picked", "rider.delivered", "proof.captured"],
    adminView: "Ops -> Delivery monitor -> reassign/intervene",
    capabilities: ["view", "track", "navigate"],
  },
  HST: {
    platform: "host",
    api: ["GET /merchants", "POST /bookings", "GET /catalog/items"],
    tables: ["merchants", "bookings", "catalog_items", "media_assets"],
    nclEvents: ["booking.confirmed", "booking.modified", "booking.cancelled", "stay.checked_in", "stay.checked_out"],
    adminView: "Admin -> Property detail -> reservations/stays",
    capabilities: ["view", "book", "reserve", "request", "pay"],
  },
  OPS: {
    platform: "operations",
    api: ["GET /orders", "GET /search", "POST /admin/search"],
    tables: ["orders", "bookings", "ncl_events"],
    nclEvents: ["incident.created", "dispute.opened", "intervention.applied"],
    adminView: "Ops workspace -> live network -> investigate/resolve",
    capabilities: ["view", "track", "message"],
  },
  ADM: {
    platform: "admin",
    api: ["GET /categories", "GET /merchants", "POST /admin/search"],
    tables: ["persons", "accounts", "merchants", "orders", "ncl_events", "nexg_documents"],
    nclEvents: ["auth.granted", "role.changed", "config.updated"],
    adminView: "Admin workspace (future UI; reads same tables)",
    capabilities: ["view"],
  },
  PUB: {
    platform: "public",
    api: ["GET /merchants/:id", "GET /catalog/items/:id", "POST /orders", "POST /bookings"],
    tables: ["merchants", "catalog_items", "orders", "bookings"],
    nclEvents: ["order.placed", "booking.confirmed"],
    adminView: "Admin -> entry attribution (QR/link source)",
    capabilities: ["view", "order", "book", "pay", "track"],
  },
};

const STATES = ["loading", "loaded", "empty", "error", "offline", "refreshing"];
const TX_STATES = ["idle", "processing", "success", "failed"];

function kebab(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseLine(line) {
  // "CNS-001 Splash,002 Welcome,...110 Feedback. **[SCOPE...]**"
  const entries = [];
  let prefix = null;
  for (const raw of line.split(",")) {
    let tok = raw.trim().replace(/\.\s*(\*\*.*)?$/, "").trim();
    if (!tok) continue;
    const m = tok.match(/^([A-Z]{3})-(\d{3})\s+(.+)$/);
    if (m) {
      prefix = m[1];
      entries.push({ prefix, num: m[2], name: m[3].trim() });
    } else {
      const m2 = tok.match(/^(\d{3})\s+(.+)$/);
      if (m2 && prefix) entries.push({ prefix, num: m2[1], name: m2[2].trim() });
    }
  }
  return entries;
}

const lines = fs.readFileSync(SRC, "utf8").split("\n").filter((l) => l.trim());
const registry = [];
for (const line of lines) {
  for (const e of parseLine(line)) {
    const meta = PLATFORM_META[e.prefix];
    if (!meta) throw new Error("unknown prefix " + e.prefix);
    const id = `NEXG-${meta.platform.toUpperCase()}-${e.prefix}-${e.num}`;
    registry.push({
      id,
      code: `${e.prefix}-${e.num}`,
      platform: meta.platform,
      name: e.name,
      route: `/${meta.platform}/${kebab(e.name)}`,
      requiredData: ["id"],
      media: ["thumbnail"],
      actions: ["view"],
      capabilities: meta.capabilities,
      workflow: "view -> act -> confirm -> activity",
      states: /order|booking|payment|payout|checkout|proof|check/i.test(e.name)
        ? [...STATES, ...TX_STATES]
        : STATES,
      api: meta.api,
      tables: meta.tables,
      nclEvents: meta.nclEvents,
      adminView: meta.adminView,
    });
  }
}

const counts = {};
for (const r of registry) counts[r.platform] = (counts[r.platform] || 0) + 1;
console.log("counts:", JSON.stringify(counts), "total:", registry.length);
if (registry.length !== 411) throw new Error(`expected 411, got ${registry.length}`);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ version: "1.0.0", total: registry.length, entries: registry }, null, 1));
console.log("wrote", OUT);
