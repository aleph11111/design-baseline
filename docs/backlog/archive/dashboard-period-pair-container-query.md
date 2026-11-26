---
area: archetypes
opened: 2026-11-17
status: done
value: normal
model: sonnet
model_reason: "class swap following the DetailOverviewShell @container pattern; cause established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-17T00:00:00Z
---

# DashboardPeriodPair splits on viewport width instead of container width

## Context

`DashboardPeriodPair` (`src/components/archetypes/analytics-dashboard/DashboardPeriodPair.tsx:91`) lays its two halves out with `grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-y-0`, which keys on viewport width. Since v0.51.0 a `DashboardGrid` widget is a card in a container-query grid, so the real width of the pair is the card, not the viewport: it splits into two columns too early, squeezing month and YTD halves in a narrow card. Same class as the primitives listed in [[viewport-breakpoints-container-query-audit]], which does not yet name this one.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names. Check other `sm:`/`md:`/`lg:` layout classes in `src/components/archetypes/analytics-dashboard/` (e.g. `Half`, `DashboardWidget`) for the same viewport keying.
- [ ] Make the pair's grid container-aware: add an `@container` ancestor that carries the consumer-visible layout (not a bare `@xl:` swap, which only works when some ancestor is a container) and swap `sm:grid-cols-2 sm:divide-x sm:divide-y-0` for the matching `@<size>:` variants, following the `@container` pattern in `src/components/archetypes/detail-overview/DetailOverviewShell.tsx` (per [[detail-overview-rail-switch-container-query]]) and the `StatTileRow` conversion in the audit ticket.
- [ ] Add a demo or test case rendering the pair in a narrow container wider than the `sm` viewport breakpoint, and bump the package version per `docs/RULES.md`.

## Acceptance

- A `DashboardPeriodPair` inside a card narrower than the container breakpoint renders month and YTD stacked with `divide-y`, even when the viewport is wider than 640px.
- Above the container breakpoint it renders two columns with `divide-x`, unchanged from today.
- No other analytics-dashboard primitive keys its layout on viewport `sm:`/`md:`/`lg:` where it is rendered inside a container-query grid.

## Related

- [[viewport-breakpoints-container-query-audit]]
- [[detail-overview-rail-switch-container-query]]
- [[archetype-gap-dashboard-paired-period-tiles]]
