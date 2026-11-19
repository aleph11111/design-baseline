---
area: tooling
opened: '2026-11-19'
status: ready
value: normal
model: sonnet
model_reason: "scoped package.json files edit plus a CHANGELOG/version bump, following the archived scan-adoption-quality-not-shipped-in-package pattern"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-19T00:00:00Z
---

# Ship docs/STYLE.md and docs/PACKAGE.md in the published package

## Context

design-baseline v0.60.0 (reported on v0.55.2, unchanged since): `README.md` (shipped by npm automatically) links `docs/STYLE.md` and `docs/PACKAGE.md`, and `scripts/lint-design.mjs` names `docs/PACKAGE.md` as the home of the four-gate stack. But `package.json` `files` lists only `docs/CHOOSING-A-SURFACE.md`, `docs/PLACEMENT.md`, `docs/STACK.md`, `docs/DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`, `docs/archetypes` and `docs/audit-signals.json` — so `node_modules/design-baseline/docs/` ships neither `STYLE.md` nor `PACKAGE.md`. A consumer (seen in behandlungskompass) whose `pnpm lint:design` fails follows a dead reference. Note: the lint's runtime error strings only cite `CHOOSING-A-SURFACE.md` (`scripts/lint-design.mjs:155`, shipped); the dead references are the README and the header comment, so verify which message the consumer actually followed before choosing a fix. Same shape as the earlier `files` gaps [[package-ships-methodology-docs-single-version-source]] and [[scan-adoption-quality-not-shipped-in-package]].

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add `docs/STYLE.md` and `docs/PACKAGE.md` to `package.json` `files` (ships the docs the README and `scripts/lint-design.mjs` point at; a repo-URL rewrite would pin consumers to `main`, the version skew [[package-ships-methodology-docs-single-version-source]] was filed to kill).
- [ ] Grep every file already in `files` (`README.md`, `docs/*.md` shipped, `docs/archetypes/*.md`, `scripts/*.mjs` messages, `templates/`) for `docs/<NAME>.md` references and ship or retarget each target that is not in the tarball (e.g. `docs/ADOPTION-QUALITY.md`, `docs/TAXONOMY.md`).
- [ ] Add a `verify-exports` invariant (next number after the last in `scripts/verify-exports.mjs`, with a case in `scripts/verify-exports.test.mjs`) that fails when a shipped file references a `docs/*.md` path outside `files`, following the invariants 8/9 pattern.
- [ ] Add a CHANGELOG entry for the next version (`## v0.60.1`, bump `package.json` per `scripts/verify-package-version.mjs`) with `Fixed:`, `Consumer:` and `Breaking: no`.

## Acceptance

- `npm pack --dry-run --json` lists `docs/STYLE.md` and `docs/PACKAGE.md`, so `ls node_modules/design-baseline/docs` in a consumer shows both.
- No other shipped file references a `docs/*.md` path that is missing from the tarball; `verify:exports` fails when one does.
- `CHANGELOG.md` has a `## v0.60.1` entry for the fix.

## Related

- [[package-ships-methodology-docs-single-version-source]] — earlier `files` gap; shipped the four methodology docs
- [[scan-adoption-quality-not-shipped-in-package]] — same defect shape and the `verify-exports` invariant pattern to follow
- [[package-ships-contracts-and-plugin-actions]] — earlier `files` gap of the same shape
- [[package-exports-package-json-subpath]] — package contents contract
