# Spec: NEXG Deslopify to Market-Ready (Consumer first, then MRH)

## Objective
Turn the current NEXG platform (8 surfaces in `Desktop/nexg-platform/`) from "full of slop" into market-ready, without forking the platform. User-selected scope: **Consumer first (43 routes, source of truth), then Merchant/Rider/Host parity**. Admin/Ops remain readonly v1 (out of scope for UI rebuild).

Who: Guests (consumer), Merchant owners/staff, Riders, Hosts. Success = zero dead clicks, honest offline states, native-feeling motion, one accent / one grey / shape lock, full state cycles (loading/empty/error), tsc clean, gauntlets green, docs updated.

Why now: Excel workbook (`DEVELOPMENT BUILD CHECKLIST/NEXG  DEVELOPMENT CHECKLIST.xlsx`, 19 sheets, 647 Build Tracker rows) was partially followed (all Design/Backend/Frontend flags read 0 in audit 2026-09-16) while `docs/EXPERIENCE_REGISTRY.json` (411 entries) + M0-M11 gauntlets are the real shipped scope. Reusable vendor library (16 trees) was vendored but never triaged for Expo-vs-web compatibility. Result: duplicate primitives, placeholder copy, inconsistent tokens/motion/navigation.

## ASSUMPTIONS I'M MAKING
1. Expo SDK ~57, Expo Router, RN 0.86, React 19 — Consumer `package.json` is canonical; MRH apps stay on same SDK (no SDK bump in this spec).
2. `packages/shared/` (40 NexG* primitives + theme/tokens + composer + messaging) is the single design-system source of truth; `node scripts/sync-shared.js` is the sync rule (HANDOFF 2026-09-12).
3. Expo MCP IS connected (user statement) — use it for Expo-verified patterns; Appllama MCP is PAID — use `vendor/appllama-skills/` file-first (SKILL.md + references), no live `appllama_*` calls unless user funds credits.
4. `pick-ui-library` (computer skill `C:\Users\lenovo\.agents\skills\pick-ui-library`) is the always-on picker: web-only picks (base-ui, cmdk, Sonner, motion, recharts, Virtuoso, dnd-kit) DO NOT ship into Expo apps; Expo equivalents apply (see Boundaries).
5. No new backend services; monolith grows (PRODUCT_DECISIONS #2). Every mutation already emits NCL; no new ledger work unless a deslopified screen exposes an uncovered mutation.
6. Staging hardware + EAS builds + Sentry DSN + S3/CDN cutover remain deferred (HANDOFF §6-7) unless market-ready gate explicitly demands them.

Correct me now or I proceed with these.

## Tech Stack
- Apps: Expo ~57.0.22, expo-router ~57.0.21, Reanimated 4.5.1 + worklets, Gesture Handler 2.32, expo-image, FlashList (@shopify/flash-list where lists grow), TanStack Query 5.90.5, Zustand 5, MMKV 4, Sentry 7.11.
- Backend: Node+Express+TS, Postgres 16 + pgvector (HNSW), MinIO (CDN_URL cutover deferred), SSE + inbox (poll 15s first, no WS).
- Tooling: `expo lint` + `oxlint` (`lint:slop`), `tsc`, `docker compose up -d` (pg :5433, adminer :8080, minio :9000/:9001), verify scripts `scripts/{m0,m1,m2,m3,m4,events,cb,msg,consumer-qa,perf}.js`.
- Skills (always loaded in this order per request): `pick-ui-library` picker → Expo framework skills (`expo-router`, `expo-animation`, `expo-native-ui`, `expo-design-system`, `expo-data-fetching`) → `appllama-app-design-skill` (anti-slop + nav + motion laws) + `appllama-usage` file-first → `animate-expo` + `apple-design` + `emil-design-eng` (Before|After|Why table) → `better-interface` (a11y→layout→writing→typography→colors→ui) → `21st-ui-review` (`21st review <path>`) → `product-taste` gate.

## Commands
```
Boot DB:   docker compose up -d
Seed:      node --import tsx scripts/seed-consumer-catalog.ts
API (dev): node --import tsx nexg-backend/src/index.ts   (single-call: Start-Process + health-gate + test + stop; assert :3000 free first)
API (stg): npm run build && node dist  (in nexg-backend)
App:       npx expo start / npx expo start --web  (per app dir)
Verify:    node scripts/{m0,m1,m2,m3,m4,events,cb,msg,consumer-qa}.js  +  lean perf probe (full perf.js hangs on Win SSE teardown)
Typecheck: npx tsc --noEmit  (backend + each touched app)
Lint:      npx expo lint  +  npx oxlint  (never weaken rules to pass)
Skills:    npx skills find <query>  (only if a gap has no local skill; prefer local vendor/.agents first)
21st:      21st review <changed-paths> [--fix only for deterministic low-ambiguity]
```

## Project Structure
```
nexg-consumer/app/        → Consumer source of truth (43 routes: (app)/(public) auth+QR+splash, (app)/(auth) home/search/checkout/activity/inbox/account)
nexg-merchant-app/app/    → 14 routes (tabs: catalog/orders/finance + workspace/analytics/customers/promos)
nexg-rider-app/app/       → 14 routes (tabs: jobs/delivery/earnings + onboarding/help)
nexg-host-app/app/        → 12 routes (tabs: portfolio/reservations/tasks + analytics/booking/guest)
packages/shared/          → theme/tokens/typography/ThemeProvider, ui/NexG* (40), hooks, domain, composer.ts, messaging.ts, events.ts
scripts/sync-shared.js    → sync shared → MRH (consumer owns originals, hand-copy to consumer/admin/ops)
vendor/                   → TRIAGED reusable quarry (see § Compatibility): appllama-skills, expo-skills, ahmedbna-ui*, kibo, legend-list, etc.
docs/                     → HANDOFF, BUILD_PLAN_MRH, PRODUCT_DECISIONS, FLOWS_*, API_DATA_MAP, EVENTS, M*_RECORD, EXPERIENCE_REGISTRY.json
DEVELOPMENT BUILD CHECKLIST/*.xlsx → authoritative product workbook (19 sheets); Build Tracker 647 rows reconciled to registry (this spec)
research/<category>/      → Appllama file-first notes (apps.md, <app>/screens.md, img/, patterns.md) — links expire ~1h, notes persist
```

## Code Style
One accent, one grey family, shape lock (`actions=pill, cards=16, inputs=8` — confirm in audit), base unit 4/8 + flex `gap`, `borderCurve:'continuous'`, `boxShadow` (not shadow*/elevation), tabular-nums for counts/prices, `contentInsetAdjustmentBehavior="automatic"`, `useWindowDimensions` (never `Dimensions.get()`).

```tsx
// Good: token-first, press-in feedback, native control, full states
import { NexGButton, NexGStates, NexGPrice } from '@nexg/shared/ui';
import { useTokens } from '@nexg/shared/theme';
export function OfferCTA({ price, onAccept }: { price: number; onAccept: () => void }) {
  const t = useTokens();
  return <NexGButton accent={t.accent} haptic="light" pressScale={0.97} onPress={onAccept} label={`Accept · `} right={<NexGPrice value={price} tabular />} />;
}
// Bad: new hue, web-only lib in Expo, setState-per-frame, scale(0), ease-in entrance
```

Motion (BUILD_PLAN §6 + animate-expo + Appllama): UI thread only (worklets; never setState-per-frame, never runOnJS-per-frame → `scheduleOnRN` at gesture end only), transform+opacity only, <300ms, enter/exit `Easing.bezier(0.23,1,0.32,1)`, springs only finger-driven (`{duration:400,dampingRatio:0.8}` + velocity handoff + rubber-band), press-in scale 0.97 + one haptic per commit, no tab-slide (`animation:'none'`), native stack + `formSheet`, `ReduceMotion.System`, release-build 60fps on slowest device, `CADisableMinimumFrameDurationOnPhone` confirmed.

Navigation (Appllama laws): push=deeper (return wanted), replace=move-on (one-way doors: sign-in/onboarding/purchase → `Stack.Protected` + replace; back never re-enters), modal=self-contained task + Cancel/Done, formSheet=short interruption (detents, drag-dismiss), fullScreenModal=immersive + Close, transparentModal=overlay, action-sheet=destructive, context-menu=item actions, system controller=share/web/photo. Tabs are peers (own stacks, retap pops to root, full-attention screens above tabs). Deep links land with real stack; splash held until session resolves (no Login flash).

## Testing Strategy
Framework: existing `scripts/*-verify.js` + `consumer-qa.js` (333) + `tsc` + `expo lint/oxlint` + `21st review` + simulator full-motion pass (record `flow.mov`, watch full-speed + frame-by-frame).
Where: `scripts/` (new `deslop-*.js` per slice, named counts, NCL assertions, 403/422/409 guards, replay/idempotency), per-app `app/` feel-checks, `docs/M*_RECORD.md` repair log.
Coverage: every touched screen — opens, every mutation transitions, offline fallback renders (stale-data, never blank; no silent mock writes), zero dead clicks, skeletons match final shape, empty/error/inline-specific states, long-content/XL-type/dark/Dynamic-Island/home-indicator/landscape, tap ≥44pt, contrast both themes, Reduce-Motion cross-fade.
Levels: slice = script green + backend tsc + touched-app tsc + docs updated (HANDOFF status rule). Market-ready gate = all slices green + perf within 2x baseline + `21st review` deterministic defects 0.

## Boundaries
- Always: evidence before synthesis (file:line); extend `NexG*`/tokens, never duplicate; API-first + mock fallback (stale-data state, never blank); scope checks before data; single-call verify cycles (port 3000 free, no stale-server greens); one fix per failure + record in M-record; docs are part of done; `pick-ui-library` consulted on every dependency decision; slop pre-flight counts (accents=1, radii∈scale, chrome-emoji=0, brand-less gradients=0, duplicate labels=0).
- Ask first: DB migration (next free `014_*`, fold into init.sql); adding a dependency (esp. native deps like expo-maps/location phantom — install-and-wire or remove listing, no MapLibre); changing CI/compose; copying a competitor skeleton 1:1 (pattern-not-pixels rule); generating image assets (one style family, @3x, no halos); EAS/simulator paid steps.
- Never: commit secrets (`ADMIN_BOOTSTRAP_KEY`, `JWT_SECRET`, S3 creds); ship web-only libs into Expo (base-ui/cmdk/Sonner-dom/motion-dom/recharts/Virtuoso-web/dnd-kit → use RN equivalents: native controls, `expo-haptics`, FlashList/`legend-list`, Reanimated, dependency-free bars as in M-16/H-10); purple-glow CTA / glass-everywhere / mesh-hero / confetti-minor / sparkle-headings; emoji-as-chrome; serif-in-sans emphasis; scale(0) entrances; ease-in entrances; height/Blur/elevation-per-frame; tab slides; back-traps (funnels/ratings); stacked modals; `replace('/(tabs)')` from feature paywalls; claim MCP/component/token exists without inspecting; rewrite history or delete M-records; trust Test-Path/dir codes on reparse points (cmd /c dir first — M9 rule).

## Success Criteria (testable)
1. Consumer deslopified: 43 routes audited, deterministic `21st review` defects 0, slop pre-flight passes per flow, full-motion `flow.mov` per core flow (auth→home→search→item→checkout→activity→inbox) scrubbed 0 glitches, 60fps release on slowest device, tsc+lint clean, `consumer-qa 333/333` + `msg 9/9` still green.
2. Shared system locked: `.21st/design.json` decisions recorded (accent, grey, radii, type ramp, motion tokens); duplicate primitives removed (vendor triage table: adopt/adapt/reject per lib with Expo-compat reason); `sync-shared.js` verified to MRH.
3. MRH rolled out: Merchant 14 → v1 scope (MRC live IDs), Rider 14 (RDR + R-01 scope-trap fix first — security), Host 12 (HST) — each: zero dead clicks, fallback renders airplane-mode, NCL 100% mutations, slice verify script green + both tsc clean.
4. Checklist reconciled: Excel 647 (ADM 110/VEN 111/RID 98/HST 88/GST 136/QR 104) mapped to registry 411 (MRC/RDR/HST/CNS/OPS/ADM/PUB) — one `docs/CHECKLIST_MAP.md` (live / deferred-with-note + criteria to return / out), Design Checklist CHK-* flipped Planned→Verified per slice, no new screen without registry entry + API row.
5. Market-ready gate: staging checklist (HANDOFF §7) executable; go/no-go = all suites green on staging + perf within 2x `PERF_BASELINE.md` + docs current. Temporary audit files removed (`checklist_*.py`, `vendor_peek.py`, `global_skills.py`, `picker_find.py`, `checklist_peek.txt`).

## Open Questions
1. Accent/grey/radii/typeface lock — keep current consumer tokens or re-pick from Appllama study? (I recommend audit-first, then one proposal.)
2. `expo-maps/location` phantom dep — link-out upgrade or remove listing in R-02/R-03 prep?
3. Bare `splash held until session` + `Stack.Protected` one-way doors — confirm wall-app list (consumer guest mode vs auth wall)?
4. Simulator loop hardware — which slowest device + iOS/Android pair do we certify motion on?
5. Excel as living doc — do I write back Verified flags into the .xlsx, or is `CHECKLIST_MAP.md` + registry the system of record going forward?

## Phase 0 note (no capability map)
Single capability (deslopify-to-market-ready) with ordered slices (Consumer → shared lock → MRH → checklist map → gate). No separate module specs needed; slices below are the task source after approval.
