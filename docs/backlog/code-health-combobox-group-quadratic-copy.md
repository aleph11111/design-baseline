---
area: code-health
opened: '2026-11-04'
status: ready
value: low
model: sonnet
model_reason: one-line in-place push replacing a spread inside an existing loop; cause and fix fully established
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-04T00:00:00.000Z'
---

# Stop ComboboxField copying the group bucket array on every option

## Context

`src/components/archetypes/raw-combobox/combobox-field.tsx` (lines 147-151) groups options with `for (const opt of options) map.set(opt.group, [...(map.get(opt.group) ?? []), opt])`. Each insert spreads the whole bucket again, so grouping is O(n²) per group, inside a `useMemo` keyed on `options`. With `onSearch` (async results) `options` is a fresh array per keystroke, so the regrouping reruns on every search result. A 2,000-option single-group list copies about 2 million elements per render. This is a hand-rolled `Map.groupBy`, but `tsconfig.json` line 4 pins lib to ES2022, so `Map.groupBy` (ES2024) does not typecheck, and consumers typecheck the shipped source with their own lib, so lib must not be bumped for this. Raw-combobox was just promoted (v0.20.0, #638), so fixing before consumers adopt it is cheap.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Replace the loop body with an in-place push: `const b = map.get(opt.group); if (b) b.push(opt); else map.set(opt.group, [opt]);`
- [ ] Do not bump `lib` to ES2024 and do not use `Map.groupBy`.

## Acceptance

- `combobox-field.tsx` no longer spreads the existing bucket (no `[...(map.get`).
- No other call site in `src/components/archetypes/` rebuilds a group bucket by spreading it per item.
- Group order and option order within each group are unchanged; the existing raw-combobox tests pass.
- `npx tsc --noEmit` is clean.

## Related

- [[raw-combobox-searchable-single-select]] — the ticket that shipped this component (v0.20.0, #638)
- [src/components/archetypes/raw-combobox/combobox-field.tsx](/src/components/archetypes/raw-combobox/combobox-field.tsx)
