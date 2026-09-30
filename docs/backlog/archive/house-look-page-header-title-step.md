---
area: ui
opened: '2026-09-27'
status: ready
value: normal
model: sonnet
model_reason: "one class swap on PageHeader plus doc/test update against a decided ADR"
depends_on: [house-look-tokens-layer-roles]
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-27T09:00:00Z'
---

# House look slice 2: PageHeader title moves to the display step

## Context

ADR-0007 section 2 gives the page `<h1>` a 30px display step so a page has a focal point. `src/components/layout/PageHeader.tsx` renders the title at `text-lg` (the Plex Ledger scale in `docs/STYLE.md`). The `--text-display-title` token ships in slice 1.

## What to do

- [x] Change the `PageHeader` `<h1>` class from `text-lg` to the `--text-display-title` utility (`text-display-title`), keeping weight and tracking; no size prop (fixed in the component, ADR-0004).
- [x] Update the `PageHeader` docstring, `docs/STYLE.md`'s "page title `text-lg`" line and heading-ladder table, and `src/components/layout/PageHeader.test.tsx` if it pins the class.
- [x] Check `NestedPageHeading` stays on its own step (the ladder keeps three distinct rungs).

## Acceptance

- The gallery page titles render at 30px; `NestedPageHeading` and `SectionHeading` sizes are unchanged.
- `PageHeader` exposes no size/variant prop after the change.
- `npm test` passes.

## Related

- [[house-look-adr]] — the decision ticket that filed this slice
- ADR-0007 — The fleet house look: donor-fixed roles vs brand-overridable roles
- ADR-0004 — appearance locality: global or fixed in the component
- [[house-look-tokens-layer-roles]] — must ship first: it defines the `--text-display-title` token this slice consumes
- [[test-gap-page-header-no-tests]]
