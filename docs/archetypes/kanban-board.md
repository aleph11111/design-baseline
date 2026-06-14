# Archetype P — kanban-board

A **board of columns of draggable cards** — a pipeline / kanban view where items
move between user-meaningful stages (To do → In progress → Done; lead stages;
etc.). Distinct from grouped-list (K): K is read groups of *table rows* partitioned
by a dimension; P is an *interactive board* whose primary gesture is **moving a
card between columns**, changing its state. Distinct from matrix-grid (M): M is a
fixed row×column intersection grid, not movable cards.

Promoted from the 2026-06-13 fleet audit (recurs in pmo and hk-crm; rule-of-2).

> **Drag-agnostic by design.** The baseline ships **no drag-and-drop library**
> (same stance as charts — DnD is heavy and consumers differ: dnd-kit, native
> HTML5, pragmatic-dnd). The archetype owns the **board chrome**; the consumer
> wires its own DnD. `<BoardColumn>` and `<BoardCard>` forward refs and spread
> props precisely so a consumer can attach `draggable`/`onDragStart`/`onDrop` or
> dnd-kit `ref`/`attributes`/`listeners` without the primitive caring how.

## Primitives

- `<BoardShell>` — the horizontally-scrolling column row.
- `<BoardColumn title count actions>` — a column: overline header (title + count +
  actions like add-card) over a vertical card stack. Forwards ref + spreads props
  (the DnD droppable target).
- `<BoardCard>` — a card; forwards ref + spreads props (the DnD draggable). Pure
  chrome — it never moves itself; a move is the consumer's state change.

## Layer 1 — Route config
A top-level route (`/board`, `/pipeline`) or a tab within a larger surface. Lazy +
suspense.

## Layer 2 — Page shell
`<AppShell>` + outer `px-6 py-6`. The board scrolls horizontally inside its own
container; the page does not.

## Layer 3 — Page header
`<PageHeader>` with the board title; filters (assignee, label) can sit in the
header `actions` slot or a toolbar below.

## Layer 5/6 — The board
`<BoardShell>` of `<BoardColumn>`s of `<BoardCard>`s. Columns show a count and an
add-card affordance; cards show a title + a couple of compact meta chips (label,
assignee). Keep cards scannable — push detail into a crud-dialog (J) or a detail
page (C) opened from the card, not onto the card.

**Forbidden:** rendering a data table per column (that's grouped-list K — use this
only when cards *move*); baking a specific DnD library into the primitives;
unbounded column counts with no horizontal scroll affordance.

## Layer 7 — States
- **Empty column** — a dashed "Drop here" placeholder keeps the drop target
  visible and the board width stable.
- **Moving** — the consumer's DnD provides drag feedback; the move is an optimistic
  state change, persisted async (reconcile/rollback on failure).
- **Loading** — column skeletons; never a single page spinner.

## Layers 8–12
Data: a query of items keyed by board/filters; the per-card "column" is a
persisted status field. Mutations: a move = a status update (optimistic,
idempotent); ordering within a column, if persisted, needs a rank/position field.
Mobile: columns scroll horizontally; consider a single-column + status-select
fallback for touch where DnD is awkward. Permissions: gate who can move cards vs
view; a read-only viewer gets the board without drag handles.
