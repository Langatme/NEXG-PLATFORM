import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://nexg:nexg_dev_password@localhost:5433/nexg";

export const pool = new Pool({
  connectionString,
  max: Number(process.env.PG_POOL_MAX ?? 20), // was pg default 10 — saturated past conc 5
  idleTimeoutMillis: 30_000,
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
