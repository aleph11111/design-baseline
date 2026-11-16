---
area: archetypes
opened: 2026-11-07
status: ready
value: high
model: opus
model_reason: "variant shape is the deliverable: group-keying contract, collapsed-pipeline rule and shared state model with transaction-document are design decisions"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-07T00:00:00Z
---

# Archetype gap: work-queue variant of grouped-list for orders and invoices

## Context

`docs/archetypes/grouped-list.md` (`src/components/archetypes/grouped-list/`) groups rows by a browsing taxonomy (category, department, topic), not by workflow step, so no `kind: page` archetype in MANIFEST fits a work queue. brickshop-manager `/orders` needs one, and invoices, offers and purchase orders will follow. Mockup: https://claude.ai/artifact/PS7Y9AhSeLtpZyEHRaEzEw (List V2 boards).

Required behaviour, as the operator specified it:

- Open / Completed / All view switch, each with a count.
- Groups keyed by next step (To pay, To pick, To pack, Shipped, Delivered), each with a header count, an attention tone and one bulk action.
- Empty groups collapse into a single pipeline line (`To pay > To pick > To pack > Shipped > Delivered`) instead of rendering empty sections.
- A Waiting-age cell with thresholds.
- Compact single-line rows: 44px in Open, 38px in the archive views.
- A rule against always-empty status tabs.

This pairs with [[archetype-gap-transaction-document]]: the list's groups and the detail page's `nextStep` panel share one state model. Per the archetype-gap rule a consumer never hand-rolls the shape; brickshop-manager waits on this ticket.

## What to do

- [ ] Add a work-queue variant to the grouped-list contract `docs/archetypes/grouped-list.md` (role-only, rules 2–3 of `docs/RULES.md`): groups keyed by workflow step, view switch with counts, collapsed-empty pipeline line, waiting-age thresholds, bounded density, no always-empty status tabs.
- [ ] Ship the variant in `src/components/archetypes/grouped-list/` as typed props (step-keyed groups with count, tone, one bulk action; waiting-age cell with threshold prop), a gallery demo in `src/examples/grouped-list-demo.tsx`, a MANIFEST version bump and a package version bump (variant of an existing archetype per [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md); the operator named it a variant).
- [ ] Define the step/state model as one typed shape that `transaction-document`'s `nextStep` slot can consume too, so list groups and detail next-step never drift.
- [ ] Make the demo show the Open, Completed and All views, a collapsed pipeline line, and a waiting-age cell across its thresholds (per the living-demos convention for archetype variants).
- [ ] Cover the variant in `npm run check:viewports` at desk27, laptop14 and phone, with the 44px / 38px row heights asserted.

## Acceptance

- The grouped-list demo renders a work-queue board with groups keyed by next step, each showing a header count, an attention tone and one bulk action.
- Empty groups render as one pipeline line in step order, never as empty sections.
- The view switch shows Open, Completed and All with counts, and no tab is rendered for a status that is always empty.
- The waiting-age cell changes tone once the age passes each declared threshold.
- Open rows measure 44px and archive rows 38px, single line, in `npm run check:viewports` at desk27, laptop14 and phone.
- The contract names no Tailwind classes or primitive names, and existing taxonomy-grouped grouped-list consumers are unchanged.

## Related

- [[archetype-gap-transaction-document]] — shares the step state model; pair the two
- [[page-header-action-hierarchy-overflow-menu]]
- [[device-triad-narrow-laptop-width-sweep]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement
- [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md) — variant versus new archetype precedent
- [ADR-0001](/docs/adr/0001-grandfather-authored-report-calendar.md) — baseline never originates archetypes
