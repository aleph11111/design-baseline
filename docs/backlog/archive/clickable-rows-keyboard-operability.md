---
area: a11y
opened: 2026-07-04
status: ready
model: sonnet
model_reason: repeated established a11y pattern across a few shells, clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Make clickable rows and cells keyboard operable across the archetype shells

## Context

Severity: **high** (accessibility). Several archetype shells expose full-row / full-cell click affordances as non-interactive `<div>`/`<td>` elements — they carry `onClick` + `cursor-pointer` + hover styling but no `role`, no `tabIndex`, and no key handler, so they are unreachable by Tab and unactivatable by Enter/Space. A keyboard-only or screen-reader user simply cannot select a feed item, open a list row, or edit a matrix cell. Because this is a donor baseline copied into every adopting app, the defect propagates fleet-wide. Confirmed sites: `src/components/archetypes/feed-inbox/FeedItem.tsx:55` (whole-row `onClick` on a plain div, no keyboard path — the only interactive affordance for the row), `src/components/archetypes/list-with-detail/ListWithDetailShell.tsx:302` (identifier `TableCell`), `ListWithDetailShell.tsx:337` and `:386` (card-grid and action-row row wrappers), and `src/components/archetypes/matrix-grid/MatrixGridShell.tsx:239` (clickable cells). Impact: keystroke-level inoperability of the primary navigation affordance — a WCAG 2.1.1 (Keyboard) failure.

## What to do

- [ ] Do red/green TDD: first add a failing test (introduce a test runner — the repo is currently typecheck-only, so add `vitest` + `@testing-library/react` + `jsdom`) asserting that a FeedItem/list-row/matrix-cell with an `onClick` is focusable (`tabIndex=0`) and fires the handler on Enter and on Space; then make it pass.
- [ ] For clickable rows/items render real button semantics: either a `<button>` wrapper or `role="button"` + `tabIndex={0}` + an `onKeyDown` that fires the handler on Enter/Space (calling `preventDefault()` on Space to suppress page scroll), plus a `focus-visible` ring. Sites: FeedItem.tsx:55, ListWithDetailShell.tsx:302/337/386.
- [ ] Make MatrixGridShell clickable cells focusable and key-activatable (MatrixGridShell.tsx:239) with the same Enter/Space contract and a focus ring.
- [ ] Centralize the row/cell interactivity into one small shared helper/hook (DRY) so all shells share a single, tested keyboard contract rather than re-implementing it.

## Acceptance

- Tabbing through a rendered FeedShell, ListWithDetailShell (all three presentations), and MatrixGridShell reaches every clickable row/cell, and Enter/Space activates the same handler `onClick` fires — no interactive affordance is mouse-only.
- Each clickable row/cell shows a visible `focus-visible` ring when focused.
- The fix meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), with no new TypeScript errors, lint warnings, or test failures.

## Related

- [decouple-archetype-contract-from-reference-impl.md](archive/decouple-archetype-contract-from-reference-impl.md) — the archetype shells this touches
- docs/STYLE.md — baseline interaction/focus conventions
- docs/ADOPTION-QUALITY.md — adoption-quality spine these shells must meet
