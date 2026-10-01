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
  graded_at: '2026-10-01T16:40:50.216Z'
---

# Form page demo never warns before discarding edits

## Context

The form-page contract (Layer 13) requires a dirty-guarded Cancel: leaving a form with unsaved edits asks the user to confirm. The gallery reference [src/examples/form-page-demo.tsx](/src/examples/form-page-demo.tsx) writes every field with `form.setValue(name, value)` without marking the field dirty, so `formState.isDirty` stays false and `useFormPageState.requestDiscard` resolves immediately. Demo flow 3 ("edit a field, click Cancel → confirm-discard prompt") therefore never prompts, and the reference teaches consumers a wiring that silently loses their users' typing.

## What to do

- [ ] After a user changes any field in the demo (create or edit mode), Cancel asks for confirmation before leaving.
- [ ] An untouched form still cancels without a prompt, and a form edited back to its original values no longer counts as changed.
- [ ] Field edits also revalidate, so a field error shown after a failed submit clears when the user fixes the value.

## Acceptance

- Editing the Title in edit mode and pressing Cancel shows the discard confirmation.
- Pressing Cancel on an untouched form returns to the list with no prompt.
- After a failed submit, correcting an invalid Tag removes its error message without resubmitting.

## Related

- [src/components/archetypes/form-page/useFormPageState.ts](/src/components/archetypes/form-page/useFormPageState.ts)
- [docs/archetypes/form-page.md](/docs/archetypes/form-page.md)
