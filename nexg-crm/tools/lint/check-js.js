/**
 * NEXG CRM pre-push gate, part 1: syntax-check every server .js file.
 * (oxlint reports unused vars etc, but a hard syntax break must fail fast.)
 * Usage: npm run checkjs  (exit non-zero on first failure)
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const roots = [path.join(root, 'host'), path.join(root, 'merchant')];
let files = 0, failures = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      walk(p);
      continue;
    }
    if (!entry.name.endsWith('.js')) continue;
    if (entry.name === 'check-inline.js' || entry.name === 'check-js.js') continue;
    files++;
    try {
      execFileSync(process.execPath, ['--check', p], { stdio: 'pipe' });
    } catch (err) {
      failures++;
      const msg = (err.stderr || err.stdout || Buffer.from(String(err.message)))
        .toString().split('\n').slice(0, 4).join('\n');
      console.error('SYNTAX FAIL ' + path.relative(root, p) + '\n' + msg);
    }
  }
}

roots.forEach(walk);
console.log('checked ' + files + ' js files, ' + failures + ' failures');
process.exit(failures ? 1 : 0);
