---
area: archetype-rollout
opened: '2026-10-01'
status: done
closed: subsumed
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-10-01T16:52:41.574Z'
---

# Collapsible rail section body touches its title bar and divider

## Context

A collapsible `DetailSection` that is not `flush` pads its body with `px-5 py-4` outside the unified rail but only `px-5` inside it ([src/components/archetypes/detail-overview/DetailSection.tsx](/src/components/archetypes/detail-overview/DetailSection.tsx)). When a reader opens a free-form section in the rail (run history, raw payload text), the content sits flush against the title bar above it and the hairline divider below, while the same section in the main column has breathing room. The two surfaces of one archetype disagree on spacing for the same content, and tightly packed text is harder to read.

## What to do

- [ ] An opened, non-flush collapsible section in the rail shows its body with vertical spacing from the title bar and from the next divider, so it reads like a non-collapsible rail section's body.
- [ ] A closed collapsible section still renders only its title bar.
- [ ] Add a `DetailSection` test for an open non-flush collapsible section inside the rail context.

## Acceptance

- Open a collapsible section with prose content in the rail: the first and last lines no longer touch the title bar or divider.
- A closed collapsible section is unchanged and takes no extra height.
- The test suite has a case covering the rail-context body spacing.

## Related

- [src/components/archetypes/detail-overview/DetailSection.tsx](/src/components/archetypes/detail-overview/DetailSection.tsx)
- [docs/archetypes/detail-overview.md](/docs/archetypes/detail-overview.md)

## Closed — premise does not hold (subsumed)

The ticket's reading of the code is stale: `DetailSection` passes `chrome={!unified}` to `SectionCard`, whose chromeless (rail) branch renders `<section class="py-4">` with the title in `<div class="mb-3 px-5">`. An open collapsible body therefore sits `mb-3` below the title and `py-4` above the divider; the body wrapper adds only the `px-5` gutter, exactly like a non-collapsible rail section. Rendered closed section in the rail (from the test run): `<section class="py-4"><div class="mb-3 px-5">…title…</div><div data-state="closed" hidden class="px-5"></div></section>`.

Per criterion:
- Open rail body does not touch title/divider — `mb-3` (title) + section `py-4` in `SectionCard.tsx` chromeless branch; asserted by `DetailSection.test.tsx` "keeps vertical spacing around an open body in the rail…".
- Closed section takes no extra height — same test: closed body is `hidden`, empty.
- Test for rail-context body spacing — same test, added in this PR.
