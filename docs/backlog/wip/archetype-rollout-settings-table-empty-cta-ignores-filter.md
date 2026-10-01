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
  graded_at: '2026-10-01T16:44:26.164Z'
---

# Settings-table empty state offers Add even when a filter caused it

## Context

Layer 7 of [docs/archetypes/settings-table.md](/docs/archetypes/settings-table.md) says the "Add {entity}" call to action belongs only to the "no items at all" empty state; a search that matches nothing shows "No {things} match {query}." without it. The shell ([src/components/archetypes/settings-table/SettingsTableShell.tsx](/src/components/archetypes/settings-table/SettingsTableShell.tsx)) renders the CTA whenever `onAddNew` is set, with no way to know the empty state came from a filter, so a user who mistyped a search is invited to create a duplicate record. Conversely the gallery demo's main table never passes `onAddNew` (its Add button lives in `headerActions`), so a truly empty list of recipes shows no CTA at all.

## What to do

- [ ] When rows are empty because a search or filter is active, the empty state shows the "no match" message and no create button.
- [ ] When the list is truly empty, the empty state shows the "Add {entity}" button, which opens the same add flow as the header action.
- [ ] The demo's empty and filtered-empty states both demonstrate the correct behaviour.

## Acceptance

- Searching "zzz" in the demo shows `No recipes match "zzz".` and no Add button in the body.
- Deleting every recipe shows "No recipes yet." with an Add recipe button that opens the add flow.

## Related

- [src/examples/settings-table-demo.tsx](/src/examples/settings-table-demo.tsx)
- [[archetype-rollout-settings-table-bulk-selection-outlives-filter]]
