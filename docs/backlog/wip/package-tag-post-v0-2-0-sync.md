---
area: other
opened: '2026-09-08'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-09-08T00:00:00.000Z'
value: normal
model: opus
model_reason: multi-file doc sync + dry-run measurement, no established pattern to follow mechanically
roadmap: archetype-convergence
---

# Cut v0.2.1 tag and re-validate the vendored-consumer runbook against it

## Context

`docs/PACKAGE.md`'s vendored-consumer runbook pins `github:aleph11111/design-baseline#v0.2.0` (`git tag` confirms it's the only tag on `main`), but three donor changes landed on `main` after that tag was cut: the status-token roles + `badge`/`alert` chip tier, the `tokens.layer.css`/brand split font seam, and `package-ui-leaves-use-client-directive-gap` (PR #234, ADR-0006, `verify-exports` invariant 7 — 97 consumer-measured leaves now carry `"use client"`). `package.json`'s `"version"` field still reads `0.1.0` while the existing tag is `v0.2.0` (confirmed). A consumer following the runbook today installs a surface none of the post-v0.2.0 guidance describes, and the runbook's directive guard (`docs/PACKAGE.md` ~line 222, `## Guard: the "use client" directive gap`) tells that consumer to keep 25 files it no longer needs to keep.

## What to do

- [ ] Cut and push the next git tag from `main` (`v0.2.1` unless a minor is warranted), bumping `package.json`'s `"version"` in the same change so it matches the tag (STACK.md hazard 5 — the tag is the consumer's stamp and the field must not contradict it).
- [ ] Re-run the vendored-consumer dry run against the new tag, same harness as the previous one (scratch copy of hk-crm at a clean `main` commit, outside both repos, nothing committed to hk-crm): git dependency at the new tag, the four project-first `paths` entries, `transpilePackages`, `tokens.css` split onto `@import "design-baseline/tokens.layer.css"` + the two-deep `@source`. With the directive gap closed, delete all `ui/` files identical after normalisation (expected 28: the 3 already-deletable plus the 25 the directive gap had blocked), keep the 8 triaged forks and 13 consumer-only files, keep `layout/` + `archetypes/` whole (hk's snapshot is stale against the package's archetype signatures — corpus-staleness fact from the prior dry run, not a wiring one; do not re-litigate). Re-derive every count from the actual trees rather than trusting the numbers in this ticket.
- [ ] Update `docs/PACKAGE.md` for the post-fix reality: wiring line 1's pinned tag and every `v0.2.0` reference (confirmed present at lines 7, 11, 30, 133, 158, 208, 224, 237, 253); step 1's normalisation item 2 (line ~143), which currently says to strip `"use client"` because the package's `ui/` leaves at `v0.2.0` ship it un-directive — with 34 of 49 `ui/` leaves now carrying it, directive presence is a real signal for leaves the donor deliberately leaves server-safe (`icon-avatar`, `segmented-control` still carry none by design) and must not be blanket-normalised away; the kept-file arithmetic in step 1's closing paragraph (line ~177, `46 keep (25 + 8 + 13), 3 delete`); and the `## Guard: the "use client" directive gap` section (line ~222), which should become a short closed-gap note pointing at ADR-0006 and `verify-exports` invariant 7 rather than an open hazard.
- [ ] Update the package-tag `sync` row in `docs/promotion-radar.json` (the `donor package tag lag` entry, `since: 2026-09-07`, confirmed present) so its recorded tag and kept-file count match the new dry run instead of `v0.2.0` + `46 ui/ kept`.

## Acceptance

- `git tag` lists the new tag on the same commit as `package.json`'s matching `"version"`, and `docs/PACKAGE.md` pins that tag in wiring line 1 with no stale `v0.2.0` reference left except where one deliberately describes historical measurement.
- The dry run at the new tag passes `npx tsc --noEmit` (0 resolution errors) and `next build` (all routes; `/companies/[id]` builds) with the full identical-file `ui/` deletion set applied and the archetype's classes present in the built CSS. Report the numbers and both command outcomes in this ticket's `## Outcome`; nothing is committed to hk-crm.
- `docs/PACKAGE.md`'s runbook and `docs/promotion-radar.json`'s sync row carry the same kept-file count as the dry run reported.
- Donor unchanged otherwise: `npx tsc --noEmit`, `npm test`, `node scripts/lint-design.mjs` (0 errors), `node scripts/verify-exports.mjs` (`7/7 ok`), `npm run gallery:build` all still pass.

## Related

- [package-ui-leaves-use-client-directive-gap.md](../archive/package-ui-leaves-use-client-directive-gap.md) — closed the directive gap this ticket re-validates against
- [package-ui-ownership-and-vendored-consumer-runbook.md](../archive/package-ui-ownership-and-vendored-consumer-runbook.md) — original runbook this ticket updates
- ADR-0006 — "use client" is consumer-measured per leaf, not barrel-only
