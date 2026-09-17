-- 008_perf.sql — postgres-pro pass: trigram search, FK/composite indexes, stats.
-- Rule applied: index the access path, not the table. No GIN on JSONB (no containment
-- queries exist); no partitioning/replication at this scale (thresholds in DB_PERF.md).
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- array_to_string is STABLE; GIN expressions need IMMUTABLE. Thin wrapper (same semantics).
CREATE OR REPLACE FUNCTION tags_text(tags text[]) RETURNS text AS $$
  SELECT array_to_string(tags, ' ');
$$ LANGUAGE sql IMMUTABLE;

-- ILIKE '%q%' search (non-prefix patterns need trgm; plain b-tree can't serve them)
CREATE INDEX IF NOT EXISTS merchants_name_trgm ON merchants USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS merchants_catlabel_trgm ON merchants USING gin (category_label gin_trgm_ops);
CREATE INDEX IF NOT EXISTS merchants_descr_trgm ON merchants USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS merchants_tags_trgm ON merchants USING gin (tags_text(tags) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS items_title_trgm ON catalog_items USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS items_name_trgm ON catalog_items USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS items_descr_trgm ON catalog_items USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS items_tags_trgm ON catalog_items USING gin (tags_text(tags) gin_trgm_ops);

-- Hot-path b-tree: FK columns and filter/order columns the audit showed seq-scanning
CREATE INDEX IF NOT EXISTS items_merchant_idx ON catalog_items(merchant_id);
CREATE INDEX IF NOT EXISTS sections_merchant_idx ON catalog_sections(merchant_id);
CREATE INDEX IF NOT EXISTS variants_item_idx ON item_variants(item_id);
CREATE INDEX IF NOT EXISTS addons_item_idx ON addon_groups(item_id);
CREATE INDEX IF NOT EXISTS lines_order_idx ON order_lines(order_id);
CREATE INDEX IF NOT EXISTS lines_item_idx ON order_lines(item_id);
CREATE INDEX IF NOT EXISTS subs_category_idx ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS media_entity_idx ON media_assets(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS merchants_active_rating_idx ON merchants(is_active, rating DESC);
CREATE INDEX IF NOT EXISTS merchants_category_idx ON merchants(category_id);

ANALYZE merchants;
ANALYZE catalog_items;
ANALYZE catalog_sections;
ANALYZE subcategories;
ANALYZE ncl_events;
ANALYZE nexg_documents;
