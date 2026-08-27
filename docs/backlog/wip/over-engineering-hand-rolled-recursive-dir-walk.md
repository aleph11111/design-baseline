---
area: over-engineering
opened: '2026-08-26'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-26T17:17:19.295Z'
model: sonnet
model_reason: >-
  two small functions swapped for one stdlib call each, with an exact-output equivalence check
  available — mechanical
---

# Replace both hand-rolled recursive directory walks with fs.globSync

## Context

`scripts/lint-design.mjs:157-172` defines `walk(dir, acc)`: a recursive `readdirSync(dir, { withFileTypes: true })` loop that skips `node_modules` and dotfiles, recurses into directories, and pushes files ending in `.tsx`. `scripts/scan-adoption-quality.mjs:136-152` defines a second `walk` with the same skeleton, differing only in that it matches against the `fileSuffixes` list derived from `docs/audit-signals.json`'s `globs` header and applies `isExcluded` to the relative path. Both wrap the call in a `try {} catch { return acc }` so a missing target dir is skipped silently.

`fs.globSync(patterns, { cwd, exclude })` has been in the standard library since Node 22 and is available on the Node this repo runs (25.6.1) — `require('node:fs').globSync('scripts/*.mjs')` returns the six files. It does the directory descent, the pattern match and the exclusion in one call, and returns paths already relative to `cwd`, which is the form both scanners immediately convert to (`relative(root, file)` in one, `relative(rootResolved, p).split(/[\\/]/).join('/')` in the other). The dotfile and `node_modules` skips become `exclude` entries rather than hand-written `continue`s.

This is the same class of finding as the duplicated glob engine in the same two files, and the same argument applies twice over: the donor's scanners are **vendored into consumers** (`_adherence.NOTES.md`: "A consuming project wires a `lint:design` script … and runs it"), so every line here is a line copied into every adopting repo. Roughly 35 lines across the two files collapse to two `globSync` calls.

The one thing that must not regress is the silent-skip behaviour: `walk`'s `catch` is load-bearing, because a consumer legitimately may not have every target root (`_adherence.json` `targets` defaults to `["src"]`, but a consumer may list `app` or `components`). `globSync` returns an empty array for a non-matching pattern rather than throwing, so the behaviour survives — but it must be asserted, not assumed.

## What to do

- [ ] Replace `walk` in `scripts/lint-design.mjs` with a `globSync` call per target (`globSync('**/*.tsx', { cwd: join(root, target), exclude: [...] })`), keeping the repo-root-relative path form `scanFile` requires and the `node_modules`/dotfile exclusions.
- [ ] Replace `walk` in `scripts/scan-adoption-quality.mjs` with a `globSync` call built from `signalsDoc.globs` (currently mapped into `fileSuffixes`), keeping `isExcluded` for the bare-segment exclude names the signals header uses and the existing `.sort((a, b) => a.rel.localeCompare(b.rel))` ordering.
- [ ] Drop `walk` from `scripts/lint-design.mjs`'s export list and remove its cases from `scripts/lint-design-core.test.mjs`.
- [ ] Add a test asserting a target directory that does not exist yields zero files rather than throwing, so the silent-skip contract `walk`'s `catch` provided stays covered.

## Acceptance

- `grep -rn "function walk" scripts/` returns no matches.
- `node scripts/lint-design.mjs --json` reports the identical `summary.files` count and identical `violations` array (same files, lines, columns, order) as the pre-change run.
- `node scripts/scan-adoption-quality.mjs --json` reports the identical `summary.files` count and identical per-signal `hits` file/line pairs as the pre-change run.
- Running `node scripts/lint-design.mjs` with a `targets` entry naming a directory that does not exist exits 0 and scans the remaining targets, as it does today.
- `npm test` passes.

## Related

- [over-engineering-hand-rolled-glob-engine-duplicated.md](../archive/over-engineering-hand-rolled-glob-engine-duplicated.md) — the sibling stdlib swap in the same two files.
- [docs/adr/0003-adherence-lint-zero-dep-scanner.md](../../adr/0003-adherence-lint-zero-dep-scanner.md) — the zero-dependency constraint; `node:fs` is stdlib, so it holds.
- [scripts/scan-adoption-quality.mjs](../../scripts/scan-adoption-quality.mjs) — the second copy of the walk.
