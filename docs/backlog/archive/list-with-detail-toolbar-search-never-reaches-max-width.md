---
area: ui
opened: 2026-11-24
status: done
model: sonnet
model_reason: "cause established (non-growing wrapper), one-class fix plus a check following the existing check-joined-label pattern"
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-24T00:00:00Z
---

# ListWithDetailToolbar search input never reaches max width and truncates its placeholder

## Context

`ListWithDetailToolbar` (`src/components/archetypes/list-with-detail/ListWithDetailToolbar.tsx:34`) renders its search inside a `flex flex-wrap items-center gap-3` wrapper that does not grow in the `PageFrame` toolbar band. `SearchInput` (`src/components/ui/search-input.tsx:75`) is `relative max-w-sm flex-1` with an in-band `minWidth` floor of `14rem` (shipped by [[search-input-band-min-width]]). Because the wrapper is content-sized, the `flex-1` has no free space to grow into and the search box collapses to its 14rem floor (~240px), never reaching `max-w-sm` (24rem). Repro: controlling-app `/workspace/consolidation`, `searchPlaceholder` "Gruppen nach Name oder Währung suchen…" is cut to "Gruppen nach Name oder Wä" while the band is mostly empty. Affects every `list-with-detail` page with search.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `ListWithDetailToolbar.tsx`, make the wrapper `flex-1 min-w-0` so the search can grow to `max-w-sm` when the band has room (and still wraps/floors when crowded).
- [ ] Check the other `SearchInput` call sites for the same non-growing parent: `src/examples/kanban-board-demo.tsx:151` and `src/examples/settings-table-demo.tsx:204`; fix any that sit in a content-sized wrapper.
- [ ] Extend `scripts/check-joined-label.mjs` (or a sibling `check:*` script run in CI) with a real-Chrome assertion: in the list-with-detail demo at desk27 and laptop14 with an empty band, the search box measures its `max-w-sm` width (384px), not the 14rem floor.
- [ ] Bump `package.json` patch version and add a `CHANGELOG.md` entry (consumer note: controlling-app search placeholders no longer clip).

## Acceptance

- The `ListWithDetailToolbar` search box measures 384px (`max-w-sm`) at desk27 and laptop14 when the band has room, and the long placeholder shows in full.
- In a crowded band the search still holds its 14rem floor and the band scrolls rather than clipping, unchanged from [[search-input-band-min-width]].
- No other `SearchInput` call site sits in a non-growing wrapper: the new check fails if any list-with-detail toolbar search stays at the floor width while free band space exists.

## Related

- [[search-input-band-min-width]] — introduced the 14rem floor this bug exposes
- [[joined-label-shrinks-before-value]] — precedent for the real-Chrome band check
- [[pageframe-toolbar-overflow-collapse-rule]] — band overflow rule the fix must keep
