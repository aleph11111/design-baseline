---
area: test-gap
opened: 2026-11-04
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-04T00:00:00Z
---

# useFormPageState hook has no test coverage

## Context

`src/components/archetypes/form-page/useFormPageState.ts` (120 lines) is a shipped hook exported via `design-baseline/archetypes/form-page`, and has zero tests; the only mentions are string references in `scripts/scan-adoption-quality.test.mjs`. The form-page folder saw ~21 commits in the last 90 days. Untested behaviour: `requestDiscard()` returns true without prompting when `!isDirty` or no `onConfirmDiscard` is given, otherwise resolves with the callback's result (the unsaved-edits data-loss guard); `beginSubmit`/`endSubmit` toggle `isSubmitting`; `isCreate`/`isEdit` derive from `mode`.

## What to do

- [ ] Add `src/components/archetypes/form-page/useFormPageState.test.tsx` using `renderHook`, following the pattern in `src/components/archetypes/crud-dialog/useCrudDialogController.test.tsx` (≥2 existing hook-test call sites in the crud-dialog folder).
- [ ] Cover `requestDiscard`: resolves true without calling `onConfirmDiscard` when not dirty; resolves true when dirty but no `onConfirmDiscard`; when dirty, resolves with the callback's result for both true and false (sync and async callbacks).
- [ ] Cover `beginSubmit`/`endSubmit` flipping `isSubmitting`, and `isCreate`/`isEdit`/`isDirty` mirroring `mode` and the input.
- [ ] Name tests after the acceptance wording below.

## Acceptance

- `useFormPageState.test.tsx` exists and passes under `npm test`.
- `requestDiscard` returns true without invoking `onConfirmDiscard` when `isDirty` is false.
- `requestDiscard` returns false when dirty and `onConfirmDiscard` resolves false.
- A test fails if the `isDirty` early-return is inverted, or if a false confirm result is ignored.
- `isSubmitting` is true after `beginSubmit` and false again after `endSubmit`; `isCreate`/`isEdit` match `mode`.

## Related

- [[test-gap-form-page-shell-no-tests]] — sibling shell test gap in the same folder, already shipped
- [useCrudDialogController.test.tsx](/src/components/archetypes/crud-dialog/useCrudDialogController.test.tsx) — renderHook pattern to follow
- [useFormPageState.ts](/src/components/archetypes/form-page/useFormPageState.ts) — hook under test
