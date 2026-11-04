# 0012 — The report-structure builder is its own `kind: page` archetype (structure-builder, Sb)

- **Status:** Accepted
- **Date:** 2026-11-05
- **Closes:** backlog `archetype-gap-structure-builder`
- **Respects:** [ADR 0001](0001-grandfather-authored-report-calendar.md) (no new authored entry), [ADR 0004](0004-appearance-locality-derived-vs-inherited.md) (no appearance props), [ADR 0008](0008-one-page-frame-slot-owned-placement.md) (one frame, slot-owned placement).

## Context

controlling-app's `workspace/pnl-builder` edits a report structure: a template picker with New / clone, an editable line tree (reorder, re-parent), a palette of accounts not yet placed, a coverage check, and a version history. The page sits on `PageFrame` alone and is grandfathered under RULES.md hard rule 12; the planned `workspace/bs-builder` is blocked on the same gap. No shipped page archetype covers an editable tree beside a palette: `statement-with-filters` and `report` are read-only, `settings-table` / `list-with-detail` edit flat rows, `matrix-grid` edits cells on two axes, `form-page` edits one entity's fields.

## Decision

1. **New `kind: page` archetype, not an edit mode.** Bolting an edit mode onto `statement-with-filters` would give that read-only statement a palette, a dirty state, a save action and a history sheet it never uses, and would change its slot map for every consumer. The builder's shape — tree as the body, palette + coverage as an aside, template list in the toolbar, history in a sheet — is different enough to be its own shell: `structure-builder`, key **Sb**.
2. **Provenance: `promoted_from: controlling-app`.** The shape is distilled from controlling-app's live `pnl-builder` page, its `docs/patterns/frontend-structure-builder.md` pattern doc and its ADR-0027 (the two persistence variants). That is the same footing as `print-statement` (no source spec, distilled from an ADR-governed live implementation); it is not a baseline-authored entry, so ADR 0001's closed set is untouched. Like print-statement, the promotion rests on one live page (pnl-builder); the second consumer, bs-builder, is planned and blocked on this gap (the dashboard tile layout went to analytics-dashboard's edit mode, ADR-0011). RULES.md hard rule 12 forbids a stopgap page, so waiting for a second live page is not an option.
3. **No DnD dependency.** The shipped tree (`StructureTree`) moves lines by keyboard (Alt+Arrow keys: reorder, indent into the line above, outdent) and by native HTML5 pointer drag. The pattern doc's `@dnd-kit` choice stays a consumer option: the shell's body is a plain slot, so a consumer may keep its own tree as long as it meets the contract's keyboard rule.
4. **Persistence stays consumer-owned.** The shell renders the Save action and an unsaved-changes marker when the page uses the deferred-bulk-save variant (`onSave` + `dirty`); a page using immediate idempotent reorder omits `onSave`. The navigation guard and the API call stay in the page.

## Consequences

- controlling-app can move `workspace/pnl-builder` onto `design-baseline/archetypes/structure-builder` and drop it from its grandfathered list; `bs-builder` unblocks.
- The contract requires palette placement and tree moves to work by keyboard alone; pointer drag is an addition, never the only path.
