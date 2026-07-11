---
area: refactor
opened: 2026-07-11
status: ready
model: opus
model_reason: extracting a shared footer core across two archetypes' reference primitives touches two versioned contracts (J crud-dialog, B form-page) and needs judgment on how much to unify vs keep archetype-specific
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-11T00:00:00Z
---

# Extract a shared mode-aware footer core behind CrudDialogFooter and FormPageActions

## Context

Severity: **medium** (DRY). Two archetype reference primitives — `CrudDialogFooter` (J, `src/components/archetypes/crud-dialog/CrudDialogFooter.tsx`) and `FormPageActions` (B, `src/components/archetypes/form-page/FormPageActions.tsx`) — are near-identical copies of the same "mode-aware footer" pattern. Both expose the same prop set (`primaryLabel` / `onPrimary` / `primaryDisabled` / `isSubmitting` / `submittingLabel` / `isDeleting` / `secondaryLabel` / `onSecondary` / `destructiveLabel` / `onDestructive` / `overflowMenu`), both render the identical layout `[destructive (left)] … [overflowMenu][secondary][primary]`, both use the identical destructive-button styling (`text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive`, confirmed duplicated by grep), the identical `<Loader2>` spinner treatment, and — most tellingly — the byte-identical English submitting-label morphology `${primaryLabel.replace(/e$/, "")}ing…`, which is triplicated: `CrudDialogFooter.tsx:109`, `FormPageActions.tsx:140`, and again in `useCrudDialogController.ts:169`. The only real differences are B's extra `mode` / `canDelete` / `stickyOnMobile` affordances and the container class (sticky-on-mobile vs `border-t px-6 py-4`). Because the shared core is copy-pasted, a fix to the footer button contract (the localizable-label work in `crud-dialog-footer-submitting-label`, the delete-in-flight work in `crud-dialog-delete-in-flight-state`) has to be applied twice and the two footers will drift apart.

## What to do

- [ ] Extract a shared footer core into `src/components/archetypes/shared/` (e.g. `ActionFooterBar` rendering the destructive-left / overflow-secondary-primary button group + spinner + resolved submitting label) that both `CrudDialogFooter` and `FormPageActions` compose.
- [ ] Move the `${label.replace(/e$/, "")}ing…` submitting-label derivation into a single shared helper and have all three current sites (`CrudDialogFooter`, `FormPageActions`, `useCrudDialogController`) call it — eliminating the triplication.
- [ ] Keep each archetype's distinct surface: B's `mode` / `canDelete` gating and `stickyOnMobile` container, J's `border-t px-6 py-4` container, stay in the thin per-archetype wrapper; only the shared button-group core is extracted.
- [ ] Preserve both prop contracts exactly (documented in `docs/archetypes/crud-dialog.md` / `form-page.md`); no consumer-facing prop change. Extend the existing `CrudDialogFooter.test.tsx` and add a matching `FormPageActions` test proving both still render destructive/secondary/primary and the submitting label through the shared core.
- [ ] Bump the `crud-dialog` and `form-page` `version`s in `docs/archetypes/MANIFEST.json` for downstream `/promote-archetype --update`.

## Acceptance

- The destructive-button classes and the `replace(/e$/, "")` submitting-label derivation each appear exactly once in `src/components` (grep shows a single definition, not three).
- `CrudDialogFooter` and `FormPageActions` both render through the shared footer core; their documented prop contracts are unchanged and no consumer needs an edit.
- `npm test` (including the crud-dialog + new form-page footer tests) and `npx tsc --noEmit` pass.
- Meets the SOLID/DRY/KISS quality bar with no new lint/type/test failures.

## Related

- [crud-dialog-footer-submitting-label.md](archive/crud-dialog-footer-submitting-label.md) — the localizable-label fix that currently has to be applied per-footer; this extraction makes it one edit.
- [crud-dialog-delete-in-flight-state.md](archive/crud-dialog-delete-in-flight-state.md), [crud-dialog-discard-confirm-split.md](archive/crud-dialog-discard-confirm-split.md) — sibling crud-dialog footer work.
- `docs/archetypes/crud-dialog.md`, `docs/archetypes/form-page.md` — the two prop contracts the shared core must preserve.
