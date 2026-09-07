---
area: archetypes
opened: '2026-09-07'
status: done
gate:
  score: 4
  passed:
    - title
    - context
    - what-to-do
    - acceptance
    - related
  failed:
    - open_question: Open question section present — caps score at 4 per gate ceiling rule
  graded_at: '2026-09-07T00:00:00Z'
value: normal
model: opus
model_reason: >-
  contract-keying triage (derived-vs-inherited test on SectionCard.tone and SurfaceFrame.overflow,
  plus writing/enumerating the keying rule in the owning contract) is design judgment, not
  pattern-following — mirrors adherence-lint-union-prop-blind-spot's model_reason
roadmap: archetype-convergence
---

# Two appearance-prop adherence rules never scope to `src/components/layout/`

## Context

`_adherence.json`'s `archetype-appearance-noun-prop` and
`archetype-look-union-prop` rules carry `include: "src/components/archetypes/**"`
only, so `src/components/layout/**` — the shared chrome the archetype shells
compose — is invisible to them. Two of the four archetype-layer appearance
rules already carry the second root: `archetype-numeric-union-prop`'s
`include` is `["src/components/archetypes/**", "src/components/layout/**"]`,
and `stat-tile-row-columns-prop` targets
`src/components/layout/StatTileRow.tsx` directly — both confirmed in the
current `_adherence.json`. RULES.md hard rule 12 governs any per-call-site
appearance prop on an archetype composition regardless of which directory it
lives in; the noun and string-union rules simply never got the second root
when it was added to their numeric-union sibling.

Two live ungated hits today, both reachable from a closed archetype:

- `src/components/layout/SectionCard.tsx:47` — `tone?: "default" | "muted"` —
  an appearance-noun prop (matches `archetype-appearance-noun-prop`'s
  pattern) *and* an inline look union (matches
  `archetype-look-union-prop`'s pattern) at once.
  `src/components/archetypes/detail-overview/DetailSection.tsx:36` declares
  the identical `tone?: "default" | "muted"` and forwards it straight through
  to `<SectionCard tone={tone}>` at line 73 — so the prop a closed archetype
  is supposed to fully key is actually owned one directory over, ungated.
- `src/components/layout/SurfaceFrame.tsx:29` — `overflow?: "hidden" | "auto"`.

## What to do

- [ ] Add `"src/components/layout/**"` as a second `include` root (array
      form, matching `archetype-numeric-union-prop`'s existing shape) to both
      `archetype-appearance-noun-prop` and `archetype-look-union-prop` in
      `_adherence.json`.
- [ ] Triage `SectionCard.tone` under hard rule 12's derived-vs-inherited
      test. `docs/archetypes/detail-overview.md:517-519` already states a
      candidate keying rule: "data sections use the default tone; reference
      panels use `tone="muted"`. The stat strip is flat. Three weights, fixed
      meaning." That sentence names two of `SectionCard.tone`'s two possible
      values (`default`, `muted`) keyed to section role — the third weight
      ("flat") describes the separate stat-strip component, not a third
      `tone` value, so confirm the contract text is read as fully
      enumerating `SectionCard.tone`'s actual two-member union before relying
      on it. If accepted as the key: add
      `src/components/layout/SectionCard.tsx` to both rules' `exclude`, and
      each rule's `message` must cite `detail-overview.md:517-519` verbatim,
      matching the citation style already used for `report`'s and
      `statement-with-filters`'s exclusion entries. If the contract sentence
      is judged too informal to count as an exhaustive keying rule, promote
      it into a proper Layer/decision-rule clause first (the
      `statement-with-filters` indent precedent in
      [adherence-lint-union-prop-blind-spot](../archive/adherence-lint-union-prop-blind-spot.md)),
      bump `detail-overview.md`'s frontmatter `version` (minor) and the
      matching `docs/archetypes/MANIFEST.json` entry (currently `"3.2"`),
      **then** exclude.
- [ ] Triage `SurfaceFrame.overflow` the same way. Its own JSDoc
      (`SurfaceFrame.tsx:22-27`) keys `"auto"` to "a frame that holds a
      horizontally-scrolling table with a sticky first column
      (matrix-grid)" — a code comment, not a contract. Before excluding,
      confirm which archetype contract should carry that keying rule (the
      only current caller is
      `src/components/archetypes/matrix-grid/MatrixGridShell.tsx`, per a
      grep of `overflow="` under `src/components/archetypes/`); if
      `matrix-grid`'s contract doc has no equivalent clause, add one there,
      bump its version, then exclude `SurfaceFrame.tsx` with a `message`
      citing the new clause.
- [ ] For any layout-layer prop the two rules newly surface that has no
      keying rule in any owning contract, delete the prop and fix its call
      sites and gallery demos — do not leave it un-triaged at `warn`.
- [ ] Cover the widened `include` in `scripts/lint-design.test.mjs`: a case
      asserting a file under `src/components/layout/` with an un-excluded
      appearance-noun or look-union prop is caught by both rules (mirrors the
      existing `include`/`exclude` coverage pattern in that file).

## Acceptance

- [ ] `node scripts/lint-design.mjs` exits 0 with 0 errors on a clean tree.
- [ ] Every surviving layout-layer noun/look-union prop is either deleted or
      named in an `exclude` entry whose `message` cites the contract
      file+line that derives it.
- [ ] Adding a fresh `variant?: "a" | "b"` or `density?: "compact" | "cozy"`
      prop to any non-excluded file under `src/components/layout/` makes
      `node scripts/lint-design.mjs` exit 1.
- [ ] `npx tsc --noEmit` and `npm test` pass.
- [ ] `scripts/lint-design.test.mjs` gains a case pinning the
      `src/components/layout/` root in scope for both
      `archetype-appearance-noun-prop` and `archetype-look-union-prop`.

## Related

- [adherence-lint-union-prop-blind-spot.md](../archive/adherence-lint-union-prop-blind-spot.md) — the drain-ticket precedent this ticket mirrors: same triage method (contract-keying test, promote-then-exclude, cite line in `message`), and the `include`-array shape this ticket copies for the two remaining rules.
- [entity-circle-size-prop-appearance-locality-gap.md](../archive/entity-circle-size-prop-appearance-locality-gap.md) — same rule family, another prop closed via a contract keying rule.
- [archetype-convergence-appearance-prop-lint.md](../archive/archetype-convergence-appearance-prop-lint.md) — shipped the original rules and `include`/`exclude` mechanism this ticket extends.
- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap; Phase 1 closes archetype-layer appearance props, of which this is the layout-directory blind spot.
- ADR-0004 (`docs/adr/0004-appearance-locality-derived-vs-inherited.md`) — the derived-vs-inherited test and its component-kind amendment this ticket's triage applies.
- RULES.md hard rule 12 — the enforcement mechanism (`_adherence.json`'s five appearance-prop rules at `error`).

## Open question

Is `detail-overview.md:517-519`'s existing prose ("data sections use the
default tone; reference panels use `tone="muted"`... Three weights, fixed
meaning") sufficiently exhaustive and explicit to count as `SectionCard.tone`'s
contract keying rule as-is, or does it need to be promoted into a formal
Layer/decision-rule clause (like the `statement-with-filters.indent`
precedent) before an `exclude` entry can cite it? Recommended: treat the
existing sentence as sufficient — it already states both values and their
triggering condition, and the "Three weights" line is describing a broader
visual system (including the separately-governed stat strip), not claiming a
third `tone` value exists. Promote only if reviewers judge the prose too
informal for the `message` citation.
