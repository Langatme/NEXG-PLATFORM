import type {
  Catalog,
  CatalogItem,
  CatalogSection,
  ItemOptions,
  Merchant,
  MerchantKind,
  Vertical,
} from '@/domain/types';
import storage from '@/utils/zustandStorage';

/**
 * HTTP repository for nexg-backend domain APIs + DTO→domain mappers.
 * API-first with mock fallback at the service layer (offline-first):
 * every fetcher throws on network failure so callers can fall back.
 */

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export const isApiEnabled = () => API_BASE.length > 0;

export const apiBase = () => API_BASE;

// --- Guest identity ladder: Anonymous → Guest → Registered --------

const K_PHONE = 'nexg-guest-phone';
const K_PIN = 'nexg-guest-pin';
let tokenCache: string | null = null;

const randomPin = () =>
  `${Math.floor(1000 + Math.random() * 9000)}${Math.floor(1000 + Math.random() * 9000)}`;

async function req<T>(path: string, init?: RequestInit, timeoutMs = 8000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    if (!res.ok) throw new Error(`api ${res.status} ${path}`);
    // SAFETY: res.ok gate above rejects non-2xx; T is the caller-declared DTO
    // envelope for this endpoint path, decoded from JSON at this I/O boundary.
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

/** Lazily creates a guest identity on first write; cached thereafter. */
export async function ensureSession(): Promise<string> {
  if (tokenCache) return tokenCache;
  // SAFETY: zustandStorage returns synchronously (MMKV getString / localStorage /
  // memory Map all return string | null); the StateStorage Promise arm is unused.
  let phone = storage.getItem(K_PHONE) as string | null;
  // SAFETY: same synchronous-backend invariant as above for K_PHONE.
  let pin = storage.getItem(K_PIN) as string | null;
  if (phone && pin) {
    try {
      const r = await req<{ data: { access: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, pin }),
      });
      tokenCache = r.data.access;
      return tokenCache;
    } catch {
      // fall through to re-register
    }
  }
  phone = `guest_${Date.now().toString(36)}`;
  pin = randomPin();
  const r = await req<{ data: { access: string } }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, pin, display_name: 'Guest' }),
  });
  storage.setItem(K_PHONE, phone);
  storage.setItem(K_PIN, pin);
  tokenCache = r.data.access;
  return tokenCache;
}

/** Sync peek at the cached session token (null until ensureSession runs). */
export const peekSessionToken = () => tokenCache;

/** Token + account id for thread addressing (contact merchant/support threads). */
export async function sessionIdentity(): Promise<{ token: string; accountId: string }> {
  const token = await ensureSession();
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = '';
    let i = 0;
    const input = part.replace(/[^A-Za-z0-9+/=]/g, '');
    while (i < input.length) {
      const e1 = chars.indexOf(input.charAt(i++));
      const e2 = chars.indexOf(input.charAt(i++));
      const e3 = chars.indexOf(input.charAt(i++));
      const e4 = chars.indexOf(input.charAt(i++));
      const c1 = (e1 << 2) | (e2 >> 4);
      const c2 = ((e2 & 15) << 4) | (e3 >> 2);
      const c3 = ((e3 & 3) << 6) | e4;
      str += String.fromCharCode(c1);
      if (e3 !== 64) str += String.fromCharCode(c2);
      if (e4 !== 64) str += String.fromCharCode(c3);
    }
    const payload = JSON.parse(decodeURIComponent(escape(str)));
    return { token, accountId: String(payload.account_id ?? payload.sub ?? '') };
  } catch {
    return { token, accountId: '' };
  }
}

// --- Backend DTOs (snake_case, canonical) ---------------------------------------

export interface MerchantDto {
  id: string;
  name: string;
  kind: string;
  vertical?: string;
  verticals?: string[];
  category_id?: string | null;
  category_label?: string | null;
  description?: string;
  rating?: number;
  review_count?: number;
  price_level?: 1 | 2 | 3;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  distance_km?: number | null;
  is_open?: boolean;
  opening_hours?: Merchant['openingHours'];
  tags?: string[];
  eta_min?: string | null;
  min_order_kes?: number | null;
  hero_image_key?: string | null;
  accent_emoji?: string | null;
  policies?: string[];
}

export interface CatalogItemDto {
  id: string;
  merchant_id: string;
  section_id?: string | null;
  title?: string;
  name?: string;
  description?: string;
  price_kes: number;
  duration_min?: number | null;
  is_popular?: boolean;
  tags?: string[];
  image_key?: string | null;
  capabilities?: string[];
}

export interface ItemDetailDto extends CatalogItemDto {
  variants?: Array<{ id: string; name: string; price_delta_kes: number }>;
  addon_groups?: Array<{
    id: string;
    name: string;
    required: boolean;
    multi: boolean;
    options: Array<{ id: string; label: string; priceKes: number }>;
  }>;
}

// --- Mappers: DTO → domain (1:1, no screen changes) ------------------------------

const FALLBACK_HOURS: Merchant['openingHours'] = {
  monday: '08:00-20:00', tuesday: '08:00-20:00', wednesday: '08:00-20:00',
  thursday: '08:00-21:00', friday: '08:00-21:00', saturday: '09:00-21:00', sunday: '10:00-18:00',
};

const MERCHANT_KINDS: ReadonlySet<string> = new Set([
  'restaurant',
  'store',
  'serviceProvider',
  'experience',
  'venue',
  'transport',
  'utility',
]);

/** DTO boundary: legacy 'rest' + unknown kinds collapse to a known MerchantKind. */
function parseMerchantKind(raw: string): MerchantKind {
  if (raw === 'rest') return 'restaurant';
  if (MERCHANT_KINDS.has(raw)) {
    // SAFETY: MERCHANT_KINDS holds exactly the MerchantKind universe; has()
    // above proves membership, so the string is already a valid MerchantKind.
    return raw as MerchantKind;
  }
  return 'store';
}

const VERTICALS: ReadonlySet<string> = new Set([
  'food',
  'wellness',
  'beauty',
  'experiences',
  'transport',
  'shopping',
  'events',
  'services',
  'stay',
]);

/** DTO boundary: keep only known verticals, defaulting to food. */
function parseVerticals(d: MerchantDto): Vertical[] {
  const raw = d.verticals?.length ? d.verticals : [d.vertical ?? 'food'];
  const known = raw.filter((v): v is Vertical => VERTICALS.has(v));
  return known.length ? known : ['food'];
}

/** DTO boundary: only 1–3 are valid price levels; anything else is entry tier. */
function parsePriceLevel(raw: number | undefined): 1 | 2 | 3 {
  if (raw === 2) return 2;
  if (raw === 3) return 3;
  return 1;
}

export function mapMerchant(d: MerchantDto): Merchant {
  return {
    id: d.id,
    name: d.name,
    kind: parseMerchantKind(d.kind),
    verticals: parseVerticals(d),
    categoryLabel: d.category_label ?? '',
    description: d.description ?? '',
    rating: Number(d.rating ?? 4.5),
    reviewCount: d.review_count ?? 0,
    priceLevel: parsePriceLevel(d.price_level),
    location: {
      address: d.address ?? '',
      latitude: d.lat ?? 0,
      longitude: d.lng ?? 0,
    },
    distanceKm: d.distance_km ?? 0,
    isOpen: d.is_open ?? true,
    openingHours: d.opening_hours ?? FALLBACK_HOURS,
    tags: d.tags ?? [],
    etaMin: d.eta_min ?? undefined,
    minOrderKes: d.min_order_kes ?? undefined,
    heroImageKey: d.hero_image_key ?? undefined,
    accentEmoji: d.accent_emoji ?? '✨',
    policies: d.policies?.length ? d.policies : undefined,
  };
}

export function mapItem(d: CatalogItemDto): CatalogItem {
  return {
    id: d.id,
    merchantId: d.merchant_id,
    sectionId: d.section_id ?? '',
    name: d.name ?? d.title ?? '',
    description: d.description ?? '',
    priceKes: d.price_kes,
    durationMin: d.duration_min ?? undefined,
    isPopular: d.is_popular ?? false,
    tags: d.tags ?? [],
    imageKey: d.image_key ?? undefined,
  };
}

export function mapItemDetail(d: ItemDetailDto): CatalogItem {
  const base = mapItem(d);
  const variants = (d.variants ?? []).map((v) => ({
    id: v.id,
    label: v.name,
    priceDeltaKes: v.price_delta_kes,
  }));
  const addons = (d.addon_groups ?? []).flatMap((g) =>
    (g.options ?? []).map((o) => ({ id: o.id, label: o.label, priceKes: o.priceKes }))
  );
  if (variants.length || addons.length) {
    const options: ItemOptions = {};
    if (variants.length) options.variants = variants;
    if (addons.length) options.addons = addons;
    base.options = options;
  }
  return base;
}

// --- Fetchers (throw → caller falls back to mock) ---------------------------------

export async function apiMerchants(params?: { category?: string; vertical?: string; q?: string; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.vertical) qs.set('vertical', params.vertical);
  if (params?.q) qs.set('q', params.q);
  qs.set('limit', String(params?.limit ?? 1000));
  const r = await req<{ data: MerchantDto[] }>(`/merchants${qs.size ? `?${qs}` : ''}`);
  return r.data.map(mapMerchant);
}

export async function apiMerchant(id: string) {
  const r = await req<{ data: MerchantDto & { sections?: Array<{ id: string; name: string; subtitle?: string }> } }>(
    `/merchants/${encodeURIComponent(id)}`
  );
  return { merchant: mapMerchant(r.data), sections: r.data.sections ?? [] };
}

export async function apiCatalog(merchantId: string): Promise<Catalog> {
  const [detail, items] = await Promise.all([
    apiMerchant(merchantId),
    req<{ data: CatalogItemDto[] }>(`/catalog/items?merchant=${encodeURIComponent(merchantId)}`).then((r) =>
      r.data.map(mapItem)
    ),
  ]);
  return {
    sections: detail.sections.map(
      (s): CatalogSection => ({ id: s.id, merchantId, title: s.name, subtitle: s.subtitle })
    ),
    items,
  };
}

export async function apiItem(itemId: string) {
  const r = await req<{ data: ItemDetailDto }>(`/catalog/items/${encodeURIComponent(itemId)}`);
  return mapItemDetail(r.data);
}

export async function apiSearch(query: string) {
  const r = await req<{ data: { merchants: MerchantDto[]; items: CatalogItemDto[] } }>(
    `/search?q=${encodeURIComponent(query)}`
  );
  return { merchants: r.data.merchants.map(mapMerchant), items: r.data.items.map(mapItem) };
}

export interface ApiOrderLine {
  item_id: string | null;
  title: string;
  qty: number;
  unit_price_kes: number;
}

export async function apiCreateOrder(input: {
  merchant_id: string;
  lines: ApiOrderLine[];
  payment_method?: string;
  idempotency_key?: string;
}) {
  const token = await ensureSession();
  const r = await req<{
    data: { id: string; status: string; subtotal_kes: number; fees_kes: number; total_kes: number };
  }>(
    '/orders',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ payment_method: 'mpesa', ...input }),
    },
    12000
  );
  return r.data;
}

export async function apiCreateBooking(input: {
  merchant_id?: string;
  item_id?: string;
  scheduled_for?: string | null;
  guests?: number;
  idempotency_key?: string;
}) {
  const token = await ensureSession();
  const r = await req<{ data: { id: string; status: string } }>(
    '/bookings',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    },
    12000
  );
  return r.data;
}

export async function apiCancelOrder(id: string) {
  const token = await ensureSession();
  const r = await req<{ data: { id: string; status: string; replayed?: boolean } }>(
    `/orders/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'consumer-cancel' }),
    },
    12000
  );
  return r.data;
}

export async function apiCancelBooking(id: string, reason = 'changed plans') {
  const token = await ensureSession();
  const r = await req<{ data: { id: string; status: string; replayed?: boolean } }>(
    `/bookings/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'cancel', reason }),
    },
    12000
  );
  return r.data;
}

export async function apiModifyBooking(id: string, patch: { scheduled_for?: string; guests?: number }) {
  const token = await ensureSession();
  const r = await req<{ data: { id: string; status: string } }>(
    `/bookings/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'modify', ...patch }),
    },
    12000
  );
  return r.data;
}

export async function apiBooking(id: string) {
  const token = await ensureSession();
  const r = await req<{ data: { id: string; status: string; scheduled_for: string | null; guests: number } }>(
    `/bookings/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return r.data;
}

export async function apiSuggestions(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  const r = await req<{ data: { suggestions: string[]; popular: Array<{ query: string; n: number }> } }>(
    `/search/suggestions${qs}`
  );
  return r.data;
}

export async function apiSessions(limit = 20) {
  const r = await req<{ data: CatalogItemDto[]; source?: string }>(`/experiences?limit=${limit}`);
  return r.data.map(mapItem);
}

export interface CategoryDto {
  id: string;
  name: string;
  emoji?: string;
  verticals?: string[];
}

export async function apiCategories() {
  const r = await req<{ data: CategoryDto[] }>('/categories');
  return r.data;
}

export async function apiDiscoveryHome(params?: { category?: string; q?: string }) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.q) qs.set('q', params.q);
  const r = await req<{ data: { sections: Array<{ key: string; title: string; merchant_ids?: string[]; item_ids?: string[] }> } }>(
    `/discovery/home${qs.size ? `?${qs}` : ''}`
  );
  return r.data;
}

export async function apiOrderEvents(id: string) {
  const token = await ensureSession();
  const r = await req<{ data: Array<{ seq: number; event_type: string; new_state: unknown; created_at: string }> }>(
    `/orders/${encodeURIComponent(id)}/events`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return r.data;
}

export interface ServiceRequestDto {
  id: string;
  merchant_id: string;
  booking_id: string | null;
  kind: string;
  title: string;
  detail: string;
  status: string;
  created_at: string;
}

export async function apiCreateRequest(input: { merchant_id: string; booking_id?: string; kind?: string; title: string; detail?: string }) {
  const token = await ensureSession();
  const r = await req<{ data: ServiceRequestDto }>(
    '/requests',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ kind: 'service', ...input }),
    },
    12000
  );
  return r.data;
}

export async function apiBookingRequests(bookingId: string) {
  const token = await ensureSession();
  const r = await req<{ data: ServiceRequestDto[] }>(
    `/requests?booking=${encodeURIComponent(bookingId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return r.data;
}

export interface InboxItem {
  seq: number;
  type: string;
  title: string;
  emoji: string;
  entity_type: string;
  entity_id: string;
  deepLink?: string;
  time: string;
}

/** Single-system inbox: role-scoped recent events incl. message.sent (all apps read this). */
export async function apiInbox(limit = 30) {
  const token = await ensureSession();
  const r = await req<{ data: InboxItem[] }>(`/inbox?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.data;
}
