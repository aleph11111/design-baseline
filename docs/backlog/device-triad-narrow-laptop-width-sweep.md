---
area: tooling
opened: 2026-11-07
status: needs-enrichment
value: normal
model: opus
model_reason: "new export plus a sweep over every kind:page archetype; real layout defects may surface and need triage against KNOWN_GAPS"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved Open question caps the score at 4"
  graded_at: 2026-11-07T00:00:00Z
---

# Device triad misses real laptop window widths between 1024 and 1512

## Context

The device triad in `src/testing/devices.mjs` tests `laptop14` at 1512x982, the full-screen MacBook Pro 14-inch viewport. A real 14-inch MacBook Chrome window with a side panel and browser chrome is about 1133x739 CSS px, and `AppShell` then leaves the content column roughly 780px (brickshop-manager `/orders/:id` at 1133x739 clips KPI tiles and pushes table columns off-screen). Viewport breakpoints (`sm`, `lg`) switch inside the 1024-1500 band, so that band is the most fragile and no device in `check:viewports` (`scripts/check-viewports.mjs`) or a consumer's `playwrightProjects` ever lands in it. Only `STEPS` (1903 and 1920) probe widths between the triad's devices, and those measure the column, not page invariants. Proposal: export a width sweep (1024..1512 step 64, invariants only, no screenshots) plus a `laptop14Window` 1133x739 device, both consumed by `check:viewports` and importable from `design-baseline/testing/devices` by consumers' Playwright suites.

## What to do

- [ ] Add `laptop14Window` (1133x739, deviceScaleFactor 2, not mobile, no touch) and a `widthSweep` list (1024 to 1512 step 64, same flags as `laptop14`) to `src/testing/devices.mjs` and `devices.d.mts`, keeping the file zero-dependency (header comment of `devices.mjs`).
- [ ] Keep `devices` and `playwrightProjects` at the three triad devices so the screenshot baselines and every consumer's project list are unchanged (`devices` drives the pixel suite via `src/testing/devices.test.ts`); export the two additions as separate named exports.
- [ ] In `scripts/check-viewports.mjs`, run `checkPageInvariants` (`src/testing/invariants.mjs`) for every `kind: page` archetype at `laptop14Window` and at each sweep width, with no screenshot and no contact-sheet entry; update the `total` count and the start line so the terminal shows the new run size.
- [ ] Any invariant the sweep exposes that is not fixed in the same PR is listed in `KNOWN_GAPS` with its ticket slug, so CI (`check.yml` runs `check:viewports`) stays green and each gap stays visible as a warning.
- [ ] Document `laptop14Window` and the sweep in `docs/STYLE.md` "The device triad" (a note stating they are real-window widths, not delivery devices) and bump the package version per the version-bump rule for shipped `src/` code.

## Acceptance

- `design-baseline/testing/devices` exports `laptop14Window` with a 1133x739 viewport and a `widthSweep` whose widths run from 1024 to 1512 in steps of 64, while `devices` still holds exactly `desk27`, `laptop14` and `phone`.
- `npm run check:viewports` prints one invariant result per `kind: page` archetype at `laptop14Window` and at every sweep width, and writes no extra screenshots.
- A page whose layout overflows horizontally at 1133 wide fails the check, or shows as a warning naming its `KNOWN_GAPS` ticket, instead of passing unseen.
- The pixel baselines under `tests/screenshots/` are unchanged by this ticket.

## Related

- [[device-triad-check-viewports]] — shipped the triad export and the invariant check this extends
- [[device-triad-screenshot-baselines]] — pixel baselines stay on the triad, not the sweep
- [[appshell-db-desk-width-steps-browser-check]] — the existing width probes (`STEPS`)
- [[heading-row-actions-squeeze-title-container-query]] — the real 1133x739 defect the sweep would catch (HeadingRow)
- [[detail-overview-rail-switch-container-query]] — same band, rail switches on viewport width
- [STYLE.md](/docs/STYLE.md) — "The device triad" section

## Open question

Where do the new devices live? Recommended (asserted above): separate named exports, leaving `devices` and `playwrightProjects` at three so screenshot baselines and consumer configs do not change. Alternative: add `laptop14Window` to `devices` so consumers get it as a Playwright project automatically, at the cost of a fourth screenshot baseline set and a changed `playwrightProjects` for every consumer.
