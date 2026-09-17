# Device testing checklist (phone + laptop)

Physical phones can't reach `localhost` — the app must point at the laptop's
LAN IP, and the backend + DB must be up. Symptom of a stale IP is a 10s hang
then a timeout (`FetchRequestCanceledException` on iOS).

## Before each device session

1. Laptop IP (DHCP changes it per network):
   `Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' }`
2. Put that IP in the app's `.env` (only merchant has one today):
   `EXPO_PUBLIC_API_URL=http://<LAN-IP>:3000`
   Env is baked at bundle time — always restart Expo with `npx expo start -c`.
3. Docker Desktop running (green), then from `nexg-platform/`:
   `docker compose up -d` (postgres `:5433`, minio `:9000/:9001`).
4. Boot API (`node --import tsx src/index.ts` in `nexg-backend/`) and prove the
   DB path, not just `/health` (health passes with the DB down):
   `Invoke-RestMethod http://localhost:3000/categories` must return rows.
5. Phone on the SAME Wi-Fi; open `http://<LAN-IP>:3000/health` in the phone
   browser — must return JSON. If not: Windows Firewall inbound TCP 3000.
6. `npx expo start -c`, scan QR, test.

## 2026-09-14 incident

Merchant `.env` still pointed at `192.168.150.246` (old hotspot subnet) while the
laptop was on `192.168.8.7` → guest login SYN went nowhere → 10s AbortController
fired → raw Swift cancellation error shown. Fixed `.env` + mapped aborts in
`nexg-merchant-app/lib/api.ts` to a plain "Couldn't reach the server at …"
message naming the base URL.
