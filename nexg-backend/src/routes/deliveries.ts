import { Router } from "express";
import { query } from "../db.js";
import { appendNclEvent } from "../ledger.js";
import { newId, requireRoles } from "../auth.js";
import { presignUpload } from "../s3.js";

export const deliveries = Router();
export const rider = Router();
export const uploads = Router();

// Task state machine (M2). accept claims the task for the calling rider.
const TASK_TRANSITIONS: Record<string, { from: string[]; to: string; event: string }> = {
  accept: { from: ["OFFERED"], to: "ACCEPTED", event: "rider.accepted" },
  decline: { from: ["OFFERED"], to: "CANCELLED", event: "rider.declined" },
  reoffer: { from: ["CANCELLED"], to: "OFFERED", event: "delivery.offered" },
  arrived_pickup: { from: ["ACCEPTED"], to: "ARRIVED_PICKUP", event: "rider.arrived_pickup" },
  picked: { from: ["ARRIVED_PICKUP", "ACCEPTED"], to: "PICKED", event: "rider.picked" },
  arrived_drop: { from: ["PICKED"], to: "ARRIVED_DROP", event: "rider.arrived_drop" },
  delivered: { from: ["ARRIVED_DROP", "PICKED"], to: "DELIVERED", event: "rider.delivered" },
  failed: { from: ["OFFERED", "ACCEPTED", "ARRIVED_PICKUP", "PICKED", "ARRIVED_DROP"], to: "FAILED", event: "rider.failed" },
  cancel: { from: ["OFFERED", "ACCEPTED", "ARRIVED_PICKUP", "PICKED", "ARRIVED_DROP"], to: "CANCELLED", event: "delivery.cancelled" },
};

async function getTask(id: string) {
  const rows = await query(`SELECT * FROM delivery_tasks WHERE id = $1`, [id]);
  return rows[0] as any;
}

function assertRider(req: any, task: any, res: any): boolean {
  const roles: string[] = req.auth.roles ?? [];
  if (roles.includes("admin")) return true;
  if (!roles.includes("rider")) {
    res.status(403).json({ error: "rider_only" });
    return false;
  }
  if (task.rider_account_id && task.rider_account_id !== req.auth.account_id) {
    res.status(403).json({ error: "not_your_task" });
    return false;
  }
  return true;
}

async function transition(task: any, action: string, req: any, res: any, proof?: unknown) {
  const t = TASK_TRANSITIONS[action];
  if (!t) return res.status(422).json({ error: "unknown_action", allowed: Object.keys(TASK_TRANSITIONS) });
  if (!t.from.includes(task.status)) {
    const prior = await query(`SELECT new_state FROM ncl_events WHERE idempotency_key = $1`, [
      `${task.id}:${action}`,
    ]);
    if (prior[0] && (prior[0] as any).new_state?.status === task.status)
      return res.json({ data: { ...task, replayed: true } });
    return res.status(422).json({ error: "illegal_transition", from: task.status, action });
  }
  if (action === "accept") {
    await query(`UPDATE delivery_tasks SET rider_account_id = $1 WHERE id = $2`, [req.auth.account_id, task.id]);
  }
  if (proof !== undefined) {
    await query(`UPDATE delivery_tasks SET proof = $1 WHERE id = $2`, [JSON.stringify(proof), task.id]);
  }
  await query(`UPDATE delivery_tasks SET status = $1, updated_at = now() WHERE id = $2`, [t.to, task.id]);
  await appendNclEvent({
    actor_type: "rider",
    actor_id: req.auth.sub,
    event_type: t.event,
    entity_type: "delivery",
    entity_id: task.id,
    idempotency_key: `${task.id}:${action}`,
    prev_state: { status: task.status },
    new_state: { status: t.to, order_id: task.order_id, merchant_id: task.merchant_id },
    source: "nexg-api",
  });
  const updated = await getTask(task.id);
  res.json({ data: updated });
}

// Merchant/system creates the task when the order is handed off (called from orders PATCH).
// R-05: best-effort Expo push broadcast on offer (poll+SSE remain contract; never reject).
async function fanOutOfferPush(deliveryId: string, orderId: string, merchantId: string) {
  try {
    const tokens = await query(`SELECT expo_token FROM push_tokens LIMIT 100`);
    const list = (tokens as any[]).map((t) => t.expo_token).filter(Boolean);
    if (!list.length) return;
    const messages = list.slice(0, 100).map((to) => ({
      to,
      title: "New delivery offer",
      body: `Order #${orderId.slice(-6)} ready for pickup`,
      data: { deliveryId, orderId, merchantId, url: `nexg://delivery/${deliveryId}` },
    }));
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    }).catch(() => undefined);
  } catch {
    // push is additive — never fail the offer
  }
}

export async function createTaskForOrder(orderId: string, merchantId: string) {
  const existing = await query(`SELECT id FROM delivery_tasks WHERE order_id = $1`, [orderId]);
  if (existing[0]) return existing[0] as any;
  const id = newId("evt").replace("evt_", "dlv_");
  const rows = await query(
    `INSERT INTO delivery_tasks (id, order_id, merchant_id, status) VALUES ($1,$2,$3,'OFFERED') RETURNING *`,
    [id, orderId, merchantId]
  );
  await appendNclEvent({
    actor_type: "system",
    actor_id: "dispatch",
    event_type: "delivery.offered",
    entity_type: "delivery",
    entity_id: id,
    idempotency_key: `${id}:offered`,
    new_state: { status: "OFFERED", order_id: orderId, merchant_id: merchantId },
    source: "nexg-api",
  });
  void fanOutOfferPush(id, orderId, merchantId);
  return rows[0];
}

// Rider job board: open offers + own active/history tasks.
rider.get(
  "/jobs",
  requireRoles(["rider", "admin"]),
  async (req: any, res) => {
    const { status, since, limit, offset } = req.query as any;
    const roles: string[] = req.auth.roles ?? [];
    const lim = Math.min(Number(limit ?? 100), 200);
    const off = Math.max(Number(offset ?? 0), 0);
    const rows = await query(
      `SELECT d.*, m.name AS merchant_name, o.total_kes, o.status AS order_status
       FROM delivery_tasks d
       JOIN merchants m ON m.id = d.merchant_id
       JOIN orders o ON o.id = d.order_id
       WHERE ($1::text IS NULL OR d.status = $1)
         AND ($2::boolean OR d.status = 'OFFERED' OR d.rider_account_id = $3::uuid)
         AND ($4::timestamptz IS NULL OR d.updated_at > $4)
       ORDER BY d.created_at DESC LIMIT $5 OFFSET $6`,
      [status ?? null, roles.includes("admin"), req.auth.account_id, since ?? null, lim, off]
    );
    res.json({ data: rows, total: rows.length, limit: lim, offset: off });
  }
);

deliveries.get(
  "/:id",
  requireRoles(["rider", "merchant_owner", "merchant_staff", "admin"]),
  async (req: any, res) => {
    const task = await getTask(req.params.id);
    if (!task) return res.status(404).json({ error: "not_found" });
    const roles: string[] = req.auth.roles ?? [];
    if (!roles.includes("admin") && roles.includes("rider")) {
      if (!assertRider(req, task, res)) return;
    }
    if (!roles.includes("admin") && (roles.includes("merchant_owner") || roles.includes("merchant_staff"))) {
      if (req.auth.merchant_id !== task.merchant_id)
        return res.status(403).json({ error: "cross_merchant_forbidden" });
    }
    const lines = await query(`SELECT title, qty FROM order_lines WHERE order_id = $1`, [task.order_id]);
    res.json({ data: { ...task, lines } });
  }
);

deliveries.patch(
  "/:id",
  requireRoles(["rider", "merchant_owner", "merchant_staff", "admin"]),
  async (req: any, res) => {
    const { action, proof, reason } = req.body ?? {};
    const task = await getTask(req.params.id);
    if (!task) return res.status(404).json({ error: "not_found" });
    const roles: string[] = req.auth.roles ?? [];
    // Merchant cancel propagation (R gap c): staff may cancel ACCEPTED+ tasks.
    if (roles.includes("merchant_owner") || roles.includes("merchant_staff") || roles.includes("admin")) {
      if (req.auth.merchant_id && task.merchant_id !== req.auth.merchant_id && !roles.includes("admin"))
        return res.status(403).json({ error: "cross_merchant_forbidden" });
      if (action === "cancel") {
        await transition(task, "cancel", req, res, { reason: reason ?? "merchant cancelled" });
        return;
      }
      if (action === "reoffer") {
        // Clear claimant on re-offer so any rider can accept.
        await query(`UPDATE delivery_tasks SET rider_account_id = NULL WHERE id = $1`, [task.id]);
        await transition({ ...task, rider_account_id: null }, "reoffer", req, res);
        return;
      }
    }
    if (!assertRider(req, task, res)) return;
    if (action === "delivered" && !proof)
      return res.status(422).json({ error: "proof required (otp | photoUrl | signature)" });
    // Decline with reason (R gap d): store reason in proof for audit.
    const proofWithReason = action === "decline" && reason ? { reason } : proof;
    await transition(task, action, req, res, proofWithReason);
  }
);

// Proof photo upload: presigned S3 PUT (no binary through the API).
uploads.post(
  "/presign",
  requireRoles(["consumer", "rider", "merchant_owner", "merchant_staff", "host_owner", "host_staff", "admin"]),
  async (req, res) => {
    const { entity, entity_id, filename, content_type } = req.body ?? {};
    if (!entity || !entity_id || !filename)
      return res.status(422).json({ error: "entity + entity_id + filename required" });
    const key = `${entity}/${entity_id}/proof/${Date.now()}_${filename}`;
    const out = await presignUpload(key, content_type ?? "image/jpeg");
    res.json({ data: out });
  }
);

// Earnings derive from delivered tasks + order fees (read-only projection, never a balance).
rider.get(
  "/earnings",
  requireRoles(["rider", "admin"]),
  async (req: any, res) => {
    const roles: string[] = req.auth.roles ?? [];
    const riderId = (req.query.rider as string) ?? req.auth.account_id;
    if (!roles.includes("admin") && riderId !== req.auth.account_id)
      return res.status(403).json({ error: "forbidden" });
    const rows = await query(
      `SELECT d.id, d.order_id, d.status, d.created_at, o.total_kes, o.fees_kes
       FROM delivery_tasks d JOIN orders o ON o.id = d.order_id
       WHERE d.rider_account_id = $1::uuid AND d.status = 'DELIVERED'
       ORDER BY d.created_at DESC LIMIT 200`,
      [riderId]
    );
    const delivered = (rows as any[]).length;
    const gross = (rows as any[]).reduce((s, r) => s + Number(r.fees_kes ?? 0), 0);
    res.json({ data: { delivered, gross_kes: gross, tasks: rows } });
  }
);

// R-02 LIMTAI onboarding: backend-backed rider_profiles + admin approve.
// Pathways: independent (own vehicle) | dedicated (NexG vehicle+shift) | fleet (company+riders).
function validateRiderProfile(p: any): string | null {
  const t = p?.type ?? "independent";
  if (!["independent", "dedicated", "fleet"].includes(t)) return "unknown type (independent|dedicated|fleet)";
  if (!p?.personal?.name?.trim()) return "personal.name required";
  if (!p?.personal?.phone?.trim()) return "personal.phone required";
  if (!p?.identity_doc?.idNumber?.trim()) return "identity_doc.idNumber required";
  if (t === "independent") {
    if (!p?.vehicle?.type) return "vehicle.type required for independent";
    if (!p?.vehicle?.plate?.trim()) return "vehicle.plate required for independent";
  }
  if (t === "fleet") {
    if (!p?.company?.legalName?.trim()) return "company.legalName required for fleet";
    if (!p?.company?.regNum?.trim()) return "company.regNum required for fleet";
  }
  return null;
}

rider.get(
  "/profile",
  requireRoles(["rider", "admin"]),
  async (req: any, res) => {
    const roles: string[] = req.auth.roles ?? [];
    const accountId = (req.query.account as string) ?? req.auth.account_id;
    if (!roles.includes("admin") && accountId !== req.auth.account_id)
      return res.status(403).json({ error: "forbidden" });
    const rows = await query(`SELECT * FROM rider_profiles WHERE account_id = $1::uuid`, [accountId]);
    if (!rows[0]) return res.status(404).json({ error: "not_found" });
    res.json({ data: rows[0] });
  }
);

rider.post(
  "/profile",
  requireRoles(["rider", "admin"]),
  async (req: any, res) => {
    const body = req.body ?? {};
    const err = validateRiderProfile(body);
    if (err) return res.status(422).json({ error: err });
    const accountId = req.auth.account_id;
    const rows = await query(
      `INSERT INTO rider_profiles
        (account_id, type, personal, identity_doc, vehicle, docs, payout, emergency, services, shift, zone, company, fleet_riders, status, reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending',NULL)
       ON CONFLICT (account_id) DO UPDATE SET
        type=EXCLUDED.type, personal=EXCLUDED.personal, identity_doc=EXCLUDED.identity_doc,
        vehicle=EXCLUDED.vehicle, docs=EXCLUDED.docs, payout=EXCLUDED.payout,
        emergency=EXCLUDED.emergency, services=EXCLUDED.services, shift=EXCLUDED.shift,
        zone=EXCLUDED.zone, company=EXCLUDED.company, fleet_riders=EXCLUDED.fleet_riders,
        status='pending', reason=NULL, updated_at=now()
       RETURNING *`,
      [
        accountId, body.type ?? "independent",
        JSON.stringify(body.personal ?? {}), JSON.stringify(body.identity_doc ?? {}),
        JSON.stringify(body.vehicle ?? {}), JSON.stringify(body.docs ?? {}),
        JSON.stringify(body.payout ?? {}), JSON.stringify(body.emergency ?? {}),
        body.services ?? [], body.shift ?? null, body.zone ?? null,
        JSON.stringify(body.company ?? {}), JSON.stringify(body.fleet_riders ?? []),
      ]
    );
    await appendNclEvent({
      actor_type: "rider",
      actor_id: req.auth.sub,
      event_type: "rider.submitted",
      entity_type: "rider",
      entity_id: accountId,
      idempotency_key: `${accountId}:submitted:${rows[0].updated_at}`,
      new_state: { status: "pending", type: rows[0].type, account_id: accountId },
      source: "nexg-api",
    });
    res.status(201).json({ data: rows[0] });
  }
);

rider.patch(
  "/profile/:account",
  requireRoles(["admin"]),
  async (req: any, res) => {
    const { action, reason } = req.body ?? {};
    if (!["approve", "reject"].includes(action))
      return res.status(422).json({ error: "action approve|reject required" });
    if (action === "reject" && !reason?.trim())
      return res.status(422).json({ error: "reason required to reject (what-to-fix)" });
    const rows = await query(`SELECT * FROM rider_profiles WHERE account_id = $1::uuid`, [req.params.account]);
    if (!rows[0]) return res.status(404).json({ error: "not_found" });
    const to = action === "approve" ? "approved" : "rejected";
    const updated = await query(
      `UPDATE rider_profiles SET status=$1, reason=$2, updated_at=now() WHERE account_id=$3::uuid RETURNING *`,
      [to, action === "reject" ? reason.trim() : null, req.params.account]
    );
    await appendNclEvent({
      actor_type: "admin",
      actor_id: req.auth.sub,
      event_type: action === "approve" ? "rider.approved" : "rider.rejected",
      entity_type: "rider",
      entity_id: req.params.account,
      idempotency_key: `${req.params.account}:${to}`,
      prev_state: { status: (rows[0] as any).status },
      new_state: { status: to, account_id: req.params.account, ...(reason ? { reason } : {}) },
      source: "nexg-api",
    });
    res.json({ data: updated[0] });
  }
);

// R-05 push token registration (rider own; admin anywhere for tests).
rider.post(
  "/push-token",
  requireRoles(["rider", "admin"]),
  async (req: any, res) => {
    const { expo_token, platform } = req.body ?? {};
    if (!expo_token?.startsWith?.("ExponentPushToken["))
      return res.status(422).json({ error: "valid expo_token required" });
    await query(
      `INSERT INTO push_tokens (account_id, expo_token, platform, updated_at)
       VALUES ($1::uuid,$2,$3,now())
       ON CONFLICT (account_id, expo_token) DO UPDATE SET updated_at=now()`,
      [req.auth.account_id, expo_token, platform ?? "unknown"]
    );
    res.status(201).json({ data: { registered: true } });
  }
);
