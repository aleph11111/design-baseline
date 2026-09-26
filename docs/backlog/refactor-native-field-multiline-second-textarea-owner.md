---
area: refactor
opened: '2026-09-26'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-09-26T20:28:32.842Z'
value: normal
model: opus
model_reason: >-
  two versioned archetype contracts (raw-input, raw-textarea) both claim the multi-line field; the
  delegation changes raw-input's shipped behaviour and needs a contract-level call
---

# Route NativeField's multiline branch through the TextareaField owner

## Context

The donor ships **two owners of the labeled multi-line text field**, and they have already drifted apart:

- `NativeField` in `src/components/archetypes/raw-input/native-field.tsx`. Its `multiline` flag swaps the
  control for a bare `<Textarea>` inside the shared `fieldFrame` assembly. That branch forwards only
  `rows`, `placeholder` and `maxLength`.
- `TextareaField` in `src/components/archetypes/raw-textarea/TextareaField.tsx`. This is the dedicated
  raw-textarea archetype. Its contract (`docs/archetypes/raw-textarea.md`) says it exists because no shared
  multi-line field molecule existed. It owns the `maxLength`-derived `used / max` counter (raw-textarea
  L5, with the neutral / near / at-limit tone scale), the `mono` code/JSON variant, and uncontrolled
  length tracking.

Both use `useFieldIds` + `FieldFrame`/`FieldLabel`/`FieldHint`/`FieldError`, so the frame is shared.
Only the control has diverged. `<NativeField multiline maxLength={255}>` sets the native attribute but
shows no counter (`native-field.test.tsx:97-101` asserts only the attribute). `<TextareaField
maxLength={255}>` shows the counter its contract requires. So a consumer gets different multi-line
behaviour depending on which export they pick. Every future textarea fix (counter a11y, auto-resize if
it's ever built) has to land twice, or the two drift further.

The only in-repo `multiline` caller is the gallery demo (`src/examples/raw-input-demo.tsx:114`, "Tasting
notes"), plus two tests in `native-field.test.tsx`.

## What to do

- [ ] Make `TextareaField` the single multi-line control. `NativeField`'s `multiline` branch should render `TextareaField` with mapped props instead of its own `<Textarea>`, so the counter and future textarea fixes come along automatically.
- [ ] Adapt `NativeField`'s value-in / string-out `onChange` to `TextareaField`'s native change event at that one delegation point, so `NativeField`'s public props are unchanged.
- [ ] Make sure the delegated control still gets `NativeField`'s `id`, `hint`, `error`, `required`, `disabled`, `onBlur` / `onKeyDown`, `labelClassName` / `controlClassName` wiring, without rendering a second label or frame.
- [ ] Add a test in `native-field.test.tsx` asserting that a `multiline` field with `maxLength` renders the `used / max` counter.
- [ ] Bump the `raw-input` `version` in `docs/archetypes/MANIFEST.json`, because this changes a shipped deliverable (`docs/RULES.md` rule 8).

## Acceptance

- `<NativeField multiline maxLength={N}>` renders the same `used / max` counter as `<TextareaField maxLength={N}>`.
- `grep -n "<Textarea" src/components/archetypes/raw-input/native-field.tsx` returns no match. The multi-line control is rendered only by `TextareaField`.
- The "Tasting notes" field in `src/examples/raw-input-demo.tsx` renders unchanged apart from the counter, when a `maxLength` is set.
- `npm test` and `npx tsc --noEmit` pass, and the `raw-input` MANIFEST version is bumped.

## Related

- [src/components/archetypes/raw-input/native-field.tsx](../../src/components/archetypes/raw-input/native-field.tsx) — the `multiline` branch.
- [src/components/archetypes/raw-textarea/TextareaField.tsx](../../src/components/archetypes/raw-textarea/TextareaField.tsx) — the dedicated owner with the counter + mono behaviour.
- [archive/refactor-labeled-field-frame-triplication.md](archive/refactor-labeled-field-frame-triplication.md) — unified the field frame but left the two textarea controls separate.
- [docs/adr/0004-appearance-locality-derived-vs-inherited.md](../adr/0004-appearance-locality-derived-vs-inherited.md) — why the counter is derived from `maxLength`, which the NativeField path drops.
