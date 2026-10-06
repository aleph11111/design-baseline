---
area: ui
opened: '2026-10-06'
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-06T17:55:30Z'
---

# Add a size prop to Input and thread it through NativeField

## Context

`src/components/ui/input.tsx` is pinned at `h-9` — the only box-shaped control on the v0.5.0 control height ladder without a `size` step. Since 8404892 (v0.5.0), `Button`, `SelectTrigger` and `SegmentedControl` take `size` (sm `h-8` / default `h-9` / lg `h-11`) and `SearchInput` takes `inputSize` with the same geometry (`src/components/ui/search-input.tsx:27`), but `Input` itself and the `NativeField` assembly built on it (`src/components/archetypes/raw-input/native-field.tsx`) expose no step. `NativeField` is the archetype the fleet's dense in-table and inline-row editors are built from (controlling-app, 2026-10-06: annual-statements amount inputs, scenarios inline edits, `FormulaEditor`/`ManualAmountEditor`), so those consumers cannot reach the `sm` step and either sit too tall or hand-roll a `className` height override — the exact drift the STYLE.md "Control heights" rule forbids ("Never override a control's height with a `className`"). This is the step the v0.5.0 ladder left off the base primitive: the commit message names Input as sharing the ladder, but the prop never landed.

## What to do

- [ ] Add `size?: "sm" | "default" | "lg"` to `Input` in `src/components/ui/input.tsx`, defaulting to `"default"` (the current `h-9` render, left byte-identical). Per-step geometry mirrors `SearchInput`'s `SIZE` map: `sm = h-8 text-xs`, `lg = h-11 text-base`.
- [ ] Thread `size` through `NativeField` (`src/components/archetypes/raw-input/native-field.tsx`): a `size` prop on `NativeFieldProps` passed to the single-line `<Input>` render. The `multiline` and `range` paths stay unchanged — a textarea's height is the `rows` knob, not the 3-step box ladder.
- [ ] Add `Input` to the STYLE.md "Control heights" owners list as a `size` owner (it is currently listed as `Input (h-9)`), noting `NativeField` threads the step through.
- [ ] Bump the `raw-input` MANIFEST entry and the `package.json` version in the same PR per docs/RULES.md rules 8 & 11 (a shipped primitive and a shipped archetype both change).

## Acceptance

- [ ] `Input` with `size="sm"` renders `h-8 text-xs`, with `size="lg"` renders `h-11 text-base`, and with no `size` renders the unchanged `h-9` default.
- [ ] `NativeField` with `size="sm"` renders an `h-8` single-line control; `multiline` and `range` fields render unchanged.
- [ ] The existing `NativeField` test suite and the raw-input demo output are unchanged when `size` is omitted — no default-render regression.

## Related

- [[raw-input-multiline-mono-variant-gap]] — sibling raw-input ticket (archived); the same `NativeField` surface this one extends
- [STYLE.md — Control heights](/docs/STYLE.md) — the owners list this ticket updates and the "never override a height with a `className`" rule it enforces
- [raw-input contract](/docs/archetypes/raw-input.md) — the archetype binding whose `NativeField` primitive changes
