# 0011 — An editable dashboard tile layout is an edit mode of analytics-dashboard, not a new archetype

- **Status:** Accepted
- **Date:** 2026-11-05
- **Amends:** analytics-dashboard (G) Layers 1, 3, 6, 10 — contract v4.2 / MANIFEST 4.4.
- **Respects:** [ADR 0001](0001-grandfather-authored-report-calendar.md) (baseline never originates archetypes), [ADR 0004](0004-appearance-locality-derived-vs-inherited.md) (no new appearance prop; the edit controls are behaviour), [ADR 0008](0008-one-page-frame-slot-owned-placement.md) (one page frame).

## Context

Ticket `archetype-gap-editable-tile-layout`: controlling-app's dashboard-template editor (`frontend/src/app/admin/dashboard-templates/[id]/page.tsx`, 613 lines) renames the template inline, adds, removes and reorders tiles, configures a tile in a `TileConfigDialog`, and assigns the template to assets. No `kind: page` archetype covered it: analytics-dashboard was read-only by contract ("no create/edit routes hang off it", "no page-level write actions"), and settings-table, form-page, detail-overview, kanban-board and matrix-grid have no reorderable tile canvas. The page sits on controlling-app's `page-requires-archetype-shell` grandfathered list.

The same repo has a second page of this shape: `frontend/src/app/workspace/dashboard/page.tsx` is a live analytics dashboard whose layout unlocks into the same editor (add / edit through the same `TileConfigDialog` / remove / reorder by drag). Both pages edit **the grid of an analytics dashboard**; they differ only in whether the tiles show live figures or a summary of their configuration.

## Decision

1. **Edit mode of G, not a new archetype.** The editor is the analytics-dashboard frame with its widgets editable. A new `kind: page` archetype would duplicate G's frame, grid, span keying rule and states, and would need its own provenance under rule 1 of `docs/RULES.md`; a mode of G inherits G's fleet-synthesis provenance and adds a feature evidenced by two controlling-app pages (rule of 2 within the fleet: two pages that independently need it). The MANIFEST entry keeps `promoted_from`; this ADR records that the edit mode came from controlling-app.
2. **Two ways in, one shell.** A dashboard enters edit mode either on its own layout-editor route (a template that is only ever edited) or through an "Edit layout" toggle in the header `actions` of the live dashboard. Either way it is `DashboardShell`; nothing else changes about the frame.
3. **What edit mode adds, and where it lives.**
   - *Inline rename* — the page `title` becomes an inline title editor (Enter saves, Escape cancels). The name stays the one `<h1>`.
   - *Add* — "Add tile" is the primary header action; the empty grid offers it too.
   - *Remove / configure / reorder* — every widget carries edit controls: move earlier, move later, configure, remove. Reorder is **keyboard-operable** through the move buttons (plain buttons in tab order, each named after the tile); pointer drag-and-drop is an addition on top, never the only way.
   - *Tile config dialog* — configuring or adding a tile opens a modal dialog the consumer owns; tile settings are never edited inline in the cell. The dialog sets what the tile *is*; the widget's `span` is still derived from that by G's keying rule, never picked as a width.
   - *Assignment* — who the layout applies to is a checklist section after the grid, one toggle per target, each saving on its own with a per-row pending state.
4. **No mode prop on the shell.** Edit mode is the presence of the edit controls on each widget (a behaviour object) and the title editor in `title`; there is no `mode`/`editing` appearance flag for a call site to set (ADR 0004).

## Consequences

- controlling-app can move both pages onto `design-baseline/archetypes/analytics-dashboard` and drop the template editor from its grandfathered list (follow-up ticket filed in controlling-app).
- Chart-agnostic stays true: in edit mode the widget body is still the consumer's (a live chart or a configuration summary).
- The gallery demo gains an "Edit layout" toggle; `npm run check:viewports` checks the demo in edit mode at the device triad.
- Free-form grid placement (x/y coordinates, resizable cells) is out of scope: order plus the derived span is the layout. A consumer that needs placement files a new gap ticket.
