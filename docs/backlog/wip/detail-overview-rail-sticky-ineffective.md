---
area: components
opened: '2026-09-28'
status: ready
value: normal
model: opus
model_reason: "the frame's overflow-hidden clips rounded corners on purpose; trading it for sticky needs a judgment call (overflow-clip vs moving the rounding)"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T19:30:00Z'
---

# Detail-overview rail sticky never sticks inside the SurfaceFrame overflow-hidden

## Context

`DetailOverviewShell`'s rail (`src/components/archetypes/detail-overview/DetailOverviewShell.tsx:158`) is `lg:sticky lg:top-0 lg:self-start`, and the contract says "the page scrolls; the rail uses sticky" (`docs/archetypes/detail-overview.md:241`). The rail renders inside `SurfaceFrame` (`src/components/layout/SurfaceFrame.tsx:110`). With chrome on, that frame is `overflow-hidden`, which makes it the rail's scroll container, so the rail never sticks against the page. Measured on the built gallery (`/a/detail-overview`, 1440×700) under both scroll models: after a 400px scroll the rail's top sits at -13px both before and after v0.2.19. Since v0.2.19 `AppShell` scrolls the window with a sticky header slot, so a working sticky rail also needs a top offset equal to the header height instead of `top-0`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Let the rail stick against the window: switch `SurfaceFrame`'s default `overflow-hidden` to `overflow-clip`, which clips the rounded corners without creating a scroll container, and give the rail a top offset for AppShell's sticky header slot, for example a `--db-sticky-top` variable that `AppShell` sets.
- [ ] Add a headless-browser or DOM-level check that the rail's top stays at the header offset after the page scrolls.

## Acceptance

- On `/a/detail-overview` with `layout="rail"` at 1440px, after scrolling the page 400px the rail's top equals the sticky header's bottom edge, not a negative value.
- No other sticky element inside a `SurfaceFrame` (the matrix-grid first column, form-page actions) stops sticking.

## Related

- [archive/appshell-scroll-model-window-vs-main.md](../archive/appshell-scroll-model-window-vs-main.md) — v0.2.19 window scroll, where this was measured
- [archive/detail-overview-blueprint-rail-variant.md](../archive/detail-overview-blueprint-rail-variant.md) — the rail variant this belongs to
