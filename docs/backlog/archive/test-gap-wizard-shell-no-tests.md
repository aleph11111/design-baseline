---
area: test-gap
opened: 2026-07-19
status: ready
---

# WizardShell's step/footer state logic has no test coverage

## Context

`src/components/archetypes/import-wizard/WizardShell.tsx` (108 lines) changed in 4 commits over the last 90 days and has no test file. `WizardStepper.test.tsx` exists in the same directory but only covers the step-indicator sub-component, not the shell that owns the navigation/footer state logic.

Untested branching:
- `isLast = current >= steps.length - 1` / `isFirst = current <= 0` control which footer button (Next vs. Commit) renders and whether Back is disabled — off-by-one errors here would let a consumer skip the terminal commit step or get stuck unable to go back.
- `busy` disables both footer buttons and swaps the commit button's label to "Importing…".
- `canProceed` disables the forward action independent of `busy`.
- The `title !== undefined` branch switches between the board-form wrapper (bounded card + `SurfaceHeaderSlot`) and the plain wrapper.

## What to do

- [ ] Add `src/components/archetypes/import-wizard/WizardShell.test.tsx` covering: `current === 0` disables Back; `current === steps.length - 1` renders the Commit button (not Next) and calls `onCommit` when clicked.
- [ ] Test intermediate steps render Next and call `onNext`.
- [ ] Test `busy=true` disables both footer buttons and shows the "Importing…" label on the terminal step.
- [ ] Test `canProceed=false` disables the forward action regardless of `busy`.
- [ ] Test the `title` prop switches to the board-form wrapper.

## Acceptance

- `WizardShell.test.tsx` exists and passes under `npm test`.
- A test fails if the `isLast`/`isFirst` boundary logic regresses (e.g. an off-by-one that hides Commit on the last step).

## Related

- `src/components/archetypes/import-wizard/WizardStepper.test.tsx` — covers the step indicator only, not this shell's footer/navigation logic.
