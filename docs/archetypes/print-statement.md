---
key: Pr
slug: print-statement
kind: page
version: 1.0
promoted_from: controlling-app
promoted_at: 2026-11-04
source_spec_version: n/a (no source spec — distilled from controlling-app's PrintPageShell, ADR-0050)
status: locked
---

# Archetype Pr — Print statement

## Purpose

A **print-statement** page is a **print-only route** that renders one finished
statement for the browser's print-to-PDF: a balance sheet, a cash-flow
statement, a variance report, a bank reporting pack. Its body is one or more
**wide, multi-column statement tables** that run over several printed pages.
The page exists to be printed; on screen it only previews the document and
offers the print action.

Pick it over its neighbours (see `docs/CHOOSING-A-SURFACE.md`):

- **report (R)** — one bounded, invoice-shaped document column inside the app.
  A print statement is unbounded and wider than any reading column, lives on
  a route with no app chrome, and owns the printed page size.
- **statement-with-filters (F)** — the interactive statement inside the app,
  scoped by a filter toolbar. The print statement is what that page hands off
  to when the user prints: its scope arrives fixed (route parameters), so
  nothing on it re-scopes the document.
- **matrix-grid (M)** — one measure across two entity axes, edited or read in
  the app. Not a print document.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/print-statement`; the prop surface is the API and the sandbox demo (`src/examples/print-statement-demo.tsx`) is the gallery reference.

---

## Structure

A print statement is mounted on a route **outside the app shell** — no
sidebar, no app header, no bottom nav. The shell supplies, in document order:

**1 — Print toolbar (screen only).** A band across the top holding a short hint
("choose *Save as PDF* in the print dialog") and the one print action. It is
hidden under print media, so it never reaches the paper.

**2 — Document header.** The statement's `title`, once, as the page heading;
an optional `subtitle` line (entity · scenario · period) and an optional `meta`
line (generated-at stamp).

**3 — Body (unbounded).** The statement tables, banners and check strips, at the
full width of the route. On a narrow screen the body scrolls sideways inside
itself; on paper it lays out at the printed page width. Every table's header
row repeats at the top of each printed page, and a table row never splits
across a page break.

**Page-size policy.** The shell owns the printed page: one `pageSize` prop
emits the page rule — `a4-landscape` (the default; wide statements) or
`a4-portrait` — with a fixed 12 mm margin. Colors print exactly as rendered
(row tints and highlights survive the print dialog's background stripping).

**Early states.** While loading, or on error, the state **replaces the whole
document**: no toolbar, no header, no body, no print action, no auto print. A
partial statement is never offered for print. An error wins over loading, so a
failed fetch shows its error and retry, never an endless loading state.

**Auto print.** Once the document first renders ready, the shell opens the
print dialog once, after a short paint delay. Re-renders never open it again.
A preview context turns it off (`autoPrint={false}`).

---

## House style

- **Figures** — every money / quantity / period figure renders in the
  **canonical tabular figure style**, right-aligned; labels stay in the default
  sans style.
- **Table headers** — the **canonical table-column-header overline style**;
  rows hairline-divided, totals in a heavier weight.
- **Tokens only** — surfaces and text use the theme tokens, no literal colors.
- **Accent** — stays the donor neutral default; the consumer re-skins the
  **brand/primary color token** on its own surface.

---

## Forbidden patterns

1. **App chrome on the print route.** No sidebar, app header or bottom nav; the
   route mounts outside the app shell.
2. **A hand-built print wrapper.** The toolbar, page rule, header and early
   states come from the one shell — no per-route copy of them.
3. **A second title.** The statement title is the shell's `title`, once; the
   body does not repeat it as its own heading.
4. **Filters or re-scoping controls.** Scope arrives with the route; the only
   control is the print action.
5. **Printing a partial document.** Loading and error render through the
   shell's early states, never alongside a half-filled body.
6. **A bounded reading column.** The body is unbounded; a bounded document is
   **report (R)**.
7. **Raw figure strings.** Figures route through consumer-provided formatters;
   the shell never formats.

---

## Acceptance gate

> **Axis-C (adoption-quality) checklist** — the canonical list a page adopting this
> archetype is scored against (see [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md)).
> A page that composes this archetype's shell is **conformant** only when every
> REQUIRED box passes; one that fails any REQUIRED box is a 🔴 **wrapper adoption**,
> routed to the teardown ritual ([`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`](../DETAIL-PAGE-TEARDOWN-PLAYBOOK.md)).
> `adoptionQuality.score = REQUIRED passed ÷ REQUIRED applicable`; `wrapper = true`
> when score < 1.0. **[spine]** = the shared conformance spine **S1–S6** (single inset ·
> shell-not-hand-rolled · canonical states · atoms+tokens · aligned figures · brand
> primary), defined in [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md).

**REQUIRED**

- [ ] **One print-statement shell** owns the route: toolbar, page rule,
      `title`, early states — no hand-built print wrapper, no page-local
      page rule, no own print button.
- [ ] **No app chrome** — the route renders outside the app shell.
- [ ] **Early states via the shell** (`isLoading` / `error`), never a body
      rendered while data is missing.
- [ ] **Title once** — the statement title is the shell's `title`; the body
      carries no own page heading.
- [ ] **[spine] S1–S6** — figures in the canonical tabular figure style and
      right-aligned; atoms + tokens only (no literal colors); accent left as
      the neutral default.

**SHOULD** (yellow, not red)

- [ ] Body tables are real tables with a header row, so the header repeats on
      every printed page.
- [ ] `pageSize` left at the default unless the statement is narrow enough to
      read in portrait.

---

## Version log

- **1.0** (2026-11-04) — initial contract, distilled from controlling-app's
  eight print routes (`PrintPageShell`, ADR-0050).
