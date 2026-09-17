-- NEXG canonical schema v0.3 (monolith-first, per Backend Production Prompt + Ledger docs)
-- Postgres 16 + pgvector. Append-only ledger, no balance mutations.
-- Consolidated: folds 002_vectors + 003_hnsw + 004_consumer_display + 005_auth_scopes.
-- Fresh boot: docker compose up -> run scripts/seed-consumer-catalog.ts -> API.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Tenancy / identity (Person -> Account -> Org -> Membership/Role -> Scope)
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  display_name TEXT,
  pin_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES persons(id),
  kind TEXT NOT NULL DEFAULT 'customer', -- customer | merchant_staff | rider | host | admin | system
  merchant_id TEXT, -- scope anchor for staff kinds (M0: one merchant)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS accounts_person_idx ON accounts(person_id);

-- Taxonomy: Category -> Subcategory (21 cats from merchant onboarding spec)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  experience_type TEXT NOT NULL DEFAULT 'order', -- order | book | request
  sort INT NOT NULL DEFAULT 0,
  emoji TEXT,
  short_label TEXT,
  verticals TEXT[] NOT NULL DEFAULT '{}',
  fulfillment TEXT NOT NULL DEFAULT 'delivery' -- delivery | booking | service | shipping
);

CREATE TABLE subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  label TEXT
);

-- Merchants + catalog (canonical product model; display fields map 1:1 to consumer domain types)
CREATE TABLE merchants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'rest', -- rest|store|serviceProvider|experience|venue|transport|utility + consumer kinds
  vertical TEXT NOT NULL DEFAULT 'food',
  verticals TEXT[] NOT NULL DEFAULT '{}',
  category_id TEXT REFERENCES categories(id),
  subcategory_id TEXT REFERENCES subcategories(id),
  category_label TEXT,
  description TEXT NOT NULL DEFAULT '',
  image TEXT,
  rating NUMERIC(2,1) DEFAULT 4.5,
  review_count INT NOT NULL DEFAULT 0,
  price_level INT NOT NULL DEFAULT 1,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  distance_km DOUBLE PRECISION,
  is_open BOOLEAN NOT NULL DEFAULT true,
  opening_hours JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  eta_min TEXT,
  min_order_kes INT,
  hero_image_key TEXT,
  accent_emoji TEXT,
  policies TEXT[] NOT NULL DEFAULT '{}',
  amenities TEXT[] NOT NULL DEFAULT '{}', -- H-05: property amenities editor
  embedding vector(1536), -- projection only, never truth
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS accounts_merchant_idx ON accounts(merchant_id);

-- 012_host_units folded (H-05): units own table (property → units FK).
CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL DEFAULT 'room', -- room|suite|villa|apartment|hall|other
  capacity INT NOT NULL DEFAULT 2,
  price_kes INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS units_property_idx ON units(property_id, is_active);

CREATE TABLE catalog_sections (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subtitle TEXT,
  sort INT NOT NULL DEFAULT 0
);

CREATE TABLE catalog_items (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES catalog_sections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  name TEXT,
  description TEXT DEFAULT '',
  price_kes INT NOT NULL,
  image TEXT,
  image_key TEXT,
  item_type TEXT NOT NULL DEFAULT 'food',
  subtype TEXT,
  capabilities TEXT[] NOT NULL DEFAULT '{add}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_popular BOOLEAN NOT NULL DEFAULT false,
  duration_min INT,
  embedding vector(1536), -- projection only, never truth
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE item_variants (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_delta_kes INT NOT NULL DEFAULT 0
);

CREATE TABLE addon_groups (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  multi BOOLEAN NOT NULL DEFAULT false,
  options JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- merchant | item | category | promotion | delivery
  entity_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'image', -- image | video
  url TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT 'medium', -- thumb|small|medium|large|original
  sort INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fulfilment tasks (M2; earnings derive from delivered tasks + order fees)
CREATE TABLE delivery_tasks (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  merchant_id TEXT NOT NULL REFERENCES merchants(id),
  rider_account_id UUID REFERENCES accounts(id),
  status TEXT NOT NULL DEFAULT 'OFFERED', -- OFFERED|ACCEPTED|ARRIVED_PICKUP|PICKED|ARRIVED_DROP|DELIVERED|FAILED|CANCELLED
  pickup_address TEXT,
  dropoff_address TEXT,
  proof JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS deliveries_status_idx ON delivery_tasks(status, created_at DESC);
CREATE INDEX IF NOT EXISTS deliveries_rider_idx ON delivery_tasks(rider_account_id, status);
CREATE INDEX IF NOT EXISTS deliveries_order_idx ON delivery_tasks(order_id);

-- Orders / bookings (transactional)
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  merchant_id TEXT REFERENCES merchants(id),
  status TEXT NOT NULL DEFAULT 'PLACED', -- PLACED|CONFIRMED|PREPARING|READY|PICKED|DELIVERED|CANCELLED
  subtotal_kes INT NOT NULL DEFAULT 0,
  fees_kes INT NOT NULL DEFAULT 0,
  discount_kes INT NOT NULL DEFAULT 0,
  total_kes INT NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'mpesa',
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_merchant_idx ON orders(merchant_id, status);

CREATE TABLE order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id TEXT REFERENCES catalog_items(id),
  title TEXT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  unit_price_kes INT NOT NULL,
  line_total_kes INT NOT NULL
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  merchant_id TEXT REFERENCES merchants(id),
  item_id TEXT REFERENCES catalog_items(id),
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  scheduled_for TIMESTAMPTZ,
  guests INT NOT NULL DEFAULT 1,
  total_kes INT NOT NULL DEFAULT 0,
  idempotency_key TEXT UNIQUE,
  unit_id TEXT REFERENCES units(id) ON DELETE SET NULL, -- H-05: stay-unit link (nullable)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bookings_merchant_idx ON bookings(merchant_id, scheduled_for);

-- Canonical ledger (NCL, append-only, hash-chained)
CREATE TABLE ncl_events (
  seq BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  tenant TEXT NOT NULL DEFAULT 'nexg-ke',
  actor_type TEXT NOT NULL, -- user|rider|merchant|system
  actor_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- order.placed | payment.confirmed | payout.released ...
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  correlation_id UUID,
  causation_id UUID,
  idempotency_key TEXT UNIQUE,
  prev_state JSONB,
  new_state JSONB,
  prev_hash TEXT,
  hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ncl_entity_idx ON ncl_events(entity_type, entity_id, seq DESC);

CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vector projections (never source of truth; stub embeddings now, real provider later)
CREATE TABLE IF NOT EXISTS nexg_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  chunk TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS nexg_documents_embedding_hnsw
  ON nexg_documents USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Perf indexes (postgres-pro pass): trgm for ILIKE search, b-tree for hot paths.
-- array_to_string is STABLE; GIN expressions need IMMUTABLE — thin wrapper.
CREATE OR REPLACE FUNCTION tags_text(tags text[]) RETURNS text AS $$
  SELECT array_to_string(tags, ' ');
$$ LANGUAGE sql IMMUTABLE;

CREATE INDEX IF NOT EXISTS merchants_name_trgm ON merchants USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS merchants_catlabel_trgm ON merchants USING gin (category_label gin_trgm_ops);
CREATE INDEX IF NOT EXISTS merchants_descr_trgm ON merchants USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS merchants_tags_trgm ON merchants USING gin (tags_text(tags) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS items_title_trgm ON catalog_items USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS items_name_trgm ON catalog_items USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS items_descr_trgm ON catalog_items USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS items_tags_trgm ON catalog_items USING gin (tags_text(tags) gin_trgm_ops);
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

-- Stay lifecycle support + service operations (M3)
CREATE TABLE service_requests (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id),
  booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  account_id UUID REFERENCES accounts(id),
  kind TEXT NOT NULL DEFAULT 'service',
  title TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'REQUESTED',
  assignee TEXT,
  origin TEXT, -- H-11: request origin passthrough (e.g. 'qr' from guest QR scan)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS svc_merchant_idx ON service_requests(merchant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS svc_booking_idx ON service_requests(booking_id);
CREATE INDEX IF NOT EXISTS svc_origin_idx ON service_requests(merchant_id, origin, created_at DESC);

-- CB completion (010 folded): revocation, search ranking, pagination/status indexes.
CREATE TABLE IF NOT EXISTS revoked_tokens (
  token_hash TEXT PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS search_history_query_idx ON search_history(query);
CREATE INDEX IF NOT EXISTS search_history_account_idx ON search_history(account_id);
CREATE INDEX IF NOT EXISTS search_history_created_idx ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
CREATE INDEX IF NOT EXISTS bookings_merchant_status_idx ON bookings(merchant_id, status, scheduled_for);
CREATE INDEX IF NOT EXISTS bookings_account_idx ON bookings(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_account_idx ON orders(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS items_merchant_avail_idx ON catalog_items(merchant_id, is_available);
CREATE INDEX IF NOT EXISTS svc_assignee_idx ON service_requests(assignee);
CREATE INDEX IF NOT EXISTS svc_status_idx ON service_requests(status);

-- 011_messaging folded: single shared event-driven messaging for ALL apps.
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_key TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE SET NULL,
  sender_account UUID REFERENCES accounts(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL DEFAULT 'consumer',
  recipient_role TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_thread_idx ON messages(thread_key, created_at ASC);
CREATE INDEX IF NOT EXISTS messages_merchant_idx ON messages(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_entity_idx ON messages(entity_type, entity_id, created_at ASC);

-- 012_host_units folded (H-05): stay-unit link index (units table lives above,
-- next to merchants; amenities[] lives on the merchants CREATE TABLE).
CREATE INDEX IF NOT EXISTS bookings_unit_idx ON bookings(unit_id);

-- 012_rider_profiles folded (R-02 LIMTAI onboarding: independent|dedicated|fleet).
CREATE TABLE IF NOT EXISTS rider_profiles (
  account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'independent',
  personal JSONB NOT NULL DEFAULT '{}',
  identity_doc JSONB NOT NULL DEFAULT '{}',
  vehicle JSONB NOT NULL DEFAULT '{}',
  docs JSONB NOT NULL DEFAULT '{}',
  payout JSONB NOT NULL DEFAULT '{}',
  emergency JSONB NOT NULL DEFAULT '{}',
  services TEXT[] NOT NULL DEFAULT '{}',
  shift TEXT,
  zone TEXT,
  company JSONB NOT NULL DEFAULT '{}',
  fleet_riders JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rider_profiles_status_idx ON rider_profiles(status);
CREATE INDEX IF NOT EXISTS rider_profiles_type_idx ON rider_profiles(type);

-- 013_push_tokens folded (R-05 push for offers; poll+SSE remain contract).
CREATE TABLE IF NOT EXISTS push_tokens (
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  expo_token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'unknown',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, expo_token)
);
CREATE INDEX IF NOT EXISTS push_tokens_account_idx ON push_tokens(account_id);

-- 012_promos folded (M-13): promos engine + coupons.
CREATE TABLE IF NOT EXISTS promos (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'percent',
  value_kes INT NOT NULL DEFAULT 0,
  min_order_kes INT NOT NULL DEFAULT 0,
  max_uses INT NOT NULL DEFAULT 0,
  used_count INT NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS promos_merchant_idx ON promos(merchant_id, is_active);
CREATE INDEX IF NOT EXISTS promos_code_idx ON promos(code);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  promo_id TEXT NOT NULL REFERENCES promos(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id),
  status TEXT NOT NULL DEFAULT 'redeemed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (promo_id, account_id)
);
CREATE INDEX IF NOT EXISTS coupons_code_idx ON coupons(code);
CREATE INDEX IF NOT EXISTS coupons_promo_idx ON coupons(promo_id);

-- Demo seeds (real catalog arrives via scripts/seed-consumer-catalog.ts)
INSERT INTO categories (id, name, experience_type, sort, emoji, verticals, fulfillment) VALUES
  ('food','Restaurants & Food','order',1,'🍔','{food}','delivery'),
  ('grocery','Groceries','order',2,'🛒','{grocery}','delivery'),
  ('wellness','Wellness & Spa','book',3,'🧘','{wellness}','booking')
ON CONFLICT (id) DO NOTHING;

INSERT INTO merchants (id, name, kind, vertical, category_id) VALUES
  ('mrc_demo_001','Burger Haven Demo','rest','food','food'),
  ('mrc_demo_002','Greens Mart Demo','store','grocery','grocery'),
  ('mrc_demo_003','Serene Spa Demo','serviceProvider','wellness','wellness')
ON CONFLICT (id) DO NOTHING;
