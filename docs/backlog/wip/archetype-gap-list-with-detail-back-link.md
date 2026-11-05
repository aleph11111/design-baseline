---
area: archetypes
opened: 2026-11-05
status: ready
value: normal
model: sonnet
model_reason: "decision grounded in detail-overview and form-page, which already take the back-link props; scoped additive prop plus contract and version bump"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-05T00:00:00Z
---

# Archetype gap: list-with-detail shell has no back-link slot

## Context

`ListWithDetailShell` (`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx`) types its frame as `PageShellFrameProps`, which omits `backHref`, `backLabel` and `renderBackLink` (`src/components/layout/PageFrame.tsx`, the `Omit` at line ~110). The shell's `<PageFrame>` call (line ~169) therefore never passes them, although `PageFrame` and `PageHeader` already support them. A list page that sits under a parent cannot use the shell without dropping its back link. Consumer hk-sales-agent has four such pages: the workspace suchprofile list, Trefferliste, Export-Liste and Suchlauf-Liste, each linking back to its parent. They render `PageFrame` alone today and fail the `pageShell` lint rule (v0.15.0).

`detail-overview` and `form-page` already take `backHref` / `backLabel` / `renderBackLink` on the shell (`docs/archetypes/detail-overview.md` v4.0, `docs/archetypes/form-page.md`). The contract's Layer 3 (page header) lists `title`, `subtitle`, `badges`, `actions` only.

## What to do

- [ ] Add `backHref`, `backLabel` and `renderBackLink` to `ListWithDetailShellProps` and forward them to `<PageFrame>` in `ListWithDetailShell.tsx`. Same three props, same names as `detail-overview` and `form-page` (two existing call sites). Keep `PageShellFrameProps` unchanged: widening it would force every full-frame shell to take the props (`page-shell-frame-slots.test.tsx` `TakesEveryFrameSlot`).
- [ ] Update `docs/archetypes/list-with-detail.md` Layer 3: list the three props under "Allowed variation" as "back to the parent page". Keep the contract role-only (RULES rule 2/3): no Tailwind classes, no primitive names.
- [ ] Add a `ListWithDetailShell.test.tsx` case: with `backHref` set the header renders the link, and with `renderBackLink` it renders the injected element (mirror `src/components/layout/PageHeader.test.tsx`).
- [ ] Give the variant a visible gallery demo (convention: every documented variant gets a living demo) in `src/examples/list-with-detail-demo.tsx`.
- [ ] Bump the archetype's MANIFEST version and the package version, and add a `docs/PACKAGE.md` migration row (additive, optional props), per the version-bump rule for shipped code.
- [ ] Grep the other shells built on `PageShellFrameProps` (`settings-table`, `grouped-list`, `matrix-grid`, `calendar`, others) for the same gap. File a separate `/ticket` for each that a consumer page under a parent would hit; do not widen them here.

## Acceptance

- `ListWithDetailShell` with `backHref="/parent"` renders the back link in the page header; without it no link renders (unchanged).
- With `renderBackLink`, the shell renders the injected element instead of the plain anchor.
- `npx tsc --noEmit` and `npm test` pass, and the contract's Layer 3 lists the back-link props.
- hk-sales-agent's four list pages can switch from `PageFrame` to `ListWithDetailShell` with their back links kept, and pass the `pageShell` lint rule.

## Related

- [[archetype-gap-redirect-only-page]]
- [[page-requires-archetype-shell-no-pageframe-alone]]
- [[archetype-convergence-list-with-detail-close-api]]
- [[shells-drop-pageframe-view-options-slots]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement
- [docs/archetypes/list-with-detail.md](/docs/archetypes/list-with-detail.md) — contract, Layer 3
