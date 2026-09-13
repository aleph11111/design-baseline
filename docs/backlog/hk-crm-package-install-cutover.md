---
area: archetypes
opened: '2026-09-13'
status: ready
value: high
model: opus
model_reason: "a real migration across 102 vendored files in a foreign repo with a build to keep green — judgment on every fork-triage call the runbook's step 1 raises"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-13T00:00:00Z'
roadmap: archetype-convergence
---

# Install the design-baseline package in hk-crm and delete its vendored archetype copies

## Context

The `archetype-convergence` roadmap's Phase 4 (*"Migrate consumers, one at a time"*) has never run
and has no phase of its own. The `consumer-migration` phase shipped the donor-side enablers — the
project-first `ui/` paths array, the ten `--color-status-*` roles, tag `v0.2.1`,
`scripts/verify-exports.mjs` at 7/7, and `docs/PACKAGE.md:125-233`'s five-step
*"Migrating a vendored consumer"* runbook — plus a **dry run** recorded in
`docs/backlog/archive/package-tag-post-v0-2-0-sync.md:41-100` (tsc 0, `next build` 47 routes,
`bg-status-success-bg` present in the built CSS). The migration itself was never executed.

On disk today `hk-crm` carries 102 vendor stamps, 49 files in `src/components/ui/`, 23 in
`src/components/archetypes/`, and no `design-baseline` entry in `package.json`.
`controlling-app`, `mistra` and `brickshop-manager` are the same. So zero repos consume the
package, and the copy commands `/style-baseline` and `/style-archetypes` are still the fleet's
only distribution channel.

This ticket is that migration, scoped to the install itself. It is the only unblocker for
`copy-channel-final-delete` (this phase's Part B), whose gate is *"at least one consumer resolves
`design-baseline` from `node_modules` and carries no `src/components/archetypes/`"* — spec
decision H7.

## What to do

- [ ] Add `design-baseline` to `hk-crm/package.json` against tag `v0.2.1` (git dependency — the
      channel `pkg`'s spec chose, no publish infrastructure needed) and install.
- [ ] Apply `docs/PACKAGE.md:125-233`'s five-step runbook in order, fork-triage normalisation
      first: the vendored files are byte-identical to the donor's apart from a `"use client"` line
      and the stamp comment, so a file that differs by anything else is a real fork and gets a
      decision before the delete, not after.
- [ ] Wire the consumer build: the four wiring lines `docs/PACKAGE.md:70-87` names — the `@source`
      directive so hk-crm's own Tailwind 4 build scans the package's `.tsx`, and the
      `./tokens.layer.css` import alongside the project's brand `tokens.css`.
- [ ] Delete `hk-crm/src/components/archetypes/` (23 files) and the vendored `ui/` files the
      package now owns, per `PACKAGE.md:37`'s two-entry project-first `ui/` paths array — the
      project-first entries stay project-owned and are kept.
- [ ] Delete the 102 per-file vendor stamps and run `docs/PACKAGE.md:232`'s step 6 ownership table
      over hk-crm's `docs/`: the four package-owned methodology docs, `docs/ADOPTION.md` with
      `version:` frontmatter, `docs/archetypes/` and its `MANIFEST.json` fork,
      `docs/design-baseline-chrome.json`. Keep `_adherence.json`, `scripts/lint-design.mjs` and the
      `lint:design` script, retargeted.

## Acceptance

- In `hk-crm`, `node -e "require.resolve('design-baseline/package.json')"` succeeds and
  `ls src/components/archetypes` is empty or absent — the two halves of this phase's Part-B gate.
- `npx tsc --noEmit` is clean and `next build` produces 47 routes, matching the dry run's numbers.
- The built CSS contains `bg-status-success-bg` — the status-token roles resolve through the
  package's `tokens.layer.css` rather than a vendored copy.
- `grep -rn 'design-baseline@' src/` returns nothing — every one of the 102 stamps is gone, not
  only the ones under the archetype directories.
- `hk-crm/docs/` carries no package-owned methodology doc and no `docs/archetypes/` fork, while
  `_adherence.json` and `npm run lint:design` still run and report against the package's paths.
- `/companies/[id]` renders unchanged against the pre-migration screenshots — the migration moves
  where the code lives, not what it draws.

## Related

- [[archetype-convergence]] — the roadmap; filed under phase `fleet-commands` because it is Part
  B's only unblocker and no other phase owns it (spec decision H11).
- [[copy-channel-final-delete]] — blocked on this ticket; its gate is this ticket's first two
  acceptance bullets.
- [package-tag-post-v0-2-0-sync.md](archive/package-tag-post-v0-2-0-sync.md) — the dry run whose
  numbers this ticket's acceptance reuses.
- [package-ui-ownership-and-vendored-consumer-runbook.md](archive/package-ui-ownership-and-vendored-consumer-runbook.md)
  — wrote the five-step runbook and the `ui/` ownership split this ticket executes.
- ADR-0004 — appearance locality, derived vs inherited: the decision that `src/components/ui/`
  stays vendored while `src/components/archetypes/` ships as a package.
