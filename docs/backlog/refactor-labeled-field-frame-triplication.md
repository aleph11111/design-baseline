---
area: refactor
opened: '2026-08-25'
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
  graded_at: '2026-08-25T10:49:12.137Z'
model: opus
model_reason: >-
  unifying the label/hint/error/aria frame across three versioned component archetypes plus two ui
  primitives requires deciding one prop vocabulary and one accessibility contract across five
  diverged call surfaces
---

# Extract the labeled-field frame shared by NativeField, SelectField and TextareaField

## Context

Severity: **medium-high** (DRY / leaky abstraction). Three of the baseline's component-kind archetypes exist for exactly one reason — to own the *labeled form field assembly* (label + control + hint + error + accessibility wiring) that the fleet keeps hand-rolling. Each of the three then hand-rolls that assembly itself:

- `src/components/archetypes/raw-input/native-field.tsx:206` (I, `NativeField`)
- `src/components/archetypes/raw-select/select-field.tsx:92` (S, `SelectField`)
- `src/components/archetypes/raw-textarea/TextareaField.tsx:90` (T, `TextareaField`)

All three open with `cn("flex flex-col gap-1.5", …)`, all three derive `aria-describedby` by joining ids off a `React.useId()` fallback, and all three render a trailing hint/error line. `NativeField` and `SelectField` duplicate the required-marker block byte-for-byte (`<span className="ml-0.5 text-destructive" aria-hidden="true">*</span>`), the id scheme (`${id}-hint` / `${id}-error`), and the two `<p className="text-sm …">` slots.

The copies have already diverged in ways a caller cannot predict:

- Prop vocabulary: `hint` (I, S) vs `helperText` (T); `className` on the wrapper (I, S) vs `wrapperClassName` (T).
- Id scheme: two ids `-hint` / `-error` (I, S) vs one shared `-help` (T).
- Type scale: `text-sm` for hint and error (I, S) vs `text-xs` (T).
- Error/hint coexistence: both render together (I, S) vs error *suppresses* helper (T).
- Error ring: `border-destructive focus-visible:ring-destructive` (I, T) vs `border-destructive focus:ring-destructive` (S) — `focus:` where the rest of the baseline uses `focus-visible:`.
- Required marker: present (I, S), absent entirely (T) — `TextareaField` has no `required` affordance.

Two `src/components/ui/` fields are on the same pattern and stop even earlier: `ColorField` (`color-field.tsx:54`) and `FileField` (`file-field.tsx:124`) both open with the identical `cn("flex flex-col gap-1.5", className)` + `{label && <Label …>}`, and neither has an error slot or `aria-describedby` at all — so a form that puts a validation error on a colour or file field has nowhere to render it.

The accessibility wiring is the one part these archetypes' own JSDoc calls "the non-negotiable piece the fleet copies all drop". It is currently implemented five times, three ways, in the very primitives that exist to stop that happening.

## What to do

- [ ] Add a shared field frame under `src/components/layout/` or `src/components/archetypes/shared/` — a `FieldFrame` component (wrapper + `Label` + required marker + hint + error) plus a `useFieldIds({ id, hint, error })` helper returning `{ fieldId, describedBy, invalid }`, so the id scheme and `aria-describedby` join exist once.
- [ ] Pick one prop vocabulary and one type scale for hint/error across all field assemblies; migrate `TextareaField`'s `helperText` / `wrapperClassName` to it, keeping deprecated aliases only if a consumer contract requires them.
- [ ] Fix `SelectField`'s `focus:ring-destructive` to the baseline's `focus-visible:` form as part of moving the error ring into the shared frame.
- [ ] Give `TextareaField` the `required` marker it currently lacks, for free, by composing the frame.
- [ ] Refactor `NativeField`, `SelectField` and `TextareaField` to compose the frame and keep only their control-specific bodies (the range slider + prefix logic, the Radix `aria-labelledby` trigger wiring, the char counter + mono variant).
- [ ] Extend `ColorField` and `FileField` to compose the same frame so they gain the hint/error slots and `aria-describedby` wiring.
- [ ] Extend the existing `native-field.test.tsx`, `select-field.test.tsx` and `TextareaField.test.tsx` with a shared assertion set: label association, `aria-invalid` on error, and `aria-describedby` naming both the hint and the error node.
- [ ] Bump the `raw-input`, `raw-select` and `raw-textarea` `version`s in `docs/archetypes/MANIFEST.json`.

## Acceptance

- `grep -rn "flex flex-col gap-1.5" src/components` shows the wrapper in one place, not five.
- The required-marker span and the `${id}-hint` / `${id}-error` derivation each appear exactly once in `src/components`.
- `grep -rn "focus:ring-destructive" src/components` returns no hits — every error ring is `focus-visible:`.
- A test shows `TextareaField` renders the required marker and that `ColorField` given an `error` sets `aria-invalid` and links the error node via `aria-describedby`.
- Hint and error on all five field assemblies render at the same type scale and follow the same coexistence rule.
- `npx tsc --noEmit` and `npm test` pass, and every field demo in `src/examples/` renders unchanged apart from the intended `TextareaField` scale/marker correction.

## Related

- [refactor-mode-aware-footer-core-duplication.md](archive/refactor-mode-aware-footer-core-duplication.md) — the same shape of finding one layer up (two footers, one core), and the precedent for landing the extraction under `src/components/archetypes/shared/`.
- [use-form-field-provider-guard.md](archive/use-form-field-provider-guard.md) — prior work on the form-field accessibility contract these assemblies sit under.
- [docs/adr/0004-appearance-locality-derived-vs-inherited.md](../adr/0004-appearance-locality-derived-vs-inherited.md) — a hint rendered at `text-sm` in two fields and `text-xs` in a third is exactly the inherited-not-derived appearance the rule forbids.
- [src/components/ui/color-field.tsx](../../src/components/ui/color-field.tsx) — the field assembly with no error slot at all, which the shared frame fixes for free.
