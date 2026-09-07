---
area: tooling
opened: '2026-09-07'
status: ready
value: high
model: opus
model_reason: >-
  widening the walk newly exposes every `.ts` file to all nine rules at once, so the work is a
  drain pass plus a hook-output-vs-prop distinction (are `isCreate`/`showPrimary` in a hook's
  RESULT interface per-call-site appearance props at all?) — contract-keying judgment, not a glob
  edit; mirrors adherence-lint-union-prop-blind-spot's model_reason
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

# The adherence scanner walks only `.tsx`, so every `.ts` prop declaration escapes all six error rules

## Context

`scripts/lint-design.mjs` builds its file list with
`globSync('**/*.tsx', { cwd: join(root, t) })` (the `files` block in `main()`,
one `globSync` per configured target), and `_adherence.json`'s `targets` is
`["src"]`. Two whole regions of the tree are therefore invisible to **every**
rule, including the six `severity: error` appearance-prop rules RULES.md hard
rule 12 names as the enforcement surface:

- **every `.ts` file**, anywhere under `src/`;
- **the whole `gallery/` tree**, which is outside `targets` entirely.

That is the same failure mode `includeReachableUnder` was added to prevent — a
rule that "would be skipped without firing, reading as a clean scan"
(`scripts/lint-design.mjs`, `CompileError` diagnostic) — except one level up: the
compile-time guard proves each rule's `include` is reachable under `targets`,
and then the walk silently narrows what `targets` actually yields. A rule can be
provably reachable and still never see a live defect.

Both halves cost real misses in the `adherence-lint-boolean-classvalue-gap`
session (2026-09-07):

- `src/components/archetypes/shared/tableColumn.ts:36` declares
  `identifierMono?: boolean` — a live boolean appearance flag that the new
  `archetype-appearance-boolean-prop` rule's vocabulary explicitly matches (its
  `\w*[Mm]ono\w*` alternative exists *for this prop*). The rule can never reach
  it, so the ticket that introduced the rule could not drain its own named
  target and had to declare it out of scope.
- Two `<MetricRow … emphasis accent />` call sites in `gallery/layout-demos.tsx`
  survived the deletion of `MetricRow.accent` and were caught only by
  `npx tsc --noEmit`. The lint reported 0 errors over a tree that still
  referenced a deleted appearance prop.

The widening is not a one-line glob edit, because `.ts` files in this repo hold
a shape the appearance rules have never had to distinguish: a hook's **result**
interface. `src/components/archetypes/crud-dialog/useCrudDialogController.ts`
declares `isCreate`, `showPrimary`, `readOnly` and
`src/components/archetypes/form-page/useFormPageState.ts` declares `isDirty`,
`isSubmitting` as non-optional fields of what the hook RETURNS — derived values,
not per-call-site props anyone passes. Several appearance rules match
`\w+\??:` (the `?` optional), so they would report a hook's own output as an
ungoverned appearance prop.

## What to do

- [x] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [x] Widen the walk in `scripts/lint-design.mjs`'s `main()` from `'**/*.tsx'`
      to a `.ts`-inclusive pattern (`'**/*.{ts,tsx}'`, which `globSync`
      brace-expands), keeping the existing
      `exclude: ['**/node_modules/**', '**/.*/**']`.
- [x] Run the full drain the widening produces BEFORE landing it, the way
      `adherence-lint-union-prop-blind-spot` and
      `adherence-lint-alias-rule-size-noun-gap` did:
      `node scripts/lint-design.mjs --json` on the widened walk, then per hit
      either delete the prop or add a path `exclude` whose `message` quotes the
      contract line that derives it. The `.ts` files carrying appearance-shaped
      declarations today are `shared/tableColumn.ts`,
      `crud-dialog/useCrudDialogController.ts`, `crud-dialog/useCrudDialogMode.ts`,
      `form-page/useFormPageState.ts`, `shared/resolveListState.ts` — re-run the
      scan rather than trusting that list.
- [x] Decide the hook-result question once, at the pattern level, not per file:
      a field of a hook's RETURN type is derived by construction (the hook
      computes it), so it is not a per-call-site appearance prop under ADR-0004
      at all. Require a literal `\?` in the appearance rules that currently
      accept `\??` (`archetype-appearance-noun-prop`, `archetype-look-union-prop`,
      `archetype-numeric-union-prop`, `archetype-alias-union-prop`) so a
      non-optional derived field is out of scope by shape — the same
      keep-it-out-at-the-pattern-level discipline
      `archetype-appearance-boolean-prop` already uses for capability booleans.
      That rule already requires `\?`; leave it as is.
- [x] Leave `gallery/` OUT of `_adherence.json`'s `targets`, and cover it the way
      `tsc` already does: `gallery/` is donor-dev demo-hosting code that never
      ships to a consumer (`npm run gallery:build` emits `gallery-dist/`, the
      surface the dashboard hub iframes), so consumer-facing adherence is not
      what it measures — and adding it would put the six error rules on a tree
      full of deliberate raw-HTML demo markup. The stale-call-site class it hid
      is already caught by `npx tsc --noEmit`, the donor's own verification
      command; record that division in `_adherence.NOTES.md` so the next reader
      does not re-litigate it.
- [x] Extend `scripts/lint-design.test.mjs` with a fixture asserting a `.ts`
      file is walked (an appearance-shaped prop in a `.ts` file is reported) and
      that a non-optional field in one is not.

## Acceptance

- `node scripts/lint-design.mjs --json` reports a larger `summary.files` than the
  current walk, and its `ruleScopes` show the appearance rules matching `.ts` files.
- A vocabulary-matching appearance prop added to any `.ts` file under
  `src/components/archetypes/**` or `src/components/layout/**` makes
  `node scripts/lint-design.mjs` exit 1; no other appearance-shaped prop in any
  `.ts` file under `src/components/**` is left ungated once the drain is done.
- `identifierMono?: boolean` in `src/components/archetypes/shared/tableColumn.ts`
  is either deleted or covered by an `exclude` whose `message` quotes a contract
  keying rule — it no longer sits reachable-by-vocabulary but unreachable-by-walk.
- A non-optional field of a hook result type (`isCreate` in
  `useCrudDialogController.ts`) is no longer reported by any appearance rule.
- `node scripts/lint-design.mjs` exits 0 with 0 errors on the widened walk,
  `npx tsc --noEmit` is clean, and `npm test` passes.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap
- [adherence-lint-boolean-classvalue-gap.md](adherence-lint-boolean-classvalue-gap.md) — the session that hit both halves of this gap
- [adherence-lint-union-prop-blind-spot.md](../archive/adherence-lint-union-prop-blind-spot.md) — prior gap-drain precedent
- [lint-design-include-reachability-guard.md](../archive/lint-design-include-reachability-guard.md) — the compile-time guard against a silently-disarmed rule; this is the same failure one level up, at the walk
- ADR-0003 — `docs/adr/0003-adherence-lint-zero-dep-scanner.md`
- ADR-0004 — `docs/adr/0004-appearance-locality-derived-vs-inherited.md`
