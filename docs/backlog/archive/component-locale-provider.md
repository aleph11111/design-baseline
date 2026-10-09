---
area: i18n
opened: 2026-10-08
status: done
value: high
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: "2026-10-08T13:29:50Z"
---

# Baseline label provider with de preset so German consumers stop vendoring component copies

## Context

The fleet shadow audit (2026-10-08, 6 consumers) found the #1 reason consumers keep local
shadow copies of baseline files is hard-coded English default strings: `src/components/ui/state-view.tsx`
(controlling-app, hk-crm and mistra copy it only for "Wird geladen…"/"Ein Fehler ist
aufgetreten"/"Erneut versuchen"/"Noch keine Einträge"), `src/components/ui/error-boundary.tsx`
(carries no copy prop today — `children`/`fallback` only; mistra adds a copy prop, hk-crm uses
de.common), `src/components/ui/search-input.tsx` (mistra: "Suchen…", "Suche löschen"),
`src/components/ui/confirmation-dialog.tsx` (controlling-app, hk-crm: Bestätigen/Abbrechen),
`src/components/ui/dialog.tsx` closeLabel ("Schließen", controlling-app), and
`src/components/archetypes/import-wizard/WizardStepper.tsx` `stateLabels` (completed/current/
upcoming). Those copies then miss baseline fixes that already shipped — the `InlineError`
export, the `mt-1` action wrapper in `src/components/ui/state-view.tsx`, `OutsideToolbarBand`
in `src/components/ui/dialog.tsx`, the `SearchInput` aria-label derivation. The packaged surface
contract is English defaults overridable per call site ([`/docs/PACKAGE.md`](/docs/PACKAGE.md),
locale row); the per-call seam established by the shipped
`layout-primitives-hardcoded-german`, `archetype-shell-locale-overrides` and
`wizard-shell-back-busy-label-props-and-hardcoded-english-label-sweep` fixes covers one string
at a prop, so translating a whole component's default set means forking the file, and the
per-call defaults themselves are still hard-coded, so a default-locale consumer must pass props
at every call site. This ticket adds the missing lower tier: one shared label context (thought
name `BaselineLabelsProvider`; the tree already carries two `createContext` precedents —
`UnifiedSurfaceContext`, `ToolbarBandContext`) that every baseline component reads its default
strings from, shipping an English default and a `de` preset; per-call props still win.

## Decision

de preset v1 scope = full sweep of every user-visible default in `src/components/` (operator decision, 2026-10-09).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add one shared label module under `src/lib/` (the existing shared-leaf pattern, `src/lib/utils`) exporting the provider (thought name `BaselineLabelsProvider`) plus a hook to read a default string, with an English default and a `de` preset.
- [ ] Wire the six audited seams so each user-visible default reads the provider value: `src/components/ui/state-view.tsx` ("Loading…", "Something went wrong", "No items yet"), `src/components/ui/error-boundary.tsx` (title/description/retry — a class component, so read via `static contextType`), `src/components/ui/search-input.tsx` (placeholder and `clearLabel` defaults), `src/components/ui/confirmation-dialog.tsx` (`confirmText`/`cancelText` defaults), `src/components/ui/dialog.tsx` (`closeLabel` default), `src/components/archetypes/import-wizard/WizardStepper.tsx` (`stateLabels` completed/current/upcoming defaults). Without a provider, the current English literal still renders (back-compat, per the shipped per-call convention).
- [ ] Add the missing override props where a component has none: `ErrorBoundary` copy (title/description/retry) and `StateView` per-variant titles (loading/error/empty); a per-call prop on the same string wins over the provider preset.
- [ ] Fill the `de` preset with at least the audited strings ("Wird geladen…", "Ein Fehler ist aufgetreten", "Erneut versuchen", "Noch keine Einträge", "Suchen…", "Suche löschen", "Bestätigen", "Abbrechen", "Schließen") and extend it across the full sweep from the next bullet.
- [ ] Sweep the rest of `src/components/` (ui and archetypes) for any other user-visible default text and route it through the provider too; every default string reads the provider rather than a literal.
- [ ] Add tests covering the provider + override precedence: the preset renders under the provider with no local copy, omission renders the English default, a per-call prop beats the preset (extend `src/components/archetypes/locale-overrides.test.tsx` or a dedicated provider test file).
- [ ] Bump the MANIFEST version for the touched archetype (import-wizard) and bump the `package.json` version (pattern of the shipped `archetype-shell-locale-overrides` and `wizard-shell-back-busy-label-props-and-hardcoded-english-label-sweep` tickets).
- [ ] Update `docs/PACKAGE.md`'s consumption-contract locale row to name the provider preset as the tier below per-call props.

## Acceptance

- Every user-visible default text across the baseline — no other hard-coded English default string remains in `src/components/` (ui and archetypes): without a provider the current English default renders unchanged, and with the `de` preset the German string renders instead.
- A consumer wrapping its root in the `de` preset renders the German default for every audited string ("Wird geladen…", "Erneut versuchen", "Suchen…", "Schließen", "Bestätigen", "Abbrechen") with no local vendored copy of a baseline file.
- Passing an existing per-call prop (`retryLabel`, `clearLabel`, `closeLabel`, `confirmText`, `cancelText`, `stateLabels`) renders the prop's value over the preset; existing per-call props render unchanged when no provider is mounted.
- Tests cover provider + override precedence and `npm test` returns green; `npx tsc --noEmit` reports no errors and `npm run verify:manifest` exits 0 after the version bump.

## Related

- [[adoption-scan-flags-shadowed-baseline-files]] — the open sibling whose shadowed-copy signal this mechanism stops at the source (for the locale cause)
- [[archetype-shell-locale-overrides]] — the per-call seam precedent (shipped v0.2.30), whose English defaults are now the provider's floor
- [[layout-primitives-hardcoded-german]] — the i18n rule "English defaults overridable per call site" this ticket extends with a preset tier
- [[wizard-shell-back-busy-label-props-and-hardcoded-english-label-sweep]] — same i18n line; its class-level sweep assertion is the template for this ticket's sweep bullet
- [ADR-0005](/docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — the Axis C scan that measures the vendored-copy drift this removes
- [docs/PACKAGE.md](/docs/PACKAGE.md) — the consumption contract row this ticket updates
