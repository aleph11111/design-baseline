---
area: a11y
opened: 2026-07-04
status: done
model: sonnet
model_reason: additive ARIA + sr-only state on two primitives, clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Add aria-current and non-color state to the progress stepper primitives

## Context

Severity: **medium** (accessibility). `ProgressTracker` renders an `<ol>`/`<li>` where the done/current/pending distinction is conveyed purely visually — dot fill (`bg-primary` vs `bg-primary/25` vs `bg-background`) and muted label text — with no `aria-current="step"` on the active stage and no textual state (`src/components/layout/ProgressTracker.tsx:50`, `:52`). `WizardStepper` has the same gap (`src/components/archetypes/import-wizard/WizardStepper.tsx:31`, `:41`). A screen-reader user cannot tell which step is current or which are complete, and the state is encoded by color/icon alone (WCAG 1.4.1 Use of Color, 1.3.1 Info and Relationships). Both are donor primitives that propagate to every adopting app.

## What to do

- [ ] Do red/green TDD: add a failing test (introduce `vitest` + `@testing-library/react`; the repo is typecheck-only today) asserting the current step carries `aria-current="step"` and every step exposes a non-visual state word (sr-only "current"/"completed"/"upcoming"); then make it pass.
- [ ] Add `aria-current="step"` to the active `<li>` in `ProgressTracker` (ProgressTracker.tsx:50) and `WizardStepper` (WizardStepper.tsx:31).
- [ ] Add a visually-hidden state word (sr-only) or `aria-label` per step so completed/current/upcoming is not conveyed by color/icon alone (ProgressTracker.tsx:52, WizardStepper.tsx:41).

## Acceptance

- The current step exposes `aria-current="step"`; each step announces its state (current/completed/upcoming) to a screen reader independent of color.
- No step's status is conveyed by color or icon alone.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- [clickable-rows-keyboard-operability.md](clickable-rows-keyboard-operability.md) — sibling a11y gap in the shells
- docs/ADOPTION-QUALITY.md — adoption-quality bar these primitives must meet
