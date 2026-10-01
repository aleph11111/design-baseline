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
  graded_at: '2026-10-01T16:38:48.059Z'
---

# Desktop detail rail drops the detail title and actions

## Context

`ListWithDetailShell` accepts `detailTitle` and `detailActions` ("data, not appearance", Layer 6 of the contract). On mobile they render in the Sheet's header bar. On desktop the rail is just `<div className="w-80 shrink-0 border-l">{detail}</div>` in [src/components/archetypes/list-with-detail/ListWithDetailShell.tsx](/src/components/archetypes/list-with-detail/ListWithDetailShell.tsx), so both props are silently ignored. In the gallery demo ([src/examples/list-with-detail-demo.tsx](/src/examples/list-with-detail-demo.tsx)) the selected show's title and its "Edit" button appear in the mobile Sheet but never on desktop, where the user sees an untitled panel and has no way to edit. The desktop rail is the common case, so the primary detail action is missing for most users.

## What to do

- [ ] On desktop, the detail rail shows the `detailTitle` and `detailActions` in the same header bar the mobile Sheet uses, whenever `detailTitle` is provided.
- [ ] When `detailTitle` is omitted, the rail shows only `detail`, as today.
- [ ] Add a shell test covering the desktop viewport with `detailTitle` and `detailActions` set.

## Acceptance

- At a desktop width, selecting a row in the demo shows the row's title and the "Edit" button above the detail body.
- With `detailTitle` unset, the desktop rail no longer differs from today's output.
- The test suite contains a desktop-viewport case that fails if the rail drops either prop.

## Related

- [src/components/archetypes/list-with-detail/ListWithDetailShell.tsx](/src/components/archetypes/list-with-detail/ListWithDetailShell.tsx)
- [docs/archetypes/list-with-detail.md](/docs/archetypes/list-with-detail.md)
