---
area: audit
opened: 2026-10-13
status: ready
value: low
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-13T00:00:00Z
---

# Add unit-test exclude to audit-signals catalog

## Context

`docs/audit-signals.json` `exclude` lists `.test.` and `.spec.` (plus `__tests__`), which does not match consumers that name tests `*.unit-test.tsx` (hk-crm). Every fleet molecule/conformance scan of hk-crm counts about 30 test-fixture lines (raw `<button>`/`<input>` in test stubs, `.animate-pulse` assertions) as hits, hiding real ones in the noise. Found in hk-crm `design-baseline-molecule-drift-recheck-2026-10` (PR #1280).

## What to do

- [ ] Add `unit-test` to the `exclude` array in `docs/audit-signals.json`.
- [ ] Confirm the dashboard's `moleculeAudit.ts` exclude glob (`!**/*<exclude>*`) matches `*.unit-test.tsx` with the new entry.

## Acceptance

- A re-run of the catalog's `rg` commands over hk-crm `src/` no longer returns any `*.unit-test.tsx` file.
- Hit counts for every other file are unchanged.

## Related

- [[adherence-lint-conformance-rule-gap]]
