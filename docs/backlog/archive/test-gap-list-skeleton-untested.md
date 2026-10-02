---
area: test-gap
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
  graded_at: '2026-10-01T19:39:13.281Z'
value: medium
---

# Add ListSkeleton tests for status semantics and grid layout

## Context

The skeleton-loader archetype's only component, `src/components/archetypes/skeleton-loader/ListSkeleton.tsx` (86 lines), has no test; the directory holds just `ListSkeleton.tsx` and `index.ts`. It is the loading state consumers drop into lists, so its accessibility contract matters: `role="status"`, `aria-busy="true"`, `aria-live="polite"`, and a screen-reader-only `label` (default "Loading…"). It also branches on `columns > 1` (grid template `1.6fr repeat(n-1, minmax(0, 1fr))` versus a single column), `showHeader` (header row versus one `h-5 w-40` bar) and `avatar`, and `rows` defaults to 5.

A regression that drops the status role or mis-counts rows would ship to every consumer as a silent a11y or layout break; no suite would catch it.

## What to do

- Add `src/components/archetypes/skeleton-loader/ListSkeleton.test.tsx` in the style of [src/components/archetypes/raw-input/native-field.test.tsx](/src/components/archetypes/raw-input/native-field.test.tsx).
- Assert the `status` role, `aria-busy`, and that the sr-only label renders (default and custom).
- Assert row count equals `rows` (default 5) and column cell count equals `columns` per row when `columns > 1`.
- Assert `showHeader` adds the header row in both single-column and grid modes, and `avatar` adds the avatar placeholder.

## Acceptance

- `npm test` shows a ListSkeleton suite covering role/label, row count, grid columns, header and avatar.
- Removing `role="status"` or `aria-busy` from the component makes a test fail.
- Changing the default `rows` from 5 makes a test fail.

## Related

- [src/components/archetypes/skeleton-loader/ListSkeleton.tsx](/src/components/archetypes/skeleton-loader/ListSkeleton.tsx)
