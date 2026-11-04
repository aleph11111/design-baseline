---
area: archetypes
opened: 2026-11-04
status: done
value: normal
model: opus
model_reason: "new archetype contract + shell design: print chrome, @page policy and slot set are open design"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-04T00:00:00Z
---

# Archetype gap: print-only statement document shell

## Context

controlling-app has 8 print routes (`frontend/src/app/print/{annual-statements,balance-sheet,bankenreporting,cashflow,consolidation,internal-reporting,report,variance}/page.tsx`), all wrapping a `Print*View` in `components/print/PrintPageShell.tsx` (ADR-0050, browser print-to-PDF). No `kind: page` archetype in `docs/archetypes/MANIFEST.json` fits. Shape: a print-only route with no app nav, (1) an on-screen-only toolbar (hidden under `print:`) with hint text and a "Drucken / Als PDF speichern" button, (2) an unbounded, full-width, multi-page body of wide multi-column financial statement tables, (3) an `@page { size: A4 landscape; margin: 12mm }` policy, (4) loading / error early states; it auto-prints on load.

Why the nearest fail: `report` (R) is a bounded `sm`/`md`/`lg` invoice-shaped document column that forbids full-bleed and has no toolbar slot or `@page` policy (`docs/archetypes/report.md`); `statement-with-filters` (F) is built around an interactive filter toolbar and app chrome; `matrix-grid` (M) is a two-entity-axes shape. A `report` variant is rejected because the bounded-column width keying is report's core contract, and bolting an unbounded landscape mode onto it would blur that contract. Decision: a new `kind: page` archetype (working slug `print-statement`). No same-shape sibling known in other fleet repos.

## What to do

- [ ] Author `docs/archetypes/print-statement.md` as a role-only contract (no Tailwind classes or primitive names; the binding is the exported component) with slots: print toolbar (screen-only), body (unbounded), loading, error; and a page-size prop (`a4-landscape` default, `a4-portrait`) that owns the `@page` rule.
- [ ] Ship the typed export `design-baseline/archetypes/print-statement` from `src/components/archetypes/print-statement/`, rendering without AppShell/Sidebar/Header, hiding the toolbar under `print:`, and keeping table header rows repeating across printed pages.
- [ ] Add a sandbox demo `src/examples/print-statement-demo.tsx` showing a wide multi-column statement table plus loading and error states, and register the archetype in `docs/archetypes/MANIFEST.json` (`kind: page`, `promoted_from` controlling-app `PrintPageShell`).
- [ ] Cover it in `npm run check:viewports` and the screenshot baselines, plus a print-media assertion that the toolbar is hidden and the `@page` size is emitted.

## Acceptance

- The consumer's 8 print routes render through the one exported shell with no hand-built page wrapper, so the `PrintPageShell` duplicate is deletable.
- The toolbar shows on screen and is hidden under print media; the emitted `@page` size is A4 landscape with 12mm margin by default.
- The loading and error states render instead of the body and show no print action for a partial document.
- `MANIFEST.json` lists `print-statement` and the manifest version verify script passes.

## Related

- [[archetype-convergence]] — roadmap that governs archetype set growth
- [[archetype-gap-waiver-needs-operator-approval]] — policy: no fit means the consumer page ticket stays blocked on this gap
- [report contract](/docs/archetypes/report.md) — nearest archetype, why it does not fit
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement
