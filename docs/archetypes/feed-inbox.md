# Archetype H — feed-inbox

A **chronological stream of events** — notifications, activity, an inbox, a
media/event feed — with optional read state and filter chips, time-grouped
(Today / Yesterday / Earlier). Distinct from list-with-detail (A): A is a
*sortable table of records* you scan to find one; H is a *time-ordered feed* you
skim for what's new. Optimized for recency, not lookup.

Promoted from the 2026-06-13 fleet audit (recurs as a standalone activity feed in
brickshop — its internal "archetype H" — and hk-crm; rule-of-2). Key `H` mirrors
brickshop's existing naming.

> **Reference implementation.** This file is the **stack-agnostic contract** — every
> rule names a *role*, not a primitive. The baseline-stack binding (concrete
> primitives + Tailwind-4 class strings) lives in
> [`feed-inbox.baseline.md`](./feed-inbox.baseline.md). A project on a different
> stack adopts this contract without needing that file.

### Two sub-shapes — same molecule

H has two recurring sub-shapes. They share the *same* primitives (the feed shell +
the feed-item primitive + time-group card/section-card surfaces) and must read as
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

## Layer 2 — Page shell
The project's top-level app shell plus a narrow content column (a feed reads as
one column, not full width). A render-error boundary around content.

## Layer 3 — Page header
The feed shell (`kicker`, `title`, `headerActions`) renders the on-surface header
bar at the top of the bounded card — kicker + title left, actions right — not a
detached floating page header above the surface. The on-surface header bar has no
subtitle slot; fold an unread count ("3 unread" / "You're all caught up") into the
kicker, or surface it as a `headerActions` badge.

## Layer 4 — Toolbar (filters)
Filter chips / the shared one-of-N segmented control (a pill row; All · Unread ·
by type) at the start of the feed shell's toolbar row — rendered below the
on-surface header, inside the same bounded card; a "Mark all read" action at the
end. Filter state is consumer-owned and URL-syncable.

## Layer 5/6 — The feed
Time-grouped instances of the project's card / section-card surface, made up of
instances of the feed-item primitive. Each item: a leading type icon (or actor
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

- [ ] **One feed shell** owns the bounded surface — on-surface header + filter
      row + time-grouped item stack via the shell — not a parallel hand-built
      card + list.
- [ ] **Items are a single row primitive** (avatar/title/preview/meta/unread dot),
      not per-type bespoke markup.
- [ ] **Unread/selected state via tokens** (brand/`muted`), not literal colors or bold-only.
- [ ] **Actions ranked** — primary on the item/reading pane + overflow; no equal-weight button row.
- [ ] **[spine] S1, S2, S3, S4, S5, S6.**
