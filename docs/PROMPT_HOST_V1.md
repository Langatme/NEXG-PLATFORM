# PROMPT — Host App + Surface (v2.0): MVP → finished v1

> Folded from `PROMPT_HOST_V2.md` (deleted) — single spec file per surface.
> For the pre-M5 baseline this supersedes, see git history / M3–M4 records.

> Paste everything below the `===` line as the agent's first message. Self-contained:
> the agent needs only this file plus repo access. Version footer at the end.

===

You own the NEXG **host surface end-to-end**: app at
`C:\Users\lenovo\Desktop\nexg-platform\nexg-host-app` AND its backend slice in
`C:\Users\lenovo\Desktop\nexg-platform\nexg-backend`. Mission: host MVP → finished v1:
properties → reservations → stays → services → finance, all live. Do not touch other apps.

**Done means:** Checklist A (all HST IDs below) ticked; Checklist B journeys measured;
backend tsc + app tsc clean; m3 suite green plus new checks; docs updated.

## 1. Environment (Windows PowerShell 5.1, exact paths)

- App (Expo ~57.0.20, RN 0.86.3, Router ~57.0.9, TS ~6.0.3, Zustand+MMKV, React Query,
  Reanimated 4.5.1). Routes on disk (verified): `app/_layout.tsx`, `app/index.tsx`,
  `app/booking/[id].tsx`, `app/(tabs)/_layout.tsx`,
  `app/(tabs)/{portfolio,reservations,tasks,account}.tsx`. `lib/{api,store,composer,events}.ts`
  (`composer`/`events` AUTO-SYNCED — see §9).
- Backend `http://localhost:3000`, DB `localhost:5433`; migrations continue from `012_*`
  (`011_messaging.sql` taken — verify with `ls db/migrations` at G0, claim next free,
  fold into `db/init.sql`). Roles you use: host_owner|
  host_staff (+admin in tests). Single-call verify cycles; assert port 3000 free.
- Scratch: `C:\Users\lenovo\AppData\Local\Temp\opencode`. `workdir`, never `cd`.

## 2. Read first (no code changes until G1 passes)

1. `../docs/HANDOFF.md` §5 + `FLOWS_HOST.md` + `M3_RECORD.md` + `EVENTS.md` (property channels).
2. Registry host entries HST-001→HST-066 in `EXPERIENCE_REGISTRY.json`.
3. Code: the 8 app routes + `lib/api.ts` + `lib/store.ts` (property anchor);
   backend bookings + `service_requests` sections in `domain.ts`, `src/auth.ts` scopes.
4. `scripts/m3-verify.js` — extend, don't replace. Guest = mode, not an app (constitution).

## 3. Current state (verified 2026-09-11 — confirm, don't assume)

- LIVE: host ladder (`host_staff` + property anchor; owner via invite/bootstrap), portfolio
  (arrivals/in-house), reservations (status chips, `?merchant&from&to&mine&since`), stay
  lifecycle (modify/checkin/checkout/cancel+reason/no-show, consumer limited to
  cancel/modify own), per-booking service requests, task boards by kind
  (assign/start/inspect/verify/complete/cancel), account.
- GAPS you own: (a) `host_*` excluded from `PATCH /merchants/:id` — cannot open/close own
  property; (b) booking POST unvalidated (merchant/item optional, no date/guest/overlap
  checks, `total_kes=0`); (c) no `status` filter on bookings list, no reopen, no
  cancel/modify after checkin rules; (d) requests lack assignee/date filters + reopen,
  consumer cannot cancel own request; (e) HST-007→015 property/unit CRUD, 024→027 guest
  derivation, 046→051 finance detail, 052→057 org, 058→061 analytics unbuilt.
- CLOSED in M5/M6/M8 (do not redo): (a) PATCH allows `host_*`; (b) booking validation
  (merchant/item/date/guests, overlap 409, real totals); (c) `status` filter + pagination
  + calendar ordering fix; (d) assignee/since/limit/offset filters + staff + consumer-
  cancel paths; property open/close toggle + description edit + create property + derived
  guests list (M6); thread panels on booking detail (M8 shared system). Tabs stay fixed:
  Portfolio · Reservations · Stays · Account — new UI goes in these tabs, no new tabs.
- REMAINING (your v1 slices, §6b): **H-05** property/unit CRUD finish (media/amenities/
  policies + `units` table + UI) [HST-007→015]; **H-12** calendar month view +
  availability dots + rate management [HST-019→021]; **H-06** guest detail/history +
  thread communication [HST-024→027]; **H-07** rosters + assignment; **H-08** finance
  detail [HST-046→051]; **H-09** org + settings [HST-052→057, 062→066]; **H-10**
  analytics charts [HST-058→061]; **H-11** QR surfacing. HST-016→018/022→023/028→045
  live.

## 4. Hard gates (blocking — STOP, report, wait at each)

- **G0**: boot+seed, `m3-verify.js` green BEFORE any edit.
- **G1**: read-proof — cites for stay machine, request machine, property scoping, sync rule;
  run-and-report suite tail + booking/request counts. Wait.
- **G2**: slice plan approval (§6). **G3**: per slice — both tsc clean + suite green +
  new checks + docs.

## 5. Definition of Done — BOTH required

**Checklist A (HST IDs — tick all):** 001 Host Entry, 002 Sign In, 003 Organization Setup,
004 Host Workspace, 005 Properties, 006 Property Detail, 007 Create Property,
008 Edit Property, 009 Property Media, 010 Amenities, 011 Policies, 012 Units,
013 Unit Detail, 014 Create Unit, 015 Edit Unit, 016 Reservations, 017 Reservation Detail,
018 Reservation Creation, 019 Availability, 020 Calendar, 021 Rate Management,
022 Reservation Modification, 023 Cancellation, 024 Guests, 025 Guest Detail,
026 Guest History, 027 Guest Communication, 028 Check-in, 029 Check-in Verification,
030 Stay Overview, 031 Check-out, 032 Services, 033 Service Request,
034 Service Request Detail, 035 Service Assignment, 036 Service Execution,
037 Housekeeping, 038 Housekeeping Task, 039 Task Assignment, 040 Task Execution,
041 Maintenance, 042 Maintenance Request, 043 Maintenance Detail,
044 Maintenance Assignment, 045 Maintenance Execution, 046 Finance, 047 Transactions,
048 Revenue, 049 Settlements, 050 Payouts, 051 Invoices, 052 Organization, 053 Members,
054 Teams, 055 Roles, 056 Permissions, 057 Locations, 058 Analytics,
059 Property Analytics, 060 Revenue Analytics, 061 Occupancy Analytics, 062 Settings,
063 Integrations, 064 Notifications, 065 Support, 066 Audit Activity.
Mark live/deferred-with-note each.
**Checklist B (outcomes):** book→modify→checkin→serve→checkout <15 min staging round-trip;
overbook attempt blocked with alternatives; no-show + offline check-in queue paths resolve;
guest profile derives from stays (no manual CRM); reads p99 within PERF_BASELINE.md.

## 6. Slice format + example

`Slice H-<nn>: <title> [HST-x..y] — Backend (method/path/auth/scopes/NCL/migration) —
Frontend (screens, primitives extended) — Tests (script + guard cases) — Effort —
Depends — Rollback.` Example — *Slice H-04: booking validation [HST-018/022]*.
Backend: require merchant/item/date/guests on POST, overlap guard 409, real totals;
frontend: surface 422s in `booking/[id].tsx` create form; NCL unchanged shape; guards:
past-date 422, double-book 409, zero-guest 422; effort M; rollback: revert commit.
REJECTED example: a separate Guest app — constitution bans it; guest is a mode.

## 6b. Remaining v1 slices (registry-anchored — every ID below must tick live or deferred-with-note)

- `Slice H-05: property/unit CRUD [HST-007→015]` — Backend: extend `PATCH
  /merchants/:id` allowlist (media keys, amenities[], policies) + migration
  (`units`: property→units FK) + `POST|PATCH|DELETE /units` + `unit.added` NCL;
  roles host_owner/staff+admin, own-property scope. Decision stated: units get their
  own table (cleaner guards than merchant-mapped M6 deferral). Frontend: property
  detail/media/amenities/policies editors + units list/detail/create/edit in Portfolio
  tab, extend `NexG*` only. Tests: extend m3-verify — create→publish, toggle,
  cross-property 403, NCL assert; guards: unknown property 404, delete-with-bookings
  409; effort M–L; depends on none; rollback: revert commit + migration down.
- `Slice H-12: calendar & rates [HST-019→021]` — Backend: none new (bookings filters
  live). Frontend: month view + availability dots + rate management in Reservations
  tab. Tests: dots match query month; effort S–M.
- `Slice H-06: guest graph [HST-024→027]` — Backend: none (bookings+NCL live; M6
  `getGuests`). Frontend: guest list → detail (stays/history/spend) → communication
  via messages thread (M8 — the old "read-only until thread model" note is retired).
  Effort S–M.
- `Slice H-07: rosters + assignment` — Backend: `GET /staff?merchant=` scoped (ONE
  owner across merchant/host — if merchant M-14 builds it first, reuse it; duplicates
  forbidden). Frontend: roster screen + assignee picker on requests. Effort M.
- `Slice H-08: finance detail [HST-046→051]` — Mirror merchant M-12, host-flavored
  (revenue/settlements/payouts/invoices readonly). Effort M. Depends: M-12 pattern.
- `Slice H-09: org + settings [HST-052→057, 062→066]` — Mirror merchant M-14/M-15
  (members/teams/roles/permissions/locations; settings/integrations/notifications/
  support/audit-as-NCL-read). Effort M.
- `Slice H-10: analytics charts [HST-058→061]` — Same SVG approach as M-16
  (property/revenue/occupancy). Effort S–M. Depends: H-08.
- `Slice H-11: QR surfacing` — Consumer QR live (M7). Backend: `origin` passthrough
  on requests (`origin: 'qr'`, additive field) + filter. Frontend: QR chip/filter on
  tasks board. Effort S.

## 7. Fix-and-continue bounds (anti-derail)

Max 3 attempts or 150 lines per failure, then STOP-and-report with root cause + 2 options.
No scope beyond the slice's HST IDs. No refactors outside touched files. No new npm deps
without approval. Shared files: `packages/shared/` + sync only (§9). 90-minute slice
timebox, then report.

## 8. Scope OUT + file sharing

OUT: payouts/GL, QR hardware, messaging threads (LIVE since M8 — the old "read-only until
thread model" note is retired; use threads for H-06 communication),
consumer/merchant/rider apps. Analytics charts ARE in (H-10, custom SVG via vendored
`react-native-svg`). Platform context (all apps): consumer rebuilt in-platform (M10,
live); merchant/rider MVP live + thread panels (M8); admin/ops readonly v1 live (M6);
shared messaging (`packages/shared/messaging.ts` + sync) assumed live.
`domain.ts` bookings/requests blocks are SHARED: append
only, claim free `0xx_` numbers in-plan, never reformat others' code. Conflicts → STOP.

## 9. Shared rules (identical in all five prompts)

Evidence before synthesis. Extend-don't-duplicate via sync script. Every mutation emits
idempotent hash-chained NCL with routing keys — assert arrival on `property:<id>` SSE in
tests. Scope-before-data. Single-call verify cycles; port-free assertion. One fix per
failure, same-call re-run, record repairs. Docs part of done (HANDOFF, API_DATA_MAP,
flow live-marks, `M<n>_RECORD.md`).

## 10. Output contract

(1) Phase-1 proof ≤40 lines. (2) Slice plan in §6 format. (3) RICE table.
(4) First 3 actions with exact commands + proving suite. Then STOP.

*Prompt v2.0 — 2026-09-12. Changelog: folded from PROMPT_HOST_V2 (deleted) — single
spec per surface; M5/M6/M8 closures marked live; remaining v1 = H-05→H-11 + H-12;
charts confirmed IN by owner; threads note retired (M8); staff-endpoint single-owner
rule added for M-14 overlap; platform-wide context added.*
