# NEXG Merchant / Rider / Host — Build Plan (follow while building)

Status: planning docs. Backend serves reads + creates only (see §2); shells are stubs.
Endpoint tags: **LIVE** = implemented today · **PLANNED** = build in Track A first.

## 1. Objective & Done criteria

Functional frontends for all three apps on the consumer stack. Every feature talks to
`nexg-backend` through domain APIs. Every mutation emits an idempotent NCL event.
Per-app user flows documented (`FLOWS_*.md`). Done per app = MVP flows end-to-end vs
live API + states everywhere + tsc clean + QA gauntlet green + docs updated.

## 2. Baseline (verified 2026-09-11)

- Backend LIVE: `/health`, `/auth/register|login` (consumer-only), `GET /categories[/:id]`,
  `GET /merchants[/:id][?category&vertical&q]`, `GET /catalog/items[/:id]`,
  `GET /experiences`, `GET /search[/suggestions]`, `POST /orders|/bookings`,
  `GET /media`, `GET /discovery/home`, `POST /admin/search`. Tables per `API_DATA_MAP.md`.
- Backend MISSING: order/booking reads + transitions, catalog writes, deliveries/tasks,
  earnings, upload route, role onboarding, refresh, realtime, server-side price checks.
- Shells (`nexg-merchant-app|nexg-rider-app|nexg-host-app`): 8 files each, placeholder
  screen, bare fetch, no providers/stores/routing. Missing deps vs consumer:
  maps/location/blur/svg/skeletons/worklets (add via `npx expo install` when needed).
- Consumer is the quarry: theme tokens, 17 UI primitives, 25 domain components, hooks,
  `services/nexg/api.ts` (guest ladder + mappers + fallback), `lib/composer.ts`.

## 3. Locked decisions (rationale in PRODUCT_DECISIONS.md)

Same stack everywhere · monolith grows, no new services · domain REST, no screen-APIs ·
API-first + mock fallback (never blank) · extend `NexG*`, never duplicate · scope-checked
auth before any role mutation · HNSW vectors · 15s poll first, WS later · Enterprise =
roles, not apps.

## 4. WBS

### Track A — Backend (critical path, leads all app work)
- **A1 Auth**: role-aware register/invite (merchant_staff/rider/host kinds),
  `POST /auth/refresh` + logout, scope-aware `requireRoles` (org/merchant scope),
  lock down `POST /admin/search`, fix fresh-boot `init.sql` (fold 002–004 in order,
  `pin_hash` into schema), UUIDv7-ish order/booking IDs.
- **A2 Merchant**: `GET /orders?merchant=&status=`, `GET /orders/:id`,
  `PATCH /orders/:id` (accept/reject+reason/preparing/ready/handoff/cancel/refund,
  transition guards, NCL each); catalog CRUD (sections/items/variants/addon-groups);
  availability toggles; `GET /ledger/events?entity=`.
- **A3 Rider**: `delivery_tasks` table; `GET /rider/jobs?status=`; accept/decline;
  `PATCH` arrived/picked/delivered/failed; `POST /media/presign` + proof attach;
  earnings view derived from ledger.
- **A4 Host**: `GET /bookings?merchant=&from=&to`; `PATCH /bookings/:id`
  (confirm/modify/check-in/check-out/cancel/no-show + guards); `service_requests` +
  `housekeeping_tasks` tables with assign/start/complete.
- **A5 Hardening**: server-side price/stock validation, M-Pesa stub boundaries,
  rate-limit + error-shape validation, realtime poll spec (15s jobs/order-state).

### Track B — Shared foundation (once)
Providers (Theme/Query/Gesture/fonts/Sentry), tab router, role stores
(user/cart/order adapted), `lib/api` role ladder, `lib/composer`, utils
(money/dates/images), `useNexg` hook pattern, `NexGStates` on every backend screen.

### Track C — Merchant (MRC-001→114; MVP ≈ 30)
Workspace attention queue → Orders list/detail/transitions + contact sheets →
Catalog list/detail/create/edit + media/variants/pricing/availability/publish →
Finance + Customers readonly → Promotions/org deferred to M4.

### Track D — Rider (RDR-001→036; MVP ≈ 20)
Onboarding/verification → Workspace (online toggle, today, queue) → offer → detail →
accept → pickup nav → verify → active delivery → drop nav → proof (OTP/photo/sign) →
confirmation → issue/failed → Earnings/payouts → docs/vehicle/support.

### Track E — Host (HST-001→066; MVP ≈ 30)
Org setup → Workspace → Portfolio → Property detail → Units → Reservation calendar →
reservation detail/create/modify/cancel → Guests → check-in → stay → services →
housekeeping/maintenance boards → check-out → Finance readonly.

### Track F — Docs
`FLOWS_MERCHANT/RIDER/HOST.md` + extend `API_DATA_MAP.md` + mark registry entries
implemented per gauntlet.

### Track G — QA gauntlets (loop to green per app)
Backend tsc → seed → API boot → app tsc → journey script (role register → happy path →
NCL row → vector hit) → matrix QA (every item opens, every mutation transitions,
offline fallback renders, no blanks) → emil Before|After|Why table + device feel-check.

## 5. Phasing

- **M0**: A1 + A2-reads + A5-boot-fix (unblocks everything).
- **M1**: Merchant MVP + flows + gauntlet.
- **M2**: Rider MVP (+A3) + flows + gauntlet.
- **M3**: Host MVP (+A4) + flows + gauntlet.
- **M4**: Writes polish (catalog CRUD, promos, org) + analytics + realtime decision.
- Change control: registry IDs are the scope language — new screen ⇒ registry entry +
  API row first.

## 6. Motion standards (animate-expo + emil, enforced in every gauntlet)

UI thread only (Reanimated worklets; never setState-per-frame, never `runOnJS` per
frame) · transform+opacity only · <300ms · `Easing.bezier(0.23,1,0.32,1)` enter/exit,
springs (`duration:400, dampingRatio:0.8`) only for finger-driven motion · press-in
feedback scale 0.97 + one haptic per commit · no tab-slide (`animation:'none'`) ·
native stack transitions, `formSheet` for sheet-screens · reduced-motion with every
animation · feel verified on release build, slowest device.

## 7. Risk register

| Risk | Mitigation |
|---|---|
| A-gaps stall apps | Contract-first mock shaped like DTOs until routes land |
| 216 screens at once | MVP slices (§4); defer analytics/charts/coupons/portal |
| AuthZ holes at writes | A1 scope checks before any role mutation merges |
| Jank on low-end Android | UI-thread rule + release feel-check gates |
| No S3 yet | Upload UI disabled with honest empty state until presign lands |
| Fresh DB boot broken | A1 folds migrations; CI boots compose + seed + QA |
