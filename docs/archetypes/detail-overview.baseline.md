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
- `<NestedPageHeading>` — the Mode B nested-page heading (an `<h2>` at one
  fixed scale, `NESTED_HEADING_CLASS` in `@/components/layout`). The shell
  composes it for the frame's header bar from the `title`/`subtitle`/
  `badges`/`actions` data — a page never calls it directly for this role.

The shell owns the page layout via **named slots** rendered in the canonical
order (see the contract's "Canonical slot order" section) and the Mode B
header's **typed data props** (`title`/`subtitle`/`badges`/`actions`), which it
renders through `<NestedPageHeading>`. Consumers fill the slots/props that
apply and omit the rest; they cannot reorder them. The shell also owns the
section stack's spacing (a single fixed measure between sections) and the
responsive collapse.

## Layout blueprint

The annotated blueprint that settled slot order, anchoring, and the ledger
design (v2.0 design review, 2026-06-12):
[`detail-overview-blueprint.svg`](detail-overview-blueprint.svg).

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each
contract role. Only layers with a baseline-specific binding appear.

### Canonical slot order
- `header` → Mode A: `<DetailOverviewHeader>` (page-level, above the shell). Mode B: the shell's `title`/`subtitle`/`badges`/`actions` data properties → the shell composes `<NestedPageHeading>` in its own framed header bar.
- `summary` slot → `<DetailSection>` (typically titled "Details", `flush`) wrapping `<KeyValueList>`.
- `stats` data → `<StatTileRow>` with `<StatTile>` cells — the shell renders the row from the `StatItem[]`, one `<StatTile>` per item.
- `references` slot → `<DetailSection>`.

### Layout variants — vertical & Command Rail
- Rail diagram's `stats` block → `<StatTileRow>` — aggregates.
- `summary` (rail aside) → `<KeyValueList>` + optional compact metric readout; sticky via `lg:sticky lg:top-6 self-start`, its own `~300px` column on `lg+`, full-width stacked above main below `lg`.
- Compact metric readout → a condensed, ruled `MetricList`/`MetricRow` (label left, tabular value right, disclosure for secondary figures) — no new primitive; still `summary`-slot.
- Responsive contract: aside is `lg:sticky lg:top-6 self-start`; the rail is `position: sticky`, never independently scrollable; stat strip / metric readout keep a `grid-cols-1 → sm:grid-cols-N` ramp.
- The single container model (one frame) → every slot's `<DetailSection>`s render inside the frame's border; the rail (aside) renders chromeless, flush, hairline-divided, lightly tinted (`bg-muted/20` + an inset `before:` hairline); its `<DetailSection>`s drop card chrome via a shell-internal `UnifiedSurfaceContext` provider (file-level export on `DetailOverviewShell.tsx`, not the barrel); `SectionCard` consumes that context for its chrome mode. The main column renders carded `<DetailSection>`s / the `<StatTileRow>` stat strip flattened to sit as panels in the frame (`[&_section]:shadow-none [&_section]:border-border/70` descendant selectors); there the context is `false`.
- Header fill → `headerFill.ts` / `HeaderFillContext` contract: `solid` (accent-filled, `bg-primary` + inverted bar text, default) / `tint` (`bg-muted` + hairline border) / `white` (`bg-card` + hairline border); set ONCE via `<AppShell headerFill>`. The shell reads the context (`useHeaderFill()`) and applies `headerFillClasses(fill).bar` to its Mode B header div. There is no per-shell override — the context is the only entry point (hard rule 12). Mode A's `<DetailOverviewHeader>` is a bare `<PageHeader>` with no fill.
- API shape (closed surface, v3) →
  ```tsx
  <DetailOverviewShell
    title={…}               // Mode B → <NestedPageHeading> title
    subtitle={…}            // Mode B → nested subline
    badges={…}              // Mode B → status chips (inline w/ title)
    actions={…}             // Mode B → right-aligned action row
    layout="rail"           // "vertical" (default) | "rail"
    width="md"              // "md" (default) | "none" | "lg" | "xl" (rail ignores width)
    summary={…}             // → aside (master data + optional compact metrics)
    stats={[…StatItem]}     // → main top; shell renders <StatTileRow> with
                            //   columns derived from stats.length (Math.min(max(len,2),4))
    content={<>…</>}        // → main
    references={…}          // → aside bottom
  />
  ```
  Mode A uses `<DetailOverviewHeader>` above the shell and omits `title`/`subtitle`/`badges`/`actions` here.
- Propagation mechanism → layout tweaks to `<DetailOverviewShell>` / `<DetailSection>` propagate baseline-wide via `/style-archetypes --update`.

### Layer 2 — Page shell
- Outer container → `<DetailOverviewShell>` (the frame: `rounded-lg border bg-card shadow-sm` + the `WIDTH_MAP` contained width in vertical layout).
- Section stack spacing → `space-y-4` inside both the main column and the rail, fixed in the shell — no per-page rhythm prop (see the contract's v3.0 note).
- Contained column width → `width="md"` → `max-w-3xl` (the shell's default); `lg` → `max-w-4xl`, `xl` → `max-w-6xl`, `none` → no constraint. Ignored under `layout="rail"`.

### Layer 3 — Page header
- Detail-overview header → `<DetailOverviewHeader>`.
- Canonical page-title type style → `text-lg font-semibold leading-tight tracking-tight`.
- Canonical page-header treatment → the baseline `<PageHeader>` layout primitive (`@/components/layout`); the title scale is `<PageHeader>`'s single source of truth.
- Canonical muted small-text style (subtitle) → `text-xs text-muted-foreground`
  — the header subtitle is compact *metadata* (created date, short identifier),
  not prose. `text-sm text-muted-foreground` is the prose scale, used for
  descriptions (`SectionHeading`, `CardDescription`, `StateView`) per
  `STYLE.md` ("prose/notes keep `text-sm`"). `<PageHeader>` is the single
  source of truth for both, and renders the subtitle at `text-xs`.
- Inline navigation link → `<Link>`.
- Button → `<Button>`.
- Status badges → Mode A: read-only `<Badge>`s via `<DetailOverviewHeader badges={…}>` (a `badges` prop on the shared `<PageHeader>`). Mode B: `title`/`subtitle`/`badges`/`actions` go to the shell, which composes `<NestedPageHeading>` in the framed header bar — a `<Badge>` chip rendered inline right of the `<h2>` title (same row, wrapping). No per-call class or scale: the heading's title sits at `NESTED_HEADING_CLASS` (`text-base font-medium leading-tight tracking-tight text-foreground`), the subtitle at `text-xs text-muted-foreground`, the actions row `flex shrink-0 items-center gap-3` right-aligned inside the bar.
- Mode B framed header bar → the shell's `title` presence renders a `<div className="px-5 py-4">` carrying `headerFillClasses(fill).bar` from `useHeaderFill()` (the `HeaderFillContext` set once at `<AppShell headerFill>`), wrapping the `<NestedPageHeading>`. No `headerFill` prop on the shell, no `<DetailOverviewHeader>` call.

### Layer 5 — Content wrapper
- Detail section → `<DetailSection>`.
- Forbidden whole-page wrap → `<Card>`.

### Layer 6 — Content sections

**6a. Stat strip**
- `<StatTileRow>` + `<StatTile>`.
- Column count → derived from `stats.length` by the shell: `columns = Math.min(Math.max(stats.length, 2), 4)` (a 1-item strip renders as 2 columns; the call site never passes `columns`). The strip is rendered from the `stats: StatItem[]` data, not from a `ReactNode` slot.
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
- Shared table primitive → shadcn/ui `<Table>` (`src/components/ui/table`), embedded directly inside the `<DetailSection>` — same shared molecule list-with-detail and settings-table render through (`docs/STYLE.md`).

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
- Shell owns the inset → page adds no outer `p-*`/`px-*`/`py-*`; the shell's `WIDTH_MAP` (`max-w-3xl` default in vertical) is the only width a page may pass; `<AppShell>`'s `<main>` is the sole inset owner.
- One outer frame, not a card scatter → EVERY page renders inside the shell's frame (`rounded-lg border bg-card shadow-sm`); the rail is the chromeless `bg-muted/20` aside, the main's carded `<DetailSection>`s/strip sit flattened inside it; the "scatter" drift is loose `<SectionCard>`s on the bare page background (i.e. content rendered beside or instead of the shell).
- Headline figures disclosure → the metric-list primitive is `MetricList`/`MetricRow`.
- Figures are mono (S5) → `font-mono tabular-nums`.
- Brand primary (S6) → the `--primary` token, with the target's token override applied.
- Semantic state (S4) → `text-destructive` for negative/at-risk values.
- Tokens + atoms only (S4) → avoid raw `<button>/<input>/<select>` where an atom exists.
- SHOULD: lifecycle stepper → `ProgressTracker`.
- SHOULD: `summary` master-data → `<KeyValueList>`/`<KeyValueRow>`.
- Scoring-example fix string → `"apply --font-mono to figures"`.
