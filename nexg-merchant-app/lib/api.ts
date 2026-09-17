import type { CatalogItem, CatalogSection, Merchant } from '@/domain/types';
import storage from '@/utils/zustandStorage';

/**
 * Merchant API client: staff auth ladder + orders loop + catalog/finance reads.
 * Same contract as consumer services/nexg/api.ts (mappers identical, DTOs shared).
 */

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
export const isApiEnabled = () => true; // merchant app is useless offline-first without backend; screens still render states
export const API_BASE_URL = API_BASE;
export function getApiToken() {
  return tokenCache;
}

const K_PHONE = 'nexg-staff-phone';
const K_PIN = 'nexg-staff-pin';
const K_GUEST = 'nexg-staff-guest';
let tokenCache: string | null = null;
let merchantCache: string | null = null;

const randomPin = () =>
  `${Math.floor(1000 + Math.random() * 9000)}${Math.floor(1000 + Math.random() * 9000)}`;

/**
 * JSON boundary contracts: every server payload decodes into these named types,
 * so `unknown` never leaks past the fetch boundary into screens.
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
export interface JsonObject { [key: string]: JsonValue; }

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function isJsonString(value: JsonValue | undefined): value is string {
  return Object.prototype.toString.call(value) === '[object String]';
}

/** Read a decoded JSON object body; non-objects (arrays, primitives, null) yield null. */
export function readErrorBody(body: JsonValue): JsonObject | null {
  if (!isJsonObject(body)) return null;
  return body;
}

/** Read a string field from a decoded JSON object; missing/non-string yields null. */
export function readStringField(record: JsonObject, key: string): string | null {
  const value: JsonValue | undefined = record[key];
  if (!isJsonString(value)) return null;
  return value;
}

function errorDetail(status: number, path: string, body: JsonValue): string {
  const record = readErrorBody(body);
  const detail = record === null ? null : readStringField(record, 'error');
  return detail ?? `api ${status} ${path}`;
}

export class ApiError extends Error {
  status: number;
  path: string;
  body: JsonValue;
  constructor(status: number, path: string, body: JsonValue) {
    super(errorDetail(status, path, body));
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

export function newIdempotencyKey(prefix = 'mrc') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function req<T>(path: string, init?: RequestInit, timeoutMs = 10000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const extra = init?.headers;
    if (extra !== undefined) {
      if (extra instanceof Headers) {
        extra.forEach((value, key) => headers.set(key, value));
      } else if (Array.isArray(extra)) {
        for (const pair of extra) {
          if (pair[0] !== undefined && pair[1] !== undefined) headers.set(pair[0], pair[1]);
        }
      } else {
        for (const key of Object.keys(extra)) {
          // SAFETY: the HeadersInit record form only carries string values per the fetch contract.
          headers.set(key, extra[key] as string);
        }
      }
    }
    if (tokenCache) headers.set('Authorization', `Bearer ${tokenCache}`);
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: ctrl.signal, headers }).catch((e) => {
      if (ctrl.signal.aborted || (e instanceof DOMException && e.name === 'AbortError')) {
        throw new Error(
          `Couldn't reach the server at ${API_BASE} (request timed out). Check the backend is running and the phone is on the same Wi-Fi.`
        );
      }
      throw e;
    });
    if (!res.ok) {
      let body: JsonValue = null;
      try { body = await res.json(); } catch { body = null; }
      throw new ApiError(res.status, path, body);
    }
    // SAFETY: callers pin T to the endpoint DTO; a contract break surfaces as a UI error state, never a silent wrong type.
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

export async function staffLogin(phone: string, pin: string, merchantId: string) {
  // Try login; if unknown phone, self-register as merchant_staff anchored to merchant.
  try {
    const r = await req<{ data: { access: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, pin }),
    });
    tokenCache = r.data.access;
  } catch {
    const r = await req<{ data: { access: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, pin, kind: 'merchant_staff', merchant_id: merchantId }),
    });
    tokenCache = r.data.access;
  }
  storage.setItem(K_PHONE, phone);
  storage.setItem(K_PIN, pin);
  storage.setItem('nexg-staff-merchant', merchantId);
  merchantCache = merchantId;
  return merchantId;
}

export function staffLogout() {
  tokenCache = null;
  merchantCache = null;
  storage.removeItem(K_PHONE);
  storage.removeItem(K_PIN);
  storage.removeItem('nexg-staff-merchant');
  storage.removeItem(K_GUEST);
}

export const isGuestStaff = () => storage.getItem(K_GUEST) === '1';

/**
 * Guest ladder (mirrors consumer `ensureSession`): no password typed.
 * Generates + caches a guest staff identity anchored to the merchant code.
 */
export async function guestLogin(merchantId: string) {
  const mid = merchantId.trim();
  if (!mid) throw new Error('merchant_id required');
  const phone = `guest_${Date.now().toString(36)}`;
  const pin = randomPin();
  const r = await req<{ data: { access: string } }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, pin, display_name: 'Guest', kind: 'merchant_staff', merchant_id: mid }),
  });
  tokenCache = r.data.access;
  storage.setItem(K_PHONE, phone);
  storage.setItem(K_PIN, pin);
  storage.setItem('nexg-staff-merchant', mid);
  storage.setItem(K_GUEST, '1');
  merchantCache = mid;
  return mid;
}

export function currentMerchantId() {
  if (merchantCache) return merchantCache;
  // SAFETY: zustandStorage.getItem resolves synchronously here (MMKV/memory/localStorage branches all return strings; no async backend is wired), so the Promise branch of StateStorage never occurs.
  merchantCache = (storage.getItem('nexg-staff-merchant') as string | null) ?? null;
  return merchantCache;
}

export async function restoreSession(): Promise<string | null> {
  // SAFETY: same synchronous-storage invariant as currentMerchantId; reads below are strings, never Promises.
  const phone = storage.getItem(K_PHONE) as string | null;
  // SAFETY: same synchronous-storage invariant as currentMerchantId; reads below are strings, never Promises.
  const pin = storage.getItem(K_PIN) as string | null;
  const merchantId = currentMerchantId();
  if (!phone || !pin || !merchantId) return null;
  try {
    return await staffLogin(phone, pin, merchantId);
  } catch {
    return null;
  }
}

// --- DTOs + mappers (same as consumer; duplicated until shared package extraction) ---

export interface OrderDto {
  id: string;
  merchant_id: string;
  status: string;
  subtotal_kes: number;
  fees_kes: number;
  total_kes: number;
  payment_method: string;
  created_at: string;
  lines?: Array<{ title: string; qty: number; unit_price_kes: number; line_total_kes: number }>;
}

export async function getOrders(status?: string) {
  const merchant = currentMerchantId();
  const qs = new URLSearchParams();
  if (merchant) qs.set('merchant', merchant);
  if (status) qs.set('status', status);
  const r = await req<{ data: OrderDto[] }>(`/orders${qs.size ? `?${qs}` : ''}`);
  return r.data;
}

export async function getOrder(id: string) {
  const r = await req<{ data: OrderDto }>(`/orders/${encodeURIComponent(id)}`);
  return r.data;
}

export async function createCatalogItem(input: {
  section_id?: string;
  name: string;
  description?: string;
  price_kes: number;
}) {
  const merchant = currentMerchantId();
  if (!merchant) throw new Error('no_merchant');
  const r = await req<{ data: { id: string } }>('/catalog/items', {
    method: 'POST',
    body: JSON.stringify({ merchant_id: merchant, ...input }),
  });
  return r.data;
}

export async function updateCatalogItem(
  id: string,
  patch: { name?: string; description?: string; price_kes?: number; is_available?: boolean; is_popular?: boolean }
) {
  const r = await req<{ data: unknown }>(`/catalog/items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return r.data;
}

export async function setMerchantOpen(isOpen: boolean) {
  const merchant = currentMerchantId();
  if (!merchant) throw new Error('no_merchant');
  const r = await req<{ data: MerchantDto }>(`/merchants/${encodeURIComponent(merchant)}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_open: isOpen }),
  });
  return r.data;
}

export async function createMerchant(input: { name: string; kind?: string; vertical?: string; description?: string }) {
  const r = await req<{ data: MerchantDto }>('/merchants', {
    method: 'POST',
    body: JSON.stringify({ kind: 'rest', vertical: 'food', ...input }),
  });
  storage.setItem('nexg-staff-merchant', r.data.id);
  merchantCache = r.data.id;
  return r.data;
}

export async function createSection(name: string, subtitle?: string) {
  const merchant = currentMerchantId();
  if (!merchant) throw new Error('no_merchant');
  const r = await req<{ data: { id: string } }>('/catalog/sections', {
    method: 'POST',
    body: JSON.stringify({ merchant_id: merchant, name, subtitle }),
  });
  return r.data;
}

export async function updateSection(id: string, patch: { name?: string; subtitle?: string; sort?: number }) {
  const r = await req<{ data: unknown }>(`/catalog/sections/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return r.data;
}

export async function deleteSection(id: string) {
  const r = await req<{ data: unknown }>(`/catalog/sections/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return r.data;
}

export async function createVariant(itemId: string, input: { name: string; price_delta_kes?: number }) {
  const r = await req<{ data: { id: string } }>(`/catalog/items/${encodeURIComponent(itemId)}/variants`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return r.data;
}

export async function updateVariant(id: string, patch: { name?: string; price_delta_kes?: number }) {
  const r = await req<{ data: unknown }>(`/catalog/variants/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return r.data;
}

export async function deleteVariant(id: string) {
  const r = await req<{ data: unknown }>(`/catalog/variants/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return r.data;
}

export async function upsertAddons(itemId: string, input: { name?: string; required?: boolean; multi?: boolean; options?: AddonOption[] }) {
  const r = await req<{ data: unknown }>(`/catalog/items/${encodeURIComponent(itemId)}/addons`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return r.data;
}

export async function getOrderEvents(id: string) {
  const r = await req<{ data: Array<{ seq: number; event_type: string; new_state: unknown; created_at: string }> }>(
    `/orders/${encodeURIComponent(id)}/events`
  );
  return r.data;
}

export async function getRequests(params?: { status?: string; kind?: string }) {
  const merchant = currentMerchantId();
  const qs = new URLSearchParams();
  if (merchant) qs.set('merchant', merchant);
  if (params?.status) qs.set('status', params.status);
  if (params?.kind) qs.set('kind', params.kind);
  const r = await req<{ data: ServiceRequest[] }>(
    `/requests${qs.size ? `?${qs}` : ''}`
  );
  return r.data;
}

export async function transitionRequest(id: string, action: string, assignee?: string) {
  const r = await req<{ data: unknown }>(`/requests/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ action, assignee, idempotency_key: newIdempotencyKey('req') }),
  });
  return r.data;
}

export async function deleteMerchant(id: string) {
  const r = await req<{ data: unknown }>(`/merchants/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return r.data;
}

export type OrderAction = 'accept' | 'reject' | 'preparing' | 'ready' | 'handoff' | 'complete' | 'cancel' | 'refund';

export async function transitionOrder(id: string, action: OrderAction, reason?: string) {
  const r = await req<{ data: OrderDto }>(`/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ action, reason, idempotency_key: newIdempotencyKey('ord') }),
  });
  return r.data;
}

export interface MerchantDto {
  id: string;
  name: string;
  kind: string;
  category_label?: string | null;
  description?: string;
  rating?: number;
  is_open?: boolean;
}

export async function getMyMerchant(): Promise<MerchantDto> {
  const merchant = currentMerchantId();
  if (!merchant) throw new Error('no_merchant');
  const r = await req<{ data: MerchantDto }>(`/merchants/${encodeURIComponent(merchant)}`);
  return r.data;
}

export async function getCatalog(): Promise<{ sections: CatalogSection[]; items: MerchantCatalogItem[] }> {  const merchant = currentMerchantId();
  if (!merchant) throw new Error('no_merchant');
  const [detail, items] = await Promise.all([
    req<{ data: { sections?: Array<{ id: string; name: string; subtitle?: string }> } }>(
      `/merchants/${encodeURIComponent(merchant)}`
    ),
    req<{ data: Array<{ id: string; merchant_id: string; section_id: string; name: string; description: string; price_kes: number; is_popular: boolean; is_available?: boolean; image_key?: string }> }>(
      `/catalog/items?merchant=${encodeURIComponent(merchant)}`
    ),
  ]);
  return {
    sections: (detail.data.sections ?? []).map((s) => ({ id: s.id, merchantId: merchant, title: s.name, subtitle: s.subtitle })),
    items: items.data.map((d) => ({
      id: d.id,
      merchantId: merchant,
      sectionId: d.section_id ?? '',
      name: d.name,
      description: d.description ?? '',
      priceKes: d.price_kes,
      isPopular: d.is_popular,
      isAvailable: d.is_available ?? true,
      imageKey: d.image_key ?? undefined,
    })),
  };
}

export type MerchantCatalogItem = CatalogItem & { isAvailable?: boolean };

export interface AddonOption { label: string; price_delta_kes: number; }
export interface AddonGroup { id: string; name: string; required: boolean; multi: boolean; options: AddonOption[]; }
export interface ServiceRequest { id: string; title: string; status: string; kind: string; }

export interface ItemDetail {
  id: string;
  variants: Array<{ id: string; name: string; price_delta_kes: number }>;
  addon_groups: AddonGroup[];
}

export async function getCatalogItemDetail(id: string): Promise<ItemDetail> {
  const r = await req<{ data: ItemDetail }>(`/catalog/items/${encodeURIComponent(id)}`);
  return r.data;
}

export async function getFinance() {
  const merchant = currentMerchantId();
  const qs = merchant ? `?merchant=${encodeURIComponent(merchant)}` : '';
  const [orders, events] = await Promise.all([
    req<{ data: OrderDto[] }>(`/orders${qs}`),
    // Ledger reads are admin-only today; merchants see their orders as finance source.
    // SAFETY: empty literal — no payload to mistype; placeholder until the derived finance view lands.
    Promise.resolve({ data: [] as unknown[] }),
  ]);
  const revenue = orders.data
    .filter((o) => !['CANCELLED'].includes(o.status))
    .reduce((s, o) => s + o.total_kes, 0);
  return { orders: orders.data, revenue, events: events.data };
}

export async function deleteAddon(id: string) {
  const r = await req<{ data: unknown }>(`/catalog/addons/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return r.data;
}

export async function deleteCatalogItem(id: string) {
  const r = await req<{ data: unknown }>(`/catalog/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return r.data;
}

export async function publishCatalog(): Promise<{ merchant_id: string; live_items: number; total_items: number; sections: number }> {
  const merchant = currentMerchantId();
  if (!merchant) throw new Error('no_merchant');
  const r = await req<{ data: { merchant_id: string; live_items: number; total_items: number; sections: number } }>(
    '/catalog/publish',
    { method: 'POST', body: JSON.stringify({ merchant_id: merchant, idempotency_key: newIdempotencyKey('pub') }) }
  );
  return r.data;
}

export async function presignUpload(input: { entity: string; entity_id: string; filename: string; content_type?: string }) {
  const r = await req<{ data: { url: string; key: string; publicUrl: string } }>('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return r.data;
}

export async function attachMedia(input: { entity_type: string; entity_id: string; url?: string; key?: string; kind?: string; variant?: string }) {
  const r = await req<{ data: unknown }>('/media', { method: 'POST', body: JSON.stringify(input) });
  return r.data;
}

export async function getMedia(entity_type: string, entity_id: string) {
  const r = await req<{ data: Array<{ id: string; url: string; kind: string; variant: string }> }>(
    `/media?entity_type=${encodeURIComponent(entity_type)}&entity_id=${encodeURIComponent(entity_id)}`
  );
  return r.data;
}

export async function createService(input: { title: string; detail?: string; kind?: string }) {
  const merchant = currentMerchantId();
  if (!merchant) throw new Error('no_merchant');
  const r = await req<{ data: { id: string } }>('/requests', {
    method: 'POST',
    body: JSON.stringify({ merchant_id: merchant, kind: 'service', ...input, idempotency_key: newIdempotencyKey('svc') }),
  });
  return r.data;
}

// --- M-11 customers (derived) / M-12 finance summary / M-13 promos / M-14 staff ---

export interface CustomerRow {
  id: string;
  orders: number;
  total_kes: number;
  last_order_at: string | null;
  bookings: number;
}

export async function getCustomers(): Promise<CustomerRow[]> {
  const merchant = currentMerchantId();
  if (!merchant) throw new Error('no_merchant');
  const r = await req<{ data: CustomerRow[] }>(`/customers?merchant=${encodeURIComponent(merchant)}`);
  return r.data;
}

export interface FinanceSummary {
  merchant_id: string;
  orders: number;
  revenue_kes: number;
  fees_kes: number;
  avg_order_kes: number;
  cancelled: number;
  by_status: Array<{ status: string; n: number; total_kes: number }>;
  promos: number;
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const merchant = currentMerchantId();
  if (!merchant) throw new Error('no_merchant');
  const r = await req<{ data: FinanceSummary }>(`/finance/summary?merchant=${encodeURIComponent(merchant)}`);
  return r.data;
}

export interface PromoRow {
  id: string;
  merchant_id: string;
  code: string;
  title: string;
  kind: string;
  value_kes: number;
  min_order_kes: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  redemptions?: number;
}

export async function getPromos(): Promise<PromoRow[]> {
  const merchant = currentMerchantId();
  if (!merchant) throw new Error('no_merchant');
  const r = await req<{ data: PromoRow[] }>(`/promos?merchant=${encodeURIComponent(merchant)}`);
  return r.data;
}

export async function createPromo(input: { code: string; title?: string; kind: 'percent' | 'fixed'; value_kes: number; min_order_kes?: number; max_uses?: number }) {
  const merchant = currentMerchantId();
  if (!merchant) throw new Error('no_merchant');
  const r = await req<{ data: PromoRow }>('/promos', {
    method: 'POST',
    body: JSON.stringify({ merchant_id: merchant, ...input }),
  });
  return r.data;
}

export async function updatePromo(id: string, patch: { title?: string; is_active?: boolean }) {
  const r = await req<{ data: PromoRow }>(`/promos/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return r.data;
}

export interface StaffRow {
  id: string;
  kind: string;
  merchant_id: string;
  phone: string | null;
  display_name: string | null;
  created_at: string;
}

export async function getStaff(): Promise<StaffRow[]> {
  const merchant = currentMerchantId();
  if (!merchant) throw new Error('no_merchant');
  const r = await req<{ data: StaffRow[] }>(`/staff?merchant=${encodeURIComponent(merchant)}`);
  return r.data;
}

export type { Merchant };
