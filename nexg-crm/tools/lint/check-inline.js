/**
 * NEXG CRM pre-push gate, part 2: compile-check inline <script> blocks
 * inside Apps Script HTML templates (oxlint only sees .js files).
 * Usage: npm run check  (exit non-zero on first syntax error)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..', '..');
const roots = [path.join(root, 'host'), path.join(root, 'merchant')];
let files = 0, blocks = 0, failures = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(p); continue; }
    if (!entry.name.endsWith('.html')) continue;
    files++;
    const html = fs.readFileSync(p, 'utf8');
    const matches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    matches.forEach((m, i) => {
      blocks++;
      try {
        new vm.Script(m[1], { filename: path.relative(root, p) + '#block' + i });
      } catch (err) {
        failures++;
        console.error('SYNTAX FAIL ' + p + ' block ' + i + ': ' + err.message);
      }
    });
  }
}

roots.forEach(walk);
console.log('checked ' + files + ' html files, ' + blocks + ' script blocks, ' + failures + ' failures');
process.exit(failures ? 1 : 0);
