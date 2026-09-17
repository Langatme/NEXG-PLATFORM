import { createHash } from "crypto";
import { query } from "./db.js";

// Every economically / operationally / permission-significant change must
// produce an immutable, attributable, idempotent NCL event. Admin reads this later.
export interface NclEventInput {
  tenant?: string;
  actor_type: string;
  actor_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  correlation_id?: string;
  causation_id?: string;
  idempotency_key?: string;
  prev_state?: unknown;
  new_state?: unknown;
  source?: string;
}

export async function appendNclEvent(e: NclEventInput) {
  const prev = await query<{ hash: string }>(
    `SELECT hash FROM ncl_events ORDER BY seq DESC LIMIT 1`
  );
  const prev_hash: string | null = prev[0]?.hash ?? null;
  const body = JSON.stringify({
    ...e,
    prev_hash,
    at: new Date().toISOString(),
  });
  const hash = createHash("sha256").update(body).digest("hex");
  try {
    const rows = await query(
      `INSERT INTO ncl_events
        (tenant, actor_type, actor_id, event_type, entity_type, entity_id,
         correlation_id, causation_id, idempotency_key, prev_state, new_state, prev_hash, hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING seq, event_id`,
      [
        e.tenant ?? "nexg-ke",
        e.actor_type,
        e.actor_id,
        e.event_type,
        e.entity_type,
        e.entity_id,
        e.correlation_id ?? null,
        e.causation_id ?? null,
        e.idempotency_key ?? null,
        e.prev_state ? JSON.stringify(e.prev_state) : null,
        e.new_state ? JSON.stringify(e.new_state) : null,
        prev_hash,
        hash,
      ]
    );
    return rows[0];
  } catch (err: any) {
    // Idempotent replay: same key returns existing row
    if (err?.code === "23505") {
      const existing = await query(
        `SELECT seq, event_id FROM ncl_events WHERE idempotency_key = $1`,
        [e.idempotency_key]
      );
      return existing[0];
    }
    throw err;
  }
}
