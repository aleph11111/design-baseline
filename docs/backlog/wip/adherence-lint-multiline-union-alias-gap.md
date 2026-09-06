---
area: archetypes
opened: '2026-09-06'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what-to-do
    - acceptance
    - related
  failed: []
  graded_at: '2026-09-06T00:00:00Z'
value: normal
model: sonnet
model_reason: >-
  the mechanism is fully specified (a one-line lookahead in an existing function) and the
  single triage exclude has an established precedent and a located contract clause — no
  design fork left open
roadmap: archetype-convergence
---

# Harvest union type aliases split across lines in the adherence lint

## Context

`harvestUnionAliases` in `scripts/lint-design.mjs` — the per-file pre-pass added by
[adherence-lint-union-prop-blind-spot](../archive/adherence-lint-union-prop-blind-spot.md) that
arms `_adherence.json`'s `archetype-alias-union-prop` rule — is line-level: it harvests
`type X = "a" | "b"` only when the alias name, its first member, and the following `|` all
sit on **one** line. A union alias written across several lines is invisible to it.

One such alias exists in the tree today:
`src/components/archetypes/raw-input/native-field.tsx:33` declares
`export type NativeFieldType =` followed by nine `| "…"` continuation lines, so
`archetype-alias-union-prop` reads clean over that file. There is no live RULES.md hard
rule 12 defect hiding behind it — its only consumer, `type?: NativeFieldType` at
`native-field.tsx:56`, selects the **native input type** (the field's data kind and its
platform keyboarding, `raw-input.md:39` and L4:77–78), not a look — which is why the
originating ticket deliberately left the shape out of scope and documented the ceiling
instead. But the hole is real: an appearance union alias that prettier happens to wrap
onto multiple lines would slip the drain rule entirely, which is exactly the blind-spot
class that ticket existed to close.

The fix stays inside ADR-0003 (zero-dep regex scanner, no TS parser): a one-line
lookahead, not cross-line state.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the
      shared point, not only the call site this report names.
- [ ] In `harvestUnionAliases` (`scripts/lint-design.mjs`), when a line matches
      `^\s*(?:export\s+)?type\s+(\w+)\s*=\s*$`, test the **next** line against
      `^\s*\|\s*("[^"]*"|'[^']*'|[0-9]+)` and harvest the name when it matches. Keep the
      existing single-line branch unchanged; both branches feed the same name set.
- [ ] Re-run `node scripts/lint-design.mjs` and triage everything the widened harvest newly
      lights up under `src/components/archetypes/**` and `src/components/layout/**`.
- [ ] Add `src/components/archetypes/raw-input/**` to `archetype-alias-union-prop`'s
      `exclude`, with the rule's `message` naming the raw-input contract clause that makes
      `type?: NativeFieldType` a semantic field-kind choice rather than an appearance axis
      (`raw-input.md:39` — the enumerated native types the field renders; L4:77–78 — each
      type keeps its native platform keyboarding), matching the citation form the rule's
      existing `overline-typed` exclusion already uses.
- [ ] Update the ceiling comment in `harvestUnionAliases` and replace the test
      `"does not follow a union split across lines — the scanner is line-level, not a parser"`
      in `scripts/lint-design-core.test.mjs` with one asserting the multi-line alias IS
      harvested; keep a test pinning whatever ceiling remains (an alias whose first member
      sits two or more lines below the `=`).

## Acceptance

- [ ] `harvestUnionAliases` returns `["NativeFieldType"]` for the `native-field.tsx` alias
      text, and no other union alias under `src/components/archetypes/**` or
      `src/components/layout/**` goes unharvested — verified by re-running the survey grep
      `grep -rn -A1 -E '^\s*(export\s+)?type\s+\w+\s*=\s*$'` over both roots and matching
      every hit against the scanner's `--json` output.
- [ ] `node scripts/lint-design.mjs` exits 0, and its `archetype-alias-union-prop` hits are
      unchanged from before the widening (`EntityAvatar.tsx:14`) — `native-field.tsx` is
      excluded, not newly flagged.
- [ ] `_adherence.json` stays valid JSON and every `exclude` entry added carries its contract
      citation in the rule's `message`.
- [ ] `scripts/lint-design-core.test.mjs` and `scripts/lint-design.test.mjs` pass;
      `npx tsc --noEmit` and `npm test` pass.

## Related

- [adherence-lint-union-prop-blind-spot.md](../archive/adherence-lint-union-prop-blind-spot.md) — added `harvestUnionAliases` and `archetype-alias-union-prop`; this ticket lifts the line-level ceiling it documented.
- [archetype-convergence-appearance-prop-lint.md](../archive/archetype-convergence-appearance-prop-lint.md) — the original appearance-prop drain rule and its `include`/`exclude` scoping mechanism.
- [report-calendar-appearance-prop-lint.md](../archive/report-calendar-appearance-prop-lint.md) — the exclude-with-contract-citation pattern the raw-input triage follows.
- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap; Phase 1's mechanical archetype sweep is what the scanner's coverage gates.
- ADR-0003 — adherence lint ships as a zero-dep scanner; the lookahead stays inside that constraint.
- ADR-0004 — appearance locality: derived vs inherited, the rule the drain enforces.
