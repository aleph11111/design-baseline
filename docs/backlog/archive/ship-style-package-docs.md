---
area: package
opened: '2026-11-19'
status: done
closed: '2026-11-25'
value: normal
resolution: closed-subsumed
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-19T00:00:00Z'
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

## Verdict — SUBSUMED (closed 2026-11-25)

Merged by PR #871 — commit `7dda0c5` "feat/design baseline ship style package docs" (sibling
ticket `design-baseline-ship-style-package-docs` shipped the full top-level doc set, version
v0.66.2). `7dda0c5` is an ancestor of `origin/main`; the `files` array on current `origin/main`
v0.68.1 carries `docs/STYLE.md`, `docs/PACKAGE.md`, `docs/ADOPTION-QUALITY.md`,
`docs/ARCHITECTURE.md` (plus `TAXONOMY`, `RULES`, `PROMOTION-RADAR`, `PLUGIN-CONTRACT`), and the
dead-doc-link check is invariant 11 (`findDeadDocLinks`) in `scripts/verify-exports.mjs`, wired
into `npm test` and CI.

Per-acceptance-criterion evidence (fresh `git fetch origin` 2026-11-25, host darwin, worktree base
= `origin/main` 09a51b6):

1. **`npm pack --dry-run` lists every `docs/` path that `README.md` and `scripts/lint-design.mjs`
   reference.** Live `npm pack --dry-run --json` pack list contains all top-level docs, among them
   `docs/STYLE.md`, `docs/PACKAGE.md`, `docs/ADOPTION-QUALITY.md`, `docs/ARCHITECTURE.md`; the
   referenced set in `README.md` is exactly {STYLE, PACKAGE, ADOPTION-QUALITY, ARCHITECTURE,
   CHOOSING-A-SURFACE, DETAIL-PAGE-TEARDOWN-PLAYBOOK, PLACEMENT, STACK} and `scripts/lint-design.mjs`
   cites `docs/PACKAGE.md` — every one present in the pack. Corroborated by the in-suite assertion
   "the packed tarball contains docs/STYLE.md and docs/PACKAGE.md" in
   `scripts/verify-exports.test.mjs` (`findDeadDocLinks (invariant 11)` suite): it runs
   `npm pack --dry-run --json` and asserts the paths.
2. **No other shipped file references a `docs/` path the pack omits.** Live
   `findDeadDocLinks(process.cwd(), pkg)` on the current tree returned `[]` (0 offenders) across
   the `files` scopes + `README.md`. `npx vitest run scripts/verify-exports.test.mjs -t
   findDeadDocLinks` → 4/4 green, including the fixtures that flag a dead `docs/STYLE.md` ref from
   `README.md` and a `docs/PACKAGE.md` ref from `scripts/lint-design.mjs`, and accept a covered ref.
3. **The new check fails when a referenced doc is removed from `files`.** Live mutation: with
   `docs/STYLE.md` dropped from `files`, `findDeadDocLinks` returned the offender
   `docs/STYLE.md (referenced by README.md, docs/ARCHITECTURE.md, docs/CHOOSING-A-SURFACE.md —
   outside every "files" scope, so the link dies in the consumer's tarball)` — i.e. the suite fails
   when a referenced doc is removed. The committed fixtures in `scripts/verify-exports.test.mjs`
   lock this failure mode.

The "What to do" step list is discharged as a whole: all four checkboxes are covered by PR #871 —
the two `files` additions (steps 2–3) shipped in the v0.66.2 `files` array, and step 4 landed as
invariant 11 (`findDeadDocLinks`) in `scripts/verify-exports.mjs` + its fixtures in
`scripts/verify-exports.test.mjs`. Step 1 (grep every caller, fix the shared point) is satisfied
because the check scans the whole `files` scope set rather than a single call site.
