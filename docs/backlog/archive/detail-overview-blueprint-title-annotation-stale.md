---
area: archetypes
opened: '2026-09-27'
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-09-27T00:00:00Z'
value: low
model: sonnet
model_reason: single-line text-node edit in a static SVG annotation, no design judgment left
---

# Detail-overview blueprint SVG annotation still cites the pre-ADR-0007 title class

## Context

`docs/archetypes/detail-overview-blueprint.svg:142` carries an annotation text node reading `Title text-lg font-semibold, left. Subtitle text-xs muted below.` Since #309, the page title step is `text-display-title` (ADR-0007 §2, `--text-display-title: 30px`) — `PageHeader.tsx:113` no longer renders `text-lg`. The annotation is cosmetic doc drift in a static reference diagram, not a contract or behavior change.

## What to do

- [x] Update the text node at `docs/archetypes/detail-overview-blueprint.svg:142` from `Title text-lg font-semibold, left.` to `Title text-display-title font-semibold, left.` (subtitle annotation is unaffected — `NestedPageHeading`/subtitle scale wasn't touched by #309).

*(Shipped: the annotation reads `text-display-title`.)*

## Acceptance

- `docs/archetypes/detail-overview-blueprint.svg` no longer contains the string `text-lg font-semibold` in its title annotation.

## Related

- [archive/house-look-page-header-title-step.md](house-look-page-header-title-step.md) — #309, the slice that moved the title class this annotation is stale against
- [archive/detail-overview-blueprint-rail-variant.md](detail-overview-blueprint-rail-variant.md) — prior edit to the same blueprint SVG
- ADR-0007 — The fleet house look: donor-fixed roles vs brand-overridable roles
