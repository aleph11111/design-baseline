---
area: layout
opened: '2026-10-10'
status: done
value: high
gate:
  score: 4
  passed:
    - title
    - context
    - what-to-do
    - acceptance
  failed:
    - open_question: "resolved 2026-10-12 by the operator (see ## Decision)"
  graded_at: '2026-10-10T00:00:00.000Z'
---

# AppHeader overflows on phones and widens every page past the viewport

## Context

`AppHeader` (`src/components/layout/Header.tsx`) is a `h-16 flex justify-between` row whose `right` slot is `flex-shrink-0` and whose `center` slot is `flex-1` with no `min-w-0`, so long content can never shrink or truncate. Found by controlling-app on 2026-10-10 after dropping its local header copy for the donor one (final visual check): at 430px the breadcrumb wraps to three lines, the user email wraps and the sign-out button is cut at the right edge, and the document is 525–671px wide on all workspace routes — i.e. every page scrolls horizontally on phones. The donor `AppHeader` today takes only `title`/`center`/`right`/`showSidebarTrigger`; it has no breadcrumb or user-menu concept, and `title` is hidden below `sm`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Below `sm` the header fits one row: add `min-w-0` + `overflow-hidden` to the header and its slots, drop `flex-shrink-0` on `right`, and let the title/center content truncate.
- [ ] Add an optional `user` input (`email`, `onSignOut`) that renders the email and sign-out inside the user menu below `sm` and inline from `sm` up, so neither can overflow the row.
- [ ] Add a real-Chrome check at 430px with a long title and a long email, asserting `document.documentElement.scrollWidth <= window.innerWidth` (`scripts/check-app-header-phone.mjs`, run by `npm run check:app-header-phone` — same pattern as `check:desk-width` and `check:joined-label`; jsdom does no layout, so a vitest assertion would pass vacuously). Cover the class contract in `src/components/layout/Header.test.tsx`.
- [ ] Add a gallery demo of the phone-width header (per the living-demos convention) and bump `package.json` + add the `CHANGELOG.md` entry (`scripts/verify-package-version.mjs` fails `npm test` otherwise); reconcile `docs/PACKAGE.md` only if it describes the header props.

## Acceptance

- At a 430px viewport with a long title and a long email, `npm run check:app-header-phone` measures `document.documentElement.scrollWidth <= window.innerWidth`.
- Below `sm` the header renders on one row; the email and sign-out button sit inside the user menu.
- No other `AppHeader` slot (`title`, `center`, `right`) can push the header wider than the viewport — the overflow class is closed, not just the title and email instances.
- From `sm` up the header is unchanged for consumers that pass no `user`.

## Related

- [[app-header-breadcrumb]] — the `breadcrumb` input, split out of this ticket (see Decision)
- [[app-shell-header-props-exports]] — exported `AppHeaderProps`; the new input extends that type
- [[pageframe-mobile-filter-sheet]] — precedent for collapsing chrome into a sheet/menu below the mobile breakpoint
- [[refactor-shell-surface-header-slot-duplication]] — earlier header slot consolidation in the same area
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement

## Decision

2026-10-12, operator (in session, after PR #548 hit the review-gate round cap): ship the overflow fix and the donor-owned `user` input here; split the `breadcrumb` input into [[app-header-breadcrumb]]. Rounds 3–5 on #548 were all the breadcrumb competing with `center` for width, each flex tweak regressing the next combination, so it gets its own ticket with a real-Chrome check across every breadcrumb × center × user combination. The 430px measurement is the real-Chrome check script, not a jsdom test (jsdom does no layout). This replaces the 2026-10-10 orchestrator default, which assumed both `breadcrumb` and `user` without operator confirmation.
