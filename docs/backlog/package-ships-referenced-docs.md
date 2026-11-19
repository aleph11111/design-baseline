---
area: tooling
opened: '2026-11-19'
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-11-19T00:00:00Z'
---

# Package ships files that cite docs the package does not ship

## Context

Still true on origin/main v0.60.0 (found on v0.55.2 by consumer behandlungskompass): `package.json` `files` ships `docs/CHOOSING-A-SURFACE.md`, `docs/PLACEMENT.md`, `docs/STACK.md`, `docs/DETAIL-PAGE-TEARDOWN-PLAYBOOK.md` and `docs/archetypes`, but not `docs/STYLE.md`, `docs/PACKAGE.md` or `docs/RULES.md`. Shipped files point at them: `README.md` (lines 5, 59, 90, 103, 107), the header comment of `scripts/lint-design.mjs` (cites `docs/PACKAGE.md`, line 2) and its messages (cite `RULES.md` hard rule 12, lines 70 and 153), and `bin/design-baseline-playwright.mjs:9` (cites `docs/PACKAGE.md`). A consumer whose `lint:design` fails follows the citation into `node_modules/design-baseline/docs/` and finds nothing. The shipped-docs list is also what `docs/RULES.md` rule 11 treats as shipped paths for version bumps, so any change to it needs a version bump.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add `docs/STYLE.md`, `docs/PACKAGE.md` and `docs/RULES.md` to the `package.json` `files` list, following the existing precedent of the four methodology docs already listed there (per [[package-ships-methodology-docs-single-version-source]]).
- [ ] Grep every `docs/*.md` / `RULES.md` reference in every shipped file (`README.md`, `scripts/lint-design.mjs`, `scripts/scan-adoption-quality.mjs`, `bin/`, `src/` comments, `templates/`, lint message strings) against the `npm pack --dry-run --json` file list, and fix the whole class: ship the target, or reword the citation where the target is donor-internal (e.g. `docs/backlog/`, `docs/superpowers/`).
- [ ] Add a test under `scripts/` that runs `npm pack --dry-run --json`, extracts `docs/<path>` and bare `RULES.md` / `STYLE.md` / `PACKAGE.md` citations from every packed text file, and fails naming the file and the missing path when a cited doc is not in the pack.
- [ ] Bump `package.json` version (shipped-path change, per `docs/RULES.md` rule 11) and note the change in the changelog entry the repo already keeps.

## Acceptance

- The `npm pack --dry-run --json` file list includes `docs/STYLE.md`, `docs/PACKAGE.md` and `docs/RULES.md`.
- No shipped file cites a docs path that is absent from the pack: the new test returns green on main and fails when a `docs/<x>.md` citation is added to a shipped file without shipping `<x>.md`.
- Every citation in `README.md`, `scripts/lint-design.mjs` and `bin/` resolves under `node_modules/design-baseline/` after install, not only the three paths named in this report.

## Related

- [[package-ships-methodology-docs-single-version-source]] — earlier ticket that added the four methodology docs to `files`
- [[package-ships-contracts-and-plugin-actions]] — earlier packaging ticket for the same `files` list
- [ADR-0002](/docs/adr/0002-adopt-baseline-upstream-methodology.md) — methodology docs adopted upstream
- [docs/RULES.md](/docs/RULES.md) — rule 11 (version bump on shipped paths), rule 12 (cited by lint messages)
