---
area: archetypes
opened: 2026-07-04
status: done
model: sonnet
model_reason: scoped controller refactor to a single injectable guard, clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Unify the crud-dialog discard guard so close and cancel share one injectable confirm

## Context

Severity: **medium** (correctness / UX consistency). `useCrudDialogController` guards the same "unsaved changes" concern with two different mechanisms in one dialog. `handleClose` (the X / close-while-dirty path) reads `form.formState.isDirty` and calls the module-level `confirmDiscard(labels.discardPrompt)` — a synchronous `window.confirm` (`src/components/archetypes/crud-dialog/useCrudDialogController.ts:118`; `confirmDiscard` in `crudStrings.ts:20`). But the edit→view cancel path routes through `mode.setMode("view")`, which invokes the consumer-supplied `onConfirmDiscard` (`useCrudDialogMode.ts:85`). The controller options (`UseCrudDialogControllerOptions`) expose only `labels.discardPrompt`, never an `onConfirmDiscard`, so a consumer who wires the recommended shadcn `<AlertDialog>` via the mode hook gets that nice dialog on **Cancel** but a raw browser `window.confirm` on **X/Esc/backdrop** — two confirmation UIs in one flow, with no supported way to make the close path use the AlertDialog. The sibling `form-page/useFormPageState.ts` routes its dirty-close guard consistently through one `onConfirmDiscard`, and `crud-dialog.md` forbids reimplementing `handleClose` inline — so the split is not fixable by consumers.

## What to do

- [ ] Do red/green TDD: add a failing test (stand up `vitest` + `@testing-library/react`, the repo is typecheck-only today) that renders the controller with a custom `onConfirmDiscard`, marks the form dirty, and asserts BOTH the close path and the edit-cancel path call that injected confirm (not `window.confirm`); then make it pass.
- [ ] Add an optional `onConfirmDiscard?: () => Promise<boolean> | boolean` to `UseCrudDialogControllerOptions` and have `handleClose` await it, falling back to `confirmDiscard` only when it is unset (`useCrudDialogController.ts:116-121`).
- [ ] Route both exit paths through that single guard so `handleClose` and the `mode`-owned edit→view transition share one confirm mechanism (align with `useFormPageState.ts:96-107`).
- [ ] Derive `isDirty` from one source across both paths (currently `handleClose` reads `form.formState.isDirty` directly while the mode path is separate) so the two paths cannot disagree.

## Acceptance

- With a consumer-supplied `onConfirmDiscard`, closing a dirty dialog via X/Esc/backdrop no longer shows `window.confirm` — it uses the same confirm as edit→cancel.
- The controller exposes exactly one discard-confirm seam and one `isDirty` source; the two exit paths are provably consistent under test.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- [decouple-archetype-contract-from-reference-impl.md](archive/decouple-archetype-contract-from-reference-impl.md) — crud-dialog archetype split
- docs/archetypes/crud-dialog.md — the archetype contract that forbids inlining handleClose
- src/components/archetypes/form-page/useFormPageState.ts — the consistent single-guard sibling to mirror
