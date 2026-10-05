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

# matrix-grid contract contradicts itself on inline cell editing

## Context

`docs/archetypes/matrix-grid.md` forbidden-pattern #1 ("Inline cell edit ... editing happens in the side overlay that opens on click") bans editing a cell in place, while Layer 6 lists a "read-only vs editable-cell" variant that returns the shared editable-cell control from `renderCell`, and `src/examples/matrix-grid-demo.tsx` ships an "inline edit" mode built on `CellSelect` (`@/components/ui/cell-input`). A consumer reading the contract cannot tell whether inline editing is conformant.

## What to do

- [ ] Resolve the contract to one rule: keep the Layer 6 editable-cell variant and narrow forbidden-pattern #1 to "bare native `<input>`/`<select>` or hand-rolled in-cell editors; in-cell editing goes through the shared `CellSelect` / cell-input control" (Layer 6 and the demo already agree on this, two call sites).
- [ ] Align `src/examples/matrix-grid-demo.tsx` and its inline/click mode labels with the narrowed rule, and bump the contract version and package version per the version-bump rule.

## Acceptance

- `docs/archetypes/matrix-grid.md` no longer states both that inline cell editing is forbidden and that an editable-cell variant is allowed.
- The matrix-grid demo's "inline edit" mode matches what the contract permits, and every in-cell editor in the demo goes through the shared cell-input control.

## Related

- [[matrix-grid-page-header-inconsistency]]
- [[refactor-matrix-grid-cell-and-head-extraction]]
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — Appearance locality

## Open question

Fork: keep the editable-cell variant and narrow forbidden-pattern #1 (Recommended — matches Layer 6 and the shipped demo; the shared control already exists) vs keep the ban and remove the "inline edit" mode and the editable-cell variant from Layer 6 (stricter, drops a shipped capability). Resolved headlessly to the Recommended option; revisit on review.
