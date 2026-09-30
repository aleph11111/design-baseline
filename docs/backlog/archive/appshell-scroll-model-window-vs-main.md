---
area: layout
opened: '2026-09-28'
status: done
value: high
model: opus
model_reason: "a shell-wide scroll-model change touches every consumer's sticky chrome and full-bleed shells; the choice is a design decision"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T19:00:00Z'
---

# Choose AppShell's scroll model: window scroll vs inner main scroll

## Context

`src/components/layout/AppShell.tsx` pins its root to the viewport (`h-svh flex w-full`) and scrolls inside `<main>` (`overflow-auto`). The adopting consumers scroll the window instead: hk-crm and controlling-app lay out with `min-h-screen`. The inner-scroll model has three measured costs:
- Full-page screenshots capture only the viewport, because the document itself never grows (controlling-app ticket #1100).
- Browser scroll restoration on back/forward doesn't apply, because the scrolled element is `<main>`, not the document.
- Consumers switching to the package `AppShell` change scroll behaviour as a side effect.

The v0.2.17 `min-w-0` fix (`appshell-content-column-min-w-0`) was a separate width bug and is not this decision. It was verified with a 2700px full-bleed table at 1440px: the document stays 1440 wide and topbar actions stay on screen.

## What to do

- [x] Switch `AppShell` to window scroll: root `min-h-svh` instead of `h-svh`, no `overflow-auto` on `<main>`, and the sidebar and header made `sticky` so they stay in view while the document scrolls.
- [x] Check every archetype shell that relies on a bounded scroll parent, such as `ListWithDetailShell`'s sticky detail rail and `DetailOverviewShell`'s sticky aside. Every sticky element must still stick against the window.
- [x] Add an `AppShell.test.tsx` assertion for the chosen model, and note the scroll model in `docs/PACKAGE.md` measured caveats.
- [x] Bump the package patch version.

## Acceptance

- With a page taller than the viewport, `document.documentElement.scrollHeight` exceeds the viewport height, and a full-page screenshot captures the whole page.
- Back/forward navigation restores the previous scroll position.
- Sidebar and header stay visible while scrolling, and no other sticky element in the archetype shells stops sticking.

## Related

- [[appshell-content-column-min-w-0]] — the width half of the same AppShell adoption report (v0.2.17)
- [[list-with-detail-full-bleed-nested-leak]] — the other AppShell content-column ticket (v0.2.18)
- [ADR-0007](../../adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — §1, the AppShell page rhythm this layout carries

## Decision

**Question:** Window scroll or inner `<main>` scroll?

**Answer (operator, 2026-09-28):** Window scroll with sticky chrome. Shipped in v0.2.19:
- The root is `min-h-svh` and `<main>` has no overflow.
- The header slot is wrapped in `sticky top-0 z-20 bg-background`. The desktop sidebar was already `fixed` (`ui/sidebar`).

Measured on the built gallery in headless Chromium at 1440×700. Before the change the document stayed 700px tall and `<main>` scrolled. After it, the document scrolls on detail-overview (2047px), list-with-detail, kanban-board and form-page, `<main>` no longer scrolls, the header stays at top 0 after a 400px scroll, and the page stays 1440px wide. On form-page the header used to scroll away (top −400); it now stays.

The `min-w-0` and full-bleed cases still hold: a 2700px table inside a full-bleed `overflow-x-auto` box keeps the document 1440px wide, with the topbar action at x=1440. A bare, unwrapped 2700px table now scrolls the page sideways instead of `<main>`. The topbar stays in view, and every donor shell carries its own overflow box. This is noted in `docs/PACKAGE.md`.

MatrixGridShell's sticky first column and BoardShell's horizontal scroll are unchanged, because both own their horizontal scroll container. The detail-overview rail's `lg:sticky` did not stick before this change and still doesn't, since it sits inside the frame's `overflow-hidden`. That is filed separately.
