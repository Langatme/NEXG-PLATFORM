# Rider v1 Record — PASS (2026-09-12): market-ready (R-01→R-06)

Scope: R-01 scope-trap fix + R-02 LIMTAI onboarding + R-03 proof hardening +
R-04 native camera + R-05 push for offers + R-06 maps-debt hardening.
Exit: backend tsc clean + rider tsc clean + m0 20/m1 14/m2 17/m3 16/m4 10/
events 12/cb 27/msg 9/rider-onboarding 9 green + docs updated.

## Backend (`nexg-backend`, tsc clean)
- **R-01** (`auth.ts`, `domain.ts`): rider exempt from `no_merchant_scope`;
  `GET /orders` + `GET /requests` scoped to `delivery_tasks.rider_account_id`
  assigned tasks; `GET /orders/:id` requires assigned or OFFERED link
  (`not_your_order` 403). OFFERED pool stays on `GET /rider/jobs`.
  No migration (query-only). `m2-verify` +4: assigned-sees-own,
  `?merchant=` scoped not 403-or-leak, unassigned empty (not ALL),
  detail unassigned 403. Cross-rider 403 retained.
- **R-02** (`012_rider_profiles.sql` + folded into `init.sql`): `rider_profiles`
  (type independent|dedicated|fleet, personal/identity/vehicle/docs/payout/
  emergency JSONB, services, shift/zone, company, fleet_riders, status
  pending/approved/rejected+reason) + indexes. `GET|POST /rider/profile`
  (own) + `PATCH /rider/profile/:account` (admin approve/reject, reason
  required). NCL `rider.submitted|approved|rejected`.
  `rider-onboarding-verify` 9/9: submit→pending→approve, 422s, cross-rider
  guard, photo-key presign roundtrip, NCL chain.
- **R-05** (`013_push_tokens.sql` + folded): `push_tokens` + `POST /rider/push-token`
  (422 bad token) + best-effort Expo broadcast on `delivery.offered`
  (poll+SSE remain contract; never rejects offer).

## App (`nexg-rider-app`, tsc clean)
- `app/onboarding.tsx` (new): LIMTAI 6-step wizard (pathway → personal →
  ID+vehicle (Dedicated skips logbook, shift/zone) → docs via
  `expo-image-picker` presign PUT → payout/emergency (+fleet company) →
  review + typed e-sign + terms → Pending Review; rejected shows
  what-to-fix). `lib/api.ts`: profile + presignDoc client.
  `app/(tabs)/account.tsx`: onboarding status + deep link.
- **R-03**: offline proof queue (`queueProof/flushProofQueue` MMKV, never lose;
  flush on jobs focus/online) + ≤2-tap `failed` retained + internal
  star rating (local, post-DELIVERED).
- **R-04**: native camera (`launchCameraAsync` → presign PUT → `photoUrl`;
  OTP/signature retained as fallback). Deps approved + installed:
  `expo-image-picker`, `expo-notifications`, `expo-device`.
- **R-05**: `lib/push.ts` + jobs auto-register (failures never block jobs).
- **R-06**: `expo-maps/location` verified installed (True); link-out
  (`Open in Maps`) remains nav contract — no MapLibre, no turn-by-turn engine.

## Proof
- Backend `tsc --noEmit` exit 0; rider `tsc --noEmit -p tsconfig.json` clean.
- m0 20, m1 14, m2 17, m3 16, m4 10, events 12, cb 27, msg 9,
  rider-onboarding 9 — 0 failed (rate-limit note: run onboarding apart
  from m2/m0 in one boot; stacked auth registers 429).
- Push: 201 valid + 422 bad-token live.

## Repairs
1. Duplicate `lim/off` const after R-01 insert (orders + requests) — removed
   second declaration, one-line each. Caught by tsc, not users.
2. Combined-boot 429 (`M2_FATAL fetch failed` after onboarding in same boot):
   auth limiter 300/min per IP — run suites in separate boots. Not a code bug.
3. Backend `tsc` `$?` False misread — actual `exit=0` clean (PowerShell `$?`
   reflects wrapper, use `$LASTEXITCODE`).

## Still OUT (deferred-with-note)
Payouts/GL subledgers, fleet supervisor console (CSV stays web), turn-by-turn
engine, WS upgrade, analytics charts. Camera QR scan stays native-dep backlog
(consumer-side); rider QR not required.

## Supervision audit vs registry (36/36 ticked live-or-deferred)
- Registry `RDR-001→036` extracted (36 rows; per-screen api/ncl are generic
  planning text — real contracts in `FLOWS_RIDER` + `API_DATA_MAP`).
- Live: 001 entry→jobs redirect, 002/003 sign-in gate (rider ladder),
  004→007 + 031/032/033 onboarding wizard + profile/vehicle/docs rows,
  008→014 jobs board + SSE + accept, 015/020 Maps link-out (engine OUT per
  scope), 016→018/021→022 stepper, 019 active redirect, 023 OTP+camera+e-sign
  + offline queue, 024 confirmation + internal rating, 025/026 1-tap failed,
  027 order thread + 036 support thread, 028/029 earnings + fee rows,
  034 inbox screen (`GET /inbox`), 035 settings (theme/online/queue/push note).
- Deferred-with-note (explicit, no blank): 030 payouts (caption corrected to
  post-v1, no GL), turn-by-turn engine beyond link-out, WS upgrade.
- Fixed in audit: new `app/notifications.tsx`, `app/help.tsx`,
  `app/settings.tsx`; account deep-links; `JobDto.fees_kes` surfaced;
  payouts caption `M4`→post-v1. Rider `tsc` 0; m0 20/m2 17/onboarding 9/
  events 12/msg 9 green same session (separate boots for rate limit).
