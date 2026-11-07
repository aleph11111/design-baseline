---
area: archetypes
opened: 2026-11-06
status: ready
value: normal
model: sonnet
model_reason: "pattern-following additive prop, same Pick intersection as GroupedListShell/BoardShell/FeedShell"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-06T00:00:00Z
---

# MatrixGridShell has no page header back link slot

## Context

`MatrixGridShellProps` (`src/components/archetypes/matrix-grid/MatrixGridShell.tsx:91`) is built on `PageShellFrameProps`, which omits `backHref`, `backLabel` and `renderBackLink` (`src/components/layout/PageFrame.tsx:110-113`). A matrix-grid page that is a child of a list therefore cannot render the `PageHeader` back link. `GroupedListShell` (`grouped-list/GroupedListShell.tsx:17-20`), `BoardShell` and `FeedShell` already opt in with `Pick<PageFrameProps, "backHref" | "backLabel" | "renderBackLink"> & PageShellFrameProps`; matrix-grid is missing from that set. Hit 2026-11-06: controlling-app PR aleph11111/controlling-app#2193 moved the planset editor (child of the planset list, `backHref='/workspace/consolidation/<groupId>/planset'`, `backLabel='Zu den Plansets'`) from a bare `PageFrame` onto `MatrixGridShell`, and its review flagged the lost back link. The archived `archetype-gap-shell-back-link-remaining` deliberately deferred matrix-grid "until a consumer page under a parent needs one" — this is that demand.

## What to do

- [ ] Add the `Pick<PageFrameProps, "backHref" | "backLabel" | "renderBackLink">` intersection to `MatrixGridShellProps` exactly as `GroupedListShell` does, and make sure the three props reach `<PageFrame>` (the shell collects the rest props into `...header`, as grouped-list does with `...frame`). Do NOT widen `PageShellFrameProps` itself (the `TakesEveryFrameSlot` gate in `src/components/archetypes/page-shell-frame-slots.test.tsx` would break).
- [ ] Add a case to `MatrixGridShell.test.tsx` that the back link renders with `backHref` / `backLabel`, and that `renderBackLink` is used when given.
- [ ] Add the three props to the frame slots in `docs/archetypes/matrix-grid.md` (role-only: "back to the parent page", no Tailwind or primitive names; RULES rules 2-3), mirroring `docs/archetypes/kanban-board.md` v3.1.
- [ ] Bump the matrix-grid MANIFEST archetype version, ship as package patch release v0.29.1 (as the operator asked; controlling-app pins it) and add the `docs/PACKAGE.md` migration row.

## Acceptance

- `MatrixGridShell` renders the back link with the given `backHref` and `backLabel` in the page header, and uses `renderBackLink` when supplied.
- A matrix-grid page that passes none of the three props is unchanged: no back link, no other behaviour change.
- `PageShellFrameProps` is unchanged and `TakesEveryFrameSlot` stays green.
- `package.json` version is 0.29.1 and the MANIFEST matrix-grid version matches the contract.

## Related

- [[archetype-gap-shell-back-link-remaining]] — deferred matrix-grid until demand; this ticket is that demand
- [[archetype-gap-list-with-detail-back-link]] — origin of the Pick intersection pattern
- [[archetype-gap-matrix-grid-docked-inspector]] — previous matrix-grid release (v0.29.0)

## 2026-11-06 update

Scope decision (the operator's Recommended option, matches the on-demand precedent in [[archetype-gap-shell-back-link-remaining]]): matrix-grid only. The other still-unchanged shells (settings-table, calendar, analytics-dashboard, structure-builder) stay on demand.

Additions to What to do:

- [ ] Add a gallery demo (`src/examples/matrix-grid-demo.tsx`) showing the back link, per the living-demos convention for archetype variants.
- [ ] Add the CHANGELOG entry, following the v0.24.0/v0.25.0 back-link entries.
- [ ] After the new tag is pinned in controlling-app, move the hand-placed link out of `subtitle` in the planset editor page into `backHref` / `backLabel` (a controlling-app follow-up, not part of this ticket).
