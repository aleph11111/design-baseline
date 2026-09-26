---
area: tooling
opened: 2026-09-26
status: needs-enrichment
value: normal
model: opus
model_reason: "the delivery-mechanism call (package bin vs skill step) and the consumer route-registry seam are design decisions, not slot-filling"
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "delivery mechanism auto-resolved to the Recommended default; confirm before /feat"
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
`form-page-demo.tsx`, `detail-overview-demo.tsx`) are already conformant compositions and are
the natural template source.

## What to do

- [ ] Ship the generator as a package bin (`bin` entry in `package.json`, e.g. `design-baseline new-page <archetype> <Name>`), so every consumer gets it with the dependency and CI can run it. See Open question.
- [ ] Derive one template per exported archetype from its `src/examples/<slug>-demo.tsx`, importing from `design-baseline/archetypes/<slug>` (the consumer import form per `docs/PACKAGE.md`) and keeping the archetype's required loading / empty / error states.
- [ ] Leave route registration to the consumer through a documented post-generate hook (e.g. a `--register <cmd>` flag or a consumer config entry). The route-registry test (brickshop's `src/lib/archetype-registry.ts` + `archetypeRouteRegistry.test.ts`) is consumer-specific and must not be hard-coded here.
- [ ] Add a test that generates each template into a temp dir and typechecks it against the package.

## Acceptance

- Running the generator for any exported archetype writes a page that passes `tsc` against the package with no manual edits.
- The generated page imports only from `design-baseline/archetypes/<slug>` and consumer-local paths, and renders the archetype's loading, empty and error branches.
- Pointing a consumer's registration hook at its registry makes brickshop's `archetypeRouteRegistry.test.ts` pass for a freshly generated route.

## Related

- [archive/fleet-audit-and-adoption-doc-retire.md](../archive/fleet-audit-and-adoption-doc-retire.md) — `docs/PACKAGE.md` is the consumer contract the templates follow

## Open question

Delivery mechanism: **package bin (Recommended)**, which ships with the dependency, is versioned with the shells it wraps and is CI-exercisable, vs **a step in the `/style-archetypes` skill**, which can reason about the target page but lives outside any repo's CI. Auto-resolved to the package bin. Confirm before `/feat`.
