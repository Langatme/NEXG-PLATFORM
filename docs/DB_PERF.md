# DB Performance Pass — postgres-pro (2026-09-11)

Audit: `scripts/db-audit.js` (extensions, sizes, index scans, settings, EXPLAIN on 7
hot-query shapes). Proof: `scripts/db-index-proof.js` (forced index-usage plans).

## Findings → actions (all in `db/migrations/008_perf.sql`, folded into `init.sql`)

1. **ILIKE search seq-scanned** → `pg_trgm` + 8 GIN indexes (name/title/category_label/
   description/tags on merchants + items). Tags use an IMMUTABLE `tags_text()` wrapper
   because `array_to_string` is STABLE and GIN expressions require IMMUTABLE; search SQL
   rewritten from `unnest` to `tags_text(tags) ILIKE` so the index applies. Proven via
   BitmapOr over all four merchant indexes.
2. **FK columns unindexed** (order_lines, catalog children, sections, media, subs) →
   11 b-tree indexes. `catalog by merchant` now Bitmap Index Scan; lines-by-order now
   Index Scan. Rider-jobs join and ledger replay were already index-clean.
3. **Stale stats after bulk seed** (n_live_tup 0 on 639-row tables) → `ANALYZE` at end
   of `seed-consumer-catalog.ts`.
4. **Monitoring**: `pg_stat_statements` installed; slow-query log
   (`log_min_duration_statement=200ms`) in compose.
5. **Deliberately NOT done** (skill decision tree): no JSONB GIN (no containment queries —
   addon_groups/proof/ledger states are PK-fetched), no tsvector (trgm covers substring
   search at this scale; revisit for typo-tolerant ranking), no partitioning (largest
   table 3MB; threshold 10GB), no replication/PITR (single-node dev; production checklist
   below), no config tuning beyond logging (128MB shared_buffers is correct for dev).

## Honest note
At 131 merchants / 639 items the planner still seq-scans search (correctly — whole
tables fit in a few pages). The indexes are proven usable and take over as data grows;
watch `idx_scan` in the audit output.

## Production checklist (when leaving docker-dev)
shared_buffers 25% RAM · effective_cache_size 75% · work_mem sized from EXPLAIN (no temp
spills) · autovacuum scale_factor ≤0.05 on ncl_events/nexg_documents · PgBouncer (pool
already in app) · WAL archiving + PITR + tested restore · streaming replica + lag alerts ·
re-run audit quarterly; add tsvector ranking and table partitioning by growth triggers.
