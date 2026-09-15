---
area: tooling
opened: '2026-09-15'
status: ready
value: normal
model: sonnet
model_reason: "mechanical — eleven named rules each need one ledger row in an existing table format; no design fork, the rules' own `message` fields already carry the rationale to compress"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-09-15T00:00:00Z'
---

# The `_adherence.NOTES.md` per-rule ledger documents only 19 of the 30 shipped rules

## Context

`_adherence.NOTES.md` presents itself as the per-rule ledger for
`_adherence.json` — `## The archetype-* appearance-prop rules` and the three
`### …ratchet engaged for the closed API` sections each carry an
`| id | shape caught | include |` table, and the file is what several rule
`message` fields point a reader at ("See `_adherence.NOTES.md`"). Measured
against the shipped rule set on 2026-09-15, eleven of the thirty rule ids appear
nowhere in the file:

- the three tag rules — `no-bare-h1`, `no-raw-table`, `no-bare-button`
- six `*-residual-appearance-prop` rules — `detail-overview-`,
  `list-with-detail-`, `settings-table-`, `crud-dialog-`, `report-`,
  `analytics-dashboard-`
- two deleted-axis rules — `analytics-dashboard-columns-prop`,
  `stat-tile-row-columns-prop`
- the whole `crud-dialog` ratchet, which has no section at all: the string
  "crud-dialog" does not occur in the file, so `crud-dialog-shell-class-name`
  (a `severity: error` rule scoped folder-wide across
  `src/components/archetypes/crud-dialog/**`) is undocumented despite being one
  of only two surviving `className` gates.

The gap has already cost a filing. The
[archive/adherence-shell-classname-rule-consolidation.md](archive/adherence-shell-classname-rule-consolidation.md)
ticket's What-to-do instructed the implementer to "remove … the
`crud-dialog-shell-class-name` row" from the ledger — a row that has never
existed. A ledger that is silently partial reads as exhaustive, so its absences
get mistaken for the rule not existing rather than the row not being written.

## What to do

- [ ] Add a `### The crud-dialog-* error rules` section mirroring the existing
      `detail-overview-*` / `list-with-detail-*` sections (same
      `| id | shape caught | include |` table plus rationale paragraph),
      covering `crud-dialog-shell-class-name` and
      `crud-dialog-residual-appearance-prop`. The rationale to compress is
      already in those rules' `message` fields.
- [ ] Add ledger rows for the six `*-residual-appearance-prop` rules, each in
      its archetype's own section, creating the missing sections for
      `settings-table`, `report`, and `analytics-dashboard`.
- [ ] Add rows for `analytics-dashboard-columns-prop` and
      `stat-tile-row-columns-prop` alongside the residual rule of their folder.
- [ ] Document the three tag rules (`no-bare-h1`, `no-raw-table`,
      `no-bare-button`) — they are the `tag`-matcher kind rather than `pattern`,
      which `## How it runs` describes generically but never enumerates.
- [ ] Add a check to `scripts/lint-design.test.mjs` asserting every id in
      `_adherence.json` occurs in `_adherence.NOTES.md`, so the ledger cannot
      silently fall behind the rule set again. The existing rule-count assertion
      at `scripts/lint-design.test.mjs:89` is the precedent for reading the
      config from disk inside a test.

## Acceptance

- Every rule id in `_adherence.json` occurs at least once in
  `_adherence.NOTES.md` — not only the eleven named above, so a rule added later
  cannot land undocumented either.
- The new test fails when any id is removed from `_adherence.NOTES.md` while
  still present in `_adherence.json`.
- `node scripts/lint-design.mjs` reports the same summary line as before
  (`226 file(s) scanned, 58 warning(s), 0 error(s)`) — this is a docs-plus-test
  change and must not alter scan behaviour.
- `npm test` passes.

## Related

- [archive/adherence-shell-classname-rule-consolidation.md](archive/adherence-shell-classname-rule-consolidation.md) — the filing this gap misled; it asked for the deletion of a ledger row that never existed.
- [archive/archetype-convergence-crud-dialog-close-api.md](archive/archetype-convergence-crud-dialog-close-api.md) — the close that added the two undocumented `crud-dialog-*` rules.
- [archive/lint-design-include-reachability-guard.md](archive/lint-design-include-reachability-guard.md) — the precedent for guarding the rule config with a test rather than review.
- [ADR-0003](../adr/0003-adherence-lint-zero-dep-scanner.md) — adherence lint ships as a zero-dep scanner; governs how rule/doc changes are made.
