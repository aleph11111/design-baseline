---
area: layout
opened: '2026-11-24'
status: done
value: high
model: sonnet
model_reason: "cause established (context scoping gap), fix follows the existing useFullBleedClass pattern with one shared hook"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-11-24T00:00:00Z'
---

# Nested full-bleed archetype shell widens the whole page column

## Context

`AppShell`'s content column (`src/components/layout/AppShell.tsx:82`) uses `has-[.db-full-bleed]:max-w-none`, so any descendant carrying `FULL_BLEED_CLASS` drops the max width for the whole page. `useFullBleedClass` (`src/components/layout/surface.ts:36`) only suppresses the marker when `RaisedSurfaceContext` is true. `PageFrame`'s non-raised canvas body (`src/components/layout/PageFrame.tsx:274`) deliberately sets it to `false`, so a `MatrixGridShell` (`src/components/archetypes/matrix-grid/MatrixGridShell.tsx:128`) rendered inside a `DashboardShell` canvas emits `db-full-bleed` and the page jumps from centered to edge-to-edge. Repro: controlling-app Start page (`app/page.tsx`), Datenstand tab renders `SusaCoverage` → `MatrixGridShell` inside `DashboardShell`; Status/Performance tabs stay centered, Datenstand goes full width. This is the canvas-body twin of the archived nested-surface leak (ADR-0007 §1: full-bleed only as the page's own surface); `useDocumentColumnClass` (`surface.ts:51`) has the same hole.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Only the outermost page shell may set width mode: a shell already inside a `PageFrame` never emits `db-full-bleed`, regardless of raised-ness. Hoist the private `PageFrameContext` (`PageFrame.tsx:19`, provided at `:229` and `:272`) into `src/components/layout/surface.ts` (avoids a `PageFrame` ↔ `surface` import cycle) and make `useFullBleedClass` return `undefined` when it is true, in addition to the `RaisedSurfaceContext` check.
- [ ] Apply the same guard in `useDocumentColumnClass` so a nested document-column shell cannot bound the page column either.
- [ ] Confirm every page-root full-bleed shell (`matrix-grid`, `list-with-detail`, `kanban-board`, `calendar`, `statement-with-filters`) calls the hook outside any `PageFrame` provider, so the page's own shell still marks the column.
- [ ] Add a test in `src/components/layout/surface.test.tsx`: a full-bleed shell nested in a canvas (`body="stack"`) `PageFrame` / `DashboardShell` does not mark the column; bare at page root it still does.
- [ ] Bump the package patch version.

## Acceptance

- A `MatrixGridShell` rendered inside a `DashboardShell` canvas renders without `db-full-bleed`, and the page keeps its `--db-content-max` column.
- A page-root `MatrixGridShell` still renders `db-full-bleed` (unchanged).
- No other full-bleed or document-column archetype shell emits its width marker when nested inside a `PageFrame`, in either body mode.

## Related

- [[list-with-detail-full-bleed-nested-leak]] — shipped the `RaisedSurfaceContext` scoping this ticket completes for canvas bodies
- [[appshell-content-column-min-w-0]] — sibling AppShell content-column fix
- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — §1, full-bleed as a closed, archetype-derived set
- [ADR-0015](/docs/adr/0015-page-body-section-card-stack.md) — page body as frame or stack of section cards
