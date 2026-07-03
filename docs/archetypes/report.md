---
key: R
slug: report
kind: page
version: 1.1
---

# Archetype R — Report

## Purpose

A **report** page is a single **formal document** rendered as one bounded card — an invoice, receipt, quote, statement, delivery note, or any *Beleg* that a user reads, prints, or sends as a self-contained unit. Use this archetype whenever the page's job is to present one finished document with a fixed structure (issuer, recipient, dates, line items, totals) rather than to browse, filter, or edit records. It is the canonical shape for every `/<resource>/<id>/invoice`, `/documents/<id>`, or printable-Beleg view in a business application.

R is **read-first**: the document is the content. Actions (export, send) live in the header bar, never interleaved with the document body. Unlike the detail-overview (C), a report has no rail, no status home, no activity stepper — it is a flat, ordered document column whose figures carry the weight.

## Reference primitives

`<ReportShell>` + `<ReportLineTable>` / `<ReportLineRow>` + `<ReportTotalRow>` in `src/components/archetypes/report/`.

- **`<ReportShell>`** owns the bounded document surface: a `kicker` + `title` header bar (with a right-aligned `actions` slot) over a padded `children` body. `width` bounds the column (`sm` / `md` / `lg`).
- **`<ReportLineTable>` + `<ReportLineRow>`** own the hairline-divided line-item table — the shared 4-column grid (name · qty · unit · sum) and the 9.5px column-header overlines, so the table signature never drifts between documents.
- **`<ReportTotalRow>`** is one row in the right-aligned totals stack; `total` tints and enlarges the grand-total row.

The parties row (issuer / recipient identity blocks + dates) is composed inline in the body — it is document-specific and earns no primitive.

---

## Structure

A report is a single bounded card. It has exactly two zones, in document order:

**1 — Header bar** (`<ReportShell>` header, `border-b`)
- A `kicker` overline (the document class — "Beleg", "Invoice", "Quote") over a `title` (the document's human ID — e.g. "Rechnung RE-2025-0417"; embed the ID figure in `font-mono`).
- A right-aligned `actions` slot: a secondary `<Button variant="outline" size="sm">` (e.g. "PDF") + a primary `<Button size="sm">` (e.g. "Senden"). At most one primary action.
- **Header fill** — the bar renders per the shared `--header-fill` contract
  (`headerFill.ts` / `HeaderFillContext`): `solid` (accent-filled, default) /
  `tint` (`bg-muted`) / `white` (hairline only). Set once per project on
  `<AppShell headerFill>`, overridable per document via `<ReportShell headerFill>`.

**2 — Document body** (`<ReportShell>` children, `p-6`), top-to-bottom:
- **Parties row** — a `from` identity block (overline label + bold name + address lines) | a `to` block | a right-aligned dates block (issue + due dates, dates in `font-mono tabular-nums`).
- **Line-item table** — `<ReportLineTable>` with `<ReportLineRow>`s. Header row = 9.5px overlines; each row = name (sans) + qty / unit / sum (mono, tabular, right-aligned), hairline-divided.
- **Totals stack** — a right-aligned `~w-60` column of `<ReportTotalRow>`s: subtotal, tax (label carries the rate, e.g. "MwSt. 19 %"), and a `total` grand-total row (tinted `bg-muted/50`, larger mono figure).

There is no toolbar, no detail panel, no rail. The document is the only surface.

---

## House style (B — Plex Ledger)

- **Surface** — flat bounded card `overflow-hidden rounded-lg border bg-card`, **no shadow**. Header bar separated by a faint `border-b border-border`; table rows hairline-divided (`divide-border/70`).
- **Overlines** — section/party labels compose the shared `OVERLINE_CLASS` (`@/components/layout/overline`, 10.5px); the tiny table-column headers are `text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground`.
- **Type** — body `text-[13px]`, meta `text-[11px]`, title `text-lg font-semibold`.
- **Figures** — every money / qty / date / ID is `font-mono tabular-nums`. Names, prose, and labels stay sans.
- **Buttons** — `<Button>` from `@/components/ui/button`, `size="sm"`; primary = default variant, secondary = `variant="outline"`.
- **Accent** — stays the donor neutral default. Do **not** bake in a brand color; a consuming app re-skins `--primary` on its own surface.

---

## Forbidden patterns

1. **Full-bleed document.** A report is bounded (`max-w-*`), never edge-to-edge.
2. **Actions in the body.** Export / send live only in the header `actions` slot.
3. **Card shadow.** Flat bounded card only (house style B).
4. **Raw money / date / qty strings.** Figures route through consumer Intl formatters; primitives never format.
5. **Sans figures.** Money, quantities, dates, and IDs are always `font-mono tabular-nums`.
6. **Baked brand accent.** The donor stays neutral; the consumer scopes `--primary`.
7. **A status home / rail / activity stepper.** That is detail-overview (C); a report is a flat document column.

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

- [ ] **One `<ReportShell>`** owns the bounded document surface (flat card, no
      shadow) and the `kicker` + `title` + `actions` header bar — **no**
      hand-rolled document card, no full-bleed surface.
- [ ] **Actions in the header bar** (`actions` slot), never interleaved with the
      document body. *Wrapper tell:* an export/send button dropped between body rows.
- [ ] **Line items via `<ReportLineTable>` / `<ReportLineRow>`** — the shared
      column grid + 9.5px overlines, not a hand-rolled `<table>`.
- [ ] **Totals via `<ReportTotalRow>`** with exactly one `total` (tinted) grand-total row.
- [ ] **[spine] S1–S6** — figures `font-mono tabular-nums` and right-aligned;
      atoms + tokens only (no literal colors); accent left as the neutral default.

**SHOULD** (yellow, not red)

- [ ] Dates rendered through a consumer Intl formatter (no raw ISO strings).
- [ ] `width` matched to the document's column count (`md` default; `lg` for wide statements).
