---
key: R
slug: report
kind: page
version: 1.2
---

# Archetype R — Report

## Purpose

A **report** page is a single **formal document** rendered as one bounded card — an invoice, receipt, quote, statement, delivery note, or any *Beleg* that a user reads, prints, or sends as a self-contained unit. Use this archetype whenever the page's job is to present one finished document with a fixed structure (issuer, recipient, dates, line items, totals) rather than to browse, filter, or edit records. It is the canonical shape for every `/<resource>/<id>/invoice`, `/documents/<id>`, or printable-Beleg view in a business application.

R is **read-first**: the document is the content. Actions (export, send) live in the header bar, never interleaved with the document body. Unlike the detail-overview (C), a report has no rail, no status home, no activity stepper — it is a flat, ordered document column whose figures carry the weight.

> **Reference implementation.** This file is the **stack-agnostic contract** — every
> rule names a *role*, not a primitive. The baseline-stack binding (concrete
> primitives + Tailwind-4 class strings) lives in
> [`report.baseline.md`](./report.baseline.md). A project on a different stack
> adopts this contract without needing that file.

---

## Structure

A report is a single bounded card. It has exactly two zones, in document order.

**Width keying rule.** The document column is bounded, and the bound is selected
from the document's shape by this exhaustive rule (derived, not inherited —
ADR-0004): the step follows from what the document is, never from the call
site's taste.

- **`sm`** — a **compact receipt / short Beleg**: a one- or few-line document
  with a minimal or absent totals stack that reads as a short bounded
  column.
- **`md`** — a **standard document**: the reading-column width for the
  canonical line-item table (the fixed name · qty · unit · sum rows). This is
  the shell's own default; a document whose shape falls here passes no width
  at all.
- **`lg`** — a **wide statement**: a document whose body needs more than the
  canonical column — a statement detail grid or a line-item row extended with
  per-row fields beyond name · qty · unit · sum — and no longer reads at the
  standard column width.

**1 — Header bar** (the report shell's header region, with a hairline bottom border)
- A `kicker` overline (the document class — "Beleg", "Invoice", "Quote") over a `title` (the document's human ID — e.g. "Rechnung RE-2025-0417"; embed the ID figure using the **canonical monospace identifier style**).
- A right-aligned `actions` slot: a secondary-style button, small (e.g. "PDF") + the default/primary-style button, small (e.g. "Senden"). At most one primary action.
- **Header fill** — the bar follows the **header-fill contract** — three modes:
  brand-filled (default, fills the bar with the brand accent), a muted-tint
  step, and a hairline-border-only mode. Set once per project on the
  project's **top-level app shell**, overridable per document via the report
  shell's header-fill override.

**2 — Document body** (the report shell's body region, padded), top-to-bottom:
- **Parties row** — a `from` identity block (overline label + bold name + address lines) | a `to` block | a right-aligned dates block (issue + due dates, dates in the **canonical monospace figure style**).
- **Line-item table** — the shared **line-item table primitive**, composed of individual line-item rows. Header row = the **canonical table-column-header overline style**; each row = name (sans) + qty / unit / sum (in the canonical monospace figure style, right-aligned), hairline-divided.
- **Totals stack** — a right-aligned, fixed-width column of the shared **total-row primitive**: subtotal, tax (label carries the rate, e.g. "MwSt. 19 %"), and a `total` grand-total row (muted-tint background, larger figure in the canonical monospace figure style).

There is no toolbar, no detail panel, no rail. The document is the only surface.

---

## House style

- **Surface** — a flat bounded-card surface (hairline border, rounded corners, clipped overflow), **no shadow**. Header bar separated by a faint hairline border; table rows hairline-divided.
- **Overlines** — section/party labels use the **canonical overline/kicker style**; the tiny table-column headers use the **canonical table-column-header overline style**.
- **Type** — a body-copy scale, a smaller meta-text scale, and the **canonical page-title type style** for the title.
- **Figures** — every money / qty / date / ID renders in the **canonical monospace figure style**. Names, prose, and labels stay in the default sans style.
- **Buttons** — rendered as **buttons**, small; the primary action uses the default/primary style, secondary actions use the secondary style.
- **Accent** — stays the donor neutral default. Do **not** bake in a brand color; a consuming app re-skins the **brand/primary color token** on its own surface.

---

## Forbidden patterns

1. **Full-bleed document.** A report is bounded — a constrained-width surface — never edge-to-edge.
2. **Actions in the body.** Export / send live only in the header `actions` slot.
3. **Card shadow.** Flat bounded card only (see House style).
4. **Raw money / date / qty strings.** Figures route through consumer-provided formatters; primitives never format.
5. **Sans figures.** Money, quantities, dates, and IDs always render in the canonical monospace figure style.
6. **Baked brand accent.** The donor stays neutral; the consumer scopes the brand/primary color token.
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

- [ ] **One report shell** owns the bounded document surface (flat card, no
      shadow) and the `kicker` + `title` + `actions` header bar — **no**
      hand-rolled document card, no full-bleed surface.
- [ ] **Actions in the header bar** (`actions` slot), never interleaved with the
      document body. *Wrapper tell:* an export/send button dropped between body rows.
- [ ] **Line items via the shared line-item table primitive** — the shared
      column grid + the canonical table-column-header overline style, not a hand-rolled `<table>`.
- [ ] **Totals via the shared total-row primitive** with exactly one `total` (tinted) grand-total row.
- [ ] **[spine] S1–S6** — figures in the canonical monospace figure style and right-aligned;
      atoms + tokens only (no literal colors); accent left as the neutral default.

**SHOULD** (yellow, not red)

- [ ] Dates rendered through a consumer-provided formatter (no raw ISO strings).
- [ ] `width` follows the Structure section's width keying rule
      (`sm` compact receipt · `md` standard document column · `lg` wide
      statement) — not a free choice.
