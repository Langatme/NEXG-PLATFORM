// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Shared live-events client (SSE + inbox-poll fallback). Runs in all apps.
// Server: GET /events/stream?channel=a,b&since_seq=N&token= (CloudEvents JSON).
// At-least-once: resume with last seq; server replays missed rows; consumers de-dupe.

/** Owner contract for CloudEvent payloads: schemaless server JSON, but JSON only. */
export type CloudEventDataValue =
  | string
  | number
  | boolean
  | null
  | CloudEventData
  | CloudEventDataValue[];

export interface CloudEventData {
  [key: string]: CloudEventDataValue | undefined;
}

export interface CloudEvent {
  specversion: string;
  id: string;
  source: string;
  type: string;
  subject: string;
  time: string;
  tenant: string;
  seq: number;
  data: CloudEventData;
}

interface ClientOpts {
  base: string;
  getToken: () => string | null;
  pollMs?: number;
}

type Handler = (ev: CloudEvent) => void;

/** Minimal EventSource surface this client uses (avoids DOM lib types in RN/Hermes). */
interface EventSourceLike {
  onmessage: ((event: { data: string }) => void) | null;
  onerror: (() => void) | null;
  close: () => void;
}

interface EventSourceConstructor {
  new (url: string): EventSourceLike;
}

/**
 * I/O-boundary parser: SSE frames arrive as raw strings. Only envelopes carrying the
 * routing contract the bus depends on (integer seq for order/de-dupe, type for routing,
 * id for identity) enter the system; the payload itself stays schemaless JSON.
 */
function parseCloudEvent(raw: string): CloudEvent | null {
  let parsed: CloudEvent | null = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (parsed === null || parsed === undefined) return null;
  if (!Number.isInteger(parsed.seq)) return null;
  if (parsed.type === undefined || parsed.id === undefined) return null;
  return parsed;
}

export function createEventClient({ base, getToken, pollMs = 15000 }: ClientOpts) {
  const handlers = new Map<string, Set<Handler>>();
  let lastSeq = 0;
  let es: EventSourceLike | null = null;
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
      const globalWithEventSource: { EventSource?: unknown } = globalThis;
      // SAFETY: presence-checked below (`!ES` falls back to inbox polling); runtimes that
      // expose EventSource provide the standard single-URL constructor used here.
      const ES = globalWithEventSource.EventSource as EventSourceConstructor | undefined;
      if (!token || !ES) {
        startPollFallback();
        return;
      }
      const url = `${base}/events/stream?channel=${channels.map(encodeURIComponent).join(',')}&since_seq=${lastSeq}&token=${encodeURIComponent(token)}`;
      try {
        const src = new ES(url);
        es = src;
        src.onmessage = (e) => {
          const ev = parseCloudEvent(e.data);
          if (ev !== null) emit(ev);
        };
        src.onerror = () => {
          try {
            src.close();
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
        es?.close();
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
