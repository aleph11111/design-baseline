#!/usr/bin/env node
// design-baseline source-package verifier — the mechanical half of phase pkg
// (spec: docs/superpowers/specs/2026-08-17-archetype-convergence-design.md,
// "### Decisions" P1-P8). Zero-dependency by design, matching the shape
// `scripts/lint-design.mjs` established per ADR-0003: stdlib only, pure
// predicates exported next to a thin `main()` that touches argv/filesystem/
// stdout and owns the exit code. `npm test` picks it up via the
// `scripts/**/*.test.mjs` include; the test file exercises each predicate
// against synthetic inputs, so a guard failing open (or a silent no-match
// on the real tree) stays caught even if the donor tree is clean.
//
// Four invariants of the package surface are checked:
//
//   1. No `@/` import specifier survives under the four packaged source
//      dirs. The relativization (P1) must be total — `@/` would resolve
//      against the consumer's root alias from inside node_modules.
//   2. Every `exports` subpath resolves to a file that exists. Wildcard
//      subpaths (`./archetypes/*`, `./ui/*`, `./hooks/*`) expand against the
//      directory's actual contents — Node's `exports` does no extension
//      resolution, so a `*.tsx` pattern is exact, and every resolved file
//      must exist on disk.
//   3. Every exported barrel carries `"use client";` as its first statement
//      (P4): the directive marks a module boundary, so one per barrel covers
//      its whole subtree — 24 barrels (23 archetype `index.ts` +
//      `layout/index.ts`), mechanically checkable.
//   4. `files` ships no compiled CSS (P5/P6): every `.css` file inside the
//      `files` scopes stays source CSS under `src/styles/` — the compiled-CSS
//      skew objection dies because a consumer compiles every class from
//      source. The brand `tokens.css` is deliberately not exported.
//
// Usage:  node scripts/verify-exports.mjs [--json]
//         exit 0 all invariants hold; exit 1 at least one broken; exit 2
//         package.json unreadable/malformed.
//
// The module is importable: `hasAtAliasImports`, `resolveExportTargets`,
// `barrelHasUseClient`, and `filesShipCompiledCss` are pure and exported
// (see scripts/verify-exports.test.mjs). Only `main()` touches argv, the
// filesystem, stdout, and the exit code, and it runs only when the file
// is the entry point — importing it scans nothing.

import { existsSync, globSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// The four packaged source dirs invariant 1 walks and whose import graph must
// be self-relative (P1). Shared with the `files` scoping, so a dir added to
// the package here must also be added there (and vice versa) or invariant 1
// silently stops covering it.
const PACKAGED_DIRS = ['src/components', 'src/lib', 'src/hooks', 'src/utils'];

// The exported barrels invariant 3 requires `"use client";` on (P4). Derived
// from the actual archetype directories rather than hardcoded 23, so a new
// archetype folder is required to carry the directive the moment its
// `index.ts` exists — the check grows with the tree instead of a list to
// hand-update.
function barrelFiles(root) {
  const archetypes = globSync('src/components/archetypes/*/index.ts', { cwd: root }).sort();
  return [...archetypes, 'src/components/layout/index.ts'];
}

// Invariant 1: the `@/`-specifier ban (P1). Scans each `.ts`/`.tsx` file under
// the packaged dirs for a module request whose specifier is alias-form —
// quote-anchored `@/…` right after a `from`/`import(` opener, the same shape
// `lint-design`'s line-level scanning accepts (ADR-0003: no parser, no module
// graph). Backtick-quoted `@/` mentions inside comments or strings are NOT
// import requests and are not flagged. Returns `[file]` offenders (one per
// file) so the caller reports file-level, like `lint-design.mjs` does.
function hasAtAliasImports(root) {
  const specRe = /(?:\bfrom\s*|\bimport\s*\()\s*(["'])@\/[a-zA-Z0-9_./-]+\1/g;
  const offenders = [];
  for (const dir of PACKAGED_DIRS) {
    for (const rel of globSync(`${dir}/**/*.{ts,tsx}`, {
      cwd: root,
      exclude: ['**/node_modules/**', '**/.*/**'],
    }).sort()) {
      specRe.lastIndex = 0; // the `g` flag makes `test` index-sensitive
      if (specRe.test(readFileSync(join(root, rel), 'utf8'))) offenders.push(rel);
    }
  }
  return offenders;
}

// Invariant 2 — see header (exports resolution). Wildcard subpaths expand
// against the directory their non-`*` prefix names; Node's `exports` does no
// extension resolution, so each entry is checked as an exact path. Returns
// `[subpath → target (reason)]` failures, empty when clean.
function resolveExportTargets(root, pkg) {
  const bad = [];
  for (const [sub, target] of Object.entries(pkg.exports ?? {})) {
    const t = String(target);
    // "Resolves to a file that exists" = the target template glob-matches at
    // least one real file. A missing static target, or a dead wildcard (e.g.
    // an archetype dir that lost its `index.ts`), yields zero matches.
    const matches = globSync(t, { cwd: root });
    if (matches.length === 0) bad.push(`${sub} → ${t} (no matching file)`);
  }
  return bad;
}

// Invariant 3: `"use client";` as the FIRST statement (P4). A directive only
// counts when it precedes every other statement — leading line comments and
// blank lines are fine (they attach to the directive), but an import or
// export above it means the boundary no longer covers the barrel's whole
// subtree. Returns the barrel paths missing the directive.
function firstStatementIsUseClient(text) {
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line === '' || line.startsWith('//') || line.startsWith('*') || line.startsWith('/*')) continue;
    return line === '"use client";';
  }
  return false;
}

// Invariant 4 (P5/P6): `files` ships no compiled `.css`. Every `.css`
// reachable through the `files` scopes must be a source file under
// `src/styles/` — donor-owned `tokens.css` / `tokens.layer.css`. A
// build-output `.css` (a `dist/…`, a component-level `.css`, or any
// `.css` outside `src/styles/`) in a shipped scope is a violation: the
// consumer compiles every class from source, so no precompiled layer may
// ride along. Returns the offending `.css` paths.
function findShippedCss(root, pkg) {
  const shipped = [];
  for (const pattern of pkg.files ?? []) {
    for (const rel of globSync(`${pattern}/**/*.css`, { cwd: root })) {
      if (!rel.startsWith('src/styles/')) shipped.push(rel);
    }
  }
  return shipped;
}

function main() {
  const root = process.cwd();
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  } catch (err) {
    console.error(`verify:exports — cannot read package.json: ${err.message}`);
    process.exit(2);
  }
  const atAlias = hasAtAliasImports(root);
  const deadTargets = resolveExportTargets(root, pkg);
  const barrels = barrelFiles(root);
  // A missing barrel file is a missing-directive report, not a crash — a
  // deleted `layout/index.ts` must read as a FAIL line, not a stack trace.
  const missingDirective = barrels.filter(
    (rel) => !existsSync(join(root, rel)) ||
      !firstStatementIsUseClient(readFileSync(join(root, rel), 'utf8')),
  );
  const shippedCss = findShippedCss(root, pkg);
  const report = [
    ['no @/ specifiers in packaged dirs', atAlias, atAlias.length === 0],
    ['every exports subpath resolves', deadTargets, deadTargets.length === 0],
    [`all ${barrels.length} barrels carry "use client"`, missingDirective, missingDirective.length === 0],
    ['files ship no compiled CSS', shippedCss, shippedCss.length === 0],
  ];
  let failures = 0;
  for (const [label, items, ok] of report) {
    if (ok) {
      console.log(`  ok    ${label}`);
    } else {
      failures += items.length;
      console.log(`  FAIL  ${label} (${items.length})`);
      for (const item of items) console.log(`        ${item}`);
    }
  }
  const summary = `verify:exports — ${failures} failing invariant(s), ${report.filter(([, , ok]) => ok).length}/4 ok`;
  if (failures) {
    console.error(`\n${summary}`);
    process.exitCode = 1;
  } else {
    console.log(`\n${summary}`);
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main();
}

export { hasAtAliasImports, resolveExportTargets, barrelFiles, firstStatementIsUseClient, findShippedCss };
