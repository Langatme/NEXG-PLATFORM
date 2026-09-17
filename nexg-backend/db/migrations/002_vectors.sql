-- 002_vectors.sql — vector layer for Admin semantic search (stub embeddings now, real provider later)
CREATE EXTENSION IF NOT EXISTS "vector";

ALTER TABLE merchants ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE catalog_items ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE TABLE IF NOT EXISTS nexg_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  chunk TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nexg_documents_embedding_hnsw
  ON nexg_documents USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
