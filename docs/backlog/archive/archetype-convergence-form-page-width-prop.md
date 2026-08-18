---
area: archetypes
opened: 2026-08-18
status: done
value: high
roadmap: archetype-convergence
spec: docs/superpowers/specs/2026-08-17-archetype-convergence-design.md
depends_on:
  - archetype-convergence-phase0-appearance-locality-decision
model: opus
model_reason: exhaustive width keying rule plus a lint-infra multi-exclude change is design judgment, not pattern-following
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-18T00:00:00Z
---

# Close form-page's width and className props to derived-only (MANIFEST #2)

## Context

Phase 1 of the [archetype-convergence roadmap](../archetype-convergence.md) continues in
MANIFEST order after [detail-overview closed](../archive/archetype-convergence-detail-overview-close-api.md)
as archetype C. `form-page` is MANIFEST #2. Running `node scripts/lint-design.mjs` directly
shows **two** warn hits under `src/components/archetypes/form-page/`, not the one originally
reported: `archetype-look-union-prop` on `FormPageShell.tsx:29` (`width?: "sm" | "md" | "lg" |
"xl"`) and `archetype-shell-class-name` on `FormPageShell.tsx:31` (`className?: string`). Both
must clear for a "no rule hit under form-page/" close.

Per RULES.md hard rule 12 / [ADR-0004](../../adr/0004-appearance-locality-derived-vs-inherited.md),
a per-call-site prop survives only if the contract carries an exhaustive decision rule keying
its value to the entity or its data. `docs/archetypes/form-page.md:63` states the width column
is merely "Overridable via a `width` prop" with size steps and no keying rule, and `:71` ties
two-column body layout to `width="lg"`/`"xl"` — backwards from the derived-vs-inherited
direction (the layout should key the width, not the reverse). `FormPageShellProps.className`
carries no contract language at all and is the same `*Shell` escape-hatch class the
detail-overview close ticket deleted there (`className="border-0 shadow-none"` reconstituted a
deleted look axis); the generic `archetype-shell-class-name` rule already flags it project-wide,
today excluding only `detail-overview/**`.

Two things asked to be confirmed are already correct, no fix needed: the shipped `width`
default (`FormPageShell.tsx:71`, `width = "md"`) matches the contract's stated default
(`form-page.md:63`, "md (default)") — unlike detail-overview, where the close ticket found a
shipped default contradicting its contract. And `FormPageShellProps` carries no `headerFill`
override — `SurfaceHeaderSlotProps` (`src/components/layout/SurfaceHeaderSlot.tsx`) has no such
field, the component's own docstring states "there is no per-shell override prop," and
`FormPageShell.test.tsx:83-95` asserts the header treatment reads from `HeaderFillContext`
only. Both docs still describe one anyway: `docs/archetypes/form-page.md:89` ("override per
instance via the form-page shell's `headerFill` prop") and `form-page.baseline.md:41`
("override per instance via `<FormPageShell headerFill="…">`") — stale doc language for a prop
the code doesn't have. The card-vs-free-floating-column split is already keyed to `title`
presence (`FormPageShell.tsx:77`), not a look-enum prop, matching the contract's "Classic
floating header" allowed-variation block (`:93`) — also no defect.

`_adherence.json`'s `archetype-look-union-prop` rule excludes closed archetypes via a single
`exclude` glob (currently `"src/components/archetypes/detail-overview/**"`), and
`scripts/lint-design.mjs`'s `globToRegExp` has no brace/alternation support — a second closed
directory can't be appended into that one string. Adding `form-page` to the exclude list
requires the script to accept more than one exclude glob per rule.

## What to do

- [ ] Write the width keying rule into `docs/archetypes/form-page.md` Layer 2, exhaustively
      enumerating each step's trigger from field count / column layout, matching the in-code
      `WIDTH_MAP` comments (`sm` ≈ 3–4 fields; `md` standard entity forms; `lg` wider
      single-column or 2-column grid forms; `xl` wide multi-column layouts). Keep the axis
      rather than collapsing it — `layout`'s precedent (kept, keyed to a decision table)
      applies here, not `surface`'s (deleted, no rule ever existed).
- [ ] Correct Layer 2's `:71` clause so two-column body eligibility reads as a consequence of
      the width step the keying rule assigns, not an independent permission.
- [ ] Delete `className` from `FormPageShellProps` — an unenumerable superset escape hatch on
      a `*Shell`, per the generic `archetype-shell-class-name` rule already live project-wide.
- [ ] Delete the stale `headerFill`-override language from `docs/archetypes/form-page.md:89`
      and `form-page.baseline.md:41` — the code has no such prop; `<AppShell headerFill=…>` is
      the only entry point.
- [ ] Extend `scripts/lint-design.mjs` and `_adherence.json` so a rule's exclude can span more
      than one closed archetype directory (e.g. accept an array), then add `form-page` to both
      `archetype-look-union-prop`'s and `archetype-shell-class-name`'s exclude.
- [ ] Add a `form-page-shell-class-name` error rule mirroring `detail-overview-shell-class-name`
      (`include: src/components/archetypes/form-page/**`), guarding the deleted `className`
      axis the way its sibling rule does.
- [ ] Update `docs/archetypes/form-page.baseline.md`'s width binding section to carry the
      keying rule's field-count/column language alongside the existing class-string bindings.
- [ ] Bump `docs/archetypes/form-page.md`'s frontmatter `version` (currently `1.3`) and the
      MANIFEST `form-page` entry's `version` (currently `1.15`) both to major `2.0` — per
      `docs/archetypes/README.md`'s Versioning section, a spec-rule change bumps both and the
      majors stay aligned — leaving `source_spec_version` untouched.
- [ ] Rework `src/examples/form-page-demo.tsx`'s width control (currently a free-choice toggle
      driving `useState<FormWidth>`, `form-page-demo.tsx:552,588-589`) so each surviving width
      step is demonstrated as a consequence of the field count / column layout the contract
      keys it to, not a user-facing selector.

## Acceptance

- [ ] `docs/archetypes/form-page.md` Layer 2 shows an exhaustive width keying rule (field
      count / column layout → step, every step's trigger named) and names no primitive and no
      Tailwind class.
- [ ] `FormPageShellProps` no longer declares `className`.
- [ ] `node scripts/lint-design.mjs` matches no rule — warn or error — under
      `src/components/archetypes/form-page/`, and exits 0 overall.
- [ ] `npx tsc --noEmit` passes and `npm test` passes.
- [ ] `npm run verify:manifest` exits 0.
- [ ] `docs/archetypes/form-page.md`, `.baseline.md`, and the MANIFEST entry's `version` fields
      all match at major `2.0`; `source_spec_version` remains unchanged.
- [ ] `src/examples/form-page-demo.tsx` renders every surviving width step the way the contract
      derives it, with no free-choice width control.
- [ ] A grep for `className` inside `src/components/archetypes/form-page/` matches nothing.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap, Phase 1
- [archetype-convergence-detail-overview-close-api.md](../archive/archetype-convergence-detail-overview-close-api.md)
  — same class of change: width-default check, `className` deletion, demo rework, and the
  spec/MANIFEST major-version pairing all precedent this ticket
- [archetype-convergence-phase0-appearance-locality-decision.md](../archive/archetype-convergence-phase0-appearance-locality-decision.md)
  — depends on: ADR-0004/hard rule 12 is what sorts this prop
- ADR-0004 — the rule this ticket applies
