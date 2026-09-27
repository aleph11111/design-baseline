---
area: tooling
opened: '2026-09-27'
status: needs-enrichment
gate:
  score: 4
  passed: [title, context, what-to-do, related]
  failed:
    - open_question: "whether @theme inline actually fixes nested .dark resolution is unverified — needs investigation before a human commits to the approach"
  graded_at: '2026-09-27T00:00:00Z'
value: normal
model: opus
model_reason: "the fix depends on an unverified Tailwind-4 mechanism (@theme inline) and, either way, on designing a reusable dual-theme preview affordance — real investigation and judgment, not mechanical"
---

# Gallery can't preview a nested dark-mode scope without hand-reading raw token sources

## Context

The gallery already has a whole-app light/dark toggle (`ThemeToggle` in `gallery/Gallery.tsx:216`, wired to `next-themes`'s `ThemeProvider` in `gallery/main.tsx`, predating #311) — toggling it flips the `.dark` class on `<html>` and lets any archetype demo be viewed in either theme by switching and re-visiting. What #311 actually hit, and what the reported thought describes, is narrower: a **nested/scoped** `.dark` wrapper *inside* an otherwise-light page does not resolve Tailwind 4's `@theme`-registered `--color-*` roles (`src/styles/tokens.layer.css:55` `@theme` block) — because those roles are declared once at `:root` (that's what plain `@theme` does), while only the raw `--db-*` custom properties are actually re-declared under a nested `.dark` selector (`tokens.layer.css:174-195`). `src/examples/analytics-dashboard-demo.tsx`'s `ChartPalette` component (added in #311, lines 108-140) had to work around this for its side-by-side light/dark swatch strip: the light row uses the real `bg-chart-N` utility classes, but the dark row abandons them and reads each role's raw `--db-chart-*`/`--primary` source directly via inline `style`, with the code's own comment stating why (`analytics-dashboard-demo.tsx:111-112`: "The `--color-chart-*` roles (like every `--color-*` role) resolve on `:root`, so the nested dark preview reads each role's source... instead"). Any future demo wanting a simultaneous (not toggle-and-revisit) light/dark comparison hits the same wall and would have to repeat the same hand-rolled, non-utility-class workaround.

## What to do

- [ ] Investigate whether switching the relevant `@theme` block(s) in `src/styles/tokens.layer.css` to `@theme inline` (Tailwind 4's documented mechanism for theme values that reference other CSS variables which change under a scope/media-query, e.g. `.dark`) makes a nested `.dark` wrapper correctly resolve `--color-*`-derived utility classes like `bg-chart-2` — confirm with a manual before/after check (a nested `.dark` div using `bg-chart-2` next to a light one, inspecting computed styles) before committing to the change repo-wide, since it changes how every `@theme` role compiles.
- [ ] If `@theme inline` resolves it: drop the hand-rolled `--db-*`-source-reading workaround in `ChartPalette` (`analytics-dashboard-demo.tsx:122-140`) in favor of the real utility classes for both rows, and extract the light+dark side-by-side swatch-row pattern into a small reusable gallery/demo helper (it's already needed twice — the chart palette today, and any future demo wanting the same simultaneous comparison) instead of each demo hand-rolling its own `dark` boolean prop and duplicated markup.
- [ ] If `@theme inline` does NOT resolve it (a real possibility — this needs verifying, not assuming): document the actual constraint next to the `@theme` block in `tokens.layer.css` (so the next demo author doesn't waste time assuming nesting works) and keep the raw-source-reading pattern, but still extract it into the shared helper from the previous bullet so it's written once, not per-demo.

## Acceptance

- A nested `.dark`-scoped element inside a light-mode gallery page renders `bg-chart-2` (or another `@theme`-derived role) with the dark-mode hue, verified by inspecting computed styles — or, if that's confirmed infeasible, a code comment states so at the `@theme` block.
- `ChartPalette`'s dark row either uses the real `bg-chart-N` utility classes (if the fix works) or is rewritten to call the new shared dual-theme-swatch helper (either way, no visual regression in the analytics-dashboard demo).
- `npm test` and `npm run gallery:build` both pass.

## Related

- [archive/house-look-chart-palette.md](archive/house-look-chart-palette.md) — #311, the ticket whose own acceptance note ("since the gallery has no theme toggle") is the source of this thought, and whose `ChartPalette` workaround this ticket targets
- `src/styles/tokens.layer.css` — the `@theme` block (donor token layer) this ticket investigates changing
- ADR-0007 — The fleet house look: donor-fixed roles vs brand-overridable roles (§8, chart colours; §3, surface elevation — also `--db-*`-sourced and subject to the same nested-scope question)
- `docs/RULES.md` — "every documented variant axis gets a living demo" (the rule this gap is blocking for any future dual-theme demo)

## Open question

Does Tailwind 4's `@theme inline` actually make a nested `.dark` wrapper resolve `--color-*`-derived utility classes correctly, or does the constraint run deeper (e.g. Tailwind still only ever emits one utility-class rule regardless of `inline`, and the fix would have to be structural rather than a one-line directive change)? Recommended: try `@theme inline` first since it's the mechanism Tailwind's own docs name for exactly this "value depends on a runtime-overridable variable" case, and it's a small, reversible change to verify — but this has not been tested against this repo's actual token layer, so it's not asserted as a plan, only as the first thing to try.
