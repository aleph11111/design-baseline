---
area: ui
opened: 2026-09-08
status: ready
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

- [ ] Before editing, grep every caller of the touched function / query
      pattern; fix at the shared point, not only the call site this report
      names.
- [ ] Add `"use client"` to the `src/components/ui/` leaves whose hk-crm
      vendored copies carry it (25 files at the 2026-09-08 measurement;
      re-derive the list from hk-crm when the directive set moves).
- [ ] Audit `src/components/layout/` and `src/components/archetypes/` leaves
      for the same gap and carry the directive per file, not barrel-only,
      where the consumer tree does.
- [ ] Guard the invariant where `scripts/verify-exports.mjs` already guards
      packaging shape: the packaged `ui/` leaves agree with the first
      measured consumer on directive presence.

## Acceptance

- Every one of the 25 measured `ui/` leaves carries `"use client"` — the whole
  class, not only the reported `sidebar.tsx` instance.
- The A/B the dry run built no longer crashes: a scratch consumer at
  `#v0.2.0` that deletes a single `ui/sidebar.tsx` copy and resolves it
  through the package still passes `next build` page-data collection.
- `npx tsc --noEmit`, `npm test`, `node scripts/lint-design.mjs` (0 errors)
  and `node scripts/verify-exports.mjs` all pass, and the new invariant
  fails on a copy with a directive deliberately dropped.

## Related

- [wip/package-ui-ownership-and-vendored-consumer-runbook.md](wip/package-ui-ownership-and-vendored-consumer-runbook.md) —
  the `consumer-migration` phase whose dry run measured this gap
- [archive/archetype-package-installable.md](archive/archetype-package-installable.md) —
  the `pkg` phase that made the donor installable and wrote the v0.2.0
  surface
- [archetype-convergence.md](archetype-convergence.md) — roadmap; its
  `consumer-migration` decisions C2/C5 are this fix's consumers
- ADR-0004 — appearance locality; the "`ui/` stays vendored" clause whose
  narrowing this defect undermines
