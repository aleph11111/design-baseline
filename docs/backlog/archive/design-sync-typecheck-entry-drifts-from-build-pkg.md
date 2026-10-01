---
area: code-health
opened: '2026-10-02'
status: done
value: normal
model: sonnet
model_reason: "one shared module list or a drift check between two existing files; pattern is clear"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-02T00:00:00Z'
---

# Keep design-sync typecheck entry in sync with build-pkg

## Context

`.design-sync/typecheck-entry.ts` (added with the preview typecheck in [[code-health-design-sync-previews-untypechecked-drift]]) is a hand-maintained `export *` list of every ui, layout and archetype module. `.design-sync/build-pkg.mjs` derives the same list from `src/components` (ui `.tsx` files, the layout index, each archetype dir with an `index.ts`). Nothing enforces that the two agree, so a module added to one and not the other makes previews typecheck against a different surface than the one the sync publishes.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Derive `typecheck-entry.ts` and the barrel in `build-pkg.mjs` from one shared module list, or add a check that fails when the two lists differ.

## Acceptance

- Adding a ui, layout or archetype module to `src/components` without updating the entry fails the check, and no other module list in `.design-sync/` can drift from `build-pkg.mjs` unnoticed.
- `npx tsc --noEmit` still passes with the previews included.

## Related

- [[code-health-design-sync-previews-untypechecked-drift]]: introduced the typecheck entry.
- [.design-sync/build-pkg.mjs](/.design-sync/build-pkg.mjs): the derived module list.
