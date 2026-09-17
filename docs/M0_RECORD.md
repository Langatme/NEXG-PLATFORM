# M0 Record — PASS (2026-09-11)

Scope: A1 role auth + A2 reads + A5 boot fix. Exit: fresh volume → boot → seed →
tsc + `m0-verify` 19/19 + `gauntlet-verify` PASS + `consumer-qa` 333/333.

## Shipped

- **Auth**: self-register `customer|merchant_staff|rider|host_staff` (+`merchant_id`
  required for staff, FK-checked); owner/admin via `POST /auth/accounts` (admin token
  or `ADMIN_BOOTSTRAP_KEY`); `POST /auth/refresh` rotation; refresh-as-access rejected;
  `POST /auth/logout`. Claims carry `merchant_id` + `scope: merchant:<id>`.
- **Scopes**: `requireMerchantScope` — admin passes; staff bound to their merchant
  (403 cross-merchant on list + detail); consumers bound to own account.
  `POST /admin/search` locked to admin (was open).
- **Reads**: `GET /orders?merchant&status&mine`, `GET /orders/:id` (+lines),
  `GET /bookings?merchant&from&to&mine`, `GET /bookings/:id`,
  `GET /ledger/events?entity_type&entity_id&event_type` (admin).
- **IDs**: `ord|bkg_<base36time>_<6rand>` (replaces `Date.now()` collisions).
- **Price truth**: lines with `item_id` repriced from catalog, mismatch → 422
  `stale_price` + current price (client refetches menu); custom lines keep client
  price (catering/specials, flagged for later).
- **Boot**: `init.sql` v0.3 consolidated (002–005 folded, indexes, demo seeds);
  proven by `down -v` → up → seed 131/131 → all suites green.

## Gauntlet repairs (loop findings)

1. **`uuid = text` crash**: `$3::text IS NULL OR account_id = $3` — the explicit
   `::text` cast poisoned the param type for the uuid comparison. Fixed with
   `account_id = $3::uuid`. Rule: never reuse a `::text`-cast param against a
   uuid column.
2. **Express 4 async throws kill the process**: added `unhandledRejection` guard
   (logs, keeps alive). Long-term: wrap handlers or move to Express 5.
3. **Port-3000 ghost**: background API jobs don't survive between shell calls —
   all verify cycles now boot + health-gate + test + stop in ONE call.
4. **Test harness vs new locks**: `gauntlet-verify` + `consumer-qa` now assert the
   401 lock, then provision a bootstrap admin for the vector path.

## Open (M1+ per BUILD_PLAN_MRH)

Order transitions (accept→ready), catalog CRUD, deliveries/tasks, presign upload,
server stock check, M-Pesa, WS/poll realtime, revocation list, pagination,
popular-search ranking, sessions backend.
