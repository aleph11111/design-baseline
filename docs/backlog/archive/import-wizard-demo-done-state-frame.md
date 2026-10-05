---
area: archetypes
opened: 2026-10-04
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-04T12:00:00Z
---

# import-wizard demo done state breaks the one-page-frame rule

## Context

The "Import complete" state in `src/examples/import-wizard-demo.tsx` replaces the whole `WizardShell` (`src/components/archetypes/import-wizard/`) with a hand-rolled card and no page title, so the done state renders outside `PageFrame` and breaks the one-page-frame rule of ADR-0008 (every page shell renders through one frame: title, one raised surface, toolbar band, body).

## What to do

- [ ] Give `WizardShell` a done/complete state that renders inside the frame, keeping the page title and the single raised surface (per ADR-0008 and `wizardshell-adopt-surface-header-slot`).
- [ ] Move `src/examples/import-wizard-demo.tsx` onto that state and delete the hand-rolled card; update `docs/archetypes/import-wizard.md` and bump the package version per the version-bump rule.

## Acceptance

- The import-wizard demo shows the page title and a single raised surface after "Import complete", and no longer renders a card outside `WizardShell`.
- A `WizardShell` test renders the done state and asserts the page h1 is still present.

## Related

- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement
- [[wizardshell-adopt-surface-header-slot]]
- [[test-gap-wizard-shell-no-tests]]
