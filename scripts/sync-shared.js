// Syncs packages/shared (source of truth) into each app. Run after editing shared code:
//   node scripts/sync-shared.js [merchant|rider|host]
// Without args: syncs the three platform apps (consumer at nexg-consumer/ owns its originals;
// copy shared changes there by hand).
// Rule: NEVER edit theme|domain|components/ui|utils|hooks|lib/composer inside apps —
// edit packages/shared and re-sync. App-specific code lives in app/|lib/api|lib/store.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SHARED = path.join(ROOT, "packages", "shared");
const MARKER = "// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js\n";

const MAP = [
  ["theme", "theme"],
  ["domain", "domain"],
  ["ui", path.join("components", "ui")],
  ["utils", "utils"],
  ["hooks", "hooks"],
];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else if (/\.(ts|tsx)$/.test(e.name)) {
      const body = fs.readFileSync(s, "utf8");
      fs.writeFileSync(d, body.startsWith(MARKER) ? body : MARKER + body);
    } else fs.copyFileSync(s, d);
  }
}

function syncApp(app) {
  const dest = path.join(ROOT, app);
  if (!fs.existsSync(dest)) throw new Error(`unknown app ${app}`);
  for (const [from, to] of MAP) copyDir(path.join(SHARED, from), path.join(dest, to));
  for (const f of ["composer.ts", "events.ts", "messaging.ts"]) {
    const body = fs.readFileSync(path.join(SHARED, f), "utf8").replace(MARKER, "");
    fs.writeFileSync(path.join(dest, "lib", f), MARKER + body);
  }
  console.log(`synced ${app}`);
}

const arg = process.argv[2];
const apps = arg ? [arg === "consumer" ? "wolt-tmp-unused" : `nexg-${arg}-app`] : ["nexg-merchant-app", "nexg-rider-app", "nexg-host-app"];
for (const app of apps) {
  if (app === "wolt-tmp-unused") throw new Error("consumer (nexg-consumer/) owns its originals; copy manually when promoting shared changes");
  syncApp(app);
}
console.log("SYNC_DONE");
