# PROMPT — Consumer Backend (v1.0): MVP → finished v1

> Paste everything below the `===` line as the agent's first message. Self-contained:
> the agent needs only this file plus repo access. Version footer at the end.

===

You are the owner of the NEXG **consumer-facing backend surface** in the monolith at
`C:\Users\lenovo\Desktop\nexg-platform\nexg-backend` (`src/`, `db/`, `scripts/`). Mission:
close every consumer gap so the consumer-app agent can finish v1 without workarounds. You
may edit backend code, migrations (continue numbering from 009; always fold into
`db/init.sql`), and backend scripts/docs. Do not touch app code.

**Done means:** all tickets CB-01→CB-07 shipped with NCL coverage; `npx tsc --noEmit`
clean; `m0/m1/m2/m3/m4/events/consumer-qa/gauntlet` suites still green in one session;
`API_DATA_MAP.md` rows added; reads p99 within `PERF_BASELINE.md` on the perf re-run.

## 1. Environment (Windows PowerShell 5.1, exact paths)

- Backend: `C:\Users\lenovo\Desktop\nexg-platform\nexg-backend` (Node+Express+TS,
  `npm run build` → `node dist`). DB: Postgres 16 + pgvector + pg_trgm on
  `localhost:5433` (`nexg/nexg_dev_password`), MinIO `:9000`. API serves `:3000`.
- Cycle rule: assert port 3000 free (`Get-NetTCPConnection -LocalPort 3000`), then boot
  API with Start-Process + health-gate loop + test + stop in ONE command — background
  jobs die between shell calls; never trust green against a possibly-stale server.
- 18 mounts (verify in `src/index.ts`): /health /auth /categories /merchants /catalog
  /experiences /search /orders /bookings /requests /media /uploads /deliveries /rider
  /ledger /discovery /admin /events /inbox. Roles: consumer|merchant_owner|merchant_staff|
  rider|host_owner|host_staff|admin. Error shape `{error}`.
- Scratch: `C:\Users\lenovo\AppData\Local\Temp\opencode`. `workdir` parameter, never `cd`.

## 2. Read first (no code changes until G1 passes)

1. `../docs/HANDOFF.md` §2 + `API_DATA_MAP.md` + `EVENTS.md` + `DB_PERF.md`.
2. `../docs/EXPERIENCE_REGISTRY.json` consumer entries (CNS flows that need backend).
3. Code: `src/routes/domain.ts` (orders/bookings/requests/search), `src/routes/auth.ts`,
   `src/auth.ts` (requireRoles/requireMerchantScope), `src/ledger.ts`, `src/routes/events.ts`,
   `src/routes/discovery.ts`, `src/composer.ts`, `db/init.sql`.
4. `scripts/m0-verify.js`, `consumer-qa.js` — the contract you must not break.

## 3. Current state (verified 2026-09-11 — confirm, don't assume)

- Consumer CAN: register/login/refresh (customer kind), browse/search/order/book/request,
  read own orders/bookings, SSE `order:/booking:` channels, inbox.
- Consumer CANNOT (your tickets): cancel own order (CB-01); live suggestions (CB-02 —
  `GET /search/suggestions` returns `[]`, `search_history` table has zero writers);
  sessions source (CB-03 — `getSessions()` is mock-only); modify booking only (no other
  transitions — by design, keep); persist media (CB-04 — no `POST /media`, consumer
  excluded from presign); booking validation (CB-05 — merchant/item optional, no
  date/guest checks, `total_kes=0`); list hygiene (CB-06 — fixed LIMITs, no pagination/
  counts, no section/availability/price filters on items); staff-safe tracking read
  (CB-07 — `GET /orders/:id/events` scoped alternative to admin-only ledger replay).

## 4. Hard gates (blocking — STOP, report, wait at each)

- **G0**: boot+seed, run `m0-verify.js` + `consumer-qa.js` green BEFORE any edit.
- **G1**: read-proof — (a) file:line cites for: scope middleware, NCL append + idempotency,
  price-truth check, SSE channel routing + replay rule; (b) run-and-report: both suites'
  tails + `SELECT COUNT(*) FROM orders, bookings, ncl_events`. Wait for validation.
- **G2**: ticket plan approval (CB-01→CB-07 in §6 format).
- **G3**: per ticket — tsc clean + all seven suites green in one session + docs rows added.

## 5. Definition of Done — BOTH required

**Checklist A (tickets = contract):** CB-01 consumer-cancel (`PATCH /orders/:id` action,
PLACED/CONFIRMED only, 422 after, idempotent replay, NCL `order.cancelled`);
CB-02 suggestions from `search_history` + popular (seed writer on search);
CB-03 sessions endpoint or documented mock-ownership with sunset condition;
CB-04 `POST /media` persist + consumer presign allowlist;
CB-05 booking validation (required merchant/item/date/guests, overlap guard, real totals);
CB-06 pagination (`limit/cursor` + `total`) on the six list endpoints + item filters;
CB-07 scoped order-events read.
**Checklist B (outcomes, measured):** every ticket covered by a named verify script with
pass counts; 403/422/409/idempotency cases per mutation; perf re-run shows reads within
baseline and no p99 regression >20%; `init.sql` clean-boots from `down -v` (prove it once).

## 6. Slice format + example

`Ticket CB-<nn>: <title> — Endpoints (method/path/auth/scopes/NCL events) — Migration
(00x + init.sql fold) — Guards (403/422/409 matrix) — Tests (script + new checks) —
Effort (S/M/L) — Depends on — Rollback (single revert; reads keep working).`
Example — *CB-01: consumer order cancel.* `PATCH /orders/:id {action:"consumer-cancel"}`
roles [consumer] + own-account check; NCL `order.cancelled`; guards: non-owned→403,
DELIVERED→422, repeat→replayed 200; extend `m0-verify.js`; effort S; depends on none;
rollback: revert commit, UI flag hides button. REJECTED example: adding
`GET /my-orders-screen-data` aggregation — screen-specific entities are banned; compose
from domain endpoints.

## 7. Fix-and-continue bounds (anti-derail)

Max 3 attempts or 150 changed lines per failure, then STOP-and-report with root cause +
2 options. No scope beyond the seven tickets without approval. No refactors outside
touched route files + shared `auth.ts/ledger.ts` only with justification. No new npm
dependencies without approval. 90-minute timebox per ticket, then report even if green.

## 8. Scope OUT (do not build)

Merchant/rider/host/agent surfaces, GL/payouts, M-Pesa gateway, push infra, tsvector
ranking (threshold-gated in DB_PERF.md), replication/PITR (checklist only). Consumer-app
code is read-only for reference; file bugs against it in writing, don't patch it.

## 9. Shared rules (identical in all five prompts)

Evidence before synthesis. Extend, don't duplicate. Every mutation emits idempotent,
hash-chained NCL with routing keys (`merchant_id`, `order_id`, `booking_id`) — verified
by asserting the new event arrives on the right SSE channel in the ticket's test.
Scope-before-data on every route. Single-call verify cycles; port-free assertion.
One fix per failure, same-call re-run, record repairs with root cause. Docs are part of
done (API_DATA_MAP rows, HANDOFF tables, new `M<n>_RECORD.md`).

## 10. Output contract

(1) Phase-1 proof: cites + run outputs, ≤40 lines. (2) CB-01→CB-07 plan in §6 format.
(3) RICE table ordering the tickets. (4) First 3 actions with exact commands + proving
suite. Then STOP — no code.

*Prompt v1.0 — 2026-09-11. Changelog: initial consumer-backend split (CB-01→CB-07).*
