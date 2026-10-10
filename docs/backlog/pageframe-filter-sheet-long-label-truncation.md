---
area: layout
opened: 2026-10-10
status: needs-enrichment
value: normal
depends_on:
  - native-field-joined-label-sheet-column
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "unresolved fork auto-resolved to Recommended default; confirm before /feat"
  graded_at: 2026-10-10T00:00:00Z
---

# PageFrame filter sheet truncates long German field labels

## Context

In the mobile filter sheet that `PageFrame` builds (`src/components/layout/PageFrame.tsx`, the `data-filter-sheet` container, line ~323), every joined label is pinned to a fixed 130px column (`[&_[data-joined-label]]:w-[130px]`, and `grid-cols-[130px_minmax(0,1fr)_auto]` for button triggers). The label text sits in the shared `truncate` span from `src/components/ui/toolbar-band.tsx`, so a long German compound such as `Inhabergeführt` renders as `Inhabergef…` (hk-sales-agent, 2026-10-10 final visual check). German compound labels are routinely longer than their English counterparts, and the sheet shows one field per row at full width, so there is room to give the label more than one line.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In the sheet's restack rules in `src/components/layout/PageFrame.tsx`, let the joined label text wrap to two lines instead of truncating (override the inner `truncate` span: normal whitespace, `break-words` so a single long compound never clips, two-line clamp), keeping the label column fixed at 130px so all label cells stay aligned across rows (per [[pageframe-filter-sheet-stacks-nested-fields]]: the shared column must stay intact).
- [ ] Desktop band behaviour stays as is: the label still yields by ellipsis there (per [[joined-label-shrinks-before-value]]); only the sheet changes.
- [ ] Add a `PageFrame` test in `src/components/layout/PageFrame.test.tsx` asserting a long label (`Inhabergeführt`) in the sheet is not `truncate`d and stays in the 130px column.
- [ ] Add a gallery demo in `gallery/layout-demos.tsx` with long German labels at a 430px viewport, per the living-demos convention.
- [ ] Bump `package.json` and add a matching `CHANGELOG.md` entry — `scripts/verify-package-version.mjs` fails `npm test` on a bump without one.

## Acceptance

- At 430px the filter sheet shows `Inhabergeführt` in full (wrapped to at most two lines) instead of `Inhabergef…`, for every joined row kind in the sheet — select, segmented control, native field — not only the select.
- Every label cell in the sheet is still exactly 130px wide, so label cells stay aligned; no other sheet row gets a wider or narrower column.
- The desktop toolbar band at `md` and wider is unchanged: joined labels still truncate with an ellipsis.
- The `PageFrame` test for the long-label sheet passes, and `npm test` is green after the version bump with a `CHANGELOG.md` entry.

## Related

- [[native-field-joined-label-sheet-column]] — must ship first: it edits the same 130px column rules in the sheet class string, and native rows only join the column once it lands, so building this first means re-doing the native-row case.
- [[joined-label-shrinks-before-value]] — introduced the `truncate` label span and the fixed sheet column this overrides.
- [[pageframe-filter-sheet-stacks-nested-fields]] — owns the sheet's nested-field restack rules.
- [[pageframe-mobile-filter-sheet]] — shipped the sheet and the 130px label column.

## Open question

Wrap vs. widen: the ticket offered "wrap to two lines" or "size the column to the longest label up to a cap". Defaulted to wrap with the fixed 130px column: it is CSS-only, keeps cells aligned with no measurement, and needs no subgrid across heterogeneous control kinds. Alternative: a column sized to the longest label (needs a shared grid/subgrid or JS measure across rows; wins only if a single compound exceeds two lines at 130px).
