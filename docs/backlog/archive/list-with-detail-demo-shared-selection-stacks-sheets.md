---
area: archetypes
opened: 2026-10-15
status: done
value: normal
model: sonnet
model_reason: "cause established (one shellProps object with one selectedId spread into several shells); demo-only state split"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-15T00:00:00Z
---

# List-with-detail demo panels share one selection and stack identical sheets

## Context

In `src/examples/list-with-detail-demo.tsx`, one `shellProps` object, carrying a single `selectedId` / `onRowSelect` / `onDetailClose` / `detail`, is spread into several `ListWithDetailShell` instances (the presentation panels around lines 493 and 534). Since list-with-detail v3.0 every shell opens its detail as an overlay sheet whenever `selectedRowId` is set. Clicking one row in any of these panels therefore opens one sheet per panel: four identical sheets stacked on top of each other in the gallery (`/a/list-with-detail`). Esc closes only the top one. `WideDetailPanel` (added in PR #570) has its own state and is unaffected. Reported by the PR #570 implementer.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Give each `ListWithDetailShell` in the demo its own selection state. Keep the shared rows/filters/state switcher, but key `selectedRowId`/`onRowSelect`/`onDetailClose`/`detail` per panel, e.g. a selection map keyed by panel id, or a small per-panel wrapper like `WideDetailPanel`.
- [ ] Check the other archetype demos in `src/examples/` for the same spread-shared-selection pattern, across every shell with a `detail` overlay.

## Acceptance

- In the gallery, clicking a row in any list-with-detail panel opens exactly one sheet, and Esc closes it with no sheet left behind.
- Selecting a row in one panel no longer marks a row as selected in the other panels.
- No other demo in `src/examples/` spreads one selection state into more than one overlay-opening shell.

## Related

- [[list-with-detail-sheet-sizes-to-content]]
- [[list-with-detail-shell-presentation-split]]
