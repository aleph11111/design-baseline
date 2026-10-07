#!/usr/bin/env node
// Guards against two parallel branches shipping the same package.json `version`
// (the #309/#310 incident: both bumped to 0.2.9, the rebase saw byte-identical
// lines and stayed silent). If this branch bumped `version` relative to its
// merge-base with origin/main, the bump must be strictly greater than
// origin/main's current version. A branch that didn't touch `version` passes
// unless it changes a SHIPPED path (docs/RULES.md rule 11): tag-version.yml only
// tags on a bump, so an unbumped shipped change is unpinnable by consumers.
// Shipped = src/** minus src/examples/** and test files, plus
// docs/archetypes/MANIFEST.json. Docs, backlog, scripts, workflows are exempt.
//
// Known blind spot: once the losing branch REBASES onto a trunk that already
// carries the identical bump, git drops the now-empty version hunk, the
// merge-base moves to 0.2.9, and the branch reads as "not bumped". History
// alone cannot tell that apart from a real non-bump. /ship covers it by
// ordering: mode detection fetches origin, precondition 3 runs `npm test`
// (this check) against the PRE-rebase merge-base, and only step 6 rebases.
// Bumping is required only for shipped paths, so the blind spot stays open for
// them only when the rebase also dropped the hunk (the shipped-path check then
// fails loudly, which is the safe direction). A docs-only branch still slips through.
//
// No merge-base with origin/main (shallow clone, or truly unrelated history)
// fails closed instead of falling through to the strict compare: without a
// common ancestor there is no way to tell an unbumped branch from a bumped
// one, and the old fallback's "a parallel branch already shipped this bump"
// message was actively misleading for that case.
//
// A bump must also carry a `## v<version>` entry in CHANGELOG.md.
//
// Zero-dependency by design, mirroring scripts/verify-manifest-versions.mjs.
//
// Usage:  node scripts/verify-package-version.mjs

import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const PREFIX = 'verify:package-version —';

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

try {
  git('rev-parse', '--verify', 'origin/main');
} catch {
  console.log(`${PREFIX} no origin/main to compare against (fresh clone? run git fetch); skipped`);
  process.exit(0);
}
const main = versionAt('origin/main');
const mainInfo = `origin/main@${git('rev-parse', '--short', 'origin/main')} (${git('show', '-s', '--format=%cs', 'origin/main')})`;

let base;
let hasMergeBase = true;
try {
  base = versionAt(git('merge-base', 'HEAD', 'origin/main'));
} catch {
  hasMergeBase = false;
}

if (!hasMergeBase) {
  console.error(`${PREFIX} no merge-base with origin/main (shallow clone?) — cannot tell whether this branch bumped [${mainInfo}]`);
  process.exit(1);
}
const isShipped = (f) =>
  f === 'docs/archetypes/MANIFEST.json' ||
  (f.startsWith('src/') && !f.startsWith('src/examples/') && !/\.test\.[^/]*$/.test(f));

if (current === base) {
  const changed = git('diff', '--name-only', '--no-renames', `${git('merge-base', 'HEAD', 'origin/main')}...HEAD`).split('\n');
  const shipped = changed.find(isShipped);
  if (shipped) {
    console.error(`${PREFIX} ${shipped} is shipped code but package.json version ${current} was not bumped on this branch — bump it (docs/RULES.md rule 11) [${mainInfo}]`);
    process.exit(1);
  }
  console.log(`${PREFIX} version ${current} not bumped on this branch; nothing to collide [${mainInfo}]`);
  process.exit(0);
}
if (!(compare(current, main) > 0)) {
  console.error(`${PREFIX} package.json version ${current} is not greater than origin/main's ${main}; a parallel branch already shipped this bump — rebump above ${main} [${mainInfo}]`);
  process.exit(1);
}
if (!new RegExp(`^## v${current.replace(/\./g, '\\.')}\\s*$`, 'm').test((existsSync('CHANGELOG.md') ? readFileSync('CHANGELOG.md', 'utf8') : ''))) {
  console.error(`${PREFIX} package.json bumped to ${current} but CHANGELOG.md has no "## v${current}" entry — add one (what changed, consumer action, breaking?)`);
  process.exit(1);
}
console.log(`${PREFIX} ${current} > origin/main's ${main} [${mainInfo}]`);
