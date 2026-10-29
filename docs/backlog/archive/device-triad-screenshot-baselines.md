---
area: tooling
opened: '2026-10-29'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-10-29T10:31:25.889Z'
value: normal
model: opus
depends_on:
  - device-triad-check-viewports
---

---
area: tooling
opened: 2026-10-29
status: done
value: normal
model: opus
depends_on: [device-triad-check-viewports]
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-29T11:40:00Z
---

# Docker-pinned screenshot baselines per page archetype and device

## Context

Slice 2 of the operator's three-device visual-test requirement (2026-10-29). Slice 1, [[device-triad-check-viewports]] (v0.16.0), shipped the `design-baseline/testing/devices` export (`src/testing/devices.mjs`) and `scripts/check-viewports.mjs` (layout invariants plus a local contact sheet, no image baseline). This slice adds pixel baselines: one PNG per `kind: page` archetype in `docs/archetypes/MANIFEST.json` x 3 devices, generated and compared only inside the official Playwright docker image, so a macOS operator box and the CI runner render byte-identically (fonts, antialiasing). Team-lead requirement (2026-10-29): build it so consumers (controlling-app, hk-crm, brickshop-manager) reuse the same pinned image and helper from the package instead of inventing their own — this is `docs/PACKAGE.md` "The enforcement stack" gate 3 (`toHaveScreenshot()` per archetype page at the device triad).

## What to do

- [ ] Export `design-baseline/testing/docker` (`src/testing/docker.mjs` + `.d.mts`, zero-dependency, the `testing/devices` pattern): `PLAYWRIGHT_VERSION` and `PLAYWRIGHT_IMAGE` (`mcr.microsoft.com/playwright:v1.63.0-noble`, matching the installed `playwright-core` 1.63.0), and `assertInPlaywrightImage()`, which throws outside that image naming the wrapper command.
- [ ] Ship a `design-baseline-playwright` bin that runs any command inside the pinned image with the project mounted (its own Linux `node_modules` on a named volume, `npm ci` first), so a consumer runs `npx design-baseline-playwright npx playwright test` and never retypes the image.
- [ ] Donor baselines with Playwright's own `toHaveScreenshot()` (devDependency `@playwright/test` pinned exactly to the image's version): a `playwright.config` whose `projects` are `playwrightProjects` from the device export, serving the built gallery, and one spec that screenshots every `kind: page` MANIFEST archetype; the config calls `assertInPlaywrightImage()`. Baselines are committed.
- [ ] `npm run screenshots` (compare) and `npm run screenshots:update` (regenerate) both go through the bin; on failure Playwright's HTML report with expected/actual/diff images is written and its path printed.
- [ ] Run the compare in `.github/workflows/check.yml` as a job inside the same pinned image.
- [ ] Document the image, the bin and the consumer setup in `docs/STYLE.md` "The device triad" and `docs/PACKAGE.md` gate 3; bump the package version with a `CHANGELOG.md` entry.

## Acceptance

- Running the screenshot config outside the pinned image exits non-zero with a message naming `design-baseline-playwright`.
- `npm run screenshots` exits 0 on an unchanged tree and fails when any archetype's rendering at any of the three devices changes beyond the threshold.
- `import { PLAYWRIGHT_IMAGE, assertInPlaywrightImage } from "design-baseline/testing/docker"` resolves in a consumer, and `npm run verify:exports` passes.
- The `check` workflow runs the compare in the pinned image and is green on the PR.

## Related

- [[device-triad-check-viewports]] — must ship first: it creates the device export and gallery-render harness this slice screenshots
- [[phone-tap-targets-touch-density-default]] — shipped v0.17.0; phone renders the baselines capture
- [`docs/PACKAGE.md`](/docs/PACKAGE.md) — "The enforcement stack", gate 3
