---
area: package
opened: 2026-11-19
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-19T00:00:00Z
---

# Ship the STYLE and PACKAGE docs the package references

## Context

The published design-baseline package (v0.55.2) ships dead doc references. `README.md` (lines 5, 59, 90, 103, 107) and the `scripts/lint-design.mjs` header and error message point to `docs/STYLE.md` and `docs/PACKAGE.md`, but the `package.json` `files` array lists only `docs/CHOOSING-A-SURFACE.md`, `docs/PLACEMENT.md`, `docs/STACK.md`, `docs/DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`, `docs/archetypes` and `docs/audit-signals.json`. So `node_modules/design-baseline/docs` has neither file, and a consumer (behandlungskompass) whose `lint:design` fails follows a dead reference.

The gap is wider than the two named files. Docs referenced by shipped files but absent from `files`: `docs/STYLE.md` (also cited in ~10 shipped `src/` comments, e.g. `src/styles/tokens.css`, `src/components/layout/AppShell.tsx`, `src/utils/logger.ts`, and `scripts/scan-adoption-quality.mjs`), `docs/PACKAGE.md` (also `src/styles/tokens.css`, `bin/design-baseline-playwright.mjs`), `docs/ADOPTION-QUALITY.md` (`README.md:51`, `scripts/scan-adoption-quality.mjs`), `docs/ARCHITECTURE.md` (`README.md:34`).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add `docs/STYLE.md` and `docs/PACKAGE.md` to the `files` array in `package.json`.
- [ ] Add `docs/ADOPTION-QUALITY.md` and `docs/ARCHITECTURE.md` to `files` too, since `README.md` and the shipped `scripts/scan-adoption-quality.mjs` reference them.
- [ ] Add a check (extend `scripts/verify-exports.mjs` or the pack verification) that fails when a `docs/*.md|json` path referenced from `README.md`, `scripts/`, `bin/` or shipped `src/` is not covered by `files`, so the class cannot recur.

## Acceptance

- `npm pack --dry-run` lists every `docs/` path that `README.md` and `scripts/lint-design.mjs` reference.
- No other shipped file (`src/`, `scripts/`, `bin/`, `templates/`) references a `docs/` path that `npm pack --dry-run` omits.
- The new check fails when a referenced doc is removed from `files`.

## Related

- [[adoption-quality-scanner]]
- [ADR-0005](/docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — adoption-quality scan ships as a donor script
- [ADR-0002](/docs/adr/0002-adopt-baseline-upstream-methodology.md) — baseline-upstream methodology docs
