---
area: other
opened: 2026-11-04
status: ready
value: low
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-04T00:00:00Z
---

# Fix src comments citing wrong hard rule 12 for appearance locality

## Context

Three `src/` comments cite "hard rule 12" for the appearance-locality rule, but that rule is `docs/RULES.md` hard rule 10 (rule 12 is the page-shell rule): `src/components/layout/NestedPageHeading.tsx:71`, `src/components/layout/StatTileRow.tsx:28`, `src/components/archetypes/analytics-dashboard/DashboardWidget.tsx:52`. Left out of PR #642 because shipped `src/` edits need a `package.json` version bump (`verify:package-version`, RULES rule 11).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Change "hard rule 12" to "hard rule 10" in the comment at each of the three cited locations (comment text only, no code change).
- [ ] Bump `package.json` `"version"` in the same PR (per RULES rule 11).

## Acceptance

- `grep -rn "hard rule 12" src` returns only citations of the page-shell rule; no other `src/` comment cites rule 12 for appearance locality.
- `verify:package-version` passes after the bump.

## Related

- [[lint-messages-cite-wrong-rules-md-rule-number]] — same class of wrong rule number, fixed for lint messages in PR #642
- [RULES.md](/docs/RULES.md) — rules 10, 11, 12
