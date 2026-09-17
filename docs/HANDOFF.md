# NEXG Platform — Project Handoff (2026-09-12, supersedes 2026-09-11 edition)

Owner column: role suggested; names unassigned — fill on kickoff. Dates are proposal
windows (Wk1 starts 2026-09-14). Status rule: an item is done only with its gauntlet
green + docs updated. Certified this session: m0 20/20, m1 14/14, m2 13/13, m3 16/16,
m4 10/10, events 12/12, cb 27/27, msg 9/9, consumer-qa 333/333 — 0 failed, one shell
call; tsc clean on backend + all 6 apps (consumer, merchant, rider, host, admin, ops).

Start here: mission is MRH v1 (host, rider, merchant MVP → finished v1). Read
`docs/PROMPT_MERCHANT_V1.md`, `PROMPT_RIDER_V1.md`, `PROMPT_HOST_V1.md` (v2.0 inside —
the old V2 files were folded in and deleted; one spec per surface). Registry
`docs/EXPERIENCE_REGISTRY.json` (411 entries: MRC 1–114, RDR 1–36, HST 1–66) is the
scope language: every ID ticks live-or-deferred-with-note. First slice is R-01
(rider scope-trap fix — security).

## 0. Where everything lives

`Desktop/nexg-platform/` — `nexg-backend/` (Node+Express+TS, Postgres 16+pgvector,
MinIO) · `nexg-consumer/` (REAL in-platform Expo app, rebuilt M10 after the M9 symlink
loss; external `wolt-react-native-main` tree is deleted — do not reference it) ·
`nexg-merchant-app/` · `nexg-rider-app/` · `nexg-host-app/` · `nexg-admin-web/` ·
`nexg-ops-workspace/` (both readonly v1, M6) · `packages/shared/` (design-system +
messaging client source of truth; sync via `node scripts/sync-shared.js`, which also
covers `messaging.ts`; consumer owns its originals — hand-copy) · `docs/` (M0–M10
records + per-surface prompts + flows) · `docker-compose.yml` (postgres host :5433,
adminer :8080, minio :9000/:9001).

Run/verify: `docker compose up -d` → `node --import tsx scripts/seed-consumer-catalog.ts`
→ API via tsx (`node --import tsx src/index.ts`) or compiled (`npm run build` +
`node dist`) → `node scripts/{m0,m1,m2,m3,m4,events,cb,msg,consumer-qa,perf}.js`.
Docs entry: `docs/BUILD_PLAN_MRH.md`. Verify pattern that works: boot API with
`Start-Process` + health-gate + test + stop in ONE shell call (background jobs do not
survive between calls); assert port 3000 free before boot (zombie servers served stale
code twice). Never trust `Test-Path`/`Get-ChildItem`/robocopy codes on paths that may
be reparse points — run `cmd /c dir` (shows `<SYMLINKD>`) before ANY mirror/wipe/delete
(M9 rule). No symlinks for app code from here on.

## 1. Consumer app — REBUILT LIVE (M10)

Real directory, fresh install (915 packages, `expo-image@57.0.2` pinned — the registry's
`~57.0.1` copy was an unbuilt husk). 43 routes: auth suite, QR + deep links, home,
search (live suggestions/sort/filter/history), merchant/item modals, full checkout,
activity detail (timeline, 15s polls, contact sheets, cancel, reorder), inbox +
conversations, account depth. API-first, honest offline states.
Verified: `consumer-qa` 333/333, `msg-verify` 9/9, app tsc clean.

| Remaining | Owner (assign) | Target | Exit |
|---|---|---|---|
| Camera QR scan (native dep) | App dev | Wk3 | Scan→property→board journey |
| Backend-persisted profiles/payments | Backend + app | Wk4 | Survives reinstall test |
| S3 image URLs replacing `media://` keys | Backend + app dev | Wk2 | No `media://` in API output |
| Push notifications (offers, order states) | App dev | Wk3 | Device receipt logged |
| Turn-by-turn maps, ML recommendations | App dev | Wk5+ | On-device proof |

## 2. Backend — LIVE core, hardened through M8

60+ endpoints — auth (roles/scopes/refresh/bootstrap, revocation list, native bcrypt),
catalog CRUD (sections/variants/addons U/D, capabilities), order/booking transitions
(guards, idempotent replay, consumer-cancel, stock guard, overlap guard, real totals),
deliveries (reoffer/cancel/decline-reason), service requests (staff + consumer-cancel
paths, filters), `POST /merchants` onboarding, presigned uploads (+consumer), discovery
composer, vector search (HNSW, stub embeddings), ledger reads, SSE streams + inbox,
**shared messaging** (`POST/GET /messages`, `GET /messages/threads`, NCL `message.sent`
fan-out; migration `011_messaging.sql`), rate limits, pool 20, pg_trgm + FK indexes,
slow-query log. Migrations 002–013 folded into `init.sql` (next free: `014_*`).
Verified: all suites above green, tsc + compiled `dist` proven vs live DB.

| Remaining | Owner (assign) | Target | Exit |
|---|---|---|---|
| Promos/coupons tables + apply path | Backend dev | v1 (M-13) | Apply-e2e, expired 422, double-redeem 409 |
| `units` table + CRUD | Backend dev | done H-05 | h5 9/9: create→publish, cross-property 403, 409 delete-with-bookings |
| `rider_profiles` + approve flow | Backend dev | v1 (R-02) | Submit→approve→active |
| `GET /customers`, `GET /finance/summary`, `GET /staff` derived views | Backend dev | v1 (M-11/M-12/M-14) | 403 cross-merchant suite |
| Payouts/GL subledgers + merchant statements | Backend dev | post-v1 | Balanced entries test |
| M-Pesa STK initiate + webhook | Backend dev | post-v1 | Sandbox charge→webhook→NCL |
| WebSocket upgrade (poll contract today) | Backend dev | post-v1 | Load test on sockets |
| tsvector ranking, partitioning triggers | Backend dev | post-v1 | Per DB_PERF.md thresholds |
| CI: compose boot + seed + all suites | DevOps | Wk2 | Green pipeline on push |

## 3. Merchant app — v1 LIVE (M-10→M-16, M-18 done in M11)

Built: staff ladder, Orders queue + full transition loop + customer-message threads,
catalog sections/variants/addons/media/publish + service-request board + services UI,
customers derived view, finance 12-view detail, promos engine (apply 422/409),
org/staff list + settings/support, analytics charts, workspace composer.
Verified: app tsc, backend tsc, m1 14/14, m4 10/10, m10 10/10, m13 13/13, cb 27/27,
events 12/12, msg 9/9. Spec: `PROMPT_MERCHANT_V1.md` §6b (all ticked).

| Remaining (v1) | Owner (assign) | Target | Exit |
|---|---|---|---|
| M-10 catalog finish + services CRUD [MRC-033→056] | App (+tiny backend) | done M11 | Service round-trip + NCL test green |
| M-11 customers [057→062] | App + backend | done M11 | Derived view, empty 200 green |
| M-12 finance detail [063→075] | App + backend | done M11 | 12 views from ledger green |
| M-13 promos engine [076→082] | App + backend | done M11 | Full engine green |
| M-14 org/roles [094→106] | App + backend | done M11 | Invite→accept journey (self-register code) |
| M-15 settings/support [107→114] | App dev | done M11 | Support→thread |
| M-16 analytics charts [083→093] | App dev | done M11 | Dependency-free bars green |
| M-18 workspace composer [011→016] | App dev | done M11 | Attention queue live |

## 4. Rider app — MVP LIVE, v1 slices specified (R-01→R-03)

Built: rider ladder, online toggle, job board (15s poll + SSE), delivery stepper
(OTP/photo-URL/e-sign proof, decline-reason, reoffer), earnings readonly, order-chat
panel, account. Verified: app tsc, m2 journey. Spec: `PROMPT_RIDER_V1.md` §6b.
Known debt: `expo-maps/location` listed-not-installed — resolve inside R-02/R-03 prep
(install-and-wire link-out upgrade or remove listing; no MapLibre).

| Remaining (v1) | Owner (assign) | Target | Exit |
|---|---|---|---|
| R-01 scope-trap fix (assigned-task scoping) | Backend dev | **First (security)** | Assigned-sees-own, unassigned 403 |
| R-02 vehicle/docs onboarding, backend-backed [004→007, 031→036] | App + backend | v1 | Submit→approve→active |
| R-03 proof hardening (offline queue, ≤2-tap fail flow) | App dev | v1 | Never-lose-proof test |
| Payouts / push / fleet / turn-by-turn engine | — | post-v1 (OUT) | Deferred with reason |

## 5. Host app — MVP LIVE, v1 slices specified (H-05→H-12)

Built: host ladder + property anchor, guest preview (Continue-as-guest like consumer:
auto-provisioned consumer-role identity, read-only boards, writes staff-gated 403),
portfolio (arrivals/in-house, open toggle,
description/media/amenities/policies editors, create property, derived guests, units
list/create/edit/toggle/delete — H-05 done, h5 9/9), reservations (server status filter,
calendar ordering fix), full stay lifecycle + validation, requests + filters, thread
panels, account. Verified: app tsc, backend tsc, m3 16/16, h5 9/9. Spec: `PROMPT_HOST_V1.md` §6b. Tabs stay
fixed: Portfolio · Reservations · Stays · Account.

| Remaining (v1) | Owner (assign) | Target | Exit |
|---|---|---|---|
| H-05 property/unit CRUD finish [007→015] | App + backend | done | h5 9/9 + m3 16/16 green, both tsc clean |
| H-12 calendar month view + rates [019→021] | App dev | done | Month grid + dots from ?from&to + day sheet + unit-rate editor, app tsc clean |
| H-06 guest graph [024→027] | App dev | done | Guest detail (stays/history/spend, derived) + contact-thread panel, app tsc clean, thread round-trip verified |
| H-07 rosters + assignment | App + backend | done | Reused shared GET /staff (host roles added, no duplicate); roster + assignee picker in Tasks, both tsc clean |
| H-08 finance detail [046→051] | App + backend | done | Reused shared /finance/summary (host roles added) + stay-revenue derived; settlements/payouts/invoices deferred-with-note (GL OUT), both tsc clean |
| H-09 org + settings [052→057, 062→066] | App + backend | done | Members/roles live (shared staff); support = merchant-tagged thread (verified 201+read); teams/permissions/locations deferred-with-note; app tsc clean |
| H-10 analytics charts [058→061] | App dev | done | Property/revenue/occupancy bars, same dependency-free approach as M-16, app tsc clean |
| H-11 QR surfacing (`origin: 'qr'` filter) | App + backend | done | Origin passthrough + ?origin= filter (201/422/200 verified) + QR chip/badge on tasks board, regressions green |

## 6. Cross-cutting — LIVE

Shared messaging client/hook/thread UI in `packages/shared` (synced to merchant/rider/
host; hand-copied to consumer/admin/ops). Events (SSE CloudEvents + inbox + replay +
scope guards), pgvector search, perf harness + `PERF_BASELINE.md` (dev-laptop floors;
staging re-baseline still owed), 411-screen registry, RICE decisions, M0–M10 records.
Known debts: `expo-maps/location` phantom dep; Docker Desktop flakiness (restart +
health-gate); staging hardware unmeasured. Host hardening backlog (v1 slices H-05→H-12
done 2026-09-12: h5 9/9, m3 16/16, cb 27/27, msg 9/9, events 12/12, host-reads p99 ≤91ms
0 errors; both tsc clean): (1) offline check-in queue with conflict resolution
(edge case in FLOWS_HOST, currently error-state + retry); (2) S3/CDN cutover for
property media (`hero_image_key` stored, `media://` tile placeholder in app until
`CDN_URL` cutover + `POST /media` attach); (3) staging perf re-baseline on real
hardware + EAS builds + Sentry DSN (full `perf.js` hangs on Win Node SSE teardown —
use targeted probe until fixed). RICE run order: R-01 → M-10 → H-05 →
M-13 ∥ R-02 → M-11/M-12 → H-06/H-07 → org/settings → charts → fillers.

## 7. Deployment checklists

### Staging (mirrors prod at reduced scale)
- [ ] Fresh host with Docker; `docker compose up -d` from this repo only (no local state)
- [ ] `ADMIN_BOOTSTRAP_KEY`, `JWT_SECRET` (≥32 chars), S3 creds set from vault (never committed)
- [ ] Seed + full suite green on staging (`m0..m4`, `events`, `cb`, `msg`, `consumer-qa`, `perf` lean profile)
- [ ] MinIO bucket + download policy verified; presign PUT→GET roundtrip
- [ ] Compiled `node dist` serves staging (not tsx); health + `/readyz` if added
- [ ] Expo staging builds (development profile) on one Android + one iPhone; feel-checks signed
- [ ] Perf re-run on staging hardware becomes the real baseline (replace laptop numbers)

### Production
- [ ] Managed Postgres 16 + pgvector (or pinned image), PITR + tested restore, replica +
  lag alerts; `shared_buffers` 25% RAM, autovacuum scale ≤0.05 on ledger/docs tables
- [ ] Secrets in vault; bootstrap key unset; tightened rate limits at gateway; WAF/TLS;
  CORS allow-list (no open `cors()`)
- [ ] `node dist` replicas (≥2) behind gateway with health checks; pool sized to cores;
  MinIO→managed S3 + CDN (`CDN_URL` cutover; re-index media URLs)
- [ ] M-Pesa paybill/till + webhook allow-list live-tested with real KES 1 charges
- [ ] Runbooks: restore-from-backup drill, key rotation, incident contacts, rollback =
  previous compose bundle + DB snapshot
- [ ] Store builds (EAS) with staged rollout; crash reporting (Sentry DSN) on;
  `CADisableMinimumFrameDurationOnPhone` confirmed for 120Hz
- [ ] Go/no-go gate: all suites green on staging + perf within 2× of baseline + docs current
