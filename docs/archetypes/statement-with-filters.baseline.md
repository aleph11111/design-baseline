---
slug: statement-with-filters
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/statement-with-filters.md
---

# Statement with filters — baseline reference implementation

> The stack-specific binding of the [statement-with-filters
> contract](./statement-with-filters.md) to the **design-baseline** stack
> (shadcn/ui + Tailwind 4 + the sidebar app shell). Each role in the contract
> is bound here to a concrete primitive + class strings. A project on a
> different stack does **not** need this file.

## Primitive binding

- **`<StatementWithFiltersShell>`** in `src/components/archetypes/statement-with-filters/`
  — the one primitive that owns this archetype's chrome: the page header (via
  `<SurfaceHeader>` — kicker + title + `headerActions` band) over a single flat
  bounded card — the canonical `<SurfaceFrame>` chrome (`overflow-hidden rounded-lg border bg-card`, no shadow, owned by `SurfaceFrame`) — that holds the
  governed statement. `title` adopts the canonical page-title style; the
  **toolbar** is a `ReactNode` composition slot (`actions`) — content, not
  appearance — so the shell never prescribes how many or what kind of
  selectors a page scoping band carries. `headerActions` may additionally carry
  one page-level action button (the allowed-variation freeze/publish kind).
- **`<StatementTable columns>`** — the hairline-divided governed table: a
  thin wrapper over the shared figure-table (shared `FigureTable` /
  `FigureRow`, `src/components/archetypes/shared/`) that owns the
  column-header row (canonical *table-column-header overline* — shared
  `COL_HEADER_CLASS` from `@/components/layout/overline`:
  `text-[9.5px] font-semibold uppercase tracking-[0.09em]
  text-muted-foreground`), the `divide-y divide-border/70` hairline row
  dividers, and the canonical **mono tabular figure** style on numeric cells
  (`font-mono tabular-nums`, right-aligned; the terminal column `font-semibold
  text-foreground`). The statement supplies its derived N-column grid (label
  column fluid; numeric columns fixed 5.5rem, via the shared static
  `statementGridClass` lookup) plus row-level `indent` tiers and `section`
  rows; `<StatementTotalRow>` is the tinted, fully-emphasized totals row.
  **Rendered read-only by construction** — the primitive exposes no
  cell-editing props (the read-only rule is a structural boundary, not a
  convention). A tree of rows (group → children) is rendered by indentation +
  repeated rows, not by expandable rows.

- **Reused:** `<SurfaceHeader>` (header bar), `<ErrorBoundary>` (Layer 2),
  `<StatTileRow>` (headline-number allowed variation), `Select` /
  `SegmentedControl` (toolbar selectors — the baseline's labeled-select and
  segmented-toggle controls, `ui/select` + `ui/segmented-control`).

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each
contract role. Only layers with a baseline-specific binding appear.

### Layer 2 — Page shell
- Top-level app shell → `<AppShell>`; its `<main>` supplies the page inset,
  the page adds none.
- Render-error boundary → `<ErrorBoundary>`.

### Layer 3 — Page header
- Canonical page header with the scoping band → `<StatementWithFiltersShell kicker title actions>`
  (the shell's `<SurfaceHeader>` bar: kicker + title + right-aligned `headerActions`).
- Scoping selectors → a `ReactNode` composition slot on the shell (`actions`),
  composed from the labelled `Select` / `SegmentedControl` controls in the
  page module.
- Toolbar class strings → the actions band is right-aligned (`flex justify-end
  gap-2`); each selector keeps its own intrinsic width (no `w-[…]` stretch).

### Layer 4 — Toolbar
- View-scoping select → `Select` (`SelectTrigger size="sm"` `aria-label` per
  selector — a11y label is mandatory: the band has no persistent per-selector
  text).
- View-scoping toggle (≤2–3 choices) → `SegmentedControl`.
- Decimal/figure toggle → `SegmentedControl` (two choices) or a labelled
  `Select`.
- Page-level action (allowed variation) → `Button size="sm" variant="outline"`.

### Layer 5 — Content wrapper
- Bounded statement surface → the shell body: `p-4` inside `rounded-lg border
  bg-card` (flat card, no shadow — house style B).
- Horizontal scroll of the statement body → the body owns its own
  `overflow-x-auto`; the shell card clips.

### Layer 6 — Table / grid
- Governing table primitive → `<StatementTable columns={[…]}>` with
  `<StatementRow>` / (`<StatementTotalRow>`) — thin wrappers over the shared
  `FigureTable` / `FigureRow` (`src/components/archetypes/shared/`), so the
  table signature is one edit to change and is shared with the report
  archetype's table.
- Column grid → the shared static `statementGridClass(count)` lookup (label
  column fluid, numeric columns fixed 5.5rem) — no runtime class
  composition; every emitted template is scanner-visible.
- Column-header overline → shared `COL_HEADER_CLASS`
  (`@/components/layout/overline`, `text-[9.5px] font-semibold uppercase
  tracking-[0.09em] text-muted-foreground`) composed in the shared
  `FigureTable`'s header row (bottom hairline) — never re-typed at a call
  site.
- Numeric figure → the built-in mono tabular class set on value cells
  (`font-mono tabular-nums text-right`; `text-muted-foreground` for the
  middle columns, `font-semibold text-foreground` for the terminal column).
- Tree indentation → the caller composes `<StatementRow indent>` (no tree
  primitive; expandable-rows are outside the contract).

### Layer 7 — States
- Loading → `StateView`-equivalent text loader centred `p-8` (or the
  `skeleton-loader` primitive, `Sk` — a statement's row shape is known ahead
  of the fetch).
- Error → the shell-level destructive `<Alert>` (`AlertTriangle` +
  `AlertTitle` + `AlertDescription` with the optional `Try again`
  `variant="outline" size="sm" w-fit`).
- Empty → a canonical empty block (`p-8 text-center text-sm
  text-muted-foreground`).

## Acceptance gate (baseline tells)

- **One shell owns the statement chrome** → `<StatementWithFiltersShell>` +
  `<StatementTable>`; a hand-rolled card + a hand-rolled header + a bare
  `<table>` fail.
- **Scoping band in the header actions region** → the shell's `actions`
  `ReactNode` slot; a hand-rolled `flex justify-between` selector row above
  the card fails.
- **Mono tabular figures** → the primitive's built-in cell classes; hand-
  rolling the mono style per page is drift the gate flags.
- **Read-only by construction** → no editable-control prop on
  `<StatementTable>`; any inline `<input>`/`<select>`/`<textarea>` inside a
  cell is a contract break (that shape is settings-table / list-with-detail,
  not statement-with-filters).
