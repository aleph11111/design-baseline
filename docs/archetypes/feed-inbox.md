---
key: H
slug: feed-inbox
kind: page
version: 2.1
promoted_from: fleet-audit-2026-06-13 (brickshop-manager, hk-crm)
promoted_at: 2026-06-14
source_spec_version: 1.2
status: locked
---

# Archetype H — feed-inbox

A **chronological stream of events** — notifications, activity, an inbox, a
media/event feed — with optional read state and filter chips, time-grouped
(Today / Yesterday / Earlier). Distinct from list-with-detail (A): A is a
*sortable table of records* you scan to find one; H is a *time-ordered feed* you
skim for what's new. Optimized for recency, not lookup.

Promoted from the 2026-06-13 fleet audit (recurs as a standalone activity feed in
brickshop — its internal "archetype H" — and hk-crm; rule-of-2). Key `H` mirrors
brickshop's existing naming.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/feed-inbox`; the **page feed shell** (frame + page title; the `title`-required page form) and the **frameless feed body** (the content without a page frame; the overlay surface) are the API, and the sandbox demo (`src/examples/feed-inbox-demo.tsx`) is the gallery reference.

### Two sub-shapes — same molecule

H has two recurring sub-shapes. They share the *same* primitives (the feed shell +
the feed-item primitive + time-group sections) and must read as
the same molecule — choose by which slots you fill, not by hand-rolling a second
component:

| Sub-shape | What it is | Read state | Per-item slots |
|-----------|------------|------------|----------------|
| **Inbox** | Notifications / activity you triage | `unread` dot + stronger surface, "Mark all read" | `icon`, `title`, `meta`, ≤1 `actions` |
| **Timeline** | A media/event feed you skim (no triage) | none — purely chronological | `icon`?, `title`, `meta`, `body`, trailing `media` |

The **timeline** sub-shape is what a downstream *chronological media/event `<ul>`
feed* adopts (the `media-feed-adopt-feeditem` candidate): a feed, **not** a record
list — so it's H, not A. Adopt the feed-item primitive with the `media` + `body`
slots rather than minting a new archetype or hand-rolling a `<ul>`.

## Layer 1 — Route config
A top-level route (`/notifications`, `/activity`, `/inbox`) or a popover /
overlay surface (sheet) launched from a header bell. The framework's lazy-load
boundary for a full-page feed.

**Which export by surface** — the two Layer 1 surfaces map to the two shipped
forms (ADR-0008: one page frame, slot-owned):

| Surface | Export | What it owns |
|---------|--------|--------------|
| **Page** (top-level route) | the page feed shell | the page frame: page title, frame `toolbar` (filters), `count`, `actions`, the raised page surface — plus the content |
| **Overlay** (header-bell popover / sheet) | the frameless feed body | the content only: the time-grouped stack or the empty state. No page frame, no title, no raised page surface — the enclosing popover / sheet owns the chrome |

There is no third form. A consumer who wants a feed inside a popover / sheet
reaches for the body export, never a page shell inside a drawer — that would
put a page title and a raised page surface inside the overlay (see Layer 3).

## Layer 2 — Page shell
The project's top-level app shell plus a narrow content column (a feed reads as
one column, not full width). A render-error boundary around content.

## Layer 3 — Page header
`title` is **required** and passed once to the page feed shell — it is the page
title; there is no other title and no untitled form. `subtitle` carries a
one-line description; `badges` carry read-only status. `actions` holds the
page's verbs — "Mark all read" on the inbox sub-shape (the timeline has
none). The read state's summary ("3 unread" / "All caught up") is the `count`.

**Overlay surface:** the frameless feed body — the Layer 1 sheet / popover — has
no `title` and no page header (the page form's required title is page-owned; a
title in a drawer is the conflict this split exists to remove). The overlay's
header belongs to the enclosing sheet, not to the feed.

## Layer 4 — Toolbar (filters)
`toolbar` holds everything that scopes the feed: filter chips / the shared
one-of-N segmented control (All · Unread · by type), tabs. Nothing else goes
there — page verbs are `actions`, never toolbar content. Filter state is
consumer-owned and URL-syncable.

## Layer 5/6 — The feed
Time-grouped sections of the page's one surface (never cards of their own),
made up of instances of the feed-item primitive. Each item: a leading type icon (or actor
avatar) in a circular icon/avatar treatment, the event text (actor rendered with
emphasis), a meta line (actor · relative time), and — depending on sub-shape — an
unread dot + one inline action (inbox) or a `body` excerpt + a trailing `media`
thumbnail (timeline). Group by recency buckets; drop empty groups after filtering.
The trailing `media` slot is a fixed-size rounded holder so an `<img>` fills it
uniformly without per-feed CSS.

**Forbidden:** sortable column headers / a data table (that's A — link out to the
record from an item instead); more than one inline action per row (push extra
actions into the item's detail); infinite walls with no time grouping or filter.

## Layer 7 — States
- **Loading** — a few skeleton rows; never a full-page spinner.
- **Empty** — the shared loading/empty/error state-view primitive, centered
  (`variant="empty"`, "Nothing here"), passed into the feed shell's `empty` slot
  (distinguish "no notifications" from "none match this filter").
- **Read state (inbox only)** — unread items are visually stronger (dot + subtle
  surface); opening an item or "mark all read" clears it. Read state is optimistic.
  The timeline sub-shape has no read state — it's purely chronological, so drop
  the `unread` dot and the "Mark all read" action entirely.

## Layers 8–12
Data: a paginated/cursor feed query, newest-first; unread count is often a
separate lightweight query (header badge). Mutations: mark-read / mark-all-read
(optimistic, idempotent). Realtime: a feed may subscribe (SSE/websocket) to
prepend new items; not required. Mobile: already a single column; the filter chips
scroll horizontally. Permissions: a feed is per-user — scope every query to the
viewer; never leak another user's items.

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

- [ ] **One feed shell** owns the page — title, filter `toolbar` and the
      time-grouped item stack via the shell — not a parallel hand-built card +
      list.
- [ ] **Items are a single row primitive** (avatar/title/preview/meta/unread dot),
      not per-type bespoke markup.
- [ ] **Unread/selected state via tokens** (brand/`muted`), not literal colors or bold-only.
- [ ] **Actions ranked** — primary on the item/reading pane + overflow; no equal-weight button row.
- [ ] **[spine] S1, S2, S3, S4, S5, S6.**

## Version log
- **2.1** — the overlay surface (Layer 1) gets its own frameless form: the
  frameless feed body export carries the time-grouped stack / empty state
  without a page frame, and the page feed shell renders the same body inside
  the page frame (ADR-0008 slot-owned placement; mirrors `list-with-detail`'s
  shell / body split). Additive — the page form is unchanged, and a documented
  surface (the header-bell popover / sheet) now maps to a shipped export
  instead of a page shell smuggled into a drawer.
- **2.0** (ADR-0008) — one page frame: `title` required and rendered once as the
  page title; the untitled/unframed form, `kicker` and `headerActions` removed;
  `filters` renamed `toolbar`; `actions` moved from the toolbar row to the page
  header; `subtitle` / `badges` / `count` added.
