# M11 Record — Merchant v1 finished (M-10→M-16 + M-18)

Date: 2026-09-12. Bar: slice done only with verify green + tsc clean + docs updated.

## What shipped

Backend (`nexg-backend/`):
- `POST /catalog/publish` (`src/routes/domain.ts`) — own-merchant, counts + NCL `catalog.published`.
- `POST /media` own-merchant scoping for `item`/`merchant` entities (403 cross-merchant).
- Migration `db/migrations/012_promos.sql` (`promos`, `coupons` + indexes), folded into `db/init.sql`.
- Routers `promos`/`customers`/`finance`/`staff` (`src/routes/domain.ts`) + mounts (`src/index.ts`):
  `GET|POST /promos`, `PATCH /promos/:id`, `POST /promos/:id/coupons`,
  `GET /customers?merchant=`, `GET /finance/summary?merchant=`, `GET /staff?merchant=`.
- `POST /orders {promo_code}` apply: percent/fixed, window, min-order, max-uses → 422;
  per-account single redeem → 409 `double_redeem`; NCL `promo.redeemed` + `used_count`;
  response adds `discount_kes` (additive, no consumer break).

App (`nexg-merchant-app/`):
- `lib/api.ts`: `ApiError` (preserves `{error,hint,current_price_kes}`), `newIdempotencyKey`
  on order/request mutations, M-10→M-14 helpers (publish/media/addons/services,
  customers/finance-summary/promos/staff).
- `app/(tabs)/catalog.tsx`: addon-group editor, media attach, publish flow with counts,
  services section (kind=service), friendly 409/422 copy.
- `app/(tabs)/finance.tsx`: 12-view detail (063→075) + M-16 performance bars.
- `app/(tabs)/account.tsx`: open toggle, staff list + invite code, links to stack screens.
- New stack screens: `app/customers.tsx` (057→062), `app/promos.tsx` (076→082),
  `app/analytics.tsx` (083→093, dependency-free bars), `app/workspace.tsx` (011→016,
  `composeHome` weights + quick actions). Tabs unchanged (fixed).

## Verification (one-call pattern, port-free asserted)

- `npx tsc --noEmit`: backend 0, merchant 0.
- `m1-verify.js` 14/14, `m4-verify.js` 10/10, `cb-verify.js` 27/27,
  `events-verify.js` 12/12, `msg-verify.js` 9/9 — 0 failed.
- `m10-verify.js` 10/10 (publish/media/409/422/401). `m13-verify.js` 13/13
  (promo CRUD, order discount, double-redeem 409, invalid 422, customers/finance/staff 200).
- NCL asserted: `catalog.published`, `promo.created/redeemed` present;
  SSE `merchant:<id>` channel unchanged (existing events suite green).

## Docs

- `HANDOFF.md` §3 → v1 LIVE. `API_DATA_MAP.md` §1 + §2 promo rows + discount math.
  `FLOWS_MERCHANT.md` F4/F5 → LIVE. This record.

## Deferred with note (per spec OUT)

- Payouts/GL subledgers, M-Pesa STK/webhook, push/WS, tsvector/partitioning, portal/web
  (Expo Web first, later), CSV export, multi-location. No new npm deps added.
