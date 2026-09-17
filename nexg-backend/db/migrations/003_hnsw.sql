-- 003_hnsw.sql — HNSW handles tiny tables correctly (ivfflat with lists=10 on a
-- near-empty table can return zero rows). Exact recall at our scale; still indexed.
DROP INDEX IF EXISTS nexg_documents_embedding_idx;
CREATE INDEX IF NOT EXISTS nexg_documents_embedding_hnsw
  ON nexg_documents USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
