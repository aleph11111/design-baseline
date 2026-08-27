---
area: over-engineering
opened: '2026-08-26'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-26T17:17:19.294Z'
model: sonnet
model_reason: >-
  swap a hand-rolled function for a named stdlib call with an existing test suite to prove
  equivalence — mechanical, one judgment call (the Node floor)
---

# Replace the hand-rolled glob engine in both donor scanners with path.matchesGlob

## Context

Both zero-dep scanners carry their own path-glob engine. `scripts/lint-design.mjs:50-80` defines `globToRegExp(glob)` — 30 lines of segment splitting, positional `**` encoding (`(?:[^/]+/)*` when leading, `(?:/[^/]+)*` otherwise), a metacharacter escaper, and a comment justifying the whole thing ("a full glob engine would be dead weight for a zero-dep scanner"). `scripts/scan-adoption-quality.mjs:105-121` carries a second copy of the same function, annotated "Same minimal glob engine as scripts/lint-design.mjs".

Node's standard library has shipped this since v22: `path.matchesGlob(path, pattern)`. Verified against every glob form the rules actually use (`_adherence.json` carries `src/components/archetypes/**` and per-folder excludes; the header comment documents `src/components/archetypes/**/*Shell.tsx`), including the awkward zero-segment case the hand-rolled comment agonizes over — `path.matchesGlob('a/b', 'a/**/b')` returns `true`, `path.matchesGlob('src/components/ui/button.tsx', 'src/components/archetypes/**')` returns `false`. Node 25.6.1 is what this repo runs on. Using it keeps ADR-0003's zero-dependency constraint intact — the stdlib is not a dependency.

The duplicate has already rotted, which is the concrete cost. `scan-adoption-quality.mjs:113` spells its escaper `s.replace(/[.*+?^${}()[]\\]/g, '\\$&')` — the character class closes at the `]` after `(`, so the pattern means "a metacharacter followed by a literal `\]`" and matches nothing. `esc('a.b(c)')` returns `a.b(c)` unescaped, so a `.` in an exclude glob silently matches any character. `lint-design.mjs:63` has the correct form (`[.*+?^${}()[\]\\]`). Two copies, one already silently wrong: the maintenance argument for deleting both.

Deleting the function also deletes the tests written to cover it — `scripts/lint-design-core.test.mjs` (209 lines) is largely `globToRegExp` cases, and `compileGlobs`/`CompileError` exist only to wrap it (`main()` never discriminates on `CompileError`, it just prints `err.message`).

## What to do

- [ ] Delete `globToRegExp` from `scripts/lint-design.mjs` and reduce `compileGlobs(rule, key)` to normalizing the glob-or-array value into a string array, with `scanFile`'s scope check calling `path.matchesGlob(fileRel, glob)` via `includes.some(...)` / `excludes.some(...)`.
- [ ] Delete the copied `globToRegExp` and `excludeRe` from `scripts/scan-adoption-quality.mjs` and have `isExcluded` call `path.matchesGlob` for the wildcard-bearing excludes, keeping the bare-segment-name branch as is.
- [ ] Drop `globToRegExp` from `scripts/lint-design.mjs`'s export list and delete its cases from `scripts/lint-design-core.test.mjs`, keeping the `compileRules` / `scanFile` / include-exclude-scope cases so the behaviour contract stays covered.
- [ ] Delete `CompileError` and its `compileGlobs` throw site if no glob can fail to compile once `path.matchesGlob` owns matching — a bad pattern is still a `compileRules` concern, so keep whichever error path `main()` actually reports.
- [ ] Add `"engines": { "node": ">=22" }` to `package.json` so a consumer vendoring these scripts (they are copied, per `_adherence.NOTES.md`) fails at install rather than at scan time on an older runtime.
- [ ] Update the `globToRegExp` paragraphs in `scripts/lint-design.mjs`'s header comment and `_adherence.NOTES.md` to name the stdlib call.

## Acceptance

- `grep -rn "globToRegExp" scripts/` returns no matches.
- `node scripts/lint-design.mjs --json` reports the same `summary.warnings` / `summary.errors` counts and the same `violations` file/line set as before the change, including the per-archetype `exclude` arrays in `_adherence.json` still suppressing the closed folders.
- `node scripts/scan-adoption-quality.mjs` scans the same file count as before, and a `.`-bearing exclude glob in `docs/audit-signals.json` no longer matches an arbitrary character.
- `npm test` passes with the `globToRegExp` cases removed and the `compileRules` / `scanFile` scope cases still green.
- `node -e "console.log(typeof require('node:path').matchesGlob)"` returns `function` on the pinned Node floor recorded in `package.json` `engines`.

## Related

- [docs/adr/0003-adherence-lint-zero-dep-scanner.md](../../adr/0003-adherence-lint-zero-dep-scanner.md) — the zero-dependency constraint this change keeps (stdlib is not a dependency).
- [docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md](../../adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — the second scanner that carries the duplicate copy.
- [over-engineering-hand-rolled-recursive-dir-walk.md](../wip/over-engineering-hand-rolled-recursive-dir-walk.md) — the sibling stdlib swap in the same two files; do them in one pass if convenient.
- [archive/adherence-lint-oxlint-mechanism-nonfunctional.md](../archive/adherence-lint-oxlint-mechanism-nonfunctional.md) — why the scanner is hand-written at all, and the scope it was given.
