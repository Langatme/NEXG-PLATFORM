-- 007_host_ops.sql — stay lifecycle support + service operations (M3).
-- Guests derive from stays (dynamic recording; no manual CRM records).
CREATE TABLE service_requests (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id),
  booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  account_id UUID REFERENCES accounts(id),
  kind TEXT NOT NULL DEFAULT 'service', -- service | housekeeping | maintenance
  title TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'REQUESTED', -- REQUESTED|ASSIGNED|IN_PROGRESS|COMPLETED|CANCELLED (+INSPECTED for housekeeping, VERIFIED for maintenance)
  assignee TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS svc_merchant_idx ON service_requests(merchant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS svc_booking_idx ON service_requests(booking_id);
