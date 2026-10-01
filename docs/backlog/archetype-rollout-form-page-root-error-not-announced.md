---
area: archetype-rollout
opened: '2026-10-01'
status: needs-enrichment
gate:
  score: 4
  passed:
    - title
    - context
    - what_to_do
    - related
  failed:
    - acceptance: >-
        defect ticket — acceptance asserts only the reported instance, not the class of the problem
        (need: no other call site, every similar, any other, etc.)
  graded_at: '2026-10-01T16:40:50.219Z'
---

# Form page submit error is not announced to assistive tech

## Context

Layer 7 requires submission errors that don't map to a field to appear in a fixed slot above the footer. The demo ([src/examples/form-page-demo.tsx](/src/examples/form-page-demo.tsx)) renders it as a plain tinted `<div>` with no live-region semantics, appearing after an 800ms async save. A keyboard or screen-reader user who presses Save hears nothing, sees the button return to normal, and cannot tell the save failed. The tint is also the only carrier of "error" besides the message text.

## What to do

- [ ] When a submit fails with a form-level error, the error is announced immediately without the user moving focus.
- [ ] The error box states that it is an error in text (not only through colour).
- [ ] The treatment is the single canonical inline-error box shared with the crud-dialog, so both archetypes announce identically.

## Acceptance

- With "Simulate server error" on, pressing Save causes a screen reader to read the error message once the request fails.
- The box carries error wording or an icon alongside the red tint.
- The crud-dialog demo's inline error behaves the same way.

## Related

- [src/examples/form-page-demo.tsx](/src/examples/form-page-demo.tsx)
- [docs/archetypes/README.md](/docs/archetypes/README.md)
