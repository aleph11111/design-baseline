---
area: i18n
opened: 2026-10-06
value: normal
model: sonnet
model_reason: "two label props on WizardShell following its own nextLabel/commitLabel seam + a sweep of the existing locale-overrides.test.tsx pattern; scoped implementation, no design decision left"
status: done
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-06T00:00:00Z
---

# Give WizardShell backLabel and busyLabel props and sweep remaining hardcoded English archetype-shell labels

## Context

WizardShell (the `import-wizard` archetype shell, `src/components/archetypes/import-wizard/WizardShell.tsx:84,88`) hardcodes two user-visible English button labels with no override prop: the footer `Back` button (`WizardShell.tsx:84`) and the in-flight label `busy ? "Importing…" : commitLabel` (`WizardShell.tsx:88`). It already takes `nextLabel` and `commitLabel` props with English defaults, so a German consumer (hk-crm `/settings/import`) can localise Next and Commit but Back and "Importing…" stay English. The donor's stated contract is that the packaged surface is English defaults overridable per call site (`docs/PACKAGE.md`); the `archetype-shell-locale-overrides` (v0.2.30) and `layout-primitives-hardcoded-german` fixes already follow that. hk-crm's v0.5.0 upgrade reported this as `design-baseline-wizard-shell-hardcoded-english-labels`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] `WizardShell`: add `backLabel?: string` (default `"Back"`) and `busyLabel?: string` (default `"Importing…"`) following the existing `nextLabel`/`commitLabel` seam, and use them in place of the literals at `WizardShell.tsx:84,88`.
- [ ] Give every other user-visible English literal the `src/components/` sweep finds (in archetype shells or layout primitives) a matching `*Label` prop or `labels` entry with its current English default; skip literals that already take an override prop or a `labels` object.
- [ ] Extend `src/components/archetypes/locale-overrides.test.tsx` to cover each new seam: the override renders the passed string, and omitting it still renders the English default.
- [ ] Bump the MANIFEST version for the touched archetypes and bump the package version.

## Acceptance

- With `backLabel="Zurück"` and `busyLabel="Importiere…"`, both render verbatim on the `WizardShell` footer; with neither passed, the footer still reads `Back` and `Importing…`. Both cases asserted in `src/components/archetypes/locale-overrides.test.tsx`.
- No other user-visible English literal in `src/components/archetypes/` or `src/components/layout/` is left without a call-site override — every call site that renders a user-visible English string has a label prop or a `labels` object seam.
- `npx tsc --noEmit`, `npm test`, and the MANIFEST plus package version bump all pass.

## Related

- [[archetype-shell-locale-overrides]] — the v0.2.30 precedent that made the list / settings / crud shell strings overridable per call site
- [[layout-primitives-hardcoded-german]] — the i18n fix that de-hardcoded the German layout chrome the same way
- [[row-actions-trigger-label-override]] — the one-string follow-on that closed another shell label gap
- [docs/PACKAGE.md](/docs/PACKAGE.md) — the English-defaults-overridable contract
- [src/components/archetypes/import-wizard/WizardShell.tsx](/src/components/archetypes/import-wizard/WizardShell.tsx) — the shell with the two hardcoded labels
