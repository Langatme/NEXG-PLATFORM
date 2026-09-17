# M3 Record — PASS (2026-09-11): Host MVP

Scope: booking transitions + service ops backend + host app (portfolio/calendar/stays/tasks).
Exit: backend tsc + `m3-verify` 16/16 + host app tsc clean.

## Backend
- `007_host_ops.sql` (+ init.sql): `service_requests` (kind service|housekeeping|maintenance,
  REQUESTED→…→COMPLETED/CANCELLED + INSPECTED/VERIFIED, assignee) + indexes.
- `PATCH /bookings/:id`: modify (stays CONFIRMED, edits date/guests) | checkin→CHECKED_IN |
  checkout→COMPLETED | cancel→CANCELLED (reason) | no_show→NO_SHOW. Consumers may only
  cancel/modify own; staff scoped to merchant; NCL each; idempotent replay.
- `POST|GET|PATCH /requests`: create (consumer on own booking, staff anywhere in scope),
  board filters (merchant/status/kind/booking/mine), assign/start/inspect/verify/complete/cancel.

## App (`nexg-host-app`, tsc clean)
- Foundation copied from cleaned merchant tree; host ladder (`host_staff` + property anchor).
- Screens: Portfolio (property + arrivals/in-house) · Reservations (status chips, detail) →
  booking detail (modify/checkin/checkout/cancel/no-show + reason, per-booking request list +
  add-request) · Tasks board (kind chips, per-status actions) · Account.
- Motion: `animation:'none'` tabs, native stack, haptics on stay transitions.

## Proof
`m3-verify` 16/16: calendar → modify → checkin → consumer-raised housekeeping request →
assign→start→inspect→verify → checkout → consumer-checkin 403 → own-cancel →
illegal 422 → cross-merchant 403 → replay-422 (not 500) → NCL chain
(confirmed/modified/checked_in/checked_out).

## Repairs / notes
1. **Harness**: `Start-Job` API hosting flaked (health-gate passed, node fetch refused,
   Stop-Job hung to call timeout). Switched to `Start-Process` + strict health gate —
   use this pattern for all future verify cycles.
2. **Install**: host `npm install` hit registry `ETARGET @expo/xcpretty@4.4.5` + EPERM
   cleanup; `node_modules` completed by copying the merchant tree (iOS prebuild long-path
   warnings only). `expo-maps/location` are in package.json but not installed — no code
   imports them yet (Maps via URL link). Re-run clean `npm install` when registry heals,
   before any native build.
3. Shared-code sprawl now ×4 (consumer/merchant/rider/host) — `packages/` extraction is
  M4's first job.
