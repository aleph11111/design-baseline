---
area: layout
opened: 2026-08-17
status: ready
value: normal
roadmap: archetype-convergence
spec: docs/superpowers/specs/2026-08-17-archetype-convergence-design.md
depends_on:
  - archetype-convergence-phase0-appearance-locality-decision
model: sonnet
model_reason: "a small primitive between two existing ones, with the type scale fixed by the design spec and an established sibling pattern in PageHeader / SectionHeading"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-17T00:00:00Z
---

# Ship the Mode B nested page-heading primitive in the layout ladder

## Context

Phase 1 of the [archetype-convergence roadmap](../archetype-convergence.md). The
detail-overview contract declares two first-class header modes, and Mode B is
unimplemented. `docs/archetypes/detail-overview.md:351` says a nested page
*"**may** introduce a section-level `<h2>`"* with no scale and no weight
specified — and that permission is where hk-crm's nine hand-typed
`<h2 className="text-lg font-…">` sub-tab headings come from, seven
`font-medium` against two `font-semibold`. `DetailOverviewHeader.tsx` exists and
no company sub-tab imports it, because it renders an `<h1>` that Mode B forbids.

The gap is real and not covered by an existing primitive.
`src/components/layout/SectionHeading.tsx` renders an uppercase tracked overline
via `OVERLINE_CLASS` — a section label inside a card, a different role at a
different scale. The missing rung sits between `PageHeader` (h1) and
`SectionHeading` (overline): a nested *page* title used where a parent route
layout owns the `<h1>`.

## What to do

- [ ] Add the primitive to `src/components/layout/`, alongside `PageHeader` and
      `SectionHeading`. Both existing rungs of the heading-scale ladder live
      there and the ladder's value is being single-source; putting the third rung
      in `archetypes/detail-overview/` would fork the type scale across two
      directories.
- [ ] Fix the type scale and weight in the component. It takes no `size`,
      `level`, `weight` or `variant` prop — that would be the per-call-site
      appearance prop hard rule 12 forbids, and the nine-heading split is what
      that freedom produces.
- [ ] Give it the same prop shape as its siblings — `title`, optional
      `subtitle`/`description`, optional `badges`, optional `actions` — so the
      three rungs read as one family (`PageHeader.tsx`, `SectionHeading.tsx`).
- [ ] Export it from `src/components/layout/index.ts` next to the other layout
      primitives.
- [ ] Add a test beside `PageHeader.test.tsx` and `SectionHeading`'s siblings,
      matching the donor's existing component-test convention.
- [ ] Render it in the gallery so the scale is visually reviewable, per the
      RULES guideline that every documented variant axis gets a living demo.

## Acceptance

- [ ] The primitive renders an `<h2>` at a single fixed scale and exposes no prop
      that changes its type scale or weight.
- [ ] `npx tsc --noEmit` and `npm test` pass with the new test included.
- [ ] The gallery shows the three heading rungs — page, nested page, section
      overline — so the scale relationship between them is visible.
- [ ] A Mode B heading is reachable as a component call; no example in
      `src/examples/` hand-types a `text-lg font-medium` or `text-lg font-semibold`
      heading, and no other call site in the repo composes a nested page title
      from raw classes.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap, Phase 1
- [archetype-convergence-phase0-appearance-locality-decision.md](../archive/archetype-convergence-phase0-appearance-locality-decision.md)
  — depends on: no-variant-prop is hard rule 12
- [matrix-grid-page-header-inconsistency.md](../archive/matrix-grid-page-header-inconsistency.md)
  — the same class of defect resolved in a contract rather than a primitive
- [test-gap-page-header-no-tests.md](../archive/test-gap-page-header-no-tests.md)
  — the sibling primitive's test convention
