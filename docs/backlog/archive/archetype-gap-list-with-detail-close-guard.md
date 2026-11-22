---
area: archetypes
opened: 2026-11-22
status: done
value: high
model: opus
model_reason: "adds a veto seam to a shared shell's close path (Escape, backdrop, X, stepping) — a contract/API decision other consumers rely on"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-22T00:00:00Z
---

# List-with-detail gap: a close guard so consumers can veto the detail sheet closing

## Context

`ListWithDetailShell` (`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx:539-542`) closes its detail Sheet itself: the Sheet's `onOpenChange` runs `setSheetOpen(open)` and only afterwards calls `onDetailClose?.()` (prop at line 149). A consumer therefore cannot veto the close (Escape, backdrop click, the built-in X). A detail sheet holding an unsaved draft unmounts and loses it; a consumer "discard unsaved changes?" dialog appears too late.

Evidence: controlling-app ticket `planung-account-sheet-close-discards-unsaved-input` (account sheet on the Planung line page, controlling-app #2594) is blocked on this — its guard dialog and tests are written but fail because the sheet is already unmounted. Per the baseline-ships-first rule the guard ships here, then the consumer bumps its `design-baseline` dependency (no hand-rolled stopgap).

Precedent: `crud-dialog` already requires a dirty-check wrapped around `onClose()` for X / backdrop / Esc (`docs/archetypes/crud-dialog.md`), but there the consumer owns the open state; in `list-with-detail` the shell owns it, so the shell needs the seam.

Decision (the ticket's own first suggestion; a boolean/Promise guard is testable and mirrors crud-dialog's dirty-check; a controlled `detailOpen` pair would be a breaking change for every consumer): one optional prop `onBeforeDetailClose?: () => boolean | Promise<boolean>` — `true`/resolved-`true` lets the close proceed, `false` keeps the sheet open. Default-off; absent prop = today's behaviour.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add `onBeforeDetailClose?: () => boolean | Promise<boolean>` to `ListWithDetailShell`; in the Sheet's `onOpenChange(false)` path, consult it before `setSheetOpen(false)` and before `onDetailClose`; keep the sheet open when it returns/resolves `false`.
- [ ] Route every close trigger through that one path — Escape, backdrop click, the built-in X, and detail stepping (`detailStepping`, line 214 / stepper at line 458) — so a dirty draft is guarded on a step to the next/previous row too.
- [ ] Ignore a second close attempt while a pending async guard is unresolved (no double dialogs).
- [ ] Document the prop in `docs/archetypes/list-with-detail.md` (role-only wording, no Tailwind/primitive names) and bump the contract version (4.11 → 4.12) in the MANIFEST entry.
- [ ] Add a gallery demo in `src/examples/list-with-detail-demo.tsx`: a detail sheet with an editable draft; closing while dirty opens a confirm dialog (discard / keep editing); a clean close passes straight through.
- [ ] Add tests in `ListWithDetailShell.test.tsx` (next to the Esc/`onDetailClose` test at line 467) for Esc, backdrop, X and stepping, each with guard `true`, `false`, and an async promise.
- [ ] Minor package version bump (0.63.0 → 0.64.0 in `package.json`, per the duplicate-version guard).

## Acceptance

- With `onBeforeDetailClose` returning `false`, Escape, backdrop click and the X button each leave the detail sheet mounted and its draft intact, and `onDetailClose` is not called.
- When the guard returns (or resolves) `true`, the sheet closes and `onDetailClose` is called once after it.
- Stepping to the previous/next row consults the same guard; a `false` result keeps the current row selected.
- Every close path goes through the guard — no other close trigger in the shell sets `sheetOpen` false without consulting it.
- Without the prop, behaviour is unchanged: the existing Esc → `onDetailClose` test passes as written.
- The gallery demo shows the dirty-draft confirm dialog, and `npm test` and `npx tsc --noEmit` pass.

## Related

- [[archetype-gap-list-with-detail-bulk-stepping-summary]] — introduced the detail stepping the guard must also cover
- [[archetype-convergence-list-with-detail-close-api]] — closed the shell's prop API; the new prop is a behavioural seam, not an appearance axis
- [[archetype-gap-crud-dialog-wide-width-step]] — most recent archetype-gap precedent for the ship flow
- [list-with-detail contract](/docs/archetypes/list-with-detail.md)
- [crud-dialog contract](/docs/archetypes/crud-dialog.md) — the dirty-close guard pattern to mirror

