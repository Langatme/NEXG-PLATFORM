# M5 Record — PASS (2026-09-11): Consumer Backend completion + MRH gaps + app finish

Scope: CB-01→07 + stock-check + revocation + pagination + merchant/rider/host backend gaps + all 4 app clients.
Exit: backend tsc + `cb-verify` 27/27 + full regression (M0 20, M1 14, M2 13, M3 16, M4 10, events 12, QA 333) + 4 apps tsc clean.

## Backend (`nexg-backend`, tsc clean)

- **Auth**: bootstrap fallback (`ADMIN_BOOTSTRAP_KEY ?? "nexg-dev-bootstrap"` — was 401 without `.env`), `.env` created from example, revocation list (`revoked_tokens`, SHA256, checked in `requireRoles`, `POST /auth/logout` revokes → 401 after).
- **Orders**: `consumer-cancel` (PLACED/CONFIRMED only, own-account, replay 200, NCL `order.cancelled`); stock guard (`is_available=false` → 422 `out_of_stock`); pagination (`limit/offset/total`); `GET /orders/:id/events` scoped (CB-07); merchant-cancel propagation cancels non-terminal delivery tasks + NCL `delivery.cancelled`.
- **Search**: GET writes `search_history` (authed account or null); `/suggestions` ranked from history + popular (CB-02).
- **Experiences**: live source with `source` + `mock_sunset` (CB-03); item create accepts `capabilities` (book/reserve/quote/request/view) — fixes empty `/experiences`.
- **Media**: `POST /media` persist + NCL `media.attached`; presign allowlist adds `consumer` (CB-04).
- **Bookings**: validation (merchant required, item exists, guests 1..50, scheduled_for future-or-default-tomorrow, overlap guard per item+hour → 409, real totals price×guests) (CB-05/H-02); list adds `status` filter + `limit/offset/total` + `created_at DESC` (fixes M3 calendar LIMIT 200 hiding newest) (CB-06/H-03).
- **Catalog**: de-dupe `GET /items/:id`; sections PATCH/DELETE (409 when has items); variants PATCH/DELETE; addons DELETE; `POST /merchants` onboarding (auto default section + welcome item, no dead clicks) + `DELETE /merchants/:id` (admin, 409 on history).
- **Requests**: `merchant_staff` added to PATCH (was owner-only); consumer may cancel own; list adds `assignee/since/limit/offset` (H-04).
- **Merchants**: PATCH allows `host_*` (own property open/close) (H-01).
- **Deliveries**: `reoffer` (CANCELLED→OFFERED) + `cancel` transitions; PATCH allows staff cancel/reoffer (cancel propagation) + rider decline reason stored; jobs pagination; earnings unchanged.
- **Migration**: `010_cb_completion.sql` (revoked_tokens + 11 indexes) + folded into `init.sql`.

## Apps (all tsc clean)

- **Consumer** (`wolt-react-native-main`): `apiCancelOrder`, `apiSuggestions`, `apiSessions`, `apiOrderEvents`; `getSessions` backend-first (mock sunset); `merchantService.suggestions`; `transactionService.cancel` backend for non-seed IDs.
- **Merchant**: `createMerchant/sections U/D/variants U/D/upsertAddons/getOrderEvents/getRequests/transitionRequest/deleteMerchant` in `lib/api.ts`.
- **Rider**: `DeliveryAction` + `reoffer/cancel`, `transitionDelivery(id,action,proof,reason)`, `declineWithReason/deliverWithPhoto/deliverWithSignature/deliverWithOtp`; `delivery/[id].tsx` OTP + photo URL + e-sign inputs + decline-reason gate.
- **Host**: `getReservations` server `status` filter, `createBooking`, `getRequests` assignee filter, `createProperty/updateProperty/getGuests` (derived from stays, no manual CRM).

## Proof

`cb-verify` 27/27: consumer-cancel + 403/422/replay, stock 422, suggestions ranked, experiences source, presign+media, booking 422×3 + 409 + totals, pagination×3, order-events + 403, logout 401, sections 409 flow, variants, POST merchants + cleanup, staff requests, decline+reoffer, host PATCH + consumer-cancel-request.
Full regression same session: M0 20, M1 14, M2 13, M3 16, M4 10, events 12, QA 333 — 0 failed.

## Repairs

1. **Bootstrap 401 (all admin paths)**: `ADMIN_BOOTSTRAP_KEY` required env, no `.env` on disk → `isBootstrap` always false. Fixed with fallback + `.env` from example. Caught by G0, not users.
2. **M3 calendar 200-limit hide**: 617 bookings, `ORDER BY scheduled_for` + LIMIT 200 hid newest. Fixed with `created_at DESC` + LIMIT 500 + pagination (CB-06).
3. **M3 overlap too strict**: same-hour guard blocked legacy callers without item. Scoped to item+hour only.
4. **QA dead clicks from test merchants**: `POST /merchants` created empty catalog → QA `no sections`. Fixed with auto default section + welcome item + admin DELETE + test cleanup.
5. **CB test bugs**: replay expectation (200 not 422), `/variants` missing `/catalog` prefix — fixed in-harness.

## Open (post-M5, per plan OUT)

STK/push, payouts/GL, WS upgrade, tsvector ranking, partitioning, Admin UI, analytics charts (counts live), org UI (API ready), turn-by-turn beyond link-out, fleet roles, E2E on device, CI nightly + staging re-baseline on real hardware.
