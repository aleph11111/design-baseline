---
slug: placement
kind: methodology
version: 2.2
status: locked
governs: [A, B, C, J, K, D2, F2, M, P, G, R, H]
---

# Placement — the "what goes where" grammar

Once [`CHOOSING-A-SURFACE.md`](./CHOOSING-A-SURFACE.md) has picked the container, this
document governs its **insides**: where the title sits, where the primary action lives,
where search and filters go, where a row's actions hang, where a footer's buttons order.

Selection is *which archetype*. Placement is *where the recurring elements go inside any
archetype*. Both must hold. An app can pick the right surface every time and still feel
stitched together if the "New" button is top-right on one page and inline on another, or
search is left here and right there — because the user's eye relearns the page on every
navigation.

> **The one rule.** Every recurring element has exactly **one home**, and that home is owned
> by a **primitive**. If you are positioning one of these elements by hand — a bare `<h1>`
> title, a `<Button>` dropped into a toolbar, a per-row `<DropdownMenu>` you wired yourself
> — that is the bug. Use the primitive; the primitive owns the slot.

This is why the archetype primitives exist. `PageFrame`, `SearchInput`,
`RowActionsMenu`, `SectionHeading`, `CrudDialogFooter`, `FormPageActions`, `StatTileRow`,
`KeyValueList`, `StateView` are not styling conveniences — each is the **single owner of a
slot**. Composing them *is* the placement contract; hand-rolling their content is how drift
gets in.

---

## The app frame — the desk every page sits on

The outermost slot of all, and the easiest to get wrong because it's written once and
never reviewed again. **`AppShell` is the single owner of the app frame** — sidebar,
header, and the content desk (`bg-surface-canvas p-4 md:p-12 xl:p-14`,
holding a centred 1180px column that steps to 1440/1680px on a wide desk). Archetype shells are *framed surfaces* designed to sit
on that specific desk: the canvas is one tone step below the raised frame, so the frame
reads by tone with no border (docs/STYLE.md "Surfaces").

A hand-rolled `<main>` with its own padding and background is red, not yellow. The known
failure mode (scar origin: hk-crm, 2026-07): `p-8 bg-slate-50` — double the inset on a
solid gray desk — makes every framed surface read as a floating iframe. Same components,
wrong desk, whole app feels wrong.

| Slot | Home | Rule |
|------|------|------|
| **Sidebar / header chrome** | `AppShell` props | Never a hand-rolled flex frame |
| **Content desk** | `AppShell`'s main | `bg-surface-canvas p-4 md:p-12 xl:p-14`, centred 1180px column, 1440/1680px on a wide desk (full-bleed only for the four working-surface archetypes) — pages add no outer inset or width of their own |

---

## The page frame — every page archetype

Every page archetype shell renders through `PageFrame` ([ADR-0008](./adr/0008-one-page-frame-slot-owned-placement.md)). The page passes content into named slots; the shell decides where each renders. There is no second way to build a page — no on-surface title, no board/classic mode, no control row of your own.

```
PageHeader   Title · subtitle · badges                          [actions]
┌ one untitled raised surface ─────────────────────────────────────────┐
│ toolbar: search · filters · selectors          count · [View ▾]       │
├───────────────────────────────────────────────────────────────────────┤
│ body                                                                  │
└───────────────────────────────────────────────────────────────────────┘
```

| Slot | Home | Holds |
|------|------|-------|
| `title` (+ `subtitle`, `badges`) | `PageHeader`, top-left | The page's one title — passed once, to the shell. Under a parent page it renders as the nested heading automatically. |
| `actions` | `PageHeader`, right | Verbs on the whole page/document: the **one** primary action (create included), export, print. ≤ 1 primary + 2 secondary; the rest in `⋯`. |
| `toolbar` | the surface's first band, left | Everything that **scopes** the body: search (leftmost), filters, scoping selectors. Never page-switching tabs — those are `viewSwitch`. |
| `viewSwitch` | toolbar band, first | A control that switches **what** the page shows (Plan · Checkliste · …) rather than scoping it — page-navigation `Tabs` / `SegmentedControl` live here, never in `toolbar`. |
| `count` | toolbar band, right | The result count, canonical muted small text, in the archetype's declared format. |
| `viewOptions` | toolbar band, far right | Everything that changes **how** the body is shown without re-scoping it (decimals, KPI rows, show-zero, density) — one "View" menu. |

A control that fits none of these slots is a question for the archetype contract, not a new row on the page.

**Below `md` the band collapses to one row** — a Filter button carrying the count of set filters (`filterCount`), a one-line summary of the active values (`filterSummary`), the count, and the View menu as an icon. The `toolbar` filters move into a bottom filter sheet, still drawn as joined-label rows (STYLE.md "Toolbar field labels") at the `lg` touch step, with a reset action (`onResetFilters`) and a close button. The `viewSwitch` stays visible above that row and scrolls sideways when it overflows. Scoping must remain **reachable**, not visible: on a narrow viewport the sheet is where it lives. A wrapping toolbar that pushes the body below the first screen is the drift this rule closes. The sheet unmounts on close, so `toolbar` controls hold their value in the page (controlled), never in local state.

---

## Rows & cards — A, K, P

| Slot | Home | Rule |
|------|------|------|
| **Primary identifier** | first cell / card title | **Exactly one** per row, `text-primary hover:underline` (reads interactive at rest). Click = the row's detail-target. |
| **Secondary fields** | after the identifier | muted; a supporting second line only when density genuinely helps |
| **Status** | its own cell / corner | `Badge` (categorical) or dot + label (binary). Never a raw colored cell, never an inline per-page color map. |
| **Numbers** | right-aligned | `tabular-nums` in the house sans (ADR-0009), routed through a formatter — never raw `toFixed` / ISO strings |
| **Per-row actions** | row end | `RowActionsMenu` (the `⋯`) — the single owner of the per-row overflow. Never scatter inline action buttons across a row. |

Identical across `list-with-detail` rows, `grouped-list` items, and `kanban-board` cards:
the entity stays recognizable because its identifier, status, and actions are always in the
same place.

---

## Sections — inside detail, settings, grouped pages

| Slot | Home | Owner |
|------|------|-------|
| **Section title** | top of the section | `SectionHeading` — the canonical section-title signature. Never a hand-rolled heading class. |
| **Section-level action** | right of the section heading | e.g. "Add" for a sub-collection |
| **Bounded section chrome** | wraps the block | `SectionCard` |

One section-title signature across every archetype (README Layer 6 / `STYLE.md`). A new
heading class is drift, not variation.

---

## Actions grammar — dialogs (J) and form pages (B)

The footer button order is a hard contract, identical in a sheet and on a form page.

```
┌───────────────────────────────────────────┐
│  Title · Entity name                    ✕  │  ← header: NO action buttons
├───────────────────────────────────────────┤
│  fields …                                  │  ← body
├───────────────────────────────────────────┤
│  [Delete]                 [Cancel] [Save]  │  ← footer (mode-aware)
└───────────────────────────────────────────┘
```

| Mode | Left edge (destructive) | Right edge (secondary → primary) |
|------|-------------------------|----------------------------------|
| View | Delete (disabled) | Close · **Edit** |
| Edit | Delete (enabled) | Cancel · **Save** |
| Create | — | Cancel · **Create** |

- **Destructive (Delete)** — always left, always via a confirm dialog. Absent in create.
- **Primary (Save / Create / Edit)** — always **rightmost**. Never reversed.
- **Secondary (Cancel / Close)** — outline, immediately left of primary.
- Owned by `CrudDialogFooter` (J) and `FormPageActions` (B). The header holds **no** CRUD
  buttons — only an optional `⋯` / mode toggle.

---

## Detail pages — C

| Slot | Home | Owner |
|------|------|-------|
| **Entity title + status badges** | header, left | detail header |
| **Header actions** (Edit, convert, quick-actions) | `actions` | per the page-frame slot table |
| **KPI / stat strip** | top of body | `StatTileRow` / `StatTile` (tabular-nums figures) |
| **Master-data summary** | summary block | `KeyValueList` / `KeyValueRow` (ruled `dl`) |
| **Sub-collections** | stacked below | `DetailSection` blocks |

---

## States — every data shell (README Layer 7)

One look each; vary the *copy*, never the *chrome*.

| State | Placement & treatment |
|-------|-----------------------|
| **Loading** | text-only "Loading…", centered `p-8`, `role="status"`. No skeletons in a list/table shell (the one exception: the J dialog body). |
| **Empty** | centered `p-8 text-center text-sm text-muted-foreground`; copy + any CTA is archetype-specific. |
| **Error — shell** | destructive `Alert` (title + message + optional "Try again"). Gate `isEmpty && !error` so a failed query never renders as "empty". |
| **Error — form/dialog** | compact tinted box `bg-destructive/10 p-4 rounded text-sm text-destructive`. Never `bg-red-50`. |

---

## Enforcement — how this stays true

Placement is auditable exactly like the layer grid: per slot, mark **green** (via the owning
primitive), **yellow** (a documented essential variation), or **red** (drift).

**Red — reject in review:**

- A hand-rolled app frame — any `<main>` with its own padding/background instead of `AppShell`’s desk.
- A page title anywhere but the shell's `title` — a bare `<h1>`, a `PageHeader` next to a shell, or a titled card under the header (two titles).
- A control outside its slot: a hand-rolled control row between header and content, a filter in `actions`, a create action in the `toolbar`, more than one primary action.
- Page-switching `Tabs` / `TabsList` / `SegmentedControl` in `toolbar` — they belong in `viewSwitch` (below `md` the toolbar moves into the filter sheet and the tabs clip). A tab group that genuinely scopes the body opts out with `// adherence-ok: page-tabs-in-toolbar — <reason>`.
- A bare `Switch` in `toolbar` — a fixed 24px pill that breaks the band's one height step; use `ToggleField`. Opt out with `// adherence-ok: bare-switch-in-toolbar — <reason>`.
- A per-row `DropdownMenu` that isn't `RowActionsMenu`; inline action buttons scattered per row.
- A dialog/form with the primary button left of secondary, or Delete on the right.
- CRUD buttons in a dialog header or body instead of the footer.
- A hand-rolled section-title class instead of `SectionHeading`.
- `bg-red-50` (or any ad-hoc error color) instead of the two canonical error treatments.

**Yellow — allowed, but document it** (in the archetype spec or an ADR): a second toolbar
control a specific page genuinely needs; a supporting second line in a row; a section action
that isn't "Add".

**Mechanically enforceable** (mechanical checks — shipped as part of the baseline adherence lint where possible, or as project hooks):

- no bare `<h1>` inside `src/app/(app)/**` page bodies (`_adherence.json` `no-bare-h1`); no `PageHeader` next to a shell, no titled card under a header, no control row under a header (`audit-signals.json` `page-*` signals).
- `RowActionsMenu` is the only per-row menu component in list/grouped/board rows.
- no page-switching tabs in `toolbar` (`_adherence.json` `page-tabs-in-toolbar`).
- no bare `Switch` in `toolbar` (`_adherence.json` `bare-switch-in-toolbar`).
- no `bg-red-50` / raw destructive hex in shells — must be `Alert` or the tinted box.

When the same placement mistake lands twice in a consuming project, promote it: first to that project’s `docs/RULES.md`, and — if it generalizes — into this document and the baseline adherence lint, so every project inherits the check.

---

## What this document does *not* decide

- **Which surface** — that is [`docs/CHOOSING-A-SURFACE.md`](./CHOOSING-A-SURFACE.md).
- **Visual tokens** — type, color, spacing, radius, the heading *signatures* themselves live
  in `docs/STYLE.md`. This doc places the elements; `STYLE.md` styles them.
- **Data & behavior** — Layers 8–10 of each archetype spec.

---

## Revision log

- **2.1** — Below `md` the toolbar band collapses into one row plus a bottom filter sheet; the new `viewSwitch` slot keeps a view switch outside the sheet.
- **2.0** — The page frame is `PageFrame` (ADR-0008): one title, one untitled surface, five named slots. Replaced the separate header/toolbar slot tables (which contradicted the title-on-the-card shells and `audit-signals.json` on where the create action and filters go) with the one slot table; the red list now names the double-title and split-control shapes.
- **1.3** — Removed the dead component reference from the result-count slot: the slot named a
  primitive that does not exist anywhere in the donor (`src/` carries no such component — the
  rule pointed an operator at a never-shipped component). The slot now names the owning
  **treatment** every list-family archetype already declares — canonical muted small text
  (`text-sm text-muted-foreground`), `{n} results` format, rendered by the consumer through the
  toolbar's `pageActions` slot — and the red line targets the concrete drift (a count outside
  the canonical styling or outside the toolbar), not a ghost component. A real result-count
  primitive, if one is ever built and promoted, re-enters here as the slot's Owner. Dead name
  and full context: the donor's docs-drift ticket
  `docs-drift-placement-md-dead-resultscount-reference` (2026-08-27, archived with this fix).
- **1.2** — Added the app-frame slot: `AppShell` owns the desk; hand-rolled `<main>` frames are red (scar origin: hk-crm iframe-feel, 2026-07).
- **1.1** — Promoted to the Design Baseline; enforcement wording generalized from the
  originating project (hk-crm) to any consumer.

- **1.0** — First draft. Names the single owning primitive for each recurring slot
  (`PageHeader`, `ListWithDetailToolbar` / `SearchInput` / `SegmentedControl`,
  `RowActionsMenu`, `SectionHeading` / `SectionCard`, `CrudDialogFooter` /
  `FormPageActions`, `StatTileRow`, `KeyValueList`, `StateView`) and the green/yellow/red
  enforcement grid, extracted from the placement rules previously scattered across the
  individual archetype specs.
- **2.2** — Page-switching `Tabs` / `TabsList` / `SegmentedControl` in `toolbar` named in the slot table and the red list (they clip inside the mobile filter sheet; use `viewSwitch`); the `page-tabs-in-toolbar` adherence rule flags it, with an inline reasoned opt-out for a tab group that genuinely scopes the body.
