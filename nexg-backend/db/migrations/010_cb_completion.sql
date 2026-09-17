-- 010_cb_completion.sql — CB-01→07 + M/R/H gaps: revocation, search ranking, pagination support, status filters.
-- Folded into init.sql. Idempotent (IF NOT EXISTS).

-- Token revocation list (logout enforcement). Stores SHA256(access_token).
CREATE TABLE IF NOT EXISTS revoked_tokens (
  token_hash TEXT PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Search ranking support
CREATE INDEX IF NOT EXISTS search_history_query_idx ON search_history(query);
CREATE INDEX IF NOT EXISTS search_history_account_idx ON search_history(account_id);
CREATE INDEX IF NOT EXISTS search_history_created_idx ON search_history(created_at DESC);

-- Bookings calendar: status filter + pagination performance
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
CREATE INDEX IF NOT EXISTS bookings_merchant_status_idx ON bookings(merchant_id, status, scheduled_for);
CREATE INDEX IF NOT EXISTS bookings_account_idx ON bookings(account_id, created_at DESC);

-- Orders: consumer-cancel + pagination performance
CREATE INDEX IF NOT EXISTS orders_account_idx ON orders(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

-- Catalog availability (stock-check via is_available)
CREATE INDEX IF NOT EXISTS items_merchant_avail_idx ON catalog_items(merchant_id, is_available);

-- Service requests: assignee + filters
CREATE INDEX IF NOT EXISTS svc_assignee_idx ON service_requests(assignee);
CREATE INDEX IF NOT EXISTS svc_status_idx ON service_requests(status);
