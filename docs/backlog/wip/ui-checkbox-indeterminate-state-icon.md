---
area: ui
opened: '2026-11-20'
status: ready
value: normal
model: sonnet
model_reason: "single-primitive fix with an established cause and a clear CSS-state mechanism"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-20T00:00:00Z
---

# ui/checkbox renders indeterminate state as a check mark

## Context

`src/components/ui/checkbox.tsx` always renders the lucide `Check` icon inside `CheckboxPrimitive.Indicator`, and Radix mounts the Indicator for `checked="indeterminate"` as well as `true`. A bulk select-all header with some rows ticked therefore looks identical to all-selected. Both shipped callers already pass `"indeterminate"`: `src/components/archetypes/settings-table/SettingsTableShell.tsx:432` and `src/components/archetypes/list-with-detail/presentations/TableBody.tsx:112`. Repro: gallery `#/a/list-with-detail`, the "Production budget" section (2 of 25 rows ticked, visible at 390px): the header checkbox shows a check mark instead of a dash.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `src/components/ui/checkbox.tsx`, render a lucide `Minus` icon instead of `Check` when the root's `data-state` is `indeterminate` (put `group` on the root and switch the two icons with `group-data-[state=indeterminate]:` variants, so no caller changes).
- [ ] Add a vitest case for `Checkbox` covering `checked={true}`, `checked="indeterminate"` and `checked={false}`.
- [ ] Re-baseline the affected pixel screenshots (`npm run screenshots:update`) if the list-with-detail or settings-table demo baselines change, and review the PNG diff.

## Acceptance

- The `Checkbox` header in the gallery "Production budget" section shows a minus icon, not a check mark, while 2 of 25 rows are ticked.
- Selecting all rows shows the check mark, and clearing the selection shows an empty box, unchanged from today.
- No other `Checkbox` call site (every `checked="indeterminate"` use, including settings-table and list-with-detail bulk headers) still shows a check mark in the indeterminate state.
- The component test asserts the Minus icon is the one displayed for `checked="indeterminate"`.

## Related

- [[archetype-rollout-table-row-selection-not-exposed-to-assistive-tech]]
- [[archetype-rollout-settings-table-bulk-selection-outlives-filter]]
- [[archetype-gap-list-with-detail-bulk-stepping-summary]]
