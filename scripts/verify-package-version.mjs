#!/usr/bin/env node
// Guards against two parallel branches shipping the same package.json `version`
// (the #309/#310 incident: both bumped to 0.2.9, the rebase saw byte-identical
// lines and stayed silent). If this branch bumped `version` relative to its
// merge-base with origin/main, the bump must be strictly greater than
// origin/main's current version. A branch that didn't touch `version` (docs
// tickets, main itself) passes — only a bump can collide.
//
// Zero-dependency by design, mirroring scripts/verify-manifest-versions.mjs.
//
// Usage:  node scripts/verify-package-version.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const versionAt = (ref) => JSON.parse(git('show', `${ref}:package.json`)).version;

// ponytail: numeric MAJOR.MINOR.PATCH only; a prerelease PATCH ("0.2.9-beta") yields NaN and fails the
// check (closed) — add prerelease ordering when the donor ships one.
function compare(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}

const current = JSON.parse(readFileSync('package.json', 'utf8')).version;

let main, base;
try {
  main = versionAt('origin/main');
} catch {
  console.log('verify:package-version — no origin/main to compare against (fresh clone? run git fetch); skipped');
  process.exit(0);
}
// No merge-base (shallow clone) leaves base undefined: fall through to the strict check.
try {
  base = versionAt(git('merge-base', 'HEAD', 'origin/main'));
} catch {}

if (current === base) {
  console.log(`verify:package-version — version ${current} not bumped on this branch; nothing to collide`);
  process.exit(0);
}
if (!(compare(current, main) > 0)) {
  console.error(`verify:package-version — package.json version ${current} is not greater than origin/main's ${main}; a parallel branch already shipped this bump — rebump above ${main}`);
  process.exit(1);
}
console.log(`verify:package-version — ${current} > origin/main's ${main}`);
