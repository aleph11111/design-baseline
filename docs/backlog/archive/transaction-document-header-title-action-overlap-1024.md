---
area: layout
opened: 2026-11-24
status: done
value: normal
model: opus
model_reason: "cause not established (title block is min-w-0 yet its first line paints past the action box); diagnosis is part of the work"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-24T00:00:00Z
---

# Transaction-document header title overlaps action button at 1024px

## Context

At a 1024x739 desktop context (check:viewports sweep 1024), the `transaction-document` demo, default and 'Sales order' variants, wraps the long `h1` title to 3 lines. The first line paints text out to x=825 while the static (non-overlay) 'Print packing slip' action button box starts at x=803, so the button paints over the title tail: a 22px genuine `textOverlap` (`elementFromPoint` over x=803..824 at y=215 returns BUTTON). At 1133px the title row has room and the button is clean. Verified in real Chrome, not a check artifact. The `textOverlap` invariant (v0.65.0, `src/testing/invariants.mjs`) reports `textOverlap: <h1 ...> and <button "Print packing slip"> overlap`, and the donor's `check:viewports` records it as the `SWEEP_GAPS` entry `transaction-document@1024:textOverlap` (`scripts/check-viewports.mjs`).

The shell renders its header through `PageFrame` into `HeadingRow` (`src/components/layout/HeadingRow.tsx`): `HEADING_ROW_CLASSES.row` is `flex-col` below the row's `@xl` container width and `@xl:flex-row @xl:items-start @xl:justify-between` above it, with the title block `min-w-0` and the title/badges line `flex flex-wrap items-center gap-x-3 gap-y-2` (`TransactionDocumentShell.tsx` passes `DocumentId` and status badges as `badges`). The reporter's fix direction names that `flex-wrap gap-x-3` line, but that line holds the h1 and badges, not the actions. Which of the two is at fault (the row's `@xl` switch point against the sidebar-narrowed content column at 1024, or an unbreakable title token overflowing the `min-w-0` block) is not established by the report.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Reproduce in real Chrome at 1024 (build the gallery, open the transaction-document demo) and measure the title block width, the actions box x and the title's scrollWidth to name the single mechanism behind the 22px overlap.
- [ ] Fix at the mechanism: if it lives in `HEADING_ROW_CLASSES`, change the shared row so no archetype's header can overlap its actions (every `PageFrame` consumer routes through `HeadingRow`); a transaction-document-only override is acceptable only when the cause is specific to its `badges`/`DocumentId` content.
- [ ] Remove the `transaction-document@1024:textOverlap` entry from `SWEEP_GAPS` in `scripts/check-viewports.mjs` once the sweep passes at 1024 for the default and 'Sales order' variants.
- [ ] Bump `package.json` version and add the `CHANGELOG.md` entry (consumer: none required; breaking: no).

## Acceptance

- The `check:viewports` sweep at 1024 reports no `textOverlap` for `transaction-document`, default and 'Sales order' variants, with no `SWEEP_GAPS` entry left for it.
- At 1024, `elementFromPoint` across the header title's painted text returns the h1, not the action button, in every variant.
- No other kind:page archetype demo reports a `textOverlap` between its header title and header actions at 1024, 1133 or the other sweep widths after the change.
- The header is unchanged at 1133px and wider: title row and actions keep their current placement.

## Related

- [[page-header-actions-squeeze-title-on-phones]] — shipped the `@xl` stacking on the shared `HeadingRow`
- [[transaction-document-ledger-header-and-actions-row-compact]]
- [[transaction-doc-compact-offset-wide-only]]
- [[device-triad-narrow-laptop-width-sweep]]
- [[progress-tracker-long-label-overlap]]
