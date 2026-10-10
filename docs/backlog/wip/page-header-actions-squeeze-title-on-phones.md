---
area: layout
opened: 2026-10-10
status: ready
value: normal
model: sonnet
model_reason: "scoped responsive-class change on one shared row constant plus test, demo and version bump; cause is established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-10T10:00:00Z
---

# PageHeader actions squeeze the title on phones

## Context

`HEADING_ROW_CLASSES.row` in `src/components/layout/HeadingRow.tsx` is `flex items-start justify-between gap-4` and the actions wrapper is `flex shrink-0 items-center gap-3`, so at every width the actions keep their full size and the `min-w-0` title block gets whatever is left. At 430px with two buttons beside a long title, the title and subtitle collapse into a one-word-per-line column next to the buttons (controlling-app Planung and Internes Reporting, 2026-10-10 final visual check). `PageHeader` and `NestedPageHeading` both render through `HeadingRow`, and every shell reaches `PageHeader` through `PageFrame` (ADR-0008), so the fix belongs in the shared row constant.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `HEADING_ROW_CLASSES` (`src/components/layout/HeadingRow.tsx`), make `row` stack below `sm` (`flex-col`, back to `sm:flex-row sm:items-start sm:justify-between`) and let `actions` wrap below `sm` (`flex-wrap`), so the title keeps the full width on phones. Stacking is a class change only: no new prop and no JS, matching the fixed-in-component rule of ADR-0004 and the stack-below-breakpoint precedent in [[key-value-row-stack-below-md]]. An overflow menu is not part of this ticket.
- [ ] Add a `PageHeader.test.tsx` case with a long title and two actions asserting the stacking classes on the row, and check `NestedPageHeading` inherits them.
- [ ] Add a gallery demo case (long title, subtitle, two actions) that renders at a 430px viewport, and confirm it in real Chrome at 430 and at `sm` and above.
- [ ] Bump `package.json` version and add the `CHANGELOG.md` entry (consumer: none required, controlling-app drops any local workaround; breaking: no).

## Acceptance

- At 430px a `PageHeader` with a long title, a subtitle and two actions shows the title and subtitle at full row width with the actions beneath, not a one-word-per-line column.
- At `sm` and above the header renders unchanged: title left, actions right-aligned on the same row.
- Every `HeadingRow` consumer (`PageHeader`, `NestedPageHeading`, and every shell through `PageFrame`) stacks below `sm`; no other call site keeps the side-by-side row on phones.
- `npm test` fails on a version bump without a `CHANGELOG.md` entry, and passes after the entry is added.

## Related

- [[key-value-row-stack-below-md]] — the stack-below-breakpoint precedent for a row that squeezed its text
- [[page-header-block-subtitle-content]] — the last change to this same subtitle/row markup
- [[pageframe-toolbar-overflow-collapse-rule]] — the overflow-collapse alternative the report mentions
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — fixed in the component, no appearance prop
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — every shell reaches `PageHeader` through `PageFrame`
