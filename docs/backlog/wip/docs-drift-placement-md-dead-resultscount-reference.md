---
area: docs-drift
opened: '2026-08-27'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-27T15:06:30.920Z'
---

# PLACEMENT.md names a ResultsCount component that does not exist in src/

## Context

`docs/PLACEMENT.md` names a component called `ResultsCount` as the mandatory owner of the toolbar's result-count slot in four places:

> Line 88 (table): `| **Result count** | right side | `ResultsCount` |`
> Line 91: "Search is always left. A count is always a `ResultsCount`, never free text."
> Line 188 (anti-pattern list): "Search anywhere but the toolbar's left; a count as free text instead of `ResultsCount`."
> Line 227: "`ResultsCount`, `RowActionsMenu`, `SectionHeading` / `SectionCard`, `CrudDialogFooter` / ..."

`grep -rn "ResultsCount" src/` returns zero hits — no such component exists anywhere in the donor. The toolbar primitive the doc's own placement rules describe, `src/components/archetypes/list-with-detail/ListWithDetailToolbar.tsx`, has no result-count slot or prop at all — its `ListWithDetailToolbarProps` only carries `searchValue`, `onSearchChange`, `searchPlaceholder`, `filters`, `quickFilters`, `pageActions`. This isn't a stale name for a renamed component (no `*Count*` component exists under `src/components/ui/` or `src/components/archetypes/` either) — it's a placement rule pointing an operator at a primitive that was never built, or was planned and never shipped.

An operator following `docs/PLACEMENT.md`'s "green/yellow/red" placement grid to audit a page's toolbar would be told to require a component that doesn't exist, with no way to satisfy the rule as written.

## What to do

- [x] Either build the `ResultsCount` primitive (and wire it into `ListWithDetailToolbar` and any other toolbar that needs a result-count slot) so the doc's rule has a real component behind it, or remove/rewrite the `ResultsCount` references in `docs/PLACEMENT.md` to name whatever the actual owning treatment is (plain text? a different existing molecule?) until one is promoted. **Chosen: rewrite.** The four list-family contracts (list-with-detail Layer 4, settings-table, grouped-list, matrix-grid) all define the count as the canonical muted small-text treatment (`text-sm text-muted-foreground`, `{n} results`) — building a component would contradict the contracts; none of the donor's own demos nor any toolbar primitive renders a count component today.
- [x] Confirm no other archetype's toolbar (settings-table, grouped-list, etc.) already renders a result count some other way, and reconcile the doc with whatever that pattern actually is. **Confirmed.** No count component exists anywhere in `src/`; the pattern across all list-family archetypes is the styled-text treatment rendered by the consumer through the toolbar's `pageActions` slot (A's own `list-with-detail-toolbar-discarded-count` signal describes the conforming render as plain `{count}` interpolation). Reconciled: `docs/PLACEMENT.md` v1.3 table row + paragraph + red line + revision log 1.0 owner list now name the treatment instead of the dead component.

## Outcome

Resolved 2026-08-28 by rewriting `docs/PLACEMENT.md` (v1.2 → v1.3): the result-count slot now names the canonical muted small-text treatment (`text-sm text-muted-foreground`, contract-declared format, via the toolbar's `pageActions` slot) — the treatment every list-family archetype contract already declares — and the red anti-pattern targets the concrete drift (count outside the canonical styling or the toolbar) instead of a ghost component. A 5th occurrence found during the fix — the `list-shell-missing-toolbar` `shouldBe` prose in `docs/audit-signals.json` — was reconciled in the same pass. Acceptance verified: `grep -rn "ResultsCount" docs/PLACEMENT.md src/` → zero hits; `audit-signals.json` parses; donor gates green (vitest 341/341; the `npx tsc --noEmit` red is a pre-existing `@types/node` resolution failure in the shared primary-checkout node_modules — `@types/node` is absent there and the identical 3 errors occur in the primary checkout on a file this diff does not touch; unaffected by this docs-only change, tracked elsewhere). A future real result-count primitive can re-enter the PLACEMENT.md slot's Owner column when/if promoted — the revision log says so.

## Acceptance

- `grep -rn "ResultsCount" docs/PLACEMENT.md src/` shows either a real component backing every doc reference, or the doc no longer names `ResultsCount` at all.

## Related

- [src/components/archetypes/list-with-detail/ListWithDetailToolbar.tsx](../../src/components/archetypes/list-with-detail/ListWithDetailToolbar.tsx) — the toolbar primitive PLACEMENT.md describes, which currently has no result-count slot.
