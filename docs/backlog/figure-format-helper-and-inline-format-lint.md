---
area: archetypes
opened: '2026-10-06'
status: ready
value: high
model: sonnet
model_reason: "contract decided in this ticket; helper + demo migration + one adherence rule follow existing lib/utils and _adherence.json patterns"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-06T00:00:00Z'
---

# Shared figure formatter and adherence rule against inline number formatting

## Context

The baseline owns how a figure *looks* (ADR-0009: Inter, `tabular-nums`, regular weight; `tableColumn.ts` right-aligns numeric kinds) but not what it *says*. Value slots take `React.ReactNode` (`src/components/archetypes/report/ReportLineTable.tsx` `qty`/`unit`/`sum`), so every consumer formats numbers itself, and the baseline's own demos model exactly that: `src/examples/report-demo.tsx:65/72/117` (incl. `style: "percent"`), `detail-overview-demo.tsx:96`, `statement-with-filters-demo.tsx:122` each build their own `new Intl.NumberFormat("de-DE", …)`.

Consumer evidence (controlling-app, 2026-10-06): **six** independent percentage formatters — `formatPercentDE` (`lib/utils.ts`, returns the number only, callers append `" %"`), `formatKpiValue` (`ledger-grid/utils.ts`), bankenreporting `pct()` (expects fractions, ×100), budget `formatPct` and `MarginRow` `pct()`, and inline `toFixed(1) + "%"` in three dashboard chart files (renders `47.3%` — wrong decimal separator, no space). Two value scales coexist (percent points 47 vs fraction 0.47) with no type telling them apart, and a ratio-flag omission on one grid shipped quotas as money (controlling-app `planung-ratio-lines-render-as-figures`). Root cause is ownership: nothing in the paved road says "figures go through one formatter", and `_adherence.json` checks headings, tables, buttons, colours, focus and controls — not number formatting.

Decisions taken with the operator (2026-10-06):

- **Scale is part of the kind, never inferred:** `percent` takes percent points (47 → `47,0 %`); a separate `fraction` kind takes 0–1 (0.47 → `47,0 %`). No heuristic auto-detection.
- **Locale is a parameter defaulting to `de-DE`** — fleet apps are German today; the default keeps call sites short without hardcoding.
- **Domain mapping stays in the consumer** (e.g. controlling-app's BWA `display_format` → `kind`); the baseline ships only the generic kinds.

## What to do

- [ ] Add `formatFigure(value: number | null | undefined, kind: "currency" | "percent" | "fraction" | "ratio" | "count", opts?: { decimals?: number; signed?: boolean; locale?: string; currency?: string })` in a new `src/lib/format.ts`, exported as `./lib/format` in `package.json` `exports` (same shape as `./lib/utils`). German output: `1.234,56 €`, `47,3 %` (no-break space U+00A0 before `%`, as de-DE `Intl` percent style emits), `−` for negatives, `—` for null/undefined.
- [ ] Unit-test every kind incl. the percent-vs-fraction pair (47 and 0.47 both render `47,0 %`), null, negative, `signed`, and a non-default `locale`.
- [ ] Migrate `src/examples/report-demo.tsx`, `detail-overview-demo.tsx`, `statement-with-filters-demo.tsx` (and any other `src/` hit of `Intl.NumberFormat` / `toLocaleString(` / `toFixed(`) to `formatFigure`, so the reference code models the rule.
- [ ] Add adherence rule `no-inline-number-format` to `_adherence.json` (severity `warn`, exclude `src/lib/format.ts` and tests): matches `new Intl.NumberFormat`, `.toLocaleString(`, and `toFixed(` within a `"%"`/`'%'` concatenation. Document it in `_adherence.NOTES.md` and in the adoption docs so consumers copy it into their own `_adherence.json`; flip to `error` per the existing ratchet ([[adherence-lint-warn-to-error-ratchet]]) once `src/` is clean.
- [ ] Add a "Figures" paragraph to `docs/STYLE.md` next to the ADR-0009 figure rule: figure *values* are formatted by `formatFigure`, scale is explicit in the kind.
- [ ] Bump MANIFEST / package version per `docs/RULES.md` rule 8 (new export, demos changed).

## Acceptance

- [ ] `formatFigure(47.3, "percent")` and `formatFigure(0.473, "fraction")` both return `47,3 %`; `formatFigure(null, "currency")` returns `—`.
- [ ] `node scripts/lint-design.mjs` reports zero `no-inline-number-format` hits under `src/` after the demo migration — no other demo or primitive builds its own `Intl.NumberFormat`.
- [ ] The rule fires on a fixture containing `(v * 100).toFixed(1) + "%"` and on `new Intl.NumberFormat("de-DE")`, and stays silent on `src/lib/format.ts`.
- [ ] A consumer can `import { formatFigure } from "design-baseline/lib/format"` from an installed tag.

## Related

- [ADR-0009](/docs/adr/0009-figures-in-the-house-sans.md) — figures in the house sans; this ticket adds the value half of the figure rule
- [ADR-0003](/docs/adr/0003-adherence-lint-zero-dep-scanner.md) — adherence lint as zero-dep scanner (where the new rule lives)
- [[refactor-figure-table-grid-report-statement]] — shared FigureTable grid; a later step can let figure cells take `{ value, kind }` instead of a pre-formatted node
- [[adherence-lint-warn-to-error-ratchet]] — warn→error ratchet the new rule follows
