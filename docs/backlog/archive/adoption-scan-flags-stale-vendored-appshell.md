---
area: tooling
opened: 2026-09-29
status: done
value: normal
model: sonnet
model_reason: "adds one signal to an existing scan with its own test file; the pattern is established"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-09-29T15:30:00Z
---

# Adoption scan flags a vendored AppShell missing the db-desk hooks

## Context

v0.2.26 (PR #373) moved the content column's width steps into `src/styles/tokens.layer.css` as `@container db-desk` rules. They only take effect when `<main>` carries `@container/db-desk` and the column carries `db-content-column`. A consumer that keeps a vendored `components/layout/AppShell.tsx`, as hk-crm did (see the archived `appshell-sonner-opt-out` ticket), gets the new layer through the tag bump but not the hooks. Its column silently stays at 1180px on every wide monitor. The Axis C scan (`scripts/scan-adoption-quality.mjs`, `docs/ADOPTION-QUALITY.md`, ADR-0005) is the donor's read-only way to see that kind of drift in a consumer.

## What to do

- [ ] Add a signal to `scripts/scan-adoption-quality.mjs`: a consumer file that renders its own `<main>` with the AppShell page inset (`p-4 md:p-12 xl:p-14`) but lacks `@container/db-desk` or `db-content-column` counts as a hit. Name it as a stale vendored AppShell.
- [ ] Add fixture cases to `scripts/scan-adoption-quality.test.mjs` (one stale copy, one current copy, one consumer importing `AppShell` from the package).
- [ ] Document the signal in `docs/ADOPTION-QUALITY.md` and its machine form in `docs/audit-signals.json`, following the existing signal pattern.

## Acceptance

- The scan returns a hit for a fixture `AppShell.tsx` with the page inset and no `db-desk` hooks.
- The scan returns no hit for a current vendored copy, and no hit for any consumer that imports `AppShell` from the package.
- `npm test` passes, including the new fixture cases.

## Related

- [[appshell-sonner-opt-out]]
- [[package-ui-ownership-and-vendored-consumer-runbook]]
- ADR-0005 — adoption-quality audit (Axis C)
- ADR-0007 — the fleet house look (§1 amendment 2026-09-29)
