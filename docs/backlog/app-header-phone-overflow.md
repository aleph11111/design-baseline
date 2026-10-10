---
area: layout
opened: 2026-10-10
status: needs-enrichment
value: high
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance]
  failed:
    - open_question: "unresolved fork (AppHeader API shape) auto-resolved to Recommended; operator confirms before /feat"
  graded_at: 2026-10-10T00:00:00Z
---

# AppHeader overflows on phones and widens every page past the viewport

## Context

`AppHeader` (`src/components/layout/Header.tsx`) is a `h-16 flex justify-between` row whose `right` slot is `flex-shrink-0` and whose `center` slot is `flex-1` with no `min-w-0`, so long content can never shrink or truncate. Found by controlling-app on 2026-10-10 after dropping its local header copy for the donor one (final visual check): at 430px the breadcrumb wraps to three lines, the user email wraps and the sign-out button is cut at the right edge, and the document is 525–671px wide on all workspace routes — i.e. every page scrolls horizontally on phones. The donor `AppHeader` today takes only `title`/`center`/`right`/`showSidebarTrigger`; it has no breadcrumb or user-menu concept, and `title` is hidden below `sm`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Below `sm` the header fits one row: add `min-w-0` + `overflow-hidden` to the header and its slots, drop `flex-shrink-0` on `right`, and let the breadcrumb/center content truncate.
- [ ] Add an optional breadcrumb input to `AppHeader` that renders only the current segment below `sm` (full path in the `title` attribute / tooltip) and the full trail from `sm` up.
- [ ] Add an optional `user` input (`email`, `onSignOut`) that renders the email and sign-out inside the user menu below `sm` and inline from `sm` up, so neither can overflow the row.
- [ ] Add a 430px test in `src/components/layout/` (alongside `AppShell.test.tsx`) with a long breadcrumb and a long email, asserting `document.documentElement.scrollWidth <= window.innerWidth`.
- [ ] Add a gallery demo of the phone-width header (per the living-demos convention) and bump `package.json` + add the `CHANGELOG.md` entry (`scripts/verify-package-version.mjs` fails `npm test` otherwise); reconcile `docs/PACKAGE.md` only if it describes the header props.

## Acceptance

- At a 430px viewport with a long breadcrumb and a long email, `document.documentElement.scrollWidth` is `<= window.innerWidth`.
- Below `sm` the header renders on one row showing only the current breadcrumb segment, with the full path in its `title` attribute; the email and sign-out button sit inside the user menu.
- No other `AppHeader` slot (`title`, `center`, `right`) can push the header wider than the viewport — the overflow class is closed, not just the breadcrumb and email instances.
- From `sm` up the header is unchanged for consumers that pass none of the new inputs.

## Related

- [[app-shell-header-props-exports]] — exported `AppHeaderProps`; the new inputs extend that type
- [[pageframe-mobile-filter-sheet]] — precedent for collapsing chrome into a sheet/menu below the mobile breakpoint
- [[refactor-shell-surface-header-slot-duplication]] — earlier header slot consolidation in the same area
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement

## Open question

How should `AppHeader` receive the breadcrumb and user menu? Recommended (asserted above): new optional props (`breadcrumb`, `user`) so truncation and the user-menu move are owned by the donor. Alternative: leave `center`/`right` as opaque slots, only harden the layout (`min-w-0`, truncation) and have each consumer build its own responsive breadcrumb/user menu — smaller API, but every consumer re-solves the same phone overflow.
