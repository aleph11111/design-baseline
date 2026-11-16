---
area: archetypes
opened: 2026-11-16
status: ready
value: normal
depends_on: [detail-overview-rail-switch-container-query]
model: sonnet
model_reason: "pure class swaps mirroring an existing container-query pattern; cause established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-16T00:00:00Z
---

# Viewport breakpoints in layout primitives should be container queries

## Context

Follow-up split from [[detail-overview-rail-switch-container-query]], which converts only `DetailOverviewShell` to `@container` / `@4xl:`. These primitives still key layout on the viewport `sm:` / `md:` / `lg:` instead of their own container width, so inside `AppShell` (256px sidebar) they switch too early. Sites on trunk, all under `src/components/`:

- `layout/StatTileRow.tsx:7-9,58` — `sm:grid-cols-*`, `sm:divide-x`
- `archetypes/detail-overview/KeyValueRow.tsx:142,213-218` — `md:flex-row`, `md:justify-end`, `md:text-right`
- `archetypes/list-with-detail/presentations/CardGridBody.tsx:49` — `sm:grid-cols-2 lg:grid-cols-3`
- `archetypes/analytics-dashboard/DashboardGrid.tsx:27` — `sm:grid-cols-2 lg:grid-cols-3`
- `archetypes/structure-builder/StructureBuilderShell.tsx:169-173` — `lg:grid-cols-3`, `lg:col-span-2`, `lg:border-l`
- `archetypes/settings-table/SettingsTableShell.tsx:696` — edit pane `md:block md:w-1/2 md:border-l`
- `layout/SectionNav.tsx:71-72` — `md:flex-row`, `md:w-64`, `md:border-r`

`AppShell.tsx` (`@container/db-desk`) and `FeedShell.tsx` already ship the container-query pattern.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Convert each listed primitive to a `@container` wrapper plus `@<size>:` / `@max-<size>:` variants, mirroring `DetailOverviewShell` as converted by the parent ticket. Class change only, no new prop (per ADR-0004).
- [ ] Where a listed switch is intentionally viewport-level (for example full-page chrome rather than content width), leave it and say why in a one-line code comment instead of converting.
- [ ] Add a gallery demo of the detail-overview rail in a ~780px container and confirm with `npm run check:viewports` that KPI tiles are not clipped and the line-items table is not pushed off-screen (skip if the parent ticket already shipped the same demo).
- [ ] Bump `package.json` version and add the `CHANGELOG.md` entry (`scripts/verify-package-version.mjs` fails `npm test` on a bump without one).

## Acceptance

- In a ~780px content column every listed primitive renders its narrow layout (`StatTileRow` stacked, `KeyValueRow` stacked, `CardGridBody` and `DashboardGrid` at fewer columns, `SectionNav` stacked), and in a wide column the layout is unchanged.
- No other viewport `sm:` / `md:` / `lg:` layout variant remains in the listed files except those carrying an explicit viewport-level comment.
- `npm run check:viewports` passes at the device triad, shows KPI tiles unclipped, and the line-items table is not pushed off-screen.

## Related

- [[detail-overview-rail-switch-container-query]] — must ship first: it establishes the `@container` / `@4xl:` pattern and the ~780px demo this ticket mirrors
- [[heading-row-actions-squeeze-title-container-query]] — same viewport-vs-content-width defect in `HeadingRow`
- [[device-triad-check-viewports]] — the `check:viewports` device triad
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — fixed in the component, no appearance prop
