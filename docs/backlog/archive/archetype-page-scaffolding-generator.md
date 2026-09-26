---
area: tooling
opened: 2026-09-26
status: done
value: normal
model: opus
model_reason: "the delivery-mechanism call (package bin vs skill step) and the consumer route-registry seam are design decisions, not slot-filling"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-26T12:00:00Z'
---

# Ship an archetype page scaffolding generator from the design-baseline package

## Context

The aim is that a new consumer page is conformant by construction. It should start out
importing its archetype's shell and the required loading / empty / error states, instead of
being copied from a neighbouring page and inheriting that page's drift. brickshop-manager
planned this as `archetype-page-scaffolding-generator` (Phase 4 of its
`archetype-frontend-enforcement-ROADMAP`, spec
`docs/superpowers/specs/2026-09-02-archetype-frontend-enforcement-design.md` in that repo):
`scripts/new-page.ts` + `npm run generate:page` + plain template files. The in-repo choice was
justified as "copyable into design-baseline". brickshop's package cutover (brickshop PR #1165)
deletes its vendored `src/components/archetypes/` and archives its local archetype specs. The
shells the templates would wrap now live here, behind `exports["./archetypes/*"]` in
`package.json`, so the generator belongs in this repo and is discarded in brickshop. The
per-archetype demos in `src/examples/*-demo.tsx` (e.g. `list-with-detail-demo.tsx`,
`form-page-demo.tsx`, `detail-overview-demo.tsx`) are the conformant reference compositions the templates follow.

## What to do

- [x] Ship the generator as a package bin (`bin` entry in `package.json`: `design-baseline new-page <archetype> <Name>`), so every consumer gets it with the dependency and CI can run it.
- [x] Write one minimal template for each of the 14 page archetypes in `MANIFEST.json`. A two-way test keeps the templates and the page archetypes in step. Templates are written fresh, not converted from the demos: the demos use the donor `@/` alias and render every variant side by side. Component and dialog archetypes get none, because they are not pages.
- [x] Leave route registration to the consumer through `--register <cmd>`, run after the file is written with `DESIGN_BASELINE_PAGE_{ARCHETYPE,NAME,FILE}` in its env.
- [x] Add a test that generates each template into a temp dir and typechecks it against the package.

## Acceptance

- Running the generator for any exported page archetype writes a page that passes `tsc` against the package with no manual edits (`scripts/new-page.test.mjs`).
- The generated page imports only its own `design-baseline/archetypes/<slug>` and consumer-local paths (react, react-hook-form, the project's `@/components/ui/*` alias). It does not import `design-baseline/ui/*`: consumers reach ui through that alias (project-first, package fallback, per `docs/PACKAGE.md` wiring line 2), and a direct package import would bypass a project override. It renders the loading, empty and error branches. The exception is detail-overview and matrix-grid, whose contracts give loading and error to the route; those pages take resolved data as props.
- The brickshop route-registry check (point `--register` at its registry, then `archetypeRouteRegistry.test.ts` passes for a freshly generated route) is moved to a brickshop follow-up, as the operator decided in the ticket discussion on 2026-09-26. It can only be tested there, after brickshop bumps its pin to the tag that ships the bin. Filed as brickshop [`design-baseline-new-page-adoption`](https://github.com/aleph11111/brickshop-manager/blob/main/docs/backlog/design-baseline-new-page-adoption.md) (PR #1182).

## Related

- [archive/fleet-audit-and-adoption-doc-retire.md](../archive/fleet-audit-and-adoption-doc-retire.md) — `docs/PACKAGE.md` is the consumer contract the templates follow

## Resolved

Delivery mechanism: **package bin**, confirmed by the operator on 2026-09-26. A skill step would sit outside every repo's CI, so a template drifting from its shell would go unnoticed. A skill can still call the bin.
