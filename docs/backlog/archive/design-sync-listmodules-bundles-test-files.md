---
area: code-health
opened: '2026-11-19'
status: done
value: normal
model: sonnet
model_reason: "one filter in an existing helper plus deleting 13 lines; cause established"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-19T00:00:00Z'
---

# design-sync listModules bundles ui test files into barrel

## Context

`listModules` in `.design-sync/modules.mjs` takes every `src/components/ui/*.tsx`, including the 13 `*.test.tsx` files (`button.test`, `calendar.test`, …). `.design-sync/build-pkg.mjs` therefore bundles test files into the package barrel, and `.design-sync/typecheck-entry.ts` must hand-list each `@/components/ui/<x>.test` export. Adding a new `src/components/ui/foo.test.tsx` fails `scripts/design-sync-entry.test.mjs` until the entry is edited. Repro: create `src/components/ui/foo.test.tsx`, run `npm test`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Filter `/\.test\.tsx$/` out of the `uiFiles` list in `listModules` (`.design-sync/modules.mjs`) — the shared point both `build-pkg.mjs` and `scripts/design-sync-entry.test.mjs` consume.
- [ ] Delete the 13 `@/components/ui/*.test` lines from `.design-sync/typecheck-entry.ts`.

## Acceptance

- After the change, `listModules` returns no entry whose `rel` ends in `.test`, so the built barrel contains no test file.
- Adding `src/components/ui/foo.test.tsx` no longer fails `scripts/design-sync-entry.test.mjs`; no other `*.test.tsx` under `components/ui` needs an entry in `typecheck-entry.ts`.
- `npm test` and `npx tsc --noEmit` pass.

## Related

- [[design-sync-typecheck-entry-drifts-from-build-pkg]] — introduced the shared `modules.mjs` list and the drift test this ticket touches
- [[code-health-design-sync-previews-untypechecked-drift]] — origin of `typecheck-entry.ts`
