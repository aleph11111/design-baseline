---
key: Td
slug: transaction-document
kind: page
version: 1.0
promoted_from: brickshop-manager
promoted_at: 2026-11-09
source_spec_version: n/a (no source spec — fleet-synthesis promotion from brickshop-manager's /orders/:id page and the transaction-documents mockup; ADR-0014)
status: locked
---

# Archetype Td — Transaction document

## Purpose

A **transaction-document** page shows one business document that moves money
and goods between two parties — a **sales order**, an **offer** (valuation and
offer phases), a **purchase order** — and tells the user the one thing to do
next. Its defining rule: **every fact has exactly one home.** The amount
charged appears in the ledger, not again in a summary card, a rail and a
header badge; the status appears once, beside the title.

Pick it over its neighbours (see `docs/CHOOSING-A-SURFACE.md`):

- **detail-overview (C)** — a record with free sections (a customer, a set, a
  lead). When the page is a document with a money table and a state machine,
  it is Td: C's free main column is exactly the room that lets a money fact
  land three times.
- **report (R)** / **print-statement (Pr)** — a finished document to read or
  print. Td is the live document that still moves through states.
- **form-page (B)** — creating or editing one entity's fields. Td edits only
  in place (a ledger cell, a fact's Change link); a full edit leaves to B.

ADR-0014 records why this is its own page archetype rather than a variant of
detail-overview, and its provenance.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/transaction-document`; the prop surface is the API and the sandbox demo (`src/examples/transaction-document-demo.tsx`) is the gallery reference.

---

## Structure

Five typed slots, each placed by the shell through the one page frame
(ADR-0008). There is **no free content slot**: a fact that fits none of the
five is not on this page.

**1 — Identity (the header).** The title once, never cut (it wraps). Beside
it: the **document number** (never wraps, with a copy action), **one status**
and **at most one attention flag**. Under it: **one sentence** saying what the
document is, and the optional **document chain** — the related documents in
order (Lead › Valuation › Offer › Purchase order): the current document marked
as current, an existing document as a link, a step that doesn't exist yet as
plain text.

**2 — Next step.** A panel keyed to the document's current state: what happens
next, in one heading and an optional line, and the document's **one primary
action**. It is the **only** place a primary action renders. Under it, the
**automatic side effects** of this state ("running alongside"): a declared list
of `{ label, state: done | pending | failed, link? }` — the invoice created on
payment, the marketplace updated on ship. They live here, not in a sixth slot,
because they belong to the current state.

**3 — Ledger.** The one money table. Its **columns are declared per document
type**, each with a **priority**:

| Document | Columns |
|---|---|
| Sales order | Charged · Cost · Profit · Margin |
| Offer | Their ask · Market · Max · Our offer · Profit |
| Purchase order | Cost · Expected market value · Expected margin |

A **read-only** and an **editable** mode: in the editable mode the columns
declared editable are inputs (the offer's *Our offer*), committing on leave or
Enter; an invalid entry stays marked until fixed or abandoned. Totals sit under
the lines.

**4 — Facts.** An auto-fitting grid of typed, locale-formatted values
(customer, dates, payment, address, channel). Each fact may carry its own
**Change** link.

**5 — History.** The document's event log, **collapsed by default**.

**States.** Loading, error and not-found belong to the route: the shell
renders only a resolved document, so a half-loaded document never shows a
next step or a ledger it can't back.

**Header actions.** **Zero** primary and at most **two** secondary actions
inline; everything else goes behind the frame's overflow menu; a destructive
action only ever in that menu. A primary passed to the header anyway is
demoted to a secondary.

---

## Locks

Any slot (next step, ledger, facts) or single field (a fact, a ledger column)
can be **locked**: it can't change on this page, for a stated **reason**, with
a **way out** — the link to where it *can* change ("Lines come from BrickLink —
change them there"; "Address locked — create a replacement label"). The
consumer supplies the locks, because they depend on status and sales channel;
the shell renders every lock the same way. A locked ledger is read-only; a
locked fact shows its lock instead of its Change link; a locked next step
shows its lock instead of the primary action.

---

## Responsive behaviour

- **The ledger never scrolls sideways.** Columns stay inline by priority while
  they fit; a column that doesn't fit moves into a **second line inside each
  row**, labelled. On a phone a line reads as its label and first-priority
  amount, then the remaining columns underneath.
- **The phone pins the primary action** to the bottom of the screen while the
  page scrolls; on wider screens it sits in the next-step panel.
- The long title wraps in full at every width.

---

## House style

- **Figures** — every amount renders in the canonical tabular figure style,
  right-aligned, formatted for the page's locale.
- **Status tones** — the status uses the neutral status role, the attention
  flag the warning role; side effects use success (done), muted (pending) and
  destructive (failed), each with its state spelled out for screen readers.
- **Tokens only** — no literal colours.

---

## Forbidden patterns

1. **A fact in two homes.** A total repeated in a summary card, a rail or a
   badge; a status repeated in the next-step panel; a date, payment or status
   restated in the summary sentence, which says only what the document is. The ledger owns money, the
   header owns status.
2. **A primary action outside the next-step panel** — in the header, in a
   ledger row, in a fact.
3. **A wall of header buttons.** More than two secondaries inline.
4. **A ledger that scrolls sideways** or hides a column without showing its
   value in the row's second line.
5. **A disabled control without a reason.** A field that can't change is a
   lock with a reason and a way out, never a silently greyed input.
6. **A free content section** appended to the shell.

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

- [ ] **One transaction-document shell** owns the page: identity, next step,
      ledger, facts, history — no extra section.
- [ ] **One home per fact** — no amount or status rendered twice.
- [ ] **The primary action only in the next step**; header ≤ 2 secondaries
      inline.
- [ ] **Ledger columns declared for the document type**, with priorities.
- [ ] **Every non-editable field that a user would expect to edit is a lock**
      with a reason and a way out.
- [ ] **[spine] S1–S6**.

**SHOULD** (yellow, not red)

- [ ] The document chain links every related document that exists.
- [ ] Automatic side effects are declared, not narrated in the description.

---

## Version log

- **1.0** (2026-11-09) — initial contract: five slots, one home per fact, side
  effects in the next step, locks, per-type ledger columns with an editable
  mode; fleet-synthesis promotion from brickshop-manager; ADR-0014.
