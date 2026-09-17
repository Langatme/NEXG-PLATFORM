-- 006_deliveries.sql — fulfilment tasks for the rider loop (M2).
-- Earnings derive from delivered tasks + order fees (no mutable balances, ever).
CREATE TABLE delivery_tasks (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  merchant_id TEXT NOT NULL REFERENCES merchants(id),
  rider_account_id UUID REFERENCES accounts(id),
  status TEXT NOT NULL DEFAULT 'OFFERED', -- OFFERED|ACCEPTED|ARRIVED_PICKUP|PICKED|ARRIVED_DROP|DELIVERED|FAILED|CANCELLED
  pickup_address TEXT,
  dropoff_address TEXT,
  proof JSONB NOT NULL DEFAULT '{}', -- {otp} | {photoUrl} | {signature}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS deliveries_status_idx ON delivery_tasks(status, created_at DESC);
CREATE INDEX IF NOT EXISTS deliveries_rider_idx ON delivery_tasks(rider_account_id, status);
CREATE INDEX IF NOT EXISTS deliveries_order_idx ON delivery_tasks(order_id);
