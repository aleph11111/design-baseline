---
area: archetypes
opened: '2026-09-07'
status: ready
value: normal
model: opus
model_reason: >-
  the triage is a contract-keying judgment (does any contract key a section-level
  custom-header slot?) followed by a cross-file prop deletion through a
  render-callback indirection — design judgment, not pattern-following; mirrors
  adherence-lint-layout-scope-gap's model_reason
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

# `archetype-appearance-slot` never scopes to `src/components/layout/`

## Context

`_adherence.json`'s `archetype-appearance-slot` rule (pattern
`^\s*(header|stats)\?\s*:\s*(React\.)?ReactNode`, `severity: error`) carries
`include: "src/components/archetypes/**"` only, so the shared chrome layer
`src/components/layout/**` is invisible to it. It is the last of the four
archetype-layer appearance rules with that gap:
[adherence-lint-layout-scope-gap](../adherence-lint-layout-scope-gap.md) widened
`archetype-appearance-noun-prop`, `archetype-look-union-prop` and
`archetype-shell-class-name` to carry `src/components/layout/**` as a second
`include` root, and deliberately left this one out — closing it is a
cross-file refactor, not a config edit, so it was split here.

Widening it surfaces exactly one new error, confirmed by running the widened
rule against the current tree via `ADHERENCE_CONFIG`:
`src/components/layout/SectionCard.tsx:31` — `header?: React.ReactNode`,
documented in its own JSDoc as a "Raw header override … replaces the default
`<SectionHeading>` inside the title bar entirely". That is the same
unenumerable escape hatch `detail-overview-appearance-slot` exists to ban one
directory over. Live call sites of the slot:
`src/components/archetypes/grouped-list/GroupedListSection.tsx:95` (forwards
its own `renderHeader` callback prop into it),
`src/examples/DemoNextApp.tsx:60`, `src/examples/DemoViteApp.tsx:58`, and
`src/components/layout/SectionCard.test.tsx:45,144,158`.

`GroupedListSection`'s `renderHeader` is worth noting in the same pass: a
**render-callback** prop escapes every current appearance rule's pattern (it
is neither `header?: ReactNode`, nor an appearance-noun name, nor a literal
union), so the escape hatch survives one level up even if the slot below it
closes — a prop-shape blind spot adjacent to
[adherence-lint-boolean-classvalue-gap](../adherence-lint-boolean-classvalue-gap.md)'s
family.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add `"src/components/layout/**"` as a second `include` root to
      `archetype-appearance-slot` in `_adherence.json` (array form, matching
      the three siblings widened in
      [adherence-lint-layout-scope-gap](../adherence-lint-layout-scope-gap.md)).
- [ ] Read `docs/archetypes/grouped-list.md` — the only contract with a live
      caller — and determine whether it keys a section-level custom-header
      slot to anything derived (ADR-0004's derived-vs-inherited test, RULES.md
      hard rule 12). Layer 2's Forbidden list already bans "hand-rolled header
      markup" at page level, which is evidence against a keying rule existing.
- [ ] If no contract keys it: delete `SectionCard.header`, and rework the
      three live call paths — `GroupedListSection`'s `renderHeader`
      indirection, `DemoNextApp.tsx:60`, `DemoViteApp.tsx:58` — plus the three
      `SectionCard.test.tsx` cases, onto the `title`/`description`/`actions`
      props the bar already owns.
- [ ] If a contract does key it: exclude `src/components/layout/SectionCard.tsx`
      by **exact file path** (never a `**` folder glob — the layout dir is one
      flat folder of unrelated primitives, so a folder glob disarms the whole
      root) with a `message` citing the contract file+line, matching the
      citation style the other three rules' messages already use.
- [ ] Decide whether `renderHeader`-shaped render-callback props get their own
      rule or fold into
      [adherence-lint-boolean-classvalue-gap](../adherence-lint-boolean-classvalue-gap.md);
      file the follow-up there rather than widening this ticket.
- [ ] Cover the widened root in `scripts/lint-design.test.mjs`, mirroring the
      "array-form include (the shared-chrome second root)" cases the sibling
      ticket added for the other rules.

## Acceptance

- [ ] `node scripts/lint-design.mjs` exits 0 with 0 errors on a clean tree.
- [ ] Adding a fresh `header?: React.ReactNode` or `stats?: React.ReactNode`
      to any non-excluded file under `src/components/layout/` makes
      `node scripts/lint-design.mjs` exit 1.
- [ ] No other file under `src/components/layout/` declares an
      appearance-bearing `ReactNode` slot that is neither deleted nor named in
      an `exclude` entry whose `message` cites a contract file+line — every
      call site of a surviving slot traces to that citation, not only the
      `SectionCard.header` instance this ticket names.
- [ ] `scripts/lint-design.test.mjs` gains a case pinning
      `src/components/layout/` in scope for `archetype-appearance-slot`.
- [ ] `npx tsc --noEmit` and `npm test` pass.

## Related

- [adherence-lint-layout-scope-gap.md](../adherence-lint-layout-scope-gap.md) — the parent this was split out of; widened the other three rules to the same second root and established the exact-file-path exclude convention for the layout layer.
- [adherence-lint-boolean-classvalue-gap.md](../adherence-lint-boolean-classvalue-gap.md) — the prop-shape blind-spot family `renderHeader` belongs to.
- [adherence-lint-closed-folder-allowlist-gap.md](../adherence-lint-closed-folder-allowlist-gap.md) — sibling in flight; also edits the same rule objects in `_adherence.json`, so serialize rather than parallelize.
- [archive/adherence-lint-union-prop-blind-spot.md](../archive/adherence-lint-union-prop-blind-spot.md) — the drain-ticket precedent for the triage method (contract-keying test, promote-then-exclude, cite the line in `message`).
- [archive/refactor-shell-surface-header-slot-duplication.md](../archive/refactor-shell-surface-header-slot-duplication.md) — prior work on the shared header-slot shape `SectionCard.header` predates.
- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap; Phase 1 closes archetype-layer appearance props.
- ADR-0004 (`docs/adr/0004-appearance-locality-derived-vs-inherited.md`) — the derived-vs-inherited test the triage applies.
- RULES.md hard rule 12 — the enforcement mechanism this rule belongs to.
