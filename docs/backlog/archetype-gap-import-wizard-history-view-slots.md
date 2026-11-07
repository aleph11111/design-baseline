---
area: archetypes
opened: 2026-11-04
status: needs-enrichment
model: opus
model_reason: "design is the deliverable — how one page hosts wizard and history under a single kind:page shell, and whether the contract's no-per-step-buttons rule bends"
value: normal
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "unresolved Open question caps the score at 4"
  graded_at: 2026-11-04T00:00:00Z
---

# Archetype gap: import-wizard shell has no viewSwitch or viewOptions slot for history toggle

## Context

Consumer: controlling-app `frontend/src/app/workspace/import/page.tsx` (route `/workspace/import`; related consumer ticket `adopt-baseline-import-wizard-shell-header-gap`). The page is a stepped import flow (upload, column mapping, account mapping, verification/batch result) that shares the route with an import-history table. A tab strip ("Neuer Import" / "Verlauf") switches wizard vs history, a view-options menu holds a "Nachkommastellen anzeigen" checkbox, step bodies own their own per-step buttons, and the page shows a dismissible error `Alert`. The page imports `PageFrame` directly, which the page-requires-archetype-shell rule forbids.

`WizardShell` (`src/components/archetypes/import-wizard/WizardShell.tsx`) types its frame slots as `Pick<PageFrameProps, "title" | "subtitle" | "badges">`, so the tab strip (a `viewSwitch` control per `docs/PLACEMENT.md`) and the decimals toggle (a `viewOptions` control per the same table) have no home. No second fleet page with this shape is known yet. The `docs/archetypes/import-wizard.md` Layer 4 says history is a separate list-with-detail archetype toggled by "a tab strip or two routes", but gives the wizard shell no slot to host that strip.

## What to do

- [ ] Add `viewSwitch`, `viewOptions` and `viewOptionsLabel` to the `Pick<PageFrameProps, …>` in `WizardShell.tsx` and forward all three to both `<PageFrame>` calls (the `done` branch and the stepper branch), so the strip and the View menu persist in the done state. (per [[shells-drop-pageframe-view-options-slots]] and STYLE.md "a shell forwards every `PageFrame` slot it takes"; slot placement per [[tabbed-settings-tabs-to-viewswitch-slot]])
- [ ] Update `docs/archetypes/import-wizard.md` Layer 3/4 to name the new slots (history toggle in `viewSwitch`, display-only toggles in `viewOptions`), bump the spec `version` and the matching `docs/archetypes/MANIFEST.json` entry, bump `package.json` version, add a `CHANGELOG.md` row (`npm run verify:manifest` and `scripts/verify-package-version.mjs` enforce parity).
- [ ] Extend `src/examples/import-wizard-demo.tsx` with a `viewSwitch` tab strip ("New import" / "History") and a `viewOptions` toggle, per the living-demos convention; add a `WizardShell.test.tsx` case that the slots render in the wizard and the `done` state.
- [ ] When this ships, re-enrich the consumer ticket so its `archetype-gap:` line becomes `archetype: import-wizard`.

## Acceptance

- `WizardShell` renders a passed `viewSwitch` and `viewOptions` in both the stepper state and the `done` state, and `npx tsc --noEmit` passes with the three props accepted.
- The `import-wizard` demo shows the history tab strip and the View menu, and `npm test` passes.
- `docs/archetypes/import-wizard.md` `version` equals its `docs/archetypes/MANIFEST.json` entry after the bump.

## Related

- [[shells-drop-pageframe-view-options-slots]] — same class of gap (shell `Pick` omits view slots) fixed for two other shells
- [[tabbed-settings-tabs-to-viewswitch-slot]] — page-switching tabs belong in `viewSwitch`
- [[wizardshell-adopt-surface-header-slot]] — last change to `WizardShell` frame props
- [[page-requires-archetype-shell-no-pageframe-alone]] — the rule the consumer page violates
- [[import-wizard-demo-done-state-frame]] — `done` state renders in the same frame
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement

## Open question

Two forks, resolved to the recommended default for filing; confirm before `/feat`.

1. **Per-step buttons.** The consumer's step bodies own their own buttons, but the contract forbids per-step "save" buttons and puts Back/Next/Commit in the footer. Recommended: keep the footer contract and have the consumer move step actions into it (no footer-less mode). Alternative: add a footer-less variant where steps own navigation. Only one consumer wants this, which is below the rule-of-2 bar the other promotions used.
2. **History view hosting.** With the strip in `WizardShell`'s `viewSwitch`, the "Verlauf" view must render the history (a list-with-detail shell) on the same route. Recommended: the page renders `WizardShell` for "Neuer Import" and `ListWithDetailShell` for "Verlauf", each passing the same `viewSwitch` node. Alternative: two routes, each shell with its own link-based switch.
