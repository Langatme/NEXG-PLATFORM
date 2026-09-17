import bcrypt from "bcrypt"; // native (libuv threadpool) — bcryptjs blocked the event loop
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { query } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-dev-only-min-32-chars";
const ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? "30d";

export type Role =
  | "consumer"
  | "merchant_owner"
  | "merchant_staff"
  | "rider"
  | "host_owner"
  | "host_staff"
  | "admin";

export interface AuthClaims {
  sub: string; // person_id
  account_id: string;
  roles: Role[];
  org_id?: string;
  merchant_id?: string; // scope anchor for merchant/rider/host staff (M0: one merchant)
  scope?: string; // e.g. merchant:mrc_001 | portfolio:all | region:nairobi
}

export async function hashPin(pin: string) {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string) {
  return bcrypt.compare(pin, hash);
}

export function signAccess(claims: AuthClaims) {
  return jwt.sign(claims, JWT_SECRET, { expiresIn: ACCESS_TTL } as any);
}

export function signRefresh(claims: Pick<AuthClaims, "sub" | "account_id">) {
  return jwt.sign({ ...claims, type: "refresh" }, JWT_SECRET, {
    expiresIn: REFRESH_TTL,
  } as any);
}

export function verifyToken<T = AuthClaims>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function isTokenRevoked(token: string): Promise<boolean> {
  try {
    const rows = await query(`SELECT 1 FROM revoked_tokens WHERE token_hash = $1`, [hashToken(token)]);
    return !!rows[0];
  } catch {
    return false; // revocation table missing (pre-010 DB) → allow, logout will create it
  }
}

export async function revokeToken(token: string, account_id?: string): Promise<void> {
  await query(
    `INSERT INTO revoked_tokens (token_hash, account_id) VALUES ($1,$2::uuid) ON CONFLICT DO NOTHING`,
    [hashToken(token), account_id ?? null]
  );
}

export function requireRoles(allowed: Role[]) {
  return async (req: any, res: any, next: any) => {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "unauthorized" });
    try {
      const claims = verifyToken(token) as AuthClaims & { type?: string };
      if (claims.type === "refresh") return res.status(401).json({ error: "refresh_not_access" });
      if (await isTokenRevoked(token)) return res.status(401).json({ error: "revoked" });
      const ok = claims.roles?.some((r) => allowed.includes(r));
      if (!ok) return res.status(403).json({ error: "forbidden" });
      (req as any).auth = claims;
      (req as any).token = token;
      next();
    } catch {
      return res.status(401).json({ error: "invalid_token" });
    }
  };
}

/**
 * Scope check for merchant-anchored mutations (M0 ship-blocker fix).
 * Admin passes everywhere. Merchant/rider/host roles must act within their
 * claims.merchant_id; consumers act as themselves (account match handled by route).
 * getTarget extracts the merchant_id the request wants to touch.
 */
export function requireMerchantScope(getTarget: (req: any) => string | null | undefined) {
  return (req: any, res: any, next: any) => {
    const claims = (req as any).auth as AuthClaims;
    if (!claims) return res.status(401).json({ error: "unauthorized" });
    if (claims.roles.includes("admin")) return next();
    const staff = claims.roles.some((r) =>
      ["merchant_owner", "merchant_staff", "rider", "host_owner", "host_staff"].includes(r)
    );
    if (!staff) return next(); // consumers scoped by account, not merchant
    // R-01: riders are scoped by assignment (delivery_tasks.rider_account_id) in
    // route handlers, not by merchant. Merchant-less riders must pass here so
    // handlers can enforce assigned-task scoping (no 403-or-leak).
    if (claims.roles.includes("rider") && !claims.merchant_id) return next();
    const target = getTarget(req);
    if (!claims.merchant_id) return res.status(403).json({ error: "no_merchant_scope" });
    if (target && target !== claims.merchant_id)
      return res.status(403).json({ error: "cross_merchant_forbidden" });
    next();
  };
}

const ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/** Collision-safe readable IDs: ord_lx2abc_9f3k2q (replaces Date.now-only IDs). */
export function newId(prefix: "ord" | "bkg" | "evt"): string {
  const t = Date.now().toString(36);
  let r = "";
  for (let i = 0; i < 6; i++) r += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
  return `${prefix}_${t}_${r}`;
}
