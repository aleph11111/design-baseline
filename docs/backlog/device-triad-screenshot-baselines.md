---
area: tooling
opened: 2026-10-29
status: ready
value: normal
model: opus
depends_on: [device-triad-check-viewports]
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-29T12:00:00Z
---

# Docker-pinned screenshot baselines per page archetype and device

## Context

Slice 2 of the operator's three-device visual-test requirement (2026-10-29). Slice 1, [[device-triad-check-viewports]], ships the `design-baseline/testing/devices` export and `scripts/check-viewports.mjs` (layout invariants plus a local contact sheet, no image baseline). This slice adds pixel baselines: one PNG per `kind: page` archetype in `docs/archetypes/MANIFEST.json` x 3 devices, generated and compared only inside the official Playwright docker image, so a macOS operator box and the CI runner render byte-identically (fonts, antialiasing).

## What to do

- [ ] Pin the `mcr.microsoft.com/playwright` image tag to the installed `playwright-core` version in `package.json`, and add an npm script that runs the baseline capture/compare inside it (`docker run` with the repo mounted).
- [ ] Capture each `kind: page` gallery demo at `desk27` / `laptop14` / `phone` from the slice-1 device export into a tracked baseline dir; compare against it with a small pixel-diff threshold and write diff images next to the contact sheet on failure.
- [ ] Add an update mode (regenerate baselines) that also only runs inside the image, and refuse to write baselines outside docker.
- [ ] Run the compare in `.github/workflows/check.yml` inside the same pinned image.

## Acceptance

- Running the compare outside the pinned image exits non-zero with a message naming the docker script.
- The compare exits 0 on an unchanged tree and fails when any archetype's rendering at any of the three devices changes beyond the threshold.
- The `check` CI job runs the compare in the pinned image and is green on the PR.

## Related

- [[device-triad-check-viewports]] — must ship first: it creates the device export and gallery-render harness this slice screenshots
