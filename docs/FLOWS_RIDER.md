# Rider App — User Flows (RDR-001→036; Portal TBD per docs) — M2 LIVE (OTP proof; photo/sig M4)

Persona: courier fulfilling deliveries with minimal interface.
Tabs: Jobs · Active · Earnings · Account. Endpoint tags: LIVE / PLANNED.
Golden path: Assignment → Navigation → Pickup → Delivery → Proof → Completion.

## F1 Onboarding (RDR-001→007) — LIVE (self-register kind=rider; docs/vehicle in M4)
Entry → sign in/up → verification → document submission → vehicle setup → status
(pending/approved/rejected+what-to-fix). API: `POST /auth/register {kind: rider}` LIVE
(no merchant anchor). NCL: `rider.onboarded`.

## F2 Workspace + Availability (RDR-008→010) — LIVE
Online/offline toggle (large 48dp target, instant visual + server confirm; on conflict
server wins with toast) · earnings-today · active delivery card · job queue count.
API: `GET /rider/jobs` LIVE, 15s poll = realtime contract.
Offline: last-known state + stale banner. Haptic Light on toggle commit.

## F3 Job lifecycle (RDR-011→018) — LIVE
Queue → offer sheet (merchant, items count, pickup distance, payout estimate;
spring sheet, flick-to-dismiss with velocity rule) → detail → Accept | Decline →
pickup navigation (`expo-maps` + `expo-location`, `navigate` capability) → arrival →
pickup verification → confirmation.
API: `delivery_tasks` + `PATCH` accept/decline/picked LIVE, NCL
`delivery.offered|rider.accepted|rider.picked`. No job = honest empty state, not spinner.

## F4 Active delivery + Proof (RDR-019→026) — LIVE (OTP; photo PUT presigned, UI M4)
Drop-off nav → arrival → customer verify → proof (OTP live; photo via
`POST /uploads/presign` LIVE, attach UI M4; signature M4) → confirmation →
(rating internal) → Issue | Failed delivery + reason → support handoff.
NCL: `rider.delivered|delivery.failed`, `proof.captured` (+ evidence row later).
Motion: tracking states crossfade; map marker moves on UI thread (shared value,
never setState-per-frame).

## F5 Earnings + Account (RDR-028→036) — LIVE readonly
Per-delivery/bonus/deduction rows → balance (derived, read-only) → payouts →
statements → vehicle/docs/notifications/settings/help. No mutable wallet — ledger
projections only. API: `GET /rider/earnings` LIVE.

## Edge cases
Offer expires mid-read (sheet collapses + toast) · GPS denied (manual address +
permission explainer) · proof upload offline (queue, retry, never lose) · double-accept
(409 idempotent replay) · failed delivery flow always reachable in ≤2 taps.
