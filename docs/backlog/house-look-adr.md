---
area: ui
opened: '2026-09-27'
status: ready
value: normal
model: opus
model_reason: "design decision with tradeoffs across three consumers — which roles become fixed vs brand-overridable is judgment, not pattern-following"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-27T07:30:00Z'
---

# Decide the fleet house look in an ADR for the donor token layer

## Context

The 2026-09-27 visual audit of controlling-app, mistra and hk-crm (mockups: canvas https://claude.ai/artifact/WTzamiq9fWH9RDM136njKG, rows 1–3) found the apps consistent but flat: default shadcn look, small type on an unbounded full-width canvas, no focal point, card-in-card borders, no brand accent, status pills louder than content. Root cause: the donor declares only *what a project may override* (the `:root`/`.dark` palette in `src/styles/tokens.css`) and has no opinion on scale, width, surfaces, or accent usage, so every consumer inherits the same neutral defaults. It also leaves roles that should be shared as de-facto per-app drift: mistra's `--ring` is blue on a teal `--primary`, controlling-app's dark `--primary` falls back to slate, and there is no chart palette at all — mistra, hk-crm and controlling-app each invent a different `--chart-*` order (controlling-app hardcodes hex in recharts). The shared layer the fix lands in is `src/styles/tokens.layer.css` plus `src/components/layout/` (`PageHeader`, `StatTile`, `AppShell`). Per ADR-0004 (appearance locality), these are global/fixed-in-component appearance, not per-call-site props, which is why this is a donor-level decision.

## What to do

- [ ] Write the ADR (next free number in `docs/adr/`, row added to `docs/adr/INDEX.md`) deciding the house look. It must decide each of these, recommended defaults from the mockups in brackets:
  - max content width and page rhythm [~1180px content column, 48/56px page padding]
  - a display type step for page titles and headline numbers [30px title, 34px stat value; `PageHeader` h1 moves off `text-lg`]
  - surface elevation steps [sidebar below canvas below raised; fewer borders, tone does the separation]
  - accent-usage rule [one brand accent, used on primary action, active nav, progress; `--ring` and dark-mode `--primary` follow the brand accent]
  - status pills [quiet tinted chips on the existing `--status-*-bg/fg` tier, not solid fills]
  - `StatTile` with a context line under the value
  - empty state with one next-step action
  - a shared `--chart-1..6` palette with a fixed series order
- [ ] Split every role the ADR touches into **fixed** (donor-owned in `tokens.layer.css`, not overridable) vs **brand-overridable** (stays in the project's `tokens.css`) — today only the second list exists, which is why ring/dark-primary/chart order drift per app.
- [ ] Record the adoption blockers in the ADR's consequences: consumers are pinned at `v0.2.2` (hk-crm) / `v0.2.3` (controlling-app, mistra) against donor `0.2.7`, and all three keep local copies of `components/layout/` (`PageHeader`, `AppShell`) rather than importing the package — so no donor change reaches them until each adopts.
- [ ] File one follow-up ticket per implementation slice via `/ticket` (tokens layer roles, `PageHeader` title step, `StatTile` context line, empty-state primitive, chart palette); rollout into consumers happens from each project's own session, not from the donor.

## Acceptance

- The new ADR is added to `docs/adr/` with status Accepted and its row is listed in `docs/adr/INDEX.md`.
- Every role the ADR names is classified as fixed or brand-overridable; no role is left unclassified.
- The ADR's decision on `--ring` and dark-mode `--primary` makes mistra's blue-ring-on-teal and controlling-app's slate dark primary non-conformant once adopted.
- Follow-up implementation tickets are filed in `docs/backlog/` before this ticket closes; no code changes ship under this ticket.

## Related

- [archive/donor-status-token-roles-badge-alert-backport.md](archive/donor-status-token-roles-badge-alert-backport.md) — the status-chip tier the quiet pills build on
- [archive/tokens-brand-font-seam-and-split-guard.md](archive/tokens-brand-font-seam-and-split-guard.md) — the donor-layer / brand-file split this ADR extends
- [mistra-package-install-cutover.md](mistra-package-install-cutover.md) — mistra's vendored copies are one of the adoption blockers
- [archetype-convergence.md](archetype-convergence.md) — delivered roadmap whose token split made a donor-owned layer possible
- ADR-0004 — appearance locality: global or fixed in the component; per-call-site only when derived
