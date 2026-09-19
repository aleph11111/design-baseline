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
// Eight invariants of the package surface are checked:
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
//   5. The donor-owned layer carries no brand values:
//      `src/styles/tokens.layer.css` declares no `:root` or `.dark` selector. A
//      brand triplet bleeding into the donor-owned half is silent
//      (it builds fine) until a consumer bumps its pinned tag and the donor's
//      layer overrides that consumer's own brand.
//   6. The brand file is not the pre-#178 merged shape:
//      `src/styles/tokens.css` carries no `@import "tailwindcss"`. That entry
//      belongs to the layer; its re-acquisition by the brand file (or the layer
//      import going missing, leaving it as the sole entry) is the regression a
//      package consumer could not detect on its own — the file resolves inside
//      node_modules.
//      Both are channel-agnostic (spec T5): they pin the two files' *shape*,
//      not the layer import's specifier, which differs between the copy channel
//      (`./tokens.layer.css`) and the package channel (`design-baseline/…`).
//   7. Every consumer-measured leaf carries `"use client";` as its first line
//      (ADR-0006): invariant 3's one-directive-per-barrel covers the 24
//      `index.ts` barrels, but `./ui/*` (and the layout/archetypes leaves) are
//      exported directly as source, so a consumer resolving, say,
//      `@/components/ui/sidebar` through `node_modules/` needs the leaf itself
//      client-rooted — the phase-pkg dry run reproduced the
//      `createContext is not a function` page-data crash without it. The
//      leaf set is frozen in `scripts/consumer-directive-set.json` (first
//      measured consumer, hk-crm — provenance in the file) because the donor
//      cannot reach the consumer at verify time; re-derive when the consumer's
//      directive set moves.
//   8. `exports` declares `"./package.json"`. Node's exports encapsulation
//      refuses any subpath the map does not name, so without this entry
//      `require.resolve('design-baseline/package.json')` throws
//      `ERR_PACKAGE_PATH_NOT_EXPORTED` in a correctly installed consumer —
//      which is how tooling reads the installed package's own `version`.
//      Invariant 2 cannot catch this: it checks the targets that ARE listed
//      resolve, never that a subpath is still listed, so a future exports
//      edit could silently drop it.
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

// Invariant 5 (spec T5): the donor-owned layer declares no brand selectors. A
// `:root` or `.dark` at the start of a line means a brand value has drifted
// into the half a `--force` re-apply will blast. The regex is line-anchored and
// channel-agnostic — it checks the layer's *shape*, not its import specifier.
// Returns `[file]` offenders (empty when clean).
const LAYER_BRAND_SELECTOR_RE = /^\s*(:root|\.dark)\b/m;
function layerDeclaresBrandValues(root) {
  const rel = 'src/styles/tokens.layer.css';
  return LAYER_BRAND_SELECTOR_RE.test(readFileSync(join(root, rel), 'utf8')) ? [rel] : [];
}

// Invariant 6 (spec T5): the brand file is not the pre-#178 merged shape — it
// carries no `@import "tailwindcss"` (that entry belongs to the layer). Same
// `readFileSync` + regex shape, channel-agnostic: it pins the brand file's
// *shape*, never the layer import's specifier. Returns `[file]` offenders.
const BRAND_TAILWIND_ENTRY_RE = /@import\s+["']tailwindcss["']/;
function brandFileIsMergedShape(root) {
  const rel = 'src/styles/tokens.css';
  return BRAND_TAILWIND_ENTRY_RE.test(readFileSync(join(root, rel), 'utf8')) ? [rel] : [];
}

const CONSUMER_SET_REL = 'scripts/consumer-directive-set.json';

// Invariant 7 (ADR-0006): every consumer-measured leaf carries the directive
// as its FIRST statement — the leaf-level complement of invariant 3's
// barrel-level check. Reads the frozen set (provenance in the file header) so
// a direct subpath export can never silently lose its client module boundary
// again. Missing files and missing directives are reported alike. Synthetic
// fixtures point `root` at a throwaway tree with their own set file, so the
// check stays exercised without the real 97-file set.
function consumerLeavesMissingDirective(root) {
  let set;
  try {
    set = JSON.parse(readFileSync(join(root, CONSUMER_SET_REL), 'utf8')).files ?? [];
  } catch {
    return [`${CONSUMER_SET_REL} (missing or unreadable — re-derive, see its header)`];
  }
  return set.filter(
    (rel) => !existsSync(join(root, rel)) ||
      !firstStatementIsUseClient(readFileSync(join(root, rel), 'utf8')),
  );
}

// Invariant 8 — see header. The self-referencing subpath must stay in the map;
// pure over the parsed manifest, no filesystem (its target is package.json
// itself, whose existence invariant 2 already covers).
const SELF_SUBPATH = './package.json';
function exportsSelfSubpath(pkg) {
  return (pkg.exports ?? {})[SELF_SUBPATH] === SELF_SUBPATH
    ? []
    : [`${SELF_SUBPATH} (missing from exports — consumers get ERR_PACKAGE_PATH_NOT_EXPORTED)`];
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
  const layerBrand = layerDeclaresBrandValues(root);
  const brandMerged = brandFileIsMergedShape(root);
  const consumerLeaves = consumerLeavesMissingDirective(root);
  const selfSubpath = exportsSelfSubpath(pkg);
  // The count for the ok label; a missing set already fails via the
  // predicate's message, so this must not throw on the same condition.
  let totalLeaves = 0;
  try {
    totalLeaves = JSON.parse(readFileSync(join(root, CONSUMER_SET_REL), 'utf8')).files.length;
  } catch {
    /* reported by consumerLeavesMissingDirective */
  }
  const report = [
    ['no @/ specifiers in packaged dirs', atAlias, atAlias.length === 0],
    ['every exports subpath resolves', deadTargets, deadTargets.length === 0],
    [`all ${barrels.length} barrels carry "use client"`, missingDirective, missingDirective.length === 0],
    ['files ship no compiled CSS', shippedCss, shippedCss.length === 0],
    ['token layer declares no brand values', layerBrand, layerBrand.length === 0],
    ['brand tokens file is not the merged shape', brandMerged, brandMerged.length === 0],
    [`${totalLeaves} consumer-measured leaves carry "use client" (ADR-0006)`, consumerLeaves, consumerLeaves.length === 0],
    ['exports declares "./package.json"', selfSubpath, selfSubpath.length === 0],
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
  const summary = `verify:exports — ${failures} failing invariant(s), ${report.filter(([, , ok]) => ok).length}/${report.length} ok`;
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

export {
  hasAtAliasImports,
  resolveExportTargets,
  barrelFiles,
  firstStatementIsUseClient,
  findShippedCss,
  layerDeclaresBrandValues,
  brandFileIsMergedShape,
  consumerLeavesMissingDirective,
  exportsSelfSubpath,
};
