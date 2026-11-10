---
key: G
slug: analytics-dashboard
kind: page
version: 4.3
promoted_from: fleet-audit-2026-06-13 (brickshop-manager, my-finance-app, hk-crm, mistra)
promoted_at: 2026-06-14
source_spec_version: 1.3
status: locked
---

# Archetype G — analytics-dashboard

A read-only **overview-by-numbers** page: a KPI stat row, a grid of chart/metric
widgets, and a period/category filter bar. Distinct from detail-overview (C),
whose body is one entity's sections; here the body is **aggregate widgets** over a
whole dataset, and the page has time/segment **filters** that re-scope everything.

Promoted from the 2026-06-13 fleet audit, which found this shape recurring in 4
projects (brickshop-manager, my-finance-app, hk-crm `/reports`, mistra admin) with
no archetype to adopt — a clear rule-of-2 gap.

> **Chart-agnostic by design.** The baseline ships **no chart library** (see
> `STYLE.md` — charts are a per-project pick). This archetype owns the *frame* —
> the KPI row, the widget grid, the widget cells, the filter bar — and the
> consumer drops its own chart components (recharts / nivo / visx / …) into the
> widget bodies. A baseline that mandated a chart lib would not be re-skinnable.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/analytics-dashboard`; the prop surface is the API and the sandbox demo (`src/examples/analytics-dashboard-demo.tsx`) is the gallery reference.

## Layer 1 — Route config
A top-level route (e.g. `/dashboard`, `/reports`, `/analytics`). Code-split behind
the framework's **lazy-load boundary**, like any page. Read-only by default — the
figures are never edited here. The one sanctioned write is the **layout** itself,
in **edit mode** (below, [ADR-0011](../adr/0011-analytics-dashboard-edit-mode.md)),
entered either on a layout-editor route of its own (a template that is only ever
edited) or through an "Edit layout" toggle in the live dashboard's `actions`.
Either way it is this archetype's shell; no other archetype edits a dashboard
layout.

## Layer 2 — Page shell
Renders inside the project's **top-level app shell** (the app shell's main region
supplies the page inset; the page adds none). A **render-error boundary** wraps content; per-widget fetch
errors degrade to a per-widget message, never a blank page.

## Layer 3 — Page header
The dashboard's name is the page `title`, passed once. No page-level write
actions outside edit mode; export/share and the "Edit layout" toggle are `actions`.
In edit mode the `actions` are "Add tile" (the primary verb) and "Done".

## Layer 4 — Toolbar (filter bar)
Everything that re-scopes the dashboard goes in `toolbar`: a **period** control
(the shared **one-of-N segmented control** for `Week / Month / Quarter / Year`,
or a date-range picker) and zero or more **segment** filters (channel, category,
region) as selects/pills. Changing a filter re-scopes the KPIs and every widget.
Filter state is consumer-owned (URL-synced is encouraged so a dashboard view is
shareable). **Forbidden:** filters in `actions`, or a filter row per widget.

## Layer 5 — KPI row
A row of the shared **stat-tile / KPI-tile primitives** — the headline numbers,
each with an optional comparison `hint` ("vs last month"). Pre-format values; the
tile never formats. The strip's cell count is **not a page decision**: it follows
the number of tiles it is handed (bounded to a 2–4 cell range, collapsing to a
single stacked column on narrow viewports), so no page picks a column count that
can disagree with its own content.

## Layer 6 — Widget grid
The archetype's **widget-grid** primitive containing the **widget** primitive
for each widget. The dashboard is one surface: the KPI row and the widgets are
cells of it, never cards inside it (no card-in-card, no mat around them). Each widget: a short title, optional in-bar control (a range
toggle), and a body that is a chart, a number, or a small ranked list/table. The
grid's own column count is **fixed by the archetype**, not chosen per page: it
collapses to one column on narrow viewports, two at the mid breakpoint, and three
at the wide breakpoint. **Forbidden:** a hand-rolled grid of cards — use the
**widget** primitive so widgets share one cell treatment; embedding an
interactive data *table* that belongs to list-with-detail (A) — link out instead.

**Widget span keying rule.** How wide a widget sits in the grid is selected from
what the widget *is* by this exhaustive rule (derived, not inherited — ADR-0004);
`span` carries no default, so every widget states its width and none inherits one:

- **full width** — the page's single **primary trend** widget: the one
  time-series the whole dashboard is read against. At most one per page; a
  dashboard with no such series has none.
- **full width** — a **paired-period** widget: one metric's month figure and
  its year-to-date figure in one cell, month left, YTD right (stacked month
  first on the one-column layout). Being one cell, the pair never splits across
  grid rows, and full width makes two pairs two rows. The archetype's
  **period-pair** primitive fixes this width itself, so it takes no `span`.
  Its Layer 7 states replace both figures inside the same cell.
- **wide** — a **comparison / breakdown** widget whose body is multi-series or
  multi-category and becomes unreadable at one column: a conversion funnel, a
  stacked composition, a ranked bar list.
- **one column** — every other widget: a single figure, a short ranked list, a
  small table, a sparkline.

Two separate one-column widgets for a month and a YTD figure are forbidden: the
fixed column count wraps them so a pair can land split across two rows — use the
paired-period widget.

A widget that "looks cramped" is not grounds to widen it — either it matches one
of the two wider kinds above, or its body is too dense for a widget and belongs on
its own page.

## Edit mode (layout editing)
Edit mode changes the layout, never the figures, and keeps every other layer:
same frame, same grid, same span keying rule, same per-widget states.

- **Inline rename** — the `title` becomes the archetype's **title editor**: the
  name with a rename button; renaming swaps in an input at the title's own size
  (Enter or the save button saves, Escape cancels, blur saves; an unchanged or
  empty name saves nothing). The name stays the page's one heading.
- **Add** — "Add tile" is the primary header action; an empty grid shows the
  canonical empty state with the same action.
- **Remove / configure / reorder** — every widget carries the archetype's **edit
  controls** in its heading bar: move earlier, move later, configure, remove,
  each named after the tile. **Reorder is keyboard-operable**: the move buttons
  are ordinary buttons in tab order, disabled at the ends. Pointer
  drag-and-drop of a widget onto another is an addition on top, never the only
  way. Order is the layout — no free x/y placement, no resizable cells.
- **Tile config dialog** — adding or configuring a tile opens a **modal dialog
  owned by the consumer**; tile settings are never edited inline in the cell. The
  dialog sets what the tile *is* (its metric, its kind); its width is then
  derived by the Layer 6 span keying rule, so the dialog offers no width
  control.
- **Assignment** — who the layout applies to (assets, teams, sites) is the
  archetype's **assignment list**: a titled cell after the widget grid, one
  checkbox per target, each saving on its own with a per-row pending state.
- **Widget body** — still the consumer's: a live chart (live dashboard) or a
  summary of the tile's configuration (template editor).
- **Forbidden:** a hand-rolled sortable card list for the tiles; reorder by
  pointer drag only; a width/columns control in the config dialog; a page-level
  "Save layout" that batches every edit (each edit saves on its own).

## Layer 7 — States
- **Loading** — per-widget skeletons (a widget loads independently); never a
  single page-level spinner that blanks the whole dashboard.
- **Empty** — a widget with no data shows an inline "No data for this period"
  inside its cell, not a removed widget (keep the grid stable).
- **Error** — per-widget destructive inline message; the rest of the grid stays up.

## Layers 8–12
Data: one query per widget (or a batched endpoint), keyed by the active filters so
each filter combo caches separately; a freshness window ≥ 60s (dashboards tolerate
mild staleness). Types: a KPI shape + per-widget series shapes. Mutations: none on
the figures; in edit mode, layout mutations only (rename, add/configure/remove a
tile, reorder — optimistic, reverted on error — and toggle one assignment). Mobile: the grid is already responsive; the filter bar wraps. Permissions:
gate the whole route; gate individual widgets by hiding (not disabling) when a role
can't see a metric; hide the "Edit layout" toggle from a role that can't edit.

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

- [ ] **KPI row via the stat-tile / KPI-tile primitives** — headline metrics in
      the canonical tiles (tabular figures), **not** hand-built metric cards.
      *Wrapper tell:* a grid of bespoke stat cards next to/instead of the tile row.
- [ ] **Charts in titled widgets** via the widget primitive — cells of the one
      dashboard surface, no card-in-card; one chart lib/token palette, no
      literal series colors.
- [ ] **Loading/empty/error per widget** use canonical states, not per-chart spinners.
- [ ] **Single inset; no nested page padding** around the widget grid. **[spine] S1–S6.**

- [ ] **Edit mode (if the page edits its layout) via the archetype's title editor,
      widget edit controls and assignment list** — reorder works from the
      keyboard. *Wrapper tell:* a sortable list of bespoke tile cards beside or
      instead of the widget grid.

**SHOULD** (yellow, not red)

- [ ] Filter/date-range controls sit in `toolbar`, not scattered per widget.
- [ ] Number formatting (currency, %, deltas) is consistent and tabular.
- [ ] `span` follows Layer 6's widget span keying rule (primary trend full width ·
      comparison/breakdown wide · paired-period full width · everything else
      one column) — not a free choice,
      and no widget inherits a width it did not state.

---

## Version log

- **4.3** — paired-period widget kind: one metric's month and YTD figures in
  one full-width cell (the period-pair primitive), added to the Layer 6 span
  keying rule. The grid's column count is unchanged.

- **4.2** (ADR-0011) — edit mode: inline rename, add / configure (consumer
  dialog) / remove / keyboard-operable reorder of widgets, and the assignment
  list. Layer 1 now allows the layout (never the figures) to be edited.

- **4.0** (ADR-0008) — one page frame. The dashboard's name is the page
  `title` (once); filters are `toolbar`, export/share `actions`; the KPI row
  and the widget grid render inside the one surface as hairline-divided cells.
  Removed: `kicker`, `headerActions` (filters → `toolbar`, export → `actions`),
  the on-surface header bar, the board-form mat, widget cards.
