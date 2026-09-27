---
area: ui
opened: '2026-09-27'
status: ready
value: normal
model: sonnet
model_reason: "restyle of an existing prop on StatTile against a decided ADR"
depends_on: [house-look-tokens-layer-roles]
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-27T09:00:00Z'
---

# House look slice 3: StatTile headline value and context line

## Context

ADR-0007 sections 2 and 6: a KPI value is a headline number at 34px and never stands alone — a context line (comparison, period, delta) sits under it. `src/components/layout/StatTile.tsx` renders the value at `text-2xl` and already has an optional `hint` caption at `text-xs text-muted-foreground`; `hint` becomes the documented context line.

## What to do

- [ ] Move the `StatTile` value from `text-2xl` to `text-display-stat` (token from slice 1).
- [ ] Keep `hint` as the context-line prop (optional — presence is data, not appearance); fix its spacing/typography in the component and rewrite its docstring as the context line.
- [ ] Update the `analytics-dashboard` and `detail-overview` demos in `src/examples/` so every demo tile carries a context line.
- [ ] Update `docs/STYLE.md` and `src/components/layout/StatTileRow.test.tsx` if they pin the old class.

## Acceptance

- Gallery KPI tiles render the value at 34px with a context line under it in every demo.
- `StatTile` exposes no size/variant prop after the change.
- `npm test` passes.

## Related

- [wip/house-look-adr.md](wip/house-look-adr.md) — the decision ticket that filed this slice
- ADR-0007 — The fleet house look: donor-fixed roles vs brand-overridable roles
- ADR-0004 — appearance locality: global or fixed in the component
- [house-look-tokens-layer-roles.md](house-look-tokens-layer-roles.md) — must ship first: it defines the `--text-display-stat` token and the raised surface the tile row sits on
