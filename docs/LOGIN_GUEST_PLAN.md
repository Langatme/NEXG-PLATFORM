# NEXG Login + Guest Plan (v1.0)

> Status: PLAN (approved: wolt structure, obvious guest, 10+ experiences, wall at checkout).
> Owner: Consumer-app dev (+ tiny backend for guest ladder). Target: before onboarding-refresh.
> Registry: CNS-001→011 (auth), CNS-075 (guest entry). Experience entry feeds BYO_BUILDER.

## 0. Objective

A wolt-grade landing (motion backdrop + logo + tagline + auth buttons) where
**Continue as Guest is a full-width obvious button**, not a link — plus experience
shortcuts (Weekend, Date Night, Birthday, Night Out, Family Day, Staycation,
Surprise, Adventure, Business Trip, Self-care, +more) that deep-link into the
experience builder even as guest. Guest browses + carts; login wall hits at checkout
with cart preserved.

## 1. Screen anatomy (reference: wolt `(public)/index.tsx`, rebuilt NEXG-native)

1. Motion backdrop (Nairobi reel, top-welcome pattern; static image fallback offline)
2. NEXG logo + tagline ("Almost everything, around you")
3. Phone/OTP primary button → OTP sheet (ahmedbna `input-otp`)
4. Google + Apple buttons (existing auth)
5. **Continue as Guest — full-width secondary button, same size as auth buttons**
6. Experience chips rail (10+ templates → `/experience/{template}` deep links)
7. Privacy caption (existing)

Components (all wrapped as `NexG*`, extend-don't-duplicate): ahmedbna `onboarding`,
`button`, `input-otp`, `carousel`; `NexGSkeletonView` while session restores.

## 2. Guest ladder (backend + app)

- Guest tap → auto-provisioned consumer-role identity (same pattern as host guest
  preview: read-only boards, writes staff-gated). `POST /auth/register {kind:
  guest}` (new ticket CB-GUEST, NCL `auth.granted`, own-account scope).
- Cart persists in MMKV under guest id; on login/OTP-verify, cart migrates to the
  real account (merge by `idempotency_key`, no double-charge).
- Wall at checkout: sheet explains "one step — verify to pay", OTP inline,
  returns to the same checkout state (cart + promo + address intact).
- Writes that require identity (order/book/request/payment) 401 with
  `guest_wall` code → app opens the wall sheet (never a raw error).

## 3. Experience shortcuts (10+)

Weekend · Date Night · Birthday · Night Out · Family Day · Staycation · Surprise ·
Adventure · Business Trip · Self-care · (+ more via builder). Each chip opens the
BYO builder prefilled (see BYO_BUILDER_PLAN). Guest-built experiences convert to
real carts at the same checkout wall.

## 4. States (system-states rule)

loading (session restore skeleton) / offline (static backdrop + cached chips) /
error (honest retry) / guest-stale banner ("browsing as guest · cart saved on this
device"). Zero blanks, zero dead chips.

## 5. Acceptance

- [ ] Guest: launch → guest → search → merchant → item → cart → wall → OTP → pay → Activity (end-to-end <5min staging)
- [ ] Kill + reinstall mid-guest-cart → cart restored after login
- [ ] Airplane-mode launch shows cached landing + chips, never blank
- [ ] `consumer-qa` 333/333 still green + app `tsc` clean
- [ ] NCL: `auth.granted` (guest + convert), `order.placed` post-wall

## 6. Rollback

Guest button behind `guestEntry` flag (default ON per approval); revert commit
hides it and auth screens behave as today. No migration rollback needed
(`kind: guest` rows are ordinary accounts).
