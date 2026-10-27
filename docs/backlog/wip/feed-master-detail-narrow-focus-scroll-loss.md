---
area: archetypes
opened: 2026-10-19
status: ready
value: normal
model: sonnet
model_reason: "scoped fix in one shell with clear acceptance; mechanism established from FeedShell.tsx"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-19T00:00:00Z
---

# FeedMasterDetailShell loses focus and scroll position on narrow surfaces

## Context

`FeedMasterDetailShell` in `src/components/archetypes/feed-inbox/FeedShell.tsx` (v0.14.0) shows one column below `@3xl`: the list gets `@max-3xl:hidden` when an item is selected, and the detail pane renders a `Back` button wired to `onBack`. Raised by the /ship review gate on PR #598. Repro on a phone-width surface with a long list:

1. Tap an item far down the list. The list hides but page scroll is not reset, so the short detail pane and its Back button can sit above the viewport.
2. Press Back. The Back button unmounts and focus drops to `body`.
3. After Back the list does not return to its previous scroll position.

Impact: brickshop `/messages` and `/activity` mobile users once they migrate (parent brickshop ticket `archetype-rollout-retire-local-feed-settings-shells`).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] On select (narrow branch), scroll the detail pane into view (or to top) so the Back button is visible.
- [ ] On Back, return focus to the previously selected row and restore the list's scroll position.
- [ ] Add tests in `src/components/archetypes/feed-inbox/FeedShell.test.tsx` for focus return on Back.

## Acceptance

- After selecting an item on a narrow surface, the detail pane and its Back button are in the viewport.
- After Back on a narrow surface, focus is on the previously selected row, not `body`.
- After Back, the list scroll position matches its position before selection.
- No other narrow-surface selection path in `FeedShell.tsx` drops focus or scroll; every select/back transition is covered.
- Wide surface (`@3xl`+) behaviour is unchanged.

## Related

- [[feed-inbox-master-detail-layout]] — introduced the master-detail form
- [[test-gap-feed-shell-untested]] — existing FeedShell test coverage
- [[appshell-scroll-model-window-vs-main]] — page scroll model that decides what must be reset
