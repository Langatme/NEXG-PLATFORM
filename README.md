# NEXG Platform (monorepo of separate repos)

Per `NEXG Platform Architecture` + `screen count` docs — 8 surfaces, Enterprise = roles not an app.

| Folder | Surface | Stack | Status |
|---|---|---|---|
| `nexg-consumer/` | Consumer App+Web+QR (25-35 screens) | Expo RN, in-platform source of truth (rebuilt M10) | live, tsc clean |
| `nexg-merchant-app/` | Merchant App+Web+Portal (35-50 + 20-30) | Expo RN, same tokens | v1 live (M11: M-10→M-16/M-18, portal deferred) |
| `nexg-rider-app/` | Rider App+Web (25-35 + 15-20) | Expo RN, same tokens | MVP live, v1 slices R-01→R-03 |
| `nexg-host-app/` | Host App+Web+Workspace (30-40 + 20-30) | Expo RN, same tokens | MVP live, v1 slices H-05→H-12 |
| `nexg-admin-web/` | Admin Web (30-45) | Expo web / Next.js TBD | folder only |
| `nexg-ops-workspace/` | Operations + Support (10-20) | Web TBD | folder only |
| `nexg-backend/` | Core Platform: Identity, Payments, Search, Media, Events + NCL ledger | Node + Postgres 16 + Object storage/CDN | schema v0.1 + compose ready |
| Observability | Sentry (already in consumer) + console TBD | — | deferred |

Backend domain APIs (not screen-APIs): `GET /merchants /catalog/items /search/suggestions /customers /finance/summary /staff /promos`, `POST /orders /bookings /promos /catalog/publish`, NCL `POST /ledger/events` (append-only).

Run: `docker compose up -d` → Postgres `localhost:5432` (nexg/nexg_dev_password), Adminer `:8080`.
