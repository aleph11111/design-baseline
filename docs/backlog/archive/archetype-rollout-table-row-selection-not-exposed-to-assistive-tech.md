---
area: archetype-rollout
opened: '2026-10-01'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-10-01T16:52:31.876Z'
---

# Table rows hide selection and cell semantics from assistive tech

## Context

In `presentation="table"` the identifier cell gets `role="button"` via `identifierCell` / `getInteractiveRowProps` ([src/components/archetypes/shared/tableColumn.ts](/src/components/archetypes/shared/tableColumn.ts), [src/components/archetypes/shared/interactiveRow.ts](/src/components/archetypes/shared/interactiveRow.ts)). Putting `role="button"` on a `<td>` removes its cell role, so a screen reader no longer announces it as a cell in its row and column. Across all three presentations the selected row is shown only by `data-state="selected"` and a visual ring or tint ([src/components/archetypes/list-with-detail/presentations/](/src/components/archetypes/list-with-detail/presentations/)). Nothing tells assistive tech which row is open in the detail panel, so colour alone carries that meaning. The actions column header is also an empty `<TableHead className="w-12" />` with no accessible name.

## What to do

- [ ] A screen-reader user can tell which row is selected in every presentation (table, card-grid, action-row).
- [ ] The identifier cell stays a table cell for assistive tech while remaining keyboard-operable (Enter/Space opens the row).
- [ ] The row-actions column header has an accessible name, visually hidden, taken from `labels.rowActions`.

## Acceptance

- The selected row exposes a selected or pressed state in the accessibility tree.
- The identifier cell is still announced inside its row and column.
- The actions column header shows no visible text and has a non-empty accessible name.
- Tab then Enter on the identifier cell still calls `onRowSelect`.

## Related

- [src/components/archetypes/list-with-detail/presentations/TableBody.tsx](/src/components/archetypes/list-with-detail/presentations/TableBody.tsx)
