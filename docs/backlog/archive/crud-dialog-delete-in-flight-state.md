---
area: archetypes
opened: 2026-07-04
status: ready
model: sonnet
model_reason: mirror FormPageActions' isDeleting/disabled handling, clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Give the CrudDialogFooter delete button an in-flight state and disable it during save

## Context

Severity: **medium** (UX / correctness). `CrudDialogFooter` renders the destructive Delete button with only an `onClick` — no `isDeleting` spinner, no `disabled`, and it is not gated on `isSubmitting` (`src/components/archetypes/crud-dialog/CrudDialogFooter.tsx:102-110`; `CrudDialogFooterProps` at lines 10-41 has no `isDeleting`). So during a save the Delete button stays fully live, and during a delete it shows no progress and can be double-clicked. Its sibling `FormPageActions` — documented as the identical footer layout — disables the destructive button with `disabled={isDeleting || isSubmitting}` and shows a `Loader2` while deleting. This is a parity gap in a donor primitive that ships into every adopting app: a user can fire delete mid-save (racy, data-inconsistent) or double-submit a delete.

## What to do

- [ ] Do red/green TDD: add a failing test (introduce `vitest` + `@testing-library/react`; the repo is typecheck-only today) asserting the Delete button is `disabled` when `isSubmitting` and when `isDeleting`, and renders a spinner while `isDeleting`; then make it pass.
- [ ] Add `isDeleting?: boolean` to `CrudDialogFooterProps` (`CrudDialogFooter.tsx:10-41`).
- [ ] Disable the destructive button with `disabled={isDeleting || isSubmitting}` and render a `Loader2` when `isDeleting`, matching `FormPageActions` (`CrudDialogFooter.tsx:102-110`).

## Acceptance

- The Delete button is disabled while a save is in flight and while a delete is in flight, and shows a spinner during delete — it can no longer be fired mid-save or double-clicked.
- `CrudDialogFooter`'s destructive-button behavior matches `FormPageActions` (DRY parity).
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- [crud-dialog-footer-submitting-label.md](crud-dialog-footer-submitting-label.md) — sibling CrudDialogFooter parity gap
- src/components/archetypes/form-page/FormPageActions.tsx — the reference behavior to mirror
- docs/archetypes/crud-dialog.md — the archetype footer contract
