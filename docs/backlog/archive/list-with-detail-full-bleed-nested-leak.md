---
area: layout
opened: '2026-09-28'
status: done
value: high
model: opus
model_reason: "the scoping mechanism (surface context vs page-root match) is a design choice across four full-bleed shells"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T18:00:00Z'
---

# Full-bleed marker leaks from a list nested in a detail page

## Context

`ListWithDetailShell` (`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx:286`) puts `FULL_BLEED_CLASS` (`db-full-bleed`, `src/components/layout/surface.ts:17`) on every instance unless `ListChromeContext` marks it chromeless. `AppShell`'s content column (`src/components/layout/AppShell.tsx:44`) drops its max width with `has-[.db-full-bleed]:max-w-none`, and `:has()` matches at any depth. A detail page that embeds a list, such as a `DetailOverviewShell` content section rendering a `ListWithDetailShell`, therefore loses the `--db-content-max` column. ADR-0007 §1 says full-bleed is for the archetype "only as the page's own surface". mistra hit this and works around it with its own `EmbeddedListContext`. `CalendarShell` (`src/components/archetypes/calendar/CalendarShell.tsx:129`) sets the same class unconditionally, so the leak is not unique to list-with-detail.

## What to do

- [x] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [x] Emit `FULL_BLEED_CLASS` only when the shell is the page's own surface: skip it when the shell renders inside another surface (`RaisedSurfaceContext` from `src/components/layout/surface.ts`, or `DetailOverviewShell`'s `UnifiedSurfaceContext`), in addition to the existing `ListChromeContext` check. Apply the same guard in every full-bleed shell (`list-with-detail`, `calendar`, and `matrix-grid` / `kanban-board` if they carry the class).
- [x] Add a test per shell: rendered inside a `DetailOverviewShell` / `SectionCard`, the shell root has no `db-full-bleed` class; rendered bare, it still does.
- [x] Bump the package patch version.

## Acceptance

- A `ListWithDetailShell` embedded in a `DetailOverviewShell` content section renders without `db-full-bleed`, and the detail page keeps its `--db-content-max` column.
- A page-root `ListWithDetailShell` still renders `db-full-bleed` (unchanged).
- No other full-bleed archetype shell emits `db-full-bleed` when nested inside another surface.

## Related

- [appshell-content-column-min-w-0.md](appshell-content-column-min-w-0.md) — the sibling AppShell content-column fix from the same mistra report
- [ADR-0007](../../adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — §1, full-bleed as a closed, archetype-derived set

## Decision

**Question:** How should "page's own surface" be detected?

**Answer (operator, 2026-09-28):** Derive it from the existing surface contexts, with no new prop, and apply it to every full-bleed shell, `CalendarShell` included. Shipped in v0.2.18 as `useFullBleedClass()` in `src/components/layout/surface.ts`. It returns `FULL_BLEED_CLASS` unless the shell sits inside a `RaisedSurfaceContext` provider (`SurfaceFrame`, `SectionCard`, `StatTileRow`). `DetailOverviewShell`'s unified frame is a `SurfaceFrame`, so `UnifiedSurfaceContext` is covered without a layout→archetype import. It is used by `ListWithDetailShell` (on top of its `ListChromeContext` check), `CalendarShell`, `BoardShell` (both branches) and `MatrixGridShell`. `src/components/layout/surface.test.tsx` covers each shell at page root, inside a `SectionCard`, and inside a `DetailOverviewShell`. The rejected alternatives were a donor `EmbeddedListContext`, and an AppShell direct-child selector that would break page-root shells wrapped with a `PageHeader`.
