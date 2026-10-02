---
area: code-health
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
  graded_at: '2026-10-01T15:47:02.114Z'
value: low
model: sonnet
model_reason: mechanical — one constant or returned field in fieldFrame replacing five identical literals
---

# Move the field error-ring class into fieldFrame

## Context

[src/components/archetypes/shared/fieldFrame.tsx](/src/components/archetypes/shared/fieldFrame.tsx) was extracted because the labeled-field frame had been hand-rolled five times and the copies had drifted, as its header comment says. The extraction took the ids, the label, the hint and the error text. It left out the control's invalid styling, which is still pasted as the same literal in the same five fields:

- `src/components/ui/file-field.tsx:112`: `const errorRing = error && "border-destructive focus-visible:ring-destructive";`
- `src/components/ui/color-field.tsx:77`: the same line.
- `src/components/archetypes/raw-input/native-field.tsx:189`: the same line.
- `src/components/archetypes/raw-select/select-field.tsx:120`: the same literal, inline.
- `src/components/archetypes/raw-textarea/TextareaField.tsx:135`: the same literal, inline.

`useFieldIds()` already derives `aria-invalid` from `error`. So the frame decides *that* a field is invalid, while each field still decides *how* an invalid field looks. Changing the invalid treatment means five edits, and missing one reproduces the split that [[refactor-identifier-cell-column-config-duplication]] had to repair. All five files already import from `fieldFrame`, so this adds no new import edge.

If this finding is wrong, the fields are meant to diverge on purpose. None of their JSDoc says so.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Export one `FIELD_ERROR_RING` constant from `fieldFrame.tsx`, or have `useFieldIds()` return an `errorClass` next to `aria-invalid`.
- [ ] Replace the five literals with it.

## Acceptance

- No other file under `src/components` contains `border-destructive focus-visible:ring-destructive`; only `fieldFrame.tsx` does.
- All five fields render the same invalid classes as before, and `npm test` passes unchanged.

## Related

- [src/components/archetypes/shared/fieldFrame.tsx](/src/components/archetypes/shared/fieldFrame.tsx): the shared frame that should own the class.
- [[code-health-list-state-view-triplicated]]: the same pattern (frame shared, last mile copied) in the list shells.
