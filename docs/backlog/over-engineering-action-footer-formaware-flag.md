---
area: over-engineering
opened: '2026-08-26'
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
  graded_at: '2026-08-26T17:17:19.291Z'
model: sonnet
model_reason: >-
  one prop deleted and three ternaries collapsed, but it changes submit semantics of real buttons —
  needs a test per button type, not a blind edit
---

# Delete the formAware flag from the shared action-footer primitive

## Context

`src/components/archetypes/shared/ActionFooterBar.tsx` is the shared footer core behind `CrudDialogFooter` (J) and `FormPageActions` (B), extracted by `archive/refactor-mode-aware-footer-core-duplication.md`. It carries a boolean `formAware` prop that exists only to thread one caller's context into three button `type` attributes:

```tsx
<Button type={formAware ? "button" : undefined} …>            {/* destructive */}
<Button type={formAware ? "button" : undefined} …>            {/* secondary  */}
<Button type={formAware ? (onPrimary ? "button" : "submit") : undefined} …>
```

There are exactly two call sites and they sit at opposite ends of the flag. `FormPageActions.tsx:152` passes `formAware`; `CrudDialogFooter.tsx` passes nothing and documents why in a comment — *"buttons carry no form `type` (dialog, not a form)"*.

That justification does not survive inspection. `type={undefined}` on a `<button>` does not mean "no type" — HTML defaults an untyped button inside a form to `type="submit"`. So the crud-dialog branch is not choosing safety, it is choosing the browser default and relying on the dialog happening not to wrap a `<form>`. The `formAware` branch, meanwhile, is the correct behaviour for *both* cases: `type="button"` on a destructive or secondary action is right in a dialog too, and the primary's `onPrimary ? "button" : "submit"` rule already degrades correctly when there is no form to submit — a `type="submit"` button outside a form is inert, and every crud-dialog primary passes `onPrimary` (`useCrudDialogController` returns `handlePrimary` for it), so it lands on `"button"` either way.

Deleting the flag replaces one prop, one doc comment, three ternaries and one branch of the wrapper contract with three unconditional `type` attributes. It also removes a latent bug class: if any consumer ever renders `CrudDialogSheet` content inside a `<form>` — which the react-hook-form pattern the J archetype mandates makes likely — the untyped destructive button becomes a submit button and a "Delete" click submits the form.

Deliberately out of scope: the sibling flag `disableActionsWhileDeleting`. That one encodes a genuine, documented behavioural difference between the two archetypes (B freezes the whole footer during a delete, J only the destructive button), so it stays.

## What to do

- [ ] Set `type="button"` unconditionally on the destructive and secondary buttons in `ActionFooterBar.tsx` and `type={onPrimary ? "button" : "submit"}` on the primary.
- [ ] Delete the `formAware` prop from `ActionFooterBarProps` and its destructuring/default, and remove the `formAware` prop from the `FormPageActions.tsx` call site.
- [ ] Update the wrapper comments in `CrudDialogFooter.tsx` and `FormPageActions.tsx` that explain the flag, so neither still describes a prop that no longer exists.
- [ ] Add a test asserting each of the three rendered buttons carries the expected `type` attribute in both wrappers, so the collapsed behaviour is pinned rather than inferred.
- [ ] Check `docs/archetypes/crud-dialog.baseline.md` and `form-page.baseline.md` for a `formAware` mention and drop it; the stack-agnostic `crud-dialog.md` / `form-page.md` contracts must not name the prop either way (RULES.md hard rule 3).

## Acceptance

- `grep -rn "formAware" src docs` returns no matches.
- `<CrudDialogFooter>`'s rendered destructive and secondary buttons show `type="button"`, and its primary shows `type="button"` whenever `onPrimary` is supplied — asserted in `CrudDialogFooter.test.tsx`.
- `<FormPageActions>`'s buttons render the same `type` attributes as before the change, and its primary still submits the surrounding native `<form>` when no `onPrimary` is passed.
- Clicking the destructive button inside a crud-dialog rendered within a `<form>` no longer submits that form.
- `npx tsc --noEmit` and `npm test` pass.

## Related

- [archive/refactor-mode-aware-footer-core-duplication.md](archive/refactor-mode-aware-footer-core-duplication.md) — the extraction that created `ActionFooterBar` and introduced the flag as the seam between the two archetypes.
- [archive/crud-dialog-delete-in-flight-state.md](archive/crud-dialog-delete-in-flight-state.md) — the work behind the sibling flag `disableActionsWhileDeleting`, which this ticket deliberately keeps.
- [src/components/archetypes/shared/ActionFooterBar.tsx](../../src/components/archetypes/shared/ActionFooterBar.tsx) — the primitive carrying the flag.
