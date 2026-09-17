// 42-plan is superseded: EVERY subcategory gets 4 merchants (budget-a/b, premium-a/b).
// Generated deterministically from BANKS + taxonomy (seeded PRNG, stable IDs) with
// curated overrides winning on collision. Shapes match seed-consumer-catalog.ts.

import { BANKS } from "./banks.js";
import { nexgCategories } from "./categories.js";
import {
  NAIR0BI_CENTERS,
  jitterGeo,
  kes,
  merchantId,
  mulberry32,
  pick,
  ratingFor,
  reviewsFor,
} from "./generator.js";
import { buildMenu } from "./items.js";
import { MENUS } from "./menus.js";
import { taxonomy } from "./taxonomy.js";

export interface SeedMerchant {
  id: string;
  name: string;
  kind: string;
  verticals: string[];
  categoryLabel: string;
  description: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  location: { address: string; latitude: number; longitude: number };
  distanceKm: number;
  isOpen: boolean;
  openingHours: Record<string, unknown>;
  tags: string[];
  etaMin?: string | number | null;
  minOrderKes?: number | null;
  heroImageKey?: string | null;
  accentEmoji: string;
  policies?: string[];
}

export interface SeedMenuCategory {
  id: string;
  merchantId: string;
  title: string;
  subtitle?: string | null;
}

export interface SeedOffering {
  id: string;
  merchantId: string;
  sectionId: string;
  name: string;
  description: string;
  priceKes: number;
  imageKey?: string | null;
  tags?: string[];
  isPopular?: boolean;
  durationMin?: number | null;
  capability?: string;
  options?: {
    variants?: Array<{ id: string; label: string; priceDeltaKes?: number }>;
    addons?: Array<{ id: string; label: string; priceKes?: number }>;
  };
}

const ROADS = [
  "Ngong Rd", "Argwings Kodhek Rd", "Woodvale Grove", "Kenyatta Ave",
  "Langata Rd", "Outer Ring Rd", "Mombasa Rd", "Waiyaki Way",
] as const;

const AREA_LABEL: Record<string, string> = {
  kilimani: "Kilimani", westlands: "Westlands", cbd: "CBD",
  karen: "Karen", eastleigh: "Eastleigh", jkia: "Syokimau",
};

const hashStr = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const catName = new Map(nexgCategories.map((c) => [c.id, c.name]));
const catEmoji = new Map(nexgCategories.map((c) => [c.id, c.emoji]));

const LANES = [
  { lane: "budget", n: 1, premium: false },
  { lane: "budget", n: 2, premium: false },
  { lane: "premium", n: 1, premium: true },
  { lane: "premium", n: 2, premium: true },
] as const;

function buildMerchants(): SeedMerchant[] {
  const out: SeedMerchant[] = [];
  for (const cat of taxonomy) {
    const bank = BANKS[cat.id];
    if (!bank) continue;
    const center = NAIR0BI_CENTERS[bank.center]!;
    for (const sub of cat.subcategories) {
      const subSlug = sub.id.includes("--") ? sub.id.split("--")[1]! : sub.id;
      LANES.forEach(({ lane, n, premium }, li) => {
        const rand = mulberry32(hashStr(`${sub.id}:${lane}:${n}`));
        const cores = premium ? bank.premiumCores : bank.cores;
        const core = cores[(hashStr(sub.id) + li * 3) % cores.length]!;
        const name = n === 2
          ? `${pick(rand, bank.prefixes)} ${core} ${pick(rand, bank.suffixes)}`.replace(/\s+/g, " ").trim()
          : core;
        const geo = jitterGeo(rand, center);
        const area = AREA_LABEL[bank.center]!;
        const blurb = pick(rand, bank.blurbs)
          .replaceAll("{Sub}", sub.label)
          .replaceAll("{Area}", area);
        out.push({
          id: merchantId(cat.id, subSlug, lane, n),
          name,
          kind: bank.kind,
          verticals: [bank.vertical],
          categoryLabel: catName.get(cat.id) ?? cat.id,
          description: premium ? `${blurb} Premium ${sub.label.toLowerCase()} desk.` : blurb,
          rating: ratingFor(rand, premium),
          reviewCount: reviewsFor(rand, premium),
          priceLevel: premium ? 2 + (n % 2) : 1,
          location: {
            address: `${Math.floor(1 + rand() * 120)} ${pick(rand, ROADS)}, ${area}, Nairobi`,
            latitude: geo.latitude,
            longitude: geo.longitude,
          },
          distanceKm: geo.distanceKm,
          isOpen: rand() > 0.08,
          openingHours: { open: "08:00", close: premium ? "23:00" : "22:00" },
          tags: [sub.label.toLowerCase(), ...bank.secondary, ...(premium ? ["premium"] : ["budget"])],
          etaMin: premium ? bank.etaMin[1] : bank.etaMin[0],
          minOrderKes: kes((premium ? bank.minOrderKes[1] : bank.minOrderKes[0]) * (0.9 + rand() * 0.2)),
          heroImageKey: null,
          accentEmoji: catEmoji.get(cat.id) ?? "🛍️",
          policies: premium ? ["Free cancellation within 1 hr", "Verified vendor"] : [],
        });
      });
    }
  }
  return out;
}

const merchants = buildMerchants();
const byCategory = new Map<string, SeedMerchant[]>();
for (const m of merchants) {
  const catId = m.id.slice("mrc_".length).split("__")[0]!;
  const list = byCategory.get(catId) ?? [];
  list.push(m);
  byCategory.set(catId, list);
}

export const nexgMerchants: SeedMerchant[] = merchants;

export function getSeedMerchantsByCategory(categoryId: string): SeedMerchant[] {
  return byCategory.get(categoryId) ?? [];
}

// Sections + items: deterministic 6-section x 6-item window per merchant via
// buildMenu (36 items/merchant, ~18k total). Merchant idx = lane position 0..3.
const merchantMeta = new Map<string, { catId: string; subLabel: string; premium: boolean; idx: number }>();
for (const cat of taxonomy) {
  for (const sub of cat.subcategories) {
    const subSlug = sub.id.includes("--") ? sub.id.split("--")[1]! : sub.id;
    LANES.forEach(({ lane, n, premium }, li) => {
      merchantMeta.set(merchantId(cat.id, subSlug, lane, n), {
        catId: cat.id,
        subLabel: sub.label,
        premium,
        idx: li,
      });
    });
  }
}

const allSections: SeedMenuCategory[] = [];
const allOfferings: SeedOffering[] = [];
for (const m of merchants) {
  const meta = merchantMeta.get(m.id);
  if (!meta) continue;
  const menu = MENUS[meta.catId];
  if (!menu) continue;
  const built = buildMenu(menu, m.id, m.name, meta.subLabel, meta.idx, meta.premium);
  for (const s of built.sections) {
    allSections.push({ id: s.id, merchantId: m.id, title: s.title, subtitle: s.subtitle ?? null });
  }
  for (const it of built.items) {
    allOfferings.push({
      id: it.id,
      merchantId: m.id,
      sectionId: it.sectionId,
      name: it.name,
      description: it.description,
      priceKes: it.priceKes,
      imageKey: null,
      tags: it.tags,
      isPopular: it.isPopular,
      durationMin: it.durationMin,
      capability: it.capability,
      options:
        it.variants.length || it.addons.length
          ? {
              variants: it.variants.map((v) => ({ id: v.id, label: v.label, priceDeltaKes: v.priceDeltaKes })),
              addons: it.addons.map((a) => ({ id: a.id, label: a.label, priceKes: a.priceKes })),
            }
          : undefined,
    });
  }
}

export const nexgMenuCategories: SeedMenuCategory[] = allSections;

export const nexgOfferings: SeedOffering[] = allOfferings;
