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

- [x] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [x] Find every in-repo and fleet consumer that renders `FormPageActions` inside a padded surface other than `FormPageShell`'s board body.
- [x] Switch each such surface to `FORM_INSET_CLASS` (or an equivalent that sets `--form-inset` to its padding).

## Acceptance

- Every `FormPageActions` consumer's sticky bar spans its surface edge to edge at 375px.
- No other consumer places `FormPageActions` in a padded container without publishing `--form-inset`.

## Related

- [[archetype-rollout-form-page-sticky-footer-misaligned-on-mobile]]
- [docs/archetypes/form-page.md](/docs/archetypes/form-page.md)

## Audit result (2026-10-02)

`git grep FormPageActions` over the repo (excluding backlog/audits) lists every in-repo caller:

| Consumer | Surface | Verdict |
|---|---|---|
| `src/examples/form-page-demo.tsx` | board (`FormPageShell` body) / classic (unpadded) / Card chrome (`CardContent className={FORM_INSET_CLASS}`) | OK, already published |
| `templates/form-page.tsx` | `FormPageShell title=…` board body | OK |
| `.design-sync/previews/FormPageActions.tsx`, `FormPageHeader.tsx` | board body / unpadded `space-y-4` div | OK |
| `.design-sync/previews/FormPageShell.tsx` board cells | board body | OK |
| `.design-sync/previews/FormPageShell.tsx` `ClassicWithCard` | `p-5` card, no `--form-inset` | **fixed** → `FORM_INSET_CLASS` |

`FORM_INSET_CLASS` = `p-[var(--form-inset)] [--form-inset:1.25rem]` (`FormPageShell.tsx:23`): it applies the padding AND publishes the variable; 1.25rem = the old `p-5`, so spacing is unchanged. The bar sits inside that div, so it now bleeds to the card edge.

Fleet consumers are out of scope for the donor: they pick the change up via the package and self-heal from their own project sessions (playbook), and this repo never writes to them.
