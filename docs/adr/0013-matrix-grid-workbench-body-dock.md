# 0013 — A planning workbench is matrix-grid with `body` and `dock` slots, not a new archetype

- **Status:** Accepted
- **Date:** 2026-11-08
- **Closes:** backlog `archetype-gap-planning-workbench`
- **Amends:** matrix-grid (M) Layers 1 and 5, forbidden pattern #3 — contract v3.8 / MANIFEST 3.8.
- **Respects:** [ADR 0001](0001-grandfather-authored-report-calendar.md) (baseline never originates archetypes), [ADR 0004](0004-appearance-locality-derived-vs-inherited.md) (no appearance prop; the slots are content), [ADR 0008](0008-one-page-frame-slot-owned-placement.md) (one page frame, slot-owned placement). Follows [ADR 0011](0011-analytics-dashboard-edit-mode.md).

## Context

controlling-app's planning page `frontend/src/app/workspace/planung/page.tsx` renders in a bare `PageFrame`, which the fleet rule forbids. A statement switch picks the body: the editable accounts × periods plan grid with a line inspector, a balance-sheet config panel plus a read-only preview grid, or stacks of read-only preview grids (up to three). A summary dock follows the body; history is a header action; two dialogs are page-level.

Since v0.29.0 `MatrixGridShell` carries the docked `inspector`, which covers the line editor. What it lacked is room for the content around the grid, and the contract forbade more than one matrix per route.

## Decision

1. **Extend matrix-grid, do not add a `planning-workbench` archetype.** The page's primary job is still one editable rows × columns grid with a line inspector; the previews, config panel and summary are satellites that read from it. A new archetype would have to re-host matrix-grid's frame, scroll model and inspector, and would need its own provenance under rule 1 of `docs/RULES.md`; this is the ADR 0011 argument (a mode of an existing archetype, not a sibling).
2. **Two optional slots on the shell.** `body` renders below the grid in the same column (config panel, read-only preview matrices as nested matrix-grid shells); `dock` renders last (the summary). With neither passed the DOM is unchanged. With the inspector docked, grid, `body` and `dock` share the narrowed column beside it, so the summary stays in view while a line is tuned.
3. **One editable matrix per route.** The old "one matrix per route" rule narrows to one *editable* matrix: read-only preview matrices nested in `body` are conformant; a second editable matrix on the route is still forbidden.
4. **No new slot for history or the view switch.** History stays a header `actions` entry, the statement switch stays in `toolbar`, and dialogs stay page-level siblings.

## Rejected alternative

A new `kind: page` `planning-workbench` archetype composing `MatrixGridShell` as its editable region, plus preview, config, dock and history slots (the ADR 0012 route). Rejected: unlike the structure builder, no part of this page is a shape matrix-grid lacks; the only gap is placement of satellites, which two slots close. A separate archetype would duplicate the inspector and frame and split matrix-grid's consumers across two contracts.

## Consequences

- controlling-app can move `workspace/planung` onto `design-baseline/archetypes/matrix-grid` with `inspector`, `body` and `dock`, and drop the gap line from `frontend-builder-editor-pages-archetype-shell-migration` (consumer follow-up).
- The gallery demo gains a "workbench" mode; `npm run check:viewports` checks it at the device triad with the inspector open.
- If a consumer later needs a second *editable* matrix on one route, that is a new gap ticket, not an extension of the carve-out.
