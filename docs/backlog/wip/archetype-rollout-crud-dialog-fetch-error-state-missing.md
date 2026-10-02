---
area: archetype-rollout
opened: '2026-10-01'
status: needs-enrichment
gate:
  score: 4
  passed:
    - title
    - context
    - what_to_do
    - related
  failed:
    - acceptance: >-
        defect ticket — acceptance asserts only the reported instance, not the class of the problem
        (need: no other call site, every similar, any other, etc.)
  graded_at: '2026-10-01T16:45:44.325Z'
---

# CRUD dialog has no fetch-error state in shell or demo

## Context

Layer 7 of [docs/archetypes/crud-dialog.md](/docs/archetypes/crud-dialog.md) requires an "Error (fetch)" state: a compact inline-error box with a human-readable message when the entity load fails. [src/components/archetypes/crud-dialog/CrudDialogBody.tsx](/src/components/archetypes/crud-dialog/CrudDialogBody.tsx) offers only `isLoading` and children, and [src/examples/crud-dialog-demo.tsx](/src/examples/crud-dialog-demo.tsx) never shows a failed load. A user whose fetch fails sees an empty body or an endless skeleton with no way to retry, and every consumer invents its own error treatment.

## What to do

- [ ] Give the dialog body a designed fetch-error state that shows a human-readable message and a retry action in place of the fields, using the existing alert/state-view treatment.
- [ ] Add a gallery demo scenario where the entity load fails, so the state is visible.
- [ ] Keep the footer's primary action unavailable while the load error is shown.

## Acceptance

- A failed entity load shows an inline error message and a retry action instead of a blank or skeleton body.
- Activating retry shows the loading skeleton again.
- The gallery demo shows the error state without code changes.

## Related

- [docs/archetypes/crud-dialog.md](/docs/archetypes/crud-dialog.md)
- [src/components/archetypes/crud-dialog/CrudDialogBody.tsx](/src/components/archetypes/crud-dialog/CrudDialogBody.tsx)
