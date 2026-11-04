---
area: archetypes
opened: 2026-11-04
status: done
value: normal
model: opus
model_reason: "archetype shape is the deliverable: new kind:page vs edit mode on analytics-dashboard is an open design tradeoff"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-04T00:00:00Z
---

# Archetype gap: editable dashboard tile-layout editor page

## Context

No `kind: page` archetype in `docs/archetypes/MANIFEST.json` fits an editable dashboard tile-layout editor. Consumer: controlling-app, page `frontend/src/app/admin/dashboard-templates/[id]/page.tsx` (613 lines) — inline rename of the template, tile add/remove/reorder, a `TileConfigDialog`, and asset assignment. `analytics-dashboard` is read-only (`docs/archetypes/analytics-dashboard.md` Layer 1: "no create/edit routes hang off it"; Layer 3: "No page-level write actions"), and `settings-table`, `form-page`, `detail-overview`, `kanban-board` and `matrix-grid` do not cover a reorderable tile canvas. Until this ships, the page stays on the `page-requires-archetype-shell` grandfathered list in controlling-app `_adherence.json` (RULES.md hard rule 12: no stopgap page, no-fit means a gap ticket here). Repro: remove the page from `grandfathered` in controlling-app and run `node scripts/lint-design.mjs`.

## What to do

- [ ] Decide and record (new ADR in `docs/adr/`, indexed in `docs/adr/INDEX.md`) whether the editor is a new `kind: page` archetype or an explicit edit mode of `analytics-dashboard`.
- [ ] Write the contract (`docs/archetypes/<slug>.md`, role-only per RULES.md rules 2–3) covering inline rename, tile add/remove/reorder, a tile config dialog slot, and asset assignment.
- [ ] Ship the typed export, sandbox demo (`src/examples/<slug>-demo.tsx`) and MANIFEST entry; a new archetype follows `/promote-archetype` or the fleet-synthesis path, with the `promoted_from` provenance question settled in the ADR.
- [ ] Make reorder keyboard-operable, not pointer-drag only.

## Acceptance

- design-baseline gains a `kind: page` archetype (or a documented ADR decision extending `analytics-dashboard` with an edit mode) whose contract covers inline rename, tile add/remove/reorder, a tile config dialog and assignment.
- The gallery demo shows the editor, and `npm run check:viewports` passes at the device triad.
- controlling-app can drop the page from the grandfathered list and `node scripts/lint-design.mjs` passes for it.

## Related

- [[archetype-convergence]]
- [[archetype-gap-waiver-needs-operator-approval]]
- [[page-requires-archetype-shell-no-pageframe-alone]]
- [[settings-sections-page-archetype]]
- [ADR-0001](/docs/adr/0001-grandfather-authored-report-calendar.md) — baseline never originates archetypes except the closed grandfathered set
- [analytics-dashboard contract](/docs/archetypes/analytics-dashboard.md)
