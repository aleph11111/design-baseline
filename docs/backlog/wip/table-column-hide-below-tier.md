---
area: components
opened: '2026-09-28'
status: ready
value: normal
model: opus
model_reason: "a contract keying rule plus a typed union prop that needs an adherence-lint exclude; API must stay backwards compatible"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T20:00:00Z'
---

# tableColumn needs a responsive hide tier above md for wide tables

## Context

`src/components/archetypes/shared/tableColumn.ts` exposes one responsive tier, `hideBelowMd` (`hidden md:table-cell`). It is keyed by the Layer 6 role rule in `docs/archetypes/list-with-detail.md` and `docs/archetypes/settings-table.md`, and `hideBelowMdClass` applies it in `SettingsTableShell` and the list-with-detail `TableBody`. mistra's Aufnahmen table (`frontend/src/pages/DashboardPage.tsx`) needs a second tier: Aufnahmedatum, Erstellt and Transkript are hidden below 1536px so the Titel identifier doesn't wrap at 1440. mistra keeps a local `hideBelow2xl?: boolean` in its forked `ListWithDetailShell` for this, commented "Mistra-local: the donor contract has the `md` tier only".

## What to do

- [ ] Generalize the flag into one tier prop, `hideBelow?: "md" | "2xl"`, on `TableColumn`. Keep `hideBelowMd` as a deprecated alias for `hideBelow: "md"` and keep `hideBelowMdClass` exported, so no consumer breaks.
- [ ] Add a `hideBelowClass(col)` helper that returns `hidden md:table-cell` / `hidden 2xl:table-cell` and never hides the identifier. Route both shells through it.
- [ ] Extend the Layer 6 role table in both contracts. Record-provenance context (created / updated / recorded timestamps, the pipeline or model that produced the record) takes `2xl`. Other context (relational, descriptive, measures) keeps `md`. Row-state tokens, the ranked figure and the identifier never hide.
- [ ] Add an `archetype-look-union-prop` exclude for `tableColumn.ts` whose message cites the new contract rule. Bump the contract and MANIFEST versions and the package version.

## Acceptance

- A column with `hideBelow: "2xl"` renders `hidden 2xl:table-cell` on its head and cells in both shells; `hideBelowMd: true` still renders `hidden md:table-cell` (unchanged).
- The identifier column never hides under any tier, and no other table shell in `src/components/archetypes/` computes its own hide class.
- `node scripts/lint-design.mjs` exits 0 with the new union prop.

## Related

- [archive/raw-input-multiline-mono-variant-gap.md](../archive/raw-input-multiline-mono-variant-gap.md) — same "consumer-local variant vs donor prop" shape
- [mistra-package-install-cutover.md](../mistra-package-install-cutover.md) — mistra's fork list, where `hideBelow2xl` is one of the remaining local divergences
