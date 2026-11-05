---
area: tooling
opened: 2026-11-04
status: ready
value: low
model: sonnet
model_reason: "decision already made by the operator; at most a small lint exemption plus docs"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-04T00:00:00Z
---

# Archetype gap: redirect-only page has no kind page archetype

## Context

controlling-app `frontend/src/app/assets/[id]/import/page.tsx` (19 lines) calls `setCurrentAssetId(params.id)` from AssetContext, then `router.replace('/workspace/import')` in a `useEffect`, and renders only `<StateView variant="loading" message="Weiterleitung…" />`. It is not an import wizard, and no `kind: page` archetype in the MANIFEST (v0.20.0: list-with-detail, form-page, detail-overview, settings-table, grouped-list, matrix-grid, tabbed-settings, analytics-dashboard, import-wizard, feed-inbox, kanban-board, report, statement-with-filters, calendar, settings-sections) covers a transient redirect stub. The page stays on the `page-requires-archetype-shell` grandfathered list in controlling-app `_adherence.json` until this is resolved (the `pageShell` check lives in `scripts/lint-design.mjs`). Related consumer ticket: controlling-app `frontend-leftover-pages-archetype-shell-migration`.

## What to do

- [ ] Option 1 (recommended, no baseline change): controlling-app replaces the page with a route-level redirect or deletes it, so no page file exists. First grep inbound links to `/assets/<id>/import`; asset selection moves to `/workspace/import` via a query param or is dropped. Then close this gap ticket as not-needed.
- [ ] Option 2, only if a redirect-only page must stay: make `pageShell` in `scripts/lint-design.mjs` exempt a `page.tsx` whose default export only calls `redirect()` / `router.replace` and renders at most `StateView`; document the exemption in `docs/PACKAGE.md` ("The page-shape rule") and `docs/RULES.md` rule 12. No per-page waiver.
- [ ] Option 3, a new redirect-stub archetype, is not recommended: one consumer, one page. Do not build it.
- [ ] Grep controlling-app, hk-crm and brickshop-manager for other redirect-only `page.tsx` files, so none still needs a waiver after the chosen option.

## Acceptance

- After the chosen option, the controlling-app grandfathered entry for `assets/[id]/import/page.tsx` is removed and `lint-design` exits 0 there.
- No other redirect-only page in controlling-app, hk-crm or brickshop-manager still needs a waiver.
- If option 2 is taken, the exemption is documented in the donor and `scripts/lint-design.mjs` matches only pages that do nothing but redirect and render `StateView`.

## Related

- [[archetype-gap-waiver-needs-operator-approval]] — same pageShell waiver wording; no ordering needed (different lines)
- [[page-requires-archetype-shell-no-pageframe-alone]] — shipped the page-shape rule this gap trips
- [docs/RULES.md](/docs/RULES.md) — hard rule 12
- [docs/PACKAGE.md](/docs/PACKAGE.md) — "The page-shape rule"
