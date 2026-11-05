---
area: archetypes
opened: 2026-11-04
status: done
value: normal
model: opus
model_reason: "archetype shape is the deliverable: palette + editable tree + coverage + version history slot set, and new kind:page vs variant, are open design"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-04T00:00:00Z
---

# Archetype gap: report-structure builder page

## Context

No `kind: page` archetype in `docs/archetypes/MANIFEST.json` fits a report-structure builder. Shape: (1) an account palette, (2) an editable, hierarchical, drag-and-drop line tree, (3) a coverage check (which accounts are not yet placed), (4) version history, (5) a template list with Neu / clone. Consumers in controlling-app: `workspace/pnl-builder` (grandfathered in `_adherence.json`, blocked) and the planned `workspace/bs-builder` (ticket `bs-builder-eigener-bs-bericht-authoring`). None of `list-with-detail`, `form-page`, `settings-table`, `matrix-grid`, `statement-with-filters` or `report` covers an editable tree beside a palette; controlling-app's `cashflow-builder` only sits on `statement-with-filters` because it is display-only. Pattern doc in controlling-app: `docs/patterns/frontend-structure-builder.md`. Until this ships, the consumer pages stay blocked or grandfathered (RULES.md hard rule 12: no stopgap page, no-fit means a gap ticket here).

## What to do

- [x] Read controlling-app `docs/patterns/frontend-structure-builder.md` and the `pnl-builder` page, then decide and record (new ADR in `docs/adr/`, indexed in `docs/adr/INDEX.md`) whether the builder is a new `kind: page` archetype (working slug `structure-builder`) or an edit mode of an existing one; settle the `promoted_from` provenance question in the same ADR (ADR-0001: baseline never originates archetypes).
- [x] Write the contract (`docs/archetypes/<slug>.md`, role-only per RULES.md rules 2–3) with slots for palette, tree, coverage panel, version history and template list, plus the Neu / clone entry.
- [x] Ship the typed export, sandbox demo (`src/examples/<slug>-demo.tsx`) and MANIFEST entry; follow `/promote-archetype` or the fleet-synthesis path.
- [x] Make tree reorder, re-parent and palette-to-tree placement keyboard-operable, not pointer-drag only.

## Acceptance

- design-baseline gains a `kind: page` archetype (or a documented ADR decision for an edit mode) whose contract covers palette, hierarchical line tree, coverage check, version history and template list with Neu / clone.
- The gallery demo shows the builder, and `npm run check:viewports` passes at the device triad.
- Tree reorder and re-parent complete by keyboard alone.
- controlling-app can drop `workspace/pnl-builder` from the grandfathered list and `node scripts/lint-design.mjs` passes for it.

## Related

- [[archetype-convergence]]
- [[archetype-gap-editable-tile-layout]] — sibling editable-canvas gap; shares the keyboard-operable reorder question
- [[archetype-gap-waiver-needs-operator-approval]] — policy: no fit means the consumer page ticket stays blocked on this gap
- [[page-requires-archetype-shell-no-pageframe-alone]]
- [ADR-0001](/docs/adr/0001-grandfather-authored-report-calendar.md) — baseline never originates archetypes except the closed grandfathered set
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement

## Resolution (2026-11-05)

Shipped as the new `kind: page` archetype **structure-builder (Sb)** — ADR-0012, contract `docs/archetypes/structure-builder.md`, export `design-baseline/archetypes/structure-builder` (`StructureBuilderShell`, `StructureTree`, `moveNode` & co.), demo `src/examples/structure-builder-demo.tsx`, template `templates/structure-builder.tsx`, MANIFEST `Sb` 1.0, package v0.23.0.

- Contract covers palette, tree, coverage, version history, template list with New / Clone — `docs/archetypes/structure-builder.md` Structure §1–5.
- Gallery demo + `npm run check:viewports` 57/57 at the device triad (structure-builder @ desk27 / laptop14 / phone ok); pixel baselines added.
- Keyboard reorder / re-parent: `StructureBuilderShell.test.tsx` ("reorders, indents and outdents with Alt+Arrows…") and `tree.test.ts`.
- controlling-app adoption (drop `workspace/pnl-builder` from the grandfathered list, `lint-design` green) is consumer work, filed as a controlling-app follow-up; the lint's page-shell list reads `kind: page` slugs from the installed MANIFEST, so the slug is accepted once controlling-app pins v0.23.0.
