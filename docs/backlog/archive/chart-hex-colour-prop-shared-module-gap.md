---
area: tooling
opened: '2026-09-27'
status: done
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T09:47:33Z'
value: low
model: opus
model_reason: "designing a correct two-step cross-file correlation (avoiding false positives on unrelated shared modules) is a judgment call, not mechanical"
---

# chart-hex-colour-prop misses hex palettes defined in shared constant modules

## Context

The `chart-hex-colour-prop` signal (`docs/audit-signals.json:120`, added in #311) is gated on `coOccursWith` a chart-library import (`recharts`/`@nivo/*`/`react-chartjs-2`/`chart.js`) in the *same file* as the hex literal, so it misses a hex series palette defined in a separate shared constants module that is itself imported into a chart file (the module has no chart-library import of its own). The signal's own `smell` field already names this: "Known miss: a hex palette constant in a module that imports no chart library (a shared `colors.ts` fed into the props) — the scan under-reports it. Origin: 2026-09-27 house-look audit — controlling-app hardcodes Tailwind hex across its recharts components." Known live instance: `controlling-app frontend/src/components/dashboard/charts/shared.ts`. `docs/audit-signals.json` already has a precedent for a cross-file correlation shape (`settings-shell-board-form-wraps-carded-shell`, `docs/audit-signals.json:109`, its own note: "Only step 1 of a two-step correlation... step 2 lives in a DIFFERENT file, which the single-file scan cannot reach; the gate confirms it by opening the client").

The only known live instance (`controlling-app`'s `frontend/src/components/dashboard/charts/shared.ts`) is being fixed by controlling-app's own `adopt-house-look-v0-2-11` ticket, so this ticket guards against recurrence only — it is not blocking that fix. Note also that the scan cannot currently confirm that fix: zero hits there proves nothing about `shared.ts`, since the signal doesn't reach it either way (that's the gap this ticket closes).

## What to do

- [x] Extend `chart-hex-colour-prop` (or add a companion signal id) to catch a hex colour array/const in a module that is imported by a file matching the existing chart-library `coOccursWith` gate — following the two-step correlation shape already documented for `settings-shell-board-form-wraps-carded-shell`: step 1 (regex, single-file) flags the chart file's relative import of a local module; step 2 (the human/LLM acceptance-gate pass, per `docs/ADOPTION-QUALITY.md`) opens that imported module and confirms a hex literal array/const is what's being fed into the chart's colour props.
- [x] Cover the extension with a fixture in `scripts/scan-adoption-quality.test.mjs`, in the style of the existing `describe("scan-adoption-quality chart hex colour props (ADR-0007 §8)")` block (`scripts/scan-adoption-quality.test.mjs:402`) — a chart file importing a local `shared.ts`/`colors.ts` module that itself holds a hex array, with no chart-library import in that module.

## Acceptance

- The new fixture module (imports no chart library, holds a hex colour array consumed by a sibling chart file) is flagged by `npm run scan:adoption-quality`, and a control fixture (an unrelated shared module with no chart-file importer) is not.
- `npm test` passes.

## Related

- [[house-look-chart-palette]] — follow-up of this slice (#311): the ticket that shipped `chart-hex-colour-prop` and left this known miss in its own smell text
- `docs/audit-signals.json` — `chart-hex-colour-prop` and `settings-shell-board-form-wraps-carded-shell` (the existing two-step correlation precedent)
- ADR-0007 — The fleet house look: donor-fixed roles vs brand-overridable roles (§8, chart colours)

*Shipped: added the companion signal `chart-hex-colour-shared-module` (step 1 — flags a chart-library-gated file's relative import of a local `shared`/`colors`/`palette`/`theme` module), updated `chart-hex-colour-prop`'s "Known miss" text to point at it, and covered both with fixtures in `scripts/scan-adoption-quality.test.mjs`. Read-only scan runs against hk-crm and controlling-app confirmed no other signal's hit counts changed; controlling-app's known `charts/shared.ts` instance is now caught as a step-1 candidate (3 hits) for the gate to open and clear — it was independently already remediated to CSS vars.*

## Decision

**Question:** Should the fix be a mechanical extension of the existing `chart-hex-colour-prop` regex (single-file, best-effort, accepting some false positives on unrelated modules), or a proper two-step correlation entry matching the `settings-shell-board-form-wraps-carded-shell` precedent?

**Answer:** Two-step correlation, matching the `settings-shell-board-form-wraps-carded-shell` precedent — not a widened regex.

**Date:** 2026-09-28
