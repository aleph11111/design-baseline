---
area: layout
opened: '2026-09-28'
status: needs-enrichment
value: high
model: opus
model_reason: "a shell-wide scroll-model change touches every consumer's sticky chrome and full-bleed shells; the choice is a design decision"
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "scroll model auto-resolved to the Recommended default; confirm before /feat"
  graded_at: '2026-09-28T17:30:00Z'
---

# Choose AppShell's scroll model: window scroll vs inner main scroll

## Context

`src/components/layout/AppShell.tsx` pins its root to the viewport (`h-svh flex w-full`) and scrolls inside `<main>` (`overflow-auto`). The adopting consumers scroll the window instead: hk-crm and controlling-app lay out with `min-h-screen`. The inner-scroll model has three measured costs:
- Full-page screenshots capture only the viewport, because the document itself never grows (controlling-app ticket #1100).
- Browser scroll restoration on back/forward doesn't apply, because the scrolled element is `<main>`, not the document.
- Consumers switching to the package `AppShell` change scroll behaviour as a side effect.

The v0.2.17 `min-w-0` fix (`appshell-content-column-min-w-0`) was a separate width bug and is not this decision. It was verified with a 2700px full-bleed table at 1440px: the document stays 1440 wide and topbar actions stay on screen.

## What to do

- [ ] Switch `AppShell` to window scroll: root `min-h-svh` instead of `h-svh`, no `overflow-auto` on `<main>`, and the sidebar and header made `sticky` so they stay in view while the document scrolls.
- [ ] Check every archetype shell that relies on a bounded scroll parent, such as `ListWithDetailShell`'s sticky detail rail and `DetailOverviewShell`'s sticky aside. Every sticky element must still stick against the window.
- [ ] Add an `AppShell.test.tsx` assertion for the chosen model, and note the scroll model in `docs/PACKAGE.md` measured caveats.
- [ ] Bump the package patch version.

## Acceptance

- With a page taller than the viewport, `document.documentElement.scrollHeight` exceeds the viewport height, and a full-page screenshot captures the whole page.
- Back/forward navigation restores the previous scroll position.
- Sidebar and header stay visible while scrolling, and no other sticky element in the archetype shells stops sticking.

## Related

- [archive/appshell-content-column-min-w-0.md](../archive/appshell-content-column-min-w-0.md) — the width half of the same AppShell adoption report (v0.2.17)
- [list-with-detail-full-bleed-nested-leak.md](wip/list-with-detail-full-bleed-nested-leak.md) — the other open AppShell content-column ticket
- [ADR-0007](../../adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — §1, the AppShell page rhythm this layout carries

## Open question

Window scroll or inner `<main>` scroll? Recommended (asserted above): window scroll. Two consumers already use it, and it fixes full-page screenshots and scroll restoration. Alternatives: (b) keep inner scroll and document the screenshot and restoration limits, with consumers working around them; (c) add a shell-level scroll-model option. That is a per-project context axis, and it would need a RULES hard-rule-10 keying argument.
