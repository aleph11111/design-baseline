---
area: archetypes
opened: 2026-11-19
status: ready
value: normal
model: sonnet
model_reason: "scoped additive optional prop on an existing footer, pinned semantics, existing WizardPanel/WizardShell tests to extend; no open design choice"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-19T00:00:00Z
---

# Let a wizard step hide the footer forward action

## Context

`WizardPanel` (`src/components/archetypes/import-wizard/WizardPanel.tsx`, composed by `WizardShell`) always renders the footer Back + Next·Commit pair and has no way to hide or relocate the forward action on one step. Consumer behandlungskompass (`CaptureWizard.tsx`, its ticket `capture-wizard-duplicate-forward-button`) puts its own primary "Strecke prüfen" in a side rail on step 1, so the footer "Weiter" is a second primary on the same step, which breaks the contract that the footer holds navigation with one primary (`docs/archetypes/import-wizard.md`, Layer 5). The consumer already owns `current` and every step's data, so relocating the action needs no slot: the consumer renders its own button in the step body and only has to drop the footer's.

## What to do

- [ ] Add an optional `hideNext?: boolean` to `WizardStep` (`WizardStepper.tsx:8`, the stepper ignores it). In `WizardPanel`, when the active step has `hideNext`, render no forward button (Next, or Commit on the last step); Back, `onFirstBack` and the footer layout stay as they are.
- [ ] Update `docs/archetypes/import-wizard.md` Layer 5 and the per-step props list: the footer holds Back plus at most one primary; a step may set `hideNext` when its body carries its own primary action.
- [ ] Add tests in `WizardPanel.test.tsx` and `WizardShell.test.tsx` covering `hideNext` on a middle step, on the last step, and with `onFirstBack` on step 0.
- [ ] Bump the MANIFEST version for `import-wizard` and the package version (per `docs/RULES.md` rule 11).

## Acceptance

- A step with `hideNext: true` renders no Next button and keeps an enabled Back button.
- On the last step, `hideNext: true` renders no Commit button either.
- A step without `hideNext` renders the footer exactly as before (`canProceed`, `busy` and labels unchanged).
- No other step of the same wizard loses its forward action when one step sets `hideNext`.

## Related

- [[wizard-panel-embeddable-frame]] — introduced `WizardPanel` and its footer
- [[test-gap-wizard-shell-no-tests]] — origin of the `WizardShell` test file this extends
- [[wizard-shell-back-busy-label-props-and-hardcoded-english-label-sweep]] — same footer seam, prior optional-prop precedent
- [[import-wizard-demo-done-state-frame]] — demo that may want a `hideNext` example
