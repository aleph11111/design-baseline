---
area: tooling
opened: 2026-10-29
status: ready
value: high
model: opus
model_reason: "new export + real-browser invariant suite across every page archetype; real defects may surface and need triage"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-29T12:00:00Z
---

# Device triad export and check:viewports layout invariants for every page archetype

## Context

Operator requirement 2026-10-29: every page is visually tested against the three deliverable devices — a 27-inch monitor, a 14-inch laptop and a phone. Today nothing does: `scripts/check-desk-width.mjs` only measures `.db-content-column` width at 1512/1903/1920/2560 on the `form-page` demo (no phone, no screenshots), and consumers screenshot at one viewport only (controlling-app `frontend/playwright.config.ts` 1440x900, hk-crm `playwright.config.ts` 1280x800). This is slice 1 of 2: the canonical device triad as a package export plus a layout-invariant check that needs no image baseline. Pixel baselines are slice 2, [[device-triad-screenshot-baselines]].

Device triad (operator-decided): `desk27` = 2560x1440 CSS px, deviceScaleFactor 1 (27-inch QHD; a 27-inch 5K at 2x gives the same CSS size); `laptop14` = 1512x982, deviceScaleFactor 2 (MacBook Pro 14-inch default scaling); `phone` = 390x844, deviceScaleFactor 3, isMobile, hasTouch (iPhone 15 class).

## What to do

- [ ] Ship `design-baseline/testing/devices` as a package export (`package.json` `exports` + `files`, a zero-dependency `.mjs` with a `.d.ts`, matching the existing `./vite/design-baseline-ui` `.mjs` export pattern): the three devices as plain objects plus a `playwrightProjects` array (`{ name, use }`) consumers spread into their `playwright.config` — never retyped.
- [ ] Add `scripts/check-viewports.mjs` and `npm run check:viewports`; it replaces `check:desk-width` (script and npm entry removed, its column-step and full-bleed measurements carried over) and reads the device triad from the export, not a copy.
- [ ] Render every `kind: page` archetype in `docs/archetypes/MANIFEST.json` from the built gallery at all three devices in real Chrome (`playwright-core`, `CHROME_PATH` — the `check-desk-width.mjs` pattern) and assert: no horizontal page overflow (`scrollWidth <= innerWidth`); no visible element's box past the viewport's right edge outside a scroll container; desktop page toolbar is one row; on phone the toolbar sits in the filter sheet (not inline) and nav is BottomNav or the sidebar sheet; phone tap targets (buttons, links, inputs) are at least 44px tall and wide.
- [ ] Fix real defects the check finds in donor archetypes when small; file the rest via `~/.fleet/lib/ticket-capture.sh`. No silent allowlist — any exemption is a named, commented entry in the script.
- [ ] Each run writes one local HTML contact sheet (gitignored path) with every archetype's screenshot at the three devices side by side and prints its path last.
- [ ] Run `npm run check:viewports` in `.github/workflows/check.yml` (ubuntu runner, its system Chrome via `CHROME_PATH`).
- [ ] Document the triad and `check:viewports` in `docs/STYLE.md` and `docs/PACKAGE.md` ("The enforcement stack", gate 3); update `CLAUDE.md` Commands; bump the package version (minor) so a new `v*` tag is cut.

## Acceptance

- `import { devices, playwrightProjects } from "design-baseline/testing/devices"` returns the three devices with the exact sizes, scale factors and flags above; `npm run verify:exports` passes with the new export.
- `npm run check:viewports` measures every `kind: page` MANIFEST archetype at all three devices, exits 0 on the donor, and exits non-zero when any invariant fails.
- The desk-width column steps (1144 / 1440 / 1680 and full-bleed `max-width: none`) are still asserted; `check:desk-width` no longer exists.
- After a run the printed contact-sheet path opens an HTML page showing every archetype at the three devices.
- The `check` job in `.github/workflows/check.yml` runs `check:viewports` and is green on the PR.

## Related

- [[appshell-db-desk-width-steps-browser-check]] — the desk-width check this absorbs
- [[app-header-phone-overflow]]
- [[page-header-actions-squeeze-title-on-phones]]
- [[device-triad-screenshot-baselines]] — slice 2 (pixel baselines)
- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — desk-width steps amendment
