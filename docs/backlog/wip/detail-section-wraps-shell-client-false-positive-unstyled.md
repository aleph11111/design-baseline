---
area: tooling
opened: 2026-09-28
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-09-28T10:30:00Z
---

# detail-section-wraps-shell-client signal fires on already-unstyled shell clients

## Context

The `detail-section-wraps-shell-client` entry in `docs/audit-signals.json` (`adoptionQuality`, gated on `DetailOverviewShell|DetailSection`) matches any `<DetailSection>` whose body contains a `<…Client` tag within 600 chars. Its own `shouldBe` names `unstyled` on the inner `ListWithDetailShell` as a sanctioned fix, but the regex does not exclude that fix. It also misses the other sanctioned route, rendering the shell under `ListChromeContext` (covered in `src/components/archetypes/list-with-detail/ListWithDetailShell.test.tsx:175`). On hk-crm at v0.2.11 (`scripts/scan-adoption-quality.mjs` run on 2026-09-28), both hits are false positives:
- `src/app/(app)/projects/[id]/page.tsx:142` passes `<ProjectTicketsClient … unstyled />`.
- `src/app/(app)/events/[id]/page.tsx:40`'s `EventParticipantsClient` renders `ListWithDetailShell` inside `<ListChromeContext.Provider value>`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Tighten the `detail-section-wraps-shell-client` regex so a `<…Client` tag that carries `unstyled` inside the same `<DetailSection>` does not match.
- [ ] Document the `ListChromeContext` route as a known residual in the signal's `smell` text, or exclude it the same way. That route isn't visible from the page file, so a single-file regex can't see it.
- [ ] Add a `scripts/scan-adoption-quality.test.mjs` case for each of the two shapes.

## Acceptance

- The scan returns 0 `detail-section-wraps-shell-client` hits on a `<DetailSection>` wrapping a `<XClient unstyled />`, and still flags a wrapped client without `unstyled`.
- Run against hk-crm, the scan no longer reports `src/app/(app)/projects/[id]/page.tsx`. The `events/[id]` hit either disappears or is listed as a documented residual. No other `adoptionQuality` signal's hit count changes.

## Related

- [ADR-0005](../../adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — the Axis C adoption-quality scan (see `docs/ADOPTION-QUALITY.md`)
