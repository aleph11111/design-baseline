---
key: P
slug: kanban-board
kind: page
version: 1.0
promoted_from: fleet-audit-2026-06-13 (pmo, hk-crm)
promoted_at: 2026-06-14
source_spec_version: 1.2
status: locked
---

# Archetype P — kanban-board

A **board of columns of draggable cards** — a pipeline / kanban view where items
move between user-meaningful stages (To do → In progress → Done; lead stages;
etc.). Distinct from grouped-list (K): K is read groups of *table rows* partitioned
by a dimension; P is an *interactive board* whose primary gesture is **moving a
card between columns**, changing its state. Distinct from matrix-grid (M): M is a
fixed row×column intersection grid, not movable cards.

Promoted from the 2026-06-13 fleet audit (recurs in pmo and hk-crm; rule-of-2).

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/kanban-board`; the prop surface is the API and the sandbox demo (`src/examples/kanban-board-demo.tsx`) is the gallery reference.

> **Drag-agnostic by design.** The baseline ships **no drag-and-drop library**
> (same stance as charts — DnD is heavy and consumers differ: dnd-kit, native
> HTML5, pragmatic-dnd). The archetype owns the **board chrome**; the consumer
> wires its own DnD. The **board-column** and **board-card primitives** forward
> refs and spread props precisely so a consumer can attach
> `draggable`/`onDragStart`/`onDrop` or dnd-kit `ref`/`attributes`/`listeners`
> without the primitive caring how.

## Layer 1 — Route config
A top-level route (`/board`, `/pipeline`) or a tab within a larger surface. Lazy +
suspense.

## Layer 2 — Page shell
The project's **top-level app shell** (its `<main>` supplies the page inset; the page adds none). The board scrolls horizontally inside its own
container; the page does not.

## Layer 3 — Page header
The board shell (`kicker`/`title`/`headerActions` props) renders the shared
**on-surface header bar** at the top of the bounded card — kicker + title left,
actions right — not a detached **canonical page-header treatment** above the
surface. Filters (assignee, label) can sit in `headerActions` or a toolbar below.

## Layer 5/6 — The board
The board shell of board-column primitives of board-card primitives. Columns show
a count and an add-card affordance; cards show a title + a couple of compact meta
chips — a status-badge primitive for the label, an avatar primitive for the
assignee. Keep cards scannable — push detail into a crud-dialog (J) or a detail
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

---

## Acceptance gate

> **Axis-C (adoption-quality) checklist** — the canonical list a page adopting this
> archetype is scored against (see [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md)).
> A page that composes this archetype's shell is **conformant** only when every
> REQUIRED box passes; one that fails any REQUIRED box is a 🔴 **wrapper adoption**,
> routed to the teardown ritual ([`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`](../DETAIL-PAGE-TEARDOWN-PLAYBOOK.md)).
> `adoptionQuality.score = REQUIRED passed ÷ REQUIRED applicable`; `wrapper = true`
> when score < 1.0. **[spine]** = the shared conformance spine **S1–S6** (single inset ·
> shell-not-hand-rolled · canonical states · atoms+tokens · aligned figures · brand
> primary), defined in [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md).

**REQUIRED**

- [ ] **One board shell** owns columns + cards + drag context; columns aren't
      hand-rolled flex tracks with bespoke headers.
- [ ] **Card is a single primitive** (title, meta chips, assignee avatar), consistent
      across columns — not per-column variants.
- [ ] **Column header shows name + count** via the shell; WIP/empty columns use the
      canonical empty treatment, not blank space.
- [ ] **Status/label chips are shared status-badge primitives** on tokens, not literal-colored pills.
- [ ] **[spine] S1, S2, S4, S5, S6.**

**SHOULD** (yellow, not red)

- [ ] Add-card affordance is consistent per column (one pattern), ranked vs column actions.
