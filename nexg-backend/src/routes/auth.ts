import { Router } from "express";
import { query } from "../db.js";
import {
  hashPin,
  requireRoles,
  revokeToken,
  signAccess,
  signRefresh,
  verifyPin,
  verifyToken,
  type AuthClaims,
  type Role,
} from "../auth.js";

export const auth = Router();

// Custom auth v0.1: phone + pin (M-Pesa-style). No third-party provider.
// Persons -> accounts with roles; one person can hold many roles (consumer + merchant + host).
// Staff kinds anchor to one merchant_id (scope). Owner/admin accounts are created
// via POST /auth/accounts (admin) or bootstrap key (dev) — never self-register.

const SELF_KINDS = ["customer", "merchant_staff", "rider", "host_staff"] as const;
const KIND_TO_ROLE: Record<string, Role> = {
  customer: "consumer",
  merchant_staff: "merchant_staff",
  rider: "rider",
  host_staff: "host_staff",
};

function claimsFor(personId: string, accounts: any[]): AuthClaims {
  const roles = accounts.map((a) =>
    a.kind === "customer" ? "consumer" : (a.kind as Role)
  );
  const staff = accounts.find((a) => a.merchant_id);
  return {
    sub: personId,
    account_id: accounts[0]?.id,
    roles: roles.length ? roles : ["consumer"],
    ...(staff ? { merchant_id: staff.merchant_id, scope: `merchant:${staff.merchant_id}` } : {}),
  };
}

auth.post("/register", async (req, res) => {
  const { phone, display_name, pin, kind = "customer", merchant_id } = req.body ?? {};
  if (!phone || !pin) return res.status(422).json({ error: "phone + pin required" });
  if (!SELF_KINDS.includes(kind))
    return res.status(422).json({ error: "kind must be self-registerable (owner/admin via invite)" });
  if (kind !== "customer" && !merchant_id && (kind === "merchant_staff" || kind === "host_staff"))
    return res.status(422).json({ error: "merchant_id required for merchant/host staff" });
  if (merchant_id) {
    const m = await query(`SELECT id FROM merchants WHERE id = $1`, [merchant_id]);
    if (!m[0]) return res.status(422).json({ error: "unknown merchant_id" });
  }
  const pin_hash = await hashPin(String(pin));
  try {
    const person = (
      await query(`INSERT INTO persons (phone, display_name, pin_hash) VALUES ($1,$2,$3) RETURNING id`, [
        phone,
        display_name ?? null,
        pin_hash,
      ])
    )[0] as any;
    const account = (
      await query(`INSERT INTO accounts (person_id, kind, merchant_id) VALUES ($1,$2,$3) RETURNING id`, [
        person.id,
        kind,
        merchant_id ?? null,
      ])
    )[0] as any;
    const claims = claimsFor(person.id, [{ ...account, kind, merchant_id: merchant_id ?? null }]);
    res.status(201).json({
      data: {
        person_id: person.id,
        account_id: account.id,
        role: KIND_TO_ROLE[kind],
        access: signAccess(claims),
        refresh: signRefresh({ sub: person.id, account_id: account.id }),
      },
    });
  } catch (err: any) {
    if (err?.code === "23505") return res.status(409).json({ error: "phone_taken" });
    throw err;
  }
});

auth.post("/login", async (req, res) => {
  const { phone, pin } = req.body ?? {};
  const rows = await query(`SELECT * FROM persons WHERE phone = $1`, [phone]);
  const person: any = rows[0];
  if (!person?.pin_hash) return res.status(401).json({ error: "invalid_credentials" });
  const ok = await verifyPin(String(pin), person.pin_hash);
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });
  const accounts = await query(`SELECT * FROM accounts WHERE person_id = $1`, [person.id]);
  const claims = claimsFor(person.id, accounts as any[]);
  res.json({
    data: {
      person_id: person.id,
      account_id: claims.account_id,
      access: signAccess(claims),
      refresh: signRefresh({ sub: person.id, account_id: claims.account_id }),
    },
  });
});

auth.post("/refresh", async (req, res) => {
  const { refresh } = req.body ?? {};
  if (!refresh) return res.status(422).json({ error: "refresh required" });
  try {
    const t = verifyToken<{ sub: string; account_id: string; type?: string }>(refresh);
    if (t.type !== "refresh") return res.status(401).json({ error: "not_refresh_token" });
    const accounts = await query(`SELECT * FROM accounts WHERE person_id = $1`, [t.sub]);
    if (!accounts.length) return res.status(401).json({ error: "account_gone" });
    const claims = claimsFor(t.sub, accounts as any[]);
    res.json({
      data: {
        access: signAccess(claims),
        refresh: signRefresh({ sub: t.sub, account_id: claims.account_id }),
      },
    });
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
});

// Owner/admin provisioning: admin only, or dev bootstrap key (ADMIN_BOOTSTRAP_KEY env).
auth.post("/accounts", async (req, res) => {
  const { person_id, kind, merchant_id } = req.body ?? {};
  const bootstrap = req.headers["x-bootstrap-key"];
  const expectedKey = process.env.ADMIN_BOOTSTRAP_KEY ?? "nexg-dev-bootstrap";
  const isBootstrap =
    expectedKey && bootstrap === expectedKey;
  if (!isBootstrap) {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "unauthorized" });
    try {
      const c = verifyToken(token) as AuthClaims;
      if (!c.roles.includes("admin")) return res.status(403).json({ error: "forbidden" });
    } catch {
      return res.status(401).json({ error: "invalid_token" });
    }
  }
  if (!person_id || !kind) return res.status(422).json({ error: "person_id + kind required" });
  const account = (
    await query(`INSERT INTO accounts (person_id, kind, merchant_id) VALUES ($1,$2,$3) RETURNING id`, [
      person_id,
      kind,
      merchant_id ?? null,
    ])
  )[0] as any;
  res.status(201).json({ data: { account_id: account.id, kind, merchant_id: merchant_id ?? null } });
});

auth.post("/logout", requireRoles(["consumer", "merchant_owner", "merchant_staff", "rider", "host_owner", "host_staff", "admin"]), async (req: any, res) => {
  // Revocation list (010): client discards tokens AND server rejects the access token afterwards.
  try {
    if (req.token) await revokeToken(req.token, req.auth?.account_id);
  } catch {}
  res.json({ data: { ok: true } });
});
