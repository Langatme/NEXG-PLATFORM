# M2 Record — PASS (2026-09-11): Rider MVP

Scope: delivery tasks backend + rider app (jobs/delivery/earnings/account).
Exit: backend tsc + `m2-verify` 13/13 + rider app tsc clean + M0 still 20/20.

## Backend
- `006_deliveries.sql` (+ init.sql): `delivery_tasks` (status machine OFFERED→…→DELIVERED/
  FAILED/CANCELLED, proof JSONB, rider anchor) + indexes.
- Routes: `GET /rider/jobs?status=` (open offers + own tasks), `GET /deliveries/:id`
  (+lines, rider/merchant scoped), `PATCH /deliveries/:id` (guarded transitions,
  proof required for delivered, idempotent replay), `POST /uploads/presign`
  (S3 PUT URLs — binary never through API), `GET /rider/earnings` (derived from
  delivered tasks + order fees, read-only).
- Handoff auto-offers the task (`delivery.offered` NCL). Earnings = Σ fees_kes.
- Proof contract: `{otp} | {photoUrl} | {signature}`; photo upload = presign + PUT.

## App (`nexg-rider-app`, tsc clean)
- Foundation copied from cleaned merchant tree + `expo-maps/location` + svg.
- `lib/api.ts`: rider ladder (login-or-register kind=rider), jobs/delivery/earnings,
  presign + photo PUT helper. `lib/store.ts`: auth + online toggle + restore.
- Screens: Jobs (online switch, offers, pull-refresh, 15s poll = realtime contract),
  Active (jumps to current task), delivery detail (step actions, OTP input, Maps link,
  report-problem), Earnings (derived hero), Account. Haptics on commit.
- Motion: `animation:'none'` tabs, native stack, press primitives; device feel-check
  needs a release build.

## Proof
`m2-verify` 13/13: offer visibility → accept→…→OTP delivered → proof-required 422 →
replay → cross-rider 403 → earnings → presign URL → NCL chain
(offered/accepted/picked/delivered).

## Repairs
1. **Rider register demanded merchant_id** (rule covered all staff kinds) → scoped to
   merchant/host staff only. Caught by gauntlet, not users.
2. **Replay test wrong**: re-sending `accept` on DELIVERED must 422 (it does); replay
   verified with current-state action instead.

## Open (M3+)
Photo/signature proof UI (OTP only now), MinIO live for PUTs, push for offers,
navigation turn-by-turn, fleet/supervisor roles, payouts, shared-package extraction
still pending (theme/ui/utils now ×3).
