// Item/section template engine. Per category: 6 sections x 10 item templates (60).
// Each merchant serves a deterministic 6-item window per section (offset by merchant
// index) -> 36 distinct-ish items per merchant, ~18k items total. Lane pricing,
// popular rotation, variants/addons, capabilities (add/book/request) included.

import { kes, mulberry32 } from "./generator.js";

/** [name, basePriceKes, flags?] — flags: "P" popular candidate, "D90" duration 90. */
export type ItemTuple = [string, number] | [string, number, string];

export interface BankSection {
  title: string;
  subtitle?: string;
  items: ItemTuple[];
}

export interface CategoryMenu {
  capability: "add" | "book" | "request";
  /** price multiplier [budget, premium] applied to template base prices. */
  laneMul: [number, number];
  /** variant selector applied to items where (idx % 3 === 0). */
  variants?: { labels: string[]; deltas: number[] };
  /** addon labels applied to items where (idx % 2 === 0). */
  addons?: Array<{ label: string; price: number }>;
  /** duration minutes [lo, hi] for book/request catalogs; null = n/a. */
  duration: [number, number] | null;
  sections: BankSection[];
}

export interface BuiltSection {
  id: string;
  title: string;
  subtitle?: string | null;
}

export interface BuiltItem {
  id: string;
  sectionId: string;
  name: string;
  description: string;
  priceKes: number;
  tags: string[];
  isPopular: boolean;
  durationMin: number | null;
  capability: string;
  variants: Array<{ id: string; label: string; priceDeltaKes: number }>;
  addons: Array<{ id: string; label: string; priceKes: number }>;
}

const DESCS = [
  "{Item} — a {Sub} favourite at {Merchant}.",
  "Fresh {Item} ({Sub}), made to order.",
  "{Merchant} {Item}: the {Sub} classic, done right.",
];

export function buildMenu(
  menu: CategoryMenu,
  merchantId: string,
  merchantName: string,
  subLabel: string,
  merchantIdx: number,
  premium: boolean
): { sections: BuiltSection[]; items: BuiltItem[] } {
  const rand = mulberry32(
    (Array.from(merchantId).reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0)
  );
  const mul = premium ? menu.laneMul[1] : menu.laneMul[0];
  const sections: BuiltSection[] = [];
  const items: BuiltItem[] = [];
  menu.sections.forEach((sec, si) => {
    const secId = `${merchantId}__s${si}`;
    sections.push({ id: secId, title: sec.title, subtitle: sec.subtitle ?? null });
    const off = (merchantIdx * 2) % sec.items.length;
    for (let k = 0; k < 6; k++) {
      const t = sec.items[(off + k) % sec.items.length]!;
      const laneTag = k % 3 === 0 ? (premium ? "Signature " : "Classic ") : "";
      const name = `${laneTag}${t[0]}`;
      const flags = t[2] ?? "";
      const price = kes(t[1] * mul * (0.92 + rand() * 0.16));
      const itemId = `${merchantId}__it${si}_${k}`;
      const variants =
        menu.variants && (off + k) % 3 === 0
          ? menu.variants.labels.map((label, vi) => ({
              id: `v${vi}`,
              label,
              priceDeltaKes: Math.round(menu.variants!.deltas[vi]! * mul),
            }))
          : [];
      const addons =
        menu.addons && (off + k) % 2 === 0
          ? menu.addons.map((a, ai) => ({
              id: `a${ai}`,
              label: a.label,
              priceKes: Math.round(a.price * mul),
            }))
          : [];
      items.push({
        id: itemId,
        sectionId: secId,
        name,
        description: DESCS[(off + k) % DESCS.length]!
          .replaceAll("{Item}", t[0])
          .replaceAll("{Sub}", subLabel)
          .replaceAll("{Merchant}", merchantName),
        priceKes: price,
        tags: [subLabel.toLowerCase()],
        isPopular: flags.includes("P") || (off + k + merchantIdx) % 6 < 2,
        durationMin: menu.duration
          ? Math.round(menu.duration[0] + rand() * (menu.duration[1] - menu.duration[0]))
          : null,
        capability: menu.capability,
        variants,
        addons,
      });
    }
  });
  return { sections, items };
}
