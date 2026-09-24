---
area: archetypes
opened: '2026-09-23'
status: ready
value: normal
model: opus
model_reason: "pre-donor lineage: the corpus predates the donor, so fork triage is heavier than hk-crm's byte-identical case"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-23T14:30:00Z'
---

# Archive brickshop-manager's pre-donor archetype corpus and install the design-baseline package

## Context

`brickshop-manager` (Vite 8 + Tailwind 4, root `package.json`) is the fleet's pre-donor archetype
lineage. On `origin/main` (read 2026-09-23) it carries a 43-file `docs/archetypes/` corpus, including a
`MANIFEST.json` fork, 11 files in `src/components/archetypes/`, 49 in `src/components/ui/`, and no
`design-baseline` dependency. The roadmap's Phase 6 carves out an archive for this corpus:
`docs/archive/archetypes-2026/` instead of a plain delete. The review weighed a frozen, unmigrated state
and rejected it: Done-when D5 ("no consumer carries an archetypes/ folder") can only hold if
`src/components/archetypes/` is removed, and that means the package has to replace it. Run the cutover
from a brickshop-manager session.

## What to do

- [ ] From a brickshop-manager `/feat` worktree, `git mv` the `.md` corpus of `docs/archetypes/` into
      `docs/archive/archetypes-2026/`, keeping the history (Phase 6 carve-out). `MANIFEST.json` stays live at
      `docs/archetypes/MANIFEST.json`, shrunk to its six versionless local rows (`detail-view`,
      `settings-form`, `domain-hub`, `lookup`, `feed`, `item-selector`), and the `archetypes`/`patterns`
      Doc-Paths key in `CLAUDE.md` stays with it. `docs/PACKAGE.md` step 6's F9 exception has the reason:
      the dashboard's promotion-candidate axis reads that file, and archiving it is what the F4 shrink rule prevents.
- [ ] Add `design-baseline` to `package.json` pinned to the current donor tag (`v0.2.3` at filing time),
      then apply `docs/PACKAGE.md`'s "Migrating a vendored consumer" steps 1–4. In step 1, triage every
      file in `src/components/archetypes/` and `src/components/ui/` against the donor. Pre-donor files
      that differ beyond stamps are real forks: keep them project-first or promote them, never drop them
      unseen.
- [ ] Delete `src/components/archetypes/` once every import resolves through `design-baseline/archetypes/<slug>`.

## Acceptance

- In brickshop-manager, `node -e "require.resolve('design-baseline/package.json')"` succeeds, and
  `src/components/archetypes/` is absent.
- `git -C brickshop-manager show origin/main:docs/archetypes/MANIFEST.json` succeeds and lists exactly the
  six versionless rows (no entry carries a `version:`), while `origin/main:docs/archive/archetypes-2026/MANIFEST.json`
  fails and no `.md` file remains under `origin/main:docs/archetypes/`.
- `tsc --noEmit` and `vite build` are clean, and archetype routes render unchanged against pre-migration
  screenshots.

## Related

- [archive/hk-crm-package-install-cutover.md](../archive/hk-crm-package-install-cutover.md) — the template cutover.
- [mistra-package-install-cutover.md](../mistra-package-install-cutover.md) — sibling cutover.
- [[roadmap-review-archetype-convergence]] — proposed this as `brickshop-manager-archetypes-archive-freeze`. Renamed because the review resolved the freeze-vs-cutover call to cutover (D5).

## Handoff — 2026-09-24

The donor session did not edit brickshop-manager: brickshop still evolves archetypes locally (A v2.0
#1154, J v3.1 #1156), so fork triage belongs to a brickshop session (fleet self-heal rule). A playbook
was written to brickshop's gitignored `tasks/design-baseline-cutover-playbook.md` and a brickshop
session launched (cmux workspace "brickshop: design-baseline cutover") to run this ticket's steps and
open a PR against brickshop `origin/main` without merging. The ticket stays in `wip/` until that PR
lands and the acceptance checks pass; donor-side package bugs it surfaces get their own tickets.
