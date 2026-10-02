---
area: archetype-rollout
opened: '2026-10-02'
status: done
value: normal
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-10-02T00:00:00.000Z'
---

# Audit FormPageActions consumers for the inset contract

## Context

`FormPageActions` ([src/components/archetypes/form-page/FormPageActions.tsx](/src/components/archetypes/form-page/FormPageActions.tsx)) used to bleed a fixed `-mx-6` on mobile. PR #419 changed the sticky bar to bleed by `--form-inset` (0 when unset); surfaces publish it via the exported `FORM_INSET_CLASS`. A consumer that places `FormPageActions` inside a padded container (for example a default shadcn `CardContent` at `p-6`) relied on the old fixed bleed and now gets an inset bar on mobile.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Find every in-repo and fleet consumer that renders `FormPageActions` inside a padded surface other than `FormPageShell`'s board body.
- [ ] Switch each such surface to `FORM_INSET_CLASS` (or an equivalent that sets `--form-inset` to its padding).

## Acceptance

- Every `FormPageActions` consumer's sticky bar spans its surface edge to edge at 375px.
- No other consumer places `FormPageActions` in a padded container without publishing `--form-inset`.

## Related

- [[archetype-rollout-form-page-sticky-footer-misaligned-on-mobile]]
- [docs/archetypes/form-page.md](/docs/archetypes/form-page.md)
