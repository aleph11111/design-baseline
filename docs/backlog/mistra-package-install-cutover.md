---
area: archetypes
opened: '2026-09-23'
status: ready
value: normal
model: opus
model_reason: "cross-repo migration plus a real fork reconciliation (156-line detail-overview divergence) that needs judgment"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-23T14:30:00Z'
---

# Install the design-baseline package in mistra and delete its vendored archetype copies

## Context

The `archetype-convergence` completion review found `mistra` unmigrated on `origin/main` (read
2026-09-23). `frontend/package.json` (Vite 7 + Tailwind 4) has no `design-baseline` entry.
`frontend/src/components/archetypes/` vendors ten archetype directories: analytics-dashboard,
crud-dialog, detail-overview, entity-circle, form-page, list-with-detail, overline-typed,
raw-input, raw-select and others. `docs/archetypes/` holds 26 files, including a `MANIFEST.json` fork
and a `detail-overview.md` that has diverged from the donor contract by 156 lines. That leaves D1,
D2, D3 and D5 of the roadmap's Done-when open for this repo. Run the cutover from a mistra session
using `docs/PACKAGE.md`'s "Migrating a vendored consumer" runbook, the same way
`hk-crm-package-install-cutover` did.

## What to do

- [ ] From a mistra `/feat` worktree, add `design-baseline` to `frontend/package.json` pinned to the current
      donor tag (`v0.2.3` at filing time) and install.
- [ ] Runbook step 1, fork triage: normalise and diff every file under `frontend/src/components/archetypes/`
      against the donor. For the `detail-overview.md` divergence, decide per section whether it is a
      contract change to promote upstream (use `/promote-archetype --update` from mistra) or local drift
      to drop. Record each decision before deleting anything.
- [ ] Runbook steps 2–4: split the brand `tokens.css`, wire the tsconfig paths and `tokens.layer.css`
      + `@source`, then delete `frontend/src/components/archetypes/` and the per-file stamps in one commit.
      This is a Vite consumer, so the `transpilePackages` line does not apply.
- [ ] Runbook step 6: delete `docs/archetypes/` including `MANIFEST.json`, the package-owned methodology
      docs, and their Doc-Paths keys in mistra's `CLAUDE.md`.

## Acceptance

- In `mistra/frontend`, `node -e "require.resolve('design-baseline/package.json')"` succeeds, and
  `frontend/src/components/archetypes/` is absent.
- `git -C mistra show origin/main:docs/archetypes/MANIFEST.json` fails.
- `tsc --noEmit` and `vite build` are clean, and archetype-rendering routes render unchanged against
  pre-migration screenshots, except where a triage decision deliberately dropped local drift.
- Every section of the `detail-overview.md` divergence has a recorded decision (promoted or dropped).
  None is lost silently.

## Related

- [archive/hk-crm-package-install-cutover.md](archive/hk-crm-package-install-cutover.md) — the template cutover.
- [controlling-app-package-install-cutover.md](controlling-app-package-install-cutover.md) — sibling cutover.
- [[roadmap-review-archetype-convergence]] — the review that filed this.
- ADR-0004 — appearance locality, which the donor's closed API enforces.
