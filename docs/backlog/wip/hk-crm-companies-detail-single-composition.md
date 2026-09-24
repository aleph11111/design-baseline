---
area: archetypes
opened: '2026-09-23'
status: ready
value: normal
model: opus
model_reason: "refactor across 11 route files with per-tab data shape design; KPI-strip consistency is the point"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-23T14:30:00Z'
---

# Collapse hk-crm's /companies/[id] tab routes into one DetailOverviewShell composition

## Context

The `archetype-convergence` roadmap's Phase 4 bullet 1 asks for the twelve `/companies/[id]` route files
to collapse into one composition. `hk-crm-package-install-cutover` moved the code into the package but
did not collapse the routes. On hk-crm `origin/main` (read 2026-09-23), 11 files under
`src/app/(app)/companies/[id]/` still import and compose `DetailOverviewShell` on their own: the
overview `page.tsx` plus `activity`, `angebote`, `contacts`, `deals`, `devices`, `emails`, `notes`,
`projects`, `tasks` and `vertraege`. `layout.tsx` already owns the Mode B entity heading and
`CompanyTabNav`. The spec's "five-of-twelve KPI strip" risk comes from this per-page composition: each
tab decides its own `stats`. Work from an hk-crm session.

## What to do

- [ ] From an hk-crm `/feat` worktree, move the single `DetailOverviewShell` composition to one place,
      next to `layout.tsx`, that takes a per-tab data descriptor (title, `stats`, body). Each tab route
      then supplies only its data loader and body.
- [ ] Keep `layout.tsx`'s Mode B ownership of the entity heading unchanged. The shared composition
      renders the sub-area shell, not a second entity header.

## Acceptance

- `git grep -l DetailOverviewShell -- 'src/app/(app)/companies/[id]'` in hk-crm returns one file instead
  of eleven.
- Every company tab renders its KPI strip through the same composition, so no tab can omit or restyle
  the strip on its own. All tab routes render unchanged against pre-refactor screenshots.
- `tsc --noEmit` and `next build` are clean.

## Related

- [archive/hk-crm-package-install-cutover.md](../archive/hk-crm-package-install-cutover.md) — the install that left this gap.
- [archive/archetype-convergence-detail-overview-close-api.md](../archive/archetype-convergence-detail-overview-close-api.md) — the closed API this composes.
- [[roadmap-review-archetype-convergence]] — the review that filed this.
