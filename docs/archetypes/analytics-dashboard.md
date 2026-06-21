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
> the KPI row, the widget grid, the widget card chrome, the filter bar — and the
> consumer drops its own chart components (recharts / nivo / visx / …) into the
> widget bodies. A baseline that mandated a chart lib would not be re-skinnable.

## Primitives

- `<DashboardGrid columns={2|3|4}>` — the responsive widget grid (collapses to 1
  col, then 2 at `sm`, then `columns` at `lg`). **The only new chrome this
  archetype adds.**
- `<DashboardWidget title span={1|2|3}>` — one widget card; a thin wrapper over the
  shared `<SectionCard>` (same ruled title bar) plus a grid column span. Body is
  chart-agnostic.
- **Reused (all shared `layout/` primitives — G has no dependency on other
  archetypes):** `<StatTileRow>` / `<StatTile>` (the KPI row — same strip as
  detail-overview's `stats` slot), `<SectionCard>` (the widget surface), and
  `<PageHeader>` (the title).

## Layer 1 — Route config
A top-level route (e.g. `/dashboard`, `/reports`, `/analytics`). Lazy + suspense
like any page. Read-only — no create/edit routes hang off it.

## Layer 2 — Page shell
Renders inside `<AppShell>` (its `<main>` supplies the page inset; the page adds none). Outer container `space-y-6`. An
`<ErrorBoundary>` wraps content; per-widget fetch errors degrade to a per-widget
message, never a blank page.

## Layer 3 — Page header
`<PageHeader>` with the dashboard title + optional subtitle. No page-level write
actions (the page is read-only); an export/share affordance may sit in the header
`actions` slot.

## Layer 4 — Toolbar (filter bar)
A filter bar below the header: a **period** control (segmented `Week / Month /
Quarter / Year` or a date-range picker) and zero or more **segment** filters
(channel, category, region) as selects/pills. Changing a filter re-scopes the
KPIs and every widget. Filter state is consumer-owned (URL-synced is encouraged so
a dashboard view is shareable).

## Layer 5 — KPI row
A `<StatTileRow columns={2|3|4}>` of `<StatTile>`s — the headline numbers, each
with an optional comparison `hint` ("vs last month"). Pre-format values; the tile
never formats.

## Layer 6 — Widget grid
A `<DashboardGrid>` of `<DashboardWidget>`s. Each widget: a short title, optional
in-bar control (a range toggle), and a body that is a chart, a number, or a small
ranked list/table. Use `span` for wider widgets (a primary trend line spans 2–3).
**Forbidden:** a hand-rolled grid of bare `<Card>`s — use `<DashboardWidget>` so
widgets share the section chrome; embedding an interactive data *table* that
belongs to list-with-detail (A) — link out instead.

## Layer 7 — States
- **Loading** — per-widget skeletons (a widget loads independently); never a
  single page-level spinner that blanks the whole dashboard.
- **Empty** — a widget with no data shows an inline "No data for this period"
  inside its card, not a removed widget (keep the grid stable).
- **Error** — per-widget destructive inline message; the rest of the grid stays up.

## Layers 8–12
Data: one query per widget (or a batched endpoint), keyed by the active filters so
each filter combo caches separately; a freshness window ≥ 60s (dashboards tolerate
mild staleness). Types: a KPI shape + per-widget series shapes. Mutations: none
(read-only). Mobile: the grid is already responsive; the filter bar wraps. Permissions:
gate the whole route; gate individual widgets by hiding (not disabling) when a role
can't see a metric.

---

## Acceptance gate

> **Axis-C (adoption-quality) checklist** — the canonical list a page adopting this
> archetype is scored against (see [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md)).
> A page that composes this archetype's shell is **conformant** only when every
> REQUIRED box passes; one that fails any REQUIRED box is a 🔴 **wrapper adoption**,
> routed to the teardown ritual ([`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`](../DETAIL-PAGE-TEARDOWN-PLAYBOOK.md)).
> `adoptionQuality.score = REQUIRED passed ÷ REQUIRED applicable`; `wrapper = true`
> when score < 1.0. **[spine]** = the shared conformance spine **S1–S6** (single inset ·
> shell-not-hand-rolled · canonical states · atoms+tokens · mono figures · brand
> primary), defined in [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md).

**REQUIRED**

- [ ] **KPI row via `StatTileRow`/`StatTile`** — headline metrics in the canonical
      tiles (mono/tabular), **not** hand-built metric `<Card>`s. *Wrapper tell:* a
      grid of bespoke stat cards next to/instead of the tile row.
- [ ] **Charts in titled section cards** with consistent chrome; one chart lib/token
      palette, no literal series colors.
- [ ] **Loading/empty/error per widget** use canonical states, not per-chart spinners.
- [ ] **Single inset; no nested page padding** around the widget grid. **[spine] S1–S6.**

**SHOULD** (yellow, not red)

- [ ] Filter/date-range controls sit in one toolbar, not scattered per widget.
- [ ] Number formatting (currency, %, deltas) is consistent and mono.
