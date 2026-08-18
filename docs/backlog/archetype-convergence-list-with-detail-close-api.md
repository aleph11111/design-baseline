---
area: archetypes
opened: 2026-08-18
status: ready
value: high
roadmap: archetype-convergence
spec: docs/superpowers/specs/2026-08-17-archetype-convergence-design.md
model: opus
model_reason: "a deliberate breaking API change across a primitive, its tests, its demo, both contract docs and the MANIFEST, spanning four appearance axes with no established keying rule to copy from the sibling closure"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-18T00:00:00Z
---

# Close the list-with-detail shell API to derived props and typed data

## Context

Phase 1 of the [archetype-convergence roadmap](archetype-convergence.md)'s
"audit the remaining twenty archetypes for the same class of prop and close
them, in MANIFEST order" — `list-with-detail` is MANIFEST key `A`, version
`1.18`, the first entry and the largest remaining offender.
`node scripts/lint-design.mjs` reports four warns on
`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx`: three
`archetype-look-union-prop` (line 44 — `align` on `ListColumn`; line 71 —
`detailPresentation`; line 107 — `presentation`) and one
`archetype-shell-class-name` (line 115 — `className`) — one more axis than the
three the lint-line citation named, since `align` also trips the union-prop
rule and `className` trips the sibling shell-escape-hatch rule the closed
`detail-overview` deleted the same way.

Applying [ADR-0004](../adr/0004-appearance-locality-derived-vs-inherited.md)'s
derived-vs-inherited test (a per-call-site prop is legal only if the contract
carries a decision rule that determines its value from the entity/row data,
exhaustively enumerated, with two engineers deriving the same value — a
backwards-compatible default disqualifies on its own):

- **`presentation?: "table" | "card-grid" | "action-row"`** (default `table`,
  `list-with-detail.md:125`) — the contract calls this the archetype's variant
  axis but keys it only to prose adjectives ("browse-y, summary-led", "mobile
  / pick-an-item"), no property of the row/entity data. `src/examples/list-with-detail-demo.tsx:179`
  drives it from a demo state toggle, confirming it's discretionary today, not
  derived. The prior `list-with-detail-shell-presentation-split` ticket treated
  all three presentations as real, actively-vendored infrastructure, so a
  keying rule is the likely fix over deletion, but no rule is written yet.
- **`detailPresentation?: "rail" | "drawer"`** (default `rail`,
  `list-with-detail.md:217`) — the contract's own words, "lets a consumer opt
  into the overlay on desktop too", are naked discretion with no keying rule,
  unlike `detail-overview`'s `layout`, which survived closure via a decision
  table keyed to entity profile.
- **`unstyled?: boolean`** (default `false`, `list-with-detail.md:167`) — the
  contract does key this one to composition (grouped-list wraps each group's
  table flush), but it's still a caller-facing prop rather than context the
  wrapping shell supplies, unlike `detail-overview`'s `UnifiedSurfaceContext`,
  which became an unexported internal.
- **`align?: "left" | "right" | "center"`** on `ListColumn` (line 44) — not
  named in the roadmap's per-prop breakdown but flagged by the same lint rule;
  needs its own ruling (e.g. derivable from the column's cell/value type) or
  an explicit design-space carve-out, since it configures column layout rather
  than the shell's own appearance.
- **`className?: string`** on the shell (line 115) — the same unenumerable
  escape-hatch class `detail-overview-shell-class-name` closed by deletion;
  not one of the three lines the roadmap cited but the same defect.
- **`detailTitle` / `detailActions`** — data props feeding the drawer header;
  likely keep, pending confirmation they carry no appearance and that the
  drawer header still reads `HeaderFillContext` with no per-shell override.

A second, doc-only finding of the same "contradicts the shipped code" class
`detail-overview`'s `width="none"` vs `"md"` mismatch was: `list-with-detail.md:66`
and `:219`, and `list-with-detail.baseline.md:82`, all describe a `headerFill`
override prop "a single shell instance may override" / "pass `headerFill` on
the shell to override it per instance" — but `ListWithDetailShellProps` in
`ListWithDetailShell.tsx` has no `headerFill` prop at all today. The docs
describe an escape hatch the code doesn't ship; they need correcting to match
`detail-overview`'s closure (no override, `<AppShell headerFill=…>` is the
only entry point), regardless of what happens to the four axes above.

## What to do

- [ ] Rule on `presentation`: write an enumerated keying rule into
      `list-with-detail.md` tying each value to a checkable property of the
      row/column data, or delete the axis to the one shape the contract
      requires — state the reasoning in the PR. If the axis survives, update
      `src/examples/list-with-detail-demo.tsx:179` to drive it from data, not
      a picker (living-demo rule still applies to whichever axis remains).
- [ ] Rule on `detailPresentation`: write a keying rule (cf. `detail-overview`'s
      `layout` decision table keyed to entity profile) or delete it.
- [ ] Rule on `unstyled`: prefer deriving it from context the wrapping shell
      provides (mirroring `UnifiedSurfaceContext`'s move to an unexported
      internal in `detail-overview`); if that's too large a change here, keep
      the prop but record the composition keying rule explicitly in the
      contract instead of leaving it implicit.
- [ ] Rule on `align` on `ListColumn` — the fourth lint hit the roadmap's line
      citation didn't name explicitly.
- [ ] Rule on `className` on the shell — the same `archetype-shell-class-name`
      class `detail-overview` closed by deletion.
- [ ] Confirm `detailTitle` / `detailActions` carry no appearance and that the
      drawer header bar reads `HeaderFillContext` with no per-shell override.
- [ ] Delete the stale `headerFill`-override language from
      `list-with-detail.md:66` and `:219` and `list-with-detail.baseline.md:82`
      — no such prop exists on `ListWithDetailShellProps` today.
- [ ] Update `docs/archetypes/list-with-detail.md` (role-level language only,
      no primitive names, no Tailwind classes) and
      `docs/archetypes/list-with-detail.baseline.md` (carries the binding) in
      tandem with every code change above.
- [ ] Re-read every "**Allowed variation**" block in `list-with-detail.md`
      against the derived-vs-inherited test — a variation permitted with no
      keying rule is a design space, not a contract.
- [ ] Bump the `list-with-detail` MANIFEST entry a major version (`1.18` →
      `2.0`); the API breaks deliberately. Leave `source_spec_version`
      untouched.
- [ ] Add `list-with-detail-*` error-severity rules to `_adherence.json` for
      each axis actually deleted, mirroring the `detail-overview-surface-prop`
      / `detail-overview-rhythm-prop` pattern (`include:
      src/components/archetypes/list-with-detail/**`).
- [ ] Add `list-with-detail` to the `exclude` list of the four generic
      archetype warn rules (`archetype-appearance-noun-prop`,
      `archetype-look-union-prop`, `archetype-shell-class-name`,
      `archetype-appearance-slot`) it no longer needs to be warned about,
      mirroring `detail-overview`'s exclude entries.
- [ ] Update `ListWithDetailShell`'s test file and
      `src/examples/list-with-detail-demo.tsx` to the closed API.

## Acceptance

- [ ] `npx tsc --noEmit` passes.
- [ ] `npm test` passes with any list-with-detail test updated to the closed
      API.
- [ ] `npm run verify:manifest` exits green.
- [ ] `node scripts/lint-design.mjs` reports 0 errors and no
      `archetype-look-union-prop` hit in `list-with-detail/`.
- [ ] `src/examples/list-with-detail-demo.tsx` still renders every surviving
      axis (living-demo rule) with no deleted prop passed anywhere in `src/`.
- [ ] Every prop remaining on `ListWithDetailShellProps` is either data or
      carries a contract decision rule deriving its value from the entity —
      not only the axes this ticket named going in.
- [ ] Both list-with-detail docs and the MANIFEST entry agree with the shipped
      API, and `list-with-detail.md` still names no primitive and no Tailwind
      class.

## Related

- [archetype-convergence.md](archetype-convergence.md) — parent roadmap,
  Phase 1.
- [archetype-convergence-detail-overview-close-api.md](archive/archetype-convergence-detail-overview-close-api.md)
  — the sibling closure this ticket mirrors (`surface`/`rhythm`/`headerFill`/
  `className` deletions, `layout`'s decision-table precedent for a surviving
  axis, the `width` default-contradiction finding this ticket's `headerFill`
  finding is the same class of).
- [archetype-convergence-phase0-appearance-locality-decision.md](archive/archetype-convergence-phase0-appearance-locality-decision.md)
  — ADR-0004, the rule every prop above is graded against.
- [list-with-detail-shell-presentation-split.md](archive/list-with-detail-shell-presentation-split.md)
  — split the three presentation bodies into modules; evidence all three are
  real, actively-vendored infrastructure, relevant to the delete-vs-key-it call
  on `presentation`.
- [decouple-archetype-contract-from-reference-impl.md](archive/decouple-archetype-contract-from-reference-impl.md)
  — the contract/`.baseline.md` split both docs updates must preserve.
