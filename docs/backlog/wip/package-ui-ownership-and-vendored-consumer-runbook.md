---
area: tooling
roadmap: archetype-convergence
opened: '2026-09-07'
status: ready
value: high
model: opus
model_reason: "the two-entry alias must be proven against a real Next build before it is documented, and the fork triage rule has to survive a 155-file consumer tree — a doc edit only after a dry run resolves it"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-09-07T00:00:00Z
---

# Narrow the package's ui/ ownership and write the vendored-consumer runbook

## Context

`docs/PACKAGE.md:37` tells a consumer to delete `src/components/ui/` and
re-point the alias at the package with one entry
(`"@/components/ui/*": ["node_modules/design-baseline/src/components/ui/*"]`).
Measured against hk-crm — the first real consumer — that instruction is wrong in
two ways. hk-crm carries **12 `ui/` primitives the donor has none of**
(`breadcrumb`, `labeled-control`, `native-field`, `results-count`,
`route-error`, `select-field`, `select-filter`, `table-row-actions`,
`textarea-field`, `view-toggle`, plus two unit tests), which the single-entry
re-point makes unresolvable across 170 importing files; and of the 36 shared
primitives, 8 genuinely diverge — one class of which is **locale, not drift**:
`ui/confirmation-dialog.tsx` imports `@/ui-text/de` and `ui/state-view.tsx`
hardcodes `"Lädt…"` / `"Etwas ist schiefgelaufen"`, while the packaged surface's
model is English defaults overridable per call site
(`src/components/layout/MetricList.tsx:92` says so in as many words). Those files
can never be un-forked at file granularity.

`docs/PACKAGE.md` also documents a greenfield install only. A project already
carrying a `cp -R` corpus — 155 files under `src/components/{ui,layout,archetypes}`
in hk-crm's case, a pre-#178 merged `tokens.css`, and 102 per-file vendor stamps
split 38 × `@0.1.0` / 64 × `@0.10.0` — has no documented path. Decisions
**C2**, **C3**, **C5**, **C6** and **C7** of the `consumer-migration` section of
the archetype-convergence design spec settle the shape; this ticket lands it.

## What to do

- [ ] Rewrite `docs/PACKAGE.md` §2 as a **two-entry alias array, project first**
      (C2): `"@/components/ui/*": ["./src/components/ui/*",
      "node_modules/design-baseline/src/components/ui/*"]`, so a file the
      consumer keeps shadows the package's without any import moving. Add the
      blanket `@/components/layout/*` and `@/components/archetypes/*` entries and
      state that `lib/`, `hooks/` and `utils/` get **no** entry — after `pkg`'s
      relativization the package resolves its own internals (C3).
- [ ] Add a `## Migrating a vendored consumer` section carrying the five ordered
      steps: fork triage first (normalising vendor stamp, `"use client"` and
      `@/`-versus-relative before diffing — that alone collapses 28 of hk-crm's
      36 apparent differences), then the `tokens.css` split onto
      `@import "design-baseline/tokens.layer.css"` + the brand-file `@theme` font
      stanza, then install/wire/delete, then drop the per-file vendor stamps in
      the same commit as the deletions, then record the tag.
- [ ] State C5's triage rule in that section: donor-ahead → consumer takes the
      package's file; hk-ahead-and-general → `/promote-archetype` it and keep the
      consumer file until it lands; locale → permanent consumer-owned file.
- [ ] Add the kept-file count to the package-tag `sync` entry in
      `docs/promotion-radar.json` (C6) — shadowing is invisible at the import
      site, so the count is the only visible guard that a fork survived the swap.
- [ ] Run the dry run described in Acceptance and report its output in this
      ticket. Do **not** commit the scratch consumer copy.

## Acceptance

- [ ] A scratch copy of hk-crm outside both repos, with the git dependency, the
      four `paths` entries, `transpilePackages`, the 28 identical-`ui/` deletions
      and the whole of `layout/` + `archetypes/` deleted, passes
      `npx tsc --noEmit` and `next build`, and `/companies/[id]` renders with the
      archetype's classes present in the built CSS. This is what proves the
      two-entry array against a Next build resolving aliases into `node_modules`
      — the question phase `pkg` deferred.
- [ ] `docs/PACKAGE.md` §2 no longer tells any consumer to delete
      `src/components/ui/` wholesale, and the migrating section names the
      stamp/`"use client"`/import normalisation as step 1 — so every consumer,
      not only hk-crm, triages before installing rather than discovering a fork
      through a broken build.
- [ ] `docs/promotion-radar.json`'s package-tag `sync` row names both the
      installed tag and the kept-file count as what a consumer records.
- [ ] `npx tsc --noEmit`, `npm test`, `node scripts/lint-design.mjs` (0 errors)
      and `node scripts/verify-exports.mjs` (`6/6 ok`) are unchanged in the
      donor — this ticket edits docs and one JSON, so any movement is a
      regression.

## Related

- [archetype-convergence.md](archetype-convergence.md) — roadmap; phase
  `consumer-migration`, decisions C2/C3/C5/C6/C7
- [donor-status-token-roles-badge-alert-backport.md](archive/donor-status-token-roles-badge-alert-backport.md)
  — lands first; its outcome is what step 1's triage table cites
- [archive/archetype-package-consumer-wiring.md](archive/archetype-package-consumer-wiring.md)
  — wrote the greenfield `docs/PACKAGE.md` this narrows
- [archive/archetype-package-installable.md](archive/archetype-package-installable.md)
  — the relativization that makes C3's "no alias entry for internals" true
- ADR-0004 — appearance locality; its "`ui/` stays vendored" clause is what P2,
  and now C2, narrow

## Outcome (2026-09-08 — dry run + docs landed)

**Dry run (Acceptance).** Scratch copy of hk-crm at `@59597e29` (pristine, main,
untouched) in `/tmp/pkgdry/hk-scratch/` outside both repos, with the
`design-baseline#v0.2.0` git dependency layered into hk's real `node_modules`,
the four project-first `paths` entries, `transpilePackages`, and the `tokens.css`
split onto `@import "design-baseline/tokens.layer.css"` + `@source
"../../node_modules/design-baseline/src"`.

The literal acceptance config — 28 `ui/` deletions **plus** the whole of
`layout/` + `archetypes/` deleted — **does not pass**: the `ui/` deletions alone
leave `npx tsc --noEmit` clean (0 resolution errors — the two-entry array
resolves every `ui/` import into the package), but the whole-directory deletes
produce 45 **content** errors (TS2305/2322/2353/2741/7006), all of one kind:
hk's vendored snapshot is stale relative to v0.2.0 (`@0.1.0`/`@0.10.0` stamps)
and carries hk-owned exports the package does not ship (`BooleanToggleCell`,
`BoardSkeleton`, `ListSkeleton`, `detailPresentation`, `stickyOnMobile`, …), so
hk's own pages stop type-checking against the package's newer archetype
signatures. The blanket delete therefore assumes the consumer's corpus
**matches** the installed tag — a stale `cp -R` snapshot does not — and the
project-first array (C2) is what makes the mismatch survivable.

**The corrected, corpus-consistent config passes both gates:**

| gate | result |
|---|---|
| `npx tsc --noEmit` | exit 0 — **0 resolution errors** (the mechanism `pkg` deferred: the project-first entry resolves hk's 13 consumer-only + 8 forked + 25 asymmetric files to the project; the package entry resolves the 3 deleted to `node_modules/`) |
| `next build` (Next 16, Turbopack) | exit 0 — all 33 routes; `/companies/[id]` builds (dynamic, ƒ) |
| layer tokens in built CSS | `bg-success` / `animate-pulse` / `text-destructive` present — the package layer `@theme` reached the build via the two-deep `@source` |
| `ui/` kept-file count (C6) | **46 kept** (25 + 8 + 13), 3 deleted |

**Triage detail (step 1).** Of the 36 `ui/` primitives hk shares with the
package, normalising vendor-stamp / `"use client"` / `@/-vs-relative` collapses
**28 to identical** (the spec's "28 of 36") and **8 remain genuinely forked**
(`alert`, `badge`, `button`, `confirmation-dialog`, `error-boundary`,
`file-field`, `form`, `state-view`; `confirmation-dialog` and `state-view` are
**locale** — permanent consumer files). Beyond the shared 36, hk keeps **13
consumer-only `ui/` files** the package has none of. So of hk's 49 `ui/` files:
25 identical-but-directive-asymmetric + 8 forked + 13 consumer-only = **46
kept**, 3 identical **and** directive-consistent (`icon-avatar`,
`segmented-control`, `tooltip`) deleted. `layout/` (18 files, 0 hk-only) and
`archetypes/` (88 files, 13 hk-owned structural) are kept whole.

**The `"use client"` gap is the load-bearing guard.** At v0.2.0 48 of the
package's 49 `ui/` leaves lack the `"use client"` directive hk's copies carry;
the donor's client-rooted gallery never exercises a `ui/` leaf's server boundary,
so the gap is invisible there and only surfaces in a real Next SSR consumer.
A/B reproduced the failure: deleting one directive-carrying leaf's project copy
so the alias resolves the directive-less package copy flips the file's RSC
boundary and crashes `next build` page-data collection with
`f.createContext is not a function` — which is exactly what deleting hk's
`sidebar.tsx` did. This is why step 3 deletes only directive-consistent files.
**Filed as donor ticket `package-ui-leaves-use-client-directive-gap` (PR #232,
landed main @922479e)**; the runbook's guard is written against that ticket.

**Not committed:** the scratch copy and its `node_modules` layering stay out of
both repos per Acceptance. hk-crm is untouched.
