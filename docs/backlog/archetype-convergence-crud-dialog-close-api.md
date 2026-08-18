---
area: archetypes
opened: 2026-08-18
status: ready
value: high
roadmap: archetype-convergence
spec: docs/superpowers/specs/2026-08-17-archetype-convergence-design.md
model: opus
model_reason: the width keying-rule fix and widening the shell-class-name lint glob are design judgment; the className drop across four files is mechanical but the Allowed-variation audit is not
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-18T12:38:54Z
---

# Close crud-dialog's width, layout, and className props to derived-only (MANIFEST key J)

## Context

Phase 1 of the [archetype-convergence roadmap](../archetype-convergence.md) is
draining per-call-site appearance props from the remaining archetypes.
`crud-dialog` (MANIFEST key `J`, v2.1) is next: `node scripts/lint-design.mjs`
reports two `archetype-look-union-prop` warns —
`src/components/archetypes/crud-dialog/CrudDialogSheet.tsx:27` (`width`) and
`src/components/archetypes/crud-dialog/CrudDialogBody.tsx:27` (`layout`) — and
all four primitives (`CrudDialogSheet.tsx:29`, `CrudDialogBody.tsx:28`,
`CrudDialogHeader.tsx:34`, `CrudDialogFooter.tsx:53`) still declare a
`className?: string` escape hatch.

Per [ADR-0004](../../adr/0004-appearance-locality-derived-vs-inherited.md) /
RULES.md hard rule 12, a per-call-site prop is legal only if the contract
carries an exhaustive decision rule deriving its value from the entity or its
data. Auditing `crud-dialog.md`'s "Allowed variation" blocks against that
test:

- **`width?: "sm" | "md" | "lg"`** (`CrudDialogSheet.tsx:27`) — `crud-dialog.md:50`
  states a real keying rule ("lg" for tabbed/complex entities, "sm" for
  3–4-field minimal forms, "md" default), but `crud-dialog.md:54`'s Allowed
  variation then says "Width variant choice per consumer," which reopens the
  design space the Required section just closed. `src/examples/crud-dialog-demo.tsx:74,485`
  confirms it's discretionary today: `width` is a `React.useState` picker
  wired to a manual toggle, not derived from the demo's field/tab data.
- **`layout?: "flat" | "two-column"`** (`CrudDialogBody.tsx:27`) — `crud-dialog.md:116-119`
  keys this correctly to field shape (flat for 5–8 simple fields, two-column
  for paired fields, omitted — `undefined` — for the two-tab and mixed
  shapes), and `:121-122` documents the omission case as a deliberate
  carve-out, not a re-opened design space. `CrudDialogBody`'s destructured
  `layout` prop (`CrudDialogBody.tsx`) carries no default, which matches the
  contract's own silence on a default for this axis (the contract requires a
  per-instance pick, not a fallback) — no default-contradiction defect here.
  The demo's `bodyLayout` picker (`crud-dialog-demo.tsx:75,486`) is the same
  free-toggle pattern as `width`, but the prop itself is correctly keyed; only
  the demo needs to stop free-toggling it.
- **`className?: string`** on all four primitives — the same unenumerable
  escape hatch `detail-overview`, `form-page`, and `list-with-detail` closed
  by deletion. `CrudDialogSheet` is this archetype's shell but is not named
  `*Shell.tsx`, so `_adherence.json`'s generic `archetype-shell-class-name`
  rule (`include: "src/components/archetypes/**/*Shell.tsx"`) never flags it —
  a glob gap that would silently miss any future non-`*Shell`-named shell,
  not just this one.

No call site in `src/` passes `className` to any of the four crud-dialog
primitives today.

## What to do

- [ ] Delete `className?: string` and its `cn(...)` argument from
      `CrudDialogSheet.tsx:29`, `CrudDialogBody.tsx:28`, `CrudDialogHeader.tsx:34`,
      and `CrudDialogFooter.tsx:53`.
- [ ] Delete the "Width variant choice per consumer" line at `crud-dialog.md:54`;
      the Required section's keying rule at `:50` already states the
      derivation — no replacement line needed, just the contradiction removed.
- [ ] Update `src/examples/crud-dialog-demo.tsx` so `width` is computed from
      the rendered entity's shape (tab count / field count) instead of the
      `useState<DialogWidth>` picker at line 485 — the width contract is now
      derived-only, so the living demo (`crud-dialog-demo.tsx:74,393,644`)
      must stop free-toggling it. Leave `bodyLayout`'s picker in place only if
      it still demonstrates all three body shapes; if removing the `width`
      toggle simplifies the surrounding picker UI, adjust it in the same pass.
- [ ] Confirm `layout`'s Required section (`crud-dialog.md:116-119`) and
      Allowed-variation carve-out (`:121-122`) state the keying rule as a
      derivation with no re-opening "choice per consumer" line, and that
      `CrudDialogBody`'s missing default matches the contract's own silence —
      this is a documentation-vs-code read, not a lint check.
- [ ] Re-read every remaining "**Allowed variation**" block in
      `docs/archetypes/crud-dialog.md` (Layers 1, 3, 5, 7–10, 12–15) against
      the derived-vs-inherited test; each one already names a concrete
      keying condition or consumer-owned data shape (URL sync opt-in,
      `subtitle`/`onClose` slots, `isLoading` omission, permission booleans,
      etc.) — confirm none of them is naked per-consumer discretion the way
      `width`'s was, and note it in the PR if any is found.
- [ ] In `_adherence.json`, add `crud-dialog-shell-class-name` (`error`,
      `include: "src/components/archetypes/crud-dialog/**"`) mirroring
      `detail-overview-shell-class-name` / `form-page-shell-class-name` /
      `list-with-detail-shell-class-name`, and add
      `src/components/archetypes/crud-dialog/**` to the `exclude` list of the
      generic `archetype-look-union-prop` warn rule.
- [ ] Widen the generic `archetype-shell-class-name` rule's `include` glob (or
      its matching mechanism) so a shell not named `*Shell.tsx` is still
      caught — the gap crud-dialog exposed is generic lint infrastructure, not
      a crud-dialog-only fix.
- [ ] Bump the `crud-dialog` MANIFEST entry (`docs/archetypes/MANIFEST.json`,
      key `J`) from `2.1` to a major version `3.0`; leave `source_spec_version`
      untouched.
- [ ] Update `docs/archetypes/crud-dialog.md` (role-level language only, no
      primitive names, no Tailwind classes) and `crud-dialog.baseline.md`
      (carries the binding) together with every code change above.
- [ ] Update `useCrudDialogController.test.tsx` and `CrudDialogFooter.test.tsx`
      for the closed API (drop any `className` usage, keep width/layout
      coverage on the surviving derived behavior).

## Acceptance

- [ ] `npx tsc --noEmit` and `npm test` pass.
- [ ] `node scripts/lint-design.mjs` reports 0 errors, and no `archetype-*`
      warn hit names a `crud-dialog` file.
- [ ] `grep -n 'className' src/components/archetypes/crud-dialog/*.tsx` shows
      no top-level `className?: string` prop on the sheet/body/header/footer
      public prop types.
- [ ] A shell not named `*Shell.tsx` that declares `className?: string` is
      caught by the lint (verify by temporarily re-adding it and seeing an
      error-severity hit), showing the widened glob covers the general case,
      not only crud-dialog.
- [ ] The crud-dialog gallery demo renders unchanged apart from the deliberate
      API break, and no call site substitutes a hand-typed class for a
      deleted prop.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — parent roadmap,
  Phase 1.
- [archetype-convergence-form-page-width-prop.md](archive/archetype-convergence-form-page-width-prop.md)
  — closest sibling: a width-keying-rule fix plus a lint-glob/exclude change
  on a shell that was already gated only by the generic rule.
- [archetype-convergence-list-with-detail-close-api.md](archive/archetype-convergence-list-with-detail-close-api.md)
  — the four-axis closure this ticket's structure mirrors, including the
  "re-read every Allowed-variation block" step.
- [archetype-shell-classname-drop.md](archive/archetype-shell-classname-drop.md)
  — dropped `className` from the twelve `*Shell.tsx`-named shells and flipped
  the generic rule to `error`; this ticket both drops it from crud-dialog's
  non-`*Shell`-named primitives and fixes the glob gap that let them slip
  through that sweep.
- [archetype-convergence-phase0-appearance-locality-decision.md](archive/archetype-convergence-phase0-appearance-locality-decision.md)
  — ADR-0004, the rule every prop above is graded against.
- [crud-dialog-footer-submitting-label.md](archive/crud-dialog-footer-submitting-label.md),
  [crud-dialog-discard-confirm-split.md](archive/crud-dialog-discard-confirm-split.md),
  [crud-dialog-delete-in-flight-state.md](archive/crud-dialog-delete-in-flight-state.md)
  — prior crud-dialog primitive work; none touched `className`/`width`/`layout`.
