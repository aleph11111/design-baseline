---
area: a11y
opened: 2026-11-05
status: ready
value: normal
model: sonnet
model_reason: "scoped contract line plus matching focus handling in demo and template, clear acceptance"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-05T00:00:00Z
---

# Structure-builder palette placement drops keyboard focus to body

## Context

In the Sb archetype, placing a palette item by keyboard removes its row from the palette, so the focused Place button unmounts and focus falls to `<body>` (`src/examples/structure-builder-demo.tsx` palette `onClick`, `templates/structure-builder.tsx` `placeAtSelection`). A keyboard-only user placing several items must Tab back into the palette every time. Repro: gallery `/a/structure-builder`, Tab to a lesson's + button, Enter, focus is on body. The contract `docs/archetypes/structure-builder.md` "Interaction" specifies palette placement by keyboard but not where focus goes afterwards (it does specify focus for moves: "Focus stays on the moved line").

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `docs/archetypes/structure-builder.md` Interaction, add a line under "Palette placement by keyboard": after a placement focus moves to the next palette item's place action (the previous one if it was last); when the palette becomes empty, focus moves to the placed tree line. Role-only wording, no Tailwind or primitive names (per RULES 2–3).
- [ ] Make `src/examples/structure-builder-demo.tsx` follow the rule.
- [ ] Make `templates/structure-builder.tsx` (`placeAtSelection`) follow the rule.

## Acceptance

- After placing an item by keyboard in the gallery demo, `document.activeElement` is the next palette item's place button, not `<body>`.
- When the last palette item is placed, focus is on the placed tree line.
- No other keyboard placement path in the demo or template (every call site of the place action) leaves focus on `<body>`.
- Contract, demo and template state and implement the same focus target.

## Related

- [[archetype-gap-structure-builder]] — shipped the Sb archetype this fixes
- [[feed-master-detail-narrow-focus-scroll-loss]] — similar focus-loss class
- [[clickable-rows-keyboard-operability]]
