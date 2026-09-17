import storage from '@/utils/zustandStorage';

/** Ops monitor client: admin token + live reads (orders/deliveries/requests) + SSE inbox. */

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
let tokenCache: string | null = null;
export const OPS_BASE = API_BASE;
export function getOpsToken() { return tokenCache; }

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

export async function opsLogin(phone: string, pin: string) {
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
  storage.setItem('nexg-ops-phone', phone);
  storage.setItem('nexg-ops-pin', pin);
}

export async function getLiveOrders(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}&limit=50` : '?limit=50';
  const r = await req<{ data: Array<{ id: string; merchant_id: string; status: string; total_kes: number }> }>(`/orders${qs}`);
  return r.data;
}

export async function getLiveJobs() {
  const r = await req<{ data: Array<{ id: string; order_id: string; status: string; merchant_name: string }> }>('/rider/jobs?limit=50');
  return r.data;
}

export async function getInbox(limit = 20) {
  const r = await req<{ data: Array<{ seq: number; event_type: string; entity_id: string }> }>(`/inbox?limit=${limit}`);
  return r.data;
}
