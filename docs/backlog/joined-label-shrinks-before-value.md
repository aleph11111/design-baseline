---
area: layout
opened: 2026-10-09
status: ready
value: normal
depends_on: [pageframe-toolbar-overflow-collapse-rule]
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-09T00:00:00Z
---

# Joined toolbar label shrinks before the control value

## Context

PR #514 (`pageframe-toolbar-overflow-collapse-rule`) shipped the desktop 4-field cap and filter-sheet collapse in `src/components/layout/PageFrame.tsx` but deliberately left out the second half of that ticket: in a joined-label control the label cell should give way before the value truncates (`Statu…`, `Se…`). `JOINED_LABEL_CLASS` in `src/components/ui/toolbar-band.tsx` is `shrink-0`, so the label never yields. The review gate rejected every in-PR attempt: `shrink-[4]` only weights the flex split (the value still absorbs part of the cut); `text-ellipsis` is inert on the label's `flex` container (wrap the text in a `truncate` span instead); field roots need `min-w-0` or they never shrink in the `flex-nowrap` band; and the value box needs `shrink-0` scoped to joined selects only, so fixed-width unlabeled selects (e.g. `w-44`) still clamp. The mobile sheet pins the label column with `[&_[data-joined-label]]:w-[130px]` and that column must stay fixed. The desktop band is `flex-nowrap`, so it can also overflow between `md` and wide desktop.

## What to do

- [ ] Make the joined label yield before the control value: label cell shrinks (real ellipsis via an inner `truncate` span), value box does not shrink while a joined label is present, field roots carry `min-w-0` — fix in the shared `JOINED_LABEL_CLASS` / `SelectTrigger` / `SegmentedControl` / `NativeField` paths, not per consumer.
- [ ] Keep the mobile filter sheet's 130px `data-joined-label` column fixed and keep unlabeled fixed-width selects clamping their value.
- [ ] Decide and handle the `PageFrame` desktop band overflow between `md` and wide desktop without clipping focus rings (a bare `overflow-x:auto` clips them).
- [ ] Add a gallery demo in `gallery/layout-demos.tsx` showing a crowded band at 430px and at 1440px.
- [ ] Add a real-Chrome check (jsdom cannot measure layout), modelled on `npm run check:desk-width`, asserting label truncation with the value fully visible at both widths.

## Acceptance

- At 1440px and 430px a joined-label control shows its full value while the label truncates with an ellipsis; no value renders clipped (`Statu…`).
- The mobile filter sheet label column is unchanged at 130px for every row.
- No joined-label control (select, segmented control, native field) keeps a label that refuses to shrink; every similar call site routes through the shared class.
- The browser check fails when the label is made `shrink-0` again and passes with the fix.
- `npx tsc --noEmit` and `npm test` stay green, and a CHANGELOG entry exists for the version bump.

## Related

- [[pageframe-toolbar-overflow-collapse-rule]] — shipped the cap + collapse; this is its deferred second criterion.
- [[pageframe-filter-sheet-stacks-nested-fields]] — same sheet and joined-label column.
- [docs/STYLE.md "Toolbar field labels"](/docs/STYLE.md) — joined-label rule this completes.
- [src/components/ui/toolbar-band.tsx](/src/components/ui/toolbar-band.tsx) — `JOINED_LABEL_CLASS`.
