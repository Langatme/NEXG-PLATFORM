# M1 Record — PASS (2026-09-11): Merchant MVP

Scope: order transitions backend + merchant app (workspace/orders/catalog/finance/account).
Exit: backend tsc + `m1-verify` 14/14 + merchant app tsc clean.

## Backend
- `PATCH /orders/:id {action, reason?}` — guarded machine
  (accept→CONFIRMED, reject→CANCELLED reason-required, preparing, ready, handoff→PICKED,
  complete→DELIVERED, cancel, refund), NCL per transition with `${orderId}:${action}`
  idempotency, illegal-transition 422, replay returns current state, scope-checked
  (staff own merchant, admin anywhere).

## App (`nexg-merchant-app`, tsc clean)
- Shared foundation copied (theme, domain types, ui primitives, utils) + `hooks/use-userstore`
  stub + lean `lib/images.ts` (backend-URL media, no mock data imports).
- `lib/api.ts`: staff ladder (login-or-register anchored to merchant, MMKV session),
  orders/catalog/finance reads, transitions. `lib/store.ts`: auth store + restore.
- Screens: Orders (active/history, pull-refresh, states) → order detail (lines, totals,
  per-status actions, reason input) · Catalog (search, sections, popular badges) ·
  Finance (revenue hero, status counts) · Account (business, theme, sign-out).
- Motion: `animation:'none'` tabs, `formSheet`-grade detail via native stack, press
  feedback from primitives; device feel-check still requires a release build.

## Proof
`m1-verify` 14/14: scoped staff token → queue → accept→…→delivered chain → illegal 422 →
reject reason-required → double-reject replay → cross-merchant 403 → NCL chain
placed→delivered (6 events) → catalog read.

## Open (M2+)
Catalog CRUD + availability toggles (writes), payouts/GL, presign uploads, push/poll
realtime for new orders, analytics charts, promos create, org UI, shared-package
extraction (theme/ui/utils duplicated consumer→merchant; dedupe into `packages/` before
rider/host copy the sprawl further).
