---
area: tooling
opened: '2026-10-10'
status: done
value: high
model: sonnet
model_reason: "scoped package.json files edit plus one verify-exports invariant, following the existing invariants 8/9 pattern"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-10T00:00:00Z
---

# Adoption quality scan script missing from the published package

## Context

`docs/PACKAGE.md` and `docs/ADOPTION-QUALITY.md` tell consumer apps to run `node node_modules/design-baseline/scripts/scan-adoption-quality.mjs`. But `package.json` `files` lists no `scripts/` entry, so the packed tarball contains neither `scripts/scan-adoption-quality.mjs` nor `docs/audit-signals.json`, and the command cannot run in any consumer (brickshop-manager PR #1571 had to skip the scan on v0.9.3). The script imports only `node:` builtins, but `parseArgs` in `scripts/scan-adoption-quality.mjs` defaults the signals file to `<--root>/docs/audit-signals.json`, which in a consumer resolves to the consumer's own `docs/`, so shipping the script alone would still fail with a config error (exit 2).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add `scripts/scan-adoption-quality.mjs` and `docs/audit-signals.json` to `package.json` `files`.
- [ ] Make the signals default resolve relative to the script's own location (`import.meta.url`) when no `--signals` is passed, so the installed copy finds the shipped `audit-signals.json` instead of the consumer's root; `--signals` still overrides.
- [ ] Add a `verify-exports` invariant (next number after 9 in `scripts/verify-exports.mjs`, with a case in `scripts/verify-exports.test.mjs`) that fails when the script, or any file it reads at default settings, is not covered by `files`.
- [ ] Add a test that runs `npm pack --dry-run --json` (or an equivalent packed-file listing) and asserts the documented consumer command's script path and its default signals file are in the tarball.
- [ ] Add a CHANGELOG entry for the next version (`## v0.10.1`, bump `package.json` per `scripts/verify-package-version.mjs`) with `Fixed:`, `Consumer:` (brickshop-manager can run the scan again) and `Breaking: no`.

## Acceptance

- The packed tarball contains `scripts/scan-adoption-quality.mjs` and `docs/audit-signals.json`.
- `node node_modules/design-baseline/scripts/scan-adoption-quality.mjs` run from an installed consumer with no `--signals` exits 0 and prints the report, instead of exiting 2 on a missing signals file.
- `verify:exports` fails when any packaged file the documented consumer command reads is dropped from `files`; no other documented consumer command path in `docs/PACKAGE.md` or `docs/ADOPTION-QUALITY.md` is left unresolved in the tarball.
- `CHANGELOG.md` has a `## v0.10.1` entry for the fix.

## Related

- [[adoption-quality-scanner]] — built the script as a donor-only tool
- [[package-ships-contracts-and-plugin-actions]] — earlier `files` gap of the same shape
- [[package-exports-package-json-subpath]] — precedent for a verify-exports invariant guarding a consumer-resolvable path
- [ADR-0005](/docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — scan ships as a zero-dep donor script
- [ADR-0006](/docs/adr/0006-consumer-measured-use-client-leaves.md) — verify-exports invariant precedent
