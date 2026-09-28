---
area: components
opened: '2026-09-28'
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T00:00:00Z'
---

# PageHeader's `subtitle` prop rejects block content, blocking consumers

## Context

`src/components/layout/PageHeader.tsx` forwards `subtitle` straight to
`HeadingRow`, which renders it inside a `<p className="text-xs
text-muted-foreground">` (`src/components/layout/HeadingRow.tsx:110`). Any
consumer passing block content (nested `<div>`s, multiple lines, a list) in
`subtitle` produces invalid HTML (block inside `<p>`) or gets it flattened.
controlling-app's adoption of v0.2.11 (PRs #1077/#1078,
`adopt-house-look-v0-2-11` there) found this blocks swapping its own
26-call-site local `frontend/src/components/ui/page-header.tsx`
(`description` → `subtitle`) for the package component, since its
`description` prop accepts block content today.

## What to do

- [x] Decide: change `HeadingRow`'s subtitle wrapper from `<p>` to `<div>`
      (accepting `ReactNode`, no block-content restriction), or add a
      separate slot on `PageHeaderProps` for block subtitle content alongside
      the existing single-line `subtitle`. *(Decided: `<div>`, marked
      `data-slot="heading-subtitle"` so the solid header bar's inversion,
      which targeted `p`, still reaches it. No new prop. v0.2.12.)*
- [x] Apply the change in `src/components/layout/PageHeader.tsx` and
      `src/components/layout/HeadingRow.tsx`, keeping the existing
      `text-xs text-muted-foreground` treatment.

## Acceptance

- `PageHeader`'s subtitle slot renders block content (e.g. a `<div>` wrapping
  multiple lines) without producing invalid HTML nesting.
- Existing single-line `subtitle` usage (plain string/inline content) renders
  unchanged.

## Related

- [frontend-pageheader-drops-title-description-icon.md](frontend-pageheader-drops-title-description-icon.md)
- ADR-0007 — the fleet house look: donor-fixed roles vs brand-overridable roles (`PageHeader` title step is fixed per this ADR)
- controlling-app `docs/backlog/adopt-package-page-header.md` — the cross-repo consumer this fix unblocks (filed against controlling-app; not resolvable via `depends_on` cross-repo)
