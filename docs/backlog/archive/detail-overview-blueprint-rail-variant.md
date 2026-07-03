---
area: archetypes
opened: 2026-06-21
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-06-21T01:38:33Z
---

# Update the detail-overview blueprint SVG for the v2.1 Command Rail variant

## Context

The v2.1 amendment added a second sanctioned layout to archetype C — the Command
Rail (`layout="rail"`) — to `docs/archetypes/detail-overview.md` and
`DetailOverviewShell`. The annotated blueprint `docs/archetypes/detail-overview-blueprint.svg`
(referenced from the spec frontmatter and the doc body) still depicts only the
canonical vertical layout. It is now incomplete: a reader consulting the blueprint
sees no rail. The spec already contains an ASCII diagram of the rail placement
(full-width header over a sticky ~300px aside + scrolling main, collapsing to
vertical below `lg`) that the SVG can be based on. This was deliberately left out of
scope of the v2.1 ship (amendment §8 marks the blueprint untouched).

## What to do

- [ ] Add a rail-layout panel to `detail-overview-blueprint.svg` showing the
      `lg+` two-column placement (header full-width; summary + references in the
      sticky aside; stats + content in the main column) alongside the existing
      vertical blueprint.
- [ ] Annotate the responsive collapse note (rail → canonical vertical below `lg`).

## Acceptance

- [ ] The blueprint SVG shows both the vertical and the Command Rail layouts.
- [ ] The rail panel matches the §4 placement in `detail-overview.md` (summary aside
      top + sticky, references aside bottom, stats + content in main).

## Related

- [archetype-doc-manifest-version-drift.md](archetype-doc-manifest-version-drift.md)
- `docs/archetypes/detail-overview.md` (Layout variants — §4 rail placement)
- `docs/archetypes/detail-overview-blueprint.svg`

## Resolution (2026-07-03)

Done on feat/plex-ledger-hygiene: blueprint SVG gained a second annotated panel for layout="rail" (lg+ two-column placement, unified frame, sticky rail, responsive-collapse note); stale text-2xl/text-sm header annotations in panel 1 corrected to the ledger scale.
