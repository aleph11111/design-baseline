---
area: archetypes
opened: 2026-10-18
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-18T00:00:00Z
---

# Add a non-tabbed settings-sections page archetype

## Context

The settings archetypes in v0.12.2 are `tabbed-settings` (`SettingsPageShell` requires `tabs[]`), `settings-table` (one config table) and `form-page` (one entity form, no header actions). brickshop-manager has about twelve settings pages that are none of these: a stack of independent cards/sections on one page, often with one page-level verb such as "Refresh" or "New template" (`Sourcing`, `SystemSettings`, `MessageHubSettings`, `BrickLinkDrift`, `CarrierSettings`, `LeadTimes`, `NumberingSettings`, `EmailTemplates`, `InvoiceTemplates`, `InvoicePaymentTexts`, `PricingRules`, `LegalTexts`). That clears the Rule of 2 in `docs/CHOOSING-A-SURFACE.md`. Today they sit on a brickshop-local shell that renders its own `PageHeader`, which the adoption scan flags as `page-header-above-shell`.

## What to do

- [ ] Add a settings-sections page archetype: `PageFrame` (ADR-0008) with `title`/`subtitle`/`actions`, and a body of stacked `SectionCard`s, each section owning its own title and save.
- [ ] Add `docs/archetypes/<slug>.md` and a row in the `docs/CHOOSING-A-SURFACE.md` surface ladder that separates it from F2, D2 and B.
- [ ] Ship it in a tagged release so brickshop can bump its pin.

## Acceptance

- A settings-sections page renders exactly one page title, with page verbs in the `actions` slot and each section's title rendered once.
- The adoption scan reports zero `page-header-above-shell` hits for a page built on the new shell.
- `docs/CHOOSING-A-SURFACE.md` names when to pick it instead of `tabbed-settings`, `settings-table` or `form-page`.

## Related

- [[settings-tab-body-duplicate-heading]] — earlier settings heading fix
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame
