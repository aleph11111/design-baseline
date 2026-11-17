---
area: layout
opened: 2026-11-16
status: ready
value: normal
blocked_on_branch: feat/code-health-browser-check-scripts-shared-server
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-16T00:00:00Z
---

# NativeField joined number input overflows the 430px filter sheet

## Context

A joined `NativeField` (`src/components/archetypes/raw-input/native-field.tsx:282`) in a toolbar band lays out label + value as `grid grid-cols-[auto_minmax(max-content,1fr)]`. The `max-content` track floor makes a `type=number` input keep its intrinsic width (258px), so in the 430px `PageFrame` filter sheet its right edge lands at 414 vs the control root at 406 — an 8px overflow on Linux Chrome. Repro: run `node scripts/check-joined-label.mjs` inside the pinned Playwright image (`src/testing/docker.mjs`) with the `INPUT` exemption in `valueWhole` removed; the `430px` crowded-band sheet case fails. The exemption (`p.tagName === "INPUT" ||` in `valueWhole`, `scripts/check-joined-label.mjs`) exists only on the unmerged branch `feat/code-health-browser-check-scripts-shared-server`, added so CI passes; this ticket fixes the component and removes it. The fixed-box branch (`inline-flex w-full`, `min-w-0 grow`) already lets the input shrink — only the auto-width grid branch is affected.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In the non-`fixedBox` joined branch of `native-field.tsx`, let the input shrink to the available column (value column floor `0` instead of `max-content`, input `w-full min-w-0`) so every `<input>` type fits the sheet, without regressing the value-before-label rule of [[joined-label-shrinks-before-value]].
- [ ] Remove the `p.tagName === "INPUT" ||` exemption from `valueWhole` in `scripts/check-joined-label.mjs` (once the branch carrying it has merged).

## Acceptance

- `node scripts/check-joined-label.mjs` in the pinned Playwright image passes the `430px` crowded-band sheet case with no `INPUT` exemption: the input's right edge is at or before the control root's (≤406).
- No other joined field type (text, number, date, select-wrapped native) overflows its band or sheet at 430px, 1024px or 1440px; the label floor of [[joined-label-floor-too-small]] is unchanged.

## Related

- [[native-field-joined-label-sheet-column]]
- [[joined-label-shrinks-before-value]]
- [[joined-label-floor-too-small]]
- [[pageframe-mobile-filter-sheet]]

## Note — implemented mechanism (2026-11-17)

What to do's literal mechanism (value column floor `0`, input `w-full min-w-0` on the
component's non-`fixedBox` branch) regresses the band runs: `1fr` in an auto-width grid
resolves to 0, so the input collapses (probe: 1440px band, input width 236 → 26). The
shipped fix instead adds `min-w-0` to the value cell (track stays `max-content` in the
band) and extends the `FilterSheet` class-list re-scope — which already covers the select
`button` trigger and the `radiogroup` — with the NativeField `div` grid row
(`[&_div.grid:has([data-joined-label])]:grid-cols-[130px_minmax(0,1fr)]!`).
