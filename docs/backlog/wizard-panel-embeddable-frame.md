---
area: archetypes
opened: 2026-11-16
status: ready
value: high
model: sonnet
model_reason: "scoped additive component extraction with pinned props, existing WizardShell footer logic to move, clear acceptance; no open design choice"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-16T00:00:00Z
---

# Add embeddable import-wizard frame WizardPanel without PageFrame

## Context

`WizardShell` (`src/components/archetypes/import-wizard/WizardShell.tsx`) requires `title` and always renders through `PageFrame` (ADR-0008), so it cannot host a wizard inside a Dialog or a tab body. controlling-app therefore keeps an app-local copy, `frontend/src/components/import/WizardShell.tsx`, used by two non-page hosts: `frontend/src/components/import/MechanicWizard.tsx:206` (inside a Dialog, passes `onFirstBack` + `firstBackLabel`) and `frontend/src/components/workspace/liquidity/ImportRun.tsx:606` (embedded tab body, passes `onFirstBack`, `busy`, `className="rounded-md border p-3"`). Operator decision 2026-11-16: option B on controlling-app card `adopt-baseline-import-wizard-shell-header-gap` — baseline ships an embeddable frame `WizardPanel`, controlling-app deletes its local copy after the pin bump. Note: the originating report cites v0.30.0; trunk is now v0.46.3 (`package.json`, 2026-11-16), and `WizardShell` already has `busyLabel` and `stepStateLabels`, so the version bump below is relative to trunk.

## What to do

- [ ] Add `src/components/archetypes/import-wizard/WizardPanel.tsx` (consumer path `@/components/archetypes/import-wizard/WizardPanel`) rendering `WizardStepper` + `children` + Back/Next·Commit footer with NO `PageFrame` and NO title. Move the footer logic out of `WizardShell`; it must live once.
- [ ] Pin props exactly to the controlling-app local shell so the consumer swap is a rename: `steps`, `current`, `onBack`, `onNext`, `onCommit`, `canProceed` (default `true`), `busy` (spinner + disabled footer), `nextLabel`, `commitLabel`, `backLabel`, `firstBackLabel`, `onFirstBack` (outline button on the first step instead of hiding Back), `stateLabels` (forwarded to `WizardStepper`), `className`, `children`. Keep the existing `busyLabel` default from `useLabels` (`L.importing`) as an additional optional prop.
- [ ] Make `WizardShell` compose `WizardPanel` inside its `PageFrame` (mapping its `stepStateLabels` to `stateLabels`) with no change to its public props or rendered output, including the `done` branch and the titled `SectionCard` around the step body.
- [ ] Update `docs/archetypes/import-wizard.md` to name `WizardPanel` as the non-page host form (Dialog / tab body); keep the contract role-only (no Tailwind classes), bump the spec version and the `import-wizard` entry in `docs/archetypes/MANIFEST.json` (currently `3.6`) per `docs/RULES.md`, add the version-log line.
- [ ] Bump `package.json` (additive minor — `0.47.0` from trunk v0.46.3; re-read `package.json` and the import-wizard MANIFEST version (3.6) at `/feat`, since [[archetype-gap-import-wizard-history-view-slots]] bumps the same versions and may land first) and add the `## v0.47.0` entry to `CHANGELOG.md` (Changed / Consumer: controlling-app swaps its local `WizardShell` for `WizardPanel` as a rename / Breaking: no).
- [ ] Add a Dialog-hosted demo to `src/examples/import-wizard-demo.tsx` (living demo per memory `living-demos-for-variants`), visible in the gallery.
- [ ] Add `WizardPanel.test.tsx` covering: first-step `onFirstBack` button renders with `firstBackLabel`, `busy` disables the footer, last step shows the commit button; keep `WizardShell.test.tsx` green.
- [ ] Consumer follow-up (not in this ticket): after the pin bump, controlling-app `adopt-baseline-import-wizard-shell-header-gap` deletes its local `WizardShell.tsx`.

## Acceptance

- `WizardPanel` renders no `PageFrame` and no title element, and `WizardShell` output is unchanged for existing callers (`WizardShell.test.tsx` passes untouched).
- On the first step with `onFirstBack` set, the panel shows an outline button labelled `firstBackLabel` that calls `onFirstBack`; without `onFirstBack` Back is disabled as before.
- When `busy` is true, the spinner shows and Back and Next/Commit are disabled; on the last step the commit button shows instead of Next.
- `npm test` and `npx tsc --noEmit` pass, `scripts/verify-package-version.mjs` finds the CHANGELOG entry for the bumped version, and the MANIFEST/spec versions match.
- The gallery shows the Dialog-hosted `WizardPanel` demo.

## Related

- [[wizard-shell-back-busy-label-props-and-hardcoded-english-label-sweep]] — added `backLabel`/`busyLabel` seam that `WizardPanel` inherits
- [[wizardshell-adopt-surface-header-slot]]
- [[test-gap-wizard-shell-no-tests]]
- [[archetype-gap-import-wizard-history-view-slots]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — `PageFrame` as the page shell (WizardShell stays on it)
- [docs/archetypes/import-wizard.md](/docs/archetypes/import-wizard.md)
