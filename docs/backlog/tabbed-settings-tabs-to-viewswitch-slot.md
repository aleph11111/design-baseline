---
area: archetypes
opened: 2026-10-09
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-09T09:45:00Z
---

# Tabbed-settings shell puts page-switching tabs in the PageFrame toolbar

## Context

`SettingsPageShell` (`src/components/archetypes/tabbed-settings/SettingsPageShell.tsx:68`) renders its page-switching `TabsList` through `PageFrame`'s `toolbar` slot. Below `md` the toolbar moves into the filter sheet, so the tabs render clipped; the slot grammar in `docs/PLACEMENT.md` puts a control that switches what the page shows in `viewSwitch`. The new `page-tabs-in-toolbar` adherence rule flags this line as a warn.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Move the `TabsList` from `toolbar={…}` to `viewSwitch={…}` in `SettingsPageShell`, keeping the surrounding `Tabs` provider; check the `tabbed-settings` demo and contract still match.

## Acceptance

- `node scripts/lint-design.mjs` reports no `page-tabs-in-toolbar` finding for `SettingsPageShell.tsx`, and no other shell under `src/components/archetypes/` still places page-switching tabs in `toolbar`.
- The settings tabs stay visible above the filter sheet below `md`.

## Related

- [[adherence-lint-page-tabs-in-toolbar-need-viewswitch]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement
