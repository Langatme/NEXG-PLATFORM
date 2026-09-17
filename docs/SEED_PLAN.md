# NEXG Seed Plan — every subcategory, 4+ merchants each (v1.0)

> Status: APPROVED (owner: every subcategory gets MORE THAN 3 merchants;
> multi-service merchants allowed, e.g. cars + safaris).
> Owner: Backend dev. Source of truth: `nexg-backend/db/seed-data/`.
>
> CORRECTION 2026-09-14: the chat doc headlines "134 subcategories" but its own
> table contains **128** (verified by count). Plan targets the 128 real ones.

## 0. Scale

- 128 subcategories x 4 merchants = **512 merchants** (budget-a/b + premium-a/b lanes).
- Rich catalogs: 6 sections, 36 items per merchant -> **18,432 items**
  (verified 2026-09-14: 512 merchants, 3,072 sections, 18,432 items),
  variants on ~30% of items (5,616), addon groups on mains (8,712),
  durations on book/request catalogs, capabilities split add/request/book.
- Multi-service rule: a merchant has ONE primary `category_id` (operational routing)
  plus secondary coverage via `verticals[]` + `tags[]` (discovery). E.g. a safari
  outfitter with a rental fleet: primary `travel-tours`, tags `[car-rental,
  airport-transfer]`. No join table until a merchant genuinely needs two
  fulfillment pipelines (ADR-00X).

## 1. Generator design (hand-written banks + deterministic engine)

Hand-writing 540 catalogs is not a plan — the plan is:

1. **Banks** (`seed-data/banks.ts` + `menu-a/b/c.ts`): per-category name parts
   (prefix/core/suffix, Nairobi-flavored), 6 sections x 10 item templates per
   category (60 templates x 21 categories), variant/addon templates, geo centers.
2. **Engine** (`seed-data/generator.ts`): seeded PRNG (mulberry32, fixed seed) so
   output is byte-stable across runs; deterministic IDs
   (`mrc_{cat}__{subslug}_{lane}{n}`); Nairobi geo jitter around per-category
   centers (Kilimani default); KES price rounding (nearest 10/50).
3. **Catalog export** (`seed-data/catalog.ts`): runs the generator at import,
   exports `nexgMerchants / nexgMenuCategories / nexgOfferings /
   getSeedMerchantsByCategory` in the exact shapes the seed script expects.
4. **Curated overrides**: flagship merchants (the pairs from the original 42-plan)
   stay hand-named in an overrides file; generator skips IDs it collides with.

Why deterministic: seed is idempotent upserts — reruns must update in place,
never duplicate. No `Math.random`, no `Date.now` in IDs.

## 2. Geo (Kilimani-first Nairobi spread)

Centers: Kilimani (-1.2957, 36.7846) default · Westlands (-1.2635, 36.8028) ·
CBD (-1.2921, 36.8219) · Karen (-1.3318, 36.7050) · Eastleigh (-1.2778, 36.8522) ·
JKIA corridor (-1.3192, 36.9278, logistics/transfers). Jitter ±0.015 (~1.5km) so
H3 cells differ per merchant. `distance_km` computed from CBD reference at seed.

## 3. Lanes (both full, different lanes — approved)

Per subcategory: `budget-a`, `budget-b`, `premium-a`, `premium-b`.
Budget: priceLevel 1, min-order low, ETA short, vibrant names.
Premium: priceLevel 2-3, curated descriptions, higher ratings floor (4.3+),
policies (cancellation, hygiene, licensing where relevant).

## 4. Acceptance (verified 2026-09-14, docker postgres :5433)

- [x] `SELECT COUNT(*) FROM merchants` >= 512 AND every subcategory has >= 4 merchants
      — got 643 total (131 pre-existing + 512 new), per-category counts = subs x 4
      for all 21 categories (audit: `scripts/seed42-check.js`)
- [x] Every merchant has >= 5 sections AND >= 30 items — new merchants min 6/36 exact
- [x] Rerun is a no-op diff (same counts, `updated` only): generator output byte-stable
      across runs (mulberry32 fixed seeds, no Math.random/Date.now)
- [x] `consumer-qa` green against live API: **1141 passed, 0 failed**
- [x] Full verify battery green: M0 20/20 · M1 14/14 · M2 17/17 · M3 16/16 ·
      M4 10/10 · events 12/12 · cb 27/27 · msg 9/9 · gauntlet PASS
- [x] Perf re-baseline on 20k catalog: `docs/perf-baseline-2026-09-14T18-28-18-407Z.json`
      (conc 5 / iters 10, same args as 09-11 baseline). Core reads hold:
      discovery/home p50 12ms, merchants p50 201ms, categories p50 14ms.
- [x] Perf delta root-caused (cold pg-pool convoy x Docker Desktop Windows NAT, NOT
      query plans — EXPLAIN: 643-row seq scan, 48 buffers; isolated latencies all
      <310ms). Fix shipped: pool warmup at server boot (`src/index.ts`) —
      cold x20 burst 116s -> 1.1s, x50 4.2s -> 1.6s, 0 err. `tsc` clean.
- [ ] Rerun full perf (conc 10 / iters 30 / soak 60) + take official numbers on the
      staging Linux host — laptop Docker NAT numbers are a floor, not a ceiling.
      Known laptop-only limits: 500-row `SELECT *` card payloads (~1MB/resp),
      leading-wildcard ILIKE scans (trgm-assisted), spike x50 vs pool max 20.

## 5. Rollback

Seed is upserts-only: `DELETE FROM merchants WHERE id LIKE 'mrc_%'` + reseed
restores any prior state. Generator version pinned per run in the seed log line.
