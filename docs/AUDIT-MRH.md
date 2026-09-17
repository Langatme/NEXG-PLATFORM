# Audit: MRH parity (2026-09-16, read-only except phantom-listing removal)

## Routes (all real imports, no "Coming soon")
- Merchant 14: (tabs)/orders 214 + order/[id] full | catalog 488 full CRUD | workspace 191 | promos 140 | finance 117 RO | customers 94 | analytics 106 counts-only | account 128 | sign-in 81. LIVE per FLOWS_MERCHANT F1–F6.
- Rider 14: (tabs)/jobs 281 + delivery/[id] full (OTP + link-out) | onboarding 274 (backend profile) | earnings 131 RO | account 112 | notifications 55 thin | settings 42 thin | help 48 static | (tabs)/delivery 28 redirect-by-design. RDR-015/020 nav = link-out only; RDR-023 photo/sig UI M4.
- Host 12: (tabs)/reservations 343 + booking/[id] | portfolio 272 (H-05) | tasks 221 (H-07/H-11) | guest/[id] (H-06) | account 186 | analytics 103 counts-only. HST-028–031 check-in/out PLANNED (no CONFIRMED→CHECKED_IN transition in app).

## Gap table
| App | Live registry IDs | Missing / thin |
| Merchant (114) | MRC-017–048 orders+catalog, 057–082 customers/finance/promos, 011 workspace | MRC-001–010 folded in sign-in ladder; 012–016 folded in 1 workspace file; 049–056 services inside catalog.tsx; 083–093 charts deferred; 094–114 teams/perms deferred |
| Rider (36) | RDR-001–014 onboarding+jobs, 019–026 OTP flow, 028/031–036 | RDR-015/020 turn-by-turn absent (link-out); RDR-023 photo/sig M4; RDR-029–030 payouts detail deferred; RDR-027 support = tagged thread |
| Host (66) | HST-001–027 setup+reservations+guests, 032–045 tasks/roster/QR | HST-028–031 stay transitions PLANNED; HST-046–066 finance/org/analytics thin in account |

## R-01 scope-trap: FIXED
- `domain.ts:747–763` GET /orders rider → assigned-only subquery (param-omitted scoped, not ALL)
- `domain.ts:789–805` detail requires assigned-or-OFFERED else 403 not_your_order
- `deliveries.ts:29–41` assertRider 403 rider_only/not_your_task; `:122–143` /rider/jobs OFFERED+own; `:211–230` earnings/profile own-only
- Rider app calls getJobs/getRiderProfile only. Nuance: GET /deliveries/:id passes unassigned (NULL claimant) — intentional OFFERED-pool readability.

## Phantom dep: listing-without-dependency (fixed this session)
- package.json: zero expo-maps/expo-location/MapLibre deps (rider package.json cleaned); zero source imports (only Linking.openURL google-maps link-out rider jobs.tsx:248, delivery/[id].tsx:169,183).
- `nexg-rider-app/app.json:21,27` listed expo-location + expo-maps plugins — REMOVED this session (no MapLibre per HANDOFF; link-out via expo-linking is the contract). package-lock.json + node_modules copies linger — prune on next `npx expo install --check` / fresh install.
- Install-and-wire only if turn-by-turn un-deferred (Wk5+, PRODUCT_DECISIONS/HANDOFF:53).

## Shared sync violation
`packages/shared/ui` 40 files vs each app `components/ui` identical 40 names = full clone. Violates "extend never clone" (FLOWS_MERCHANT F4, PRODUCT_DECISIONS D1). Fix: thin re-export wrappers (deslopify slice).

## Offline
No blank, no silent mock writes (lib grep mock/TODO empty). Merchant/host: NexGErrorState onRetry + staleTime 15s + skeletons/empty states. Rider: jobs offline empty state (jobs.tsx:174), proof queue-retry never-lose (delivery/[id].tsx:88–90), settings queued count, onboarding local-copy guard.

## Top 8 parity fixes (RICE order, R-01 first)
1. R-01 regression tests (assigned-own / unassigned-403 / omitted-scoped)
2. Catalog reads free (380) verify in apps
3. Merchant orders loop harden (170)
4. Rider job + OTP proof finish, photo M4 (120)
5. Host reservations/stay transitions (120)
6. Earnings/payouts readonly (80)
7. Catalog CRUD polish (70)
8. Remove app.json phantom listing + prune lockfile (done: app.json + package.json; lockfile prune pending fresh install)
