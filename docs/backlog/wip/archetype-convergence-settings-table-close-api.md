---
area: archetypes
opened: 2026-08-18
status: ready
value: high
roadmap: archetype-convergence
depends_on:
  - archetype-convergence-phase0-appearance-locality-decision
spec: docs/superpowers/specs/2026-08-17-archetype-convergence-design.md
model: opus
model_reason: "a rule-12 keep-or-delete call on a column-level prop plus a lint-ratchet flip and doc reconciliation is design judgment, not pattern-following, even though two siblings set precedent for the shape of the fix"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-18T00:00:00Z
---

# Close settings-table's column alignment prop to derived-only (MANIFEST #3)

## Context

Phase 1 of the [archetype-convergence roadmap](../archetype-convergence.md)
continues in MANIFEST order after
[list-with-detail](../archive/archetype-convergence-list-with-detail-close-api.md)
(#0), [form-page](../archive/archetype-convergence-form-page-width-prop.md)
(#1) and [detail-overview](../archive/archetype-convergence-detail-overview-close-api.md)
(#2). `settings-table` is MANIFEST #3, key `D2`. Running
`node scripts/lint-design.mjs` shows exactly **one** warn hit under
`src/components/archetypes/settings-table/`: `archetype-look-union-prop` on
`SettingsTableShell.tsx:37` — `SettingsColumn.align?: "left" | "right" |
"center"`.

Per [ADR-0004](../../adr/0004-appearance-locality-derived-vs-inherited.md) /
RULES.md hard rule 12, a per-call-site prop is legal only if the contract
carries an exhaustive decision rule deriving its value from the entity or its
data. `docs/archetypes/settings-table.md` names no such rule for `align` — the
word "align" does not appear in the contract at all, so today it is
undocumented discretion, the same defect class as `list-with-detail`'s
`ListColumn.align` (closed the same way in the sibling ticket above).

`identifierMono?: boolean` on the same `SettingsColumn` type does **not** trip
the lint (it's a boolean, not a string-literal union), and it is already
correctly keyed: `settings-table.md:127` ("in the **monospace identifier
style** for alphanumeric codes or slugs; omit the monospace style for
human-readable name identifiers") and `:137` ("Identifier without the
monospace style — when the identifier is a human-readable name … the
monospace style may be omitted") state the same rule twice, once under
**Required** and once under **Allowed variation**. The **Allowed variation**
framing is the defect — rule 12 requires a keying rule stated as a rule, not
offered as an optional variation, even when (as here) the keying itself is
sound.

`className` and `headerFill` are both already closed correctly and must stay
that way: `SettingsTableShellProps` declares no `className` (confirmed by
reading the type in full), and no `headerFill` prop reaches
`SettingsTableShell` (it spreads only `SurfaceHeaderSlotProps`, which has
`kicker` / `title` / `subtitle` / `icon` / `headerActions`, no `headerFill`).
But `docs/archetypes/settings-table.md:70` still claims one exists — "a single
shell instance may override the project's house header-fill mode" — the same
stale-doc-describes-a-prop-the-code-doesn't-have defect the `form-page` ticket
found and fixed for its own `headerFill` language. `SurfaceHeaderSlot.tsx:24`
already states the correct rule in its own docstring ("there is no per-shell
override prop").

`toolbar`, `bulkActions` and `headerActions` are `ReactNode` slots on
`SettingsTableShellProps`. Per RULES.md hard rule 12 / spec D5, a slot that
composes documented section primitives and action buttons is structure, not
appearance, and stays `ReactNode`; `toolbar` and `bulkActions` compose the
contract's Layer 4 toolbar primitives (search input, filter pills, async
action button) and `headerActions` composes Layer 3's documented header
buttons — none of the three lets two projects render the same entity with a
different *look*, only with different *content*, so none trips
`archetype-appearance-slot` today and none needs to change.

`docs/archetypes/settings-table.md`'s frontmatter `version: 1.3` and the
MANIFEST `settings-table` entry's `version: "2.0"` are not in conflict —
`docs/archetypes/README.md`'s Versioning section documents the two numbers as
independent, with the deliverable (MANIFEST) version always running ahead of
the spec version for non-rule-changing ships. Since the MANIFEST major is
already `2`, closing `align` (a spec-rule change, requiring a spec major bump
to `2.0` per the majors-must-align rule) does not require a further MANIFEST
*major* bump — only a deliverable version bump within major 2 (e.g. `2.1`).

## What to do

- [ ] Rule on `align`: per rule 12, either (a) derive it from the cell's data
      kind — numeric/currency figures right-aligned, everything else left —
      and delete the prop from `SettingsColumn`, or (b) keep the prop and
      write an exhaustive keying rule into `settings-table.md`'s Layer 6
      (Table / grid) tying each value to a checkable property of the column's
      data. Do not keep it on undocumented "consumer preference" grounds.
      State the reasoning in the PR, mirroring how the `list-with-detail`
      ticket deferred its `presentation`/`detailPresentation`/`unstyled`
      rulings to implementation.
- [ ] Move `identifierMono`'s keying rule out of "**Allowed variation**" in
      `settings-table.md` (currently duplicated at `:127` and `:137`) into
      **Required** language stated as a rule, not an optional variation —
      the keying itself (alphanumeric codes/slugs → monospace,
      human-readable names → omit) is correct and does not change.
- [ ] Re-read every other "**Allowed variation**" block in
      `docs/archetypes/settings-table.md` (Layer 2's optional state-provider,
      Layer 3's `kicker`/`headerActions`/sync-action, Layer 4's search/filter/
      async-button/bulk-actions, Layer 6's sortable-headers/status-indicators/
      per-row-menu/row-checkbox) against rule 12 — a variation permitted with
      no keying rule is a design space, not a contract. Where a block already
      keys correctly (e.g. bulk actions rendering only while
      `selectedIds.length > 0` is structural, not a look choice), leave it;
      flag and resolve any that turn out to be naked discretion the same way
      as `align`.
- [ ] Delete the stale `headerFill`-override language from
      `docs/archetypes/settings-table.md:70` — no such prop exists on
      `SettingsTableShellProps` or `SurfaceHeaderSlotProps` today;
      `<AppShell headerFill=…>` is the only entry point.
- [ ] Confirm in the PR description (no code change expected) that `toolbar`,
      `bulkActions` and `headerActions` stay `ReactNode` per spec D5 —
      composition of documented section primitives, not appearance.
- [ ] Update `docs/archetypes/settings-table.md` (role-level language only,
      names no primitive and no Tailwind class — RULES.md rule 3) and
      `docs/archetypes/settings-table.baseline.md` (carries the binding) in
      tandem with whatever `align` ruling and `identifierMono` doc move land.
- [ ] Bump `docs/archetypes/settings-table.md`'s frontmatter `version` from
      `1.3` to major `2.0` (the API breaks or the contract's decision-rule
      language tightens either way `align` is ruled). Bump the MANIFEST
      `settings-table` entry's `version` from `"2.0"` to `"2.1"` — the major
      is already aligned, so this is a deliverable bump within the same
      major, not a further major bump. Leave `source_spec_version` untouched.
- [ ] If `align` is deleted: add a `settings-table-align-prop` `severity:
      "error"` rule to `_adherence.json`, `include:
      "src/components/archetypes/settings-table/**"`, mirroring
      `list-with-detail-unstyled-prop`'s shape, with a `message` naming the
      contract reason. If `align` is kept with a keying rule instead, add no
      such error rule — the closed-and-kept precedent is `detail-overview`'s
      `layout` and `width`, which needed none.
- [ ] Add `src/components/archetypes/settings-table/**` to the `exclude`
      arrays of `archetype-appearance-noun-prop`, `archetype-look-union-prop`
      and `archetype-appearance-slot` in `_adherence.json`, mirroring the
      existing `detail-overview/**` / `form-page/**` / `list-with-detail/**`
      entries.
- [ ] Update `SettingsTableShell.test.tsx` and `src/examples/settings-table-demo.tsx`
      to whichever closed API results — if `align` survives as a kept,
      data-keyed prop, drive its demonstration in the example from the
      row/column data shape rather than a free-choice control (living-demo
      rule); if deleted, remove any call site that passed it.

## Acceptance

- [ ] `npx tsc --noEmit` passes and `npm test` passes, with
      `SettingsTableShell.test.tsx` updated to the closed API.
- [ ] `node scripts/lint-design.mjs` reports 0 errors and no warn hit from an
      `archetype-*` rule names a file under
      `src/components/archetypes/settings-table/`.
- [ ] Every surviving prop on `SettingsTableShellProps` / `SettingsColumn` is
      data, a callback, or a structural choice whose value the contract
      derives from the entity or its data — not only `align`, the axis this
      ticket named going in.
- [ ] `src/examples/settings-table-demo.tsx` still renders, and no hand-typed
      replacement for a deleted prop appears at any call site in `src/`.
- [ ] `docs/archetypes/settings-table.md`, `.baseline.md`, and the MANIFEST
      `settings-table` entry's versions agree with the shipped API — spec and
      MANIFEST both major `2`, MANIFEST at `2.1` — and `settings-table.md`
      still names no primitive and no Tailwind class.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap,
  Phase 1.
- [archetype-convergence-list-with-detail-close-api.md](../archive/archetype-convergence-list-with-detail-close-api.md)
  — the sibling closure this ticket mirrors most closely: the same
  `ListColumn.align` / `SettingsColumn.align` defect, the "rule on X, state
  reasoning in the PR" deferral pattern, and the exclude-list / error-rule
  ratchet mechanics.
- [archetype-convergence-form-page-width-prop.md](../archive/archetype-convergence-form-page-width-prop.md)
  — precedent for the stale-`headerFill`-doc-language defect this ticket also
  finds, and for the spec/MANIFEST major-version-pairing bookkeeping.
- [archetype-convergence-detail-overview-close-api.md](../archive/archetype-convergence-detail-overview-close-api.md)
  — precedent for keeping a data-keyed prop (`layout`, `width`) with no new
  error rule, relevant if `align` is kept rather than deleted.
- [archetype-convergence-phase0-appearance-locality-decision.md](../archive/archetype-convergence-phase0-appearance-locality-decision.md)
  — depends on: ADR-0004/hard rule 12 is what sorts `align` and `identifierMono`.
- ADR-0004 — the rule this ticket applies.
