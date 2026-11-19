---
area: docs
opened: '2026-11-19'
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-19T00:00:00Z
---

# CHANGELOG v0.60.0 Consumer line omits copied ui/table.tsx case

## Context

v0.60.0 moved the donor `Table` onto the shared `ScrollCue` (`src/components/ui/table.tsx:19`) and added the `scrollCue` code to `checkPageInvariants` (`src/testing/invariants.mjs:187`). A consumer that resolves `ui/` project-first (the two-entry array, `docs/PACKAGE.md:87`) keeps its own copied `src/components/ui/table.tsx` with the old bare `relative w-full overflow-auto` wrapper, so the donor change never reaches it. Any table in such a consumer that overflows at phone width (390px) now clips sideways with no `[data-slot="scroll-cue"]` sibling and trips `scrollCue` in the consumer's Playwright suite. The `## v0.60.0` **Consumer** line in `CHANGELOG.md` names only hand-rolled `overflow-x-auto` strips, so a consumer reading it has no hint that its own copied `table.tsx` is the cause.

Repro: consumer with its own `ui/table.tsx`, bump to v0.60.0, run the Playwright invariants at phone on a page whose table overflows.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Extend the `## v0.60.0` **Consumer** line in `CHANGELOG.md` to name the copied-`ui/table.tsx` case explicitly: a project-first `ui/table.tsx` shadows the donor `Table`, so it keeps the bare `overflow-auto` wrapper and trips `scrollCue` on any table that overflows at phone width.
- [ ] State the two remedies in that line: re-sync `table.tsx` from the donor (the diff-and-keep-or-delete rule in `docs/PACKAGE.md:536`), or wrap the table in `ScrollCue`; `knownGaps` plus a ticket stays the escape hatch.
- [ ] Check the CHANGELOG for other releases that moved a shared `ui/` primitive and name the same shadowed-copy case on their Consumer line; add it where the same project-first shadowing applies.

## Acceptance

- The v0.60.0 Consumer line in `CHANGELOG.md` names a consumer's copied `ui/table.tsx` and tells it to re-sync the file or wrap with `ScrollCue`.
- No other release Consumer line that changes a shared `ui/` primitive omits the project-first shadowing case.
- `npm test` is unchanged and passes after the edit (docs only).

## Related

- [[package-ui-ownership-and-vendored-consumer-runbook]]
- [[print-statement-screen-table-clips-without-scroll-cue]]
- [[changelog-and-package-migration-rows]]
- [docs/PACKAGE.md](/docs/PACKAGE.md) — project-first `ui/` resolver and the drift rule
