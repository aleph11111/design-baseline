---
key: Cal
slug: calendar
kind: page
version: 1.1
status: locked
---

# Archetype Cal — Calendar

## Purpose

A **calendar** page renders a bounded period (a week, or a month) as a fixed
column grid of day cells, each holding the events scheduled on that day. Use
this archetype whenever the user's primary job is to **read a timetable at a
glance** — to see what falls where across a span of days — rather than to browse
a list of records. The unit on screen is the *day column*; the atom inside it is
the *event chip* (a time + a title with a tone-coded accent).

Use this archetype when:

- The page's job is to lay out events against a **calendar period**, not to list
  rows in a table.
- Days are the fixed primary axis (always seven across for a week; the consumer
  supplies the columns), and events stack inside each day.
- The user navigates the period (previous / next / today) and creates events
  from a single primary action in the header.

If the page is a single-axis list of records, use archetype A
(list-with-detail). If it is a fixed rows × columns intersection grid with
per-cell editing, use archetype M (matrix-grid) — a calendar is *not* a matrix:
its columns are time, its cells stack multiple chips, and it scrolls rather than
densifies.

## Reference primitive

`<CalendarShell>` in `src/components/archetypes/calendar/`. A single structural
shell: a ruled header bar (`kicker` + `title` left, a nav/create `actions`
cluster right) over a 7-column grid it renders internally from a `days` prop.
Row 1 is the day headers (dow overline + mono day-number, today's cell tinted);
row 2 is the day columns, each stacking tone-coded `CalendarEvent` chips. Event
interaction (open / create) is **consumer-owned** — the shell renders chips and
the header actions; the consumer wires their click handlers.

---

## Layer 1 — Route config

**Required:**
- Path: single-segment route (e.g. `/calendar`, `/schedule`, `/timetable`). One
  period view per route.
- Wrap in the project's auth guard (e.g. `<ProtectedRoute>`). No role requirement
  unless RBAC is explicitly in scope.
- Lazy-import the page component.
- The visible period (e.g. `?week=2026-W26`) is allowed as a query param and is
  the canonical way to make a period bookmarkable; in-memory state alone is not
  sufficient for a navigable calendar.

**Forbidden:**
- Static imports of calendar pages.

---

## Layer 2 — Page shell

**Required:**
- The page renders inside `<AppShell>` (baseline). The shell mounts providers;
  consumers do not re-mount them at the page level.
- Outer container: `<div className="space-y-5">` — **no page inset** (`AppShell`'s
  `<main>` supplies it).
- `<ErrorBoundary>` wrapping page content at the page-component level.

**Forbidden:**
- Outer padding classes that double-inset inside the app layout.
- A second `<Card>` wrapping `<CalendarShell>` — the shell **is** the one card
  boundary (nested chrome).

---

## Layer 3 — Header bar

The calendar's header is **integral to the shell's card**, not a detached page
`<PageHeader>`. It carries both the period identity and the period controls in
one ruled band.

**Required (via `<CalendarShell>`):**
- **Title** — always present (`text-lg font-semibold tracking-tight`). Names the
  visible period (e.g. "June 2026 · Week 26"). Any numeric run in the title
  (week number, date span) renders `font-mono tabular-nums`.
- **Kicker** — the overline above the title, composed from `OVERLINE_CLASS`
  (`text-[10.5px]`).
- **Header fill** — the bar renders per the shared `--header-fill` contract
  (`headerFill.ts` / `HeaderFillContext`): `solid` (accent-filled, default) /
  `tint` (`bg-muted`) / `white` (hairline only). Set once per project on
  `<AppShell headerFill>`, overridable per page via `<CalendarShell headerFill>`.

**Allowed variation:**
- **Nav / create cluster** (`actions` slot) — right-aligned `<Button size="sm">`
  controls: a `‹` previous, a "Today", a `›` next (icon-only buttons use
  `aria-label`), and a single primary `+ Event` create action (`variant="default"`).
  At most one primary creation action.

**Forbidden:**
- A separate `<PageHeader>` above the card — the period title lives in the shell's
  header bar (one home for the period identity).
- More than one primary (`default`) button in the cluster.
- A baked brand accent on the primary — it stays the donor-neutral default; a
  consuming app re-skins it via its `--primary` token.

---

## Layer 4 — Grid

**Required:**
- The shell renders a `grid grid-cols-7` from the `days` prop — the consumer
  passes seven `CalendarDay` columns in display order; the shell never computes
  the period.
- **Day header cell** — centred: a `text-[9.5px] … uppercase tracking-[0.09em]`
  dow overline over a `font-mono text-base tabular-nums` day-number. The day
  flagged `today` tints its header cell (`bg-muted`) and brightens its number to
  the foreground.
- **Hairlines** — grid lines are faint (`border-border/60`); the header bar is
  `border-b border-border`.
- **Day column** — `min-h-[170px]`, stacking event chips top-down with tight gap.

**Allowed variation:**
- **Empty-day label** — `emptyDayLabel` renders faint centred copy (e.g. "—")
  when a day has no events. Omit for a blank column.
- **Horizontal scroll** — the grid keeps a `min-w` and scrolls-x on narrow
  viewports rather than reflowing. A week stays a week.

**Forbidden:**
- Reflowing the seven columns into a stacked/accordion list on mobile (that
  loses the period shape — scroll instead).
- Per-column chrome styled differently from its siblings.

---

## Layer 5 — Event chip

**Required:**
- Each event is a chip: a left accent bar (`border-l-[3px]`) + a faint tinted
  background, a `font-mono text-[10px] tabular-nums` time over a
  `text-[11.5px] font-semibold` sans title.
- **Tone → token classes.** A chip's `tone` selects a token-backed bar+tint pair
  via the shell's `TONE_CLASS` map. `default` = muted / foreground; `success` /
  `info` / `warning` borrow the Badge-family semantic tints (`green` / `primary`
  / `yellow`). **No literal hex** — tones resolve to tokens so a consuming app's
  palette re-skins them.

**Forbidden:**
- Inline per-chip colour maps with literal hex.
- Raw time/date strings formatted inside the primitive — the consumer
  pre-formats every `time` and `date` (the primitive never formats).

---

## Layer 6 — Data fetching (contract)

The primitive does not wire data. It expects an already-shaped `days` array:

```ts
type CalendarDay = {
  id: string;                 // stable key (e.g. ISO date)
  dow: React.ReactNode;       // pre-formatted day-of-week label
  date: React.ReactNode;      // pre-formatted day number
  today?: boolean;
  events: CalendarEvent[];    // pre-sorted, pre-formatted
};
```

**Contract for the consumer's query hook:**
- Compute the period (which seven days) and partition events into day buckets
  **upstream** of the shell. The shell only renders.
- Pre-format every `time` and `date`; pre-sort each day's events by start time.
- After any mutation affecting an event, re-fetch the period query (one fetch
  hydrates all seven columns; do not re-fetch per day).

---

## Layer 7 — Type shapes (contract)

**Required:**
- Consumers map their domain event type onto `CalendarEvent`
  (`{ id, time, title, tone? }`) and their day type onto `CalendarDay`. Event
  types should derive from the project's authoritative source.
- `tone` is the `CalendarEventTone` union — the consumer maps its domain status
  onto a tone; the shell owns the tone → token translation.

**Forbidden:**
- Hand-written event types that duplicate a machine-generated schema.

---

## Forbidden patterns

1. **A detached `<PageHeader>` above the card.** The period title lives in the
   shell's header bar.
2. **Nested card chrome.** `<CalendarShell>` is the one card boundary.
3. **Literal-hex tone maps.** Tones resolve to tokens.
4. **Reflowing the 7 columns on mobile.** Scroll-x; keep the period shape.
5. **Formatting inside the primitive.** Consumers pre-format times and dates.
6. **More than one primary create action** in the header cluster.

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

- [ ] **One `<CalendarShell>`** owns the header bar + the 7-column grid — **no**
      hand-rolled grid, no second card wrapping it. *Wrapper tell:* a `<PageHeader>`
      bolted above a bare grid.
- [ ] **Period title + nav/create live in the shell header bar**, not a detached
      page header. At most one primary (`default`) create action.
- [ ] **Tones are token-backed** (`TONE_CLASS`) — no literal-hex chip colour maps.
- [ ] **Day-numbers + event times are `font-mono tabular-nums`**; titles + button
      labels stay sans.
- [ ] **[spine] S1–S6** (single inset · shell-not-hand-rolled · token tones ·
      aligned mono figures · neutral-default primary).

**SHOULD** (yellow, not red)

- [ ] Today's cell tinted (`bg-muted`) with its number brightened to foreground.
- [ ] Grid scrolls-x on narrow viewports rather than reflowing the seven columns.
- [ ] Empty days carry a faint `emptyDayLabel` rather than a bare column.
