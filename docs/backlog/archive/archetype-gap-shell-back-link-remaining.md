---
area: archetypes
opened: 2026-11-05
status: done
value: normal
model: sonnet
model_reason: "pattern-following additive prop per shell, grounded in the list-with-detail Pick intersection and detail-overview/form-page"
depends_on: [archetype-gap-list-with-detail-back-link]
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-05T00:00:00Z
---

# Archetype gap: remaining full-frame shells have no back-link slot

## Context

The nine other full-frame shells built on `PageShellFrameProps` (`src/components/layout/PageFrame.tsx`) omit `backHref`, `backLabel` and `renderBackLink`, so a consumer page under a parent route that renders one of them drops its back link. The list-with-detail gap fixed `ListWithDetailShellProps` by intersecting `Pick<PageFrameProps, 'backHref' | 'backLabel' | 'renderBackLink'>` onto `PageShellFrameProps` (contract v4.4, MANIFEST 4.7, package v0.24.0) and kept `PageShellFrameProps` itself unchanged so the `TakesEveryFrameSlot` gate in `src/components/archetypes/page-shell-frame-slots.test.tsx` stays green. Affected shells: `SettingsTableShellProps` (`settings-table/SettingsTableShell.tsx:241`, `Omit<PageShellFrameProps,'count'>`), `GroupedListShellProps` (`grouped-list/GroupedListShell.tsx:11`), `MatrixGridShellProps` (`matrix-grid/MatrixGridShell.tsx:76`), `CalendarShellProps` (`calendar/CalendarShell.tsx:57`), `DashboardShellProps` (`analytics-dashboard/DashboardShell.tsx:9`), `BoardShellProps` (`kanban-board/BoardShell.tsx:6`), `StatementWithFiltersShellProps` (`statement-with-filters/StatementWithFiltersShell.tsx:6`), `FeedShellProps` (`feed-inbox/FeedShell.tsx:35`, plus `FeedMasterDetailShellProps` at line 71) and `StructureBuilderShellProps` (`structure-builder/StructureBuilderShell.tsx:15`, `Omit<PageShellFrameProps,'viewSwitch'>`). Realistic back-link cases are the list/table-style pages: grouped-list, feed-inbox, kanban-board, statement-with-filters. settings-table, calendar, analytics-dashboard and structure-builder usually sit at a top-level route with no parent. Motivating case: hk-sales-agent list pages under a parent route.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Per shell, add the same `Pick<PageFrameProps, 'backHref' | 'backLabel' | 'renderBackLink'>` intersection to the props type and forward the three props to `<PageFrame>`, for the four realistic shells: `GroupedListShell`, `FeedShell` (and `FeedMasterDetailShell`), `BoardShell`, `StatementWithFiltersShell` (pattern from list-with-detail, `detail-overview` and `form-page`: three existing call sites).
- [ ] Do NOT widen `PageShellFrameProps` itself: every full-frame shell would have to take the props and `TakesEveryFrameSlot` would break.
- [ ] Leave settings-table, matrix-grid, calendar, analytics-dashboard and structure-builder unchanged until a consumer page under a parent needs one; add the same `Pick` there on that demand.
- [ ] Per touched shell: update `docs/archetypes/<slug>.md` (allowed variation, "back to the parent page", role-only per RULES rule 2/3), add a shell test for link and `renderBackLink`, give the variant a visible gallery demo, bump the MANIFEST archetype version and package version, and add a `docs/PACKAGE.md` migration row.

## Acceptance

- Each of the four shells with `backHref="/parent"` renders the back link in the page header; without it no link renders (unchanged).
- With `renderBackLink`, each shell renders the injected element instead of the plain anchor.
- `PageShellFrameProps` is unchanged and `npx tsc --noEmit` and `npm test` pass, so the `TakesEveryFrameSlot` gate stays green for every shell.
- No other full-frame shell that gained the props lacks its contract note, test and demo.

## Related

- [[archetype-gap-list-with-detail-back-link]] — must ship first: it establishes the per-shell `Pick` pattern and the version bump this ticket builds on, in the same slot-gate test file
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement
