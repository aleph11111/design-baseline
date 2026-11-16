---
area: archetypes
opened: '2026-11-16'
status: needs-enrichment
value: normal
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "unresolved ## Open question caps the score at 4"
  graded_at: '2026-11-16T00:00:00Z'
---

# AppShell main top inset too tall for transaction-document pages

## Context

`<main>` in `src/components/layout/AppShell.tsx:81` is the canonical owner of the page inset (`p-4 md:p-12 xl:p-14`), so 48-56px of empty space sits above every page header at `md`+. A transaction-document page cannot match operator mockup V2 (brickshop artifact `PS7Y9AhSeLtpZyEHRaEzEw`, `project/V2.dc.html`: breadcrumb 16px under the app header). Measured 2026-11-16 at laptop14Window 1133x739: after the v0.47.0 compact Td header, the sales-order Total row still ends ~820px below the shell h1; the 32px of extra top inset is the remaining shell-independent gap. A shell-side negative margin was tried and rejected (it overlaps anything rendered above the shell). Consumer: brickshop `orders-detail-next-step-panel-mockup-v2`.

Mechanism is already in place: `<main>`'s column wrapper switches on `has-[.db-document-column]` (`DOCUMENT_COLUMN_CLASS`, ADR-0015) and `has-[.db-full-bleed]` (ADR-0007 §1), so a per-archetype inset needs no new prop or context.

## What to do

- [ ] Reduce `<main>`'s top padding to `pt-4` (16px) on `md`+ for pages that carry `.db-document-column`, via a `has-[.db-document-column]:pt-4` variant on the `<main>` in `src/components/layout/AppShell.tsx`, leaving horizontal and bottom insets and every other archetype unchanged (matches the existing `has-[…]` pattern on the column wrapper, two call sites).
- [ ] Update the `<main>` comment block and `docs/STYLE.md` "Spacing & rhythm" to name the document-column top inset.
- [ ] Add a test or gallery check that a document-column page's header top sits 16px below the app header at laptop14, and bump the package version per `docs/PACKAGE.md`.
- [ ] Regenerate the Td screenshot baselines (`npm run screenshots:update`) and review the PNG diff.

## Acceptance

- A transaction-document page renders its breadcrumb/header 16px below the app header at laptop14 and desk27 (md and xl breakpoints).
- Pages without `.db-document-column` (list, form, full-bleed archetypes) keep `p-4 md:p-12 xl:p-14` unchanged; their pixel baselines show no diff.
- The v0.47.0 compact Td header's Total row ends 32px higher than the 2026-11-16 measurement at laptop14Window 1133x739.

## Related

- [[transaction-document-next-step-panel-compact-layout]] — same mockup-V2 compaction effort, header/panel side
- [[appshell-scroll-model-window-vs-main]] — earlier `<main>` ownership decision
- [ADR-0014](/docs/adr/0014-transaction-document-page-archetype.md) — transaction-document archetype
- [ADR-0015](/docs/adr/0015-page-body-section-card-stack.md) — document column, section-card stack
- [docs/STYLE.md](/docs/STYLE.md) — "Spacing & rhythm"

## Open question

Scope of the top inset. Defaulted to document-column pages only (smallest blast radius, no fleet baseline churn). Alternatives: (B) fleet-wide `pt-4 md:pt-4` on every page — consistent with V2 everywhere but changes every consumer's pixel baselines and needs operator sign-off; (C) a shell prop/context so a page opts in — more API for one consumer. Confirm A vs B before `/feat`.
