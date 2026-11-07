---
area: layout
opened: 2026-11-07
status: done
value: high
model: sonnet
model_reason: "scoped class change on one shared row constant plus test, demo and version bump; cause is established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-07T00:00:00Z
---

# HeadingRow actions squeeze the page title above sm

## Context

`HEADING_ROW_CLASSES` in `src/components/layout/HeadingRow.tsx` stacks the row only below the `sm` *viewport* breakpoint (`flex flex-col … sm:flex-row`), and the `actions` wrapper is `flex shrink-0 flex-wrap items-center gap-3`. `shrink-0` makes the actions block take its max-content width, so its `flex-wrap` never wraps and the `min-w-0` title block collapses. Repro (brickshop-manager `/orders/:id`, sales order SO-2026-00053, 9 header actions, 1133x739 viewport with `AppShell` sidebar): the content column is ~780px, the h1 is 93px wide and wraps `SO-/2026-/00053`, the toolbar overlaps it, `main` scrollWidth is 1624 vs 877, and Delete Order sits at x=1750 off-screen. The v0.10.3 fix (#549, [[page-header-actions-squeeze-title-on-phones]]) keys on viewport width, but the sidebar makes the real content column far narrower than the viewport. `PageHeader` and `NestedPageHeading` both render through `HeadingRow`, and every shell reaches `PageHeader` through `PageFrame` (ADR-0008), so the fix belongs in the shared constant.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `HEADING_ROW_CLASSES` (`src/components/layout/HeadingRow.tsx`), key the side-by-side layout on the heading row's own container width instead of the viewport: make the `outer` wrapper a `@container` and swap `sm:flex-row sm:items-start sm:justify-between` for the matching `@<size>:` variants (container queries already ship in `AppShell.tsx` `@container/db-desk` and `FeedShell.tsx`).
- [ ] Drop `shrink-0` from `actions` and give the actions block a bounded share of the row (e.g. `min-w-0`, `justify-end`) so `flex-wrap` wraps the buttons onto further lines and the title block keeps a usable minimum width. Class change only: no new prop (ADR-0004).
- [ ] Add a `PageHeader.test.tsx` case with a long title and 9 actions asserting the container-query classes and no `shrink-0` on the actions wrapper, and check `NestedPageHeading.test.tsx` (which pins `HEADING_ROW_CLASSES`) still passes.
- [ ] Add a gallery demo case (order-style title, 9 actions) rendered inside a ~780px container and confirm in real Chrome at the device triad that the h1 is not wrapped mid-token, nothing overflows horizontally and every action is reachable.
- [ ] Bump `package.json` version and add the `CHANGELOG.md` entry (`scripts/verify-package-version.mjs` fails `npm test` on a bump without one).

## Acceptance

- In a ~780px content column, a `PageHeader` with a long title and 9 actions shows the title at usable width and the actions wrapped beneath or beside it, with no horizontal overflow of `main` and no overlap of title and toolbar.
- The same header in a wide column (desk27) renders unchanged: title left, actions right-aligned on one row.
- Every `HeadingRow` consumer (`PageHeader`, `NestedPageHeading`, and every shell through `PageFrame`) uses the container-query layout; no other call site keeps the viewport-`sm:` stacking or a `shrink-0` actions block.
- `npm test` fails on a version bump without a `CHANGELOG.md` entry, and passes after the entry is added.

## Related

- [[page-header-actions-squeeze-title-on-phones]] — the v0.10.3 viewport-`sm` fix this replaces
- [[key-value-row-stack-below-md]] — stack-below-breakpoint precedent
- [[page-header-action-hierarchy-overflow-menu]] — follow-up: action hierarchy and overflow menu, builds on the same `HeadingRow` constant
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — fixed in the component, no appearance prop
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — every shell reaches `PageHeader` through `PageFrame`
