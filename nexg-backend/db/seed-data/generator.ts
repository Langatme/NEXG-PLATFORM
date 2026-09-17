// Deterministic seed generator engine — mulberry32 PRNG (fixed seed), stable IDs,
// Nairobi geo jitter, KES price rounding. NO Math.random / Date.now here: reruns
// must produce identical rows so seed upserts update in place instead of duplicating.

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T>(rand: () => number, arr: readonly T[]): T =>
  arr[Math.floor(rand() * arr.length)] as T;

export const pickMany = <T>(rand: () => number, arr: readonly T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  while (copy.length && out.length < n) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0] as T);
  }
  return out;
};

/** Round KES to market-natural steps (10s under 1k, 50s above). */
export const kes = (n: number): number => (n < 1000 ? Math.round(n / 10) * 10 : Math.round(n / 50) * 50);

export interface GeoCenter {
  lat: number;
  lng: number;
  spread: number;
}

export const NAIR0BI_CENTERS: Record<string, GeoCenter> = {
  kilimani: { lat: -1.2957, lng: 36.7846, spread: 0.015 },
  westlands: { lat: -1.2635, lng: 36.8028, spread: 0.012 },
  cbd: { lat: -1.2921, lng: 36.8219, spread: 0.01 },
  karen: { lat: -1.3318, lng: 36.705, spread: 0.02 },
  eastleigh: { lat: -1.2778, lng: 36.8522, spread: 0.012 },
  jkia: { lat: -1.3192, lng: 36.9278, spread: 0.02 },
};

const CBD = { lat: -1.2921, lng: 36.8219 };

export const jitterGeo = (
  rand: () => number,
  center: GeoCenter
): { latitude: number; longitude: number; distanceKm: number } => {
  const latitude = center.lat + (rand() * 2 - 1) * center.spread;
  const longitude = center.lng + (rand() * 2 - 1) * center.spread;
  const dLat = (latitude - CBD.lat) * 111;
  const dLng = (longitude - CBD.lng) * 111 * Math.cos((CBD.lat * Math.PI) / 180);
  const distanceKm = Math.round(Math.hypot(dLat, dLng) * 10) / 10;
  return { latitude, longitude, distanceKm };
};

const slug = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const merchantId = (categoryId: string, subSlug: string, lane: string, n: number): string =>
  `mrc_${slug(categoryId)}__${slug(subSlug)}_${lane}${n}`;

export const ratingFor = (rand: () => number, premium: boolean): number => {
  const base = premium ? 4.3 : 3.8;
  return Math.round((base + rand() * (4.9 - base)) * 10) / 10;
};

export const reviewsFor = (rand: () => number, premium: boolean): number =>
  Math.floor((premium ? 120 : 25) + rand() * (premium ? 1800 : 900));
