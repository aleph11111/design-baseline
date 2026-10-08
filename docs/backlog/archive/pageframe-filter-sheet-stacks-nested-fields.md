---
area: layout
opened: 2026-10-08
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-08T00:00:00Z
---

# PageFrame filter sheet stacks nested toolbar fields one per row

## Context

The mobile filter sheet that `PageFrame` builds (the `data-filter-sheet` container in
`src/components/layout/PageFrame.tsx`) stretches only its **direct** children to full width
(`[&>*]:w-full!`). When an app wraps its toolbar fields in its own flex row — the common shape,
since a page usually groups fields in a `<div className="flex">` so they sit side by side on
desktop — that wrapper becomes the sheet's only child, the wrapper stretches, but the joined
selects *inside* it stay side by side. On a 430px screen that overflows the sheet and clips the
values. Seen in the 2026-10-08 fleet visual pass in mistra (`/admin/logs`, `/admin/health`),
hk-sales-agent (Trefferliste) and hk-crm (`/opportunities` — values clipped). This is a gap in the
sheet shipped by the now-done `[[pageframe-mobile-filter-sheet]]` (v0.6.0) : that work added the
sheet and the shared ~130px `data-joined-label` column, but the direct-child-stretch rule never
accounted for a wrapper div grouping the fields.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In the `data-filter-sheet` container of `src/components/layout/PageFrame.tsx`, make every field row inside the sheet stack one per row at full width even when the toolbar is nested in the app's own wrapper div — e.g. turn nested flex rows into a column or apply `display: contents` to wrapper divs so the fields reflow as the sheet's items, rather than relying on the `[&>*]:w-full!` direct-children-only rule.
- [ ] Keep the shared ~130px `data-joined-label` column intact (labels stay in one column and keep their desktop wording); do not re-add the label handling, only the stacking.
- [ ] Add a `PageFrame` test in `src/components/layout/PageFrame.test.tsx` asserting that a toolbar wrapped in its own `flex` div renders its joined fields stacked one per row (not side by side) at 430px.
- [ ] Add a gallery demo in `gallery/layout-demos.tsx` (next to `PageFrameDemo`) where the `toolbar` is a wrapper div holding three selects, per the living-demos convention.
- [ ] Bump `package.json` from `0.6.6` to `0.6.7` and add a `## v0.6.7` entry to `CHANGELOG.md` — `scripts/verify-package-version.mjs` (a `pretest`) fails `npm test` on a bump without a matching entry.

## Acceptance

- A `PageFrame` whose toolbar is wrapped in its own flex div renders every joined control stacked one per row, full width, inside the mobile filter sheet at 430px — no other select, direct or nested, overflows or shows clipped values.
- The `PageFrame` test for the wrapper-div toolbar (three selects) passes and asserts the selects are stacked, not side by side.
- The gallery demo renders a `PageFrame` whose `toolbar` is a wrapper div with three selects, all stacked one per row in the sheet.
- After the bump, `npm test` runs `verify-package-version.mjs` green (a `CHANGELOG.md` `v0.6.7` entry exists) and `npx tsc --noEmit` is unchanged.

## Related

- [[pageframe-mobile-filter-sheet]] — the shipped (done, v0.6.0) ticket that built the sheet and the ~130px `data-joined-label` column this fix builds on
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement (the `toolbar` slot and the filter-sheet slots `PageFrame` renders)
- [PageFrame source](/src/components/layout/PageFrame.tsx) — the `data-filter-sheet` container (`[&>*]:w-full!`) to fix
