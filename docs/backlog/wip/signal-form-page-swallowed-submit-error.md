---
area: archetypes
opened: 2026-09-26
status: ready
value: normal
model: sonnet
model_reason: "one new rubric entry modelled on the existing form-page-missing-errorboundary co-occurrence signal; offenders already named"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-26T12:00:00Z'
---

# Add adoptionQuality signal for toast-only swallowed submit errors in form-page consumers

## Context

`docs/archetypes/form-page.md:190` (Forbidden) and `:260` ban silently swallowing
server-action errors: a submission error must map to a field or surface via
`form.setError('root', …)` in the fixed slot above `<FormPageActions>`. Nothing in
`docs/audit-signals.json` detects the most common violation — a `catch` block whose only
handling is `toast.error(`. It compiles cleanly and is the path of least resistance, so every
new B adopter can repeat it. brickshop-manager found it at both of its B render sites
(`src/pages/ItemMasterEditor.tsx` `onSubmit` catch;
`src/components/orders/create/hooks/useOrderSubmission.ts` `submitOrder` /
`submitGeneralOrder` catches). The signal was first filed there as
`archetype-rollout-signal-form-page-swallowed-submit-error` (2026-09-07). It moves here
because after brickshop's package cutover (brickshop PR #1165) brickshop has no
`audit-signals` reader. Its old gate path, `@/components/archetypes/form-page`, no longer
exists either. The rubric's scanner is this donor's `scripts/scan-adoption-quality.mjs`
(per ADR-0005).

## What to do

- [ ] Add a `signals.adoptionQuality` entry `b-form-page-swallowed-submit-error` to `docs/audit-signals.json`. Model it on `form-page-missing-errorboundary`: its `coOccursWith` gates on the B shell names (`FormPageShell|FormPageActions|useFormPageState`), not an import path, so the gate works for both vendored and package consumers.
- [ ] The regex flags a file that has a `catch` block calling `toast.error(` and contains no `setError(` / `formState.errors.root` anywhere (whole-file absence, slurp-mode, same `\A(?!…)` technique as `form-page-missing-errorboundary`).
- [ ] Point `shouldBe` at form-page Layer 7: map the caught error into `form.setError('root', { message })` and render it in the destructive-tinted slot above `<FormPageActions>`.
- [ ] Add a fixture case to `scripts/scan-adoption-quality.test.mjs`: a toast-only catch is flagged, and a file that also calls `setError('root', …)` is not.

## Acceptance

- `scripts/scan-adoption-quality.mjs` run against brickshop-manager reports both `ItemMasterEditor.tsx` and `useOrderSubmission.ts`.
- A form-page consumer that calls `form.setError('root', …)` in its catch is no longer flagged, and no other file that lacks a B shell name is flagged.
- `scan-adoption-quality.test.mjs` passes with the new fixture cases.

## Related

- [archive/test-gap-form-page-shell-no-tests.md](../archive/test-gap-form-page-shell-no-tests.md)
- [archive/fleet-audit-and-adoption-doc-retire.md](../archive/fleet-audit-and-adoption-doc-retire.md) — kept `audit-signals.json` as the rubric's machine form
- ADR-0005 — adoptionQuality scan ships as a zero-dep donor script
