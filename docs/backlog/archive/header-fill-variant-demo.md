---
area: archetypes
opened: 2026-06-23
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-06-23T07:45:00Z
---

# Add a visible header-fill variant demo to the gallery

## Context

The 2-token contract (`--primary` + `--header-fill`) supports three header
treatments — `solid` (default), `tint`, `white` — implemented in
`src/components/layout/headerFill.ts` and consumed by
`src/components/layout/SurfaceHeader.tsx` (and the crud-dialog header / drawer).
Every archetype demo defaults to `solid` via `HeaderFillContext`, so the `tint`
and `white` variants are never *visibly* shown anywhere in the gallery — they
exist only as a prop value. The Plex Ledger Gallery board itself peeks the tint
treatment (it renders 10 frames solid + 2 tint), so the axis is part of the
sanctioned design but undemonstrated in our gallery.

This violates the living-demos-for-variants principle: every documented
variant/axis must get a visible demo in the gallery, not just a spec/prop note.

## What to do

- [ ] Add a gallery demo that renders the same `SurfaceHeader` (and/or `AppShell` header) in all three fills — `solid` / `tint` / `white` — side by side, so the header-fill axis is visible. Place it in `gallery/layout-demos.tsx` alongside the other layout molecules, or as a dedicated section near the SurfaceHeader entry.
- [ ] Register the demo as a gallery card so it is routable like the other layout/molecule entries (`gallery/registry.ts`).
- [ ] Label each fill with its token value and note that `solid` is the per-project default and status `Badge`s stay semantic on `solid`.

## Acceptance

- [ ] The gallery shows a SurfaceHeader rendered in `solid`, `tint`, and `white` side by side; switching is visible without reading source.
- [ ] The demo is reachable via a gallery route/card like the other layout primitives.
- [ ] `npm run gallery:build` succeeds and the new card renders all three fills.

## Related

- [archetype-specs-board-form-sync.md](archetype-specs-board-form-sync.md) — documents the same 2-token contract the specs need to describe
- [decouple-archetype-contract-from-reference-impl.md](decouple-archetype-contract-from-reference-impl.md) — header-treatment lives in the contract layer being split
- living-demos-for-variants (auto-memory) — the principle this ticket satisfies

## Resolution (2026-07-03)

Done on feat/plex-ledger-hygiene: gallery layout card "SurfaceHeader / header fill" (/l/surface-header) renders solid/tint/white side by side with token labels, a semantic Badge and an asChild anchor in the actions row; gallery:build green.
