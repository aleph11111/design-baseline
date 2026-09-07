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

## Plan (executed, 2026-09-07 — unattended session)

Triage verdict — **Branch A (delete)**. `grouped-list.md` keys NO section-level
custom-header slot to anything derived: `renderHeader` appears only as
descriptive "Allowed variation" prose (Layer 5, Migration notes), with no
decision rule / enumeration. ADR-0004 derived-vs-inherited + RULES hard rule 12
→ unkeyed appearance-bearing slot → delete, not exclude. All other layout-layer
ReactNode slots checked: only `SectionCard.header` matched the widened pattern;
`AppShell.header` is a REQUIRED composition slot (structure, and the `?`-pattern
cannot match it — documented in the rule's message).

Premise correction (verified by reading the actual files; recorded in the PR):
the ticket's live-call-site list named `DemoNextApp.tsx:60` / `DemoViteApp.tsx:58`
as `SectionCard.header` call sites — they are `<AppShell header={…}>`, a required
top-level prop in `src/examples/` (outside the rule's `include`). The empirical
widened-rule run proved the sole real hit is `SectionCard.tsx:31`. Demos untouched.

Delivered:

- [x] Grep every caller of the touched pattern before editing; fix at the shared point.
- [x] Widen `archetype-appearance-slot` `include` to array form with `src/components/layout/**` second root; message documents the layout widen + the required-slot (`AppShell.header`) out-of-scope-by-design note.
- [x] Read `grouped-list.md`: no contract keys a section-level custom-header slot (descriptive prose only) → Branch A.
- [x] Deleted `SectionCard.header`; reworked the live call path in `GroupedListSection` (deleted `renderHeader` callback; added sanctioned `actions` right-aligned treatment channel); reworked the demo's Sichuan heat badge onto `actions`; reworked the three `SectionCard.test.tsx` header cases.
- [x] N/A — Branch A taken, no `exclude` needed.
- [x] `renderHeader`-shaped render-callback props get their own follow-up ticket ([`adherence-lint-render-callback-slot-gap`](../adherence-lint-render-callback-slot-gap.md)); function-typed props are a distinct prop-shape class from boolean / `className?: ClassValue`, so it is filed alongside — not folded into — `adherence-lint-boolean-classvalue-gap`.
- [x] `scripts/lint-design.test.mjs` gains the pinning cases (second include root reaches `layout/`; exclude still engages on the widened root).

Contract impact recorded: `grouped-list.md` spec 1.2→1.3 (layer 5 allowed variation changed, renderHeader→actions, migration note rewritten), `MANIFEST.json` deliverable 2.1→3.0 (shipped-primitive prop deletion, major per the `README.md` versioning table; matches the close-API-delete precedent of #195). `source_spec_version` untouched.

## Context

`_adherence.json`'s `archetype-appearance-slot` rule (pattern
`^\s*(header|stats)\?\s*:\s*(React\.)?ReactNode`, `severity: error`) carried
`include: "src/components/archetypes/**"` only, so the shared chrome layer
`src/components/layout/**` was invisible to it. It was the last of the four
archetype-layer appearance rules with that gap:
[adherence-lint-layout-scope-gap](../adherence-lint-layout-scope-gap.md) widened
`archetype-appearance-noun-prop`, `archetype-look-union-prop` and
`archetype-shell-class-name` to carry `src/components/layout/**` as a second
`include` root, and deliberately left this one out — closing it is a
cross-file refactor, not a config edit, so it was split here.

Widening it surfaced exactly one new error, confirmed both by the ticket's
`ADHERENCE_CONFIG` run and re-run at implementation time:
`src/components/layout/SectionCard.tsx:31` — `header?: React.ReactNode`,
documented in its own JSDoc as a "Raw header override … replaces the default
`<SectionHeading>` inside the title bar entirely". That was the same
unenumerable escape hatch `detail-overview-appearance-slot` exists to ban one
directory over. Live call site of the slot:
`src/components/archetypes/grouped-list/GroupedListSection.tsx` (forwarded its
own `renderHeader` callback prop into it), plus the `SectionCard.test.tsx`
header cases and the `grouped-list-demo.tsx` Sichuan section.

`GroupedListSection`'s `renderHeader` was a **render-callback** prop escaping
every current appearance rule's pattern — the escape hatch survived one level
up — so a prop-shape follow-up was filed:
[adherence-lint-render-callback-slot-gap](../adherence-lint-render-callback-slot-gap.md).

## What to do

- [x] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [x] Add `"src/components/layout/**"` as a second `include` root to
      `archetype-appearance-slot` in `_adherence.json` (array form, matching
      the three siblings widened in
      [adherence-lint-layout-scope-gap](../adherence-lint-layout-scope-gap.md)).
- [x] Read `docs/archetypes/grouped-list.md` — the only contract with a live
      caller — and determine whether it keys a section-level custom-header
      slot to anything derived (ADR-0004's derived-vs-inherited test, RULES.md
      hard rule 12). Layer 2's Forbidden list already bans "hand-rolled header
      markup" at page level, which was evidence against a keying rule existing.
- [x] No contract keyed it: deleted `SectionCard.header`, and reworked the live
      call paths — `GroupedListSection`'s `renderHeader` indirection, the
      `grouped-list-demo.tsx` Sichuan section, and the `SectionCard.test.tsx`
      cases — onto the `title`/`description`/`actions` props the bar already owns.
      (`DemoNextApp.tsx` / `DemoViteApp.tsx` were a grep false positive: `<AppShell
      header={…}>` is a required prop, not `SectionCard.header` — see plan above.)
- [x] If a contract did key it: exclude — **N/A (Branch A taken, nothing excluded)**.
- [x] Decide whether `renderHeader`-shaped render-callback props get their own
      rule or fold into
      [adherence-lint-boolean-classvalue-gap](../adherence-lint-boolean-classvalue-gap.md);
      file the follow-up there rather than widening this ticket.
- [x] Cover the widened root in `scripts/lint-design.test.mjs`.

## Acceptance

- [x] `node scripts/lint-design.mjs` exits 0 with 0 errors on a clean tree. (185 files / 59 warn / 0 error / exit 0 — warn count unchanged from pre-work baseline.)
- [x] Adding a fresh `header?: React.ReactNode` or `stats?: React.ReactNode` to any non-excluded file under `src/components/layout/` makes `node scripts/lint-design.mjs` exit 1. (Mutation probe in `src/components/layout/` with both slots: exit 1, two slot hits; probe removed: back to 0 errors. Mutation proven applied by the rule naming the probe lines.)
- [x] No other file under `src/components/layout/` declares an appearance-bearing `ReactNode` slot that is neither deleted nor named in an `exclude` entry citing a contract file+line. (Post-work grep: zero optional `header?`/`stats?` `ReactNode` slots in `layout/`.)
- [x] `scripts/lint-design.test.mjs` gains a case pinning `src/components/layout/` in scope for `archetype-appearance-slot`. (Two cases: second include root reaches `layout/` + ui/ stays out; exclude still engages on the widened root.)
- [x] `npx tsc --noEmit` and `npm test` pass. (tsc clean; 54 files / 353 tests green, incl. the manifest verify pretest.)

## Related

- [adherence-lint-layout-scope-gap.md](../adherence-lint-layout-scope-gap.md) — the parent this was split out of; widened the other three rules to the same second root and established the exact-file-path exclude convention for the layout layer.
- [adherence-lint-render-callback-slot-gap.md](../adherence-lint-render-callback-slot-gap.md) — the render-callback prop-shape follow-up filed by this work (function-typed props; distinct class from boolean / `className?: ClassValue`).
- [adherence-lint-boolean-classvalue-gap.md](../adherence-lint-boolean-classvalue-gap.md) — the prop-shape blind-spot family this follow-up is filed alongside.
- [adherence-lint-closed-folder-allowlist-gap.md](../adherence-lint-closed-folder-allowlist-gap.md) — sibling in flight; also edits the same rule objects in `_adherence.json`, so serialize rather than parallelize.
- [archive/adherence-lint-union-prop-blind-spot.md](../archive/adherence-lint-union-prop-blind-spot.md) — the drain-ticket precedent for the triage method (contract-keying test, promote-then-exclude, cite the line in `message`).
- [archive/refactor-shell-surface-header-slot-duplication.md](../archive/refactor-shell-surface-header-slot-duplication.md) — prior work on the shared header-slot shape `SectionCard.header` predates.
- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap; Phase 1 closes archetype-layer appearance props.
- ADR-0004 (`docs/adr/0004-appearance-locality-derived-vs-inherited.md`) — the derived-vs-inherited test the triage applies.
- RULES.md hard rule 12 — the enforcement mechanism this rule belongs to.
