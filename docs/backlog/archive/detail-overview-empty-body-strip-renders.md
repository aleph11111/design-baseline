---
area: archetypes
opened: 2026-10-06
status: done
value: normal
model: sonnet
model_reason: "scoped conditional render in one component plus tests; cause established by reading the shell"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-06T00:00:00Z
---

# DetailOverviewShell renders an empty bordered body strip when no body slots are filled

## Context

`DetailOverviewShell` (`src/components/archetypes/detail-overview/DetailOverviewShell.tsx`) always renders the
body container `border-t border-border/60 p-5 space-y-4` — in the `vertical` layout (line ~186) and as the
`main` column of the `rail` layout (line ~164) — even when `content`, `stats` and (vertical) `references` are
all empty/falsy. The result is a ruled, padded blank bar under the summary block. Seen on mistra `/profil`
for a user with no linked person: `content` is `linkedPerson && (...)`, so it is `undefined`, and the page
ends in a ~40px empty strip that reads as broken. Unchanged since v0.3.0.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `DetailOverviewShell`, skip the vertical body container when `statStrip`, `content` and `references` are all empty (null/undefined/false).
- [ ] In the `rail` layout, skip the `main` column when `statStrip` and `content` are empty, so the rail does not sit next to an empty padded cell.
- [ ] Add cases to `DetailOverviewShell.test.tsx` covering a summary-only shell in both layouts.

## Acceptance

- A `vertical` shell with only `summary` renders no element with the `border-t border-border/60 p-5` body classes.
- A `rail` shell with only `summary`/`references` renders no empty `main` column.
- Shells with any body slot filled render unchanged (existing tests stay green).
- No other layout branch of the shell renders an empty padded container when its slots are empty.

## Related

- [[key-value-row-mono-on-text-values]] — sibling defect seen on the same page
- [[archetype-convergence-detail-overview-close-api]]
- [[detail-overview-stats-prop-demo-gap]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame, slot-owned placement
