# NEXG CRM pre-push gate

Runs from here (`tools/lint`). Never pushed to Google — both clasp projects
use `rootDir` on `../host` and `../merchant`, so `tools/` is invisible to them.

## Commands

- `npm run lint` — oxlint (+ vendored anti-slop plugin) over server `.js`
- `npm run check` — compile-checks inline `<script>` blocks in all `.html`
  templates (oxlint cannot see those; this is where panel bugs live)
- `node --check <file>` — ad-hoc syntax check of a single server file

Gate is green when: **zero oxlint errors** AND `check` reports 0 failures.
Warnings are triaged, not auto-fixed (see below).

## Deliberate policy deviations (documented, not laundering)

1. `anti-slop/no-runtime-typeof` is `warn`, not `error`.
   The rule assumes a TypeScript codebase where `typeof` narrows without a
   contract. This repo is ES5 Google Apps Script with no static types — a
   `typeof x === 'string'` guard at a repository/validation boundary IS the
   contract check. Enforcing it as error would demand mechanical rewrites of
   ~40 pre-existing guards for zero behavior gain.
2. `no-unused-vars` warnings on top-level `function` declarations are
   expected false positives: Apps Script invokes entry points by name
   (`onOpen`, `doGet`, trigger handlers like `NEXG_processEmailQueue`,
   editor-run functions, `google.script.run` targets). Never delete an entry
   point to satisfy the linter. Genuinely dead locals (e.g. unused `now`)
   should be removed.
3. Pre-existing merchant findings are reported, not fixed: merchant is frozen
   while host is being perfected. Host findings introduced by new work must
   be fixed before push.

## Known pre-existing findings (both projects)

- `00_Project.js`: debug scaffolding (`NEXG_readSavedSource`,
  `NEXG_whichProject`, `NEXG_verifyRouter`, `NEXG_health`) — confirm purpose,
  then delete.
- Host stubs pending S2–S7: `20_SearchEngine`, `21_SmartPanelService`,
  `23_Automations`, `24_Notifications`, `30_DashboardService`,
  `31_ReportsService`, `32_EmailCenter` (25 filled in S1; 33 planned).
- Merchant `Email.js` / `EmailDebug.js` contain many editor-run debug
  functions — intentionally left alone.
