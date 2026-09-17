import storage from '@/utils/zustandStorage';

/** Admin readonly client: bootstrap admin + reads over existing tables (no new backend). */

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
export const API_BASE_URL = API_BASE;
export function getApiToken() {
  return tokenCache;
}
let tokenCache: string | null = null;

async function req<T>(path: string, init?: RequestInit, timeoutMs = 10000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((init?.headers as Record<string, string>) ?? {}),
    };
    if (tokenCache) headers.Authorization = `Bearer ${tokenCache}`;
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: ctrl.signal, headers });
    if (!res.ok) throw new Error(`api ${res.status} ${path}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

export async function adminLogin(phone: string, pin: string) {
  // Login; if unknown, register then bootstrap admin account (dev key).
  try {
    const r = await req<{ data: { access: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, pin }),
    });
    tokenCache = r.data.access;
  } catch {
    const reg = await req<{ data: { access: string; person_id: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, pin }),
    });
    await fetch(`${API_BASE}/auth/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bootstrap-key': 'nexg-dev-bootstrap' },
      body: JSON.stringify({ person_id: reg.data.person_id, kind: 'admin' }),
    });
    const login = await req<{ data: { access: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, pin }),
    });
    tokenCache = login.data.access;
  }
  storage.setItem('nexg-admin-phone', phone);
  storage.setItem('nexg-admin-pin', pin);
}

export function adminLogout() {
  tokenCache = null;
  storage.removeItem('nexg-admin-phone');
  storage.removeItem('nexg-admin-pin');
}

export async function getMerchants() {
  const r = await req<{ data: Array<{ id: string; name: string; kind: string; rating: number }> }>('/merchants?limit=100');
  return r.data;
}

export async function getLedger(entity_id?: string, limit = 50) {
  const qs = entity_id ? `?entity_id=${encodeURIComponent(entity_id)}&limit=${limit}` : `?limit=${limit}`;
  const r = await req<{ data: Array<{ seq: number; event_type: string; entity_type: string; entity_id: string; created_at: string }> }>(`/ledger/events${qs}`);
  return r.data;
}

export async function getHealth() {
  const r = await req<{ ok: boolean }>(`/health`);
  return r;
}

export async function adminSearch(query: string) {
  const r = await req<{ data: Array<{ entity_type: string; entity_id: string; chunk: string }> }>('/admin/search', {
    method: 'POST',
    body: JSON.stringify({ query, limit: 10 }),
  });
  return r.data;
}
