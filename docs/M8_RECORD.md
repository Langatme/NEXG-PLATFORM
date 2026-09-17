# M8 Record — PASS: single shared messaging system + consumer completion fixes

Scope: one event-driven messaging system used by ALL apps through platform shared code,
plus the consumer gaps it unblocked (booking cancel/tracking, service requests,
notifications detail/inbox/conversations/contact, reviews, payments, QR links).
Exit: backend tsc + `msg-verify` 9/9 + full regression green + 6 surfaces tsc clean.

## Backend (`nexg-backend`, tsc clean)
- **Migration `011_messaging.sql`** (folded into `init.sql`, applied live): `messages`
  (thread_key/entity/merchant/sender/recipient/body) + 3 indexes. No new broker —
  every send emits idempotent hash-chained NCL `message.sent` with routing keys,
  fanned out over the existing Postgres LISTEN/NOTIFY → SSE.
- **`POST /messages`** (all roles, scoped): per-consumer contact threads
  (`merchant:{mid}:{account}`), order/booking entity threads, `support:{account}`;
  422 empty/oversize body; 403 cross-merchant / not-your-thread / not-your-delivery.
- **`GET /messages` + `GET /messages/threads`** (same scoping per role; rider sees
  assigned-order threads too).
- **`events.ts`**: `message.sent` fans to order/booking/merchant/property/rider:jobs
  channels; inbox copy added; consumer inbox now includes own message threads;
  rider inbox includes rider-addressed/assigned messages.
- **Verify `scripts/msg-verify.js` 9/9**: post→read→reply→read, thread isolation,
  422/403 guards, NCL routing keys, inbox + threads.

## Shared platform (`packages/shared`, synced)
- **`messaging.ts`** (new source of truth): types, canonical `threadKeyFor`,
  `threadLabel`, `accountIdFromToken`, `createMessagingClient`
  (threads/messages/send + contactMerchant/Support/Rider/Host shortcuts).
- **`hooks/use-messaging.ts`**: threads query (15s poll backstop) + SSE
  live-invalidate on entity channels (deep-link capability, never 403).
- **`ui/NexGMessageThread.tsx`** (+`inline` mode) and **`ui/NexGThreadPanel.tsx`**:
  same component on every app; loading/empty/error/retry/offline-safe states.
- `scripts/sync-shared.js` now syncs `messaging.ts`; synced to
  merchant/rider/host; hand-copied to consumer (`services/nexg/messaging.ts`,
  `lib/events.ts`, `hooks/use-messaging.ts`), admin-web, ops-workspace.

## Apps (all tsc clean)
- **Consumer**: `ContactSheet` (merchant/host/rider/support → thread → conversation);
  `inbox.tsx` (conversations + updates, one screen); `conversation/[thread].tsx`;
  `notification/[id].tsx` detail (rows now route via detail); booking-cancel
  kind-branch (`bkg_` → `PATCH /bookings` cancel — was 404-against-orders);
  live booking-status poll; service-request create/track on stay detail;
  persisted reviews (`use-reviews` + RateSheet write + merchant list);
  persisted M-Pesa/default payment + checkout default; QR cold-start/warm
  deep-link handling (`nexg://merchant/<id>`).
- **Merchant** order detail, **rider** delivery detail, **host** booking detail:
  inline `NexGThreadPanel` on the entity thread (same thread the customer sees).
- **Admin** workspace threads + `thread/[id]`; **ops** monitor threads + `thread/[id]`.

## Proof
`msg-verify` 9/9 + full regression same session: M0 20, M1 14, M2 13, M3 16,
M4 10, events 12, CB 27, QA 333 — 0 failed. tsc clean: backend, consumer,
merchant, rider, host, admin-web, ops-workspace.

## Repairs
1. Cross-merchant staff GET returned empty-200 → explicit thread/entity merchant
   check → 403 (contract: scope checks before data).
2. Rider role could not read assigned-order threads → assignment-aware
   read/write/threads rules (`not_your_delivery` otherwise).
3. Consumer cancel hit `/orders` for `bkg_` ids (mock-masked 404) → kind-branch.
4. Shared `../` relative imports break after sync (different tree depth) → `@/`
   aliases in shared sources; consumer copies adjusted to its own paths.
5. Stale `nexg-consumer/` dir was an old copy (Nov 2025) — superseded by M9:
   external `wolt-react-native-main` mirrored in-platform and deleted.

## Open (unchanged)
Camera QR scan (native dep not installed — manual code + links), messaging
read-receipts/typing, WS upgrade (poll stands), payouts/GL, M-Pesa STK, push.
