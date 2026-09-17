-- 005_auth_scopes.sql — scope anchors for role auth (docs Step 2: Person->Account->Org->Role->Scope).
-- pin_hash moves into schema (was runtime ALTER). merchant_id anchors staff to one merchant (M0).
ALTER TABLE persons ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS merchant_id TEXT REFERENCES merchants(id);
CREATE INDEX IF NOT EXISTS accounts_person_idx ON accounts(person_id);
CREATE INDEX IF NOT EXISTS accounts_merchant_idx ON accounts(merchant_id);
