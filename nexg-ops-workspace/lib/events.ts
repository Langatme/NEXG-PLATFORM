// Shared live-events client (SSE + inbox-poll fallback). Runs in all apps.
// Server: GET /events/stream?channel=a,b&since_seq=N&token= (CloudEvents JSON).
// At-least-once: resume with last seq; server replays missed rows; consumers de-dupe.

export interface CloudEvent {
  specversion: string;
  id: string;
  source: string;
  type: string;
  subject: string;
  time: string;
  tenant: string;
  seq: number;
  data: Record<string, unknown>;
}

interface ClientOpts {
  base: string;
  getToken: () => string | null;
  pollMs?: number;
}

type Handler = (ev: CloudEvent) => void;

export function createEventClient({ base, getToken, pollMs = 15000 }: ClientOpts) {
  const handlers = new Map<string, Set<Handler>>();
  let lastSeq = 0;
  let es: unknown = null;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let started = false;

  const emit = (ev: CloudEvent) => {
    if (ev.seq <= lastSeq) return; // de-dupe (at-least-once)
    lastSeq = ev.seq;
    handlers.get(ev.type)?.forEach((h) => h(ev));
    handlers.get('*')?.forEach((h) => h(ev));
  };

  const startPollFallback = () => {
    if (pollTimer) return;
    pollTimer = setInterval(async () => {
      try {
        const token = getToken();
        if (!token) return;
        const r = await fetch(`${base}/inbox?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) return;
        const j = await r.json();
        // Inbox rows lack full envelope; refetch loop callers invalidate instead.
        if (Array.isArray(j.data) && j.data.length) handlers.get('*')?.forEach((h) => h(j.data[0]));
      } catch {
        // stay quiet, retry next tick
      }
    }, pollMs);
  };

  return {
    on(type: string, h: Handler) {
      if (!handlers.has(type)) handlers.set(type, new Set());
      handlers.get(type)!.add(h);
      return () => handlers.get(type)?.delete(h);
    },
    connect(channels: string[]) {
      if (started) return;
      started = true;
      const token = getToken();
      const ES = (globalThis as Record<string, unknown>).EventSource as
        | (new (url: string) => { onmessage: ((e: { data: string }) => void) | null; onerror: (() => void) | null; close: () => void })
        | undefined;
      if (!token || !ES) {
        startPollFallback();
        return;
      }
      const url = `${base}/events/stream?channel=${channels.map(encodeURIComponent).join(',')}&since_seq=${lastSeq}&token=${encodeURIComponent(token)}`;
      try {
        const src = new ES(url);
        es = src;
        src.onmessage = (e) => {
          try {
            emit(JSON.parse(e.data) as CloudEvent);
          } catch {
            // heartbeat comments never reach onmessage; ignore malformed
          }
        };
        src.onerror = () => {
          try {
            (src as { close: () => void }).close();
          } catch {
            // ignore
          }
          es = null;
          started = false;
          setTimeout(() => this.connect(channels), 3000); // reconnect resumes via lastSeq
        };
      } catch {
        startPollFallback();
      }
    },
    disconnect() {
      started = false;
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
      try {
        (es as { close?: () => void } | null)?.close?.();
      } catch {
        // ignore
      }
      es = null;
    },
    get lastSeq() {
      return lastSeq;
    },
  };
}
