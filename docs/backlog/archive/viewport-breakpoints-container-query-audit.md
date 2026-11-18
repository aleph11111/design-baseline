---
area: archetypes
opened: 2026-11-16
status: done
value: normal
model: sonnet
model_reason: "class swaps plus wrappers following the DetailOverviewShell @container pattern; per-primitive verdicts already established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-16T00:00:00Z
---

# Primitives key layout on viewport width instead of container width

## Context

`DetailOverviewShell` (`src/components/archetypes/detail-overview/DetailOverviewShell.tsx`) now switches its rail on its own container (`@container`, `@4xl`). Inside `AppShell` (256px sidebar) the real column is much narrower than the viewport, so these primitives still switch layout too early because they key on viewport `sm:`/`md:`/`lg:`:

- `src/components/layout/StatTileRow.tsx` — `sm:grid-cols-*`, `sm:divide-x`. Needs a `@container` wrapper that forwards the consumer `className` to the element the parent lays out. A bare `@xl:` swap only works when an ancestor is a container (AppShell main, DetailOverviewShell are), so a standalone consumer would stay single-column. A trial wrapper that left `className` on the inner element was rejected in review of PR 777.
- `src/components/archetypes/detail-overview/KeyValueRow.tsx` — `md:flex-row`, `md:text-right`. It lives in the fixed 300px rail, so label/value side by side keys on viewport, not on rail width. Decide stack vs row at rail width.
- `src/components/archetypes/list-with-detail/presentations/CardGridBody.tsx` — `sm:grid-cols-2 lg:grid-cols-3`.
- `src/components/archetypes/analytics-dashboard/DashboardGrid.tsx` — `sm:grid-cols-2 lg:grid-cols-3`.
- `src/components/archetypes/structure-builder/StructureBuilderShell.tsx` — `lg:grid-cols-3`, `lg:col-span-2`, aside `lg:border-l`.
- `src/components/archetypes/settings-table/SettingsTableShell.tsx` — edit pane `md:block md:border-l`.
- `src/components/layout/SectionNav.tsx` — `md:flex-row md:w-64`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] For each primitive above, put `@container` on a wrapper (forwarding `className` to the wrapper) and swap the layout `sm:`/`md:`/`lg:` variants for `@<size>:` variants, class-only with no new prop (per ADR-0004).
- [ ] Pin the container-query classes in each primitive's test, and state the `@xl`-style threshold change in the `CHANGELOG.md` entry, since every consumer of an exported layout primitive sees it.
- [ ] Add a gallery case at ~780px for the primitives that appear in `AppShell` pages and confirm with `npm run check:viewports` that no tile or table is clipped.

## Acceptance

- In a ~780px column each converted primitive shows its narrow layout, and in a wide column it shows the unchanged wide layout.
- No other layout `sm:`/`md:`/`lg:` viewport variant remains on any of the primitives listed in Context, and every similar viewport-keyed layout primitive found by the same grep is converted or has its own ticket.
- A consumer passing a layout class (`lg:col-span-2`, `h-full`) to a converted primitive still sees it applied to the element the parent lays out.

## Related

- [[detail-overview-rail-switch-container-query]] — converted `DetailOverviewShell`; this is the split-off audit
- [[heading-row-actions-squeeze-title-container-query]] — same viewport-vs-content defect in `HeadingRow`
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — fixed in the component, no appearance prop

## Shipped (v0.52.0, PR 800)

- Seven primitives converted; `DashboardWidget` spans follow the grid. Class pins: `StatTileRow.test.tsx`, `src/components/layout/container-query-pins.test.tsx`, `SettingsTableShell.test.tsx`, `KeyValueRow.test.tsx`.
- ~780px evidence: a new `check:viewports` case asserts, in real Chrome, the analytics-dashboard KPI strip and widget grid are 1 column at the 1133px window (~780px column) and 4 / 3 columns on laptop14. Every former `sm`/`md`/`lg` switch now fires at `@4xl` (896px); `KeyValueRow` at `@sm` (rail stacks).
- Same-grep leftovers have their own tickets: [[dashboard-period-pair-container-query]], [[dashboard-assignment-list-container-query]], [[crud-dialog-body-two-column-container-query]].
- `SettingsTableShell` edit pane converted with the demo's dialog following the same container width (pinned in `SettingsTableShell.test.tsx`; `check:viewports` asserts the pane is absent in the ~780px column and shown in the wide one). The shared `hideBelow` column tiers stay viewport-keyed: [[settings-table-edit-surface-container-query]].
