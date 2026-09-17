# NEXG API Data Map — frontend data points → DB → future Admin

DB is source of truth. Image is NOT (design system is UX truth). Vectors are projections,
never truth. Every mutation emits an idempotent, hash-chained NCL event. Admin (deferred UI)
is pure reads over these same tables — no rework when it arrives.

## 1. Endpoint → tables → NCL → Admin read

| Frontend need | Domain API | DB tables | NCL event | Future Admin query |
|---|---|---|---|---|
| Category rail | `GET /categories`, `GET /categories/:id` | `categories, subcategories` | — (read) | `SELECT * FROM categories ORDER BY sort` → Category config |
| Merchant list/detail | `GET /merchants?q&category`, `GET /merchants/:id` | `merchants, catalog_sections, media_assets` | — (read) | `... WHERE id=$1` + orders/payouts/audit → Merchant detail |
| Item detail | `GET /catalog/items`, `GET /catalog/items/:id` | `catalog_items, item_variants, addon_groups, media_assets` | — (read) | Item history |
| Search | `GET /search?q`, `GET /search/suggestions` | `search_history` + live | `search.performed` | Search trends: `SELECT query, count(*) FROM search_history GROUP BY 1 ORDER BY 2 DESC` |
| Home sections | `GET /discovery/home?lat&lng&time&category&q` | `merchants, catalog_items` (ranked in code) | — (read) | — |
| Place order | `POST /orders {merchant_id, lines[], payment_method, idempotency_key}` | `orders, order_lines` | `order.placed` (+ later `accepted/preparing/ready/delivered`) | Order investigation: order + lines + payment + timeline + `SELECT * FROM ncl_events WHERE entity_id=$1 ORDER BY seq` |
| Book | `POST /bookings {merchant_id, item_id, scheduled_for, guests, idempotency_key}` | `bookings` | `booking.confirmed/modified/cancelled` | Reservation monitor |
| Media | `GET /media?entity_type&entity_id` | `media_assets` | — | Asset audit |
| Auth | `POST /auth/register {phone,pin,kind?,merchant_id?}`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/accounts` (admin/bootstrap) | `persons, accounts` | `auth.granted`, `role.changed` | Users/Roles/Scopes/Audit |
| Semantic search | `POST /admin/search {query, limit}` (admin-only) | `nexg_documents` (HNSW cosine) | — | `... ORDER BY embedding <=> $1 LIMIT 20` + entity fetch |
| Order reads (M0) | `GET /orders?merchant&status&mine`, `GET /orders/:id` (+lines, scoped) | `orders, order_lines` | — (read) | Staff workspace queue; consumer history |
| Booking reads (M0) | `GET /bookings?merchant&from&to&mine`, `GET /bookings/:id` (scoped) | `bookings` | — (read) | Host calendar; consumer history |
| Ledger reads (M0) | `GET /ledger/events?entity_type&entity_id` (admin) | `ncl_events` | — (read) | Entity replay: `ORDER BY seq` |
| Order transitions (M1) | `PATCH /orders/:id {action, reason?}` (staff/admin, scoped) | `orders` | `order.accepted|rejected|preparing|ready|handed_off|delivered|cancelled|refunded` | Status timeline per order; replay `${orderId}:${action}` idempotent |
| Rider jobs (M2) | `GET /rider/jobs?status=`, `GET /deliveries/:id` (+lines) | `delivery_tasks, orders` | `delivery.offered` (auto on handoff) | Dispatch board; task detail |
| Delivery transitions (M2) | `PATCH /deliveries/:id {action, proof?}` (rider/admin) | `delivery_tasks` | `rider.accepted|declined|arrived_pickup|picked|arrived_drop|delivered|failed` | Proof + timeline per delivery |
| Proof upload (M2) | `POST /uploads/presign {entity, entity_id, filename}` | `media_assets` (on attach) | `proof.captured` | Evidence audit |
| Rider earnings (M2) | `GET /rider/earnings` (derived, readonly) | `delivery_tasks + orders` | — (read) | Payout review |
| Booking transitions (M3) | `PATCH /bookings/:id {action, scheduled_for?, guests?, reason?}` (scoped) | `bookings` | `booking.modified|stay.checked_in|stay.checked_out|booking.cancelled|booking.no_show` | Stay timeline; replay `${bookingId}:${action}` idempotent |
| Service requests (M3) | `GET|POST /requests`, `PATCH /requests/:id {action, assignee?}` (scoped) | `service_requests` | `request.created|assigned|started|inspected|verified|completed|cancelled` | Ops board; task audit |
| Catalog writes (M4) | `POST /catalog/sections`, `POST|PATCH|DELETE /catalog/items`, `POST .../variants`, `POST .../addons`, `PATCH /merchants/:id` (own merchant) | `catalog_*`, `merchants` | `catalog.*`, `merchant.updated` | Menu audit; delete 409 when referenced |
| Efficient poll (M4) | `?since=` on orders/bookings/jobs | — | — | 15s poll contract (WS deferred) |
| Uploads (M4) | `POST /uploads/presign` → S3 PUT → CDN GET (MinIO live) | `media_assets` (on attach) | `proof.captured` | Evidence audit |
| Live events (M-events) | `GET /events/stream?channel&since_seq&token` SSE (CloudEvents) | `ncl_events` (NOTIFY trigger) | — (read) | Watch any entity live; replay ≤200 |
| Inbox (M-events) | `GET /inbox?limit=` (role-scoped) | `ncl_events` | — (read) | Attention queues; deep links |
| Consumer cancel (M5/CB-01) | `PATCH /orders/:id {action:"consumer-cancel"}` (consumer own, PLACED/CONFIRMED) | `orders` | `order.cancelled` (replay 200) | Cancel audit; 403 non-owned, 422 after |
| Suggestions (M5/CB-02) | `GET /search/suggestions?q=` (ranked) + writer on `GET /search` | `search_history` | — (read) | Popular queries; `SELECT query,count(*) GROUP BY 1 ORDER BY 2 DESC` |
| Sessions (M5/CB-03) | `GET /experiences?limit=` (`source` + `mock_sunset`) | `catalog_items` (book/reserve caps) | — (read) | Fallback popular until bookable items published |
| Media persist (M5/CB-04) | `POST /media {entity_type,entity_id,url|key}` + consumer presign allowlist | `media_assets` | `media.attached` | Asset audit |
| Booking validation (M5/CB-05) | `POST /bookings` requires merchant, validates item/date/guests, overlap 409, real totals | `bookings` | `booking.confirmed` | Overlap: same account+merchant+item+hour |
| Pagination (M5/CB-06) | `?limit&offset` + `total` on orders/bookings/requests/jobs/merchants/items + item `section/available/min_price/max_price` + bookings `status` | — | — | Calendar `created_at DESC` LIMIT 500 |
| Order events (M5/CB-07) | `GET /orders/:id/events` (consumer-own / staff-scoped) | `ncl_events` | — (read) | Scoped alternative to admin ledger |
| Revocation (M5) | `POST /auth/logout` revokes; `requireRoles` 401 `revoked` | `revoked_tokens` | — | `SELECT 1 FROM revoked_tokens WHERE token_hash=$1` |
| Sections U/D (M5) | `PATCH|DELETE /catalog/sections/:id` (409 when has items) | `catalog_sections` | `catalog.section_updated/deleted` | Menu audit |
| Variants U/D (M5) | `PATCH|DELETE /catalog/variants/:id`, `DELETE /catalog/addons/:id` | `item_variants`, `addon_groups` | — | Variant audit |
| Merchant onboarding (M5) | `POST /merchants` (auto section+item) + `DELETE /merchants/:id` (admin, 409 on history) | `merchants`, `catalog_*` | `merchant.onboarded/deleted` | No dead clicks |
| Rider reoffer (M5) | `PATCH /deliveries/:id {action:reoffer|cancel,reason?}` (staff + rider decline reason) | `delivery_tasks` | `delivery.offered/cancelled`, `rider.declined` (+reason) | Dispatch board |
| Messaging (M8, ALL apps) | `POST /messages {thread_key?,entity_type?,entity_id?,merchant_id?,recipient_role?,body}` + `GET /messages?thread_key=&entity=&merchant=&since=` + `GET /messages/threads` (scoped) | `messages` | `message.sent` (routing: thread_key/merchant/entity/recipient) | Thread audit; per-consumer contact threads (`merchant:{mid}:{account}`) |
| Rider reads (R-01) | `GET /orders` + `GET /requests` scoped for role=rider to assigned `delivery_tasks.rider_account_id` (OFFERED pool via `GET /rider/jobs`) | `orders`, `service_requests`, `delivery_tasks` | — (reads) | Assigned-sees-own, unassigned empty (not ALL), `?merchant=` no 403-or-leak |
| Rider onboarding (R-02) | `GET|POST /rider/profile` (own) + `PATCH /rider/profile/:account {approve|reject+reason}` (admin) | `rider_profiles` | `rider.submitted|approved|rejected` | Submit→pending→approve→active; reject 422 without reason |
| Rider push (R-05) | `POST /rider/push-token {expo_token, platform}` + broadcast on `delivery.offered` | `push_tokens` | — (fan-out, NCL unchanged) | 201 valid, 422 bad token; poll+SSE remain contract |
| Catalog publish (M-10) | `POST /catalog/publish {merchant_id}` (own merchant) | `catalog_items, catalog_sections` (counts) | `catalog.published` (live/total/sections) | Publish audit; SSE `merchant:<id>` assertion |
| Media scoping (M-10) | `POST /media` asserts own merchant for `item`/`merchant` entities | `media_assets, catalog_items` | `media.attached` | Cross-merchant 403 |
| Customers (M-11) | `GET /customers?merchant=` (derived, staff-scoped) | `orders, bookings` (GROUP BY account) | — (read) | Top customers by spend; empty 200 |
| Finance summary (M-12, reused H-08) | `GET /finance/summary?merchant=` (readonly derived; roles merchant_* + host_* + admin) | `orders` (agg + by_status) | — (read) | Revenue/fees/avg/cancelled; GL post-v1 |
| Promos engine (M-13) | `GET|POST /promos`, `PATCH /promos/:id`, `POST /promos/:id/coupons`, apply `POST /orders {promo_code}` | `promos, coupons` | `promo.created/updated/coupon_issued/redeemed` | Promo performance; expired 422, double-redeem 409 |
| Staff list (M-14, reused H-07) | `GET /staff?merchant=` (scoped; roles merchant_* + host_* + admin — single shared endpoint) | `accounts, persons` | — (read) | Team audit; invite = staff self-register with merchant code |
| Request origin (H-11) | `POST /requests {origin?}` passthrough (≤32 chars, 422 invalid) + `GET /requests?origin=` filter | `service_requests.origin` | `request.created` carries `origin` | Scan→request→board; QR chip on host tasks |
| Property editors (H-05) | `PATCH /merchants/:id` allowlist += `image, hero_image_key, amenities[], policies[]` (lists validated) | `merchants` | `merchant.updated` | Invalid list 422 |
| Units CRUD (H-05) | `GET /units?property=` (staff own-property; consumer-role list-scoped incl. guests) + `POST|PATCH|DELETE /units/:id` (host_owner/host_staff/admin, own-property) | `units`, `bookings.unit_id` | `unit.added/updated/deleted` | Create→publish, cross-property 403, delete 409 when bookings pinned; `POST /bookings` + `PATCH {modify}` accept `unit_id` (same-property validated) |

## 2. Money math (server-computed, frontend never invents totals)

`POST /orders` reprices `item_id` lines from catalog (mismatch → 422 `stale_price`
+ current price); custom lines (no `item_id`) keep client prices. Fees = 49.
`total = subtotal + fees - discount`. Promo apply: code lookup per merchant,
active window, min-order, max-uses → 422 `invalid/expired/min_not_met/exhausted`;
per-account single redeem → 409 `double_redeem`; NCL `promo.redeemed` + `used_count`. Delivery fee rule for later: `150 ≤3km +60/km`.
Promos `NEXG10/KARIBU200` validated server-side. Double-entry GL + payable
(earned→available→held→payout) arrive with payments phase; NCL chain already reserves
`correlation_id` for it.

## 3. Write path = row + NCL + vector chunk (all three, every time)

1. Insert domain row(s) with `idempotency_key` (409 on replay, never double-charge).
2. `appendNclEvent({actor, event/entity, correlation/causation, prev/new_state, hash chain})`.
3. `indexDocument(entity_type, entity_id, chunk)` → `nexg_documents` with stub embedding
   (1536-dim, `EMBEDDINGS_PROVIDER=stub` now; openai/ollama later via env, callers unchanged).

Seed indexing: 3 demo merchants indexed at boot-verify so `POST /admin/search`
returns rows from day one.

## 4. Admin SQL starter kit (runs today, UI later)

```sql
-- Any order's full story
SELECT * FROM ncl_events WHERE entity_id = 'ord_...' ORDER BY seq;
-- Merchant pipeline
SELECT * FROM orders WHERE merchant_id = 'mrc_demo_001' ORDER BY created_at DESC;
-- User's accounts/roles (one person, many roles)
SELECT p.phone, a.id, a.kind FROM persons p JOIN accounts a ON a.person_id = p.id WHERE p.phone = $1;
-- Semantic: "spicy burger near me"
-- POST /admin/search {"query":"spicy burger","limit":10}
SELECT entity_type, entity_id, chunk, embedding <=> $1::vector AS distance
FROM nexg_documents ORDER BY 4 LIMIT 10;
```

## 5. Registry link

`EXPERIENCE_REGISTRY.json` (411 entries) maps each screen → `{route, api, tables,
nclEvents, adminView}`. Frontend builds from §1 rows; Admin builds from the same rows.
