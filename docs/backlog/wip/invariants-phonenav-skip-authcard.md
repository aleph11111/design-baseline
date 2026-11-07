---
area: tooling
opened: 2026-11-06
status: ready
value: normal
model: sonnet
model_reason: "scoped guard in one measurement plus a one-line marker on AuthCard; pattern set by the existing .db-full-bleed marker check"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-06T00:00:00Z
---

# Skip the phoneNav invariant on off-app AuthCard pages

## Context

`src/testing/invariants.mjs:89` (`phoneNav`) requires a phone page to show a fixed `nav` (BottomNav) or a `[data-sidebar=trigger]`. A centered off-app utility screen (sign-in, not-authorized, 404) renders `AuthCard` (`src/components/layout/AuthCard.tsx`) without `AppShell`, so it has no app navigation by design and always breaches. Repro: controlling-app frontend `make check-visual`, `login` @ phone breaches `phoneNav`. Consumers currently hold the cell in `KNOWN_FAILING` (controlling-app `routes.spec` now allows anonymous routes there). `AuthCard` renders no marker today, so the invariant has nothing to detect it by.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Give the `AuthCard` root element a stable marker (e.g. `data-slot="auth-card"`) so the in-page measurement can detect it.
- [ ] In `src/testing/invariants.mjs`, skip the "no navigation" `phoneNav` check when the page renders an `AuthCard` marker and no `AppShell` sidebar/trigger; keep the "desktop sidebar on phone" check unchanged.
- [ ] Add a test in `src/testing/invariants.test.ts` covering both the skip and a non-AuthCard page that still breaches.
- [ ] Update `.d.mts` / docs only if the exported surface or the invariant's documented description changes.

## Acceptance

- `phoneNav` returns no problem for a phone page that renders `AuthCard` without `AppShell`.
- A phone page with `AppShell` content and no BottomNav or sidebar trigger still reports `phoneNav`; no other page shape loses the check, only the AuthCard-without-AppShell shape is exempt.
- Every other invariant (overflow, tapTargets, the desktop-sidebar `phoneNav` branch) is unchanged on an `AuthCard` page.
- `npm test` passes after the change.

## Related

- [[export-page-invariants]] — shipped the `src/testing/invariants.mjs` export this changes
- [[device-triad-check-viewports]] — the device-triad run that surfaces the breach
- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — precedent for marker-based invariant checks (`.db-full-bleed`)
