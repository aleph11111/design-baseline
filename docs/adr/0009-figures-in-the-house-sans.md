# 0009 — Figures in the house sans: Inter, tabular, regular weight

- **Status:** Accepted
- **Date:** 2026-10-06
- **Supersedes:** STYLE.md House style B's face and figure rule ("Plex Ledger", 2026-06-21): IBM Plex Sans + every figure in IBM Plex Mono.
- **Extends:** [ADR 0007](0007-fleet-house-look-fixed-vs-brand-roles.md) — the house face is a donor-fixed role.

## Context

Every figure (money, IDs, quantities, dates) rendered `font-mono tabular-nums` in IBM Plex Mono, mostly at medium/semibold weight, baked into the layout primitives (`StatTile`, `KeyValueRow`, `MetricRow`, the shared table cells). The operator found the result unsatisfying, especially numbers: mono digits are wide and typewriter-like, a 34px mono KPI reads as a terminal, and `KeyValueRow` put names, emails and badges in mono too, so master-data cards read as a debug dump ([key-value-row-mono-on-text-values](../backlog/archive/key-value-row-mono-on-text-values.md)).

The operator compared four treatments on the same German ledger samples (specimen artifact https://claude.ai/artifact/NLbAQB7NnRbQqa3R44HTt4): today's Plex + mono figures, and Plex Sans / Inter / Geist with tabular sans figures.

## Decision

1. **The house face is Inter** (`--font-sans`), for prose, labels, names and figures alike.
2. **Figures render in the sans face with `tabular-nums`.** Columns still align (tabular figures are fixed-width); the face stays one voice. Figures carry **regular weight**, the headline KPI included — size, not weight, makes the headline.
3. **Identifiers render in the sans face too** (record numbers, invoice numbers, codes). They keep their role styling (e.g. the primary-coloured clickable identifier cell); they lose mono.
4. **Mono is for code only** — JSON / config text, hex colour input. `--font-mono` is the system mono stack (`ui-monospace`, SF Mono, Menlo, Consolas); no web font loads for it.
5. Numerals that sit inside a label or heading (a calendar day header, a wizard step marker) keep that label's weight; rule 2's regular weight governs figure *values*.

## Consequences

- `tableColumn`'s `identifierMono` prop is removed — with identifiers in sans it has no meaning. A consumer passing it gets a type error naming the line to delete.
- Consumers must load Inter (Next: `next/font/google` `Inter`; Vite: the Google Fonts `<link>`), and drop their IBM Plex loader. A consumer that uncommented the FONT BINDING block in its `tokens.css` re-points it to its Inter variable. Without a loaded Inter the face falls back to `system-ui` — legible, not broken.
- Hand-written `font-mono` on consumer figure cells (the old house rule told them to) is now drift; the `audit-signals.json` advice is updated to `tabular-nums` only.
