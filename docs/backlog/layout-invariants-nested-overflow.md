---
area: tooling
opened: 2026-11-07
status: ready
value: high
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-07T00:00:00Z
---

# Layout invariants miss overflow inside scroll containers

## Context

`src/testing/invariants.mjs` (`measure`, exported as `design-baseline/testing/invariants`) cannot see a page that overflows inside AppShell's `main`. The `clipped` check (lines 34–57) skips any element held by an `overflow-x: auto|scroll` ancestor, and the `overflow` check (line 28) reads only `document.documentElement.scrollWidth`. AppShell `main` is `overflow-auto`, so content 1624px wide inside an 877px `main` passes both: brickshop-manager `/orders/:id` at 1133x739 has its toolbar running to x=1750 and the line-item columns off-screen, and the invariants stay green. Every consumer Playwright suite and `check:viewports` share this one implementation, so the blind spot is fleet-wide.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add a `nestedOverflow` check in `measure`: any visible element with computed `overflow-x: auto|scroll` and `scrollWidth > clientWidth + 1` is a problem, unless it or an ancestor carries `data-scroll-region` (the marker for an intended scroll region, e.g. a wide table). Report the outermost offender, as `clipped` does.
- [ ] Add a `textClip` check: a text-bearing element with computed `overflow: hidden|clip` and `scrollWidth > clientWidth + 1` is cut-off text.
- [ ] Add a `headingLines` check: an `h1` whose rendered height exceeds 2 line-heights (wraps onto more than 2 lines).
- [ ] Add a `textOverlap` check: two visible text-bearing boxes whose rects intersect (excluding ancestor/descendant pairs and positioned overlays such as dialogs and popovers).
- [ ] Use the stable-code pattern already in the file (`<code>: <message>`, so `options.knownGaps` can downgrade each), update `invariants.d.mts`, document the four codes and the `data-scroll-region` marker in `docs/STYLE.md` "The device triad", and bump the version with a `CHANGELOG.md` entry.
- [ ] Run `npm run check:viewports` over every `kind: page` archetype demo; mark intended scroll regions with `data-scroll-region` in the donor primitives (data tables, matrix grid) instead of loosening the check, and record any real finding as a known gap with a ticket.

## Acceptance

- A fixture page with content wider than its `overflow-auto` container returns a `nestedOverflow` failure from `checkPageInvariants`, while the same container carrying `data-scroll-region` returns none.
- No other overflow-x scroll container in the gallery is flagged unless it overflows and is unmarked: `check:viewports` shows zero new failures on every archetype demo at desk27, laptop14 and phone, with every intended scroll region marked.
- A text element clipped by `overflow: hidden`, an `h1` wrapping onto a third line, and two overlapping text boxes each return their own coded failure (`textClip`, `headingLines`, `textOverlap`).
- The `clipped` and `overflow` results are unchanged for pages that already passed them.

## Related

- [[export-page-invariants]] — shipped the helper this extends
- [[device-triad-check-viewports]] — `check:viewports` consumes the same measurement
- [[app-header-phone-overflow]] — earlier overflow the invariants only partly caught
- [[pageframe-toolbar-overflow-collapse-rule]] — related toolbar overflow rule
- [[page-header-action-hierarchy-overflow-menu]] — pending sibling; same toolbar-overflow area
- [STYLE.md](/docs/STYLE.md) — "The device triad" documents the invariants
