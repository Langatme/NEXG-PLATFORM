# NEXG User Flows — frontend build guide (from the 22 planning docs)

Source: `nexg chatgpt chats` (all 22 read verbatim) + `EXPERIENCE_REGISTRY.json` (411 screens).
Rule: capabilities, not categories. One renderer per entity. Every flow ends in Activity.
No dead clicks: every clickable resolves to a complete experience (CNS contract).

## 0. Global rules (all apps, same stack: Expo 57 / RN 0.86 / Zustand+MMKV / React Query)

- Tabs are fixed: Consumer Home/Activity/Account · Merchant Orders/Catalog/Finance/Account ·
  Rider Jobs/Delivery/Earnings/Account · Host Portfolio/Stays/Services/Account. No extra tabs.
- Search lifecycle: Idle → Focused → Suggestions/Recent/Popular → Typing → Results →
  Category-context. **Close-when-no-context**: no active category ⇒ compact state.
- States on every backend screen: loading/skeleton/empty/error/offline/refreshing;
  transactions add idle/processing/success/failed. No blank screens, no generic errors.
- Primary CTA comes from capability: order→"Order now", book→"Book now",
  reserve→"Reserve", quote→"Get ride", request→"Request service", else "View".
- Media: remote URLs with thumb/small/medium/large variants, cached. Unique image per item
  per merchant. Static (logo/icons) may stay bundled; business images never do.

## 1. Consumer (`nexg-consumer/` in-platform, 110 screens CNS-001→110)

### F1 Discover (CNS-012→026)
Home context header (location/property/greeting/notifications) → universal search →
category rail (21 cats, dynamic from `GET /categories`) → Nearby rail → Collections
(`{id,title,query,filters,ranking}`) → entity cards → detail.
`GET /discovery/home?lat&lng&time&category&q` returns ordered sections (see §5).

### F2 Food order (CNS-027→063)
Explore → Merchant → Menu → Item sheet (variants/addonGroups/related, `GET /catalog/items/:id`)
→ Cart → shared `NEXGCheckout` → M-Pesa → Confirmation → Activity workspace
(status/ETA/rider/track/receipt). Never build FoodCheckout/ExperienceCheckout clones.

### F3 Booking — wellness/experience (CNS-064→074, 080→084)
Provider → Service → Date → Time → Participants → availability → payment →
confirmation → Activity. `POST /bookings {merchant_id, item_id, scheduled_for, guests}`.

### F4 Transport (capability `quote`)
Pickup → Destination → vehicle/quote → price → confirm → matching → live trip →
completion → Activity. Transport asks pickup/destination, never menu/cart.

### F5 Guest QR (CNS-075→084, PUB-001→011, no native Guest app)
Scan → property context → service → order/request/booking → track.
Plaque copy: `SCAN FOR WI-FI` → connected → "Need anything? NEXG Concierge".
Hooks in order: WiFi (entry) → convenience (`Need something?`) → discovery
(`It's 7:30 PM. Looking for dinner?`) → checkout bridge → post-stay re-entry.

### F6 Experience composer (Build/Plan/Coordinate/Personalize)
`Start → Eat → Do → Dessert → Go home`, e.g. Date Night 5:30→10:45PM KSh 8,500
with modifiers [Make cheaper/fancier/Change vibe]. Templates: Weekend/Birthday/
Night Out/Family Day/Surprise/Staycation. Entry point for killer UX, after F2/F3 work.

## 2. Merchant (`nexg-merchant-app`, 114 screens MRC-001→114)

Onboarding: business → docs → location → catalog → payments → verify → live (1 or 500
locations, same app). Workspace answers: needs attention? happening? next? performing?
Orders: receive → review → accept/reject (+reason) → prep → ready → handoff → refund;
contact customer/rider on one sheet. Catalog: category/product/variant/modifier/pricing/
availability/media/bulk/publish. Finance: transactions/fees/commissions/settlements/
payouts/invoices/eTIMS/reconciliation. NEXG is the operating layer above POS, not a POS.

## 3. Rider (`nexg-rider-app`, 36 screens RDR-001→036; Portal TBD per docs)

Onboarding: ID → docs → vehicle → approved → activated. Offline/Online → job queue →
offer → detail → accept → pickup nav → arrive → verify → picked → drop nav → arrive →
customer verify → proof (OTP/photo/signature) → confirmation. Issue/failed → support.
Earnings: per-delivery/bonus/deduction/balance/payouts. Minimal interface:
Assignment → Navigation → Pickup → Delivery → Proof → Completion.

## 4. Host (`nexg-host-app`, 66 screens HST-001→066)

Org → property → units → amenities → services → policies → availability → publish.
Reservations: search → hold → select → details → pay → confirm → upcoming → check-in
(verify) → stay → services (request → assign → execute) → housekeeping/maintenance
tasks → check-out → completed. Guests: profile/history/preferences/communication.
Finance: revenue/settlements/payouts/invoices. Host is environmental coordinator,
not another merchant.

## 5. Adaptive engine — lightweight, feels smart (composer)

`nexg-backend/src/composer.ts` + `lib/composer.ts` mirror in each app (same weights).
Server `GET /discovery/home` wins online (60s cache); client mirror wins stale/offline.

Weights: active order 100 · upcoming 95 · urgent 90 · relevant search 85 ·
nearby-open 70 · personal rec 65 · popular 50 · promo 40 · general discovery 30.

Layers: L1 shell always (location/search/categories) → L2 context (active/upcoming) →
L3 personal (recommended/continue/favorites) → L4 commerce (offers/collections).
Time-aware: morning breakfast/coffee/transport · evening dinner/events · weekend
experiences. New users get universal+contextual; returning add personal. No new
screen per category: future `Automotive` (wash/repair/tyres/parts/roadside) arrives
via registry config + capabilities + workflow config only.

## 6. Frontend build order

1. Wire `lib/api.ts` to `EXPO_PUBLIC_API_URL` (done in shells) + React Query hooks.
2. Home sections render from `GET /discovery/home` with skeleton/empty/error/offline.
3. Item sheet reads `GET /catalog/items/:id` (variants/addons/related) — zero empty pages.
4. Checkout → `POST /orders|/bookings` with `idempotency_key` → Activity polling.
5. Click-through QA matrix (Backend Prompt §42): Home→category→item, Home→restaurant→
   menu→item→addons, Explore→category→merchant→item, Search→suggestion→merchant→item,
   Popular→result, Recent→result. Every path lands; visual language unchanged.
