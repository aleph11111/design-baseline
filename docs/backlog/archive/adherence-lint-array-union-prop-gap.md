---
area: tooling
opened: '2026-09-07'
status: done
value: normal
model: opus
model_reason: >-
  the triage is a contract-keying judgment on an index-aligned styling array (is a per-cell
  emphasis vector a per-call-site appearance axis, or the same nested-leaf styling data the
  className rules' indent cap deliberately spares?) — design judgment, not pattern-following;
  mirrors adherence-lint-union-prop-blind-spot's model_reason
roadmap: archetype-convergence
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-09-07T00:00:00Z'
---

# An appearance union wrapped in `Array<…>` is matched by none of the six appearance-prop rules

## Context

`_adherence.json`'s appearance-prop family reaches a look union only when the
union sits **immediately** after the `:`. `archetype-look-union-prop`'s pattern
is `^\s*\w+\??:\s*"[^"]+"\s*\|\s*"[^"]+"` and `archetype-numeric-union-prop`'s is
the numeric equivalent; `archetype-alias-union-prop` matches
`\w+\??:\s*(?:{{unionAliases}})\b`, i.e. an alias NAME directly after the colon.
Wrap the same union in a container type and every one of them misses it, because
the character after the `:` is now `A`/`r`/`(`, not a quote, digit, or harvested
alias name.

One live instance: `src/components/archetypes/shared/FigureTable.tsx:131`
declares

```ts
emphasis?: Array<Readonly<"default" | "strong">>;
```

on `FigureRowProps`, JSDoc'd as "Per-cell emphasis (index-aligned with `cells`):
`"strong"` renders `font-semibold text-foreground` — the totals-row treatment."
That is a vector of the same two-member look union `archetype-look-union-prop`
exists to catch, on a `shared/` primitive that no closed-folder `exclude`
covers, and `node scripts/lint-design.mjs` reports 0 errors on it today —
confirmed on the tree at `feat/adherence-lint-boolean-classvalue-gap`. The
sibling field `cellAlign?: readonly ("left" | "center" | "right")[]` two lines
down is the same shape in the postfix-array spelling, and equally unreached.

This is the fourth shape of the same RULES.md hard rule 12 defect to be found
outside the rule family's reach, after inline-numeric and aliased unions
(`adherence-lint-union-prop-blind-spot`), boolean flags and non-`string`
`className` (`adherence-lint-boolean-classvalue-gap`). The container spelling is
not exotic — `Array<T>`, `readonly T[]`, `T[]` and `ReadonlyArray<T>` all appear
in this tree — so a rule that pins the union to the first position after the
colon will keep leaking as primitives grow per-item styling vectors.

Whether the live instance is a *defect* is a separate question the drain has to
answer, and there is real evidence for "legal": the one call site,
`src/components/archetypes/statement-with-filters/StatementTable.tsx:142`, passes
`emphasis={cells.map(() => "strong" as const)}` for the summary line only — the
value is derived from the row's kind, which is the shape ADR-0004's test asks
for. It may also be the same nested styling-data category the shell-`className`
rules' `indent ≤2` cap deliberately spares (the matrix-grid per-cell `cellStyle`
precedent, cited in `archetype-shell-class-name`'s `message`). Either way the
gate currently has no opinion, which is the defect.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Before editing, grep `src/components/archetypes/**` and
      `src/components/layout/**` for a literal or aliased union wrapped in any
      container spelling — `Array<`, `ReadonlyArray<`, `readonly (`, a trailing
      `[]`, and a `Readonly<` wrapper around any of them. The two fields this
      report names are what one pass found, not a guaranteed-complete set.
- [ ] Widen the union rules rather than adding a fifth parallel rule: allow an
      optional container prefix between the `:` and the union in
      `archetype-look-union-prop`, `archetype-numeric-union-prop` and
      `archetype-alias-union-prop`, so one rule owns one union KIND across every
      spelling and a hit is still reported once under one message (the
      double-ownership discipline `archetype-alias-union-prop`'s negative
      lookahead documents). Keep the leading `^\s*`/indent scoping each rule
      already carries.
- [ ] Triage every hit the widening produces the way the earlier drain tickets
      did: delete the prop and fix call sites/demos when no contract keying rule
      derives it, or add a path `exclude` whose `message` quotes the contract line
      that does. For `FigureRow.emphasis`, resolve it against
      `docs/archetypes/statement-with-filters.md`'s summary-row rule — the same
      contract line whose keying already exempts that archetype's `indent` in
      `archetype-numeric-union-prop`'s `message` — and state explicitly whether an
      index-aligned per-cell vector counts as shell appearance or as the nested
      styling-data category the `className` rules spare, so the next reader is not
      re-deriving it.
- [ ] Cover the shape in `scripts/lint-design.test.mjs`: a fixture asserting the
      widened rules match `Array<Readonly<"a" | "b">>`, `readonly ("a" | "b")[]`
      and `("a" | "b")[]`, that the bare inline union still matches exactly once
      (no double report from the widening), and that a container of a
      non-appearance type (`React.ReactNode[]`, `string[]`) is not matched.

## Acceptance

- Adding `tone?: Array<"default" | "muted">` (or the `readonly (…)[]` spelling)
  to any archetype shell makes `node scripts/lint-design.mjs` exit 1.
- Every container spelling of an appearance union found by the What-to-do grep is
  reported by exactly one rule — no other union-shaped prop under
  `src/components/archetypes/**` or `src/components/layout/**` is left unowned,
  and no existing inline-union hit is reported twice after the widening.
- `FigureRow.emphasis` and `FigureRow.cellAlign` are each either deleted or
  covered by an `exclude` whose `message` quotes the contract line deriving them.
- `node scripts/lint-design.mjs` exits 0 with 0 errors on a clean tree,
  `npx tsc --noEmit` is clean, and `npm test` passes.
- `scripts/lint-design.test.mjs` covers all three container spellings plus a
  non-appearance container that must not match.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap
- [adherence-lint-boolean-classvalue-gap.md](adherence-lint-boolean-classvalue-gap.md) — the session that surfaced this shape
- [adherence-lint-union-prop-blind-spot.md](../archive/adherence-lint-union-prop-blind-spot.md) — the numeric/aliased-union gap in the same rules
- [adherence-lint-multiline-union-alias-gap.md](../archive/adherence-lint-multiline-union-alias-gap.md) — a prior spelling gap in the same union family
- [refactor-figure-table-grid-report-statement.md](../archive/refactor-figure-table-grid-report-statement.md) — how `FigureTable` became the shared primitive these props live on
- ADR-0004 — `docs/adr/0004-appearance-locality-derived-vs-inherited.md`
