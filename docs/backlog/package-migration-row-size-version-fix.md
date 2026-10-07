---
area: docs
opened: 2026-10-07
status: ready
model: sonnet
model_reason: "single-row docs correction with the fix named"
value: low
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-07T00:00:00Z'
---

# Fix v0.5.0 PACKAGE.md migration row citing v0.6.5 Button sizes

## Context

The existing `v0.5.0` "all controls" row in `docs/PACKAGE.md` tells consumers to use `Button` `size="inline"` / `size="icon-sm"`, but those sizes first shipped in `v0.6.5` (see the new v0.6.5 row and `CHANGELOG.md`). An app pinned to v0.5.x that follows the v0.5.0 row hits a type error.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `docs/PACKAGE.md`, mark the `size="inline"` / `size="icon-sm"` advice in the v0.5.0 "all controls" row as "(v0.6.5+)" or move it to the v0.6.5 row.
- [ ] Align the `v0.5.0` entry in `CHANGELOG.md` and check no other `docs/PACKAGE.md` row cites a size or prop before the version that shipped it.

## Acceptance

- The v0.5.0 "all controls" row no longer tells a v0.5.x consumer to use `inline` / `icon-sm` without the v0.6.5 qualifier.
- No other migration row cites a prop or size earlier than the version that shipped it.

## Related

- [[changelog-and-package-migration-rows]] — shipped the rows this corrects
- [[button-inline-and-icon-sm-sizes]] — shipped the v0.6.5 sizes
