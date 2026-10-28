---
area: tooling
opened: 2026-10-28
status: done
value: high
model: opus
model_reason: "adds an error-severity rule type and a per-file shrink-only ratchet to the zero-dep scanner, plus a cross-repo no-fit workflow; schema and ratchet-storage design are open"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-28T00:00:00Z
---

# Consumer pages must render one archetype shell, never PageFrame alone

## Context

Operator decision 2026-10-28: a consumer page renders exactly one `kind: page` archetype shell from `docs/archetypes/MANIFEST.json` (`list-with-detail`, `form-page`, `detail-overview`, `settings-table`, `grouped-list`, `matrix-grid`, `tabbed-settings`, `analytics-dashboard`, `import-wizard`, `feed-inbox`, `kanban-board`, `report`, `statement-with-filters`, `calendar`, `settings-sections`). `PageFrame` alone is never an acceptable choice: it is the frame the shells render through, not an archetype.

Evidence: controlling-app `docs/patterns/frontend-workspace-data-page.md:9` allows "an archetype shell or the package PageFrame". Agents use that loophole for 500-700 line hand-built pages, each a `PageFrame` around a bespoke body: `frontend/src/app/workspace/bankenreporting/page.tsx` (710 lines), `planung` (673), `reconciliation` (605). Archetype choice is only gate 4 (human review) in the `docs/PACKAGE.md` "The enforcement stack" table, and that doc's own rule says a prose-only rule that keeps being violated moves down into gate 2 (lint). `scripts/lint-design.mjs` reads `_adherence.json` rules and never asks whether a page file uses a shell at all.

This ticket SUPERSEDES the approach in [[adherence-lint-route-page-archetype-import-rule]] (any import of an archetype plus a free-text `baseline-exempt: <reason>` waiver, "new or touched files" ratchet, still open on trunk). That card should be discarded separately.

## What to do

- [ ] Add a `docs/RULES.md` hard rule: a consumer page renders exactly one `kind: page` archetype shell; `PageFrame` alone is never a choice; the no-fit path is the archetype-gap ticket below, never a hand-rolled stopgap.
- [ ] Add a page-shape rule type to the `_adherence.json` schema and `scripts/lint-design.mjs`, severity `error`: a file matching the consumer's page glob (e.g. `src/app/**/page.tsx`) must import a `kind: page` shell from `design-baseline/archetypes/<slug>` OR the `@/components/archetypes/<slug>` alias, and a direct `PageFrame` import in a page file is an error.
- [ ] The only waiver is a comment `archetype-gap: <design-baseline ticket slug>` citing an open gap ticket; a waiver with no slug, or whose slug is not an open ticket, is a violation.
- [ ] Grandfather existing violators with a per-file ratchet that only shrinks: a committed list of grandfathered page files in the consumer, a file leaves the list when it is fixed and can never be re-added.
- [ ] Define the no-fit path in `docs/RULES.md` and `docs/PACKAGE.md`: an agent that finds no fitting archetype stops page work and files an archetype-gap ticket into design-baseline (dashboard `POST /api/ticket/create`, `repoName: design-baseline`) describing the page's shape. That ticket starts the "define/find archetype" session, which either maps the shape to an existing archetype (find) or runs brainstorm then promotion (define). The page ticket is blocked on it.
- [ ] Update `docs/PACKAGE.md`: move surface choice from gate 4 (review) to gate 2 in the enforcement-stack table, and add the consumer `CLAUDE.md` line: "New page: pick a kind:page archetype (CHOOSING-A-SURFACE.md), scaffold with npx design-baseline new-page <archetype> <Name>; no fit means file an archetype-gap ticket in design-baseline, never PageFrame alone."
- [ ] Add fixtures to `scripts/lint-design.test.mjs`: page file with no shell import (hit), page importing a shell via the package path (no hit), via the `@/components/archetypes/<slug>` alias (no hit), page with a direct `PageFrame` import (hit), page with `archetype-gap: <slug>` waiver (no hit), waiver with no slug (hit), grandfathered file (no hit), non-page file (no hit).
- [ ] Rollout outside this repo: file tickets in each consumer to configure the page glob and ratchet list, and fix controlling-app `docs/patterns/frontend-workspace-data-page.md:9` to drop "or the package PageFrame".

## Acceptance

- `lint:design` reports an `error` for a file under the configured page glob that imports no `kind: page` shell, and exits 1.
- A page file that imports `PageFrame` directly is reported as an error even when it also imports a shell.
- A page file carrying `archetype-gap: <open-ticket-slug>` is no longer flagged; a waiver naming no slug is flagged.
- A grandfathered page file is unchanged: not flagged; a file removed from the ratchet list is flagged again if it violates.
- `docs/PACKAGE.md` lists surface choice under gate 2 and shows the consumer `CLAUDE.md` line verbatim.
- `docs/RULES.md` states the one-shell rule and the archetype-gap no-fit path.

## Related

- [[adherence-lint-route-page-archetype-import-rule]] — superseded by this ticket: weaker waiver (`baseline-exempt`) and "touched files" ratchet; discard separately
- [[archetype-page-scaffolding-generator]] — shipped the `new-page` bin the `CLAUDE.md` line points at
- [[adoption-scan-flags-unshelled-list-page]] — same blind spot measured as a scan signal, not a gate
- [[adherence-lint-warn-to-error-ratchet]] — existing severity ratchet precedent
- [ADR-0003](/docs/adr/0003-adherence-lint-zero-dep-scanner.md) — zero-dep scanner constraint
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, shells render through it
