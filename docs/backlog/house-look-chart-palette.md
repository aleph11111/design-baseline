---
area: ui
opened: '2026-09-27'
status: ready
value: normal
model: opus
model_reason: "picking five fixed hues that stay distinct from any brand chart-1 in both themes is a contrast judgment"
depends_on: [house-look-tokens-layer-roles]
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-27T09:00:00Z'
---

# House look slice 5: shared chart palette with fixed series order

## Context

ADR-0007 section 8: `--chart-1` … `--chart-6` become donor-fixed roles in `src/styles/tokens.layer.css` with a fixed series order — `--chart-1` follows `--primary`, `--chart-2..6` are donor hues under `--db-chart-*` for both themes. Today the donor ships no chart palette; mistra, hk-crm and controlling-app each invent a different `--chart-*` order and controlling-app hardcodes hex in recharts. The `analytics-dashboard` archetype is chart-agnostic (`src/examples/analytics-dashboard-demo.tsx`).

## What to do

- [ ] Add `--color-chart-1: hsl(var(--primary))` and `--color-chart-2..6` from `--db-chart-2..6` (light + dark values) to the layer.
- [ ] Choose `--chart-2..6` hues that stay distinguishable from each other and from common brand accents (teal, blue, slate, green) in both themes; record the check in `docs/STYLE.md`.
- [ ] Show the palette in the gallery (a swatch strip in the analytics-dashboard demo) per the living-demos rule.
- [ ] Extend the slice-1 adoption-quality check to flag hex literals passed to chart components' colour props.

## Acceptance

- The gallery renders six chart swatches in the fixed order in light and dark mode, and `--chart-1` changes when `--primary` changes.
- A brand `tokens.css` declaring `--chart-2` has no effect on the rendered palette and is reported by `npm run scan:adoption-quality`.
- `npm test` passes.

## Related

- [wip/house-look-adr.md](archive/house-look-adr.md) — the decision ticket that filed this slice
- ADR-0007 — The fleet house look: donor-fixed roles vs brand-overridable roles
- ADR-0004 — appearance locality: global or fixed in the component
- [house-look-tokens-layer-roles.md](wip/house-look-tokens-layer-roles.md) — must ship first: it introduces the `--db-` fixed-role block and the scan check this slice extends
