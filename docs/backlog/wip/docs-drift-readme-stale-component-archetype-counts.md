---
area: docs-drift
opened: 2026-07-19
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T00:00:00Z
---

# Root README "What's in it" section understates shipped primitive and archetype counts

## Context

`README.md`'s "What's in it" tree (lines 33-36) reads:

```
    ├── components/
    │   ├── ui/                     # 36 shadcn/ui primitives
    │   ├── layout/                 # AppShell, AppSidebar, AppHeader (router-agnostic)
    │   └── archetypes/             # page-shape contracts (list-with-detail, settings-table, crud-dialog)
```

and the "How to apply it" section (line 65) says:

> Optionally, run `/style-archetypes` after `/style-baseline` to also copy the page-shape archetypes (list-with-detail, settings-table, crud-dialog) into the project.

Both lines are frozen at the donor's earliest state (3 archetypes). Current repo state contradicts them:

- `ls src/components/ui/*.tsx | grep -v '\.test\.'` returns 41 primitive files (`docs/ARCHITECTURE.md` §2 independently states 44, counting non-`.tsx` primitives too) — not 36.
- `ls docs/archetypes/*.md | grep -v README` shows 14 shipped archetype slugs (`analytics-dashboard`, `calendar`, `crud-dialog`, `detail-overview`, `feed-inbox`, `form-page`, `grouped-list`, `import-wizard`, `kanban-board`, `list-with-detail`, `matrix-grid`, `report`, `settings-table`, `tabbed-settings`), matching the 14 entries in `docs/archetypes/MANIFEST.json` — not just `list-with-detail`, `settings-table`, `crud-dialog`.

An operator reading the README today would believe `/style-archetypes` only offers 3 page shapes and the ui primitive layer is much smaller than it is, understating what baseline actually ships.

## What to do

- [ ] Update the README "What's in it" tree comment for `ui/` to reflect the current primitive count (or drop the specific number in favor of a non-drifting phrase like "shadcn/ui primitives — see `docs/ARCHITECTURE.md` for the current count").
- [ ] Update the `archetypes/` tree comment and the "How to apply it" sentence to stop enumerating only the first 3 archetypes — either list all 14 or point to `docs/archetypes/MANIFEST.json` / `docs/archetypes/README.md` as the living list.

## Acceptance

- README no longer states a fixed primitive count that disagrees with `ls src/components/ui/*.tsx`.
- README's archetype mentions no longer name only `list-with-detail`, `settings-table`, `crud-dialog` while `docs/archetypes/MANIFEST.json` lists 14 entries.

## Related

- `docs/ARCHITECTURE.md` §2 (44 primitives) and §4 (14 archetypes) — the current, correct counts this ticket brings the README in line with.
- [[docs-drift-style-md-archetype-first-ship-stale]] — the same "first ship = 3 archetypes" snapshot recurring in `docs/STYLE.md`.
