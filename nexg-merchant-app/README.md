# NEXG Merchant App v0.1 shell (same stack as consumer)

Workspace-first: What needs attention? What's happening? What next? How performing?

Tabs (per docs, NOT final screens): Orders | Catalog | Finance | Account

- Same tokens/components as `nexg-consumer` — extend `NexG*` primitives, no parallel card systems.
- Domain APIs: `GET /merchants, /catalog/items, /orders` + `POST /orders/:id/accept|reject|ready` (backend to add action routes next).
- Every mutation sends `idempotency_key` and emits NCL event — Admin reads these later (no Admin UI now).
- States: loading/skeleton/empty/error/offline on every backend screen. No dead clicks.

Run: `npm i && npx expo start` with `EXPO_PUBLIC_API_URL` pointing at `nexg-backend`.
