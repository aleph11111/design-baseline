---
area: tooling
opened: 2026-10-29
status: done
value: high
model: sonnet
model_reason: "move existing in-page checks behind an export; behaviour unchanged, pattern set by testing/devices"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-29T12:10:00Z
---

# Export the check:viewports layout invariants as a consumer Playwright helper

## Context

`scripts/check-viewports.mjs` holds the layout invariants every page must meet at the device triad (no sideways scroll, nothing cut off at the edge, content column / full-bleed, one-row desktop toolbar, phone filter sheet, phone nav, 44pt phone tap targets, the edge-tap overlap probe) plus the `KNOWN_GAPS` mechanism, but only as code inside the donor script. Consumers (controlling-app, brickshop-manager) are about to port that logic into their own Playwright suites — two copies that drift from the donor. Team-lead priority 1 (2026-10-29): ship it as a package export, `design-baseline/testing/invariants`, next to `testing/devices` and `testing/docker`, and make `check:viewports` use the export so there is one implementation.

## What to do

- [ ] Move the in-page measurement out of `scripts/check-viewports.mjs` into `src/testing/invariants.mjs` (+ `.d.mts`, zero-dependency, the `testing/devices` pattern): `checkPageInvariants(page, device, options)` returns `{ failures, knownGaps }`, and `assertPageInvariants(page, device, options)` throws listing every failure. Every problem carries a stable code prefix (`overflow`, `clipped`, `column`, `fullBleed`, `toolbarRows`, `phoneToolbar`, `phoneNav`, `tapTargets`, `tapOverlap`), and `options.knownGaps` maps a code to a ticket slug to downgrade it to a reported warning.
- [ ] Options for the donor-specific checks: `column` (expected content-column width) and `fullBleed` (whether the page is a full-bleed archetype); each check is skipped when its option is absent.
- [ ] `scripts/check-viewports.mjs` imports the export; its own copy of the measurement is deleted and its behaviour (47 checks, contact sheet) is unchanged.
- [ ] Export it in `package.json` (`exports` + `files` via `src/testing`), document the consumer usage in `docs/STYLE.md` "The device triad" and `docs/PACKAGE.md` gate 3, bump the version with a `CHANGELOG.md` entry.

## Acceptance

- `import { assertPageInvariants } from "design-baseline/testing/invariants"` resolves and `npm run verify:exports` passes.
- `npm run check:viewports` still reports 47/47 with no inline copy of the measurement left in `scripts/check-viewports.mjs`.
- `assertPageInvariants` throws when a failure is present and does not throw when every problem's code is listed in `knownGaps`.

## Related

- [[device-triad-check-viewports]] — shipped the invariants inside the script
- [[phone-tap-targets-touch-density-default]] — added the 44pt and edge-tap checks
- [[device-triad-screenshot-baselines]] — the sibling `testing/docker` export
