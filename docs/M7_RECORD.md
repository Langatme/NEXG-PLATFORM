# M7 Record — PASS: Consumer app completion (CNS-001→110 + PUB-001→011 read-only)

Scope: all 8 consumer slices C-01→C-08. Backend unchanged (M5/M6 green).
Exit: app `tsc` clean + `consumer-qa` 333/333 + M0 20/20.

## Shipped
- **C-01 Auth (CNS-001→011):** `splash`, `sign-in` (phone+PIN → `ensureSession`), `sign-up` → `profile-setup` → `permissions`, `verify-email`, `mfa`, `recovery` → `reset`. Registered in `(public)/_layout`.
- **C-02 Search (CNS-022→026):** live `apiSuggestions` with static fallback, sort (relevance/rating/price) + Open-now filter, recent history with clear.
- **C-03 Commerce (CNS-029→036):** reviews + merchant info (hours/address/policies/tags) in `merchant/[id]`; config + availability already via `NexGItemExperience`.
- **C-04 Checkout (CNS-039→051):** ASAP/Scheduled/Pickup options, address presets + custom, customer name/phone gate, notes, promo, simulated M-Pesa PIN (STK deferred per decision).
- **C-05 Tracking (CNS-056→063):** map deep-link, live NCL poll (15s), rider card, support, cancel, reorder, receipt, rate.
- **C-06 Bookings (CNS-064→074):** activity search + kind filter, detail modify form (guests/date → `apiModifyBooking`, 422/409 surfaced), cancel flow.
- **C-07 Guest QR (PUB-001→011 + CNS-075→084, read-only):** `(public)/qr` code entry → property page + concierge empty-state; entry link on welcome. No camera dep; no threads per decision.
- **C-08 Account (CNS-085→110, minus threads):** `account/` sub-screens — edit-profile, addresses, preferences/notifications, privacy-security + deletion, help + local cases + case detail. Account rows deep-link to each. Inbox/notifications modal retained; contact = support sheets.

## Proof
- `npx tsc --noEmit -p tsconfig.json` clean (consumer).
- `consumer-qa.js` 333/333 + `m0-verify.js` 20/20 vs live API, same session.
- No backend changes; no new deps.

## Repairs
1. Account rows brace drop (`onPress={() =>` typo) — caught by tsc, one-line fix.
2. `formatTime(string)` type error on live events — wrapped `new Date(...)`.

## Deferred (explicit)
Real STK gateway, messaging thread model + inbox threads, backend-persisted profiles/addresses/payments (MMKV local), turn-by-turn tracking map, ML recommendations.
