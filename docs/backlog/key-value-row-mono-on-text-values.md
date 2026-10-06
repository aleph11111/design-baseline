---
area: archetypes
opened: 2026-10-06
status: needs-enrichment
value: normal
model: sonnet
model_reason: "one primitive plus its donor call sites; the API choice is recorded as an open question to confirm first"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "prop shape for numeric values auto-resolved to Recommended; confirm before /feat"
  graded_at: 2026-10-06T00:00:00Z
---

# KeyValueRow renders every value in mono, including names, badges and sentences

## Context

`KeyValueRow` (`src/components/archetypes/detail-overview/KeyValueRow.tsx:68`) hard-codes
`font-mono font-medium tabular-nums` on the `<dd>` for every value. `docs/STYLE.md` (line ~160) and
`docs/PLACEMENT.md` (Numbers row) scope mono to **figures** — money, IDs, quantities, dates. Text values
(a person's name, an email, a `Badge`, a prose hint like "Nicht verknüpft — wende dich an einen Admin.")
therefore render in IBM Plex Mono, which makes master-data summaries look like a debug dump. Seen on
mistra `/profil`, where all four values are text and the whole card reads as code.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Render `KeyValueRow` values in the sans face by default and add a `numeric` boolean prop that applies `font-mono tabular-nums` (per the `docs/STYLE.md` figure rule).
- [ ] Set `numeric` on the figure rows in `src/examples/detail-overview-demo.tsx` and `src/examples/tabbed-settings-demo.tsx`, and update the `KeyValueRow` doc comment and `docs/archetypes/detail-overview.md` where they describe value typography.
- [ ] Call out the default change in the version bump so consumers mark their figure rows.

## Acceptance

- A `KeyValueRow` without `numeric` renders its `<dd>` without `font-mono`.
- A `KeyValueRow` with `numeric` renders `font-mono tabular-nums`.
- No other donor call site of `KeyValueRow` that shows a figure loses mono after the change (demo figure rows carry `numeric`).

## Related

- [[detail-overview-empty-body-strip-renders]] — sibling defect seen on the same page
- [[archetype-convergence-detail-overview-close-api]]
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — per-call-site appearance only when derived (value type is derived from data)

## Open question

Prop shape, auto-resolved to the Recommended option: **(Recommended)** sans by default + opt-in `numeric` prop.
Alt A: keep mono default + opt-out `text` prop (no consumer churn, but keeps the wrong default).
Alt B: auto-detect (mono when `value` is a number) — misses formatted strings like "€120".
