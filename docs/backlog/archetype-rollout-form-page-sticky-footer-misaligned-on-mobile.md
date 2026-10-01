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
  graded_at: '2026-10-01T16:40:50.220Z'
---

# Form page sticky mobile footer overhangs its surface

## Context

On narrow viewports `FormPageActions` ([src/components/archetypes/form-page/FormPageActions.tsx](/src/components/archetypes/form-page/FormPageActions.tsx)) becomes a sticky bar using a fixed 24px bleed on each side to reach the surface edge. `FormPageShell` ([src/components/archetypes/form-page/FormPageShell.tsx](/src/components/archetypes/form-page/FormPageShell.tsx)) pads its body 20px in the board form and 0 in the classic form, and the demo adds a further `CardContent` 20px in classic mode. The bar's width therefore matches the surface in none of the three chrome variants: it is clipped or overhangs by 4px (board), 24px beyond the column (classic), or sits inset (classic + card). Buttons can be cut off at the screen edge, exactly where the primary action must stay reachable.

## What to do

- [ ] On a phone-width viewport the sticky footer spans exactly the form surface edge to edge in board, classic and classic-with-card chrome.
- [ ] Primary and Cancel buttons are never clipped, and the footer still sticks to the viewport bottom while the form scrolls.
- [ ] The gallery shows the narrow-viewport footer for all three chrome variants.

## Acceptance

- At 375px width, no horizontal scroll appears and the footer's edges align with the surface in each chrome variant.
- The Create/Save button is fully visible while the form is scrolled.
- Desktop footer layout is unchanged.

## Related

- [src/components/archetypes/form-page/FormPageShell.tsx](/src/components/archetypes/form-page/FormPageShell.tsx)
- [docs/archetypes/form-page.md](/docs/archetypes/form-page.md)
