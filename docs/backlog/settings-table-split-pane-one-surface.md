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

# settings-table split-pane variant needs a one-surface decision

## Context

The "split-pane editing" variation in `docs/archetypes/settings-table.md` (table and edit form side by side) was two cards before ADR-0008. Section 3 of that ADR allows one raised surface per page, so the variant has to either fit inside the one frame of `SettingsTableShell` (`src/components/archetypes/settings-table/`) or go away; today the contract still allows it with an inline-documented reason while the shipped shell cannot render two cards.

## What to do

- [ ] Decide and implement the variant under ADR-0008 section 3: render both panes inside the one `PageFrame` surface, divided by a hairline, instead of two cards (keeps the documented side-by-side editing use case).
- [ ] Update `docs/archetypes/settings-table.md` (the split-pane variation and the Forbidden hand-rolled-card line), add a gallery demo for the variant per the living-demos rule, and bump the package version per the version-bump rule.

## Acceptance

- The split-pane variant renders table and edit form inside a single raised surface with a hairline divider, and shows no second card.
- `docs/archetypes/settings-table.md` no longer describes a two-card split-pane layout, and every variant it lists maps to a shipped, demoed layout.

## Related

- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement
- [[settings-tab-body-duplicate-heading]]
- [[archetype-convergence-settings-table-close-api]]

## Open question

Fork: both panes inside the one frame divided by a hairline (Recommended — keeps the side-by-side use case, matches the one-surface rule) vs retire the split-pane variant in favour of the crud-dialog sheet (less code to maintain, but loses the persistent side-by-side editor). Resolved headlessly to the Recommended option; revisit on review.
