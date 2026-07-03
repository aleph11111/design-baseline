# Archetype H — feed-inbox

A **chronological stream of events** — notifications, activity, an inbox, a
media/event feed — with optional read state and filter chips, time-grouped
(Today / Yesterday / Earlier). Distinct from list-with-detail (A): A is a
*sortable table of records* you scan to find one; H is a *time-ordered feed* you
skim for what's new. Optimized for recency, not lookup.

Promoted from the 2026-06-13 fleet audit (recurs as a standalone activity feed in
brickshop — its internal "archetype H" — and hk-crm; rule-of-2). Key `H` mirrors
brickshop's existing naming.

### Two sub-shapes — same molecule

H has two recurring sub-shapes. They share the *same* primitives (`FeedShell` +
`FeedItem` + time-group `SectionCard`s) and must read as the same molecule —
choose by which slots you fill, not by hand-rolling a second component:

| Sub-shape | What it is | Read state | Per-item slots |
|-----------|------------|------------|----------------|
| **Inbox** | Notifications / activity you triage | `unread` dot + stronger surface, "Mark all read" | `icon`, `title`, `meta`, ≤1 `actions` |
| **Timeline** | A media/event feed you skim (no triage) | none — purely chronological | `icon`?, `title`, `meta`, `body`, trailing `media` |

The **timeline** sub-shape is what a downstream *chronological media/event `<ul>`
feed* adopts (the `media-feed-adopt-feeditem` candidate): a feed, **not** a record
list — so it's H, not A. Adopt `FeedItem` with the `media` + `body` slots rather
than minting a new archetype or hand-rolling a `<ul>`.

## Primitives

- `<FeedShell filters actions empty kicker title headerActions headerFill>` — the
  container: when `title` is set, the shell adopts the Plex Ledger board form —
  an on-surface `<SurfaceHeader>` (kicker + title left, `headerActions` right) at
  the top of one bounded card, with a toolbar (filter chips + trailing actions
  like "Mark all read") above the time-grouped stack below it. Filter and read
  state are consumer-owned.
- `<FeedItem icon title meta body media unread actions onClick>` — one event row
  (leading icon/avatar in an `<IconAvatar>` circle, title + meta, optional
  multi-line `body`, optional trailing `media` thumbnail, unread dot, optional
  trailing action). NOT a table cell row. Inbox rows fill
  `icon`/`title`/`meta`/`unread`; timeline rows add `body` and a trailing `media`
  thumbnail and skip `unread`.
- **Reused:** `<SectionCard title="Today" flush>` for each time group (rows inside
  use `divide-y`); `<StateView>` for the loading/empty planes.

## Layer 1 — Route config
A top-level route (`/notifications`, `/activity`, `/inbox`) or a popover/sheet
launched from a header bell. Lazy + suspense for a full-page feed.

## Layer 2 — Page shell
`<AppShell>` + a narrow content column (`max-w-2xl` is typical — a feed reads as
one column, not full width). `<ErrorBoundary>` around content.

## Layer 3 — Page header
`<FeedShell kicker title headerActions>` renders the on-surface `<SurfaceHeader>`
(Plex Ledger board form) at the top of the bounded card — kicker + title left,
actions right — not a detached `<PageHeader>` above the surface.
`<SurfaceHeader>` has no subtitle slot; fold an unread count ("3 unread" /
"You're all caught up") into the kicker, or surface it as a `headerActions` badge.

## Layer 4 — Toolbar (filters)
Filter chips / a segmented control (via `<SegmentedControl>`; All · Unread · by
type) at the start of the `<FeedShell>` toolbar row — rendered below the
on-surface header, inside the same bounded card; a "Mark all read" action at the
end. Filter state is consumer-owned and URL-syncable.

## Layer 5/6 — The feed
Time-grouped `<SectionCard>`s of `<FeedItem>`s. Each item: a leading type icon (or
actor avatar) in an `<IconAvatar>` circle, the event text (actor in `font-semibold`), a meta line (actor ·
relative time), and — depending on sub-shape — an unread dot + one inline action
(inbox) or a `body` excerpt + a trailing `media` thumbnail (timeline). Group by
recency buckets; drop empty groups after filtering. The trailing `media` slot is
a fixed-size rounded holder so an `<img>` fills it uniformly without per-feed CSS.

**Forbidden:** sortable column headers / a data table (that's A — link out to the
record from an item instead); more than one inline action per row (push extra
actions into the item's detail); infinite walls with no time grouping or filter.

## Layer 7 — States
- **Loading** — a few skeleton rows; never a full-page spinner.
- **Empty** — a centered `<StateView variant="empty">` ("Nothing here") passed
  into `FeedShell`'s `empty` slot (distinguish "no notifications" from "none
  match this filter").
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
      row + time-grouped item stack via `<FeedShell>` — not a parallel
      hand-built card + list.
- [ ] **Items are a single row primitive** (avatar/title/preview/meta/unread dot),
      not per-type bespoke markup.
- [ ] **Unread/selected state via tokens** (brand/`muted`), not literal colors or bold-only.
- [ ] **Actions ranked** — primary on the item/reading pane + overflow; no equal-weight button row.
- [ ] **[spine] S1, S2, S3, S4, S5, S6.**
