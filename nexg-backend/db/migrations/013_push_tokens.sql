-- 013_push_tokens.sql — push for rider offers (R-05).
-- Stores Expo push tokens per rider; broadcast on delivery.offered (best-effort).
-- 15s poll + SSE remain the realtime contract; push is additive.
-- Folded into init.sql. Idempotent (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS push_tokens (
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  expo_token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'unknown',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, expo_token)
);

CREATE INDEX IF NOT EXISTS push_tokens_account_idx ON push_tokens(account_id);
