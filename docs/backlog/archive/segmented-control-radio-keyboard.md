---
area: a11y
opened: 2026-07-04
status: done
model: sonnet
model_reason: implement the standard radiogroup roving-tabindex pattern or downgrade roles, clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Make SegmentedControl honor its radiogroup role with roving tabindex and arrow keys

## Context

Severity: **medium** (accessibility). `SegmentedControl` declares `role="radiogroup"` with children `role="radio"` + `aria-checked` (`src/components/ui/segmented-control.tsx:42`, `:53`), which promises the WAI-ARIA radio-group interaction model: one tab stop into the group, arrow keys to move and change selection. But every option is a natively focusable `<button>` with no roving `tabIndex` and no `onKeyDown`, so the actual behavior is: every button is a tab stop and arrow keys do nothing. That mismatch between announced role and real behavior actively misleads assistive-tech users (a screen reader says "radio group, use arrows" but arrows are dead). It ships as a donor `ui/` primitive.

## What to do

- [x] Do red/green TDD: add a failing test (introduce `vitest` + `@testing-library/react`; the repo was typecheck-only) asserting only the checked option has `tabIndex=0` (others `-1`) and ArrowLeft/ArrowRight move and change selection; then make it pass.
- [x] Implement the radio pattern properly in `segmented-control.tsx`: compose `@radix-ui/react-radio-group` (already a baseline dep, same primitive as `ui/radio-group.tsx`) instead of hand-rolled keydown handling, so roving tabindex + arrow-key move-and-select come from the primitive.
- [ ] ~~Alternatively, if the roving pattern is out of scope, drop `role="radiogroup"`/`role="radio"`...~~ — not needed; the roving pattern was in scope and implemented.

## Acceptance

- The group is a single tab stop and ArrowLeft/ArrowRight move+select (radiogroup pattern) — OR the roles are downgraded to a toggle-button group; either way the announced role matches actual keyboard behavior.
- No remaining mismatch between `role="radiogroup"` and non-functional arrow keys.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- [clickable-rows-keyboard-operability.md](clickable-rows-keyboard-operability.md) — sibling keyboard-a11y gap
- docs/STYLE.md — baseline interaction conventions
