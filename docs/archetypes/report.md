---
key: R
slug: report
kind: page
version: 3.1
---

# Archetype R — Report

## Purpose

A **report** page is a single **formal document** rendered as one bounded document — an invoice, receipt, quote, statement, delivery note, or any *Beleg* that a user reads, prints, or sends as a self-contained unit. Use this archetype whenever the page's job is to present one finished document with a fixed structure (issuer, recipient, dates, line items, totals) rather than to browse, filter, or edit records. It is the canonical shape for every `/<resource>/<id>/invoice`, `/documents/<id>`, or printable-Beleg view in a business application.

R is **read-first**: the document is the content. Document verbs (export, send) are the page `actions`, never interleaved with the document body. Unlike the detail-overview (C), a report has no rail, no status home, no activity stepper — it is a flat, ordered document column whose figures carry the weight.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/report`; the prop surface is the API and the sandbox demo (`src/examples/report-demo.tsx`) is the gallery reference.

---

## Structure

A report is one page with one title and one bounded document. The page supplies two things, in document order.

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

**1 — Page header**
- `title` — the document's human ID, passed once (e.g. "Rechnung RE-2025-0417"; embed the ID figure using the **canonical identifier style**). The document class ("Beleg", "Invoice") is part of the title or `subtitle`, not a second heading.
- `actions` — the document verbs: a secondary action (e.g. "PDF") + at most one primary action (e.g. "Senden").

**2 — Document body**, top-to-bottom:
- **Parties row** — a `from` identity block (overline label + bold name + address lines) | a `to` block | a right-aligned dates block (issue + due dates, dates in the **canonical tabular figure style**).
- **Line-item table** — the shared **line-item table primitive**, composed of individual line-item rows. Header row = the **canonical table-column-header overline style**; each row = name (sans) + qty / unit / sum (in the canonical tabular figure style, right-aligned), hairline-divided.
- **Totals stack** — a right-aligned, fixed-width column of the shared **total-row primitive**: subtotal, tax (label carries the rate, e.g. "MwSt. 19 %"), and a `total` grand-total row (muted-tint background, larger figure in the canonical tabular figure style).

There is no `toolbar`, `count` or `viewOptions` (nothing re-scopes a finished document), no detail panel, no rail. The document is the only surface.

---

## House style

- **Rows** — table rows hairline-divided.
- **Overlines** — section/party labels use the **canonical overline style**; the tiny table-column headers use the **canonical table-column-header overline style**.
- **Type** — a body-copy scale and a smaller meta-text scale.
- **Figures** — every money / qty / date / ID renders in the **canonical tabular figure style**. Names, prose, and labels stay in the default sans style.
- **Buttons** — rendered as **buttons**, small; the primary action uses the default/primary style, secondary actions use the secondary style.
- **Accent** — stays the donor neutral default. Do **not** bake in a brand color; a consuming app re-skins the **brand/primary color token** on its own surface.

---

## Forbidden patterns

1. **Full-bleed document.** A report is bounded — a constrained-width surface — never edge-to-edge.
2. **Actions in the body.** Export / send live only in `actions`.
3. **A second title.** The document ID is the page `title`, once; no heading repeats it on the document surface.
4. **Raw money / date / qty strings.** Figures route through consumer-provided formatters; primitives never format.
5. **Untabular figures.** Money, quantities, dates, and IDs always render in the canonical tabular figure style (ADR-0009: the house sans, never a mono face).
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

- [ ] **One report shell** owns the page: one `title`, the `actions`, and the
      bounded document — **no** hand-rolled document card, no second title,
      no full-bleed surface.
- [ ] **Document verbs in `actions`**, never interleaved with the
      document body. *Wrapper tell:* an export/send button dropped between body rows.
- [ ] **Line items via the shared line-item table primitive** — the shared
      column grid + the canonical table-column-header overline style, not a hand-rolled `<table>`.
- [ ] **Totals via the shared total-row primitive** with exactly one `total` (tinted) grand-total row.
- [ ] **[spine] S1–S6** — figures in the canonical tabular figure style and right-aligned;
      atoms + tokens only (no literal colors); accent left as the neutral default.

**SHOULD** (yellow, not red)

- [ ] Dates rendered through a consumer-provided formatter (no raw ISO strings).
- [ ] `width` follows the Structure section's width keying rule
      (`sm` compact receipt · `md` standard document column · `lg` wide
      statement) — not a free choice.

---

## Version log

- **3.0** (ADR-0008) — one page frame. The document ID is the page `title`
  (once); verbs are the page `actions`. Removed: `kicker`, `headerActions`
  (→ `actions`), the on-surface header bar and its header-fill modes.
