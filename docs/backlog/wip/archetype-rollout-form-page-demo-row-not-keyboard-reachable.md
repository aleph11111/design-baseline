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
        no testable assertion (uses words: shows / returns / measures / disables / enables / exits /
        unchanged / fails / no longer / after / when / matches / is-or-are + participle)
  graded_at: '2026-10-01T16:40:50.217Z'
---

# Form page demo list rows cannot be opened by keyboard

## Context

The demo's entry route into edit mode is the recipe title cell in [src/examples/form-page-demo.tsx](/src/examples/form-page-demo.tsx): a `TableCell` with an `onClick`, styled as a link but with no link or button semantics. It is not focusable, does not respond to Enter, and is not announced as interactive. Contract Layer 1 says edit lives at its own URL reached by a link, so the reference should show a real link. Keyboard and screen-reader users cannot reach the edit form from the list at all.

## What to do

- [ ] Each recipe title in the list is a real link or button that is reachable with Tab and opens the edit form with Enter.
- [ ] The focused title shows a visible focus ring.
- [ ] The accessible name identifies the action and the recipe (e.g. edit plus the title).

## Acceptance

- Tabbing through the list lands on each recipe title and Enter opens the edit form.
- Focus is visibly indicated.
- Clicking the title still opens the edit form.

## Related

- [src/examples/form-page-demo.tsx](/src/examples/form-page-demo.tsx)
- [docs/archetypes/form-page.md](/docs/archetypes/form-page.md)
