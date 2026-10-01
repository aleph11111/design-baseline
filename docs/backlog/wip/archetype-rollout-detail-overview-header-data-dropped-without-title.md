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
  graded_at: '2026-10-01T16:52:41.575Z'
---

# Detail shell silently drops badges and actions without a title

## Context

`DetailOverviewShell` takes `title`, `subtitle`, `badges` and `actions` as the Mode B nested header, but renders the header only when `title !== undefined` (see [src/components/archetypes/detail-overview/DetailOverviewShell.tsx](/src/components/archetypes/detail-overview/DetailOverviewShell.tsx)). A page that passes `badges` or `actions` and leaves `title` off gets no header at all: the entity's status badges (the archetype's one home for status) and its primary action vanish with no warning, and the type system allows it. The test "omits the framed header when no title is given" only covers the case where none of the four props is set.

## What to do

- [ ] When any of `subtitle`, `badges` or `actions` is passed without `title`, the page shows a visible, deliberate result instead of silently losing the data: either the types make that combination impossible, or the header renders the data.
- [ ] Keep the no-header output unchanged when none of the four header props is passed.
- [ ] Add a shell test for the `actions`-without-`title` case.

## Acceptance

- A caller passing `actions` without `title` either fails the typecheck or sees the actions rendered in the frame.
- With no header props, the frame renders no header, as today.
- The test suite has a case that fails if header data is passed and then disappears silently.

## Related

- [src/components/archetypes/detail-overview/DetailOverviewShell.tsx](/src/components/archetypes/detail-overview/DetailOverviewShell.tsx)
- [docs/archetypes/detail-overview.md](/docs/archetypes/detail-overview.md)
