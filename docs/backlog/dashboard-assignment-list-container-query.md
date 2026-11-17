---
area: archetypes
opened: 2026-11-17
status: ready
value: low
model: sonnet
model_reason: "one class swap plus wrapper following the sibling container-query pattern; cause established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-17T00:00:00Z
---

# DashboardAssignmentList keys its columns on viewport instead of container width

## Context

`DashboardAssignmentList` (`src/components/archetypes/analytics-dashboard/DashboardAssignmentList.tsx:46`) lays out its checkbox list with `grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3`. These variants key on viewport width, but inside `AppShell` (256px sidebar) the real column is much narrower, so it switches to 2/3 columns too early. This is a leftover from the `viewport-breakpoints-container-query-audit` sweep (v0.51.0): the audit's Context lists `DashboardGrid.tsx` (same class string) but not this sibling in the same archetype directory.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Put `@container` on the element the `ul` sits in (or on the `ul`'s wrapper) and swap `sm:grid-cols-2 lg:grid-cols-3` for `@<size>:` variants, class-only with no new prop (per ADR-0004), using the same thresholds the `DashboardGrid` conversion picks so the two grids step together.
- [ ] Pin the container-query classes in a test and state the threshold change in the `CHANGELOG.md` entry, since every consumer of the exported primitive sees it.

## Acceptance

- In a ~780px column `DashboardAssignmentList` shows its narrow (fewer-column) layout, and in a wide column it shows the unchanged 3-column layout.
- No other layout `sm:`/`md:`/`lg:` viewport variant remains in `src/components/archetypes/analytics-dashboard/`, and every similar viewport-keyed layout primitive found by the same grep is converted or has its own ticket.

## Related

- [[viewport-breakpoints-container-query-audit]] — parent sweep; same conversion, this primitive was missed
- [[detail-overview-rail-switch-container-query]]
- [[heading-row-actions-squeeze-title-container-query]]
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance locality
