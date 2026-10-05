---
area: tooling
opened: 2026-10-04
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-04T12:00:00Z
---

# Adherence lint misses swallowed PageFrame slot props

## Context

In a shell under `src/components/archetypes/` that destructures a prop by name next to `...rest` and then forwards only `...rest` to `PageFrame` (`src/components/layout/PageFrame.tsx`), the named prop is silently dropped and `tsc` does not flag it. This happened twice during the ADR-0008 shell migration (`toolbar` in two shells) and was caught only by new tests. The adherence lint `scripts/lint-design.mjs` (ADR-0003) has no rule for it.

## What to do

- [ ] Add a rule to `scripts/lint-design.mjs`, scoped to `src/components/archetypes/**`, that flags a `PageFrame` slot name (`title`, `subtitle`, `badges`, `actions`, `toolbar`, `count`, `viewOptions`) destructured in a shell function but never referenced in its JSX (per ADR-0003, the lint is the zero-dep enforcement point for shell conventions).
- [ ] Add positive and negative fixtures to `scripts/lint-design.test.mjs` / `scripts/lint-design-core.test.mjs`, and record the rule in the adherence notes ledger and `docs/STYLE.md` where the other rules are listed.

## Acceptance

- Running the lint on a shell that destructures `toolbar` beside `...rest` and forwards only `...rest` to `PageFrame` fails with a finding naming the swallowed slot.
- Every shell under `src/components/archetypes/**` that destructures any listed slot name without referencing it in JSX is reported, and no shipped shell currently triggers the rule.

## Related

- [ADR-0003](/docs/adr/0003-adherence-lint-zero-dep-scanner.md) — Adherence lint ships as a zero-dep scanner
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement
- [[adherence-lint-render-callback-slot-gap]]
- [[adherence-lint-union-prop-blind-spot]]
