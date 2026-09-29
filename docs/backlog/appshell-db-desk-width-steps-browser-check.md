---
area: layout
opened: 2026-09-29
status: ready
value: normal
model: sonnet
model_reason: "scoped test addition against an existing gallery; cause and expected widths are known"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-09-29T15:30:00Z
---

# AppShell wide-desk width steps need a real-browser regression check

## Context

v0.2.26 (PR #373) made `AppShell`'s `<main>` a size container (`@container/db-desk`), and `src/styles/tokens.layer.css` now redefines `--db-content-max` on `.db-content-column` per desk width: 1180px, then 1440px from a 1528px desk, then 1680px from 1768px. `src/components/layout/AppShell.test.tsx` only checks that the two class hooks are present, because jsdom can't evaluate container queries. So nothing guards the actual widths, or a consumer build whose Tailwind `@source` drops the `@container/db-desk` utility. The ship review also flagged that `container-type: inline-size` gives `<main>` inline-size containment, so its min-content width no longer comes from its children. The parent column's `min-w-0` should already make that moot, but nobody has checked a wide-table page or the window-scroll/full-page-screenshot path.

The widths were checked once by hand in headless Chrome, with a Playwright script in session scratch: 1512→1144, 1903→1440, 1920→1440, 1920 collapsed→1440, 2560→1680, 3440→1680.

## What to do

- [ ] Add a scripted browser check against the built gallery (`npm run gallery:build`). Measure the `.db-content-column` width at windows of 1512, 1903 (1920 minus a classic scrollbar), 1920 with the sidebar collapsed, and 2560, and assert 1144 / 1440 / 1440 / 1680.
- [ ] In the same check, load a full-bleed wide-table demo (matrix-grid) at 1512 and assert `document.documentElement.scrollWidth` equals the window width, so the page does not scroll sideways.
- [ ] Wire it as an npm script next to the existing `scripts/*.mjs` checks. Browser binary: reuse the local Chrome, following the scratch script's `executablePath` approach.

## Acceptance

- The check exits non-zero when `db-content-column` or `@container/db-desk` is removed from `AppShell.tsx`.
- At every measured window, the column width matches the step table in ADR-0007's 2026-09-29 amendment.
- A matrix-grid page at 1512 shows no page-level horizontal scroll: `scrollWidth` equals the window width.
- The column measures `max-width: none` on the matrix-grid demo, and no other full-bleed archetype demo (list-with-detail, kanban-board, calendar) keeps a capped column.

## Related

- [archive/appshell-content-column-min-w-0.md](archive/appshell-content-column-min-w-0.md)
- [archive/appshell-scroll-model-window-vs-main.md](archive/appshell-scroll-model-window-vs-main.md)
- ADR-0007 — the fleet house look (§1 content width, amendment 2026-09-29)
