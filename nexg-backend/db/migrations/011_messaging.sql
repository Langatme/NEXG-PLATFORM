-- 011_messaging.sql — Single shared event-driven messaging system for ALL apps.
-- One `messages` table + NCL `message.sent` fan-out over existing SSE LISTEN/NOTIFY.
-- Notifications, inbox, conversations, contact merchant/rider/host/support all read this.
-- Folded into init.sql. Idempotent (IF NOT EXISTS).

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
