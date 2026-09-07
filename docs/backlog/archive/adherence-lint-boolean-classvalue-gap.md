---
area: tooling
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
    - open_question: capped at 4 — vocabulary list and hide*/show* ownership left open for operator confirmation
  graded_at: '2026-09-07T00:00:00Z'
value: normal
model: opus
model_reason: >-
  a boolean-flag vocabulary and a per-prop delete-vs-key triage across seven named call sites is
  design judgment, not pattern-following (mirrors adherence-lint-union-prop-blind-spot's
  model_reason)
roadmap: archetype-convergence
---

# Adherence lint's four appearance-prop rules miss boolean flags and non-string `className`

## Context

`_adherence.json`'s four appearance-prop rules (`archetype-appearance-noun-prop`,
`archetype-look-union-prop`, `archetype-numeric-union-prop`,
`archetype-alias-union-prop` — RULES.md hard rule 12) match only three prop
shapes: a name from the appearance-noun list followed by `:`, an inline
quoted/numeric literal union, and a same-file union type alias — plus a
fifth rule, `archetype-shell-class-name` (and its per-archetype
`*-shell-class-name` siblings), which matches `className?: string` on
`*Shell.tsx`/`*Sheet.tsx`. Two prop shapes escape every one of these and are
already live in the tree:

**Boolean appearance flags.** A `boolean` prop is never matched unless its
name happens to already be in the noun list (`framed`, `bordered`,
`compact`, `padded` are boolean-shaped names already there — evidence
booleans were meant to be in scope, not a new class). Ungated look booleans
today: `src/components/layout/MetricList.tsx:45` `accent?: boolean`
("Tint the value with `--primary` (the brand). Use for the profit/ARR
line." — naked discretion, no keying rule, backwards-compatible off
default: disqualifying under RULES.md hard rule 12), `MetricList.tsx:43`
`emphasis?: boolean`, `src/components/archetypes/raw-textarea/TextareaField.tsx:39`
`mono?: boolean`, `src/components/archetypes/shared/tableColumn.ts:36`
`identifierMono?: boolean`, `src/components/archetypes/grouped-list/GroupedListSection.tsx:37`
`hideCount?: boolean`, `src/components/archetypes/form-page/FormPageActions.tsx:78`
`stickyOnMobile?: boolean`, `src/components/archetypes/skeleton-loader/ListSkeleton.tsx:11,13`
`showHeader?`/`avatar?`.

**`className` typed as something other than `string`.** The shell-className
rules pattern on `className\?\s*:\s*string`, so `className?: ClassValue`
walks the gate untouched — `src/components/layout/SurfaceFrame.tsx:40`
already uses that exact typing, so the shape is idiomatic in this repo and a
shell adopting it would silently reopen the deleted escape hatch.

## What to do

- [ ] Before editing, grep every prop declaration under
      `src/components/archetypes/**` and `src/components/layout/**` for a
      bare `boolean` type and for `className?:` typed against anything other
      than `string` — the seven call sites this report names are what one
      pass found, not a guaranteed-complete set; re-run after the rule
      changes to confirm nothing new is silently in scope.
- [ ] Add a boolean-appearance-flag rule to `_adherence.json`, `include`
      scoped to both `src/components/archetypes/**` and
      `src/components/layout/**` (the second root is required because
      `MetricList.tsx` lives under `src/components/layout/`, outside every
      existing appearance-prop rule's `include`), pattern matching
      `^\s{0,4}<name>\??\s*:\s*boolean` over an appearance-flag vocabulary
      mirroring how the noun list (`archetype-appearance-noun-prop`) was
      chosen: accent, emphasis, mono, flush, framed, bordered, compact,
      padded, muted, filled, elevated, tinted, sticky*, plus the
      `hide*`/`show*` look toggles named above (`hideCount`, `showHeader`).
      Behaviour/capability booleans (`isLoading`, `bulkSelectable`,
      `sortable`, `unread`, `chrome`) are not appearance and must stay out of
      the vocabulary — never excluded one by one, kept out at the pattern
      level, the way `archetype-alias-union-prop`'s lookahead keeps the noun
      rule's owned set out of double-ownership.
- [ ] Widen the className patterns in `archetype-shell-class-name` and every
      per-archetype `*-shell-class-name` rule from `\s*string` to bare
      `className\?\s*:` at the same indent ≤ 2 top-level scoping the existing
      rule's `message` documents, so the matrix-grid per-cell
      `cellStyle.className` styling-data field (a nested leaf, not a shell
      prop) stays unflagged.
- [ ] Triage every hit the boolean rule produces the way the earlier drain
      tickets (`adherence-lint-union-prop-blind-spot`,
      `adherence-lint-alias-rule-size-noun-gap`) did: delete the prop and fix
      call sites/demos when no contract keying rule derives it (`accent` on
      `MetricList` is the clear case — no keying rule in any contract derives
      it, and the JSDoc states discretionary use), or add a path `exclude`
      whose `message` quotes the contract line that does derive it.
- [ ] Cover both new shapes in `scripts/lint-design.test.mjs`: the boolean
      rule matching a vocabulary name and not matching a non-appearance
      boolean (`isLoading`), and the widened className pattern matching
      `className?: ClassValue` and not matching a nested `cellStyle.className`.

## Acceptance

- `node scripts/lint-design.mjs` exits 0 with 0 errors on a clean tree.
- Adding `accent?: boolean` or `className?: ClassValue` to any archetype
  shell makes `node scripts/lint-design.mjs` exit 1.
- Every deleted prop's call sites and `src/examples/` demos are updated to
  match — no other call site of the deleted prop, and no similar
  boolean-appearance prop elsewhere in the same file, is left referencing it.
- `npx tsc --noEmit` and `npm test` pass.
- `scripts/lint-design.test.mjs` covers both new shapes plus the
  non-appearance boolean (`isLoading`) the boolean rule must not flag.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap
- [adherence-lint-alias-rule-size-noun-gap.md](../archive/adherence-lint-alias-rule-size-noun-gap.md) — prior gap in the same rule family
- [adherence-lint-union-prop-blind-spot.md](../archive/adherence-lint-union-prop-blind-spot.md) — prior gap-drain precedent (numeric/aliased unions)
- [archetype-shell-classname-drop.md](../archive/archetype-shell-classname-drop.md) — original className escape-hatch removal
- ADR-0004 — `docs/adr/0004-appearance-locality-derived-vs-inherited.md`

## Open question

The boolean-flag vocabulary and the `hide*`/`show*` ownership boundary were
asserted above (accent, emphasis, mono, flush, framed, bordered, compact,
padded, muted, filled, elevated, tinted, sticky*, hide*/show*) rather than
asked, since the thought itself specified them — but the vocabulary is a
real design choice (too narrow misses a live prop, too broad sweeps in a
future capability boolean) and should be confirmed before `/feat`:
recommended default is the list above as drafted; the alternative is a
narrower list limited to the seven named call sites' exact names with no
wildcard, which is safer but stops catching new boolean flags introduced
later under a different name from the same appearance concept.
