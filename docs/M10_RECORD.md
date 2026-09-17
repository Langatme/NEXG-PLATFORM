# M10 Record — PASS: consumer rebuilt in-platform (real directory)

Date: 2026-09-12. Follows the M9 incident (symlink trap destroyed the external
consumer tree; no backup existed). The owner accepted the loss; this record
covers the clean-room rebuild. No symlinks for app code from here on.

## What was built
Real `nexg-platform/nexg-consumer/` Expo app (Expo ~57.0.20, RN 0.86.3,
React 19.2.3, expo-router, Zustand+MMKV, React Query, Reanimated):
- **Config**: package.json (pinned `expo-image@57.0.2` — the registry's `~57.0.1`
  copy was an unbuilt husk that broke `tsc` in both trees), app.json, tsconfig,
  `.env.example`, `.gitignore`; fresh `npm install` (915 packages).
- **Foundation** (from merchant tree, same design system): theme, domain/types
  (full consumer model kept), components/ui, utils (+`cart.ts`, `quickReturn.ts`,
  consumer media resolvers), lib composer/events/messaging.
- **Services**: guest ladder + DTO mappers + order/booking/cancel/modify/events/
  suggestions/sessions/requests/inbox fetchers (`services/nexg/*`); API-first,
  honest offline states (no fake mock catalog).
- **Screens** (all M7/M8 scope restored): public welcome/auth suite (10 screens),
  QR entry + deep links, tabs home/activity/account, search (live suggestions,
  sort/filter/history), notifications + detail, merchant/item modals (config,
  reviews, info), cart/schedule/checkout (fulfilment, addresses, customer
  details, simulated M-Pesa)/confirmation, activity detail (timeline, live
  polls, modify, requests, contact sheets, cancel, reorder, receipt, rate),
  inbox + conversations, account sub-screens (profile, addresses, preferences,
  privacy/security/deletion, help + cases).
- Simplifications vs the lost tree (documented, not hidden): no giant mock
  catalog/taxonomy (API-first + empty states), no experience-engine
  composition layer (direct variant/addon config), no Apple/Google buttons
  (guest + phone first), text logo (no binary assets were recoverable).

## Proof
- `npx tsc --noEmit -p tsconfig.json` clean in `nexg-consumer/`.
- Backend untouched and green: `consumer-qa` 333/333, `msg-verify` 9/9.
- Mirror discipline: `cmd /c dir` reparse-point check is step zero before any
  mirror/wipe/delete (M9 rule); `Test-Path`/`Get-ChildItem`/robocopy codes are
  not trusted on reparse points.

## Still out (unchanged)
Camera QR scan, messaging read-receipts, backend-persisted profiles/payments,
turn-by-turn maps, ML recommendations, STK/push/GL.
