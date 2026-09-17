# PROMPT — Merchant App + Surface (v2.0): MVP → finished v1

> Folded from `PROMPT_MERCHANT_V2.md` (deleted) — single spec file per surface.
> For the pre-M5 baseline this supersedes, see git history / M1–M4 records.

> Paste everything below the `===` line as the agent's first message. Self-contained:
> the agent needs only this file plus repo access. Version footer at the end.

===

You own the NEXG **merchant surface end-to-end**: app at
`C:\Users\lenovo\Desktop\nexg-platform\nexg-merchant-app` AND its backend slice in
`C:\Users\lenovo\Desktop\nexg-platform\nexg-backend`. Mission: merchant MVP → finished v1:
every order actionable, full catalog managed, finance legible. Do not touch other apps.

**Done means:** Checklist A (all MRC IDs below) ticked live-or-deferred-with-note;
Checklist B journeys measured green; backend tsc + app tsc clean; m1/m4 suites green plus
your new checks; docs updated.

## 1. Environment (Windows PowerShell 5.1, exact paths)

- App (Expo ~57.0.20, RN 0.86.3, React 19.2.3, Router ~57.0.9, TS ~6.0.3, Zustand+MMKV,
  React Query, Reanimated 4.5.1). Routes on disk (verified): `app/_layout.tsx`,
  `app/index.tsx`, `app/order/[id].tsx`, `app/(tabs)/_layout.tsx`,
  `app/(tabs)/{orders,catalog,finance,account}.tsx`. `lib/{api,store,composer,events}.ts`
  (`composer`/`events` are AUTO-SYNCED copies — see §9).
- Backend serves `http://localhost:3000`; DB `localhost:5433`; migrations continue from
  `012_*` (`011_messaging.sql` taken — verify with `ls db/migrations` at G0, claim next
  free number, fold into `db/init.sql`). Roles you use:
  merchant_owner|merchant_staff (+admin in tests). Single-call verify cycles; assert port
  3000 free; `EXPO_PUBLIC_API_URL=http://localhost:3000` for the app.
- Scratch: `C:\Users\lenovo\AppData\Local\Temp\opencode`. `workdir`, never `cd`.

## 2. Read first (no code changes until G1 passes)

1. `../docs/HANDOFF.md` §3 + `FLOWS_MERCHANT.md` + `M1_RECORD.md` + `M4_RECORD.md`.
2. Registry merchant entries MRC-001→MRC-114 in `EXPERIENCE_REGISTRY.json`.
3. Code: the 8 app routes + `lib/api.ts` + `lib/store.ts`; backend `src/routes/domain.ts`
   (orders/catalog/merchants/requests sections), `src/auth.ts`, `src/ledger.ts`.
4. `scripts/m1-verify.js`, `scripts/m4-verify.js` — extend, don't replace.

## 3. Current state (verified 2026-09-11 — confirm, don't assume)

- LIVE: staff ladder, orders queue/detail + 8 transitions (accept→delivered, reject/cancel
  with reason, idempotent replay), catalog read + price edit + availability toggle + add
  item, finance readonly, account/theme/sign-out. Endpoints: PATCH/GET orders, catalog
  CRUD (sections C-only; items C+R+U+conditional-D; variants/addons C-only),
  PATCH merchants (5 fields), requests R +463829 create, deliveries read, presign, inbox,
  `merchant:` SSE channel.
- GAPS you own: (a) `merchant_staff` excluded from `PATCH /requests` (owner-only —
  inconsistent with POST/GET); (b) sections/variants/addons lack U/D; (c) item create
  hardcodes `capabilities={add}` so `/experiences` is empty; (d) no `POST /merchants`
  onboarding; (e) MRC-049→056 services, 057→062 customers, 076→082 promos, 083→093
  analytics, 094→106 org (roles UI) unbuilt; (f) duplicate `GET /catalog/items/:id`
  route definition (`domain.ts`, remove one).
- CLOSED in M5 (do not redo): (a) staff PATCH requests; (b) sections PATCH/DELETE,
  variants PATCH/DELETE, addons DELETE; (c) capabilities accepted on create;
  (d) `POST /merchants` (+admin DELETE); (f) dupe removed. Plus: booking validation +
  status filter, request filters, `GET /orders/:id/events`, stock guard, revocation,
  pagination. M6 closed: sections/variants UI, service-requests board in orders.
  M8 closed: message threads on order detail (shared system, live).
- REMAINING (your v1 slices, §6b): M-10 catalog finish (addons edit UI, media attach,
  publish) + services CRUD [MRC-033→056]; M-11 customers [057→062]; M-12 finance
  detail [063→075]; M-13 promos engine [076→082]; M-14 org/roles [094→106]; M-15
  settings/support [107→114]; M-16 analytics charts [083→093]; M-18 workspace
  composer [011→016]. MRC-001→010 live via ladder (doc-review states deferred —
  no verification backend); MRC-017→032 live.

## 4. Hard gates (blocking — STOP, report, wait at each)

- **G0**: boot+seed, `m1-verify.js` + `m4-verify.js` green BEFORE any edit.
- **G1**: read-proof — cites for scope middleware, transition guard table, NCL replay rule,
  sync-shared rule; run-and-report both suites' tails + order/delivery counts. Wait.
- **G2**: slice plan approval (§6). **G3**: per slice — both tsc clean + both suites green
  + new checks + docs.

## 5. Definition of Done — BOTH required

**Checklist A (MRC IDs — tick all):** 001 Merchant Sign In, 002 Sign Up, 003 Business
Information, 004 Business Verification, 005 Document Submission, 006 Location Setup,
007 Payment Setup, 008 Catalog Setup, 009 Onboarding Review, 010 Onboarding Complete,
011 Merchant Workspace, 012 Workspace Search, 013 Activity, 014 Tasks, 015 Notifications,
016 Quick Actions, 017 Orders, 018 Active Orders, 019 Order Detail, 020 Order Review,
021 Accept Order, 022 Reject Order, 023 Reject Reason, 024 Order Preparation, 025 Order Ready,
026 Handoff, 027 Order Cancellation, 028 Refund, 029 Customer Contact, 030 Rider Contact,
031 Order Issue, 032 Order History, 033 Catalog, 034 Category List, 035 Category Detail,
036 Create Category, 037 Edit Category, 038 Product List, 039 Product Detail,
040 Create Product, 041 Edit Product, 042 Product Media, 043 Variant Management,
044 Modifier Management, 045 Pricing, 046 Availability, 047 Bulk Edit, 048 Catalog Publish,
049 Services, 050 Service Detail, 051 Create Service, 052 Edit Service,
053 Service Availability, 054 Service Pricing, 055 Staff Assignment, 056 Service Publish,
057 Customers, 058 Customer Detail, 059 Customer Orders, 060 Customer Activity,
061 Customer Feedback, 062 Customer Conversation, 063 Finance, 064 Transactions,
065 Transaction Detail, 066 Payments, 067 Fees, 068 Commissions, 069 Settlements,
070 Payouts, 071 Payout Detail, 072 Balance, 073 Invoices, 074 Reconciliation,
075 Payout Account, 076 Promotions, 077 Promotion Detail, 078 Create Promotion,
079 Edit Promotion, 080 Coupons, 081 Coupon Detail, 082 Promotion Performance,
083 Analytics Workspace, 084 Sales Analytics, 085 Order Analytics, 086 Product Analytics,
087 Customer Analytics, 088 Location Analytics, 089 Revenue Analytics,
090 Performance Analytics, 091 Reports, 092 Report Detail, 093 Export, 094 Organization,
095 Organization Profile, 096 Locations, 097 Location Detail, 098 Teams, 099 Team Detail,
100 Members, 101 Member Detail, 102 Invite Member, 103 Roles, 104 Role Detail,
105 Permissions, 106 Scopes, 107 Merchant Settings, 108 Notification Settings,
109 Integration Settings, 110 Tax Configuration, 111 Payment Configuration, 112 Support,
113 Support Case, 114 Audit Activity. Mark live/deferred-with-note each.
**Checklist B (outcomes):** place→accept→…→delivered <5 min on staging; every list item
opens; every mutation transitions with NCL asserted; cross-merchant 403 suite; airplane
mode shows stale states; reads p99 within PERF_BASELINE.md.

## 6. Slice format + example

`Slice M-<nn>: <title> [MRC-x..y] — Backend (method/path/auth/scopes/NCL/migration) —
Frontend (screens, primitives extended) — Tests (script + 403/422/409/replay cases) —
Effort — Depends — Rollback.` Example — *Slice M-05: staff request transitions
[MRC-014/031]*. Backend: add `merchant_staff` to `PATCH /requests/:id` roles;
frontend: transition buttons in `order/[id].tsx`; NCL `request.*` asserted; guards:
cross-merchant 403, illegal 422, replay 200; effort S; rollback: revert commit.
REJECTED example: a parallel `MerchantCardV2` component — extend `NexG*`, never clone.

## 6b. Remaining v1 slices (registry-anchored — every ID below must tick live or deferred-with-note)

- `Slice M-10: catalog + services finish [MRC-033→056]` — Backend: none new (reads,
  U/D, capabilities, presign all live); add `catalog.published` NCL on publish toggle.
  Frontend: addon-group edit UI, media presign attach, publish flow; Services section in
  Catalog (list/detail/create/edit/availability/pricing/staff-assign/publish). Tests:
  extend m4-verify (service round-trip + NCL). Effort M. Rollback: revert commit.
- `Slice M-11: customers [MRC-057→062]` — Backend: `GET /customers?merchant=` derived
  view (orders+bookings+NCL, no new table; staff-scoped). Frontend: list/detail
  (orders/activity/feedback). Tests: 403 cross-merchant, empty 200. Effort M.
- `Slice M-12: finance detail [MRC-063→075]` — Backend: `GET /finance/summary?merchant=`
  (read-only derived; no balance mutations). Frontend: extend `finance.tsx` with the 12
  views. Effort L. Depends: M-11 (shared derived-query helper).
- `Slice M-13: promos engine [MRC-076→082]` — Backend: migration (`promos`, `coupons`)
  + `POST|PATCH /promos`, `POST /promos/:id/coupons`, apply inside order-create
  (invalid/expired→422, double-redeem→409), NCL `promo.*`. Frontend: list/detail/create/
  edit/coupons/performance. Tests: apply-e2e, expired 422, double-redeem 409, 403, NCL.
  Effort L. Rollback: flag-gated UI + migration down.
- `Slice M-14: org & roles [MRC-094→106]` — Backend: mostly live (`POST /auth/accounts`);
  add `GET /staff?merchant=` scoped (+invite accept if missing). Frontend: org/members/
  teams/roles/permissions/scopes. Effort M. Note: staff-list endpoint has ONE owner
  across merchant/host — if host builds it first, reuse it.
- `Slice M-15: settings + support [MRC-107→114]` — Backend: extend `PATCH
  /merchants/:id` allowlist; support = messages thread (`recipient_role: support`,
  live since M8). Frontend: settings forms + support-case → thread. Effort S–M.
- `Slice M-16: analytics charts [MRC-083→093]` — Frontend only (ledger reads live):
  custom SVG via vendored `react-native-svg` (no new deps). Effort M. Depends: M-12.
- `Slice M-18: workspace composer [MRC-011→016]` — Frontend: attention queue with
  composer weights + workspace search/notifications/quick actions (reuse consumer
  composer via shared). Effort S.

## 7. Fix-and-continue bounds (anti-derail)

Max 3 attempts or 150 lines per failure, then STOP-and-report with root cause + 2 options.
No scope beyond the slice's MRC IDs. No refactors outside touched files. No new npm deps
without approval. Shared files (`theme|domain|components/ui|utils|hooks|lib/composer|
lib/events`): edit ONLY in `packages/shared/` + run `node scripts/sync-shared.js`
(see §9). 90-minute slice timebox, then report.

## 8. Scope OUT + file sharing

OUT: payouts/GL subledgers, M-Pesa gateway, push infra, WS upgrade, tsvector/partitioning,
fleet consoles, consumer/rider/host apps. Analytics charts ARE in (M-16, custom SVG via
vendored `react-native-svg`). Platform context (all apps): consumer rebuilt in-platform
(M10, live); rider/host MVP live + thread panels (M8); admin/ops readonly v1 live (M6);
shared messaging (`packages/shared/messaging.ts` + sync) assumed live — use it for
M-15 support, do not rebuild messaging. `domain.ts` is SHARED with other prompts: you may append new
route blocks and touch ONLY your route blocks + shared `auth.ts/ledger.ts` with
justification in the slice plan; never reformat others' code; overlapping migration
numbers are forbidden — claim the next free `0xx_` number in your plan and note it.
Conflicts → STOP and ask, don't merge blind.

## 9. Shared rules (identical in all five prompts)

Evidence before synthesis. Extend-don't-duplicate via sync script. Every mutation emits
idempotent hash-chained NCL with routing keys (`merchant_id`, `order_id`) — assert
arrival on the `merchant:<id>` SSE channel in tests. Scope-before-data. Single-call
verify cycles; port-free assertion. One fix per failure, same-call re-run, record repairs.
Docs part of done (HANDOFF tables, API_DATA_MAP rows, flow live-marks, `M<n>_RECORD.md`).

## 10. Output contract

(1) Phase-1 proof ≤40 lines (cites + run outputs). (2) Slice plan in §6 format.
(3) RICE table. (4) First 3 actions with exact commands + proving suite. Then STOP.

*Prompt v2.0 — 2026-09-12. Changelog: folded from PROMPT_MERCHANT_V2 (deleted) — single
spec per surface; M5/M6/M8 closures marked live; remaining v1 = M-10→M-16 + M-18;
charts + promos engine confirmed IN by owner; platform-wide context added.*
