---
slug: detail-overview
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/detail-overview.md
blueprint: docs/archetypes/detail-overview-blueprint.svg
---

# Detail overview — baseline reference implementation

> The stack-specific binding of the [detail-overview contract](./detail-overview.md)
> to the **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell).
> Each role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<DetailOverviewShell>` in `src/components/archetypes/detail-overview/` — the
outer container for the route. Composed alongside:

- `<DetailOverviewHeader>` — optional standalone header (title + actions row).
- `<DetailSection>` — the bounded section surface: ruled overline title bar
  (`OVERLINE_CLASS` label + right-aligned actions), `flush` or padded content,
  graded `tone` (`default` flat hairline card — border, no shadow — `muted`
  for the lightest sections). A thin wrapper over the shared `<SectionCard>`
  layout primitive (the same titled-section shape grouped-list and form-page
  use). Every zone below the header renders inside one; the shadcn `<Card>`
  family is not used directly at section level.
- `<StatTileRow>` + `<StatTile>` — the unified aggregate strip: ONE bounded
  surface with internal hairline dividers, overline labels, tabular values.
  (Now shared `layout/` primitives — also used by the analytics-dashboard KPI
  row — and re-exported from this archetype's barrel for back-compat.)
- `<KeyValueList>` + `<KeyValueRow>` — ruled master-data rows: label left,
  value right, hairline dividers; `block` rows for long free-text.

The shell owns the page layout via **named slots** rendered in the canonical
order (see the contract's "Canonical slot order" section). Consumers fill the
slots that apply and omit the rest; they cannot reorder them. The shell also
enforces vertical rhythm and responsive collapse.

## Layout blueprint

The annotated blueprint that settled slot order, anchoring, and the ledger
design (v2.0 design review, 2026-06-12):
[`detail-overview-blueprint.svg`](detail-overview-blueprint.svg).

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each
contract role. Only layers with a baseline-specific binding appear.

### Canonical slot order
- `header` slot → `<DetailOverviewHeader>`.
- `summary` slot → `<DetailSection>` (typically titled "Details", `flush`) wrapping `<KeyValueList>`.
- `stats` slot → `<StatTileRow>` with `<StatTile>` cells.
- `references` slot → `<DetailSection>`.

### Layout variants — vertical & Command Rail
- Rail diagram's `stats` block → `<StatTileRow>` — aggregates.
- `summary` (rail aside) → `<KeyValueList>` + optional compact metric readout; sticky via `lg:sticky lg:top-6 self-start`, its own `~300px` column on `lg+`, full-width stacked above main below `lg`.
- Compact metric readout → a condensed, ruled `MetricList`/`MetricRow` (label left, tabular value right, disclosure for secondary figures) — no new primitive; still `summary`-slot.
- Responsive contract: aside is `lg:sticky lg:top-6 self-start`; the rail is `position: sticky`, never independently scrollable; stat strip / metric readout keep a `grid-cols-1 → sm:grid-cols-N` ramp.
- Surface `"separated"` → each slot's `<DetailSection>`s are individually bordered cards with gaps.
- Surface `"unified"` → the rail (aside) renders chromeless, flush, hairline-divided, lightly tinted (`bg-muted/40`); its `<DetailSection>`s drop card chrome via a rail-scoped `UnifiedSurfaceContext`; `SectionCard` gains a `chrome` prop consumed by that context. The main column keeps carded `<DetailSection>`s / `<StatTileRow>` with gaps — the context is false there.
- Header fill (unified) → `--header-fill` contract via `headerFill.ts` / `HeaderFillContext`: `solid` (accent-filled, default) / `tint` (`bg-muted`) / `white` (hairline only); set via `<AppShell headerFill>`, overridable via `<DetailOverviewShell headerFill>`. The separated header is a bare `<PageHeader>` with no fill.
- API shape →
  ```tsx
  <DetailOverviewShell
    layout="rail"            // "vertical" (default) | "rail"
    surface="unified"        // "separated" (default) | "unified"
    header={<DetailOverviewHeader … />}
    summary={…}              // → aside (master data + optional compact metrics)
    stats={…}                // → main top (omit if surfaced in summary)
    content={<>…</>}         // → main
    references={…}           // → aside bottom
  />
  ```
- Propagation mechanism → layout/surface tweaks to `<DetailOverviewShell>` / `<DetailSection>` propagate baseline-wide via `/style-archetypes --update`.

### Layer 2 — Page shell
- Outer container → `<DetailOverviewShell>` (or `<div className="space-y-{4|5}">` matching its contract).
- Vertical rhythm → `space-y-5` (default record-page rhythm) or `space-y-4` (compact, short pages).
- Contained column width → `width="md"` → `max-w-3xl`.

### Layer 3 — Page header
- Detail-overview header → `<DetailOverviewHeader>`.
- Canonical page-title type style → `text-lg font-semibold leading-tight tracking-tight`.
- Canonical page-header treatment → the baseline `<PageHeader>` layout primitive (`@/components/layout`); the title scale is `<PageHeader>`'s single source of truth.
- Canonical muted small-text style (subtitle) → `text-sm text-muted-foreground`.
- Inline navigation link → `<Link>`.
- Button → `<Button>`.
- Status badges → read-only `<Badge>`s, via `<DetailOverviewHeader badges={…}>` (a `badges` prop on the shared `<PageHeader>`).

### Layer 5 — Content wrapper
- Detail section → `<DetailSection>`.
- Forbidden whole-page wrap → `<Card>`.

### Layer 6 — Content sections

**6a. Stat strip**
- `<StatTileRow>` + `<StatTile>`.
- Overline label → `OVERLINE_CLASS` (`text-[10.5px] font-semibold uppercase tracking-[0.09em]`, muted).
- Large value → `text-2xl font-mono font-semibold tabular-nums`.
- Optional hint → `text-xs` muted.
- Responsive collapse → `grid-cols-1` stacked with horizontal hairlines on narrow viewports, `sm:grid-cols-N` with vertical hairlines from `sm` up.
- Forbidden fixed layout → `grid-cols-3`.

**6b. Key/value rows**
- `<KeyValueList>` rendering a ruled `<dl>` (`divide-y`) of `<KeyValueRow>` children.
- Label → `text-sm text-muted-foreground`.
- Value → `text-sm font-medium`, right-aligned, `tabular-nums`.
- `block` prop on `<KeyValueRow>` → stacked label-over-value at `leading-relaxed`.

**6c. Bounded section**
- `<DetailSection>` `title` → rendered via the shared `<SectionHeading>` primitive; detail-overview adds the ruled `border-b` bar around it.
- `flush` rows own `px-5` padding and `divide-y` hairlines; default (non-flush) content gets `px-5 py-4` padding.
- Do not use the shadcn `<Card>` family directly at section level; `<Card>` remains fine for smaller surfaces nested inside a section.
- Surface grading → default tone / `tone="muted"`.

**6d. Embedded read-only table**
- Shared table primitive → `<RecordTable>` / equivalent (same primitive used by list-with-detail pages).
- Forbidden inline markup → `<Table>`.

**6f. Reference panel**
- Renders inside `<DetailSection>`.

### Layer 7 — Empty / loading / error states
- Feature-availability gate early return → a single `<Card>`.

### Layer 10 — Mutations & invalidation
- Out-of-band edit link → `<Link>`.

### Layer 11 — Mobile variant
- Stat strip collapse → `grid-cols-1` → `sm:grid-cols-N`.
- Embedded table scroll → `overflow-x-auto`.
- Section stacking rhythm → the shell's `space-y-*`.
- Forbidden hard-coded layout → `grid-cols-{2,3,4}` without a `sm:` / `md:` / `lg:` ramp.

### Forbidden patterns (top-level)
- #7 whole-page card wrap → `<Card>`.
- #6 fixed grid → `grid-cols-*`.

### Migration notes
- Custom section component examples → `<ExternalLinksPanel>`, `<ActivityTimeline>`.
- Custom stat-tile renderer → formatted node values passed into `<StatTile>`.
- Detail-section boundary → `<DetailSection>`.

## Acceptance gate (baseline tells)
- `summary` master-data → `<KeyValueList>`.
- Content stacked, not tabbed → `<DetailSection>`s; a tab-group primitive → `<TabsList>`.
- Primary records visible without interaction → rendered directly in a `<DetailSection>`.
- Shell owns the inset → page adds no outer `p-*`/`px-*`/`py-*`; only `space-y-*` (+ optional `max-w-*` in vertical); `<AppShell>`'s `<main>` is the sole inset owner.
- One outer frame, not a card scatter → carded `<DetailSection>`s live inside the frame; the "scatter" drift is loose `<SectionCard>`s on the bare page background.
- Headline figures disclosure → the metric-list primitive is `MetricList`/`MetricRow`.
- Figures are mono (S5) → `font-mono tabular-nums`.
- Brand primary (S6) → the `--primary` token, with the target's token override applied.
- Semantic state (S4) → `text-destructive` for negative/at-risk values.
- Tokens + atoms only (S4) → avoid raw `<button>/<input>/<select>` where an atom exists.
- SHOULD: lifecycle stepper → `ProgressTracker`.
- SHOULD: `summary` master-data → `<KeyValueList>`/`<KeyValueRow>`.
- Scoring-example fix string → `"apply --font-mono to figures"`.
