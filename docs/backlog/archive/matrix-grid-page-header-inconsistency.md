---
area: archetypes
opened: 2026-07-03
status: done
model: sonnet
model_reason: small doc-wording fix in one archetype spec, clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-03T15:50:00Z
---

# Resolve matrix-grid Layer 2/3 page-header contradiction

## Context

`docs/archetypes/matrix-grid.md` Layer 2 has a latent internal contradiction (pre-existing — surfaced, not introduced, during the contract/reference-impl split). One Layer 2 bullet requires "the canonical page-header treatment for the title bar (when the page has one — see Layer 3)", while the very next bullets and Layer 3 state the title sits ON the surface via the matrix-grid shell's `kicker`/`title`/`headerActions` props and that "there is no separate floating page-header treatment above the shell." A reader can't tell whether matrix-grid pages are supposed to mount a floating page header or not. Every other framed-shell archetype (list-with-detail, detail-overview, settings-table) resolved this the on-surface way; matrix-grid's Layer 2 still carries the older floating-header phrasing.

## What to do

- [ ] Reconcile matrix-grid.md Layer 2: drop or rewrite the "canonical page-header treatment for the title bar" bullet so it agrees with the on-surface header rule stated in the same layer and Layer 3.
- [ ] Confirm the intended shape matches the sibling framed-shell archetypes (on-surface header via shell props, no floating page header) and align the wording to theirs.
- [ ] Check whether the same stale phrasing leaked into `matrix-grid.baseline.md`'s Layer 2 binding and fix in tandem if so.

## Acceptance

- matrix-grid.md Layer 2 no longer both requires a floating page-header treatment and states there is none — the two statements agree.
- The header rule reads consistently with list-with-detail / detail-overview / settings-table (on-surface header, driven by shell props).

## Related

- [decouple-archetype-contract-from-reference-impl.md](wip/decouple-archetype-contract-from-reference-impl.md) — split that surfaced this
- docs/archetypes/matrix-grid.md — the file to fix
- docs/archetypes/list-with-detail.md — the on-surface header pattern to align to
