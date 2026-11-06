---
area: archetypes
opened: 2026-11-06
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-06T00:00:00Z
---

# Matrix-grid shell takes no back-link slot

## Context

`MatrixGridShellProps` (`src/components/archetypes/matrix-grid/MatrixGridShell.tsx:76`) is built on `PageShellFrameProps` (`src/components/layout/PageFrame.tsx`), which carries no `backHref` / `backLabel` / `renderBackLink`, so a drill-down matrix page under a parent route has no back link. Consumer: controlling-app's planset editor (`frontend/src/app/workspace/consolidation/[groupId]/planset/[plansetId]/page.tsx`) lost "Zu den Plansets" when it moved onto the shell (controlling-app PR #2193) and now hand-places the link inside `subtitle`. The archived `archetype-gap-shell-back-link-remaining` deliberately left matrix-grid unchanged "until a consumer page under a parent needs one" — this is that demand; the `docs/PACKAGE.md` v0.25.0 migration row still says matrix-grid omits the slot "by design". `ListWithDetailShell`, `GroupedListShell`, `FeedShell`, `BoardShell`, `StatementWithFiltersShell`, `DetailOverviewShell` and `FormPageShell` already take the three props via a `Pick<PageFrameProps, ...>` intersection (7 call sites).

## What to do

- [ ] Add `Pick<PageFrameProps, "backHref" | "backLabel" | "renderBackLink">` to the `MatrixGridShellProps` intersection and forward the three props to `<PageFrame>` in `MatrixGridShell` (pattern: `ListWithDetailShell.tsx:145-191`, `GroupedListShell.tsx:19`).
- [ ] Do NOT widen `PageShellFrameProps` itself — the `TakesEveryFrameSlot` gate in `src/components/archetypes/page-shell-frame-slots.test.tsx` must stay green.
- [ ] Update `docs/archetypes/matrix-grid.md`: add the back link to the parent page, role-only (no Tailwind classes or primitive names, per `docs/RULES.md` rules 2–3).
- [ ] Extend `MatrixGridShell.test.tsx` with a back-link case and a `renderBackLink` case.
- [ ] Show the back link in `src/components/archetypes/matrix-grid/matrix-grid-demo.tsx` (living demo for every documented axis).
- [ ] Bump the matrix-grid contract version in `docs/archetypes/MANIFEST.json` and `package.json` `version` (currently 0.29.0), add a `docs/PACKAGE.md` migration row, and fix the "still omit the slot by design" sentence in the v0.25.0 row (`docs/PACKAGE.md:584`) so it no longer lists `matrix-grid`.
- [ ] Out of scope: `settings-table`, `calendar`, `analytics-dashboard`, `structure-builder` stay without the slot until a consumer needs them. After release, controlling-app moves its hand-placed link into `backHref`/`backLabel` (separate consumer ticket).

## Acceptance

- `MatrixGridShell` with `backHref` and `backLabel` renders the back link in the page header; without `backHref` it renders no back link (unchanged).
- `renderBackLink` replaces the default anchor when given.
- `page-shell-frame-slots.test.tsx` still passes, and `PageShellFrameProps` is unchanged.
- `docs/PACKAGE.md` no longer says matrix-grid omits the back-link slot by design, and the MANIFEST and package versions are bumped.

## Related

- [[archetype-gap-shell-back-link-remaining]]
- [[archetype-gap-list-with-detail-back-link]]
- [[archetype-gap-matrix-grid-docked-inspector]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement
