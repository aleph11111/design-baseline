---
slug: analytics-dashboard
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/analytics-dashboard.md
---

# Analytics dashboard — baseline reference implementation

> The stack-specific binding of the [analytics-dashboard contract](./analytics-dashboard.md)
> to the **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell).
> Each role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

- `<DashboardShell kicker title headerActions headerFill>` — the primary bounded
  surface (Plex Ledger board form): an on-surface `<SurfaceHeader>` (kicker +
  title left, actions right) at the top of the card, with the KPI row rendered
  in the body below. There is no separate `toolbar`/`filters` slot — see Layer 4.
- `<DashboardGrid columns={2|3|4}>` — the responsive widget grid (collapses to 1
  col, then 2 at `sm`, then `columns` at `lg`).
- `<DashboardWidget title span={1|2|3}>` — one widget card; a thin wrapper over the
  shared `<SectionCard>` (same ruled title bar) plus a grid column span. Body is
  chart-agnostic.
- **Reused (all shared `layout/` primitives — G has no dependency on other
  archetypes):** `<StatTileRow>` / `<StatTile>` (the KPI row — same strip as
  detail-overview's `stats` slot) and `<SectionCard>` (the widget surface).
  `<PageHeader>` is **not** used — the on-surface `<SurfaceHeader>` inside
  `<DashboardShell>` is the title.

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each
contract role. Only layers with a baseline-specific binding appear.

### Layer 1 — Route config
- Lazy-load boundary → `lazy()` wrapping the page import, with `<Suspense fallback={null}>` at the route definition, like any page.

### Layer 2 — Page shell
- Top-level app shell → `<AppShell>`.
- Canonical vertical rhythm → outer container `space-y-6`.
- Render-error boundary → `<ErrorBoundary>`.

### Layer 3 — Page header
- Content-shell primitive → `<DashboardShell kicker title headerActions headerFill>`.
- On-surface header bar → `<SurfaceHeader>` (Plex Ledger board form), mounted by `<DashboardShell>` at the top of the card.
- Canonical page-header treatment → **not used**; there is no detached `<PageHeader>` above the card.

### Layer 4 — Toolbar (filter bar)
- One-of-N segmented control → `<SegmentedControl>` for the period control (`Week / Month / Quarter / Year`).
- Filter bar placement → page-composed, passed into `<DashboardShell headerActions>`, so it renders inline in the `<SurfaceHeader>` actions row alongside any export/share action — the shape the reference demo (`src/examples/analytics-dashboard-demo.tsx`) ships.

### Layer 5 — KPI row
- Stat-tile / KPI-tile primitives → `<StatTileRow columns={2|3|4}>` of `<StatTile>`s (same strip as detail-overview's `stats` slot).

### Layer 6 — Widget grid
- Widget-grid primitive → `<DashboardGrid columns={2|3|4}>` (collapses to 1 col, then 2 at `sm`, then `columns` at `lg`).
- Widget-card primitive → `<DashboardWidget title span={1|2|3}>`, a thin wrapper over the shared `<SectionCard>` (same ruled title bar) plus a grid column span.
- Bare-card ban → a hand-rolled grid of bare `<Card>`s is forbidden; use `<DashboardWidget>`.

## Acceptance gate (baseline tells)
- KPI row → `<StatTileRow>`/`<StatTile>`; hand-built metric `<Card>`s fail this box.
- Widget grid → `<DashboardGrid>` of `<DashboardWidget>`s; a hand-rolled grid of bare `<Card>`s fails "one shell owns the widget chrome".
