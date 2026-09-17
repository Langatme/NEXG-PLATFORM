# NEXG Events — AsyncAPI-style catalog (M-events, 2026-09-11)

Transport: SSE `GET /events/stream?channel=a,b&since_seq=N&token=<JWT>` → CloudEvents 1.0
JSON frames (`id` = NCL seq, `event` = type, `data` = envelope). Broker: Postgres
LISTEN/NOTIFY on `ncl_events` insert (trigger `ncl_events_notify`, payload = seq).
Store + outbox: `ncl_events` itself (append-only, hash-chained, idempotent keys).
Delivery: at-least-once; resume with `since_seq` (replay ≤200 rows); consumers de-dupe
by `idempotency_key`. Absent/0 `since_seq` = live-only (fresh clients REST-fetch state,
then stream). Upgrade path: Redis Streams → Kafka; envelope and channels unchanged.

## Envelope (every frame)

`{specversion:"1.0", id, source:"/nexg/<entity>", type, subject:<entity_id>, time,
tenant, correlationid, causationid, seq, data:<new_state>}`. Small events, fetch
details via REST. `new_state` always carries routing keys (`merchant_id`, `order_id`,
`booking_id`) — lesson: the first version omitted them on transitions and merchant
channels went silent (caught by gauntlet, fixed).

## Channels

`order:<id>` (lifecycle + fulfilment) · `merchant:<mid>` (orders + deliveries for that
merchant) · `rider:jobs` (open offers + own task events; rider role only) ·
`booking:<id>` · `property:<mid>` (bookings + requests) · `admin:all` (admin only).
Scope: admin everywhere; staff bound to `claims.merchant_id`; order/booking detail
channels are deep-link capability (full per-entity ACL in M-events-2).

## Event catalog (type → channels → NCL)

| type | channels | emitted by |
|---|---|---|
| order.placed/accepted/rejected/preparing/ready/handed_off/delivered/cancelled/refunded | order, merchant | POST/PATCH /orders |
| delivery.offered/accepted/declined/arrived_pickup/picked/arrived_drop/delivered/failed (+rider.* aliases) | rider:jobs, order, merchant | handoff auto-offer, PATCH /deliveries |
| booking.confirmed/modified/cancelled/no_show, stay.checked_in/checked_out | booking, property | POST/PATCH /bookings |
| request.created/assigned/started/inspected/verified/completed/cancelled | property, booking? | POST/PATCH /requests |
| message.sent | order?, booking?, merchant+property?, rider:jobs, admin:all | POST /messages (single shared system) |
| auth.granted, role.changed, merchant.updated, catalog.* | admin:all (+merchant) | auth/catalog routes |

## Projections
- `GET /inbox?limit=` — role-scoped recent events with copy + deep links
  (`nexg://activity/<id>`). Powers workspace attention queues + the SSE poll fallback.
- `GET /ledger/events` — full replay/audit (admin). `POST /admin/search` — semantic.

## Consumers (apps)
`packages/shared/events.ts` → `lib/events.ts` in all apps: `createEventClient({base,
getToken})`, `.on(type|*, handler)`, `.connect(channels)` (EventSource, auto-reconnect
resuming at last seq; inbox-poll fallback where EventSource is absent). Rider jobs
screen invalidates on any `rider:jobs` event (15s poll retained as backstop).

## Evolution & ops
Version by additive `new_state` fields; new event types over changed semantics; trigger
is `AFTER INSERT` (fires iff commit lands). Dead-letter: none needed — NCL retains full
history; monitor `pg_stat_user_tables.n_live_tup` growth + SSE connection count (log).
Verify: `scripts/events-verify.js` 12/12 (live flow, replay, 403s, inbox ×3).
