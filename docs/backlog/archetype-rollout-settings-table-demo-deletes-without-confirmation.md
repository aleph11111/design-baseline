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
  graded_at: '2026-10-01T16:52:50.939Z'
---

# Settings-table demo deletes records without any confirmation

## Context

Layer 10 of [docs/archetypes/settings-table.md](/docs/archetypes/settings-table.md) requires every destructive action to open the shared confirmation dialog ("Delete {entity}?", "This action cannot be undone.", destructive confirm) and forbids bypassing it. The gallery demo [src/examples/settings-table-demo.tsx](/src/examples/settings-table-demo.tsx) removes a recipe immediately from the row menu's "Delete" and removes every selected recipe immediately from "Delete selected". An inline comment says the dialog is skipped because the crud-dialog archetype is "not promoted yet", but [src/components/ui/confirmation-dialog.tsx](/src/components/ui/confirmation-dialog.tsx) exists. The gallery is the reference consumers copy, so the unguarded delete propagates.

## What to do

- [ ] Choosing Delete on a row, or Delete selected in bulk mode, shows a confirmation dialog that names the entity and the number of records being removed; nothing is removed until the user confirms.
- [ ] Cancelling the dialog leaves rows and the current selection untouched.
- [ ] Remove the stale "not promoted yet" comment so the demo documents the real behaviour.

## Acceptance

- After clicking Delete in a row menu, the recipe is still listed until the dialog is confirmed.
- After Delete selected with 3 rows ticked, the dialog states 3 recipes will be deleted; Cancel keeps all 3 listed and ticked.
- The demo source no longer says the confirmation primitive is unavailable.

## Related

- [src/examples/settings-table-demo.tsx](/src/examples/settings-table-demo.tsx)
- [[archetype-rollout-settings-table-contract-version-stale]]
