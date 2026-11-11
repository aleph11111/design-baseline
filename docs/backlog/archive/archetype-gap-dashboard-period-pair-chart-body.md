---
area: archetypes
opened: '2026-11-11'
status: done
value: high
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-11T00:00:00Z'
---

# Archetype gap: DashboardPeriodPair accepts chart bodies per half

## Context

`DashboardPeriodPair` (`src/components/archetypes/analytics-dashboard/DashboardPeriodPair.tsx`, v0.35.0) types `month` / `ytd` as `DashboardPeriodFigure` (`StatTile` label / value / hint) and renders two `StatTile`s. The consumer that motivated it, controlling-app `/workspace/dashboard`, pairs CHART tiles: each KPI (Gesamtleistung, Rohertrag, EBITDA, EBIT, EBT; dashboard `aedcb13f…`) has adjacent `this_month` + `ytd` tiles with `chart_type` `bar` or `bar_with_margin` — a 3-bar Recharts comparison (actual / prior year / budget), optionally with margin pills underneath. With figures only, controlling-app cannot adopt the widget, and on the 3-column `lg` grid of `DashboardGrid` its 1-col month and YTD chart tiles still drift across rows (Gesamtleistung YTD lands beside Rohertrag Monat). Operator decision 2026-11-11: the consumer auto-pairs, no new config option — the chart-body form is the only blocker.

## What to do

- [ ] Let each of `month` / `ytd` take either the existing figure form or `{ label, body: React.ReactNode }`; keep the figure form working unchanged (backward compatible).
- [ ] Keep the full-width rule (`span={3}`, no `span` prop), month left / YTD right, stacked on 1 column; render each half's `label` as its own sub-heading ("Monat" / "YTD").
- [ ] Add an optional per-half `actions` slot (edit button etc.) next to the sub-heading so the consumer keeps per-tile edit buttons.
- [ ] Add a `DashboardPeriodPair.test.tsx` case for the body form (sub-headings, body rendered, actions slot, month before YTD) next to the existing figure cases.
- [ ] Add a gallery example in `src/examples/analytics-dashboard-demo.tsx` with two chart-body pairs (per the living-demos convention), extend the Layer 6 / widget-kind text in `docs/archetypes/analytics-dashboard.md` and its version log, and release as a minor tag v0.36.0.

## Acceptance

- A pair given `{ label, body }` halves shows each label as a sub-heading with its body beneath, month left of YTD at `sm` and up, stacked on one column.
- A pair given the figure form renders exactly as in v0.35.0 (existing tests unchanged and green).
- A per-half `actions` node shows beside that half's sub-heading and not beside the other's.
- Two chart-body pairs in one grid show as two full-width rows at `lg`, with `DashboardGrid`'s column count unchanged and no new column-count prop.

## Related

- [[archetype-gap-dashboard-paired-period-tiles]] — shipped the figure-only `DashboardPeriodPair` this extends
- [[analytics-dashboard-column-span-props-unclosed]] — rule-12 question on column/span props
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — width derived from the widget kind, not a prop
- [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md) — edit mode shares the grid and span keying rule
