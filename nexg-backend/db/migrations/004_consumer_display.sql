-- 004_consumer_display.sql — carry consumer display fields so API DTOs map 1:1 to
-- domain/types.ts via repository mappers (no screen changes). Additive only.

-- Categories: taxonomy display + fulfillment routing
ALTER TABLE categories ADD COLUMN IF NOT EXISTS emoji TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS short_label TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS verticals TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS fulfillment TEXT NOT NULL DEFAULT 'delivery';

-- Subcategories: labels (ids may be namespaced on seed to stay unique)
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS label TEXT;

-- Merchants: full consumer card/detail fields
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS verticals TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS category_label TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS review_count INT NOT NULL DEFAULT 0;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS price_level INT NOT NULL DEFAULT 1;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS distance_km DOUBLE PRECISION;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS is_open BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS opening_hours JSONB NOT NULL DEFAULT '{}';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS eta_min TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS min_order_kes INT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS hero_image_key TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS accent_emoji TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS policies TEXT[] NOT NULL DEFAULT '{}';

-- Sections: subtitle
ALTER TABLE catalog_sections ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- Items: consumer card/config fields; options split into variants/addon_groups on seed
ALTER TABLE catalog_items ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE catalog_items ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE catalog_items ADD COLUMN IF NOT EXISTS is_popular BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE catalog_items ADD COLUMN IF NOT EXISTS duration_min INT;
ALTER TABLE catalog_items ADD COLUMN IF NOT EXISTS image_key TEXT;

-- Sessions/experiences stay mock-local until the experiences phase (no table yet by design).
