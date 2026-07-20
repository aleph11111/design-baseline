---
area: archetypes
opened: 2026-07-09
status: done
model: sonnet
model_reason: contract-preserving module extraction with clear acceptance and an in-repo precedent (crud-dialog split); no design decisions left
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-09T00:00:00Z
---

# Split `ListWithDetailShell` into per-presentation modules before a fourth mode lands

## Context

`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx` (`list-with-detail@1.13` per `docs/archetypes/MANIFEST.json`) is the single reference primitive behind every A-archetype page in every project that vendors the baseline. It has grown into a ~515-line monolith juggling three row presentations (`table` / `card-grid` / `action-row`) — the A-archetype's documented variant axis — × two detail modes (`rail` / `drawer`), with each presentation's render logic segmented into its own inline `const …Body` block (`tableBody`, `cardGridBody`, `actionRowBody`) rather than separate modules.

Nothing is broken today — each branch is internally coherent — but this is the textbook shape of a shared primitive that becomes hard to review and risky to touch once one more presentation or detail mode is added: every future change scrolls past two unrelated branches to reach the relevant one, and diffs stop being scoped to the mode actually changed. Because this file is vendored into every consuming project (e.g. hk-crm carries it at `@1.10`), a regression here has wide blast radius. This repo already established the pattern of extracting an archetype's inlined concern into a focused seam — see the archived `crud-dialog-discard-confirm-split`.

## What to do

- [ ] Extract each presentation body into its own file under `src/components/archetypes/list-with-detail/presentations/` (`TableBody.tsx`, `CardGridBody.tsx`, `ActionRowBody.tsx`), leaving `ListWithDetailShell.tsx` as the thin mode-dispatcher + owner of shared state / sort / loading / error / empty-state.
- [ ] Keep the split strictly contract-preserving: no change to the prop contract documented in `docs/archetypes/list-with-detail.md`, no consumer-facing API or import change.
- [ ] Bump the `list-with-detail` `version` in `docs/archetypes/MANIFEST.json` (and the spec frontmatter) so consumers adopt the split via `/promote-archetype --update`.
- [ ] Update `src/examples/list-with-detail-demo.tsx` only if an import path changed; otherwise leave consumer-facing surface untouched.

## Acceptance

- `ListWithDetailShell.tsx` no longer contains the per-presentation render bodies inline; each lives in its own file under `presentations/`.
- The documented prop contract is unchanged and no consumer needs a prop or import change.
- `pnpm typecheck` passes and the example demo plus any archetype tests covering list-with-detail render unchanged.
- `MANIFEST.json` `version` for `list-with-detail` has advanced from `1.13`.

## Related

- [decouple-archetype-contract-from-reference-impl.md](archive/decouple-archetype-contract-from-reference-impl.md) — the contract-vs-reference-impl split precedent.
- [crud-dialog-discard-confirm-split.md](archive/crud-dialog-discard-confirm-split.md) — sibling "extract an inlined archetype concern into a focused seam".
- [list-with-detail-forwardref-dropped.md](archive/list-with-detail-forwardref-dropped.md), [list-with-detail-column-filter-hoist.md](archive/list-with-detail-column-filter-hoist.md) — recent work on this same shell.
- `docs/archetypes/list-with-detail.md` — the A-archetype spec / prop contract the split must preserve.
- hk-crm adopt-side ticket `list-with-detail-revendor-upstream-split` — re-vendors this split downstream once shipped.
