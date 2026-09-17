-- 012_promos (M-13): promos engine + coupons. Owner-confirmed IN.
-- Flag-gated UI; apply inside POST /orders (invalid/expired→422, double-redeem→409).
CREATE TABLE IF NOT EXISTS promos (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'percent', -- percent | fixed
  value_kes INT NOT NULL DEFAULT 0, -- percent 1..90 OR fixed KES
  min_order_kes INT NOT NULL DEFAULT 0,
  max_uses INT NOT NULL DEFAULT 0, -- 0 = unlimited
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
  status TEXT NOT NULL DEFAULT 'redeemed', -- redeemed | voided
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (promo_id, account_id)
);
CREATE INDEX IF NOT EXISTS coupons_code_idx ON coupons(code);
CREATE INDEX IF NOT EXISTS coupons_promo_idx ON coupons(promo_id);
