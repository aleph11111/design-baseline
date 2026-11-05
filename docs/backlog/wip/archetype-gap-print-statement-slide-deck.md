---
area: archetypes
opened: 2026-11-05
status: ready
value: normal
model: opus
model_reason: "shell API design: @page ownership and optional header change a shipped archetype's contract"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-05T00:00:00Z
---

# Archetype gap: print-statement cannot host slide-deck print routes

## Context

Consumer: controlling-app (design-baseline v0.25.0 pin). `frontend/src/app/print/bankenreporting/page.tsx` and `frontend/src/app/print/internal-reporting/page.tsx` render a folien-bauen slide deck (`PrintBankenreportingView` / `PrintInternalReportingView`, `components/print/bankenreporting/`): fixed 1280x720 slides, one per printed page, each deck with its own cover slide carrying its own title. The deck CSS sets `@media print { @page { size:1280px 720px; margin:0 } .slide { page-break-after:always } }`. Route shape is the same as the statement routes: no app chrome, screen-only print toolbar, loading/error replace the document, auto-print once ready, `document.title` = PDF filename.

`src/components/archetypes/print-statement/PrintStatementShell.tsx` (Pr, v0.21.0) fails on three counts: (1) it always emits `@page { size: <pageSize>; margin: 12mm }` and `pageSize` only offers A4 landscape|portrait, so the body cannot own the page rule and the two `@page` rules conflict; (2) it always renders the `<header className="mb-4">` with the title h1 above the body, which prints on page 1 and pushes the fixed-height cover slide over the page boundary (blank/shifted pages), and the cover is already the deck's title, so the shell title is a second title; (3) its `thead` repeat and `tr` break-inside rules are table-only and irrelevant to slides.

Nearest archetypes ruled out: `report` (bounded invoice column), `analytics-dashboard` (interactive tile grid).

archetype: print-statement (extend; no new archetype). Decision grounded in [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md): a new mode of an existing shape is a variant of that archetype, not a new one. Both routes need exactly the shell responsibilities print-statement already owns (toolbar, early states, once-only auto print, `document.title`); only page-rule ownership and the printed header differ. Rule of 2 is met by the two routes, but a second archetype would duplicate the toolbar/early-state/auto-print machinery.

## What to do

- [ ] Add a page-rule opt-out to `PrintStatementShell` (e.g. `pageSize="none"`) so it emits no `@page` rule and the body owns page size and margin.
- [ ] Make the printed document header optional (e.g. `hideHeader`): the title stays for a11y and `document.title`, but is not printed (screen-reader/`print:hidden`-safe, no layout space at print).
- [ ] When the page rule is handed to the body, skip the table-only print CSS (`thead` repeat, `tr` break-inside) or leave it inert for non-table bodies.
- [ ] Keep toolbar, loading/error early states and once-only auto print unchanged for the new mode.
- [ ] Add a living demo of the slide-deck mode in `src/examples/print-statement-demo.tsx` (per the variants-need-demos convention), update `docs/archetypes/print-statement.md` (role-only wording, no Tailwind names) and bump the MANIFEST version.

## Acceptance

- `PrintStatementShell` with `pageSize="none"` emits no `@page` rule, so a body-supplied `@page { size:1280px 720px; margin:0 }` is the only page rule in the document.
- With the header hidden, the title is absent from the printed output yet still available to assistive tech and `document.title`; the first body element starts at the top of page 1.
- A 1280x720 slide deck body prints one slide per page with no blank or shifted pages.
- Default usage (`a4-landscape`, header shown) renders unchanged: existing `PrintStatementShell.test.tsx` cases still pass.

## Related

- [[archetype-gap-print-statement-document]] — the archived gap that shipped print-statement (Pr)
- [ADR-0011](/docs/adr/0011-analytics-dashboard-edit-mode.md) — variant-not-new-archetype precedent
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one title per page
