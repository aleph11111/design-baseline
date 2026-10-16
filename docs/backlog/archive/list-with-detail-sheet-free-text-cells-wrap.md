---
area: archetypes
opened: 2026-10-15
status: done
value: high
depends_on: [list-with-detail-demo-shared-selection-stacks-sheets]
model: opus
model_reason: "amends a just-accepted ADR and a locked archetype's sizing rule; the free-text marker is a closed-API design choice"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-15T00:00:00Z
---

# List-with-detail sheet lets free-text table cells wrap instead of widening to the ceiling

## Context

[ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md) (PR #570, v0.11.5) sizes the detail sheet to min-content (`sm:w-min sm:min-w-md sm:max-w-[calc(100vw-4rem)]`, `ListWithDetailShell.tsx:352`) and holds every table cell on one line (`sm:[&_td]:whitespace-nowrap sm:[&_th]:whitespace-nowrap`, line 388). As a result, a detail table with a free-text column (a description, or a long key/value value) pushes the sheet to the ceiling and fires the overflow warning. The ADR's consequence list calls that intended.

Operator decision (2026-10-15, option B in the mockup https://claude.ai/artifact/UwK87byWjx6Cwn1e1zKT9a): free-text cells wrap. Codes, numbers, dates and status badges stay on one line. The sheet only grows as wide as the single-line columns plus a readable text column, so it stays an overlay with the list visible beside it. The no-sideways-scroll rule stays; it is now met by wrapping, not by width.

## What to do

- [ ] Amend ADR-0010 with a dated "Amendment" section (option B, the operator decision, and why A was rejected). Do not write a new ADR; update the consequence line about free-text columns.
- [ ] Give the donor one shared, exported way to mark a free-text cell inside a detail table (e.g. a `data-*` attribute or a small cell primitive exported from `design-baseline/archetypes/list-with-detail`). A marked cell wraps (`white-space: normal`) and has a readable min-width floor, about 24ch, so min-content sizing doesn't collapse it to one word, plus a max width of about 48ch. Every unmarked cell keeps `nowrap`. Keep the closed shell API: this marks the kind of content, not a width.
- [ ] Update the dev overflow warning in `ListWithDetailShell.tsx` so that when it fires on a table, it also says to mark free-text columns before escalating to a route.
- [ ] Update `docs/archetypes/list-with-detail.md` Layer 11 and the forbidden pattern on sideways scroll, add a version note, and bump MANIFEST and the package patch version per `docs/RULES.md`.
- [ ] Extend the wide-detail section of `src/examples/list-with-detail-demo.tsx` with a request-lines table (Pos, Artikel, Beschreibung, Menge, Lagerplatz, Status) whose Beschreibung column is marked.
- [ ] Extend `scripts/check-detail-sheet.mjs` with that case.

## Acceptance

- At 1280px the request-lines demo with a marked description column opens the sheet narrower than the ceiling, wraps the descriptions, shows codes, quantities and badges on one line, and emits no overflow warning.
- The same table with the description left unmarked still reaches the ceiling and warns, and the warning text names marking free-text columns.
- Summary details and the existing 7-column table case are unchanged (448px and 723px in `npm run check:detail-sheet`), and no other check case changes width.
- At 390px behaviour is unchanged: full-screen, cells wrap.
- `npx tsc --noEmit` and `npm test` pass.

## Related

- [[list-with-detail-sheet-sizes-to-content]]
- [[list-with-detail-demo-shared-selection-stacks-sheets]] — must ship first: it edits the same demo file's selection wiring, so extending the demo before it lands means redoing the panel split
- [ADR-0010](/docs/adr/0010-detail-overlay-sizes-to-content.md) — detail overlay sizes to content
