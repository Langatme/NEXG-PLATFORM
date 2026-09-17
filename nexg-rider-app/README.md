# NEXG Rider App v0.1 — M2 functional (same stack as consumer)

Golden path: Assignment → Navigation → Pickup → Delivery → Proof → Completion.
Tabs: Jobs · Active · Earnings · Account.

- Same tokens/components as `nexg-consumer` — extend `NexG*` primitives, no parallel systems.
- Domain APIs: `GET /rider/jobs`, `GET|PATCH /deliveries/:id`, `POST /uploads/presign`,
  `GET /rider/earnings`. OTP proof live; photo/signature in M4.
- 15s poll on jobs = realtime contract (WebSocket decision in M4).
- Every mutation sends idempotency semantics and emits NCL events — Admin reads later.
- States: loading/skeleton/empty/error/offline on every backend screen. No dead clicks.

Run: `npm i && npx expo start` with `EXPO_PUBLIC_API_URL` pointing at `nexg-backend`.
Flows: `docs/FLOWS_RIDER.md`. Record: `docs/M2_RECORD.md`.
