---
area: tooling
opened: 2026-10-08
status: ready
value: normal
model: sonnet
model_reason: "extends two existing functions in scripts/scan-adoption-quality.mjs with test fixtures; same shape as the shadow pass it follows"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-08T20:00:00Z
---

# Adoption scan shadow pass follows tsconfig extends and honors excludes

## Context

The `shadowed-baseline-file` pass in `scripts/scan-adoption-quality.mjs` (`readTsconfigPaths`, `scanShadowedBaseline`) reads only `<root>/tsconfig.json`. A consumer that keeps `paths` in `tsconfig.app.json` (Vite templates) or in an `extends` base gets a silent zero hit count. Separately, the same-name walk uses `listSources` (`readdirSync`), which bypasses the scan's exclude globs, so a deliberately excluded fork is still flagged while `adopted-header` hits respect excludes.

## What to do

- [ ] Before editing, grep every caller of `readTsconfigPaths` and `listSources`; fix at the shared point, not only the call site this report names.
- [ ] Follow `extends` (relative paths, array form) and `references` entries in `readTsconfigPaths`, merging `paths` with the nearer config winning and resolving `baseUrl` against the config that declares it.
- [ ] Filter `listSources` results through `isExcluded` with the scan's classified excludes.
- [ ] Add fixture cases: `paths` in a base config via `extends`, `paths` in `tsconfig.app.json` via `references`, and an excluded local fork.

## Acceptance

- The scan returns a same-name hit when `paths` is declared only in an extended base config or a referenced project config.
- The scan returns no hit for a same-name file matched by an exclude glob.
- No other tsconfig shape that previously produced hits changes its result; `npm test` passes.

## Related

- [[adoption-scan-flags-shadowed-baseline-files]]
- [ADR-0005](/docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — zero-dep donor scan
