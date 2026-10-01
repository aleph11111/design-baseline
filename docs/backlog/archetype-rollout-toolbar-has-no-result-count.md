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
  graded_at: '2026-10-01T16:38:48.071Z'
---

# List toolbar never shows the required result count

## Context

Layer 4 of the contract requires a result count in the toolbar ("`{n} results`", muted, near the action buttons). `ListWithDetailToolbar` ([src/components/archetypes/list-with-detail/ListWithDetailToolbar.tsx](/src/components/archetypes/list-with-detail/ListWithDetailToolbar.tsx)) has no count prop, and the gallery demo toolbar ([src/examples/list-with-detail-demo.tsx](/src/examples/list-with-detail-demo.tsx)) renders none. The shared `SearchInput` already has a `count` slot that the toolbar does not wire. A user who types a query cannot tell how many rows matched, and an empty filter looks like a broken list until they read the empty panel.

## What to do

- [ ] The toolbar shows the number of rows currently listed, labelled as results, whenever a search value is present.
- [ ] The figure comes from the length of the rows after search and filters are applied, not from the unfiltered total, and its label says "results", not "total".
- [ ] The count text is overridable like the shell's other copy, so non-English apps can localise it.
- [ ] The demo toolbar shows the count in all three presentations.

## Acceptance

- In the demo, typing a query that matches two shows displays "2 results"; clearing it displays the full filtered-list count.
- A query with no matches displays "0 results" alongside the filtered-empty panel.
- The count uses the same muted small-text style as other toolbar captions.

## Related

- [src/components/archetypes/list-with-detail/ListWithDetailToolbar.tsx](/src/components/archetypes/list-with-detail/ListWithDetailToolbar.tsx)
- [docs/archetypes/list-with-detail.md](/docs/archetypes/list-with-detail.md)
