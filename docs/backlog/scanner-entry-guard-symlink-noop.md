---
area: tooling
opened: '2026-09-28'
status: ready
value: normal
model: sonnet
model_reason: "mechanism established (Node resolves the main module to its realpath); one shared guard fix across three scripts with a known stdlib call"
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-09-28T04:40:00Z'
---

# Scanner entry-point guard silently no-ops when invoked through a symlink

## Context

`scripts/scan-adoption-quality.mjs`, `scripts/lint-design.mjs` and `scripts/verify-exports.mjs` each run `main()` only behind `if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url)` (the ADR-0003 pure-core + guarded-main shape). Node resolves the main module to its real path by default, so `import.meta.url` is the realpath while `process.argv[1]` stays the symlink path. A consumer that vendors a runner via a symlink (ADR-0005's "never fork the runner" — a symlink is a natural way to vendor it) gets exit 0 and no output: the scan silently never runs, which a radar that always exits 0 makes indistinguishable from "no findings". Surfaced by the review gate on PR #322.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Compare against the resolved path in all three scripts, e.g. `pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url` (stdlib `node:fs` `realpathSync`, no dependency).
- [ ] Add one test that symlinks a script into a tmpdir, runs it through the link, and asserts it produces output.

## Acceptance

- Running `scan-adoption-quality.mjs` through a symlink prints the scan report instead of exiting silently.
- No other entry-point guard in `scripts/` still compares the raw `process.argv[1]` — every matching guard (`lint-design.mjs`, `verify-exports.mjs`, `scan-adoption-quality.mjs`) resolves the realpath.
- Importing each script still runs no `main()` (existing unit tests unchanged).

## Related

- [archive/refactor-scan-adoption-quality-pure-core-thin-main.md](archive/refactor-scan-adoption-quality-pure-core-thin-main.md) — the refactor whose review surfaced this.
- [ADR-0003](../adr/0003-adherence-lint-zero-dep-scanner.md) — the zero-dep scanner shape the guard belongs to.
- [ADR-0005](../adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — consumers vendor the runner unforked.
