# Merchant App — User Flows (MRC-001→114) — M1 LIVE for F1–F4(reads)/F6-account

Persona: business owner/staff fulfilling orders and managing catalog.
Tabs: Orders · Catalog · Finance · Account. Endpoint tags: LIVE / PLANNED.

## F1 Onboarding (MRC-001→010) — LIVE (staff self-register; owner/admin via invite)
Sign in/up → business info → verification → document submission → location setup →
payment setup → catalog setup → review → complete.
API: `POST /auth/register {kind: merchant_staff, merchant_id}` LIVE;
`POST /auth/accounts` LIVE (admin/bootstrap) for owner/admin. NCL: `auth.granted`,
`merchant.onboarded`. States: uploading, verifying, approved, rejected+reason.
Admin query: `SELECT * FROM ncl_events WHERE entity_type='merchant' AND event_type='merchant.onboarded'`.

## F2 Workspace (MRC-011→016) — "What needs attention?" — LIVE (queue; composer next)
Attention queue composer (same weights as consumer composer): unaccepted orders 100 >
ready-for-handoff 90 > payout pending 70 > low-stock 60 > promos 40.
API: `GET /orders?merchant=&status=` LIVE (fallback: empty state with CTA, never blank). Widgets reuse consumer `ActiveTransactionWidget`.

## F3 Orders (MRC-017→032) — core loop — LIVE end-to-end
List (filter Active/History) → detail (items, customer, timeline, payment) → Review →
Accept | Reject+reason → Preparing → Ready → Handoff → (Cancel | Refund | Issue).
API: `GET /orders…`, `GET /orders/:id`, `PATCH /orders/:id {action, reason?}` all LIVE
(guards + idempotent replay + NCL each). Contact sheets reuse
consumer `TransactionSheets`. Motion: detail sheet `formSheet`, spring 300ms/0.8;
status pills crossfade opacity only.
Admin: `SELECT * FROM ncl_events WHERE entity_id=$1 ORDER BY seq` (full story).

## F4 Catalog (MRC-033→048) + Services (049→056) — LIVE (M-10)
Catalog → category/product list → detail → create/edit → media (presign upload) →
variants/modifiers → pricing → availability toggle → publish.
API: reads LIVE (`GET /merchants/:id` sections, `GET /catalog/items?merchant=`,
`GET /catalog/items/:id` variants+addons); writes LIVE (CRUD + toggles);
publish `POST /catalog/publish` LIVE → NCL `catalog.published`.
Reuse consumer `ItemSections/ItemControls` — extend, never clone. NCL:
`catalog.published`, `item.availability_changed`.

## F5 Customers (057→062) · Finance (063→075) · Promotions (076→082) — LIVE (M-11/M-12/M-13)
Read-first from ledger: transactions/fees/commissions/settlements/payouts/invoices/
eTIMS/reconciliation; customer detail (orders/activity/feedback). No mutable balances —
payouts derive from NCL + GL when payments phase lands.
API: LIVE `GET /customers?merchant=` + `GET /finance/summary?merchant=` +
promos `GET|POST /promos`, `PATCH /promos/:id`, `POST /promos/:id/coupons`,
apply in `POST /orders {promo_code}` (422 expired, 409 double-redeem, NCL `promo.*`).

## F6 Org/Settings (094→114) · Analytics (083→093, M4)
Invite/roles/scopes UI (needs A1); notification/integration/tax/payment config;
audit activity = NCL read. Analytics charts deferred — workspace shows counts only.

## Edge cases
Double-accept (idempotency_key 409) · offline queue-then-sync with stale banner ·
empty orders ("No orders yet — share your store link") · permission-denied for staff
without scope (403 + who-to-ask).
