---
area: tooling
opened: 2026-11-07
status: done
value: normal
model: opus
model_reason: "new export plus a sweep over every kind:page archetype; real layout defects may surface and need triage against the sweep's gaps map"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-07T22:00:00Z
---

# Device triad misses real laptop window widths between 1024 and 1512

## Context

The device triad in `src/testing/devices.mjs` tests `laptop14` at 1512x982, the full-screen MacBook Pro 14-inch viewport. A real 14-inch MacBook Chrome window with a side panel and browser chrome is about 1133x739 CSS px, and `AppShell` then leaves the content column roughly 780px (brickshop-manager `/orders/:id` at 1133x739 clips KPI tiles and pushes table columns off-screen). Viewport breakpoints (`sm`, `lg`) switch inside the 1024-1500 band, so that band is the most fragile and no device in `check:viewports` (`scripts/check-viewports.mjs`) or a consumer's `playwrightProjects` ever lands in it. Only `STEPS` (1903 and 1920) probe widths between the triad's devices, and those measure the column, not page invariants.

Approach (operator decision 2026-11-07, option B): two separate named exports, `laptop14Window` and a three-point `widthSweep`, invariants only, no screenshots. `devices` and `playwrightProjects` stay at the three triad devices, so `playwright.config.mjs` (which spreads `playwrightProjects` into the pixel suite) and every consumer's project list are unchanged. Three sweep points at window height instead of a 64px grid keeps the cost to about 51 extra page loads (17 `kind: page` archetypes x 3) instead of about 153; 1512 is already `laptop14`.

`KNOWN_GAPS` in `scripts/check-viewports.mjs` is keyed donor-wide by problem code (`checkPageInvariants` in `src/testing/invariants.mjs` matches the prefix before `:`), so adding a code for one sweep finding would downgrade that code on every page at every triad device. The sweep therefore needs its own gaps map, keyed per page and width.

The gallery demos carry few header actions, so the 1133 HeadingRow defect ([[heading-row-actions-squeeze-title-container-query]]) would not trip on the existing demos; one demo has to carry a long action row for the sweep to exercise it.

## What to do

- [ ] Add `laptop14Window` (1133x739, deviceScaleFactor 2, not mobile, no touch) and `widthSweep` (widths 1024, 1133, 1280, each at height 739 with the same flags as `laptop14Window`) to `src/testing/devices.mjs` and `devices.d.mts` as separate named exports, keeping the file zero-dependency (header comment of `devices.mjs`). `devices` and `playwrightProjects` keep exactly `desk27`, `laptop14`, `phone`.
- [ ] Extend `src/testing/devices.test.ts` (it pins the device values; it does not drive the pixel suite) to pin `laptop14Window` and `widthSweep`, and to assert `devices` still has exactly three keys.
- [ ] In `scripts/check-viewports.mjs`, run `checkPageInvariants` for every `kind: page` archetype at each `widthSweep` point (1133 is `laptop14Window`), with no `column` option, no screenshot and no contact-sheet entry; update `total` and the start line so the terminal shows the new run size.
- [ ] Add a sweep-only gaps map in `scripts/check-viewports.mjs` keyed `<slug>@<width>:<code>` to a ticket slug, and leave the triad `KNOWN_GAPS` untouched; a sweep finding listed there prints as a warning naming its ticket, any other fails.
- [ ] Give one `kind: page` demo under `src/examples/` a page heading with a long action row (enough actions to overflow at a ~780px column), so the sweep exercises the HeadingRow squeeze at 1133; if it trips, list it in the sweep gaps map against [[heading-row-actions-squeeze-title-container-query]] rather than fixing HeadingRow here.
- [ ] Triage every other sweep finding (expect `toolbarRows` at 1024) as a defect, filed via `/ticket` and listed in the sweep gaps map, or as accepted behaviour, recorded in the PR description.
- [ ] Document `laptop14Window` and the sweep in `docs/STYLE.md` "The device triad" (a note stating they are real-window widths checked for invariants only, not delivery devices) and bump the package version per the version-bump rule for shipped `src/` code.

## Acceptance

- `design-baseline/testing/devices` exports `laptop14Window` with a 1133x739 viewport and a `widthSweep` holding exactly widths 1024, 1133 and 1280 at height 739, while `devices` still holds exactly `desk27`, `laptop14` and `phone`.
- `npm run check:viewports` prints one invariant result per `kind: page` archetype at every sweep width, its start line and `total` count include them, and it writes no extra screenshots.
- A page whose layout overflows horizontally at 1133 wide fails the check, or shows as a warning naming its sweep-gaps ticket, instead of passing unseen.
- The triad `KNOWN_GAPS` map is unchanged, so no sweep finding downgrades any problem code at `desk27`, `laptop14` or `phone`.
- The pixel baselines under `tests/screenshots/` and `playwrightProjects` are unchanged by this ticket.

## Related

- [[device-triad-check-viewports]] — shipped the triad export and the invariant check this extends
- [[device-triad-screenshot-baselines]] — pixel baselines stay on the triad, not the sweep
- [[appshell-db-desk-width-steps-browser-check]] — the existing width probes (`STEPS`)
- [[heading-row-actions-squeeze-title-container-query]] — the real 1133x739 defect the sweep's long-action demo should surface
- [[detail-overview-rail-switch-container-query]] — same band, rail switches on viewport width
- [[invariants-overflow-blind-under-mobile-emulation]] — same helper (`invariants.mjs`); its fix is phone-only and does not affect these non-mobile sweep runs
- [STYLE.md](/docs/STYLE.md) — "The device triad" section
