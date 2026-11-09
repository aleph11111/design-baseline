---
area: tooling
opened: 2026-11-09
status: ready
value: normal
model: sonnet
model_reason: "one new measure in an existing invariant helper, cause and shape established; pattern matches the other checks in invariants.mjs"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-09T12:10:00Z
---

# Page invariants miss a collapsed page title in the header row

## Context

`HeadingRow` (`src/components/layout/HeadingRow.tsx`) wraps header actions inside a 60% cap since v0.29.5 (the fix for [[heading-row-actions-squeeze-title-container-query]]), so wrapping actions is intended behaviour. But `checkPageInvariants` in `src/testing/invariants.mjs` has no check that the page title keeps a usable width: it only catches the squeeze when it also makes the page overflow sideways. If the squeeze regresses (re-added `shrink-0` on `HEADING_ROW_CLASSES.actions`, or the 60% cap dropped) and the title collapses, for example `SO-2026-00053` wrapping mid-token in the ~780px column, `npm run check:viewports` still reports ok. Repro: the detail-overview demo at `widthSweep` 1133 (`src/examples/detail-overview-demo.tsx`, typed header actions that wrap at 1024 and 1133) passes today. Undo the 60% cap locally and it still passes unless overflow occurs. Raised by the PR #709 review gate.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add a desktop-only measure to `measure()` in `src/testing/invariants.mjs`, as a new `titleSqueeze:` problem code: the content column's `h1` (and a `NestedPageHeading` `h2` in a header row) must be at least as wide as its longest unbreakable word, so it never wraps mid-token.
- [ ] Prove the check with a temporary local regression (e.g. `shrink-0` back on `HEADING_ROW_CLASSES.actions`): `npm run check:viewports` fails `detail-overview @ sweep 1133`. Revert the regression.
- [ ] Document the new invariant in `docs/STYLE.md` "The device triad" bullet list and bump the package version + `CHANGELOG.md` (consumers call the same helper).

## Acceptance

- `checkPageInvariants` returns a `titleSqueeze:` failure when a page title is narrower than its longest word on a non-mobile device.
- With the squeeze reintroduced, `npm run check:viewports` fails at the 1024 and 1133 sweep widths. On the current code it passes with no other page newly failing at any triad device or sweep width.
- Every heading-row consumer (`PageHeader`, `NestedPageHeading`, every shell through `PageFrame`) is covered by the one check, with no per-page assertion.

## Related

- [[heading-row-actions-squeeze-title-container-query]] — the fix this guards
- [[device-triad-narrow-laptop-width-sweep]] — the sweep that renders the 1133 case
- [[layout-invariants-nested-overflow]]
- [[export-page-invariants]]
