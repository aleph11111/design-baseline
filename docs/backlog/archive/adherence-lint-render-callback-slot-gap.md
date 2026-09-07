---
area: tooling
opened: '2026-09-07'
status: done
value: normal
model: opus
model_reason: >-
  choosing a regex shape for a *function-typed* prop (`render*?: (…)=>ReactNode`)
  while separating *appearance* render-callbacks from *structural* ones (Sidebar /
  SectionNav `renderLink`, PageHeader `renderBackLink` — router / navigation
  adapters, not appearance) is a judgment the ADR-0003 zero-dep scanner cannot
  auto-derive; mirrors adherence-lint-boolean-classvalue-gap's model_reason
roadmap: archetype-convergence
gate:
  score: 4
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed:
    - open_question: the render-callback pattern and the appearance-vs-structural
      boundary are a real design fork, not an asserted bullet
  graded_at: '2026-09-07T00:00:00Z'
---

# Widen adherence lint to the render-callback appearance prop the other five rules miss

## Context

`_adherence.json`'s appearance-prop rules (RULES.md hard rule 12) match exactly these
prop shapes: an appearance-noun name followed by `:` (`archetype-appearance-noun-prop`),
an inline literal union (`archetype-look-union-prop` / `archetype-numeric-union-prop`),
a same-file union type alias (`archetype-alias-union-prop`), a boolean look flag
(`archetype-appearance-boolean-prop`), `className?` on shells
(`archetype-shell-class-name`), and an **optional** `header?`/`stats?` `ReactNode`
slot (`archetype-appearance-slot`). A **render-callback** prop — a function-typed
prop returning `ReactNode`, e.g. `GroupedListSection`'s
`renderHeader?: (args: { title, description, rowCount }) => React.ReactNode` — is none of
these, so it escapes every rule. Whatever the caller returns becomes the component's
look, and no contract line derives it: the same unenumerable escape hatch the sibling
rules ban, wearing a function signature.

**This ships as a forward guard, not a drain.** The ticket was filed expecting a triage
pass over live violations; by the time it was worked there were none. The concrete
instance that motivated it — `GroupedListSection.renderHeader` — was already deleted by
[adherence-lint-appearance-slot-layout-gap](../archive/adherence-lint-appearance-slot-layout-gap.md),
and no other appearance render-callback exists in the tree. Guarding a class with zero
live hits is the established posture here, not an anomaly: `archetype-shell-class-name`
already carries its `src/components/layout/**` shell globs with no layout shell declaring
`className`, "so the class stays closed when one grows". The deleted `renderHeader` is the
proof the shape is reachable.

The appearance-vs-structural line was the real design fork, and the live hit set is
larger than this report originally named. A full grep of function-typed `ReactNode`-returning
props under both roots finds five, all structural:

| Prop | Site | Role |
| --- | --- | --- |
| `renderLink` (**required**) | `src/components/layout/Sidebar.tsx:65`, `:117`; `src/components/layout/SectionNav.tsx:30` | router link-adaptor |
| `renderBackLink?` | `src/components/layout/PageHeader.tsx:55`; `src/components/archetypes/form-page/FormPageHeader.tsx:39` | router back-link adapter |
| `renderCell?` | `src/components/archetypes/matrix-grid/MatrixGridShell.tsx:53` | contract-keyed cell-content channel |

(`src/components/archetypes/shared/tableColumn.ts:14`'s `cell: (row) => React.ReactNode` is
a required column-config data renderer — same class as `renderLink`, out at the pattern.)

## What to do

- [x] Grepped every function-typed `ReactNode`-returning prop under `src/components/archetypes/**`
      and `src/components/layout/**` rather than trusting the one instance this report named —
      which surfaced two the report missed: `FormPageHeader.renderBackLink?` (a second copy of the
      structural back-link adapter, present since the initial import) and `MatrixGridShell.renderCell?`
      (the only genuine judgment call in the set). Re-ran after the rule landed; the hit set is exactly
      what the pattern owns.
- [x] Fixed the appearance-vs-structural boundary at the pattern level, using the config's own two
      mechanisms rather than a row of one-off excludes. **Optional-only** (`render…?`) drops all three
      required `renderLink` declarations for free — the same carve-out `archetype-appearance-slot`
      makes for `AppShell`'s required `header` ("a slot the consumer must fill is structure"). A
      **negative lookahead** on `renderBackLink` keeps the one *optional* structural callback out by
      name, at both its sites, the way `archetype-alias-union-prop`'s lookahead keeps the noun rule's
      owned set out of double-ownership.
- [x] Added `archetype-render-callback-prop` to `_adherence.json`, `include` scoped to both
      `src/components/archetypes/**` and `src/components/layout/**` (the shared chrome the shells
      compose lives outside the archetype root — the same widen as the sibling rules).
- [x] Triaged the one remaining hit by the drain tickets' method: `MatrixGridShell.renderCell?` is
      **promote-then-exclude**, not delete. It is contract-keyed three ways — `matrix-grid.md:154`
      types it as the filled-cell content channel carrying `{ row, column, cell, isFilled }`;
      `matrix-grid.md:165` names the cell-variant axis "composition via `renderCell` / `cellStyle` —
      not props", making it the sanctioned *alternative* to an appearance prop; `matrix-grid.md:321`
      hands the consumer the whole body ("The shell does not constrain"). Its value is derived per
      cell from `ctx`, so ADR-0004's derived-not-inherited test passes. Exact-path `exclude`, contract
      lines cited in `message`.
- [x] Covered both directions in `scripts/lint-design.test.mjs` (4 cases): the flagged appearance
      shape across both include roots, every live structural callback staying green, the matrix-grid
      path exclude engaging without un-gating a sibling file, and the indent cap / non-`ReactNode`
      return staying out.

## Acceptance

- [x] `node scripts/lint-design.mjs` exits 0 with 0 errors on a clean tree — `226 file(s) scanned,
      59 warning(s), 0 error(s)`, exit 0.
- [x] Adding a fresh appearance render-callback under the widened roots makes the lint exit 1 —
      verified live by injecting `renderStats?: (ctx: Ctx) => React.ReactNode` into
      `src/components/layout/SectionCard.tsx` (the shared-chrome second root): `1 error(s)`, exit 1.
      Reverted.
- [x] No structural render callback is named: `Sidebar` / `SectionNav` `renderLink`, `PageHeader`
      and `FormPageHeader` `renderBackLink` all stay green on the clean-tree run above.
- [x] No render-callback appearance prop was deleted, so no call site or `src/examples/` demo needed
      updating — the motivating instance was already removed upstream. **No `src/` change in this
      branch**; the diff is the rule, its tests, and this ticket.
- [x] `scripts/lint-design.test.mjs` covers the appearance shape plus the structural callbacks the
      rule must not flag. Both separation mechanisms are **mutation-tested**: deleting the
      `renderBackLink` lookahead fails a test, and relaxing the `\?` optional-marker fails a test —
      so neither can be "simplified" away silently.
- [x] `npx tsc --noEmit` exits 0 and `npm test` passes — 55 files, 387 tests (59 in
      `lint-design.test.mjs`, up from 55).

## Related

- [archive/adherence-lint-boolean-classvalue-gap.md](../archive/adherence-lint-boolean-classvalue-gap.md) — the sibling "prop-shape blind spot" ticket this was filed alongside (boolean / `className?: ClassValue`); landed in #214 as `archetype-appearance-boolean-prop`, which is why that rule now appears in the family list above.
- [archive/adherence-lint-appearance-slot-layout-gap.md](../archive/adherence-lint-appearance-slot-layout-gap.md) — deleted the concrete `GroupedListSection.renderHeader` instance (which is why this ticket found nothing to drain) and set the layout-layer widen this rule shares.
- [archive/adherence-lint-union-prop-blind-spot.md](../archive/adherence-lint-union-prop-blind-spot.md) — the drain-ticket precedent for the triage method (delete-unkeyed / promote-then-exclude, cite the line in `message`).
- [archive/report-calendar-appearance-prop-lint.md](../archive/report-calendar-appearance-prop-lint.md) — promote-contract-prose-then-exclude precedent, the shape `renderCell`'s exclude follows.
- ADR-0004 (`docs/adr/0004-appearance-locality-derived-vs-inherited.md`) — the derived-vs-inherited test each render-callback prop was graded against.
- ADR-0003 — the zero-dep single-line scanner whose limits set this rule's documented ceilings.
- RULES.md hard rule 12 — the enforcement mechanism this rule belongs to.
- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap.

## Open question — resolved

Filed with two readings: (a) a **name allowlist** of `ReactNode`-returning render-callback
props with an explicit structural allow-out for router / navigation adapters, or (b) a
**narrower heuristic** scoped to appearance-context render props only.

**Answered (a)**, with a refinement the ticket did not have. (b) fails *silently*: with zero
live appearance hits, any enumeration of appearance render-callback names is a guess about a
prop that does not exist yet, and a wrong guess produces no error, ever. (a) fails *loudly* —
a new callback over-flags and gets triaged. The counter-argument (the boolean rule deliberately
chose an allowlist) does not transfer: capability booleans are open-ended and growing
(`isLoading`, `sortable`, `canDelete`, `showDestructive`…), whereas render props are inherently
few — three names in the whole tree, each contract-documented — so the structural set is cheap
to enumerate.

The refinement: the two structural cases are separated by *different* mechanisms, matching this
config's existing discipline rather than flattening both into the lookahead. `renderLink` needs
no name at all (required ⇒ out at the pattern), `renderBackLink` is structural **by role** so it
is a pattern-level lookahead, and `renderCell` is **contract-keyed** so it is a path exclude
citing the contract lines — the same split `archetype-alias-union-prop` draws between its
lookahead (owned names) and its raw-input exclude (contract-derived instance).

Ceilings accepted deliberately and recorded in the rule's `message` instead of grown into the
regex: the prefix scope is `render[A-Z]…` only (a `*Render` / `on*Render` spelling is unguarded —
zero instances); a **required** appearance render-callback is out of scope (the same ceiling
`archetype-appearance-slot` accepts and documents); a declaration wrapped across lines is not
seen (ADR-0003, single-line scanner); and a path `exclude` un-gates the whole file, which is
`adherence-lint-closed-folder-allowlist-gap`'s problem, not a second mechanism invented here.
