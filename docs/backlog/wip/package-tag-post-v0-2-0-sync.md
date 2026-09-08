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

- [x] Cut and push the next git tag from `main` (`v0.2.1` unless a minor is warranted), bumping `package.json`'s `"version"` in the same change so it matches the tag (STACK.md hazard 5 — the tag is the consumer's stamp and the field must not contradict it).
- [x] Re-run the vendored-consumer dry run against the new tag, same harness as the previous one (scratch copy of hk-crm at a clean `main` commit, outside both repos, nothing committed to hk-crm): git dependency at the new tag, the four project-first `paths` entries, `transpilePackages`, `tokens.css` split onto `@import "design-baseline/tokens.layer.css"` + the two-deep `@source`. With the directive gap closed, delete all `ui/` files identical after normalisation (expected 28: the 3 already-deletable plus the 25 the directive gap had blocked), keep the 8 triaged forks and 13 consumer-only files, keep `layout/` + `archetypes/` whole (hk's snapshot is stale against the package's archetype signatures — corpus-staleness fact from the prior dry run, not a wiring one; do not re-litigate). Re-derive every count from the actual trees rather than trusting the numbers in this ticket.
- [x] Update `docs/PACKAGE.md` for the post-fix reality: wiring line 1's pinned tag and every `v0.2.0` reference (confirmed present at lines 7, 11, 30, 133, 158, 208, 224, 237, 253); step 1's normalisation item 2 (line ~143), which currently says to strip `"use client"` because the package's `ui/` leaves at `v0.2.0` ship it un-directive — with 34 of 49 `ui/` leaves now carrying it, directive presence is a real signal for leaves the donor deliberately leaves server-safe (`icon-avatar`, `segmented-control` still carry none by design) and must not be blanket-normalised away; the kept-file arithmetic in step 1's closing paragraph (line ~177, `46 keep (25 + 8 + 13), 3 delete`); and the `## Guard: the "use client" directive gap` section (line ~222), which should become a short closed-gap note pointing at ADR-0006 and `verify-exports` invariant 7 rather than an open hazard.
- [x] Update the package-tag `sync` row in `docs/promotion-radar.json` (the `donor package tag lag` entry, `since: 2026-09-07`, confirmed present) so its recorded tag and kept-file count match the new dry run instead of `v0.2.0` + `46 ui/ kept`.

## Acceptance

- `git tag` lists the new tag on the same commit as `package.json`'s matching `"version"`, and `docs/PACKAGE.md` pins that tag in wiring line 1 with no stale `v0.2.0` reference left except where one deliberately describes historical measurement.
- The dry run at the new tag passes `npx tsc --noEmit` (0 resolution errors) and `next build` (all routes; `/companies/[id]` builds) with the full identical-file `ui/` deletion set applied and the archetype's classes present in the built CSS. Report the numbers and both command outcomes in this ticket's `## Outcome`; nothing is committed to hk-crm.
- `docs/PACKAGE.md`'s runbook and `docs/promotion-radar.json`'s sync row carry the same kept-file count as the dry run reported.
- Donor unchanged otherwise: `npx tsc --noEmit`, `npm test`, `node scripts/lint-design.mjs` (0 errors), `node scripts/verify-exports.mjs` (`7/7 ok`), `npm run gallery:build` all still pass.

## Outcome (2026-09-08 — v0.2.1 content re-validated; tag cut on the merged commit)

**Harness.** Scratch copy of hk-crm at `origin/main @59597e29` (pristine, detached)
in `/tmp/pkgdry/hk-scratch/` outside both repos, with the v0.2.1 package source
layered into its `node_modules/design-baseline` (the tag content = this worktree's
pre-merge tree), the dep line `design-baseline: github:aleph11111/design-baseline#v0.2.1`,
the four project-first `paths` entries, `transpilePackages: ["design-baseline"]`,
and the `tokens.css` split onto `@import "design-baseline/tokens.layer.css"` +
`@source "../../node_modules/design-baseline/src"` (the brand `:root`/`.dark` HSL,
the IBM Plex `@theme` font stanza, and `scrollbar-hide`/reduced-motion stay
project-side). Nothing was committed to hk-crm.

**Triage, re-derived from the actual trees (the ticket's expected 28/25+8+13 was
re-derived, not assumed).** Of hk's 49 `ui/` files, 36 are shared with the package.
Normalising (strip vendor-stamp lines; canonicalise `@/`-vs-relative `ui/`/`lib`/
`hooks`/`utils` import forms; drop blank lines) — and *comparing* rather than
strip-ing the `"use client"` directive, since it is now a real boundary signal —
collapses **30 to identical**, leaves **6 genuinely forked** (`button`,
`confirmation-dialog`, `error-boundary`, `file-field`, `form`, `state-view`), and
keeps **13 consumer-only files** (10 components + 3 `.unit-test` files the package
has none of). So of hk's 49 `ui/` files: **19 keep** (6 + 13), **30 delete**. All 30
deleted are directive-consistent (28 pairs both carry `"use client"`; `icon-avatar`
+ `segmented-control` both lack it), so every deletion leaves the RSC boundary
unchanged — the gap closure is the whole point of this ticket.

**Why the fork count dropped 8 → 6 (identical 28 → 30).** At v0.2.0 `alert` and
`badge` were forked — the donor had not yet shipped the status-token chip tier. The
status-token backport (`cb77b0e`, PR #231) then brought exactly those
`bg-status-*-bg`/`text-status-*-fg` classes into the donor. hk's copies already
carried them locally (verified: hk yes / donor@v0.2.0 no / donor@HEAD yes), so the
backport closed the fork and the two files collapsed into the identical set. A
genuine cross-version sync, not a normalisation artefact.

**Gates (corrective, corpus-consistent config — full 30-file `ui/` deletion set
applied; `layout/` + `archetypes/` kept whole):**

| gate | result |
|---|---|
| `npx tsc --noEmit` | exit 0 — **0 resolution errors** (the two-entry project-first array resolves hk's 13 consumer-only + 6 forked files to the project; the package entry resolves the 30 deleted to `node_modules/`) |
| `next build` (Next 16, Turbopack) | exit 0 — **all 47 routes**; `/companies/[id]` builds (ƒ dynamic). (47, not the v0.2.0 run's 33 — hk's main grew routes since then.) |
| layer `@theme` classes in built CSS | `bg-success`, `animate-pulse`, `text-destructive`, `bg-status-success-bg`, `animate-accordion-down` all PRESENT in `.next/static/chunks/*.css` — the package layer `@theme` reached the build via the two-deep `@source` |
| `ui/` kept-file count (C6) | **19 kept** (6 forked + 13 consumer-only), **30 deleted** |

**Donor unchanged otherwise (baseline at branch HEAD, re-run on final tree):**
`npx tsc --noEmit` exit 0; `npm test` 55 files / 392 tests passed;
`lint-design.mjs` 0 errors (59 pre-existing warnings); `verify-exports.mjs`
`7/7 ok` (invariant 7 = 97 consumer-measured leaves carry `"use client"`);
`gallery:build` produced `gallery-dist/index.html`. `package.json` `"version"`
bumped `0.1.0 → 0.2.1` so the field no longer contradicts the tag (STACK.md
hazard 5).

**Tag + docs.** `v0.2.1` cut on the merged main commit (after `/ship`'s squash merge
— squash rewrites the SHA, so the tag is cut only after the merge lands, which is
what keeps it on the same commit as the `package.json` bump) and pushed.
`docs/PACKAGE.md` pins `v0.2.1` in wiring line 1; `v0.2.0` is retained only where it
deliberately describes the historical greenfield proof (tag-invariant, still true)
and the closed-hazard narrative. Normalisation item 2 now says *compare* the
directive (a boundary signal), the step-1 arithmetic reads 19 keep / 30 delete, and
the old `## Guard` is a closed-gap note pointing at ADR-0006 + `verify-exports`
invariant 7. `docs/promotion-radar.json` sync row updated to `v0.2.1` + `19 ui/ kept`
(6 forked + 13 consumer-only; 30 deleted), with the prior v0.2.0 state preserved as
history.

**Not committed:** the scratch copy and its `node_modules` layering stay out of both
repos per Acceptance. hk-crm is untouched.

## Related

- [package-ui-leaves-use-client-directive-gap.md](../archive/package-ui-leaves-use-client-directive-gap.md) — closed the directive gap this ticket re-validates against
- [package-ui-ownership-and-vendored-consumer-runbook.md](../archive/package-ui-ownership-and-vendored-consumer-runbook.md) — original runbook this ticket updates
- ADR-0006 — "use client" is consumer-measured per leaf, not barrel-only
