---
area: tooling
opened: 2026-10-28
status: needs-enrichment
value: normal
model: opus
model_reason: "new rule type extends the _adherence.json schema and the ratchet mechanism is a design call"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved Open question caps the score at 4"
  graded_at: 2026-10-28T00:00:00Z
---

# Adherence lint needs a page-shape rule requiring archetype imports in route files

## Context

`_adherence.json` rules only check atoms (`no-bare-h1`, `no-raw-table`, `no-bare-button`, `literal-color`, `weak-focus-ring`, `raw-html-control`), all at `warn`. `scripts/lint-design.mjs` never asks whether a route file uses an archetype at all. A consumer (brickshop-manager, hk-crm) can build a new route page from `Card` + `Button` + a div grid with no import from `design-baseline/archetypes/*` and `lint:design` passes clean. Archetype choice is only gate 4 (human review) in the `docs/PACKAGE.md` "The enforcement stack" table, and that doc's own rule says a prose-only rule that keeps being violated should move down the stack into gate 2.

Rollout gap: hk-crm runs `lint:design` in `.github/workflows/ci.yml:51` and has `.claude/hooks/design-guard.mjs`; brickshop-manager has no `lint:design` script in `package.json` and no design hook. Agent gap: neither consumer's `CLAUDE.md` points at the `bin/new-page.mjs` scaffolder (documented at `docs/PACKAGE.md:171`), so agents clone the neighbouring hand-rolled page instead.

## What to do

- [ ] Add a page-shape rule type to the `_adherence.json` schema and `scripts/lint-design.mjs`: files matching a consumer-configured routes glob must import `design-baseline/archetypes/*` or carry a `baseline-exempt: <reason>` comment; an exempt comment with no reason is a violation.
- [ ] Ratchet it so only new or touched route files are gated; existing hand-rolled pages are not flagged until edited.
- [ ] Feed exempt reasons into `docs/PROMOTION-RADAR.md` as gap candidates (the scan that reads them follows the `scripts/scan-adoption-quality.mjs` pattern, per [ADR-0005](/docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md)).
- [ ] Add fixtures to `scripts/lint-design.test.mjs`: a route with no archetype import (hit), one importing `design-baseline/archetypes/list-with-detail` (no hit), one with `baseline-exempt: <reason>` (no hit), one with a bare `baseline-exempt` (hit), a non-route file (no hit).
- [ ] Add to the `docs/PACKAGE.md` consumer wiring a `CLAUDE.md` line: a new route starts with `npx design-baseline new-page <archetype> <Name>`, archetype chosen via `docs/CHOOSING-A-SURFACE.md`; and update the enforcement-stack table so page shape is listed under gate 2.
- [ ] Rollout outside this repo: file tickets in brickshop-manager (add `lint:design` script, CI step, design hook mirroring hk-crm, plus the `CLAUDE.md` line) and hk-crm (routes glob config plus the `CLAUDE.md` line).

## Acceptance

- `lint:design` reports a violation for a file under the configured routes glob that has no `design-baseline/archetypes/*` import and no `baseline-exempt: <reason>` comment.
- A routes file importing an archetype, or carrying `baseline-exempt: <reason>`, is no longer flagged.
- A route file untouched since the ratchet baseline is unchanged: not flagged.
- `docs/PACKAGE.md` shows the `new-page` `CLAUDE.md` line in the consumer wiring section.

## Related

- [[adoption-scan-flags-unshelled-list-page]] — same blind spot (page with no shell import) measured as a scan signal, not a gate
- [[archetype-page-scaffolding-generator]] — shipped the `new-page` bin this ticket points agents at
- [[archetype-package-consumer-wiring]] — origin of the `docs/PACKAGE.md` wiring section
- [[adherence-lint-warn-to-error-ratchet]] — existing severity ratchet precedent
- [ADR-0003](/docs/adr/0003-adherence-lint-zero-dep-scanner.md) — zero-dep scanner constraint

## Open question

How does the "new or touched files only" ratchet know which files are touched? Options: (A, recommended) `lint-design.mjs --changed-since <ref>` using `git diff --name-only`, which keeps the scanner zero-dep and needs no state file; (B) a committed baseline list of grandfathered route files that shrinks over time; (C) none, gate every route and use `baseline-exempt` for legacy. Not settled; the ticket assumes A until reviewed.
