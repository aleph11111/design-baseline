---
area: archetypes
opened: 2026-07-04
status: done
model: sonnet
model_reason: port an existing prop (submittingLabel) from the sibling FormPageActions, clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Give CrudDialogFooter a localizable submitting label instead of English morphology

## Context

Severity: **medium** (i18n / UX). `CrudDialogFooter` derives its in-flight button text by string surgery on the primary label: `${primaryLabel.replace(/e$/, "")}ing…` (`src/components/archetypes/crud-dialog/CrudDialogFooter.tsx:88-91`), with no override prop. That heuristic only produces correct output for the exact English words "Save"→"Saving…" / "Create"→"Creating…". The `primaryLabel` it receives is `controller.primaryLabel`, which the crud-dialog API explicitly documents as localizable via `CrudDialogLabels` — so a German consumer passing "Speichern" gets the mangled "Speicherning…". The sibling primitive `FormPageActions` already solved this: it exposes a `submittingLabel` prop precisely so non-English consumers avoid mangled output and documents the failure case. `CrudDialogFooter` is the inconsistent twin.

## What to do

- [ ] Do red/green TDD: add a failing test (introduce `vitest` + `@testing-library/react`; the repo is typecheck-only today) asserting that with `submittingLabel="Speichern…"` and `isSubmitting`, the footer renders exactly "Speichern…" (not "Speicherning…"); then make it pass.
- [ ] Add an optional `submittingLabel?: string` to `CrudDialogFooterProps` and use it in preference to the derivation (`submittingLabel ?? <english-fallback>`), matching `FormPageActions` (`src/components/archetypes/crud-dialog/CrudDialogFooter.tsx:88`).
- [ ] Forward the label from the controller's `labels` (add a `saving`/`creating` entry to `CrudDialogLabels` that the controller passes through), so the whole flow is localizable end-to-end.
- [ ] Keep the `replace(/e$/, "")` derivation only as the English default fallback.

## Acceptance

- Passing a non-English `submittingLabel` renders it verbatim; the footer no longer mangles localized primary labels into invalid gerunds.
- `CrudDialogFooter`'s submitting-label contract matches `FormPageActions` (DRY — one shared idiom).
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- [crud-dialog-delete-in-flight-state.md](crud-dialog-delete-in-flight-state.md) — sibling CrudDialogFooter parity gap
- src/components/archetypes/form-page/FormPageActions.tsx — the hardened twin (submittingLabel) to mirror
- docs/archetypes/crud-dialog.md — the localizable-labels contract
