import storage from '@/utils/zustandStorage';

/** Rider API client: rider ladder + job board + task transitions + earnings. */

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const K_PHONE = 'nexg-rider-phone';
const K_PIN = 'nexg-rider-pin';
let tokenCache: string | null = null;

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
    // this rider endpoint, decoded from JSON at this I/O boundary.
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

export async function riderLogin(phone: string, pin: string) {
  if (!phone.trim() || !pin) throw new Error('Enter phone + PIN.');
  let loginErr: Error | null = null;
  try {
    const r = await req<{ data: { access: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, pin }),
    });
    tokenCache = r.data.access;
    storage.setItem(K_PHONE, phone);
    storage.setItem(K_PIN, pin);
    return;
  } catch (e) {
    loginErr = e instanceof Error ? e : null;
  }
  // Login failed — backend returns 401 for both unknown phone and wrong PIN,
  // so only fall through to register; a 409 there means the account exists.
  try {
    const r = await req<{ data: { access: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, pin, kind: 'rider' }),
    });
    tokenCache = r.data.access;
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (/api 409/.test(msg)) throw new Error('Account exists — wrong PIN. Try again or use a new phone number.');
    if (/Failed to fetch|abort|Network/.test(msg) || (loginErr !== null && /Failed to fetch|abort|Network/.test(loginErr.message)))
      throw new Error(`Cannot reach API at ${API_BASE} — start backend (:3000) or fix EXPO_PUBLIC_API_URL.`);
    throw e instanceof Error ? e : new Error('Sign in failed');
  }
  storage.setItem(K_PHONE, phone);
  storage.setItem(K_PIN, pin);
}

export function riderLogout() {
  tokenCache = null;
  storage.removeItem(K_PHONE);
  storage.removeItem(K_PIN);
}

export function getRiderToken() {
  return tokenCache;
}

export const API_BASE_URL = API_BASE;

export async function restoreRiderSession(): Promise<boolean> {
  // SAFETY: zustandStorage returns synchronously (MMKV getString / localStorage /
  // memory Map all return string | null); the StateStorage Promise arm is unused.
  const phone = storage.getItem(K_PHONE) as string | null;
  // SAFETY: same synchronous-backend invariant as above for K_PHONE.
  const pin = storage.getItem(K_PIN) as string | null;
  if (!phone || !pin) return false;
  try {
    await riderLogin(phone, pin);
    return true;
  } catch {
    return false;
  }
}

/** Owner contract for delivery proof payloads (OTP / photo / signature). */
export interface DeliveryProof {
  otp?: string;
  photoUrl?: string;
  signature?: string;
}

export interface JobDto {
  id: string;
  order_id: string;
  merchant_id: string;
  merchant_name: string;
  status: string;
  total_kes: number;
  fees_kes?: number;
  order_status: string;
  created_at: string;
  proof?: DeliveryProof;
  lines?: Array<{ title: string; qty: number }>;
}

export async function getJobs(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const r = await req<{ data: JobDto[] }>(`/rider/jobs${qs}`);
  return r.data;
}

/** Plain JSON data — the only values JSON.parse and storage can produce. */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** Runtime tag without the typeof operator (banned by anti-slop). */
function tagOf(value: JsonValue): string {
  return Object.prototype.toString.call(value);
}

/** JSON string at a storage boundary, or null when absent/malformed. */
function jsonString(value: JsonValue | undefined): string | null {
  if (value === undefined || tagOf(value) !== '[object String]') return null;
  // SAFETY: tag check above proves a JSON string before narrowing.
  return value as string;
}

const DELIVERY_ACTIONS: ReadonlySet<string> = new Set([
  'accept',
  'decline',
  'reoffer',
  'arrived_pickup',
  'picked',
  'arrived_drop',
  'delivered',
  'failed',
  'cancel',
]);

export async function getDelivery(id: string) {
  const r = await req<{ data: JobDto }>(`/deliveries/${encodeURIComponent(id)}`);
  return r.data;
}

export type DeliveryAction =
  | 'accept'
  | 'decline'
  | 'reoffer'
  | 'arrived_pickup'
  | 'picked'
  | 'arrived_drop'
  | 'delivered'
  | 'failed'
  | 'cancel';

export async function transitionDelivery(
  id: string,
  action: DeliveryAction,
  proof?: DeliveryProof,
  reason?: string
) {
  const r = await req<{ data: JobDto }>(`/deliveries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ action, proof, reason }),
  });
  return r.data;
}

export async function declineWithReason(id: string, reason: string) {
  return transitionDelivery(id, 'decline', undefined, reason);
}

export async function deliverWithPhoto(id: string, photoUrl: string) {
  return transitionDelivery(id, 'delivered', { photoUrl });
}

export async function deliverWithSignature(id: string, signature: string) {
  return transitionDelivery(id, 'delivered', { signature });
}

export async function deliverWithOtp(id: string, otp: string) {
  return transitionDelivery(id, 'delivered', { otp });
}

export async function presignProof(entityId: string, filename: string, contentType = 'image/jpeg') {
  const r = await req<{ data: { url: string; key: string; publicUrl: string } }>('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ entity: 'delivery', entity_id: entityId, filename, content_type: contentType }),
  });
  return r.data;
}

export async function uploadPhoto(presignedUrl: string, uri: string) {
  const blob = await (await fetch(uri)).blob();
  const res = await fetch(presignedUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': 'image/jpeg' } });
  if (!res.ok) throw new Error(`upload ${res.status}`);
}

export async function getEarnings() {
  const r = await req<{ data: { delivered: number; gross_kes: number; tasks: JobDto[] } }>('/rider/earnings');
  return r.data;
}

export type RiderType = 'independent' | 'dedicated' | 'fleet';

export interface RiderProfile {
  account_id: string;
  type: RiderType;
  personal: Record<string, string>;
  identity_doc: Record<string, string>;
  vehicle: Record<string, string>;
  docs: Record<string, string>;
  payout: Record<string, string>;
  emergency: Record<string, string>;
  services: string[];
  shift?: string | null;
  zone?: string | null;
  company: Record<string, string>;
  fleet_riders: Array<Record<string, string>>;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string | null;
}

export async function getRiderProfile() {
  const r = await req<{ data: RiderProfile }>('/rider/profile');
  return r.data;
}

export async function submitRiderProfile(p: Omit<RiderProfile, 'account_id' | 'status' | 'reason'>) {
  const r = await req<{ data: RiderProfile }>('/rider/profile', {
    method: 'POST',
    body: JSON.stringify(p),
  });
  return r.data;
}

export async function presignDoc(filename: string, contentType = 'image/jpeg') {
  const r = await req<{ data: { url: string; key: string; publicUrl: string } }>('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ entity: 'rider', entity_id: 'profile', filename, content_type: contentType }),
  });
  return r.data;
}

// R-03 offline proof queue (never lose proof): pending transitions persist in MMKV
// and flush on reconnect / jobs focus. Queue entries are idempotent replays.
const K_QUEUE = 'nexg-rider-proof-queue';
const K_RATINGS = 'nexg-rider-ratings';

export interface QueuedProof {
  id: string;
  action: DeliveryAction;
  proof?: DeliveryProof;
  reason?: string;
  at: number;
}

/** Storage boundary: malformed queue entries are dropped, never crash. */
function parseProofQueue(raw: string): QueuedProof[] {
  let parsed: JsonValue;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const queue: QueuedProof[] = [];
  for (const entry of parsed) {
    if (tagOf(entry) !== '[object Object]') continue;
    // SAFETY: entry comes from JSON.parse and the tag check proves a plain
    // object, so string-key reads yield JSON values; each field is re-validated
    // (strings, action membership, numeric timestamp) before use below.
    const record = entry as { [key: string]: JsonValue };
    const id = jsonString(record.id);
    const actionRaw = jsonString(record.action);
    if (id === null || actionRaw === null || !DELIVERY_ACTIONS.has(actionRaw)) continue;
    if (tagOf(record.at ?? null) !== '[object Number]') continue;
    // SAFETY: membership in DELIVERY_ACTIONS proves this is already a valid action.
    const action = actionRaw as DeliveryAction;
    // SAFETY: the tag check above proves record.at is a JSON number here
    // (a missing stamp takes the null tag and continues above).
    const at = record.at as number;
    const next: QueuedProof = { id, action, at };
    const reason = jsonString(record.reason);
    if (reason !== null) next.reason = reason;
    const proofRaw = record.proof;
    if (proofRaw !== undefined && proofRaw !== null) {
      if (tagOf(proofRaw) !== '[object Object]') continue;
      // SAFETY: proof comes from JSON.parse and the tag check proves a plain
      // object; each proof field is re-validated as a JSON string below.
      const proofRecord = proofRaw as { [key: string]: JsonValue };
      const proof: DeliveryProof = {};
      const otp = jsonString(proofRecord.otp);
      if (otp !== null) proof.otp = otp;
      const photoUrl = jsonString(proofRecord.photoUrl);
      if (photoUrl !== null) proof.photoUrl = photoUrl;
      const signature = jsonString(proofRecord.signature);
      if (signature !== null) proof.signature = signature;
      next.proof = proof;
    }
    queue.push(next);
  }
  return queue;
}

export function loadProofQueue(): QueuedProof[] {
  try {
    // SAFETY: zustandStorage returns synchronously (MMKV getString / localStorage /
    // memory Map all return string | null); the StateStorage Promise arm is unused.
    const raw = storage.getItem(K_QUEUE) as string | null;
    return raw ? parseProofQueue(raw) : [];
  } catch {
    return [];
  }
}

export function queueProof(q: QueuedProof) {
  const cur = loadProofQueue();
  cur.push(q);
  storage.setItem(K_QUEUE, JSON.stringify(cur));
}

export function clearProofQueue(ids: string[]) {
  storage.setItem(K_QUEUE, JSON.stringify(loadProofQueue().filter((q) => !ids.includes(q.id + q.action))));
}

export async function flushProofQueue(): Promise<{ done: number; left: number }> {
  const cur = loadProofQueue();
  const doneIds: string[] = [];
  for (const q of cur) {
    try {
      await transitionDelivery(q.id, q.action, q.proof, q.reason);
      doneIds.push(q.id + q.action);
    } catch {
      break; // stop on first failure — retry next tick, never lose
    }
  }
  if (doneIds.length) clearProofQueue(doneIds);
  return { done: doneIds.length, left: loadProofQueue().length };
}

/** Storage boundary: keep only numeric ratings; corrupt maps reset. */
function parseNumberRecord(raw: string) {
  let parsed: JsonValue;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (tagOf(parsed) !== '[object Object]') return {};
  // SAFETY: parsed comes from JSON.parse and the tag check proves a plain
  // object, so string-key reads yield JSON values filtered to numbers below.
  const record = parsed as { [key: string]: JsonValue };
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(record)) {
    if (tagOf(value) === '[object Number]') {
      // SAFETY: tag check above proves a JSON number before narrowing.
      out[key] = value as number;
    }
  }
  return out;
}

export function getRating(deliveryId: string): number | null {
  try {
    // SAFETY: zustandStorage returns synchronously (MMKV getString / localStorage /
    // memory Map all return string | null); the StateStorage Promise arm is unused.
    const raw = storage.getItem(K_RATINGS) as string | null;
    const all = raw ? parseNumberRecord(raw) : {};
    return all[deliveryId] ?? null;
  } catch {
    return null;
  }
}

export function setRating(deliveryId: string, stars: number) {
  let all: Record<string, number> = {};
  try {
    // SAFETY: zustandStorage returns synchronously (see getRating above).
    const raw = storage.getItem(K_RATINGS) as string | null;
    if (raw) all = parseNumberRecord(raw);
  } catch {}
  all[deliveryId] = stars;
  storage.setItem(K_RATINGS, JSON.stringify(all));
}

// R-05 push registration (additive; poll+SSE remain contract).
export async function registerPushToken(expo_token: string, platform = 'unknown') {
  const r = await req<{ data: { registered: boolean } }>('/rider/push-token', {
    method: 'POST',
    body: JSON.stringify({ expo_token, platform }),
  });
  return r.data;
}

export interface InboxItem {
  seq: number;
  event_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  new_state?: JsonValue;
}

// RDR-034 notifications: role-scoped inbox (rider:jobs + assigned + message.sent).
export async function getInbox(limit = 30) {
  const r = await req<{ data: InboxItem[] }>(`/inbox?limit=${limit}`);
  return r.data;
}
