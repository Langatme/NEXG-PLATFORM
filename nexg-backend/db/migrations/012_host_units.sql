-- 012_host_units.sql — Host property/unit CRUD (H-05, HST-007→015).
-- Units get their own table (cleaner guards than merchant-mapped deferral).
-- Folded into init.sql. Idempotent (IF NOT EXISTS).
-- Next free migration after this file: 013_*.

-- Amenities live on the property (merchant) row, alongside existing policies[].
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS amenities TEXT[] NOT NULL DEFAULT '{}';

-- Units belong to one property (a venue merchant). Bookings may pin a unit.
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

-- Optional stay-unit link (additive, nullable). Guards delete-with-bookings 409.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS unit_id TEXT REFERENCES units(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS bookings_unit_idx ON bookings(unit_id);
