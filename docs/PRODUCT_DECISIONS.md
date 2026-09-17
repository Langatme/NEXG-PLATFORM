# Product Decisions — Merchant / Rider / Host program

Problem: three role apps must become functional on one backend without forking the
platform. Strategy: backend leads (critical path), shared design system, MVP slices
per app, everything else explicitly deferred with criteria to return.

## RICE prioritization (Reach = roles affected, Impact 1–3, Effort person-weeks)

| Slice | Reach | Impact | Confidence | Effort | Score | Verdict |
|---|---|---|---|---|---|---|
| A1 auth+scopes+boot fix | all apps | 3 | 90% | 1 | 270 | M0 first |
| Merchant orders loop (F3) | merchants | 3 | 85% | 1.5 | 170 | M1 |
| Rider job+delivery+proof (F3–F4) | riders | 3 | 80% | 2 | 120 | M2 |
| Host reservations+stay (F2–F4) | hosts | 3 | 80% | 2 | 120 | M3 |
| Catalog read in apps | merchants/hosts | 2 | 95% | 0.5 | 380 | free (LIVE reads) |
| Catalog CRUD | merchants | 2 | 70% | 2 | 70 | M4 |
| Earnings/payouts views | riders/hosts | 2 | 60% | 1.5 | 80 | M4 (readonly) |
| Analytics charts | all | 1 | 50% | 3 | 17 | deferred |
| Coupons/promos create | merchants | 1 | 60% | 1.5 | 40 | M4 |
| WebSocket realtime | all | 2 | 50% | 2 | 50 | deferred (poll first) |
| Rider Portal native | riders | 1 | 40% | 3 | 13 | deferred (docs: TBD) |

Say-no list: Admin UI, rider portal, gamification, ML recommendations, multi-country.

## Decision log

1. **Same stack, extend don't duplicate** — one design system; shells import consumer
   theme/components. Revisit if an app needs a capability Expo can't do.
2. **Monolith grows; no services** — team <5, boundaries clean. Revisit at ops pain.
3. **API-first + mock fallback** — offline-first per UX laws; fallback is stale-data
   state, never blank. No silent mock writes once API path exists (must surface).
4. **Scope-checked auth (A1) before role mutations** — any-owner-mutates-anything is a
   ship-blocker; found in inventory, fixed before M1.
5. **HNSW not ivfflat** — ivfflat/lists=10 returns zero rows on tiny tables (measured).
6. **Poll (15s) before WebSocket** — jobs/order-state don't need sockets at MVP scale.
7. **Guest = mode, Enterprise = roles** — per platform docs; no extra apps.
8. **MVP ≈ 80 of 216 screens** — registry IDs mark scope; new screen ⇒ registry entry
   + API row first (change control).

## Personas & success metrics

Merchant owner (fulfill fast, know performance) · Rider (earn with minimal taps) ·
Host staff (no guest waits). Metrics: order accept p95 <2min after notify; proof attach
success >98%; check-in <60s; zero dead clicks; fallback renders on airplane mode;
NCL coverage 100% of mutations; gauntlet green per app.
