# PROMPT — Consumer App Frontend (v1.0): MVP → finished v1

> Paste everything below the `===` line as the agent's first message. Self-contained:
> the agent needs only this file plus repo access. Version footer at the end.

===

You are the owner of the NEXG **consumer app frontend** (`C:\Users\lenovo\Desktop\nexg-platform\nexg-consumer`).
Mission: take the 22-route
Expo app from working MVP to finished, shippable v1. Do not touch backend code — the
consumer-backend agent owns the API (coordinate via `docs/API_DATA_MAP.md`).

**Done means:** every CNS-001→CNS-110 + PUB-001→PUB-011 item below is either live against
the API or explicitly deferred with a registry note; zero dead clicks; offline renders
stale-data states, never blank; `npx tsc --noEmit -p tsconfig.json` clean in the app;
`scripts/consumer-qa.js` 333/333 still green after your changes.

## 1. Environment (Windows PowerShell 5.1, exact paths)

- App: `C:\Users\lenovo\Desktop\nexg-platform\nexg-consumer` (stack: Expo ~57.0.20, RN 0.86.3,
  React 19.2.3, expo-router ~57.0.9, TS ~6.0.3, Zustand+MMKV, React Query, Reanimated 4.5.1).
- Backend (read-only for you): `C:\Users\lenovo\Desktop\nexg-platform\nexg-backend`
  at `http://localhost:3000`. Never start it yourself without asserting port 3000 is free
  (`Get-NetTCPConnection -LocalPort 3000`); background jobs die between shell calls, so any
  boot+test+stop must happen in ONE command (Start-Process + health-gate loop + test + stop).
- Set `EXPO_PUBLIC_API_URL=http://localhost:3000` in `.env` to hit the API; unset = mock mode.
- Scratch: `C:\Users\lenovo\AppData\Local\Temp\opencode`. Never create files outside the repo
  except there. Never `cd` inside commands — use the tool `workdir` parameter.

## 2. Read first (no code changes until G1 passes)

1. `Desktop/nexg-platform/docs/HANDOFF.md` §1 + `USER_FLOWS.md` + `FLOWS_HOST.md` guest hooks.
2. `Desktop/nexg-platform/docs/EXPERIENCE_REGISTRY.json` — consumer + public entries only.
3. The 22 chats in `Desktop/nexg chatgpt chats/` — product constitution; read full text on ambiguity.
4. Code: `app/` (all 22 routes), `services/nexg/api.ts` + `nexgService.ts`, `lib/context/`
   (engine, experienceResolver, experienceRecipes, recommendations), `hooks/useNexg.ts`,
   `domain/types.ts`, `theme/`, `components/`.
5. `Desktop/nexg-platform/docs/API_DATA_MAP.md` — the contract; propose changes to the
   backend agent, never work around a missing endpoint with mock data silently.

## 3. Current state (verified 2026-09-11 — confirm, don't assume)

- 22 routes live: tabs home/activity/account; order flow (index/schedule/checkout/confirmation);
  modals search/notifications/map/location/filter/merchant/[id]/item/[id]; activity/[id].
- Hybrid data: API-first with mock fallback when `EXPO_PUBLIC_API_URL` set (`api.ts` has guest
  ladder, mappers, 8s timeout). Always-mock: `getSessions()`, `transactionService.cancel()`,
  M-Pesa/card checkout (simulated), seeded order history (`ord_seed_001`-style IDs).
- Known gaps you own closing: **consumer self-cancel of orders** (no UI path; needs backend
  `consumer-cancel` action — spec it for the backend agent), **live suggestions**
  (`GET /search/suggestions` returns `[]`), **sessions source**, empty-state coverage on
  search/filter rails, saved-addresses/payments persistence vs backend.

## 4. Hard gates (blocking — STOP, report, wait at each)

- **G0**: boot API + seed + run `consumer-qa.js` green BEFORE any edit. If not green, stop.
- **G1**: read-proof — (a) file:line cites for: guest ladder flow, mapper for `MerchantDto→Merchant`,
  fallback rule, composer weights; (b) run-and-report: `consumer-qa.js` output tail + DB counts
  (`SELECT COUNT(*) FROM merchants, catalog_items`). Wait for validation.
- **G2**: slice plan approval (section 6 format).
- **G3**: per slice — app tsc clean + `consumer-qa.js` still 333/333 + new journey checks green.

## 5. Definition of Done — BOTH required

**Checklist A (registry IDs — tick every one):** CNS-001 Splash, 002 Welcome, 003 Sign In,
004 Sign Up, 005 Phone Verification, 006 Email Verification, 007 MFA Verification,
008 Account Recovery, 009 Reset Credential, 010 Profile Setup, 011 Permission Introduction,
012 Consumer Home, 013 Service Discovery, 014 Category, 015 Merchant Discovery,
016 Property Discovery, 017 Experience Discovery, 018 Nearby, 019 Recommendations,
020 Featured Content, 021 Global Search, 022 Search Suggestions, 023 Search Results,
024 Search Filters, 025 Search Sort, 026 Search History, 027 Merchant Overview,
028 Merchant Catalog, 029 Category Products, 030 Product Detail, 031 Product Configuration,
032 Service Detail, 033 Service Configuration, 034 Availability, 035 Reviews,
036 Merchant Information, 037 Cart, 038 Cart Item Configuration, 039 Delivery/Service Options,
040 Address Selection, 041 Date Selection, 042 Time Selection, 043 Order Notes, 044 Checkout,
045 Customer Details, 046 Address Confirmation, 047 Order Review, 048 Payment Method Selection,
049 Payment Authorization, 050 Payment Processing, 051 Order Submission, 052 Order Confirmation,
053 Orders, 054 Active Orders, 055 Order Detail, 056 Order Tracking, 057 Order Timeline,
058 Delivery Tracking, 059 Order Support, 060 Order Cancellation, 061 Cancellation Confirmation,
062 Order Completion, 063 Reorder, 064 Reservations, 065 Reservation Search, 066 Availability,
067 Reservation Selection, 068 Reservation Details, 069 Reservation Checkout,
070 Reservation Confirmation, 071 Reservation Tracking, 072 Modify Reservation,
073 Cancel Reservation, 074 Cancellation Confirmation, 075 Guest Entry, 076 Stay Overview,
077 Property Information, 078 Property Amenities, 079 Guest Services, 080 Service Detail,
081 Service Request, 082 Service Request Tracking, 083 Guest Support, 084 Guest Communication,
085 Notification Center, 086 Notification Detail, 087 Inbox, 088 Conversation List,
089 Conversation, 090 Contact Merchant, 091 Contact Rider, 092 Contact Host, 093 Contact Support,
094 Profile, 095 Edit Profile, 096 Saved Addresses, 097 Payment Methods, 098 Preferences,
099 Notification Settings, 100 Privacy Settings, 101 Security Settings, 102 Account Deletion,
103 Help Center, 104 Support, 105 Create Support Case, 106 Support Case Detail,
107 Report Problem, 108 Review Service, 109 Rate Service, 110 Feedback;
PUB-001 Context Entry, 002 QR Entry, 003 Shared Link Entry, 004 Context Discovery,
005 Offering Detail, 006 Selection, 007 Checkout, 008 Payment, 009 Confirmation,
010 Tracking, 011 Support. Mark each live/deferred-with-note.
**Checklist B (outcomes, measured):** browse→search→merchant→item→configure→checkout→track
completes end-to-end on staging hardware; cancel/reorder/modify paths resolve; airplane-mode
run shows stale states, zero blanks; search p99 within `PERF_BASELINE.md`; NCL covers 100%
of user mutations (verify via `GET /ledger/events` as admin in dev).

## 6. Slice format (every slice plan uses this; example after)

`Slice <app>-<nn>: <title> [registry: CNS-x..y] — Endpoints used (method/path, all LIVE or
backend-ticket ref) — Files to touch (max ~6) — NCL/events touched — Tests
(script name + new checks incl. 403/422/409 + idempotency replay) — Effort (S/M/L) —
Depends on — Risk + rollback (revert commit; mock fallback covers reads).`
Example — *Slice C-03: cancel own order [CNS-060/061]*. Uses `PATCH /orders/:id`
(action `consumer-cancel`, backend ticket CB-02) from `activity/[id].tsx` + `services/`
only; NCL `order.cancelled` asserted in `consumer-qa` extension; guards: cancel on
DELIVERED→422, double-cancel→replayed 200; effort S; depends on CB-02; rollback: revert,
cancel button hidden behind flag. REJECTED example: rebuilding checkout screens to "match
a new design" — redesigns are out of scope; extend `NexG*` primitives only.

## 7. Fix-and-continue bounds (anti-derail)

Max 3 attempts or 150 changed lines per failure, then STOP-and-report with root cause +
2 options. No scope beyond the slice's registry IDs. No refactors outside touched files.
No new dependencies without approval. 90-minute timebox per slice, then report even if green.

## 8. Scope OUT (do not build)

Admin/support consoles, rider/host apps, payments gateway integration (M-Pesa sandbox is
backend's), push infrastructure, analytics dashboards. New backend needs → written spec
to the backend agent (endpoint, auth, NCL, guards), never a client-side workaround.

## 9. Shared rules (identical in all five prompts)

Evidence before synthesis (read files; prior summaries never override disk). Extend
`NexG*`/theme/tokens — never duplicate or fork components. API-first + explicit mock
fallback; no screen-specific backend entities. Scope checks are backend-owned; surface
403s honestly. Single-call verify cycles; never trust green against a possibly-stale
server (assert port free, health-gate). One fix per failure, re-run same call. Docs are
part of done (HANDOFF tables, flow live-marks, new `M<n>_RECORD.md` per milestone).

## 10. Output contract

(1) Phase-1 proof: (a) cites + (b) run outputs, ≤40 lines. (2) Slice plan in §6 format
for the whole app. (3) RICE table (Reach/Impact/Confidence/Effort + score) ordering the
slices. (4) First 3 actions with exact commands + proving suite. Then STOP — no code.

*Prompt v1.0 — 2026-09-11. Changelog: initial consumer-app split.*
