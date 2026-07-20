---
area: ui
opened: 2026-07-04
status: done
model: sonnet
model_reason: reorder guard + null default context, small mechanical fix with clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Make the useFormField provider guard actually fire before dereferencing context

## Context

Severity: **low** (error handling). In the shipped shadcn `form` primitive, `useFormField`'s guard `if (!fieldContext) throw new Error("useFormField should be used within <FormField>")` is placed AFTER `getFieldState(fieldContext.name, formState)` has already dereferenced `fieldContext.name` (`src/components/ui/form.tsx:47,49`). Worse, `FormFieldContext` is created with a default value of `{} as ...` (`form.tsx:25`), so `fieldContext` is never falsy — the guard is dead code that can never throw. The intended developer-experience failure (a clear "use within <FormField>" error) instead surfaces as a confusing `undefined`-access crash or silent wrong behavior. Ships in a `ui/` donor primitive used by every form.

## What to do

- [ ] Do red/green TDD: add a failing test (introduce `vitest` + `@testing-library/react`; the repo is typecheck-only today) asserting that calling `useFormField` outside a `<FormField>` throws the intended "should be used within <FormField>" error (currently it does not); then make it pass.
- [ ] Change the default of `FormFieldContext` (and the matching `FormItemContext`) from `{} as ...` to `null` (form.tsx:25) so absence is detectable.
- [ ] Move the `if (!fieldContext) throw ...` guard above the first dereference, before `getFieldState(fieldContext.name, ...)` (form.tsx:47-49); apply the same to the item-context guard.

## Acceptance

- Calling `useFormField` outside `<FormField>` throws the clear provider error before any `fieldContext.name` dereference — the guard is live, not dead.
- Normal in-provider usage is unchanged.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- src/components/ui/form.tsx — the primitive to fix
- docs/STYLE.md — form primitive conventions
