-- 012_rider_profiles.sql — LIMTAI-backed rider onboarding (R-02).
-- Three pathways: independent | dedicated | fleet. Docs/vehicle as JSONB + S3 keys
-- via presign (no binary through API). Status pending/approved/rejected+reason.
-- Folded into init.sql. Idempotent (IF NOT EXISTS).

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
