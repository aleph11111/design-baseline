---
area: ui
opened: 2026-10-09
status: needs-enrichment
model: sonnet
model_reason: "scoped change following the existing joined-label width rule and ToolbarBandContext pattern; floor value decided"
value: normal
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-09T00:00:00Z
---

# SearchInput has no minimum width in a PageFrame toolbar band

## Context

`SearchInput` (`src/components/ui/search-input.tsx`) renders a `relative max-w-sm flex-1` wrapper with no minimum width. Inside a `PageFrame` toolbar band (`ToolbarBandContext`, `src/components/ui/toolbar-band.tsx`) a crowded band squeezes it until the placeholder is cut: mistra `/aufgaben` showed "Aufgabe" at 1440px. mistra PR #1389 forced a floor with `className="[&>div:first-child]:min-w-[14rem]"`, a selector that depends on the wrapper's internal DOM and that its reviewer rightly calls fragile. The joined-label controls already have a documented floor in a crowded band (STYLE.md "Toolbar field labels", v0.9.2); the search box, which counts as one of the 4 inline fields, has none.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `src/components/ui/search-input.tsx`, when rendered inside `ToolbarBandContext`, give the wrapper a `min-w-[14rem]` floor so it never shrinks below it (the band then scrolls, per the v0.9.2 joined-label rule, instead of clipping the placeholder). Outside a band the render is unchanged.
- [ ] Add an optional prop (e.g. `minWidth`) on `SearchInput` that overrides the 14rem floor, so no consumer `className` min-width hack is needed.
- [ ] In `docs/STYLE.md` "Toolbar field labels", document the search floor in the crowded-band rule next to the "Desktop cap" 4-field bullet, including the override prop.
- [ ] Add a test beside the existing `SearchInput` tests (`src/components/ui/control-density.test.tsx` pattern) covering the in-band floor, the override, and the unchanged out-of-band render; add a `src/examples/` gallery demo of a crowded band showing the search box holding its floor.
- [ ] Bump `package.json` version (0.9.2 → 0.9.3) and add a `## v0.9.3` entry to `CHANGELOG.md` (Consumer note: mistra drops its `[&>div:first-child]:min-w-[14rem]` hack).

## Acceptance

- `SearchInput` inside a `PageFrame` toolbar band renders with a 14rem minimum width and no longer shrinks below it in a crowded band.
- A `SearchInput` outside a band is unchanged (still `max-w-sm flex-1`, no floor).
- Passing the override prop sets the floor to the given value instead of 14rem.
- STYLE.md "Toolbar field labels" documents the search floor beside the 4-field cap, and `npm test` passes the version/CHANGELOG check.
- Every `SearchInput` call site in a band (e.g. `ListWithDetailToolbar`) gets the floor with no per-site className, not only the mistra one.

## Related

- [[pageframe-toolbar-overflow-collapse-rule]] — shipped the 4-field cap this floor sits next to
- [[native-field-joined-label-sheet-column]] — adjacent joined-label width work in the same band
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement
- [docs/STYLE.md](/docs/STYLE.md) — Toolbar field labels
