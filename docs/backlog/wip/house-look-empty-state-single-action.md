---
area: ui
opened: '2026-09-27'
status: ready
value: normal
model: sonnet
model_reason: "tighten one existing primitive and route archetype empty states through it"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-27T09:00:00Z'
---

# House look slice 4: StateView empty state carries one next-step action

## Context

ADR-0007 section 7: an empty state offers exactly one next-step action, and `src/components/ui/state-view.tsx`'s `empty` variant is the one primitive for it (no new component). Today `action` is an unconstrained optional `ReactNode`, and archetypes such as `list-with-detail` (`ListWithDetailEmptyState.tsx`), `settings-table` and `matrix-grid` render their own empty states.

## What to do

- [ ] Document `StateView`'s `empty`-variant `action` as the single next-step action and fix its placement/styling in the component.
- [ ] Route the archetype empty states (`ListWithDetailEmptyState`, `SettingsTableShell`, `MatrixGridShell`) through `StateView` where they hand-roll one, keeping their public props.
- [ ] Add an adherence or adoption-quality signal for an empty state with more than one action, if expressible in the zero-dep scanner (ADR-0003); otherwise record it as a contract-close review step in `docs/STYLE.md`.

## Acceptance

- Every archetype empty state in the gallery renders through `StateView` with at most one action.
- `npm test` passes, including the existing `ListWithDetailShell` empty-state tests.

## Related

- [wip/house-look-adr.md](../archive/house-look-adr.md) — the decision ticket that filed this slice
- ADR-0007 — The fleet house look: donor-fixed roles vs brand-overridable roles
- ADR-0004 — appearance locality: global or fixed in the component
- [archive/list-with-detail-shell-presentation-split.md](../archive/list-with-detail-shell-presentation-split.md)
