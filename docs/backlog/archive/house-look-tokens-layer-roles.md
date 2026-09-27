---
area: ui
opened: '2026-09-27'
status: done
value: high
model: opus
model_reason: "cross-cutting token + shell change with per-theme colour-mix tuning and a new scan check — judgment on percentages and scan parsing"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-27T09:00:00Z'
---

# House look slice 1: donor tokens layer roles and AppShell rhythm

## Context

ADR-0007 (`docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md`, sections 1, 3, 4) moves ring, sidebar accent, surface elevation, content width and display type into the donor-owned `src/styles/tokens.layer.css`, fixed by wiring rather than convention. Today `--ring` / `--sidebar-primary` / `--sidebar-ring` are brand values in `src/styles/tokens.css` (mistra ships a blue ring on teal), `AppShell`'s `<main>` is unbounded full-width at `p-4 md:p-6`, and the donor's own dark `--primary` is near-white slate. This slice is the foundation the `PageHeader`, `StatTile` and chart slices build on.

## What to do

- [ ] In `src/styles/tokens.layer.css` `@theme`, map `--color-ring`, `--color-sidebar-primary`, `--color-sidebar-ring` to `hsl(var(--primary))`; delete `--ring`, `--sidebar-primary`, `--sidebar-ring` from the donor `src/styles/tokens.css` (per ADR-0007 section 4).
- [ ] Add `--db-surface-sunken` / `--db-surface-canvas` / `--db-surface-raised` in a layer `:root` / `.dark` block as fixed `color-mix` of `--background` / `--foreground` (sunken < canvas < raised in both themes; mockup tones as starting values), expose them as `@theme` colours, and wire `AppShell`, `Sidebar`, `SectionCard`, `StatTileRow` to them — no border on a raised surface over the canvas, no border or fill on a raised surface nested in a raised one.
- [ ] Add `--db-content-max: 1180px` and the `@theme` type tokens `--text-display-title: 30px` / `--text-display-stat: 34px` (consumed by the follow-up slices).
- [ ] Make `AppShell`'s `<main>` a centred 1180px column with `p-4 md:p-12 xl:p-14`; the `matrix-grid`, `list-with-detail`, `kanban-board`, `calendar` shells render full-bleed (closed set, ADR-0007 section 1).
- [ ] Give the donor `tokens.css` a chromatic brand `--primary` whose `.dark` value shares the light hue.
- [ ] Add adoption-quality checks (`scripts/scan-adoption-quality.mjs` / `docs/audit-signals.json`, ADR-0005) flagging a brand `tokens.css` that declares `--ring`, `--sidebar-primary`, `--sidebar-ring`, `--chart-*` or any `--db-*`, and a dark `--primary` whose hue differs from the light one by more than 10° or whose saturation is below 30%.
- [ ] Update `docs/STYLE.md` (colour roles table, page inset, surfaces) to the shipped state.

## Acceptance

- A brand `tokens.css` that sets `--ring: 217 91% 60%` no longer changes the rendered focus ring; the ring renders in `--primary`.
- The gallery shows sidebar, canvas and raised cards as three distinct tones in light and dark mode, with no card-in-card border.
- `npm run scan:adoption-quality` reports a hit on a fixture `tokens.css` declaring `--ring`, and on one whose dark `--primary` is `210 40% 98%` against a teal light primary; it exits clean on the donor's own `tokens.css`.
- `npx tsc --noEmit` and `npm test` pass.

## Related

- [wip/house-look-adr.md](../archive/house-look-adr.md) — the decision ticket that filed this slice
- ADR-0007 — The fleet house look: donor-fixed roles vs brand-overridable roles
- ADR-0004 — appearance locality: global or fixed in the component
- [archive/tokens-brand-font-seam-and-split-guard.md](../archive/tokens-brand-font-seam-and-split-guard.md) — the layer/brand split this extends
- [archive/donor-status-token-roles-badge-alert-backport.md](../archive/donor-status-token-roles-badge-alert-backport.md) — prior roles-in-layer, values-in-brand precedent
