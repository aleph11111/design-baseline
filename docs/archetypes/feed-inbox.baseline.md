---
slug: feed-inbox
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/feed-inbox.md
---

# Feed / inbox — baseline reference implementation

> The stack-specific binding of the [feed-inbox contract](./feed-inbox.md) to the
> **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell). Each
> role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

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

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each contract role. Only layers with a baseline-specific binding appear.

### Layer 1 — Route config
- Popover / overlay surface → `<Sheet>`.
- Lazy-load boundary → `lazy()` + `<Suspense fallback={null}>`.

### Layer 2 — Page shell
- Top-level app shell → `<AppShell>`.
- Narrow content column → `max-w-2xl`.
- Render-error boundary → `<ErrorBoundary>`.

### Layer 3 — Page header
- Feed shell → `<FeedShell kicker title headerActions>`.
- On-surface header bar → `<SurfaceHeader>`, mounted in the Plex Ledger board form (kicker + title left, `headerActions` right) at the top of the bounded card — not a detached `<PageHeader>` above the surface.

### Layer 4 — Toolbar (filters)
- One-of-N segmented control → `<SegmentedControl>` (All · Unread · by type).
- Toolbar row → the `<FeedShell>` toolbar slot, below the on-surface header, inside the same bounded card.

### Layer 5/6 — The feed
- Card / section-card surface (time groups) → `<SectionCard title="Today" flush>`.
- Feed-item primitive → `<FeedItem icon title meta body media unread actions onClick>`.
- Icon/avatar circle → `<IconAvatar>`.
- Actor emphasis → `font-semibold`.

### Layer 7 — States
- State-view primitive (empty) → `<StateView variant="empty">`, centered, passed into `<FeedShell>`'s `empty` slot.

## Acceptance gate (baseline tells)
- Feed shell → `<FeedShell>`; a parallel hand-built card + list fails "one feed shell owns the bounded surface".
