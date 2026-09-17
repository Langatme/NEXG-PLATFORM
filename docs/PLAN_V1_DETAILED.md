# NEXG Platform — Detailed Plan: MVP → Finished v1

> Status: COMPLETE M5 (2026-09-11) — backend CB 27/27 + M0-M4/events/QA green + 4 apps tsc clean. See `M5_RECORD.md`.
> Date: 2026-09-11 (Wk1 proposal start 2026-09-14 per HANDOFF §0).
> Owner column: roles suggested, names to fill on kickoff (team 4-5+ confirmed).
> Source: all 24 files in `docs/` read verbatim + code roofs (`nexg-backend/src`, `db/migrations`, `scripts/*-verify.js`, `packages/shared`, 3 app shells, `docker-compose.yml`).
> Method: project-manager skill — Hybrid (Waterfall core + Agile slices), CPM, EVM, Risk Register.
> Bar (confirmed): slice done only with its verify script green + `tsc` clean (backend + touched app) + docs updated — same bar as M0–M4.

---

## 0. Reading proof (evidence before synthesis)

| Doc | Lines | What it locks |
|---|---|---|
| `HANDOFF.md` | 141 | Built vs remaining per app (§1-§6), staging/prod checklists (§7) |
| `BUILD_PLAN_MRH.md` | 111 | Objective, baseline §2, locked decisions §3, WBS Tracks A-G §4, phasing M0-M4 §5, motion §6, risks §7 |
| `PRODUCT_DECISIONS.md` | 45 | RICE 12 rows, 8 decision log, say-no list, personas/metrics |
| `USER_FLOWS.md` | 101 | Global rules, consumer F1-F6, merchant/rider/host flows, composer weights |
| `API_DATA_MAP.md` | 74 | 19 endpoint→tables→NCL→Admin rows, money math, write path row+NCL+vector |
| `EVENTS.md` | 52 | SSE CloudEvents, LISTEN/NOTIFY, channels, replay ≤200, inbox |
| `FLOWS_MERCHANT.md` | 49 | MRC-001→114 F1-F6, LIVE vs PLANNED tags |
| `FLOWS_RIDER.md` | 42 | RDR-001→036 golden path, OTP live / photo-sig M4 |
| `FLOWS_HOST.md` | 44 | HST-001→066, guest=mode not app |
| `NEXT_AGENT_PROMPT.md` | 80 | Phase-1 proof (a)-(f) + Phase-2 output contract |
| `DB_PERF.md` | 35 | 8 GIN trgm + 11 b-tree, ANALYZE, deliberately-NOT-done list |
| `PERF_BASELINE.md` | 50 | 2040→2125 reqs, 0 errors, bcrypt fix 2-3×, pool 10→20, regression protocol |
| `GAUNTLET_CONSUMER.md` | 49 | 332 checks, orphan mrc_002 repair, HNSW kept |
| `M0_RECORD.md` | 42 | 19/19 auth+reads+boot v0.3, 4 gauntlet repairs |
| `M1_RECORD.md` | 33 | 14/14 order transitions + merchant MVP |
| `M2_RECORD.md` | 41 | 13/13 deliveries + rider MVP |
| `M3_RECORD.md` | 38 | 16/16 bookings/requests + host MVP |
| `M4_RECORD.md` | 43 | 10/10 shared/package sync + catalog writes + MinIO + `?since=` |
| `PROMPT_CONSUMER_BACKEND_V1.md` | 117 | CB-01→CB-07 tickets + G0-G3 gates |
| `PROMPT_CONSUMER_APP_V1.md` | 139 | CNS-001→110 + PUB-001→011 checklists |
| `PROMPT_MERCHANT_V1.md` | 134 | MRC-001→114 + 6 gaps (a)-(f) |
| `PROMPT_RIDER_V1.md` | 117 | RDR-001→036 + 5 gaps (a)-(e) |
| `PROMPT_HOST_V1.md` | 118 | HST-001→066 + 5 gaps (a)-(e) |
| `EXPERIENCE_REGISTRY.json` | 21745 / 385KB | `version 1.0.0, total 411` — scope language |
| Code roofs | — | `backend/src/{auth,composer,db,embeddings,index,ledger,ratelimit,routes/auth,deliveries,discovery,domain(35KB),events,s3}`, `db/migrations/002-009`, `scripts/23 files`, `packages/shared/{theme,domain,ui,utils,hooks,composer,events}`, `scripts/sync-shared.js` 51 lines, `docker-compose.yml` 73 lines |

Known debts (verbatim from HANDOFF §6 / M4_RECORD):
1. host `node_modules` copied (clean `npm install` owed — registry ETARGET incident)
2. `expo-maps/location` listed but not installed (no imports yet)
3. `packages/shared` copies need re-sync discipline
4. Docker Desktop flakiness (restart + health-gate)
5. staging hardware still unmeasured (all numbers are dev-laptop floors)

Decisions locked (BUILD_PLAN §3 + PRODUCT_DECISIONS §log):
same-stack / monolith-grows / domain-REST-no-screen-APIs / API-first+mock-fallback-never-blank / extend-`NexG*`-never-duplicate / scope-checked-auth-before-role-mutations / HNSW-vectors / 15s-poll-first-WS-later / Enterprise=roles-not-apps / MVP≈80-of-216-screens / Guest=mode.

---

## 1. Project Charter

### 1.1 Objective
Take 4 live MVPs (consumer, merchant, rider, host) on one backend monolith to finished, shippable v1.

### 1.2 Success criteria (measured)
- Order accept p95 <2min after notify; proof attach >98%; check-in <60s
- Zero dead clicks; fallback renders stale-data on airplane mode, never blank
- NCL coverage 100% of mutations (assert via `GET /ledger/events` admin + SSE channel arrival)
- Reads p99 <500ms (baseline floors: health 23ms, discovery 36ms, search 87ms, vector 148ms, inbox 45ms); writes p99 <500ms except auth (bcrypt ~540-1350ms, re-measure on staging)
- All suites green in ONE session: m0 20 + m1 14 + m2 13 + m3 16 + m4 10 + events 12 + consumer-qa 333 + gauntlet PASS
- `tsc --noEmit` clean backend + touched app(s)

### 1.3 Scope IN
CB-01→07, merchant (a)-(f) + MRC slices, rider (a)-(e) + RDR slices, host (a)-(e) + HST slices, CI pipeline (compose boot + seed + all suites), staging re-baseline, S3 URL cutover, release-build feel-checks, `?since=` poll hold.

### 1.4 Scope OUT (do not build this plan)
- M-Pesa STK initiate + webhook (deferred per kickoff answer "all but stk push")
- Payouts/GL subledgers + merchant statements (read-only views only)
- Push infra (offers/order-states), WS upgrade (poll contract stands), tsvector ranking, partitioning triggers, replication/PITR beyond checklist
- Admin UI, rider portal native, gamification, ML recs, multi-country
- Redesigns, `MerchantCardV2`-style clones, `GET /my-*-screen-data` aggregations

### 1.5 Constraints / working agreements (non-negotiable)
1. Evidence before synthesis — prior summaries never override disk.
2. Extend-don't-duplicate via `packages/shared` + `node scripts/sync-shared.js`. Never hand-edit AUTO-SYNCED copies.
3. Every mutation emits idempotent hash-chained NCL with routing keys (`merchant_id`, `order_id`, `booking_id`); assert arrival on right SSE channel in test.
4. Scope-before-data: staff bound to `claims.merchant_id`, consumers to own accounts, ledger/vector admin-only.
5. Single-call verify: assert port 3000 free (`Get-NetTCPConnection -LocalPort 3000`) → `Start-Process` + health-gate + test + stop in ONE shell call. Background jobs die between calls.
6. One fix per failure, same-call re-run, record repair + root cause in record file.
7. Docs are part of done: HANDOFF tables, API_DATA_MAP rows, flow live-marks, new `M<n>_RECORD.md`.
8. Max 3 attempts or 150 changed lines per failure → STOP-and-report + 2 options. No new deps without approval. 90-min timebox per ticket/slice.
9. Migrations continue from `010_*` (`009_notify.sql` last on disk); always fold into `db/init.sql`; claim numbers in slice plan; overlapping numbers forbidden.
10. Motion: UI-thread only, transform+opacity, <300ms, `Easing.bezier(0.23,1,0.32,1)`, springs only finger-driven, press 0.97 + 1 haptic/commit, `animation:'none'` tabs, `formSheet` sheets, reduced-motion shipped, release-build feel-check.

Environment: Win PowerShell 5.1, backend `C:\Users\lenovo\Desktop\nexg-platform\nexg-backend` (`:3000`), DB `localhost:5433` (nexg/nexg_dev_password), MinIO `:9000/:9001`, scratch `C:\Users\lenovo\AppData\Local\Temp\opencode`, `workdir` param never `cd`.

---

## 2. WBS — Work Breakdown Structure

### Track 0 — G0/G1 re-verification (all agents, Day 1)
- 0.1 Assert `:3000` free, `docker compose up -d`, health-gate postgres+minio
- 0.2 `down -v` → up → `seed-consumer-catalog.ts` → counts (131 merchants / 639 items / 23 cats)
- 0.3 Run m0,m1,m2,m3,m4,events,consumer-qa,gauntlet in one session — must be green BEFORE any edit (G0)
- 0.4 G1 read-proof: cites for scope middleware (`src/auth.ts`), NCL append+idempotency (`src/ledger.ts`), price-truth (`domain.ts` 422 `stale_price`), SSE routing+replay (`src/routes/events.ts`), sync rule (`scripts/sync-shared.js`)
- Exit: tails pasted + `SELECT COUNT(*) FROM orders, bookings, ncl_events`

### Track CB — Consumer backend (CRITICAL PATH, leads)
- CB-01 consumer-cancel: `PATCH /orders/:id {action:"consumer-cancel"}` roles [consumer] + own-account; PLACED/CONFIRMED only; 422 after; replay 200; NCL `order.cancelled`; guards non-owned 403 / DELIVERED 422 / repeat replay; extend `m0-verify.js`; S; rollback: revert + hide button
- CB-02 suggestions: seed writer on `GET /search` → `search_history`; `GET /search/suggestions` ranked + popular; M; rollback: revert to `[]`
- CB-03 sessions: `GET /experiences` backend or documented mock-ownership + sunset condition; S/M
- CB-04 media persist: `POST /media` + consumer presign allowlist; presign→PUT→GET roundtrip; M
- CB-05 booking validation: require merchant/item/date/guests, overlap guard 409, real totals (kill `total_kes=0`); M; guards past-date 422 / double-book 409 / zero-guest 422
- CB-06 pagination: `limit/cursor + total` on 6 list endpoints + item section/availability/price filters; M
- CB-07 scoped order-events: `GET /orders/:id/events` consumer-own / staff-scoped alternative to admin ledger; S
- Plus: stock-check 422 on order lines (Wk2), token revocation + logout 401 (Wk3) — no STK this plan

### Track C — Consumer app (CNS-001→110 + PUB-001→011)
- C-01 cancel/reorder/modify wiring in `activity/[id].tsx` + services only; NCL asserted in qa ext
- C-02 live suggestions + empty-states on search/filter rails
- C-03 sessions swap (when CB-03 lands) with mock flag rollback
- C-04 saved-addresses/payments persistence vs backend; airplane-mode stale states audit
- Each slice: files ≤6, endpoints LIVE-or-backend-ticket-ref, 403/422/409+replay tests

### Track M — Merchant (MRC-001→114)
- M-01 staff `PATCH /requests` (add `merchant_staff` — owner-only today); S
- M-02 sections/variants/addons U/D (today C-only); fix `capabilities={add}` hardcode (experiences empty); remove dupe `GET /catalog/items/:id`; M
- M-03 `POST /merchants` onboarding (owner flow); M
- M-04 services MRC-049→056 CRUD on merchant tables; M
- M-05 customers 057→062 read-first from ledger; S
- M-06 promos/coupons 076→082 create + server apply; M (deferred analytics-grade perf until counts land)
- M-07 org/roles/scopes UI 094→106 (needs A1 scopes); M
- M-08 analytics counts 083→093 (charts deferred); S
- M-09 feel-check release build + Emil table sign

### Track R — Rider (RDR-001→036)
- R-01 scope-trap fix: rider reads by assigned tasks not merchant (today `GET /orders|/requests` 403); S — state-machine reason required
- R-02 merchant-cancel propagation to ACCEPTED+ tasks + NCL; S
- R-03 decline reason + re-offer; S
- R-04 photo proof attach [RDR-023]: camera in `delivery/[id].tsx`, presign→PUT→`delivered{photoUrl}`, NCL `proof.captured`; OTP remains rollback; M
- R-05 signature proof; vehicle/docs onboarding + fleet roles (M4); M/L
- R-06 turn-by-turn link-out (no new engine), SSE <2s warm measure via `sse-probe.js` pattern

### Track H — Host (HST-001→066)
- H-01 `host_*` in `PATCH /merchants/:id` (open/close own property); S
- H-02 booking validation [HST-018/022]: require merchant/item/date/guests, overlap 409, real totals; M
- H-03 bookings `status` filter + reopen + cancel/modify-after-checkin rules; S
- H-04 requests assignee/date filters + reopen + consumer-cancel-own; S
- H-05 property/unit CRUD HST-007→015; M
- H-06 guest derivation HST-024→027 (from stays, no manual CRM); M
- H-07 finance detail 046→051 readonly + analytics counts 058→061; S
- H-08 QR guest-request → board realtime (poll first); M

### Track X — Cross-cutting / DevOps (IN per kickoff)
- X-01 CI: compose boot + seed + all suites green on push (verify scripts are CI-ready)
- X-02 Staging deploy per HANDOFF §7 staging list; perf re-run becomes real baseline (replace laptop floors); raise to conc=20 + 10-min soak
- X-03 S3 URL cutover: no `media://` in API output; variants pipeline; `CDN_URL` ready
- X-04 Release builds (dev profile → EAS staged) on 1 Android + 1 iPhone; 120Hz flag confirmed; Sentry DSN on
- X-05 Docs close-out: HANDOFF tables, API_DATA_MAP rows, flow live-marks, `M<n>_RECORD.md` per milestone

---

## 3. RICE ordering (Reach=roles, Impact 1-3, Effort pw)

| Slice | Reach | Impact | Conf | Effort | Score | Verdict |
|---|---|---|---|---|---|---|
| CB-05/06 validation+pagination | all | 3 | 90% | 1 | 270 | Wk1 first (unblocks) |
| CB-01 cancel + CB-07 events | consumers | 3 | 85% | 0.5 | 510 | Wk1 |
| M-01/R-01/H-01 scope fixes | staff | 3 | 90% | 0.5 | 540 | Wk2 first |
| CB-02 suggestions | consumers | 2 | 80% | 0.75 | 213 | Wk1-2 |
| H-02/H-05 validation+CRUD | hosts | 3 | 80% | 2 | 120 | Wk2-3 |
| M-04 services | merchants | 2 | 75% | 1.5 | 100 | Wk3 |
| R-04 photo proof | riders | 3 | 75% | 1 | 225 | Wk3 |
| M-06 promos | merchants | 2 | 60% | 1.5 | 80 | Wk3-4 |
| M-07/H org UI | staff | 2 | 60% | 2 | 60 | Wk4 |
| Analytics charts | all | 1 | 50% | 3 | 17 | deferred (counts only) |
| WS realtime | all | 2 | 50% | 2 | 50 | deferred (15s poll stands) |
| STK/push/GL | — | — | — | — | — | OUT this plan |

Formula used in PRODUCT_DECISIONS: `Reach × Impact × Confidence / Effort` ranked; unblock-others-first overrides ties.

---

## 4. Schedule + Critical Path (Wk1 2026-09-14, 4-5 agents parallel)

- **Wk1 — Unblock:** Track 0 G0/G1 → CB-01/05/06/07 + migration claims (`010_cb_*`) + CI skeleton. Exit: m0+qa green + 4 ticket scripts extended.
- **Wk2 — Scope parity:** CB-02/04 + M-01/02 + R-01/02 + H-01/03 + stock-check + revocation + S3 cutover start + device feel-checks. Exit: cross-merchant/rider 403 suites + presign roundtrip + no `media://`.
- **Wk3 — Finish flows:** C-cancel/suggest + M-04/06 + R-04 + H-02/05/06 + staging deploy + perf conc=20. Exit: place→delivered <5min staging, offer→delivered <10min, book→checkout <15min.
- **Wk4 — Org + harden:** M-07 + H-04/07/08 + analytics counts + payouts-readonly + prod drill (PITR restore, rotation, rollback bundle = prev compose + DB snapshot). Exit: go/no-go (all green + perf within 2× baseline + docs current).

CPM critical path: `CB-validation/pagination → app writes → NCL/SSE assert → QA matrix (every item opens, every mutation transitions, offline stale, no blanks) → staging perf`. Non-critical (float): analytics charts, WS decision, photo/sig polish — must not delay path.

---

## 5. Resource allocation (RACI)

| Work | Backend (1-2) | Consumer-app (1) | MRH-apps (1-2) | DevOps (shared) |
|---|---|---|---|---|
| CB tickets + migrations + verify ext | R/A | C (spec needs) | C | I |
| Consumer slices | I (API) | R/A | — | — |
| M/R/H backend blocks | R/A (own blocks only) | — | R/A (own app) | — |
| `domain.ts` shared | append own blocks, never reformat others | — | same | — |
| `packages/shared` | R (promote) | C | R (edit there + sync) | — |
| CI/staging/perf/S3 | C | C | C | R/A |
| Docs/records | R (API rows) | R (flow marks) | R | R (runbooks) |

Names to fill on kickoff in HANDOFF §0 table. Teams <5 keep monolith (no new services).

---

## 6. Risk Register + mitigation

| # | Risk (source) | Prob/Impact | Mitigation | Trigger / owner |
|---|---|---|---|---|
| 1 | A-gaps stall apps (BUILD_PLAN) | H/H | Contract-first mock shaped like DTOs; CB first | Backend lead, Wk1 |
| 2 | Zombie `:3000` stale green (M4#2) | H/H | Assert port free every cycle; health-gate | All agents |
| 3 | Route edit clobbers endpoint silent (M4#1) | M/H | Re-run consumer-qa after every route edit; tsc is insufficient | Backend |
| 4 | AuthZ hole at writes (BUILD_PLAN) | M/H | Scope checks before merge; 403 matrix per slice | Backend |
| 5 | 216 screens at once (BUILD_PLAN) | H/M | MVP slices only; new screen ⇒ registry+API row first | PM |
| 6 | Shared sprawl ×4 (M1-M3) | H/M | `packages/shared` + sync; CI header check | All |
| 7 | Jank low-end Android | M/M | UI-thread rule + release feel-check gate | App devs |
| 8 | No S3 yet → blank media | M/M | Disabled upload with honest empty state until presign | Backend+app |
| 9 | Fresh-boot broken (BUILD_PLAN) | M/H | `init.sql` folded; prove `down -v` → up → seed once per milestone | Backend |
| 10 | Install ETARGET/EPERM (M3) | M/M | Retry clean install before native build; pin deps; no new deps w/o approval | DevOps |
| 11 | SSE cold 1.8-10s (PERF) | M/M | Eager LISTEN kept; inbox-poll fallback; warm measure | Backend |
| 12 | Scope creep (turnaround lesson) | M/H | Strict change control §8; say-no list enforced | PM |
| 13 | Staging != laptop (HANDOFF §6) | H/M | Re-baseline on staging HW Wk3; 2× gate | DevOps |

Contingency: 15% buffer per Wk (per skill Planning); rollback = revert single commit (reads keep working; mock fallback covers reads).

---

## 7. QA — gauntlets (loop to green per slice)

Per-slice exit (G3): backend `npx tsc --noEmit` + app `npx tsc --noEmit -p tsconfig.json` + `m0/m1/m2/m3/m4/events/consumer-qa/gauntlet` green in ONE session + new checks:
- Happy path + NCL row + vector hit (`POST /admin/search` admin)
- Guards: cross-merchant/rider 403, illegal 422, replay 200 (or 422-on-wrong-state), delete-blocked 409, oversell 422, past-date 422, double-book 409
- SSE: new event arrives on `order:<id>` / `merchant:<id>` / `rider:jobs` / `property:<id>`; replay `since_seq` ≤200
- States: loading/skeleton/empty/error/offline/refreshing (+idle/processing/success/failed for txns); click-through matrix §42 (Home→cat→item, Home→rest→menu→item→addons, Explore→cat→merchant→item, Search→sugg→merchant→item, Popular→result, Recent→result)
- Motion: Emil Before|After|Why table + device feel-check signed
- Perf: `node scripts/perf.js --concurrency=5 --iters=10 --soakSec=20`; fail p99>500ms reads or any errors; JSON artifact versioned

Regression protocol (PERF_BASELINE): after every milestone; next raise conc=20 + 10-min soak + CI nightly.

---

## 8. Change control

1. Request cites registry code + flow section + API row.
2. Impact: endpoints/auth/NCL/migration + frontend files (≤6) + tests + effort + rollback.
3. Approve only if RICE-ordered and migration number free.
4. Implement behind flag where UI-visible; mock fallback covers reads.
5. Verify G3 same call; update HANDOFF + API_DATA_MAP + flow live-mark + record file.

REJECT examples: parallel `*CardV2`, screen-specific aggregation entity, 2s polling, separate Guest app, redesign to "match new design".

---

## 9. Governance, status, EVM

- Steering: kickoff fills HANDOFF owners/dates; weekly exec review + daily standups (per skill Execution); war-room for launch week.
- Dashboards: suite pass counts (m0 20 / m1 14 / m2 13 / m3 16 / m4 10 / events 12 / qa 333), NCL coverage %, p99 trend, 403/422/409 counts, risk burn-down.
- EVM: PV = registry IDs planned per Wk; EV = IDs live-green; AC = agent-days; SPI/CPI weekly; variance >10% → re-slice.
- Success metrics (§1.2) + skill metrics: on-time rate, budget variance, defect rate, stakeholder satisfaction, mitigation effectiveness.

---

## 10. Deployment checklists (HANDOFF §7, abridged — full text authoritative)

Staging: fresh host Docker from repo only; vault secrets (`ADMIN_BOOTSTRAP_KEY`, `JWT_SECRET` ≥32, S3); seed + all suites lean perf; MinIO policy + presign roundtrip; `node dist` (not tsx); Expo dev builds Android+iPhone feel-signed; perf re-run = real baseline.
Production: managed PG16+pgvector PITR+restore-tested+replica; vault; gateway rate-limits/WAF/TLS/CORS allow-list; `node dist` ≥2 replicas; S3+CDN cutover; runbooks (restore, rotation, contacts, rollback=com pose bundle+snapshot); EAS staged + Sentry; go/no-go = green + perf ≤2× baseline + docs current.

---

## 11. First 3 actions on approval (exact commands, single-call pattern)

1. **G0 prove:** assert `:3000` free → `docker compose up -d` → seed → boot API via `Start-Process` + health-gate → `node scripts/m0-verify.js` + `node scripts/consumer-qa.js` + stop in ONE PowerShell call. Proving suite: m0 + qa tails + DB counts.
2. **G1/G2 plan lock:** paste file:line cites (scope/NCL/price/SSE/sync) + CB-01→07 slice specs (§2 format) + RICE (§3) + claim `010/011/012` numbers. Wait for validation — no code.
3. **CI skeleton:** compose-boot + seed + all-suites workflow + staging host prep; proving suite: green pipeline on push (lean perf).

Then STOP per `NEXT_AGENT_PROMPT` output contract §§75-80 — implement only after G2 approval.

---

## 12. Per-app gap → slice traceability (so no gap is lost)

- Consumer-backend gaps §3 PROMPT_CONSUMER_BACKEND → Track CB (7 tickets) → `API_DATA_MAP` new rows + `M5_RECORD.md`.
- Consumer-app gaps (cancel UI, suggestions UI, sessions, empty-states, persistence) → Track C → `activity/[id].tsx` + `services/` only.
- Merchant gaps (a)-(f) PROMPT_MERCHANT §3 → Track M M-01→03 → `m1/m4-verify` ext + `M6_RECORD.md`.
- Rider gaps (a)-(e) PROMPT_RIDER §3 → Track R R-01→05 → `m2-verify` ext + `M7_RECORD.md`.
- Host gaps (a)-(e) PROMPT_HOST §3 → Track H H-01→08 → `m3-verify` ext + `M8_RECORD.md`.
- Cross (sessions backend, S3 URLs, ranking, push-STK-OUT, analytics, org, WS, packages extraction, CI, staging) → Track X → `M9_RECORD.md` + HANDOFF close-out.

---

*Plan v1.0 — 2026-09-11. Changelog: initial MVP→V1 detailed plan from 24-doc verbatim read; team 4-5+ parallel; CB-first; CI+staging IN, STK OUT; strict Done bar. Next: G0 run → G1 proof → G2 approval.*
