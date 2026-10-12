---
area: layout
opened: 2026-10-09
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-09T00:00:00Z
---

# Joined NativeField label ignores the 130px filter-sheet column

## Context

In the `PageFrame` mobile filter sheet (`src/components/layout/PageFrame.tsx`), a joined `NativeField` row (`src/components/archetypes/raw-input/native-field.tsx`) renders its `data-joined-label` full-width (382px at 430px viewport) instead of the fixed 130px column that selects and segmented controls get. The sheet's `[&_:is(div,form,fieldset).flex]:flex-col` and `[&_:is(div,form,fieldset).flex>*]:w-full!` rules match the NativeField's own `div.flex` label+input row and stack it. Found by `scripts/check-joined-label.mjs`, which currently skips native rows in the sheet.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Keep the NativeField joined row (`div.flex` in `native-field.tsx`) out of the sheet's stacking rules (e.g. a `data-` marker the `:is(div).flex` selectors exclude) so the label takes the 130px column.
- [ ] Drop the native-row skip in `scripts/check-joined-label.mjs`.

## Acceptance

- At 430px every row in the filter sheet, including a joined `NativeField`, shows a `data-joined-label` of exactly 130px.
- No other joined-label row kind in the sheet is stacked by the nested-flex rules.
- `npm run check:joined-label` passes without skipping native rows.

## Related

- [[joined-label-shrinks-before-value]] — introduced the check that found this.
- [[pageframe-filter-sheet-stacks-nested-fields]] — owns the nested-flex stacking rules.
