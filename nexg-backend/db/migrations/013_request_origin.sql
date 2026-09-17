-- 013_request_origin.sql — H-11 QR surfacing: additive origin passthrough on requests.
-- Consumer QR flow (M7 live) tags origin:'qr'; boards filter on it. Folded into init.sql.
-- Next free migration after this file: 014_*.

ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS origin TEXT;
CREATE INDEX IF NOT EXISTS svc_origin_idx ON service_requests(merchant_id, origin, created_at DESC);
