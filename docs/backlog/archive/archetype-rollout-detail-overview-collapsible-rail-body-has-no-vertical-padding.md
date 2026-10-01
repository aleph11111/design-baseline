---
area: archetype-rollout
opened: '2026-10-01'
status: done
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
