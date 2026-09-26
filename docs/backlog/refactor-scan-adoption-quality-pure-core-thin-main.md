---
area: refactor
opened: '2026-09-26'
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
  graded_at: '2026-09-26T20:28:32.843Z'
value: normal
model: sonnet
model_reason: >-
  behaviour-preserving restructure onto the pure-core + guarded-main shape that lint-design.mjs and
  verify-exports.mjs already use; the target shape is fixed by precedent
---

# Split scan-adoption-quality into pure exported functions and a thin main

## Context

`scripts/scan-adoption-quality.mjs` (240 lines, ADR-0005) runs everything at module scope, in order:
argv parsing, the signals-file read, exclude classification, the `globSync` walk, `pcreToJs` + regex
compilation, the per-file scan, summary aggregation, both output formats, and `process.exit(0)`. Its
`fail()` helper calls `process.exit(2)` from inside what would otherwise be pure config validation. As a
result, importing any part of the file runs a full scan against `process.cwd()` and kills the process.

The two sibling scanners already use the shape ADR-0003 set for the donor's zero-dep scanners:

- `scripts/lint-design.mjs` exports pure `compileGlobs` / `compileRules` / `scanFile` /
  `includeReachableUnder`, throws `CompileError` instead of exiting, and only runs `main()` behind a
  `pathToFileURL(process.argv[1]).href === import.meta.url` guard.
- `scripts/verify-exports.mjs` exports eight pure predicates next to a thin `main()`. Its header says it is
  "matching the shape `scripts/lint-design.mjs` established per ADR-0003".

Because this scanner can't be imported, `scripts/scan-adoption-quality.test.mjs` can only test it end to
end. It writes fixture trees into a tmpdir, shells out with `execFileSync("node", [script, ...])` (line
29), and parses stdout. Several pieces have no direct unit test:

- `isExcluded`'s segment-vs-fragment rule
- the `\A`/`\Z` rewrite
- the "first match only, one hit per file" counting
- the `coOccursWith` gate

Every test also pays for a process spawn. Consumers vendor this script unforked (ADR-0005's "never fork
the runner"), so a regression here reaches the whole fleet on the next sync.

## What to do

- [ ] Extract and export pure functions: `classifyExcludes(excludes)`, `isExcluded(relPath, classified)`, `pcreToJs(source)`, `compileSignals(signals)` (per-signal `{ gateRe, re, error }`), `scanSource(rel, src, compiled)` (returns hits) and `summarize(results)`.
- [ ] Move all filesystem, argv, stdout and exit-code handling into one `main()`, guarded by the same `pathToFileURL(process.argv[1]).href === import.meta.url` check `scripts/lint-design.mjs` uses. Replace the module-scope `fail()` exits with a thrown error that `main()` turns into exit 2.
- [ ] Keep the CLI contract byte-identical: the flags, the `--json` report shape, the text output, exit 0 on a completed scan and exit 2 on config errors.
- [ ] Add direct unit tests for the extracted functions (exclude classification, anchor rewrite, the gate, one hit per file), and cut the spawn-based tests down to a small CLI smoke set.

## Acceptance

- `import { scanSource, compileSignals } from './scan-adoption-quality.mjs'` in a test runs no scan and does not exit the process.
- `npm run scan:adoption-quality -- --json` on the donor tree returns the same report as before the refactor, except for `scannedAt`.
- `scan-adoption-quality.test.mjs` has direct unit tests for `isExcluded`, `pcreToJs` and `scanSource`, and no more than a handful of `execFileSync` CLI cases remain.
- The live-file `uncompiled === 0` assertion still passes after the split.

## Related

- [docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md](../adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — the scanner's decision record.
- [docs/adr/0003-adherence-lint-zero-dep-scanner.md](../adr/0003-adherence-lint-zero-dep-scanner.md) — the zero-dep scanner shape the sibling scripts follow.
- [scripts/lint-design.mjs](../../scripts/lint-design.mjs) — the reference pure-core + guarded-`main()` layout to mirror.
- [archive/adoption-quality-scanner.md](archive/adoption-quality-scanner.md) — the ticket that shipped the script.
