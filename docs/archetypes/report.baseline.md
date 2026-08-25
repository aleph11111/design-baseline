---
slug: report
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/report.md
---

# Report — baseline reference implementation

> The stack-specific binding of the [report contract](./report.md) to the
> **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell).
> Each role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<ReportShell>` + `<ReportLineTable>` / `<ReportLineRow>` + `<ReportTotalRow>` in `src/components/archetypes/report/`.

- **`<ReportShell>`** owns the bounded document surface: a `kicker` + `title` header bar (with a right-aligned `actions` slot) over a padded `children` body. `width` bounds the column (`sm` / `md` / `lg`).
- **`<ReportLineTable>` + `<ReportLineRow>`** are thin wrappers over the shared figure-table (shared `FigureTable` / `FigureRow`, `src/components/archetypes/shared/`) that owns the hairline-divided table signature — the 9.5px column-header overline (`COL_HEADER_CLASS`, `@/components/layout/overline`) and the `divide-y divide-border/70` row dividers. The report supplies its fixed 4-column grid (name · qty · unit · sum) and the row-level `items-center` + `meta` sub-line, so the table signature never drifts between documents (and shares one owner with the statement-with-filters archetype's table).
- **`<ReportTotalRow>`** is one row in the right-aligned totals stack; `total` tints and enlarges the grand-total row.

The parties row (issuer / recipient identity blocks + dates) is composed inline in the body — it is document-specific and earns no primitive.

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each contract role. Only sections with a baseline-specific binding appear.

### Structure
- Header bar region → `<ReportShell>` header, separated by `border-b`.
- Document body region → `<ReportShell>` children, `p-6`.
- Canonical monospace identifier style (title ID figure) → `font-mono`.
- Header action buttons → secondary `<Button variant="outline" size="sm">` (e.g. "PDF") + primary `<Button size="sm">` (e.g. "Senden").
- Header-fill contract → shared `--header-fill` contract (`headerFill.ts` / `HeaderFillContext`): `solid` (default, accent-filled) / `tint` (`bg-muted`) / `white` (hairline only). Set once per project on `<AppShell headerFill>`, overridable per document via `<ReportShell headerFill>`.
- Canonical monospace figure style (parties dates, line-item figures, totals) → `font-mono tabular-nums`.
- Line-item table primitive → `<ReportLineTable>` with `<ReportLineRow>`s (thin wrappers over the shared `FigureTable` / `FigureRow`).
- Canonical table-column-header overline style → shared `COL_HEADER_CLASS` (`@/components/layout/overline`: `text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground`), composed in the shared `FigureTable`'s header row — never re-typed at a call site.
- Totals stack width → `~w-60` right-aligned column.
- Total-row primitive → `<ReportTotalRow>`; muted-tint background on the grand-total row → `bg-muted/50`, larger mono figure.

### House style
- Flat bounded-card surface → the canonical `<SurfaceFrame>` chrome: `overflow-hidden rounded-lg border bg-card`, no shadow (owned by `SurfaceFrame`, never spelled by a shell).
- Faint hairline border (header separator) → `border-b border-border`.
- Hairline-divided table rows → `divide-border/70` (the shared `FigureTable`'s row body).
- Canonical overline/kicker style → shared `OVERLINE_CLASS` (`@/components/layout/overline`, 10.5px).
- Canonical table-column-header overline style → shared `COL_HEADER_CLASS` (`@/components/layout/overline`, 9.5px — the table-column-header rung of the overline scale; same binding as Structure).
- Canonical page-title type style → `text-lg font-semibold`.
- Body / meta text scales → `text-[13px]` (body) / `text-[11px]` (meta).
- Canonical monospace figure style → `font-mono tabular-nums`.
- Buttons → `<Button>` from `@/components/ui/button`, `size="sm"`; primary = default variant, secondary = `variant="outline"`.
- Brand/primary color token → `--primary` CSS custom property; donor leaves it at its neutral default.

### Forbidden patterns
- Bounded, constrained-width surface → `max-w-*`.
- Consumer-provided formatters → consumer `Intl` formatters (JS `Intl` API).

### Acceptance gate (baseline tells)
- Report shell → `<ReportShell>`.
- Line-item table primitive → `<ReportLineTable>` / `<ReportLineRow>`.
- Total-row primitive → `<ReportTotalRow>`.
- Canonical monospace figure style → `font-mono tabular-nums`.
- Consumer-provided formatter → consumer `Intl` formatter.
