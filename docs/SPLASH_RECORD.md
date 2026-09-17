# Splash Record — PASS (2026-09-14): NEXG logo splash on 4 apps

Scope: consumer, merchant, rider, host only (per owner: NOT admin/ops).
Bar: backend untouched + `tsc` clean in backend + 4 touched apps.

## What shipped

Shared source of truth (`packages/shared/ui/`):
- `NexGLogo.tsx` — adaptive vector mark from the owner-supplied NEXG SVG.
  Ink (N/E letterforms + dark fills) is a prop: `#131316` light / `#F5F5F7` dark.
  Accent stays `#F8A61E` in both modes. Rendered via `react-native-svg` `SvgXml`
  (already a dep in all 4 apps — no new deps added).
- `NexGSplash.tsx` — full-screen centered logo, bg `#FFFFFF` light / `#0D0D10` dark
  (matches `lightPalette.background` / `darkPalette.background.primary` family).
  Enter animation: opacity 0→1 + scale 0.96→1, 250ms,
  `Easing.bezier(0.23,1,0.32,1)` on the UI thread (Reanimated), with
  `useReducedMotion` + `AccessibilityInfo.isReduceMotionEnabled` bypass.
- `ui/index.ts` — exports added.

Sync discipline (per repo rule):
- `node scripts/sync-shared.js` → merchant/rider/host `components/ui/` (AUTO-SYNCED).
- Consumer owns its originals → hand-copied `NexGLogo.tsx` + `NexGSplash.tsx`,
  exports added to `nexg-consumer/components/ui/index.ts` by hand.
- Original Illustrator SVG saved verbatim as `assets/images/nexg-logo.svg` in all
  4 apps + `packages/shared/nexg-logo.svg` (resolves M10 "text logo, no binary
  assets were recoverable").

Native shell (`app.json`, 4 apps):
- Added `splash.backgroundColor #FFFFFF` + `dark.backgroundColor #0D0D10`,
  `resizeMode contain`. No `image` yet on purpose: Expo native splash needs a
  PNG; the JS splash carries the logo today so there is zero native-build risk.
  Follow-up for store builds: export `nexg-logo.svg` → 512×512 PNG
  (`assets/images/splash-icon.png`) then set `splash.image` + per-app
  `icon`/`adaptiveIcon`/`favicon` in the same change.

App entry (`app/_layout.tsx`, 4 apps):
- `if (!loaded) return <NexGSplash />` (was `return null`) — the brand moment
  covers font load + session restore; existing
  `SplashScreen.preventAutoHideAsync/hideAsync` flow unchanged, so the native
  solid → JS logo handoff is seamless in light and dark.

## Verification (2026-09-14)

- `npx tsc --noEmit -p tsconfig.json` clean: consumer, merchant, rider, host.
- `npx tsc --noEmit` clean: `nexg-backend` (untouched).
- Visual check owed on device (Expo Go, light + dark): logo centered, no
  blank/flash, reduced-motion path. No verify-script change (no API/NCL).

## Deferred with note

- Native PNG splash image + app icons (needs designer export, prebuild + EAS check).
- Admin/Ops splash (owner scoped OUT; same two files drop in when wanted).
- Wordmark/tagline lockup under the mark (needs brand-bible confirmation).

## Fix (2026-09-14): Worklets mismatch on `expo start`

Symptom: merchant failed to boot — `[Worklets] Mismatch (0.10.4 vs. 0.10.1)` at
`GestureHandlerRootView` import, cascading to `Route "./_layout.tsx" is missing
the required default export` + `Cannot read property 'ErrorBoundary'`.
Root cause (pre-existing drift, NOT the splash): no `babel.config.js` in any app
+ Expo deps behind the installed SDK (`expo install --check` listed 8 stale
packages) + stale Metro cache holding transforms stamped by the old plugin.
The splash only made it visible at startup (first Reanimated import in `_layout`).
Fix: added `babel.config.js` (`babel-preset-expo`) to all 4 apps,
`npx expo install --fix` in all 4 (now `Dependencies are up to date`, expo
57.0.22), babel transform of `_layout` + `NexGSplash` OK, full
`npx expo export --platform android` clean (2349 modules).
Action on device: restart with `npx expo start -c` (clears the stale cache).
Separate pre-existing warning: MMKV falls back to memory storage in Expo Go
(NitroModules needs a dev build) — sessions won't persist in Expo Go.
