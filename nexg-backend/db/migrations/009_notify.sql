-- 009_notify.sql — Postgres as broker: NOTIFY on every NCL commit (M-events).
-- Payload is the seq only (≤8KB limit safe); dispatcher re-reads the row and routes.
-- At-least-once: notifications fire iff the NCL row commits; consumers de-dupe by
-- idempotency_key and resume with since_seq (full history retained in ncl_events).
CREATE OR REPLACE FUNCTION notify_ncl_event() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('nexg_events', NEW.seq::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ncl_events_notify ON ncl_events;
CREATE TRIGGER ncl_events_notify
  AFTER INSERT ON ncl_events
  FOR EACH ROW EXECUTE FUNCTION notify_ncl_event();
