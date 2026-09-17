import storage from '@/utils/zustandStorage';

/** Host API client: host ladder + reservations + stay lifecycle + service boards. */

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
export const API_BASE_URL = API_BASE;
export function getApiToken() {
  return tokenCache;
}

const K_PHONE = 'nexg-host-phone';
const K_PIN = 'nexg-host-pin';
// Guest ladder (mirrors consumer ensureSession): auto-provisioned consumer-role
// identity for read-only browsing. Writes stay staff-gated server-side (403).
const K_GUEST_PHONE = 'nexg-host-guest-phone';
const K_GUEST_PIN = 'nexg-host-guest-pin';
const K_GUEST_FLAG = 'nexg-host-guest';
let tokenCache: string | null = null;

const randomPin = () =>
  `${Math.floor(1000 + Math.random() * 9000)}${Math.floor(1000 + Math.random() * 9000)}`;

export function isGuestSession() {
  return storage.getItem(K_GUEST_FLAG) === '1';
}

/** One-tap guest entry: login cached guest, else register guest_<ts> (consumer role). */
export async function ensureGuestSession(): Promise<void> {
  // SAFETY: zustandStorage returns synchronously (MMKV getString / localStorage /
  // memory Map all return string | null); the StateStorage Promise arm is unused.
  let phone = storage.getItem(K_GUEST_PHONE) as string | null;
  // SAFETY: same synchronous-backend invariant as above for K_GUEST_PHONE.
  let pin = storage.getItem(K_GUEST_PIN) as string | null;
  if (phone && pin) {
    try {
      const r = await req<{ data: { access: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, pin }),
      });
      tokenCache = r.data.access;
      storage.setItem(K_GUEST_FLAG, '1');
      return;
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
  storage.setItem(K_GUEST_PHONE, phone);
  storage.setItem(K_GUEST_PIN, pin);
  storage.setItem(K_GUEST_FLAG, '1');
  tokenCache = r.data.access;
}

export function clearGuestSession() {
  storage.removeItem(K_GUEST_FLAG);
  storage.removeItem(K_GUEST_PHONE);
  storage.removeItem(K_GUEST_PIN);
}

/** I/O boundary: normalize fetch HeadersInit into a plain header record. */
function parseExtraHeaders(input: HeadersInit | undefined) {
  const out: Record<string, string> = {};
  if (input === undefined) return out;
  if (input instanceof Headers) {
    input.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  if (Array.isArray(input)) {
    for (const [key, value] of input) out[key] = value;
    return out;
  }
  return { ...input };
}

async function req<T>(path: string, init?: RequestInit, timeoutMs = 10000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const headers: Record<string, string> = Object.assign(
      { 'Content-Type': 'application/json' },
      parseExtraHeaders(init?.headers)
    );
    if (tokenCache) headers.Authorization = `Bearer ${tokenCache}`;
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: ctrl.signal, headers }).catch((e) => {
      if (ctrl.signal.aborted || (e instanceof DOMException && e.name === 'AbortError')) {
        throw new Error(
          `Couldn't reach the server at ${API_BASE} (request timed out). Check the backend is running and the phone is on the same Wi-Fi.`
        );
      }
      throw e;
    });
    if (!res.ok) throw new Error(`api ${res.status} ${path}`);
    // SAFETY: non-2xx rejected above; T is the caller-declared DTO envelope for
    // this host endpoint, decoded from JSON at this I/O boundary.
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

export async function hostLogin(phone: string, pin: string, merchantId: string) {
  try {
    const r = await req<{ data: { access: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, pin }),
    });
    tokenCache = r.data.access;
  } catch {
    const r = await req<{ data: { access: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, pin, kind: 'host_staff', merchant_id: merchantId }),
    });
    tokenCache = r.data.access;
  }
  storage.setItem(K_PHONE, phone);
  storage.setItem(K_PIN, pin);
  storage.setItem('nexg-host-merchant', merchantId);
  return merchantId;
}

export function hostLogout() {
  tokenCache = null;
  storage.removeItem(K_PHONE);
  storage.removeItem(K_PIN);
  storage.removeItem('nexg-host-merchant');
  clearGuestSession();
}

export function currentPropertyId() {
  // SAFETY: zustandStorage returns synchronously (MMKV getString / localStorage /
  // memory Map all return string | null); the StateStorage Promise arm is unused.
  return (storage.getItem('nexg-host-merchant') as string | null) ?? null;
}

export async function restoreHostSession(): Promise<string | null> {
  // SAFETY: same synchronous-backend invariant as in currentPropertyId above.
  const phone = storage.getItem(K_PHONE) as string | null;
  // SAFETY: same synchronous-backend invariant as in currentPropertyId above.
  const pin = storage.getItem(K_PIN) as string | null;
  const merchantId = currentPropertyId();
  if (phone && pin && merchantId) {
    try {
      return await hostLogin(phone, pin, merchantId);
    } catch {
      return null;
    }
  }
  if (isGuestSession() && merchantId) {
    try {
      await ensureGuestSession();
      return merchantId;
    } catch {
      return null;
    }
  }
  return null;
}

export interface BookingDto {
  id: string;
  account_id?: string;
  merchant_id: string;
  item_id: string | null;
  status: string;
  scheduled_for: string | null;
  guests: number;
  total_kes: number;
  created_at: string;
}

export async function getReservations(params?: { from?: string; to?: string; status?: string; limit?: number }) {
  const merchant = currentPropertyId();
  const qs = new URLSearchParams();
  if (merchant) qs.set('merchant', merchant);
  if (params?.from) qs.set('from', params.from);
  if (params?.to) qs.set('to', params.to);
  if (params?.status) qs.set('status', params.status);
  if (params?.limit) qs.set('limit', String(params.limit));
  const r = await req<{ data: BookingDto[] }>(`/bookings${qs.size ? `?${qs}` : ''}`);
  return r.data;
}

export async function createBooking(input: { item_id?: string; scheduled_for: string; guests: number }) {
  const merchant = currentPropertyId();
  if (!merchant) throw new Error('no_property');
  const r = await req<{ data: BookingDto }>('/bookings', {
    method: 'POST',
    body: JSON.stringify({ merchant_id: merchant, ...input, idempotency_key: `host_${Date.now()}_${Math.random().toString(36).slice(2)}` }),
  });
  return r.data;
}

export async function getBooking(id: string) {
  const tasks = await getRequests({ booking: id });
  const r = await req<{ data: BookingDto }>(`/bookings/${encodeURIComponent(id)}`);
  return { booking: r.data, tasks };
}

export type BookingAction = 'modify' | 'checkin' | 'checkout' | 'cancel' | 'no_show';

export async function transitionBooking(
  id: string,
  action: BookingAction,
  extra?: { scheduled_for?: string; guests?: number; reason?: string; unit_id?: string }
) {
  const r = await req<{ data: BookingDto }>(`/bookings/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ action, ...extra }),
  });
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
  assignee: string | null;
  origin: string | null;
  created_at: string;
}

export async function getRequests(params?: { status?: string; kind?: string; booking?: string; assignee?: string; origin?: string }) {
  const merchant = currentPropertyId();
  const qs = new URLSearchParams();
  if (merchant) qs.set('merchant', merchant);
  if (params?.status) qs.set('status', params.status);
  if (params?.kind) qs.set('kind', params.kind);
  if (params?.booking) qs.set('booking', params.booking);
  if (params?.assignee) qs.set('assignee', params.assignee);
  if (params?.origin) qs.set('origin', params.origin);
  const r = await req<{ data: ServiceRequestDto[] }>(`/requests${qs.size ? `?${qs}` : ''}`);
  return r.data;
}

export async function createRequest(input: { booking_id?: string; kind?: string; title: string; detail?: string }) {
  const merchant = currentPropertyId();
  if (!merchant) throw new Error('no_property');
  const r = await req<{ data: ServiceRequestDto }>('/requests', {
    method: 'POST',
    body: JSON.stringify({ merchant_id: merchant, kind: 'service', ...input }),
  });
  return r.data;
}

export type RequestAction = 'assign' | 'start' | 'inspect' | 'verify' | 'complete' | 'cancel';

export async function transitionRequest(id: string, action: RequestAction, assignee?: string) {
  const r = await req<{ data: ServiceRequestDto }>(`/requests/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ action, assignee }),
  });
  return r.data;
}

export async function getProperty() {
  const merchant = currentPropertyId();
  if (!merchant) throw new Error('no_property');
  const r = await req<{ data: { id: string; name: string; kind: string; category_label?: string; description?: string; rating?: number; is_open?: boolean; image?: string; hero_image_key?: string; amenities?: string[]; policies?: string[] } }>(
    `/merchants/${encodeURIComponent(merchant)}`
  );
  return r.data;
}

export async function createProperty(input: { name: string; kind?: string; vertical?: string; description?: string }) {
  const r = await req<{ data: { id: string; name: string } }>('/merchants', {
    method: 'POST',
    body: JSON.stringify({ kind: 'venue', vertical: 'experiences', ...input }),
  });
  storage.setItem('nexg-host-merchant', r.data.id);
  return r.data;
}

export async function updateProperty(patch: {
  is_open?: boolean; is_active?: boolean; description?: string; eta_min?: string; min_order_kes?: number;
  image?: string; hero_image_key?: string; amenities?: string[]; policies?: string[];
}) {
  const merchant = currentPropertyId();
  if (!merchant) throw new Error('no_property');
  const r = await req<{ data: unknown }>(`/merchants/${encodeURIComponent(merchant)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return r.data;
}

export async function getGuests() {
  // Guest derivation (no manual CRM): profiles derive from stays (bookings + requests).
  const merchant = currentPropertyId();
  const qs = merchant ? `?merchant=${encodeURIComponent(merchant)}&limit=200` : '?limit=200';
  const r = await req<{ data: BookingDto[] }>(`/bookings${qs}`);
  const byAccount = new Map<string, { account_id: string; stays: number; last_visit: string; total_kes: number }>();
  for (const b of r.data) {
    const key = b.account_id ?? b.id;
    const cur = byAccount.get(key) ?? { account_id: key, stays: 0, last_visit: b.created_at, total_kes: 0 };
    cur.stays += 1;
    cur.total_kes += b.total_kes ?? 0;
    if (b.created_at > cur.last_visit) cur.last_visit = b.created_at;
    byAccount.set(key, cur);
  }
  return [...byAccount.values()];
}

// H-07: roster reuses the single shared GET /staff endpoint (no duplicates).
export interface StaffDto {
  id: string;
  kind: string;
  merchant_id: string;
  created_at: string;
  phone: string | null;
  display_name: string | null;
}

export async function getStaff() {
  const merchant = currentPropertyId();
  if (!merchant) throw new Error('no_property');
  const r = await req<{ data: StaffDto[] }>(`/staff?merchant=${encodeURIComponent(merchant)}`);
  return r.data;
}

// H-08: finance reuses the single shared GET /finance/summary (readonly derived).
export interface FinanceSummary {
  merchant_id: string;
  orders: number;
  revenue_kes: number;
  fees_kes: number;
  avg_order_kes: number;
  cancelled: number;
  by_status: { status: string; n: number; total_kes: number }[];
  promos: number;
}

export async function getFinanceSummary() {
  const merchant = currentPropertyId();
  if (!merchant) throw new Error('no_property');
  const r = await req<{ data: FinanceSummary }>(`/finance/summary?merchant=${encodeURIComponent(merchant)}`);
  return r.data;
}

export interface UnitDto {
  id: string;
  property_id: string;
  name: string;
  unit_type: string;
  capacity: number;
  price_kes: number | null;
  is_active: boolean;
  created_at: string;
}

export async function getUnits() {
  const merchant = currentPropertyId();
  if (!merchant) throw new Error('no_property');
  const r = await req<{ data: UnitDto[] }>(`/units?property=${encodeURIComponent(merchant)}`);
  return r.data;
}

export async function createUnit(input: { name: string; unit_type?: string; capacity?: number; price_kes?: number }) {
  const merchant = currentPropertyId();
  if (!merchant) throw new Error('no_property');
  const r = await req<{ data: UnitDto }>('/units', {
    method: 'POST',
    body: JSON.stringify({ property_id: merchant, ...input }),
  });
  return r.data;
}

export async function updateUnit(id: string, patch: { name?: string; unit_type?: string; capacity?: number; price_kes?: number; is_active?: boolean }) {
  const r = await req<{ data: UnitDto }>(`/units/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return r.data;
}

export async function deleteUnit(id: string) {
  const r = await req<{ data: { deleted: string } }>(`/units/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return r.data;
}
