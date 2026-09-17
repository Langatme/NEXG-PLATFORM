# PROMPT — Rider App + Surface (v2.0): MVP → finished v1

> Folded from `PROMPT_RIDER_V2.md` (deleted) — single spec file per surface.
> For the pre-M5 baseline this supersedes, see git history / M2–M4 records.

> Paste everything below the `===` line as the agent's first message. Self-contained:
> the agent needs only this file plus repo access. Version footer at the end.

===

You own the NEXG **rider surface end-to-end**: app at
`C:\Users\lenovo\Desktop\nexg-platform\nexg-rider-app` AND its backend slice in
`C:\Users\lenovo\Desktop\nexg-platform\nexg-backend`. Mission: rider MVP → finished v1:
offers → navigate → pickup → deliver → proof → earnings, all live. Do not touch other apps.

**Done means:** Checklist A (all RDR IDs below) ticked; Checklist B journeys measured;
backend tsc + app tsc clean; m2 suite green plus new checks; docs updated.

## 1. Environment (Windows PowerShell 5.1, exact paths)

- App (Expo ~57.0.20, RN 0.86.3, Router ~57.0.9, TS ~6.0.3, Zustand+MMKV, React Query,
  Reanimated 4.5.1). Routes on disk (verified): `app/_layout.tsx`, `app/index.tsx`,
  `app/delivery/[id].tsx`, `app/(tabs)/_layout.tsx`,
  `app/(tabs)/{jobs,delivery,earnings,account}.tsx`. `lib/{api,store,composer,events}.ts`
  (`composer`/`events` AUTO-SYNCED — see §9). Deps include `expo-maps` + `expo-location`.
- Backend `http://localhost:3000`, DB `localhost:5433`; migrations continue from `012_*`
  (`011_messaging.sql` taken — verify with `ls db/migrations` at G0, claim next free,
  fold into `db/init.sql`). Roles you use: rider (+admin in
  tests). Single-call verify cycles; assert port 3000 free; `EXPO_PUBLIC_API_URL` set.
- Scratch: `C:\Users\lenovo\AppData\Local\Temp\opencode`. `workdir`, never `cd`.

## 2. Read first (no code changes until G1 passes)

1. `../docs/HANDOFF.md` §4 + `FLOWS_RIDER.md` + `M2_RECORD.md` + `EVENTS.md` (rider:jobs).
2. Registry rider entries RDR-001→RDR-036 in `EXPERIENCE_REGISTRY.json`.
3. Code: the 8 app routes + `lib/api.ts` + `lib/store.ts` (online toggle, session);
   backend `src/routes/deliveries.ts`, order handoff hook in `domain.ts`, `src/s3.ts`.
4. `scripts/m2-verify.js` — extend, don't replace.

## 3. Current state (verified 2026-09-11 — confirm, don't assume)

- LIVE: rider ladder (self-register, no merchant anchor), job board (`GET /rider/jobs`,
  15s poll + SSE live-invalidate on `rider:jobs`), delivery stepper
  (accept→…→OTP-proof delivered), earnings derived readonly, presign PUT helper, account,
  haptics on commit, online toggle gates polling only.
- Delivery machine: OFFERED→ACCEPTED(claims rider)→ARRIVED_PICKUP→PICKED→ARRIVED_DROP→
  DELIVERED(proof required)→FAILED; decline→CANCELLED; idempotent replay; cross-rider 403.
- GAPS you own: (a) **rider scope trap** — self-registered rider has no `merchant_id`, so
  `GET /orders` + `GET /requests` 403 via requireMerchantScope; fix by scoping rider reads
  to assigned tasks (not merchant); (b) photo/signature proof UI (backend accepts
  `{otp|photoUrl|signature}`, presign live); (c) no merchant-cancel propagation to
  `ACCEPTED+` tasks (cancel after handoff dangles the task — add transition + NCL);
  (d) decline has no reason + no re-offer; (e) vehicle/docs onboarding, fleet roles,
  payouts, turn-by-turn nav, push for offers unbuilt.
- CLOSED in M5/M8 (do not redo): (c) `reoffer`/`cancel` transitions + staff
  cancel/reoffer + decline reason stored; (d) `declineWithReason`, reoffer flow,
  `deliverWithPhoto/Signature/Otp` in lib; proof inputs + decline gate in
  `delivery/[id].tsx`; order-chat thread panel (M8 shared system).
- REMAINING (your v1 slices, §6b): **R-01 scope-trap fix** (rider in `GET /orders`
  roles at `domain.ts:567` but `requireMerchantScope` 403s merchant-less riders passing
  `?merchant=`, while omitting it returns ALL orders unscoped — scope to assigned
  tasks); **R-02 backend-backed vehicle/docs onboarding + account surfaces
  [RDR-004→007, 031→036]**; **R-03 proof hardening [RDR-023]**. RDR-008→022, 024→027
  live. RDR-028→030: earnings live, payouts deferred-with-note (no GL — stays OUT).

## 4. Hard gates (blocking — STOP, report, wait at each)

- **G0**: boot+seed, `m2-verify.js` green BEFORE any edit.
- **G1**: read-proof — cites for delivery machine, proof contract, presign flow, SSE
  wiring in `jobs.tsx`; run-and-report suite tail + delivery/task counts. Wait.
- **G2**: slice plan approval (§6). **G3**: per slice — both tsc clean + suite green +
  new checks + docs.

## 5. Definition of Done — BOTH required

**Checklist A (RDR IDs — tick all):** 001 Rider Entry, 002 Sign In, 003 Sign Up,
004 Verification, 005 Document Submission, 006 Vehicle Setup, 007 Onboarding Status,
008 Rider Workspace, 009 Online/Offline Control, 010 Availability, 011 Job Queue,
012 Job Offer, 013 Job Detail, 014 Job Acceptance, 015 Navigation to Pickup,
016 Pickup Arrival, 017 Pickup Verification, 018 Pickup Confirmation, 019 Active Delivery,
020 Navigation to Drop-off, 021 Drop-off Arrival, 022 Customer Verification,
023 Proof of Delivery, 024 Delivery Confirmation, 025 Delivery Issue, 026 Failed Delivery,
027 Rider Support, 028 Earnings, 029 Earnings Detail, 030 Payouts, 031 Profile,
032 Vehicle, 033 Documents, 034 Notifications, 035 Settings, 036 Help.
Mark live/deferred-with-note each.
**Checklist B (outcomes):** offer→accept→delivered with OTP <10 min staging; proof-required
422 suite; cross-rider 403 suite; airplane-mode shows last jobs + stale banner; SSE event
reaches jobs screen <2s warm (measure via `scripts/sse-probe.js` pattern); reads p99
within PERF_BASELINE.md.

## 6. Slice format + example

`Slice R-<nn>: <title> [RDR-x..y] — Backend (method/path/auth/scopes/NCL/migration) —
Frontend (screens, primitives extended) — Tests (script + guard cases) — Effort —
Depends — Rollback.` Example — *Slice R-04: photo proof attach [RDR-023]*. Backend: none
(presign + proof contract live); frontend: camera capture in `delivery/[id].tsx`,
presign→PUT→`delivered{photoUrl}`; NCL `proof.captured` asserted; guards: PUT failure
keeps OTP path, oversize file 422; effort M; rollback: revert commit, OTP remains.
REJECTED example: polling every 2s "for freshness" — 15s contract stands; use SSE events.

## 6b. Remaining v1 slices (registry-anchored — every ID below must tick live or deferred-with-note)

- `Slice R-01: assignment-scoped rider reads` — Backend: scope `GET /orders` (+ rider-
  reachable `GET /requests`) for role=rider to tasks assigned via
  `delivery_tasks.rider_account_id` (OFFERED pool stays visible for the jobs board);
  merchant-less `?merchant=` no longer 403-or-leak; NCL unchanged (reads); no migration
  (query-only — state why). Frontend: none (job detail already renders). Tests: extend
  m2-verify — assigned sees own, unassigned 403, param-omitted scoped (not ALL),
  cross-rider 403 retained; effort S; depends on none; rollback: revert commit.
  Do first — security.
- `Slice R-02: onboarding [RDR-004→007, 031→036]` — Backend: migration
  (`rider_profiles`: docs JSONB + photo keys via presign, vehicle, status
  pending/approved/rejected+reason), `POST|PATCH /rider/profile` + admin approve, NCL
  `rider.submitted|approved|rejected`; roles rider+admin, own-account or admin.
  Frontend: onboarding wizard (docs → vehicle → status with what-to-fix) + profile/
  vehicle/documents rows + notifications/settings/help polish in account tab. Tests:
  submit→pending→approve→active, reject-reason 422, photo-key roundtrip; effort L;
  rollback: revert commit + migration down (ladder untouched).
- `Slice R-03: proof hardening [RDR-023]` — Offline proof-PUT queue + retry (never lose
  proof), ≤2-tap failed-delivery audit, rating-internal wiring. Effort S.

## 7. Fix-and-continue bounds (anti-derail)

Max 3 attempts or 150 lines per failure, then STOP-and-report with root cause + 2 options.
No scope beyond the slice's RDR IDs. No refactors outside touched files. No new npm deps
without approval (`expo-maps/location` already vendored — use them, don't add MapLibre).
Shared files: `packages/shared/` + sync only (§9). 90-minute slice timebox, then report.

## 8. Scope OUT + file sharing

OUT: payouts/GL, push infra, fleet/supervisor consoles, merchant/host/consumer apps,
turn-by-turn engine beyond link-out (resolve the `expo-maps/location` listed-not-installed
debt inside R-02/R-03 prep: install-and-wire link-out upgrade or remove the listing —
no MapLibre, don't expand scope). Platform context (all apps): consumer rebuilt
in-platform (M10, live); merchant/host MVP live + thread panels (M8); admin/ops readonly
v1 live (M6); shared messaging (`packages/shared/messaging.ts` + sync) assumed live.
`domain.ts` + `deliveries.ts` are SHARED:
append route blocks only, touch your blocks; claim free `0xx_` migration numbers in-plan;
`deliveries.ts` transitions table edits need a stated reason (state machine is contract).
Conflicts → STOP and ask.

## 9. Shared rules (identical in all five prompts)

Evidence before synthesis. Extend-don't-duplicate via sync script. Every mutation emits
idempotent hash-chained NCL with routing keys — assert arrival on `rider:jobs` SSE in
tests. Scope-before-data. Single-call verify cycles; port-free assertion. One fix per
failure, same-call re-run, record repairs. Docs part of done (HANDOFF, API_DATA_MAP,
flow live-marks, `M<n>_RECORD.md`). Motion: UI thread only, transform+opacity, <300ms,
springs for finger-driven, press-in feedback + one haptic per commit, reduced-motion
shipped, release-build feel-check.

## 10. Output contract

(1) Phase-1 proof ≤40 lines. (2) Slice plan in §6 format. (3) RICE table.
(4) First 3 actions with exact commands + proving suite. Then STOP.

*Prompt v2.0 — 2026-09-12. Changelog: folded from PROMPT_RIDER_V2 (deleted) — single
spec per surface; M5/M8 closures marked live; remaining v1 = R-01→R-03; onboarding
confirmed backend-backed by owner; payouts/push/fleet/turn-by-turn stay OUT;
platform-wide context added.*
