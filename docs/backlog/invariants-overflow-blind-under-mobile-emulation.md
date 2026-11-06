---
area: tooling
opened: 2026-11-06
status: ready
value: high
model: sonnet
model_reason: "scoped fix in one helper with an established cause and a known repro"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-06T00:00:00Z
---

# Layout invariants overflow check passes silently under mobile emulation

## Context

`measure()` in `src/testing/invariants.mjs` takes `W = window.innerWidth` (line 16) and compares `document.documentElement.scrollWidth` against it (line 28, `overflow: page scrolls sideways`). Under Playwright mobile emulation (`device.isMobile`, the `phone` device in `src/testing/devices.mjs`) the layout viewport grows to fit overflowing content, so `innerWidth == scrollWidth` and real phone overflow never trips the check. Repro: before the `gallery/Gallery.tsx` ArchetypeInfoBar flex-wrap fix (branch `feat/archetype-gap-matrix-grid-docked-inspector`), matrix-grid at phone had `innerWidth` 418 against a 390 viewport (the spec-path `<code>` overflowed) and `check:viewports` passed. `W` also feeds the `clipped:` edge check (lines 36-56), so it has the same blind spot. The helper is shared (`design-baseline/testing/invariants`), so every consumer's phone suite inherits it.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Pass the device viewport width into `measure()` (the `page.evaluate` call at line 144 already passes device-derived options; add `device.viewport.width`) and use it for `W` instead of `window.innerWidth`, so the `overflow` and `clipped` checks both measure against the real device width.
- [ ] Add a check that fails when the layout viewport has grown past the device width (`window.innerWidth > device.viewport.width`), reported under the `overflow` code.
- [ ] Add a regression test that renders a deliberately overflowing element under the phone device and asserts `assertPageInvariants` throws; bump the version with a `CHANGELOG.md` entry, since consumers pick up the stricter check.

## Acceptance

- `assertPageInvariants(page, devices.phone)` throws with an `overflow:` failure on a page with a 418px-wide element at the 390px phone viewport.
- No other check in `measure()` reads `window.innerWidth` for a width comparison; every call site uses the device viewport width.
- `npm run check:viewports` still passes on the current gallery after the change, and desktop and laptop results are unchanged.

## Related

- [[export-page-invariants]] — introduced the shared helper
- [[device-triad-check-viewports]] — the check:viewports device triad this runs under
- [[app-header-phone-overflow]] — an earlier phone overflow the check should have caught
