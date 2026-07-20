---
area: docs-drift
opened: 2026-07-19
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T00:00:00Z
---

# STYLE.md archetypes section still claims only three archetypes have shipped

## Context

`docs/STYLE.md` line 158, in the "Archetypes" section, reads:

> Apply with the sibling command `/style-archetypes` (requires `/style-baseline` to have run first). The first ship covers list-with-detail, settings-table, and crud-dialog.

This sentence describes the archetype layer's very first release. `docs/archetypes/MANIFEST.json` now registers 14 archetypes (confirmed by `ls docs/archetypes/*.md | grep -v README`, which lists `analytics-dashboard`, `calendar`, `crud-dialog`, `detail-overview`, `feed-inbox`, `form-page`, `grouped-list`, `import-wizard`, `kanban-board`, `list-with-detail`, `matrix-grid`, `report`, `settings-table`, `tabbed-settings`), and `docs/ARCHITECTURE.md` §4 documents all 14 with their `promoted_from` provenance. An operator reading `docs/STYLE.md` today — the doc this repo's own README points to for the archetype convention — would believe `/style-archetypes` only has three shapes to offer.

## What to do

- [ ] Rewrite the "first ship covers..." sentence in `docs/STYLE.md`'s Archetypes section so it no longer names a fixed 3-archetype list, e.g. point to `docs/archetypes/MANIFEST.json` or `docs/archetypes/README.md` as the living catalog instead of enumerating slugs that will drift again as more are promoted.

## Acceptance

- `docs/STYLE.md`'s Archetypes section no longer states or implies that only `list-with-detail`, `settings-table`, and `crud-dialog` are available via `/style-archetypes`.

## Related

- `docs/archetypes/MANIFEST.json`, `docs/ARCHITECTURE.md` §4 — current 14-archetype catalog this ticket brings `docs/STYLE.md` in line with.
- [[docs-drift-readme-stale-component-archetype-counts]] — the same stale "3 archetypes" snapshot recurring in the root README.
