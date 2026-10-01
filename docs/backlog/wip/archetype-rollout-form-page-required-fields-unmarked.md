---
area: archetype-rollout
opened: '2026-10-01'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-10-01T16:40:50.218Z'
---

# Form page shows no marker for required fields

## Context

Layer 6 of [docs/archetypes/form-page.md](/docs/archetypes/form-page.md) requires the form-field label to mark required fields (asterisk) and optional ones explicitly. The shared `FormLabel` in [src/components/ui/form.tsx](/src/components/ui/form.tsx) has no required affordance at all, and the gallery demo ([src/examples/form-page-demo.tsx](/src/examples/form-page-demo.tsx)) renders Title, Serves, Prep, Cook and Ingredients (all schema-required) as plain labels. A user only learns a field is mandatory after a failed submit, and every consumer of the archetype inherits the gap.

## What to do

- [ ] Required fields show a visible required marker next to their label, and the marker is not the only carrier: assistive technology also announces the field as required.
- [ ] Optional fields are identifiable as optional (marker-free label plus explicit "Optional" text where the form mixes both).
- [ ] The demo marks exactly the fields its schema requires, so the marker matches the validation that rejects an empty value.

## Acceptance

- In the demo's create form, Title shows the required marker and an empty submit error appears on the same fields that carry it.
- Tag and Notes show no required marker.
- A screen reader reads Title as required.

## Related

- [src/components/ui/form.tsx](/src/components/ui/form.tsx)
- [[archetype-rollout-form-page-root-error-not-announced]]
