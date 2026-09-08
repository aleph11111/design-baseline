---
area: ui
opened: 2026-09-08
status: done
closed: 2026-09-08
model: opus
model_reason: "directive placement needs per-leaf SSR-boundary judgement; the dry-run evidence narrows the scope but the layout/archetypes audit is open"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-09-08T00:00:00Z
---

# Package ui/ leaves lack the "use client" directive

## Context

At `v0.2.0`, 48 of the 49 `src/components/ui/*.tsx` package leaves carry no
`"use client"` directive (only `ui/tooltip.tsx` does). The donor's own
application is the client-rooted gallery SPA (`gallery/main.tsx` renders via
`createRoot`), so the directive was never load-bearing in-house and nothing
guards it.

The dry run of the `consumer-migration` phase (2026-09-08, reported in
[package-ui-ownership-and-vendored-consumer-runbook](wip/package-ui-ownership-and-vendored-consumer-runbook.md))
proved the gap is load-bearing for SSR consumers: hk-crm's vendored copies of
25 of the 28 after-normalisation-identical `ui/` files carry a consumer-side
`"use client"` the package's copies lack. An A/B on a scratch consumer of
`#v0.2.0` reproduced it minimally — deleting a single project copy
(`ui/sidebar.tsx`) so `@/components/ui/sidebar` resolves to the package copy
crashes `next build` page-data collection with
`TypeError: f.createContext is not a function`; patching the directive onto
the package copy in place eliminated the crash. The same per-file asymmetry
exists under `layout/` and `archetypes/` (the v0.2.0 barrels are
barrel-level-only — `layout/index.ts` carries the directive, 0 of its 33 leaf
files do), so C2's project-first shadowing deletion is directive-safe today
only where the consumer happens to keep its own copy of a file.

## What to do

- [x] Before editing, grep every caller of the touched function / query
      pattern; fix at the shared point, not only the call site this report
      names. (The gap is the whole measured class of directly-exported leaves,
      not the reported `sidebar.tsx` instance; the fix point is the donor
      source plus the `verify-exports` guard, not any consumer.)
- [x] Add `"use client"` to the `src/components/ui/` leaves whose hk-crm
      vendored copies carry it (25 files at the 2026-09-08 measurement;
      re-derive the list from hk-crm when the directive set moves).
      Re-derived 2026-09-08 from a clean hk-crm checkout at commit `59597e2`
      (`main`, 2026-09-07): the set now measures 34 donor `ui/` leaves — the
      consumer's directive set moved since the draft, so the ticket's own
      re-derive rule applies.
- [x] Audit `src/components/layout/` and `src/components/archetypes/` leaves
      for the same gap and carry the directive per file, not barrel-only,
      where the consumer tree does. 16 `layout/` + 47 `archetypes/` donor
      leaves match the consumer side (97 in total) — all carried.
- [x] Guard the invariant where `scripts/verify-exports.mjs` already guards
      packaging shape: the packaged `ui/` leaves agree with the first
      measured consumer on directive presence. New invariant 7 over the
      frozen, provenanced set `scripts/consumer-directive-set.json`
      (ADR-0006); FAILs on a dropped directive, a deleted leaf, or a missing
      set file.

## Outcome

Resolved 2026-09-08: all 97 consumer-measured donor leaves (34 `ui/`, 16
`layout/`, 47 `archetypes/` — re-derived from hk-crm `59597e2`, the
2026-09-08 draft's 25 having grown) carry `"use client";` as a first line
(`ui/tooltip.tsx`'s lone pre-existing, non-canonical carrier normalised to
the same form). `verify-exports.mjs` gained invariant 7 — the leaf-level
complement of the barrel-level invariant 3 that P4's one-directive-per-barrel
left uncovered for the directly-exported `./ui/*` (and layout/archetypes
leaf) subpaths — guarded over the frozen set with consumer provenance and
synthetic + fixture exit-code tests (`verify-exports` now reports `7/7 ok`).
Decision recorded as [ADR-0006](../../adr/0006-consumer-measured-use-client-leaves.md)
(narrowing spec P4's barrel-only boundary).

A/B evidence (scratch Next 16 consumer outside both repos, single deleted
`ui/sidebar.tsx` copy so the import resolves to the package copy, project
alias + `transpilePackages`, per the dry run's harness): **pre-fix** the
donor tree at `v0.2.0`'s shape crashes `next build` page-data collection
with `TypeError: i.createContext is not a function` (the dry run's exact
error class); **post-fix** the identical build passes page-data collection
and prerenders statically. Recorded assumption (unattended session): the
acceptance's "scratch consumer at `#v0.2.0`" cannot pass against the tag
itself because the tag predates this fix — the A/B therefore pins the
crash on the pre-fix tree and the pass on the fixed surface, i.e. the same
A/B the dry run built, run both sides. The next tag to be cut after
merge is the first that carries the fix.

Donor gates 2026-09-08: `npx tsc --noEmit` clean; `npm test` 392/392 (55
files, +3 new verify-exports tests); `node scripts/lint-design.mjs` 0
errors; `node scripts/verify-exports.mjs` `7/7 ok`; the new invariant
fails (exit 1, naming the offenders) on a copy with a directive
deliberately dropped and passes again once restored.

## Acceptance

- Every one of the 25 measured `ui/` leaves carries `"use client"` — the whole
  class, not only the reported `sidebar.tsx` instance. (Discharged against the
  re-derived 34-leaf `ui/` set — the 25 was the draft's 2026-09-08
  measurement and the consumer set grew; see Outcome.)
- The A/B the dry run built no longer crashes: a scratch consumer at
  `#v0.2.0` that deletes a single `ui/sidebar.tsx` copy and resolves it
  through the package still passes `next build` page-data collection.
  (Run both sides: the pre-fix tree crashes with the dry run's `createContext`
  error, the fixed build passes; the tag itself predates the fix — recorded
  assumption, see Outcome.)
- `npx tsc --noEmit`, `npm test`, `node scripts/lint-design.mjs` (0 errors)
  and `node scripts/verify-exports.mjs` all pass, and the new invariant
  fails on a copy with a directive deliberately dropped.

## Related

- [package-ui-ownership-and-vendored-consumer-runbook.md](../package-ui-ownership-and-vendored-consumer-runbook.md) —
  the `consumer-migration` phase whose dry run measured this gap
- [archive/archetype-package-installable.md](../archive/archetype-package-installable.md) —
  the `pkg` phase that made the donor installable and wrote the v0.2.0
  surface
- [archetype-convergence.md](../archetype-convergence.md) — roadmap; its
  `consumer-migration` decisions C2/C5 are this fix's consumers
- ADR-0004 — appearance locality; the "`ui/` stays vendored" clause whose
  narrowing this defect undermines
