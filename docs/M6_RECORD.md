# M6 Record — PASS (2026-09-11): RICE finish — catalog/services, property/guests, consumer auth/tracking, admin + ops v1

Scope: RICE 1→5 from registry gap audit (MRC-034→056, HST-007→015/024→027, CNS-001→011/056→074, ADM-001→012/032→035, OPS-003→010).
Exit: backend tsc + full regression green (M0 20, M1 14, M2 13, M3 16, M4 10, events 12, CB 27, QA 333) + 6 surfaces tsc clean.

## Merchant (MRC-034→056)
- `lib/api.ts`: `getCatalogItemDetail` (variants+addons).
- `catalog.tsx`: sections create/rename/delete (409 when has items), per-item variant list + add/delete, price edit + availability retained.
- `orders.tsx`: service-requests board (MRC-014/049→056) with assign/start/complete via `getRequests/transitionRequest` (staff path live in M5 backend).

## Host (HST-007→015, 024→027)
- `portfolio.tsx`: open/closed toggle + description edit (`updateProperty`), create property (`createProperty`), guests derived list (`getGuests` — stays→profiles, no manual CRM).
- Units (HST-012→015) map to merchants in v1 data model — covered by property CRUD; dedicated units table deferred with reason.

## Consumer (CNS-001→011, 056→074)
- `other-options.tsx`: phone → backend `ensureSession()` → 4-digit verification step (CNS-003→005).
- `activity/[id].tsx`: live order-events poll 15s (`apiOrderEvents`, CNS-056→058) + existing timeline/reorder/receipt/rate/chat.
- `activity.tsx`: All/Orders/Bookings kind filter (CNS-064 bookings center).
- `api.ts`: `apiModifyBooking` (CNS-072) for reservation changes.

## Admin readonly v1 (ADM-001→012, 032→035)
- New `nexg-admin-web` Expo app (copied design-system shell): `workspace.tsx` — health, merchant list (ADM-007), semantic search (ADM-002), recent NCL audit (ADM-032), all readonly over existing endpoints. `lib/api.ts` bootstrap-admin login.

## Ops monitors v1 (OPS-003→010)
- New `nexg-ops-workspace` Expo app: `monitor.tsx` — live orders by status (OPS-004), deliveries (OPS-005), inbox events (OPS-015 feed), 15s poll (WS deferred per decisions). Admin token sees all.

## Proof
- Backend: M0 20, M1 14, M2 13, M3 16, M4 10, events 12, CB 27, QA 333 — 0 failed, same session.
- tsc clean: backend, consumer, merchant, rider, host, admin-web, ops-workspace.

## Still deferred (per PRODUCT_DECISIONS say-no + plan OUT)
Analytics charts (counts live), promos/coupons engine, org/roles UI, WS upgrade, push, M-Pesa STK, payouts/GL, fleet roles, turn-by-turn beyond link-out, messaging threads, E2E on device, staging re-baseline on real hardware.
