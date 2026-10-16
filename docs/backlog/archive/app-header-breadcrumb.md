---
area: layout
opened: '2026-10-12'
status: done
closed: '2026-10-16'
resolution: closed-not-planned
value: normal
depends_on: [app-header-phone-overflow]
gate:
  score: 4
  passed:
    - title
    - context
    - what-to-do
    - acceptance
    - related
  failed:
    - open_question: "breadcrumb API shape (`breadcrumb?: string[]` owned by AppHeader) auto-resolved to Recommended; operator confirms before /feat"
  graded_at: '2026-10-12T00:00:00.000Z'
---

# AppHeader breadcrumb input with one width rule for every slot combination

## Context

Split out of PR #548 (`app-header-phone-overflow`), which shipped the phone overflow fix and the `user` input but dropped the breadcrumb. `AppHeader` (`src/components/layout/Header.tsx`) has no breadcrumb today; controlling-app builds its trail in `center`/`right`. PR #548 hit the review-gate round cap because the breadcrumb kept competing with `center` for width, and each flex-class tweak regressed another combination: round 3, `center` + long breadcrumb clipped the account button; round 4, from `sm` a long trail collapsed `center` to 0px; round 5, a left slot that was always `flex-1` halved `center` below `sm` for consumers with no breadcrumb. The width rules have to be designed once, for the whole matrix, and proven in real Chrome. jsdom does no layout, so `Header.test.tsx` only checks the class contract.

## What to do

- [ ] Add optional `breadcrumb?: string[]` to `AppHeaderProps`: below `sm` render only the current (last) segment, truncated, with the full path in its `title` attribute; from `sm` up render the full trail (truncating), next to `title`.
- [ ] Extend `scripts/check-app-header-phone.mjs` (real Chrome, `npm run check:app-header-phone`) and the `app-header-phone` gallery demo to cover the full matrix breadcrumb (none / long) × `center` (none / input) × `user` (none / long email) at 360, 430, 640 and 1024px, before changing the header's width rules.
- [ ] Settle the header's width rules against that matrix in one pass. Consider explicit CSS grid tracks for the header instead of juggling `flex-1` per case.
- [ ] Bump `package.json`, add the `CHANGELOG.md` entry, and cover the class contract in `src/components/layout/Header.test.tsx`.

## Acceptance

- `npm run check:app-header-phone` passes for every combination in the matrix: the header's scroll width equals its client width, the document width is `<=` the viewport at 430px, the account button is fully visible, and the center input is `>=` its floor (8rem from `sm` up).
- A consumer that passes `center` and no breadcrumb renders the center input at the same width as before this change, at every matrix width.
- Below `sm` only the current segment renders, with the full path in its `title` attribute.
- From `sm` up, the header is unchanged for consumers that pass no `breadcrumb`.

## Related

- [[app-header-phone-overflow]]: must ship first. It sets the shrink contract, the `user` input and the check script this ticket extends.
- [[app-shell-header-props-exports]]: exported `AppHeaderProps`, which the new input extends.
- [[refactor-shell-surface-header-slot-duplication]]: earlier header slot consolidation in the same area.
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md): one page frame, slot-owned placement.

## Open question

Breadcrumb API shape. Recommended (assumed above): the donor owns `breadcrumb?: string[]` on `AppHeader`. Alternative: no new prop; document how to put a truncating trail in `center` and keep the donor API as is. The operator confirms before `/feat`.

## Verdict — NOT PLANNED (closed 2026-10-16)

Operator chose option C (close) after re-verification against `origin/main` (`83e7710`) and the fleet checkouts:

- **The motivating claim does not hold.** controlling-app does not use `AppHeader`; it renders its own `frontend/src/components/layout/WorkspaceHeader.tsx`, whose trail is asset logo + name + two badges + page title. A `string[]` prop could not express it, so the consumer this ticket was built around would not adopt it.
- **No consumer needs a header trail.** brickshop-manager is the only `AppHeader` consumer; its breadcrumbs live in the page frame (`DetailHeader`, `SettingsPageShell`), which matches the donor's own placement — `PageHeader`/`NestedPageHeading` defer breadcrumbs to the shell or section layout, and `SettingsPageShell`'s `subtitle` already carries a trail.
- **High cost, proven.** The width matrix already exhausted PR #548's review-gate cap; paying that for zero adopters is YAGNI.

Reopen trigger: an `AppHeader` consumer (e.g. controlling-app migrating `WorkspaceHeader`) asks for a header trail. Design it then as a `ReactNode` slot (logo, badges), not `string[]`, together with the full real-Chrome matrix this ticket describes.
