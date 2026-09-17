# Host App — User Flows (HST-001→066) - M3 LIVE (property CRUD, guest graph, rosters in M4)

Persona: host/property manager, environmental coordinator (not another merchant).
Tabs: Portfolio · Reservations · Stays · Account. Endpoint tags: LIVE / PLANNED.

## F1 Setup (HST-001→015) - LIVE (H-05)
Entry → sign in → org setup → Workspace → property create/edit → media → amenities →
policies → units create/edit. API: reads LIVE (`GET /merchants[/:id]`, `GET /media`);
writes LIVE since H-05 (`PATCH /merchants/:id` allowlist incl. media keys/amenities/policies,
`GET|POST|PATCH|DELETE /units` on own `units` table + `unit_id` stay link).
NCL: `property.published`, `unit.added/updated/deleted`.

## F2 Reservations + Calendar (HST-016→023) - LIVE (H-12: month view + dots + rates in app)
Calendar month view (availability dots) → day sheet → reservation detail → create →
modify → cancel (+reason). Filters: upcoming/past/cancelled.
API: LIVE `GET /bookings?merchant=&from=&to` (+`status`, pagination, calendar ordering fix),
`PATCH /bookings/:id` (modify/cancel + double-book guard). Rates = unit nightly
`price_kes` via `PATCH /units/:id` (H-05). NCL: `booking.confirmed|modified|
cancelled|no_show`. Reuse consumer booking shapes — same entity, host perspective.

## F3 Guests (HST-024→027) - LIVE (H-06)
Guest list → detail (stays, preferences, spend) → history → communication thread.
Profiles derive from stays (dynamic recording per docs — merchant never creates CRM
records by hand). API: LIVE guest view over bookings + interactions (`GET /bookings`
filtered client-side by `account_id`; comms = per-consumer contact thread
`merchant:{mid}:{account}` via shared messaging, verified host→guest round-trip).

## F4 Stay lifecycle (HST-028→031) - LIVE
Arrivals → check-in (+verification) → stay overview (services, requests, balance) →
check-out → receipt. API: **PLANNED** booking status transitions
`CONFIRMED→CHECKED_IN→COMPLETED`. NCL: `stay.checked_in|checked_out`.

## F5 Services + Housekeeping + Maintenance (HST-032→045) - LIVE (H-07: roster + assignee picker live)
Service catalog (reuse merchant services where same business) → request → detail →
assign → execute → complete. Housekeeping board (Unassigned→Assigned→In progress→
Inspection→Done); maintenance (Reported→Triaged→Assigned→Resolved→Verified, escalate
to contractor). Roster = shared `GET /staff?merchant=` (host roles reuse M-14 endpoint);
assign passes staff label as `assignee`. Guest QR requests land here in realtime (poll first, §BUILD_PLAN_MRH M4)
tagged `origin:'qr'` (H-11: passthrough + `?origin=` filter + QR chip/badge on the board).

## F6 Org + Finance + Analytics (HST-046→066)
Members/teams/roles/permissions (needs A1 scopes) · transactions/revenue/settlements/
payouts/invoices readonly · property/revenue/occupancy analytics (M4 charts) ·
settings/integrations/notifications/support/audit (NCL read).

## Edge cases
Overbooking attempt (guard + suggest alternatives) · no-show flow (charge policy
explainer) · maintenance emergency (bypass queue, page staff) · offline check-in
(queue with conflict resolution on sync) · multi-property switcher preserves filters.
