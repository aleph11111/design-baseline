---
area: tooling
opened: '2026-09-27'
status: done
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T09:47:33Z'
value: normal
model: sonnet
model_reason: "the fix mechanism is now verified (@theme inline static) — this is a small, well-scoped mechanical change plus a demo cleanup, not open investigation"
---

# Gallery can't preview a nested dark-mode scope without hand-reading raw token sources

## Context

The gallery already has a whole-app light/dark toggle (`ThemeToggle` in `gallery/Gallery.tsx:216`, wired to `next-themes`'s `ThemeProvider` in `gallery/main.tsx`, predating #311) — toggling it flips the `.dark` class on `<html>` and lets any archetype demo be viewed in either theme by switching and re-visiting. What #311 actually hit, and what the reported thought describes, is narrower: a **nested/scoped** `.dark` wrapper *inside* an otherwise-light page does not resolve Tailwind 4's `@theme`-registered `--color-*` roles (`src/styles/tokens.layer.css:55` `@theme` block) — because those roles are declared once at `:root` (that's what plain `@theme` does), while only the raw `--db-*` custom properties are actually re-declared under a nested `.dark` selector (`tokens.layer.css:174-195`). `src/examples/analytics-dashboard-demo.tsx`'s `ChartPalette` component (added in #311, lines 108-140) had to work around this for its side-by-side light/dark swatch strip: the light row uses the real `bg-chart-N` utility classes, but the dark row abandons them and reads each role's raw `--db-chart-*`/`--primary` source directly via inline `style`, with the code's own comment stating why (`analytics-dashboard-demo.tsx:111-112`: "The `--color-chart-*` roles (like every `--color-*` role) resolve on `:root`, so the nested dark preview reads each role's source... instead"). Any future demo wanting a simultaneous (not toggle-and-revisit) light/dark comparison hits the same wall and would have to repeat the same hand-rolled, non-utility-class workaround.

## What to do

- [x] Change the `@theme` block in `src/styles/tokens.layer.css` (line ~55) to `@theme inline static`, with a comment explaining why: `inline` gets per-element resolution (so a nested `.dark` scope works), and `static` keeps `--color-*` emitted at `:root` for chart libraries that read the CSS var directly (ADR-0007 §8).
- [x] Verify with `npm run gallery:build` and a manual check that a nested `.dark`-scoped `bg-chart-2` element resolves to the dark-mode hue (computed style).
- [x] Drop `ChartPalette`'s raw-source workaround in `src/examples/analytics-dashboard-demo.tsx` (lines ~108-140) in favor of the real `bg-chart-N` utility classes for both the light and dark rows. *(v0.2.15. Checked in the built CSS: `.bg-chart-2{background-color:var(--db-chart-2)}`, `--db-chart-*` redeclared under `.dark`, and all 58 `--color-*` roles still emitted at `:root`. A browser computed-style check was not run because the Chrome extension was unreachable.)*

Note: `var(--color-*)` readers (e.g. a chart library reading the CSS var directly rather than via a Tailwind utility class) still resolve at `:root` — a nested `.dark` scope won't re-resolve for them, only Tailwind-compiled utility classes get per-element resolution. A whole-app theme toggle (the existing `ThemeToggle`) is unaffected either way. No shared dual-theme-swatch helper is being extracted — `ChartPalette` is still the only user, so that generalization is YAGNI until a second consumer shows up.

## Acceptance

- A nested `.dark`-scoped element inside a light-mode gallery page renders `bg-chart-2` with the dark-mode hue, verified by inspecting computed styles.
- `ChartPalette`'s light and dark rows both use the real `bg-chart-N` utility classes, with no visual regression in the analytics-dashboard demo.
- `npm test` and `npm run gallery:build` both pass.

## Related

- [archive/house-look-chart-palette.md](../archive/house-look-chart-palette.md) — #311, the ticket whose own acceptance note ("since the gallery has no theme toggle") is the source of this thought, and whose `ChartPalette` workaround this ticket targets
- `src/styles/tokens.layer.css` — the `@theme` block (donor token layer) this ticket investigates changing
- ADR-0007 — The fleet house look: donor-fixed roles vs brand-overridable roles (§8, chart colours; §3, surface elevation — also `--db-*`-sourced and subject to the same nested-scope question)
- `docs/RULES.md` — "every documented variant axis gets a living demo" (the rule this gap is blocking for any future dual-theme demo)

## Decision

**Question:** Does Tailwind 4's `@theme inline` (or a variant of it) make a nested `.dark` wrapper resolve `--color-*`-derived utility classes correctly, and without breaking the `:root`-level `--color-*` contract chart libraries rely on?

**Answer:** Spike answered — verified 2026-09-28 by compiling with this repo's `@tailwindcss/node`:
- `@theme` (today): utility emits `background-color: var(--color-chart-2)`; `--color-chart-2` resolves at `:root`, so a nested `.dark` is ignored.
- `@theme inline`: utility emits `var(--db-chart-2)` (resolves per element; nested `.dark` works) BUT `--color-chart-2` is no longer emitted at `:root` — breaks the ADR-0007 §8 contract that chart libraries read `var(--color-chart-N)` (`analytics-dashboard-demo.tsx:61` uses it today; controlling-app adoption will too).
- `@theme inline static`: both — the utility inlines the source var AND `--color-*` is still emitted at `:root`. This is the fix.

**Date:** 2026-09-28
