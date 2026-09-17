# Prompt for the next agent — read the repo, plan MVPs → finished products

Copy everything below the line into the next agent's first message. It is written to
force evidence before synthesis, forbid rewrites, and produce an executable plan with
acceptance criteria — the working agreements this repo was built under.

---

You are taking over the NEXG platform at `Desktop/nexg-platform/`. Four apps are live
MVPs (consumer, merchant, rider, host) on one backend monolith. Your job has two phases:
**Phase 1 — read the entire repo and prove you understand it. Phase 2 — plan each MVP
to a finished product.** Do not write product code until your plan is approved.

## Phase 1 — Read (no code changes; use Read/Glob/Grep/Task-explore only)

Read in this order, in full:

1. `docs/HANDOFF.md` — current state, per-app built vs remaining, owners/dates, checklists.
2. `docs/BUILD_PLAN_MRH.md`, `docs/PRODUCT_DECISIONS.md` — locked decisions and RICE stack-rank.
3. `docs/USER_FLOWS.md`, `docs/FLOWS_MERCHANT.md`, `docs/FLOWS_RIDER.md`, `docs/FLOWS_HOST.md` — every user flow.
4. `docs/API_DATA_MAP.md`, `docs/EVENTS.md`, `docs/DB_PERF.md`, `docs/PERF_BASELINE.md` — contracts and numbers.
5. `docs/M0_RECORD.md` … `docs/M4_RECORD.md`, `docs/GAUNTLET_CONSUMER.md` — what each milestone proved.
6. `docs/EXPERIENCE_REGISTRY.json` — the 411-screen scope language (CNS/MRC/RDR/HST/OPS/ADM/PUB codes).
7. Code: `nexg-backend/src` (routes, auth/scopes, ledger, events, composer), `db/init.sql` + `db/migrations/`,
   `scripts/` (every `*-verify.js` + `perf.js` + `consumer-qa.js`), each app's `app/`, `lib/api.ts`, `lib/store.ts`,
   `packages/shared/` + `scripts/sync-shared.js`, `docker-compose.yml`.
8. `nexg-platform/nexg-consumer/` (consumer app, in-platform since M9) and
   `Desktop/nexg chatgpt chats/` (22 planning docs — the product constitution; summaries exist in-context, read full text on any ambiguity).

Then PROVE comprehension by stating, with file:line evidence: (a) the auth model
(Person→Account→roles→merchant scope) and what each role can/can't touch; (b) the NCL
ledger's guarantees and what emits to it; (c) the event system (trigger → channels →
SSE → inbox) and replay semantics; (d) the shared-code sync rule; (e) the five perf
baselines and what fixed them; (f) every KNOWN DEBT in M4_RECORD/HANDOFF §6 — quote them
back verbatim. If any of (a)–(f) is wrong, stop and re-read; do not proceed on assumptions.

## Phase 2 — Plan MVPs → finished products

For EACH app (merchant, rider, host, consumer), produce:

1. **Gap analysis**: registry IDs live today vs the HANDOFF remaining table. Every gap
   cites its registry code and flow doc section. No new screens without a registry entry.
2. **Phased plan**: slices ordered by the RICE logic in PRODUCT_DECISIONS.md (unblock
   others first, reads before writes, ledger coverage on every mutation). Each slice:
   backend endpoints (method/path/auth/scopes/NCL events), DB changes (migration number
   continued from 009, folded into `init.sql`), frontend screens (which `NexG*`
   primitives get extended — never duplicated), docs updates.
3. **Acceptance criteria per slice**: executable checks in the style of the existing
   `scripts/*-verify.js` (named script, pass counts, NCL assertions, 403/422/409 guards,
   replay/idempotency cases). A slice is done only with its script green + tsc clean in
   backend AND the touched app(s) + relevant docs updated.
4. **Cross-cutting plan**: payouts/GL, M-Pesa, sessions backend, photo/signature proof UI,
   push, analytics charts, org UI, WS-vs-poll decision with load numbers, `packages/`
   extraction completion, CI pipeline (compose boot + seed + all suites), staging
   re-baseline on real hardware.

## Working agreements (non-negotiable; violations get reverted)

- Evidence before synthesis: inspect files before claiming anything; never let prior
  summaries override what you read on disk.
- Extend, don't duplicate: theme/UI/types/utils come from `packages/shared` via
  `scripts/sync-shared.js`. New components only with a registry justification.
- API-first + mock fallback; no screen-specific backend entities; every mutation emits
  an idempotent, hash-chained NCL event carrying routing keys (`merchant_id`, `order_id`).
- Scope checks before data: staff bound to their merchant, consumers to own accounts,
  admin reads for ledger/vector.
- Verify in single-call cycles (boot API with Start-Process + health-gate + test + stop
  in ONE command); assert port 3000 free before boot; background jobs do not survive
  between calls. Never trust a green run against a possibly-stale server.
- One fix per failure, re-run the affected suite the same call; record every repair in
  the milestone record with root cause.
- Docs are part of done: HANDOFF remaining tables, API_DATA_MAP rows, flow live-marks,
  new record file per milestone.

## Output format

Respond with: (1) Phase-1 proof ((a)–(f) with file:line cites, max 40 lines); (2) the
per-app phased plan with acceptance criteria; (3) the cross-cutting plan; (4) the first
three concrete actions you will take on approval, each with the exact commands and the
suite that proves it. Then STOP and wait for approval — do not implement.
