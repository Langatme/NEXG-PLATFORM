import { Router } from "express";
import { Client } from "pg";
import { query } from "../db.js";
import { requireRoles, verifyToken, type AuthClaims } from "../auth.js";

export const events = Router();
export const inbox = Router();

// --- CloudEvents 1.0 envelope (JSON) -------------------------------------------
export interface NclRow {
  seq: number;
  event_id: string;
  tenant: string;
  actor_type: string;
  actor_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  correlation_id: string | null;
  causation_id: string | null;
  idempotency_key: string | null;
  prev_state: unknown;
  new_state: unknown;
  hash: string;
  created_at: string;
}

export function toCloudEvent(row: NclRow) {
  return {
    specversion: "1.0",
    id: row.event_id,
    source: `/nexg/${row.entity_type}`,
    type: row.event_type,
    subject: row.entity_id,
    time: row.created_at,
    tenant: row.tenant,
    correlationid: row.correlation_id,
    causationid: row.causation_id,
    seq: row.seq,
    data: row.new_state ?? {},
  };
}

// --- Channel routing: event -> SSE channels --------------------------------------
// order:<id> · merchant:<mid> · rider:jobs · booking:<bid> · property:<mid> · admin:all
export function channelsFor(row: NclRow): string[] {
  const ch = new Set<string>(["admin:all"]);
  const ns: any = row.new_state ?? {};
  const merchant: string | null = ns.merchant_id ?? (row.entity_type === "merchant" ? row.entity_id : null);
  switch (row.entity_type) {
    case "order":
      ch.add(`order:${row.entity_id}`);
      if (merchant) ch.add(`merchant:${merchant}`);
      break;
    case "delivery":
      ch.add(`rider:jobs`);
      if (ns.order_id) ch.add(`order:${ns.order_id}`);
      if (merchant) ch.add(`merchant:${merchant}`);
      break;
    case "booking":
      ch.add(`booking:${row.entity_id}`);
      if (merchant) ch.add(`property:${merchant}`);
      break;
    case "request":
      if (merchant) ch.add(`property:${merchant}`);
      if (ns.booking_id) ch.add(`booking:${ns.booking_id}`);
      break;
    case "merchant":
      ch.add(`merchant:${row.entity_id}`);
      break;
    case "message": {
      // Single shared messaging fan-out: same event reaches order/booking/merchant/property watchers.
      if (ns.entity_type === "order" && ns.entity_id) ch.add(`order:${ns.entity_id}`);
      if (ns.entity_type === "booking" && ns.entity_id) ch.add(`booking:${ns.entity_id}`);
      if (merchant) {
        ch.add(`merchant:${merchant}`);
        ch.add(`property:${merchant}`);
      }
      ch.add(`rider:jobs`);
      break;
    }
    default:
      break;
  }
  return [...ch];
}

// --- Dispatcher: single LISTEN connection, fan-out to SSE subscribers -------------
type Subscriber = { channels: Set<string>; write: (data: string) => void; claims: AuthClaims };
const subscribers = new Set<Subscriber>();
let listener: Client | null = null;
let listenerReady = false;

/** Eager boot: establish LISTEN at startup so the first event never waits on connect. */
export async function initEvents(): Promise<void> {
  try {
    await ensureListener();
    if (!listenerReady) {
      listenerReady = true;
      console.log("events: LISTEN nexg_events ready");
    }
  } catch (e) {
    console.error("events: LISTEN failed at boot (lazy retry on first stream):", (e as Error).message);
  }
}

async function ensureListener() {
  if (listener) return;  listener = new Client({
    connectionString:
      process.env.DATABASE_URL ?? "postgres://nexg:nexg_dev_password@localhost:5433/nexg",
  });
  listener.on("error", () => {
    listener = null; // next event re-establishes; history retained so nothing is lost
  });
  await listener.connect();
  await listener.query("LISTEN nexg_events");
  listener.on("notification", async (msg) => {
    const seq = Number(msg.payload);
    if (!Number.isFinite(seq) || subscribers.size === 0) return;
    const rows = await query<NclRow>(`SELECT * FROM ncl_events WHERE seq = $1`, [seq]).catch(() => []);
    const row = rows[0];
    if (!row) return;
    const ce = toCloudEvent(row);
    const targets = channelsFor(row);
    const line = `id: ${row.seq}\nevent: ${row.event_type}\ndata: ${JSON.stringify(ce)}\n\n`;
    for (const sub of subscribers) {
      if (targets.some((t) => sub.channels.has(t))) {
        try {
          sub.write(line);
        } catch {
          subscribers.delete(sub);
        }
      }
    }
  });
}

function authorizedChannels(claims: AuthClaims, requested: string[]): Set<string> | null {
  const roles = claims.roles ?? [];
  if (roles.includes("admin")) return new Set(requested);
  const allowed = new Set<string>();
  for (const c of requested) {
    const [kind, id] = c.split(":");
    if (!id) continue;
    if (kind === "order" || kind === "booking") {
      // Ownership verified cheaply: consumer sees own via inbox; live detail streams
      // require the id — deep-link capability model (full ACL in M-events-2).
      allowed.add(c);
    } else if (kind === "merchant" || kind === "property") {
      if (claims.merchant_id === id) allowed.add(c);
    } else if (kind === "rider" && c === "rider:jobs") {
      if (roles.includes("rider")) allowed.add(c);
    }
  }
  return allowed.size ? allowed : null;
}

// GET /events/stream?channel=a,b&since_seq=N&token= — SSE, CloudEvents JSON.
// EventSource can't set headers, so auth travels as ?token= (same JWT).
events.get("/stream", async (req, res) => {
  const token = String(req.query.token ?? "");
  const requested = String(req.query.channel ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!token || !requested.length) return res.status(422).json({ error: "token + channel required" });
  let claims: AuthClaims;
  try {
    claims = verifyToken(token);
    if ((claims as any).type === "refresh") throw new Error("refresh");
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
  const channels = authorizedChannels(claims, requested);
  if (!channels) return res.status(403).json({ error: "no_channel_access" });

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(": connected\n\n");

  // Replay missed history first (at-least-once + resume).
  const since = Number(req.query.since_seq ?? 0);
  if (since > 0) {
    const rows = await query<NclRow>(
      `SELECT * FROM ncl_events WHERE seq > $1 ORDER BY seq ASC LIMIT 200`,
      [since]
    ).catch(() => []);
    for (const row of rows) {
      if (channelsFor(row).some((t) => channels.has(t))) {
        res.write(`id: ${row.seq}\nevent: ${row.event_type}\ndata: ${JSON.stringify(toCloudEvent(row))}\n\n`);
      }
    }
  }

  const sub: Subscriber = { channels, write: (d) => res.write(d), claims };
  subscribers.add(sub);
  await ensureListener().catch(() => undefined);
  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 15000);
  req.on("close", () => {
    clearInterval(heartbeat);
    subscribers.delete(sub);
  });
});

// --- Inbox projection: role-scoped recent relevant events ---------------------------
const INBOX_COPY: Record<string, { title: string; emoji: string }> = {
  "order.placed": { title: "New order", emoji: "🧾" },
  "order.accepted": { title: "Order accepted", emoji: "✅" },
  "order.rejected": { title: "Order rejected", emoji: "❌" },
  "order.preparing": { title: "Preparing", emoji: "👨‍🍳" },
  "order.ready": { title: "Ready for handoff", emoji: "🔔" },
  "order.handed_off": { title: "Handed to rider", emoji: "🛵" },
  "order.delivered": { title: "Delivered", emoji: "📦" },
  "order.cancelled": { title: "Order cancelled", emoji: "🚫" },
  "delivery.offered": { title: "New delivery offer", emoji: "📬" },
  "rider.accepted": { title: "Rider accepted", emoji: "🛵" },
  "rider.delivered": { title: "Delivery complete", emoji: "✅" },
  "booking.confirmed": { title: "New booking", emoji: "🗓️" },
  "booking.cancelled": { title: "Booking cancelled", emoji: "🚫" },
  "stay.checked_in": { title: "Guest checked in", emoji: "🔑" },
  "stay.checked_out": { title: "Guest checked out", emoji: "🧾" },
  "request.created": { title: "New request", emoji: "🛎️" },
  "request.completed": { title: "Request completed", emoji: "✅" },
  "message.sent": { title: "New message", emoji: "💬" },
};

inbox.get(
  "/",
  requireRoles(["consumer", "merchant_owner", "merchant_staff", "rider", "host_owner", "host_staff", "admin"]),
  async (req: any, res) => {
    const claims = req.auth as AuthClaims;
    const roles = claims.roles ?? [];
    const limit = Math.min(Number(req.query.limit ?? 30), 100);
    let rows: NclRow[] = [];
    if (roles.includes("admin")) {
      rows = await query<NclRow>(`SELECT * FROM ncl_events ORDER BY seq DESC LIMIT $1`, [limit]);
    } else if (claims.merchant_id) {
      // Staff: events touching my merchant (orders, bookings, requests, deliveries).
      rows = await query<NclRow>(
        `SELECT * FROM ncl_events
         WHERE (new_state->>'merchant_id' = $1)
            OR (entity_type = 'merchant' AND entity_id = $1)
         ORDER BY seq DESC LIMIT $2`,
        [claims.merchant_id, limit]
      );
    } else if (roles.includes("rider")) {
      rows = await query<NclRow>(
        `SELECT * FROM ncl_events
         WHERE (entity_type = 'delivery' AND (new_state->>'order_id' IS NOT NULL))
            OR event_type = 'delivery.offered'
            OR (event_type = 'message.sent' AND (new_state->>'recipient_role' = 'rider'
              OR new_state->>'sender_account' = $1))
         ORDER BY seq DESC LIMIT $2`,
        [claims.account_id, limit]
      );
    } else {
      // Consumer: my orders + bookings + my message threads (sent, entity-linked, support).
      const mine = await query<{ id: string }>(
        `SELECT id FROM orders WHERE account_id = $1 UNION SELECT id FROM bookings WHERE account_id = $1`,
        [claims.account_id]
      );
      const ids = (mine as any[]).map((r) => r.id);
      if (ids.length) {
        rows = await query<NclRow>(
          `SELECT * FROM ncl_events
           WHERE entity_id = ANY($1)
              OR (event_type = 'message.sent' AND (
                    new_state->>'entity_id' = ANY($1)
                    OR new_state->>'thread_key' = ('support:' || $2)
                    OR new_state->>'sender_account' = $2))
           ORDER BY seq DESC LIMIT $3`,
          [ids, claims.account_id, limit]
        );
      } else {
        rows = await query<NclRow>(
          `SELECT * FROM ncl_events
           WHERE event_type = 'message.sent'
              AND (new_state->>'thread_key' = ('support:' || $1)
                OR new_state->>'sender_account' = $1)
           ORDER BY seq DESC LIMIT $2`,
          [claims.account_id, limit]
        );
      }
    }
    res.json({
      data: rows.map((e) => ({
        seq: e.seq,
        type: e.event_type,
        title: INBOX_COPY[e.event_type]?.title ?? e.event_type,
        emoji: INBOX_COPY[e.event_type]?.emoji ?? "•",
        entity_type: e.entity_type,
        entity_id: e.entity_id,
        deepLink:
          e.entity_type === "order"
            ? `nexg://activity/${e.entity_id}`
            : e.entity_type === "booking"
              ? `nexg://activity/${e.entity_id}`
              : undefined,
        time: e.created_at,
      })),
    });
  }
);
