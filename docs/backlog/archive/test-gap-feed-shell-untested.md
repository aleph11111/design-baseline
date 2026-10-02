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
  graded_at: '2026-10-01T19:39:13.279Z'
value: medium
---

# Add FeedShell tests for titled branch and empty override

## Context

`src/components/archetypes/feed-inbox/FeedShell.tsx` (62 lines, 5 commits in the last 90 days) is the container of the shipped feed-inbox archetype. It has no test. Its sibling `FeedItem.tsx` has `FeedItem.test.tsx`, and the other shells (Calendar, Report, Grouped-list, Matrix-grid) all have shell tests, so this is the odd one out.

Behavior worth pinning: `empty ?? children` (an `empty` node replaces the feed rows entirely), the toolbar row renders only when `filters` or `actions` is set, `actions` sits in an `ml-auto` wrapper, and `title === undefined` returns the bare `space-y-5` div while a title wraps the body in `SurfaceFrame` with `p-5 space-y-5`. A regression in the `title` check (e.g. `!title` swallowing an empty-string title) would change the whole surface chrome with no failing test.

## What to do

- Add `src/components/archetypes/feed-inbox/FeedShell.test.tsx`, matching the render style of [src/components/archetypes/grouped-list/GroupedListShell.test.tsx](/src/components/archetypes/grouped-list/GroupedListShell.test.tsx).
- Test that `empty` replaces `children` when both are given.
- Test that the toolbar row is absent with neither `filters` nor `actions`, and present with either.
- Test the titled branch renders the header (kicker, title, headerActions) and the untitled branch renders none.

## Acceptance

- `npm test` shows a FeedShell suite with the four cases above passing.
- Swapping `empty ?? children` for `children` makes the empty-override test fail.
- Changing the `title === undefined` check makes the titled/untitled test fail.

## Related

- [src/components/archetypes/feed-inbox/FeedShell.tsx](/src/components/archetypes/feed-inbox/FeedShell.tsx)
