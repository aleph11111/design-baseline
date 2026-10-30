---
area: archetypes
opened: '2026-10-30'
status: ready
value: normal
model: opus
model_reason: "new component archetype API (props, a11y wiring, async seam) plus a lint-design rule — design is the deliverable"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-30T00:00:00Z'
---

# Promote raw-combobox searchable single-select archetype

## Context

`docs/archetypes/raw-select.md` explicitly excludes "type-ahead / combobox / async search", and `docs/PROMOTION-RADAR.md` plus `docs/promotion-radar.json` list "combobox / `CommandInput` search" under **Sanctioned** ("different widget"). So every consumer hand-rolls a searchable picker. controlling-app has a hand-built `AccountCombobox` (`frontend/src/components/ui/combobox.tsx`: own open/search/highlight state and keyboard handling, no Popover/Command, no combobox ARIA), a free-text Kontonummer `Input` in `PlanAnnahmenDialog.tsx`, and ad-hoc search lists elsewhere; the operator reports the same pattern in other repos. The donor already ships the primitives (`src/components/ui/command.tsx`, `src/components/ui/popover.tsx`) but no archetype composing them. Promoted as a fleet synthesis, like `raw-select` (RULES rule 1 is satisfied by `promoted_from`).

## What to do

- [ ] Promote a `raw-combobox` `kind: component` archetype: label + trigger + popover `Command` list, groups, keyboard, aria combobox/listbox wiring, controlled value, optional async options. Ship it as typed export `design-baseline/archetypes/raw-combobox` from `src/components/archetypes/raw-combobox/`, with contract `docs/archetypes/raw-combobox.md`, demo `src/examples/raw-combobox-demo.tsx`, and a MANIFEST entry (matches the `raw-select` layout: `src/components/archetypes/raw-select/select-field.tsx`, `src/examples/raw-select-demo.tsx`).
- [ ] Compose the label/hint/error wiring the same way `SelectField` does, so the combobox is the searchable sibling of `raw-select` rather than a second field frame.
- [ ] Keep appearance out of the props: no per-call-site look props (per [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md); component-kind entries are governed by the `archetype-*` rules in `_adherence.json`).
- [ ] Add a `lint-design` rule in `scripts/lint-design.mjs` that flags a hand-rolled combobox (local open + search state filtering an options array into a clickable list) as a `raw-combobox` signal, starting at `warn` on the ADR-0003 ratchet; document it in `docs/PACKAGE.md` where the other consumer rules live.
- [ ] Update `docs/archetypes/raw-select.md` to point at `raw-combobox` where it excludes type-ahead, and remove the "combobox / `CommandInput` search" entry from the Sanctioned lists in `docs/PROMOTION-RADAR.md` and `docs/promotion-radar.json` (replace with a promoted row).
- [ ] List controlling-app `AccountCombobox` as the first rollout target in the contract's rollout section (the Kontonummer `Input` in `PlanAnnahmenDialog.tsx` as the second); file the consumer tickets after the version ships.
- [ ] ? Mirror the signal as a `molecule` entry in `docs/audit-signals.json` so the fleet audit sweep counts hand-rolled comboboxes too; a regex cannot see state-plus-filter, so this may only be feasible as a JSX-shape smell.

## Acceptance

- Consumers import one combobox molecule from `design-baseline/archetypes/raw-combobox`, and the trigger exposes `role="combobox"` with `aria-expanded`/`aria-controls` pointing at a `role="listbox"` list.
- Arrow keys move the highlight, Enter selects, Escape closes, and typing filters the list, as asserted by a vitest test in `src/components/archetypes/raw-combobox/`.
- `node scripts/lint-design.mjs` reports a hand-rolled combobox in a consumer fixture as a `raw-combobox` signal, and the shipped `raw-combobox` component itself raises no hit.
- The gallery renders a `raw-combobox` demo covering groups, an async-options case and the error state.
- `docs/archetypes/MANIFEST.json` lists `raw-combobox` and `scripts/verify-manifest-versions.mjs` passes.
- controlling-app `AccountCombobox` appears as a rollout target in `docs/archetypes/raw-combobox.md`.

## Related

- [[raw-input-multiline-mono-variant-gap]] — sibling raw-* molecule delegation precedent
- [[adherence-lint-render-callback-slot-gap]] — component-kind lint governance
- [ADR-0003](/docs/adr/0003-adherence-lint-zero-dep-scanner.md) — zero-dep lint scanner and the warn-to-error ratchet
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance locality for component props
- [raw-select contract](/docs/archetypes/raw-select.md) — the exclusion this ticket closes
- [promotion radar](/docs/PROMOTION-RADAR.md) — current "sanctioned" entry to retire
