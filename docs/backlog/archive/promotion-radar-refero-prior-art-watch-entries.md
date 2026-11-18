---
area: docs
opened: 2026-11-18
status: done
value: low
model: sonnet
model_reason: "docs-only data entry following the existing radar entry shape; no design decision left"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-18T00:00:00Z
---

# Record Refero prior art as promotion-radar watch entries

## Context

The 2026-11-18 visual audit (https://claude.ai/artifact/JdrHqEoSKLShybLfYWUcoS) compared shipped archetypes against real products on Refero and found slots the baseline lacks. Per `docs/RULES.md` rule 1 the baseline ships a slot only from evidenced consumer shapes; Refero screens are prior art, not evidence. So these gaps are recorded as `watch` rows in `docs/promotion-radar.json` (candidates list, `status: "watch"`, the schema the existing entries use) and mirrored in the `## Watch` section of `docs/PROMOTION-RADAR.md`, which currently says "No watch rows". Nothing is built.

## What to do

- [ ] Add one `status: "watch"` entry to `docs/promotion-radar.json` per shape below, with `pattern`, `donorTarget` (the archetype slug + slot), `projects: []`, `count: 0`, and the Refero links under `notes` labelled "prior art, not evidence".
- [ ] In each entry's `notes`, name the fleet consumer that would have to show the shape (rule of 2) before it is built — read each archetype's `promoted_from` in `docs/archetypes/MANIFEST.json` to pick the consumers that own that archetype's pages.
- [ ] Shapes: `kanban-board` card meta (ID, date range, priority; refs https://refero.design/pages/ccd45807-fab1-4351-b660-6b02c06fce97, https://refero.design/pages/5486b733-d24d-445c-90f3-8be2bc01e599); `feed-inbox` item excerpt + hover/quick actions (https://refero.design/pages/96bb67df-fa31-4920-afc2-eab99f9d51c1); `report` title-row status badge + amount due (https://refero.design/pages/b176825e-b144-431f-aa4f-8dcf47104c65); `analytics-dashboard` StatTile KPI delta vs prior period + breakdown inline proportion bar (https://refero.design/pages/217e2393-6e1d-45cb-a592-6b84dee0e2ec); `detail-overview` rail typed values (links, chips, avatars) + collapsible groups (https://refero.design/pages/dc6815b4-b871-4434-b336-eec3f08dec4c); `import-wizard` results-with-row-errors and duplicates steps (Refero flows Intercom, Calendly — look up the flow URLs via the Refero MCP).
- [ ] Replace the "No **watch** rows" paragraph in `docs/PROMOTION-RADAR.md` with a table of these rows (keep the retired-2026-10-16 note below it); the md and json must agree.
- [ ] Do not add `list-with-detail` sheet header "one primary + overflow" — already covered by [[list-with-detail-sheet-title-squeezed-by-actions]]. Docs-only: no `src/` or MANIFEST change.

## Acceptance

- `docs/promotion-radar.json` parses and shows six new entries with `status: "watch"`, each carrying at least one Refero link and a named consumer.
- `docs/PROMOTION-RADAR.md` lists the same six rows under `## Watch` and no longer says "No watch rows".
- No `src/` file and no `MANIFEST.json` entry is changed; no archetype version bumps.

## Related

- [[list-with-detail-sheet-title-squeezed-by-actions]] — sheet-header shape already ticketed
- [[promotion-radar-sync-rows-derive-from-pins]] — radar md/json sync conventions
- [RULES.md](/docs/RULES.md) — rule 1, slots ship only from evidenced consumer shapes
