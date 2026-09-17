# M4 Record — PASS (2026-09-11): Polish (shared code, catalog writes, uploads live, polling)

Scope: stop ×4 sprawl, merchant catalog management, MinIO live, efficient polling.
Exit: `m4-verify` 10/10 + full regression (M0 20, M1 14, M2 13, M3 16, gauntlet, QA 333)
+ backend/merchant tsc clean.

## Shared code (sprawl fix)
- `packages/shared/` (theme, domain, ui, utils, hooks, composer) is the source of truth.
- `scripts/sync-shared.js` stamps copies into the three apps with an AUTO-SYNCED header.
  Rule: edit packages, re-sync, never hand-edit copies. Consumer owns its originals
  (promote deliberately). All three apps tsc-clean post-sync.

## Backend
- Catalog CRUD (own-merchant/admin, NCL each): `POST /catalog/sections`,
  `POST|PATCH|DELETE /catalog/items` (price/tags/availability/popularity; delete 409
  when referenced by order/booking history — history immutable), variant + addon-group
  upserts, `PATCH /merchants/:id` (open/active/description/eta/min-order).
- Polling: `?since=` on orders/bookings/jobs (realtime contract: 15s poll; WS deferred).
- MinIO in compose (`:9000` API, `:9001` console, `nexg-media` bucket, download policy
  via `minio-init`). `POST /uploads/presign` → PUT → GET roundtrip verified byte-exact.

## App
- Merchant catalog: per-item price edit + availability switch, add-item form, search,
  dimmed unavailable rows. `MerchantCatalogItem` type carries `isAvailable`.

## Proof
`m4-verify` 10/10: create→patch→toggle→variant/addon→delete-clean→delete-blocked(409)→
cross-merchant 403→open-toggle→since-poll→MinIO roundtrip.

## Repairs
1. **GET detail route clobbered** by a bad edit — restored + tsc caught nothing (route
   absence is silent); QA matrix is the real guard. Lesson: re-run consumer-qa after
   every route-file edit.
2. **Phantom 403 on bookings+since**: a zombie server from a killed call held :3000 with
   older code. Now every verify cycle asserts the port is free before boot.
3. **Host `npm install`**: registry `ETARGET @expo/xcpretty@4.4.5` + EPERM cleanup;
   completed from merchant tree. `expo-maps/location` in package.json but not installed
   (no code imports yet). Clean reinstall owed before any native build.

## Open (post-M4)
Analytics charts, promos create, org UI, payouts/GL, push notifications, WS decision,
photo/signature proof UI, sessions backend, E2E on device, CI (compose boot + seed +
all suites — the verify scripts are CI-ready).
