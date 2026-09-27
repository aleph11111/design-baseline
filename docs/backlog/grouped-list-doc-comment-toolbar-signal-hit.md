---
area: tooling
opened: '2026-09-27'
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-09-27T00:00:00Z'
value: low
model: sonnet
model_reason: rewording two doc-comment sentences to stop matching a regex literal — no design decision, the signal definition already prescribes the expected shape
---

# Grouped-list JSDoc prose trips the list-shell-missing-toolbar signal, not a real gap

## Context

`npm run scan:adoption-quality` (the `chart-hex-colour-prop`/`list-shell-missing-toolbar` fix in #311 corrected the scanner's `g`-flag `lastIndex` carry-over, which had been hiding this) now reports two `list-shell-missing-toolbar` (yellow) hits on the donor's own `grouped-list` archetype: `src/components/archetypes/grouped-list/GroupedListShell.tsx:32` and `GroupedListSection.tsx:51`. Both are JSDoc prose sentences (`` the inner `<ListWithDetailShell>` drops its own chrome ``) that literally contain the regex's target string `<ListWithDetailShell`, not real JSX usage — the actual component tag is at `GroupedListSection.tsx:82`, which correctly needs no `toolbar=` because the outer `GroupedListShell` owns it. The signal's own definition (`docs/audit-signals.json:96`, `list-shell-missing-toolbar`) already names both shapes as the documented expected residual: "a nested inner shell inside a grouped-list (G) section, where the outer GroupedListShell owns the toolbar, and prose mentions of the tag name in doc comments." So per the signal's own definition, neither the shell nor the signal's matching logic is wrong — the two doc comments are just worded in a way that accidentally satisfies the same literal pattern the regex is watching for.

## What to do

- [ ] Reword the two JSDoc sentences (`GroupedListShell.tsx:32`, `GroupedListSection.tsx:51`) to name the component without the `<...>` bracket notation (e.g. "the inner `ListWithDetailShell` drops its own chrome" instead of `` `<ListWithDetailShell>` ``) so they no longer match the signal's `<ListWithDetailShell\b` literal — this removes the two prose false-positive hits without narrowing the regex (which risks missing a real un-bracketed instance elsewhere) and without adding a meta/allowlist comment the scanner doesn't read.

## Acceptance

- `npm run scan:adoption-quality` no longer lists `GroupedListShell.tsx:32` or `GroupedListSection.tsx:51` under `list-shell-missing-toolbar`.
- The real, correctly-toolbar-less usage at `GroupedListSection.tsx:82` is unaffected (still not required to carry `toolbar=`, per the signal's own "outer shell owns it" exemption).

## Related

- [archive/house-look-chart-palette.md](archive/house-look-chart-palette.md) — follow-up of this slice (#311): the `lastIndex` fix that exposed this donor self-scan hit
- `docs/audit-signals.json` — `list-shell-missing-toolbar` signal definition (already documents this exact residual shape)
- `docs/ADOPTION-QUALITY.md` — Axis C scan contract
