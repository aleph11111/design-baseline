---
area: tooling
opened: 2026-10-15
status: done
value: normal
model: sonnet
model_reason: "adds one audit-signals entry plus test fixtures, following the existing adoptionQuality/shadowedBaseline pattern; the gap is already diagnosed"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-15T00:00:00Z
---

# Adoption-quality scan flags hand-rolled list pages without an archetype shell

## Context

`scripts/scan-adoption-quality.mjs` only measures the `docs/audit-signals.json → adoptionQuality` tripwires, and every one of them is gated by `coOccursWith` an archetype shell import. It catches pages that import a shell and keep content the shell replaces. It cannot see a page that never imports a shell. `scripts/lint-design.mjs` flags only raw lowercase `<table>`/`<select>`, so a list built by hand from shadcn `Table` + `SelectField` inside `PageFrame` passes every mechanical gate (`docs/PACKAGE.md` "The enforcement stack").

Live example: gebo-stock-kiosk `frontend/src/pages/ItemLookup.tsx` (pinned `design-baseline#v0.9.3`). It wraps a hand-built `Table` in its own 40vh/70vh scroll box, renders the detail inline below the list, and uses a dropdown for a 3-value filter. That breaks list-with-detail v3+ (spine S2, the detail-overlay rule, Layer 4's segmented-control rule), yet no scan reports it.

## What to do

- [ ] Add an `unshelled-list` entry to `docs/audit-signals.json` (yellow, candidate only, never a gate, same semantics as the existing `adoptionQuality` entries per [ADR-0005](/docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md)). It hits a file that imports `PageFrame` from `design-baseline/layout` and renders a table body (`<TableBody`/`<Table>`) but imports no `design-baseline/archetypes/<page-shell>` (list-with-detail, settings-table, grouped-list, matrix-grid, statement-with-filters).
- [ ] Support the negative co-occurrence ("file does NOT import any shell") in `scan-adoption-quality.mjs` if `coOccursWith` can only express positive matches. Add the key to the report the same way `shadowedBaseline` is reported.
- [ ] Add fixtures to `scripts/scan-adoption-quality.test.mjs`: a PageFrame + Table page with no shell import (hit), the same page importing `ListWithDetailShell` (no hit), a PageFrame page with no table (no hit).
- [ ] Document the signal in `docs/ADOPTION-QUALITY.md` "How it scans", next to `stale-vendored-appshell` and `shadowed-baseline-file`.

## Acceptance

- `npm run scan:adoption-quality` against gebo-stock-kiosk reports an `unshelled-list` hit for `frontend/src/pages/ItemLookup.tsx` and none for `Backlog.tsx` / `Requests.tsx`, which import `ListWithDetailShell`.
- A page that imports any archetype page shell no longer produces an `unshelled-list` hit, even when it also renders a `Table`.
- The scan still exits clean on a hit (radar semantics unchanged).
- `npm test` passes with the new fixtures.

## Related

- [[adoption-quality-scanner]]
- [[adoption-scan-flags-shadowed-baseline-files]]
- [[adoption-scan-flags-stale-vendored-appshell]]
- [ADR-0005](/docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — the adoptionQuality scan ships as a zero-dep donor script
