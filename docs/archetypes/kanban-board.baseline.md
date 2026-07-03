---
slug: kanban-board
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/kanban-board.md
---

# Kanban board — baseline reference implementation

> The stack-specific binding of the [kanban-board contract](./kanban-board.md) to
> the **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell).
> Each role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

- `<BoardShell kicker title headerActions headerFill>` — the horizontally-scrolling
  column row. When `title` is set, the shell adopts the Plex Ledger board form: an
  on-surface `<SurfaceHeader>` (kicker + title left, `headerActions` right) spans
  the top of one bounded card, with the column scroll area below it.
- `<BoardColumn title count actions>` — a column: overline header (title + count +
  actions like add-card) over a vertical card stack. Forwards ref + spreads props
  (the DnD droppable target).
- `<BoardCard>` — a card; forwards ref + spreads props (the DnD draggable). Pure
  chrome — it never moves itself; a move is the consumer's state change.

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each
contract role. Only layers with a baseline-specific binding appear.

### Layer 2 — Page shell
- Top-level app shell → `<AppShell>`; its `<main>` supplies the page inset.

### Layer 3 — Page header
- Board shell → `<BoardShell kicker title headerActions>`.
- On-surface header bar → `<SurfaceHeader>`, rendered by `<BoardShell>` in the Plex
  Ledger board form (kicker + title left, `headerActions` right).
- Canonical page-header treatment (the thing it is *not*) → a detached
  `<PageHeader>`.

### Layer 5/6 — The board
- Board shell → `<BoardShell>`.
- Board-column primitive → `<BoardColumn>`.
- Board-card primitive → `<BoardCard>`.
- Status-badge primitive → `<Badge>` (used for the label chip).
- Avatar primitive → `<IconAvatar>` (used for the assignee).

## Acceptance gate (baseline tells)
- Board shell → `<BoardShell>`; hand-rolled flex tracks with bespoke headers fail
  "one board shell owns columns + cards + drag context".
- Status/label chips → shared `<Badge>`s on tokens, not literal-colored pills.
