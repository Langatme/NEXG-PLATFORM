# M12 — Deslopify to market-ready (2026-09-16, goal round 1)

Scope: consumer-first deslopify + shared lock + MRH parity + checklist map + live re-verification.
Skills: picker (`docs/SKILL-PICKER.md`, 252 indexed) always first; `pick-ui-library` (zero new deps);
Expo `router/animation/native-ui/design-system/data-fetching`; Appllama file-first (MCP paid);
`animate-expo` + `apple-design` + `emil-design-eng`; `better-interface`; `product-taste`.

## Code changes
- Consumer (48 files): `#fff` → theme tokens; 9 dead hrefs → real groups; QR pre-auth → sign-in;
  skeletons + Empty/Error states; useEffect-fetch → useQuery/useMutation; debounce hook (new);
  PillTabBar worklet 0.97 + haptics; reduced-motion guards; Stack.Protected doors; emoji → Ionicons.
- Shared (3 files): Badge/Media/Camera tokenized; badge accent text → status.success green
  (light 4.08:1, was 2.91:1 fail). Synced to MRH + hand-copied to consumer.
- Rider: removed `expo-maps`/`expo-location` from package.json + app.json plugins;
  pruned package-lock + node_modules copies. Link-out via RN Linking is the contract.
- New: `packages/shared/nexg-logo-dark.svg`, `.21st/design.json`, `docs/{SPEC-DESLOPIFY,
  AUDIT-CONSUMER, AUDIT-MRH, CHECKLIST_MAP, SKILL-PICKER}.md`,
  `docs/CHECKLIST_TICK_DRAFT.csv`, `scripts/deslop-r01.js` (R01_PLAN_PASS 4/4).

## Verification (this round, live stack: postgres healthy, minio healthy, fresh seed
23 cats / 643 merchants / 20219 items)
- tsc clean: consumer, merchant, rider (x2, incl. post-prune), host, backend.
- M0 20/20 · M1 14/14 · M2 17/17 · M3 16/16 · M4 10/10 · MSG 9/9 · EVENTS 12/12 ·
  CB 27/27 · consumer-qa 1453/0 — 0 failed everywhere.
- R-01 scope-trap: code-verified fixed (assignment-scoped reads + 403s); live probes
  remain inside m2-verify R-01 block (green).

## Round 2–3 (goal rounds)
- oxlint gate: NOT clean — pre-existing anti-slop errors in all apps (safety-comments,
  runtime-typeof, widening, unsafe-dictionary) plus one ours (PREF_ICONS widening).
  Two fix agents dispatched (shared-source + app-local), genuine-fix-only, verify tsc+oxlint.
- Live add-ons: H5 9/9 · rider-onboarding 9/9 (0 failed). perf-check snapshot: login
  p50 303/p99 633, register p50 304/p99 613 (historical laptop baseline).

## Round 4 — lint board measured
- Totals (errors+warnings lines): consumer 116 · rider 95 · backend 26 (0 errors in
  src/**, warnings only in scripts/db-seed). App-local errors: consumer ~40 ·
  merchant ~28 · rider ~36 · host ~24 · backend 0. Remainder sits in shared-source
  files (other agent). Both agents steered to report + keep fixing; app-local agent
  fixing consumer-first with named boundary parsers for `no-runtime-typeof`.
- Merchant baseline: 89 lines total, ~40 in shared scope. Shared agent 0/9 fixed,
  studying rule semantics (`no-runtime-typeof` trigger patterns) before editing.

## Rounds 5–6 — merchant + backend lint (mine)
- Merchant app-local 25 errors → 0: JSON boundary contracts in lib/api.ts (JsonValue/
  JsonObject + toString-tag decoders, Headers API replaces `?? {}` spread), DTO owner
  contracts (AddonGroup/ServiceRequest), assertion deletions (createVariant/getRequests/
  attention), interface map + inference for ACTIONS/counts, SAFETY docs where the
  invariant is checked. tsc clean. Remaining 24 lines all shared-scope (other agent).
- Rule semantics verified against vendored sources: union/interface aliases are safe
  targets; `?? {}` is not the conditional-spread trigger (ternary only); catch params
  keep `unknown`; `cause`-named params exempt; explicit-only unknown returns.
- Storage-assertion lesson: zustand StateStorage.getItem is async-typed, so the
  deletions broke tsc — restored as SAFETY-commented assertions (sync backends wired).
- Backend 26 → 16 warnings, 0 errors, tsc clean: dead bindings removed (consumer/me/
  closed/merchantById), `new Array(n)` → `Array.from({length})`, startsWith.
  GET-body warnings accepted (helper sends `undefined` on GET — spec-fine, suites green).
- Consumer PREF_ICONS → PreferenceIconMap interface (satisfies would break string-index
  tsc); promotion of Ionicons chips to shared queued with shared agent.
- Re-proved live after edits: M0 20/20 · EVENTS 12/12 · rider-onboarding 9/9.

## Round 6 — second lint gate measured
- `npx expo lint` (consumer): 34 problems (31 errors, 3 warnings), concentrated in
  shared-synced UI (Camera/BottomSheet/Confirm/Toast/TransactionSheets) under
  react-hooks/immutability, purity, set-state-in-effect, exhaustive-deps, refs —
  mostly Reanimated-idiom friction, pre-existing, never gated. Queued with the shared
  agent (config-vs-refactor evaluated per file, documented). Not started mid-round to
  avoid colliding with the two running agents.

## Known remainders (need user hardware / owners)
1. Simulator feel-check on 4GB Android + iPhone 11/13 (`flow.mov`, full-speed + frame scrub, 60fps release).
2. Staging perf re-baseline + EAS builds + Sentry DSN (HANDOFF §6–7, pre-existing deferrals).
3. Row-tick human pass over `CHECKLIST_TICK_DRAFT.csv` (auto bands: 14 match / 210 review / 423 unmapped).
4. Token-level accent-badge note recorded in `.21st/design.json`; Camera timer 72→display needs eyeball check.
