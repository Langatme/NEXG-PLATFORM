# Audit: Consumer (2026-09-16, read-only, audit-first)

Source: background audit of 41 routes + packages/shared/ui + tokens + nav + motion (BUILD_PLAN_MRH §6). Zero code changed.

## Slop pre-flight counts
- Distinct accent hues beyond brand pair: ~12 (status + badge rgba set + #E8E8E4 / #00000066 / #fff)
- Radii outside scale {10,14,20,24,999}: 11 distinct (3,4,6,8,12,16,18,22,28,30,40)
- Emoji-in-chrome: ~18 instances
- Brand-less gradients: 0 (no LinearGradient found)
- Duplicate labels for one intent: 4 clusters (Back / < Back / Go back; Continue x3; Retry / Try again; Save / Save changes / Save as default)

## Ranked findings
1. HIGH — `nexg-consumer/components/ui/*` duplicates `packages/shared/ui/*` (Button, Chip, Carousel, Camera, BottomSheet, Badge, AuthGate…). Fix: delete fork, re-export shared.
2. HIGH — `nexg-consumer/app/(app)/(auth)/(tabs)/account.tsx:45-55` dead routes (`/(modal)/…`, `/(tabs)/…`, no such groups). 5 dead clicks.
3. HIGH — No `Stack.Protected` anywhere; sign-in/onboarding/purchase mix push/replace, guest bypass. One-way doors unenforced.
4. HIGH — Auth screens hardcoded `backgroundColor:'#fff'` (sign-in.tsx:66, sign-up:45, 12x account/public). Breaks dark mode. Use `colors.background.primary`.
5. HIGH — `NexGBadge.tsx:27-32` hardcoded rgba hues + `NexGMedia.tsx:102-125` #E8E8E4/#FFFFFFF2/#00000066 + `NexGCamera.tsx:971-1183` 10 off-scale radii / fontSize 72.
6. HIGH — Missing skeletons: filter, location, map, schedule, order/index, checkout, all account/* have zero loading state.
7. MEDIUM — Inline errors unstyled: sign-in.tsx:53, sign-up.tsx:38 `{error?caption}` no tone/role; checkout promo/notes lack field errors.
8. MEDIUM — Emoji-in-chrome: notifications.tsx:47, inbox.tsx:75, map.tsx:26, activity/[id].tsx:388, experiencePreferences.ts:20-28 (10x). Use Ionicons.
9. MEDIUM — Motion §6 gaps: only confirmation.tsx:11,54,57 compliant; PillTabBar.tsx:71-72 useState press (JS thread, no 0.97/haptic); merchant/[id].tsx:63-67 worklet w/o reduced-motion guard.
10. MEDIUM — Data: activity/[id].tsx:64-92, search.tsx:44-55, checkout.tsx:120 useEffect+fetch / direct await. Migrate to useQuery/useMutation.
11. MEDIUM — Controlled TextInput jank: search + checkout promo/notes + help/detail onChangeText per keystroke, no debounce.
12. LOW — `NexGToast.tsx:408` + ThemeProvider broad context re-render surface. Scope-split.
13. HIGH — activity.tsx:118, order/index:66, confirmation:44 push `/(tabs)/home` (wrong group, loop). Replace `/(app)/(auth)/(tabs)/home`.
14. HIGH — qr.tsx:34-51 push merchant modal pre-auth (auth bypass door). Gate or replace.
15. MEDIUM — item/[id].tsx:54 `if(isLoading||!item||!experience)` conflates empty+error. Use NexGErrorState retry.

## Top 10 fixes (reuse shared, never duplicate)
1. Delete consumer/components/ui fork → re-export shared.
2. Add Stack.Protected + replace-only doors (sign-in, permissions, checkout→confirmation).
3. Tokenize all #fff/#e8e8e4/#000 → colors.*.
4. Wrap every backend screen in NexGSkeletonView + NexGEmptyState/NexGErrorState.
5. Badge/Media/Camera → radii.* + status.* tokens.
6. Replace emoji with Ionicons + NexGText.
7. Unify labels (Back / Continue / Retry) via NexGButton.
8. PillTabBar press → use-press-scale.ts + use-haptics.ts worklet 0.97.
9. useEffect-fetch → useQuery/useMutation + debounce search/promo inputs.
10. Fix 8 broken hrefs (/(tabs), /order, /item, /(modal)) to full groups.

## Already done this session
- Logo: `packages/shared/nexg-logo.svg` (light, user file) + `packages/shared/nexg-logo-dark.svg` (new, black→#F5F5F7, orange #F8A61E kept) + `NexGLogo` ink prop + `NexGSplash` theme switch. No code change needed.
- Rider phantom deps removed from `nexg-rider-app/package.json` (expo-maps + expo-location, zero imports; link-out via expo-linking). tsc clean.
- Design lock: `.21st/design.json` (brand, accent, grey, radii, Nunito, device gate: 4GB Android + iPhone 11/13, release 60fps).
- Checklist: own `docs/CHECKLIST_MAP.md` (pending second audit), never write back to .xlsx.
