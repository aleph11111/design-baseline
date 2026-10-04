---
area: archetypes
opened: 2026-10-04
status: needs-enrichment
value: normal
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved Open question caps the score at 4"
  graded_at: 2026-10-04T12:00:00Z
---

# Settings tab bodies repeat the tab label as a nested heading

## Context

After ADR-0008 a `SettingsPageShell` tab whose content is a `SettingsTableShell` or `ListWithDetailShell` must pass the now-required `title`, which renders a nested h2 repeating the tab label directly under the tab strip, with the toolbar band inside the tab body padding. `ListWithDetailBody` (exported from `src/components/archetypes/list-with-detail/index.ts`) is the frameless tab-content form; `src/components/archetypes/settings-table/` has no equivalent. Source: PR #452 review follow-up.

## What to do

- [ ] Add a frameless `SettingsTableBody` export to `src/components/archetypes/settings-table/` for tab content, mirroring `ListWithDetailBody` (per ADR-0008; two call sites would then share the pattern).
- [ ] Update `docs/archetypes/settings-table.md` and the settings-page demo so tab content uses the frameless body, and bump the package version per the version-bump rule.

## Acceptance

- A `SettingsPageShell` tab containing `SettingsTableBody` shows no nested heading repeating the tab label, and its toolbar band sits flush with the tab body.
- Every shell that can be placed inside a `SettingsPageShell` tab (`SettingsTableShell`, `ListWithDetailShell`) has a frameless body export, no other tab-content shell is left requiring a duplicate `title`.

## Related

- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement
- [[archetype-convergence-settings-table-close-api]]
- [[list-with-detail-shell-presentation-split]]

## Open question

Fork: frameless `SettingsTableBody` export (Recommended — follows the existing `ListWithDetailBody` precedent, explicit) vs a derived rule where a page shell directly inside a tab body suppresses its nested heading (implicit, no new export, but hidden context coupling). Resolved headlessly to the Recommended option; revisit on review.
