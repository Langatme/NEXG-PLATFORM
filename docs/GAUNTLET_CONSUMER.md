# Gauntlet: consumer mock → API swap — PASS 332/332

Date: 2026-09-11. Scope: wire `wolt-react-native-main` services to `nexg-backend`
without screen changes, seed backend from the mock, run the Backend Prompt §42
click-through matrix against the live API.

## What changed

Backend (`nexg-backend/`, tsc clean):
- `db/migrations/004_consumer_display.sql` — display columns for 1:1 DTO mapping
  (verticals, category_label, description, review_count, price_level, address/lat/lng,
  distance_km, is_open, opening_hours, tags, eta_min, min_order_kes, hero_image_key,
  accent_emoji, policies, subtitle, name/tags/is_popular/duration_min/image_key).
- `scripts/seed-consumer-catalog.ts` — seeds 23 cats / 131 subs / 131 merchants /
  269 sections / 639 items / 22 variants / 7 addon groups directly from the mock
  (single source of truth) + demo catalog for the 3 demo merchants + orphan repair.
- `src/routes/domain.ts` — `?vertical=` filter, description/tags search parity,
  merchant list limit 100 → 500 (pagination TODO).

Consumer (`wolt-react-native-main`, tsc clean, no screen edits):
- `services/nexg/api.ts` (new) — HTTP client, guest identity ladder
  (Anonymous → Guest via auto register/login, MMKV creds), DTO→domain mappers.
- `services/nexg/nexgService.ts` — API-first with mock fallback on every method
  (offline/degraded → stale-data states, never blank). Sessions stay mock until
  the experiences phase. `.env.example` API URL enabled.

## Repairs found by the loop (docs Phase B: finish, don't redesign)

1. **Orphaned Java House (mrc_002)**: taxonomy slug('Café') → `caf`, but
   `CURATED_SUBCATEGORY` mapped `restaurants-food/cafe`. Mismatch orphaned the
   merchant AND its full curated catalog (Big Java Breakfast, Flat White with
   variants/addons) as dead code; a generated merchant took the slot. One-line fix
   in `data/nexg/nexg-catalog.ts`. Mock now: 128 merchants, zero empty catalogs.
2. **ivfflat lesson (carried)**: kept HNSW for vector search.
3. **Merchant list cap** 100 hid 31 merchants → 500 + pagination TODO.
4. **Demo seeds** had no catalog/subs → minimal demo catalog added (no empty pages).

## QA proof (`scripts/consumer-qa.js`, 332 checks)

23 categories w/ subs · 131 merchants card+detail+menu · 6 vertical rails ·
sampled item details incl. itm_101 variants/addons · 6 search queries + pizza parity ·
discovery ordering · vector search · media rows. `CONSUMER_QA_PASS`.

## Next gauntlets (not started)

- Sessions/experiences backend (getSessions still mock).
- Merchant/Rider/Host shells: replace stub screens with real workspaces on same APIs.
- Media: S3 URLs replacing `media://` key references; image variants pipeline.
- Pagination, popular-search ranking, order status progression/webhooks.
