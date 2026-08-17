---
area: archetypes
opened: 2026-08-17
status: ready
value: high
roadmap: archetype-convergence
spec: docs/superpowers/specs/2026-08-17-archetype-convergence-design.md
depends_on:
  - archetype-convergence-phase0-appearance-locality-decision
  - archetype-convergence-nested-heading-primitive
model: opus
model_reason: "a deliberate breaking API change across primitive, tests, demo, both contract docs and the MANIFEST, with a visual default correction that reaches the whole fleet"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-17T00:00:00Z
---

# Close the detail-overview shell API to derived props and typed data

## Context

Phase 1 of the [archetype-convergence roadmap](archetype-convergence.md), and its
proof case. hk-crm's vendored detail-overview primitives are byte-identical to
this donor's — the only difference is a `"use client"` line and a stamp comment —
and the page is still wrong, because every divergence lives in how twelve route
files fill the slots. Only `companies/[id]/page.tsx:132` passes
`surface="unified"`; its eleven sibling tabs inherit the `surface = "separated"`
default that `DetailOverviewShell.tsx:71` annotates as *"the v2.0/v2.1 look. Zero
churn."* Five of twelve tabs render a KPI strip, in two structurally different
primitives (`StatTileRow` versus `MetricList`). None of that is drift; it is the
design space the API leaves open.

Applying hard rule 12 to the existing props also surfaced a second, unreported
instance of the same defect: `docs/archetypes/detail-overview.md:289` states
`width="md"` is the record-page default with `width="none"` reserved for pages
carrying wide embedded tables, while `DetailOverviewShell.tsx:70` ships
`width = "none"`. Every call site that omits `width` silently gets the column the
contract reserves for the exception.

## What to do

- [ ] Delete the `surface` prop and the `separated` branch. `unified` becomes the
      only container model. `UnifiedSurfaceContext` stays as an internal detail
      (the rail suppresses card chrome, the main column keeps flattened cards) and
      is no longer exported.
- [ ] Delete the `headerFill` override prop here and on
      `src/components/layout/SurfaceHeader.tsx` and `SurfaceHeaderSlot.tsx`, so
      `<AppShell headerFill=…>` is the only entry point — a context axis with an
      override is the escape hatch hard rule 12 forbids.
- [ ] Delete `rhythm`. The contract's own wording (`detail-overview.md:285` —
      "a compact measure for short pages. Choose once per page") sets no
      threshold for "short", so no two engineers derive the same value.
- [ ] Delete `className` from `DetailOverviewShell`. It is a superset of the
      props above — `className="border-0 shadow-none"` reconstitutes
      `surface="separated"` exactly — and the lint cannot see through an
      arbitrary class string. Leave the other twelve shells alone; they drain as
      lint warnings.
- [ ] Keep `layout` and `width`; both carry contract decision rules
      (`:140-151` and `:289`). Correct the `width` default from `"none"` to
      `"md"` so the code matches the contract.
- [ ] Replace `header?: ReactNode` with `title` / `subtitle` / `badges` /
      `actions` data props, rendered by the shell through the Mode B nested
      heading primitive.
- [ ] Replace `stats?: ReactNode` with `stats?: StatItem[]` and export
      `StatItem` (`label`, `value`, optional `hint` — mirroring `StatTileProps`
      minus `className`). The shell renders `StatTileRow` and derives its
      `columns` from `items.length`, retiring the hand-maintained "Must match the
      number of `<StatTile>` children" invariant at `StatTileRow.tsx:17`.
- [ ] Leave `summary`, `content` and `references` as `ReactNode` — composing
      documented section primitives is structure, not appearance.
- [ ] Update `DetailOverviewShell.test.tsx` and `src/examples/detail-overview-demo.tsx`
      to the closed API; the demo currently drives `layout` and `surface` through
      state (`detail-overview-demo.tsx:217`).
- [ ] Update both docs in tandem: delete the "Surface variant" section
      (`:208-242`) and the `surface` API row (`:248`), delete the "overridable per
      page via the shell's own `headerFill` prop" clause (`:234-235`), replace
      Mode B's "may introduce a section-level `<h2>`" (`:351`) with a required
      nested-heading role, and correct the Layer 2 `width` language. Keep
      `<slug>.md` free of primitive names and Tailwind classes (RULES rule 3);
      the bindings go in `<slug>.baseline.md`.
- [ ] Re-read every "**Allowed variation**" block in the contract against hard
      rule 12 — a variation permitted with no keying rule is a design space, not
      a contract — and record any found beyond the ones listed here.
- [ ] Bump the MANIFEST entry a **major** version; the API breaks deliberately.
- [ ] Flip the detail-overview appearance-prop lint rules from `warn` to `error`
      in `_adherence.json` in this same change, so the ratchet starts engaged.

## Acceptance

- [ ] `DetailOverviewShellProps` declares none of `surface`, `rhythm`,
      `headerFill`, `className`. (Check the prop type, not the file — a bare grep
      for `surface` still matches the internal `UnifiedSurfaceContext`.)
- [ ] No archetype shell or layout primitive accepts a `headerFill` prop; the
      only entry point in the repo is `<AppShell headerFill=…>`.
- [ ] `DetailOverviewShell` with `width` omitted renders the contained column the
      contract's Layer 2 specifies.
- [ ] `stats` accepts `StatItem[]` and no `ReactNode`, and the rendered strip's
      column count follows `items.length` with no `columns` passed at the call
      site.
- [ ] `npx tsc --noEmit` passes and `npm test` passes with the updated shell test.
- [ ] `node scripts/lint-design.mjs` exits 1 if any appearance-prop rule matches a
      `detail-overview` file, and no such rule matches one today.
- [ ] Every prop remaining on the shell is either data or carries a contract
      decision rule that determines its value from the entity — not only the two
      props this ticket set out to remove.
- [ ] Both detail-overview docs and the MANIFEST entry agree with the shipped
      API, and `docs/archetypes/detail-overview.md` still names no primitive and
      no Tailwind class.

## Related

- [archetype-convergence.md](archetype-convergence.md) — parent roadmap, Phase 1
- [archetype-convergence-nested-heading-primitive.md](archetype-convergence-nested-heading-primitive.md)
  — depends on: the shell composes it for Mode B
- [archetype-convergence-phase0-appearance-locality-decision.md](wip/archetype-convergence-phase0-appearance-locality-decision.md)
  — depends on: hard rule 12 is what sorts these props
- [detail-overview-blueprint-rail-variant.md](archive/detail-overview-blueprint-rail-variant.md)
  — shipped the `layout="rail"` variant this ticket keeps
- [list-with-detail-shell-presentation-split.md](archive/list-with-detail-shell-presentation-split.md)
  — the sibling shell's presentation split, same class of change
