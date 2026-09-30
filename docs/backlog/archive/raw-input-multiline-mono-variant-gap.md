---
area: archetypes
opened: '2026-09-28'
status: done
value: low
model: sonnet
model_reason: "one-line JSDoc pointer on an established delegation; no design choice left"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T00:00:00Z'
---

# Document TextareaField as the mono path for NativeField multiline callers

## Context

PR #319 routed `NativeField`'s `multiline` branch (`src/components/archetypes/raw-input/native-field.tsx`) through `TextareaField` (`src/components/archetypes/raw-textarea/TextareaField.tsx`). The counter now comes along with it, but `mono`, the code/JSON variant, does not: `NativeFieldProps` has no `mono` prop. A multi-line caller that needs monospace text has to switch to `TextareaField`. No in-repo caller uses `NativeField multiline` with mono (a grep of `src/examples` and `src/components/archetypes` finds `mono` only in raw-textarea's own demo). Forwarding the prop would be speculative, so the gap is closed with documentation.

## What to do

- [x] Extend the `multiline` JSDoc on `NativeFieldProps` to say that the code/JSON `mono` variant is reached by using `TextareaField` directly.
- [x] Do not add a `mono` prop to `NativeField` until a real consumer needs one. When one does, forward it at the single `TextareaField` delegation point.

*(Shipped: the `multiline` JSDoc names `TextareaField` as the mono path; no new prop.)*

## Acceptance

- The `multiline` JSDoc in `native-field.tsx` names `TextareaField` as the mono path.
- `NativeFieldProps` is unchanged, with no new prop.
- `npx tsc --noEmit` and `npm test` pass unchanged.

## Related

- [[refactor-native-field-multiline-second-textarea-owner]]: the delegation this follows up on (PR #319 reviewer follow-up).
