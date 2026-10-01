---
area: archetype-rollout
opened: '2026-10-01'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-10-01T16:44:26.162Z'
---

# Settings-table bulk selection includes rows hidden by the filter

## Context

In [src/examples/settings-table-demo.tsx](/src/examples/settings-table-demo.tsx) `selectedIds` is kept when the search query changes. Tick rows, type a query that hides some of them, and the toolbar still reads "{n} selected" with n counting rows the user cannot see; "Delete selected" then removes those invisible records. The shell ([src/components/archetypes/settings-table/SettingsTableShell.tsx](/src/components/archetypes/settings-table/SettingsTableShell.tsx)) also gives every row checkbox the same accessible name "Select row", so a screen-reader user cannot tell which record a checkbox belongs to. Both affect a bulk-destructive path on a configuration list.

## What to do

- [ ] The selected-count caption and any bulk action only ever refer to rows currently visible in the table; rows hidden by a search or filter are dropped from the selection.
- [ ] Each row checkbox is announced with the row's own identifier (e.g. "Select Pasta Carbonara"), while the localisable default stays overridable through `labels`.
- [ ] The demo shows the corrected behaviour after typing a query with rows ticked.

## Acceptance

- With 3 rows ticked, typing a query matching 1 of them shows "1 selected".
- Delete selected after filtering affects only visible ticked rows.
- Each row checkbox exposes an accessible name containing that row's name.

## Related

- [src/components/archetypes/settings-table/SettingsTableShell.tsx](/src/components/archetypes/settings-table/SettingsTableShell.tsx)
- [[archetype-rollout-settings-table-demo-deletes-without-confirmation]]
