---
key: Sb
slug: structure-builder
kind: page
version: 1.0
promoted_from: controlling-app
promoted_at: 2026-11-05
source_spec_version: n/a (no source spec — distilled from controlling-app's pnl-builder page, docs/patterns/frontend-structure-builder.md and ADR-0027)
status: locked
---

# Archetype Sb — Structure builder

## Purpose

A **structure-builder** page edits a **hierarchical structure** — a report's
line tree, a syllabus, a chart-of-sections — by arranging lines in a tree and
placing items from a **palette** into it. The user's primary gesture is
*moving*: reorder a line, re-parent it, drop a palette item onto it. The page
also tells the user what is still missing (the **coverage check**), keeps
earlier versions (the **version history**), and offers several structures to
pick from (the **template list**, with *New* and *Clone*).

Pick it over its neighbours (see `docs/CHOOSING-A-SURFACE.md`):

- **statement-with-filters (F)** / **report (R)** — read a finished structure.
  When nothing on the page moves a line, it is F or R, not Sb.
- **settings-table (D2)** / **list-with-detail (A)** — flat rows edited one by
  one. Sb's rows nest, and their position *is* the data.
- **kanban-board (P)** — cards moved between a fixed set of columns. Sb's
  targets are the tree's own lines, at any depth.

ADR-0012 records why this is its own page archetype rather than an edit mode of
F, and its provenance.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/structure-builder`; the prop surface is the API and the sandbox demo (`src/examples/structure-builder-demo.tsx`) is the gallery reference.

---

**Body shape: one frame.** The page body is one frame, not a stack of section cards (ADR-0015): its body is one workbench.

## Structure

The page renders through the one page frame (ADR-0008), slot by slot:

**1 — Header.** The page `title` once. Header actions: **Version history**
(opens the history panel) and, in the deferred-save variant, the one primary
**Save**. While unsaved edits exist, an **unsaved-changes badge** sits beside
the title and Save is enabled; otherwise Save is disabled.

**2 — Toolbar band (the template list).** First in the band, and still visible on a phone (it switches what the page shows, it does not filter it): the control that picks which
structure is being edited, followed by **New** (start an empty structure) and
**Clone** (copy the current one). Picking another structure while dirty asks
before discarding — that guard is the page's.

**3 — Body: the tree.** The editable, hierarchical line tree, always expanded.
Lines that can hold children (groups, subtotals, modules) and leaf lines
(accounts, lessons) share one row grammar: label, compact meta, optional
inline editors and a row menu.

**4 — Aside: coverage + palette.** Beside the tree from the large breakpoint
up, below it under. Its heading names the palette ("Unplaced accounts"). The
**coverage check** is one status line: "everything is placed" when complete,
otherwise the count not placed and, when the page can tell, the count placed
twice. Under it, the **palette**: the items not yet in the tree.

**5 — History panel.** A side sheet titled *Version history* listing saved
versions, each with a restore action. Restoring replaces the tree and clears
the dirty state.

**Early states.** Loading, error and empty **replace the body** (tree and
aside); the header keeps the title. An error wins over loading. Empty means no
structure exists yet; its one action is *New*. In an early state the
History, Clone and Save actions are not offered.

---

## Interaction

**Keyboard — required; pointer drag is an addition, never the only path.**

- The tree is a single tab stop (the selected line). Arrow Up / Down moves
  focus and selection line by line.
- **Alt + Arrow Up / Down** reorders the focused line among its siblings.
- **Alt + Arrow Right** re-parents it into the line above, as that line's last
  child — only when the line above can hold children.
- **Alt + Arrow Left** re-parents it out of its parent, to just after the
  parent.
- Focus stays on the moved line, and each completed move is announced to
  assistive tech. A short hint under the tree names the keys.
- **Palette placement by keyboard:** every palette item carries a *place*
  action that inserts it at the selected line — into it when it can hold
  children, otherwise right after it.

**Pointer.** Lines drag onto other lines: the top of a row drops before it,
the bottom after it, the middle of a row that can hold children drops inside.
Palette items drag onto the tree the same way. A drop into the dragged line's
own subtree is refused.

**Persistence variants** (from the source's ADR-0027) — pick by the stakes:

1. **Deferred bulk save** — moves mutate local state and mark the page dirty;
   one explicit Save persists the whole structure with a version for
   optimistic concurrency. The unsaved-changes badge is shown, and leaving the
   page while dirty asks first.
2. **Immediate idempotent reorder** — each move persists on its own with an
   optimistic update and rollback on error. No Save, no dirty state, no badge.

---

## House style

- **Figures** — any amount or count on a row renders in the **canonical
  tabular figure style**, right-aligned.
- **Indentation** — nesting reads by indentation with a hairline guide, never
  by per-depth colour.
- **Selection** — the selected line carries the accent surface; a drop target
  shows a primary-colour edge (before / after) or outline (inside).
- **Tokens only** — no literal colours. Coverage complete uses the success
  role, incomplete the warning role.

---

## Forbidden patterns

1. **Pointer-only moves.** A tree or palette that can only be rearranged by
   dragging. Every move needs its keyboard path.
2. **A hand-built builder frame.** The header actions, toolbar band, aside and
   early states come from the one shell — no bare page frame around a hand-laid grid.
3. **Save on every drop in the deferred variant**, or a fake dirty state in
   the immediate variant.
4. **A second title.** The tree and aside carry section labels, never a page
   heading.
5. **Coverage as a modal only.** The coverage line is always visible beside
   the palette; a detail dialog may add to it, not replace it.
6. **Collapsed-by-default trees** that hide where a moved line landed.

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

- [ ] **One structure-builder shell** owns the page: title, template band with
      New / Clone, History, Save, unsaved badge, aside, early states.
- [ ] **Keyboard moves** — reorder, re-parent and palette placement all
      complete by keyboard alone.
- [ ] **Coverage visible** beside the palette.
- [ ] **One persistence variant**, matched to the stakes (see Interaction).
- [ ] **Early states via the shell** (`isLoading` / `error` / `isEmpty`).
- [ ] **[spine] S1–S6**.

**SHOULD** (yellow, not red)

- [ ] The tree is the shipped tree primitive (a consumer-owned tree is legal
      only when it meets the keyboard rule above).
- [ ] Undo / redo for moves in the deferred variant.

---

## Version log

- **1.0** (2026-11-05) — initial contract, distilled from controlling-app's
  `workspace/pnl-builder` (ADR-0027 persistence variants) for the planned
  balance-sheet builder; ADR-0012.
