# NEXG Host App v0.1 — M3 functional (same stack as consumer)

Environmental coordinator, not another merchant.
Tabs: Portfolio · Bookings · Tasks · Account.

- Same tokens/components as `nexg-consumer` — extend `NexG*` primitives, no parallel systems.
- Domain APIs: `GET /bookings?merchant&from&to`, `GET|PATCH /bookings/:id`,
  `GET|POST|PATCH /requests`. Stay lifecycle + service/housekeeping/maintenance boards.
- Every mutation emits NCL events — Admin reads later.
- States: loading/skeleton/empty/error/offline on every backend screen. No dead clicks.

Run: `npm i && npx expo start` with `EXPO_PUBLIC_API_URL` pointing at `nexg-backend`.
Flows: `docs/FLOWS_HOST.md`. Record: `docs/M3_RECORD.md`.
