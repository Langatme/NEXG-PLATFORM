# docs/CHECKLIST_MAP.md — Excel 647 ↔ registry 411 (system of record; .xlsx is NEVER edited)

Method: workbook parsed read-only (Python stdlib zipfile+xml). Build Tracker (sheet19) = 647 rows; every row reads Completion 0.0 with Design/Backend/Frontend/QA flags 0 — the workbook is aspiration, not state. Shipped truth = EXPERIENCE_REGISTRY.json (411) + gauntlets M0–M11 / RIDER_V1 / SPLASH (all green) + HANDOFF remaining tables.

> Per-module covered/deferred/out splits below are audited estimates from M-records + HANDOFF, not a row-by-row tick. Row-level ticking of all 647 Tracker rows to registry IDs is owed.

## 1. Module crosswalk

| Excel module | Tracker IDs (n) | Registry ↔ scope language | App folder | Standing |
|---|---|---|---|---|
| Admin | ADM-* (110) | ADM-001→038 + OPS-001→036 | nexg-admin-web + nexg-ops-workspace (readonly v1, M6) | mostly OUT (say-no) |
| Vendor | VEN-* (111) | MRC-001→114 | nexg-merchant-app | v1 LIVE (M11: M-10→M-16 + M-18) |
| Rider | RID-* (98; Rider sheet also holds 5 QR-*) | RDR-001→036 | nexg-rider-app | MVP LIVE; R-01→R-06 done, 36/36 ticked live-or-deferred |
| Host | HST-* (88) | HST-001→066 | nexg-host-app | MVP LIVE; H-05→H-12 done (h5 9/9, m3 16/16) |
| Guest | GST-* (136) | CNS-001→110 + PUB-001→011 | nexg-consumer (43 routes, QA 333/333) | LIVE with backlog (HANDOFF §1) |
| QR System | QR-* (104) | none — cross-cutting (RSC-MDA-004 scanner, RSC-MDL-009 viewer, H-11 origin filter, R-04 camera) | all apps + backend verify paths | partial LIVE |

Counts verified: Excel Admin 110 / Vendor 111 / Rider 98 / Host 88 / Guest 136 / QR 104 = 647; registry ADM 38 / CNS 110 / HST 66 / MRC 114 / OPS 36 / PUB 11 / RDR 36 = 411. Sheet13 = 43 CHK-*, sheet14 = 28 CMP-*, sheet15 = 13 MDL-*, sheet16 = 22 ANM-*, sheet17 = 102 RSC-* (all CHK Mandatory=Yes).

## 2. Per-module verdicts

### Admin — 110 total | covered ~24 | deferred-with-note ~26 | OUT ~60
Covered: readonly parity only (scoped search, ledger reads, staff/org reads, dashboard reads via M6 readonly web/ops).
Deferred: admin write paths (approve flows already live via APIs: rider approve, promos) — return only if readonly breaks.
OUT: full Admin UI build — say-no per PRODUCT_DECISIONS (stays readonly v1).

### Vendor — 111 | covered ~92 | deferred ~13 | OUT ~6
Covered: orders transition loop (m1 14/14), catalog CRUD+publish+media (m10 10/10), customers/finance-12/promos/staff (m13 13/13), settings/support, analytics-lite bars, workspace composer (M11).
Deferred: payouts/GL subledgers, M-Pesa STK/webhook, CSV export, multi-location, Expo-Web portal, WS upgrade.
OUT: ML recommendations, multi-country (KES-only), gamification for merchants.

### Rider — 98 | covered ~78 | deferred ~12 | OUT ~8
Covered: ladder/auth, jobs board (poll 15s + SSE), stepper (OTP/camera/e-sign, R-04), offline proof queue + ≤2-tap fail (R-03), onboarding wizard LIMTAI 6-step (onboarding 9/9), earnings readonly, threads, push token best-effort (R-05), maps link-out (R-06).
Deferred: payouts, fleet supervisor console, WS upgrade, turn-by-turn engine, camera QR scan (consumer-side dep).
OUT: rider portal native app, gamification/leaderboards (RSC-BDG-005 stays unused), ML dispatch.

### Host — 88 | covered ~70 | deferred ~12 | OUT ~6
Covered: ladder + property anchor, portfolio/units CRUD (h5 9/9), reservations server filter + calendar fix, stay lifecycle, requests + filters, threads, guest graph derived, rosters via shared /staff, finance via shared /finance/summary, charts (H-10), QR origin filter (H-11).
Deferred: offline check-in queue w/ conflict resolution, S3/CDN cutover (media:// → CDN_URL), settlements/payouts/invoices (GL OUT), teams/permissions/locations splits, staging perf re-baseline.
OUT: multi-property enterprise console, ML pricing, multi-country tax.

### Guest — 136 | covered ~104 | deferred ~20 | OUT ~12
Covered: 43 consumer routes (auth, QR+deep links, home, search live, modals, checkout, activity timeline, inbox, account) — consumer-qa 333/333, msg 9/9.
Deferred: camera QR scan (native dep), backend-persisted profiles/payments, S3 image URLs (media:// today), push notifications, turn-by-turn maps.
OUT: ML recommendations, gamification/loyalty-tiers engine (beyond points display), multi-country.

### QR — 104 | covered ~64 | deferred ~26 | OUT ~14
Covered: GEN/VER verify flows (OTP, delivery proof, H-11 origin passthrough + ?origin= filter), viewer/scanner blocks (RSC-MDL-009/MDA-004), visual standards via logo tokens.
Deferred: native camera scan path, QR audit console (admin OUT → API/NCL only), LIF lifecycle webhooks, VEN/DEL bulk issuance UI.
OUT: QR as standalone product, cross-border/multi-currency QR rails.

## 3. Deferred-with-note — criteria to return (all must hold)

1. RICE re-score ≥80 (Reach×Impact×Confidence/Effort, PRODUCT_DECISIONS table) — else stays deferred.
2. Backend path first: API row + migration (next free 014_*, folded into init.sql) + gauntlet green before any app UI.
3. No new native dependency without install-and-wire plan (expo-maps/location rule); no web-only lib in Expo (SPEC-DESLOPIFY Boundaries).
4. Poll/SSE contract stands until a load test on staging proves sockets needed (WS rule).
5. Revisit trigger named per item (e.g. payouts return when GL subledgers + balanced-entries test exist; M-Pesa when sandbox charge→webhook→NCL proven).
6. Row re-enters via registry entry + API row + M-record (change control); CHECKLIST_MAP updated in the same slice.

## 4. Say-no list (OUT — PRODUCT_DECISIONS.md + record OUT sections)

Admin UI full build · rider portal native · gamification (tiers/leaderboards/achievement economy) · ML recommendations/pricing · multi-country (currency/tax/phone beyond KE) · payouts/GL + M-Pesa until post-v1 triggers · WS upgrade · turn-by-turn engine (link-out is the contract) · fleet supervisor console · tsvector/partitioning until DB_PERF thresholds demand.

## 5. CHK-* enforcement in SPEC-DESLOPIFY.md (all 43 CHK are Mandatory=Yes; flip Planned→Verified per slice)

| CHK group | n | Enforced as |
| CHK-PRD-001→006 (naming, ID, goal, owner, priority, deps) | 6 | Change control: no new screen without registry entry + API row. |
| CHK-UX-001→009 (flow, components, modals, animations, empty/loading/error, responsive, a11y) | 9 | Deslopify feel-check gate: full state cycles, adaptive mobile, contrast both themes, Reduce-Motion path. |
| CHK-CMP-001→003 (reuse, document new, variants) | 3 | Shared-system lock: extend NexG*/tokens, never duplicate; sync-shared.js verified. |
| CHK-FE-001→005 (build, validation, states, responsive, animations) | 5 | Slice exit: touched-app tsc + lint clean, skeletons match final shape, tap ≥44pt. |
| CHK-BE-001→007 (schema, API, logic, validation, authN/Z, logging) | 7 | Backend gates: scope-check 403 suite, NCL 100% mutations, 422/409 guards, idempotent replay. |
| CHK-QA-001→005 (acceptance, edge, permissions, integration, perf) | 5 | Verify scripts per slice (deslop-*.js) + perf within 2× baseline. |
| CHK-DOC-001→004 (spec-40, API, DB, xrefs) | 4 | HANDOFF status rule: done only with gauntlet green + docs updated. |
| CHK-REL-001→004 (review, QA, docs, release) | 4 | Market-ready gate: staging checklist + go/no-go. |

## 6. Libraries → gates (sheets14–17)

- UI Component Library: 28 CMP-* → adopt into `packages/shared/ui` NexG* (40 primitives); CMP-DAT-007 Chart stays dependency-free bars (M-16/H-10 precedent); CMP-FRM-005 QR Scanner → native-dep backlog. Gate: CHK-CMP.
- Modal Library: 13 MDL-* → navigation laws (modal=self-contained task + Cancel/Done; formSheet short interruptions; no stacking) + ANM-MDL-001/002 (250/200ms scale+fade). Gate: CHK-UX-003.
- Animation Library: 22 ANM-* → motion tokens (UI thread only, transform+opacity, <300ms, bezier(0.23,1,0.32,1), press 0.97 + haptic, Reduce-Motion cross-fade). Gate: CHK-UX-004 + CHK-FE-005.
- Resale Components: 102 RSC-* → vendor-triage adopt/adapt/reject per Expo compat; live precedents: RSC-CHT-002 bars (M-16/H-10), RSC-FRM-004/005 checkout/onboarding wizards, RSC-TML-001/003 timelines; OUT: RSC-BDG-005 achievements, RSC-MAP-002 live-tracking, RSC-GRD-002 Kanban. Gate: CHK-CMP + picker rule.
