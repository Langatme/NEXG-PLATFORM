# SKILL PICKER — always consulted, full computer access (2026-09-16)

**Law:** Before every slice, every dependency decision, every UI diff, and every motion/nav choice, consult this picker first. `pick-ui-library` (computer: `C:\Users\lenovo\.agents\skills\pick-ui-library\SKILL.md`) owns dependency picks; domain skills own their rules. Never substitute outside the pick list unless the task is uncovered AND Expo-compatible AND recorded here.

## Picker access (252 skills indexed, `skill_inventory.txt`)
- Computer `.agents` (25): `C:\Users\lenovo\.agents\skills\<name>\SKILL.md`
- Computer `.claude` (182): `C:\Users\lenovo\.claude\skills\<name>\SKILL.md`
- Repo vendor Appllama (2): `vendor/appllama-skills/skills/<name>/SKILL.md`
- Repo vendor Expo (22): `vendor/expo-skills/plugins/expo/skills/<name>/SKILL.md`
- Repo `.agents` (19): `.agents/skills/<name>/SKILL.md`
Full inventory: `skill_inventory.txt` (auto-generated). Read the SKILL.md at its path before claiming its rules.

## Routing (task → skill → path)
| Task | Skill | Path |
|---|---|---|
| Pick any library (toast/OTP/charts/list/dnd/state) | `pick-ui-library` FIRST | `C:\Users\lenovo\.agents\skills\pick-ui-library\SKILL.md` |
| Expo nav/routes/stacks/sheets/tabs | `expo-router` + `expo-overview` | `vendor/expo-skills/plugins/expo/skills/expo-router/SKILL.md` |
| Expo motion/gestures/haptics | `expo-animation` + `animate-expo` | vendor + `C:\Users\lenovo\.agents\skills\animate-expo\SKILL.md` |
| Native feel/colors/controls/icons | `expo-native-ui` + `apple-design` | vendor + `C:\Users\lenovo\.agents\skills\apple-design\SKILL.md` |
| Tokens/components/drift audit | `expo-design-system` | `vendor/expo-skills/plugins/expo/skills/expo-design-system/SKILL.md` |
| API/Query/offline/polling | `expo-data-fetching` | `vendor/expo-skills/plugins/expo/skills/expo-data-fetching/SKILL.md` |
| New Expo app layout | `expo-project-structure` | vendor |
| Mobile screen build/polish | `appllama-app-design-skill` | `vendor/appllama-skills/skills/appllama-app-design-skill/SKILL.md` |
| Research top apps/flows | `appllama-usage` (file-first; MCP paid) | `vendor/appllama-skills/skills/appllama-usage/SKILL.md` |
| UI polish/invisible details | `emil-design-eng` (Before\|After\|Why table) | `C:\Users\lenovo\.agents\skills\emil-design-eng\SKILL.md` |
| Cross-discipline review | `better-interface` → a11y/layout/writing/typography/colors/ui | `C:\Users\lenovo\.agents\skills\better-interface\SKILL.md` |
| Production UI build | `21st-ui-build` | `.agents/skills/21st-ui-build/SKILL.md` |
| UI audit | `21st-ui-review` (`21st review`, CLI missing → manual per skill) | `.agents/skills/21st-ui-review/SKILL.md` |
| Market taste gate | `product-taste` | `.agents/skills/product-taste/SKILL.md` |
| Spec gate | `spec-driven-development` | `.agents/skills/spec-driven-development/SKILL.md` |
| Find/install new skill | `find-skills` (`npx skills find`) | `.agents/skills/find-skills/SKILL.md` |
| Anti-slop lint | `install-anti-slop` | `C:\Users\lenovo\.agents\skills\install-anti-slop\SKILL.md` |
| RN performance | `performance-engineer` / `react-native-specialist` | `C:\Users\lenovo\.claude\skills\…` |
| Backend/API/DB | `backend-developer` / `api-designer` / `postgres-pro` / `database-optimizer` | `C:\Users\lenovo\.claude\skills\…` |
| QA/tests | `qa-expert` / `test-automator` | `C:\Users\lenovo\.claude\skills\…` |

## Expo-compat bans (picker-enforced)
Web-only → Expo replacement: base-ui/cmdk → native controls; Sonner-dom → inline `NexGToast`/native sheet; motion-dom → Reanimated worklets; recharts → dependency-free bars (M-16/H-10); Virtuoso-web → FlashList/`legend-list`; dnd-kit → Gesture Handler; NumberFlow → tabular-nums. No MapLibre; maps = `expo-linking` link-out.

## Consult log (append every use)
- 2026-09-16: picker loaded (`pick-ui-library` read); 252-skill inventory built; router created. Used for: logo (no dep), phantom removal (delete, no new dep), audit triage.
