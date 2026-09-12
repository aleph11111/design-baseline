---
key: Cal
slug: calendar
kind: page
version: 1.2
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

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/calendar`; the prop surface is the API and the sandbox demo (`src/examples/calendar-demo.tsx`) is the gallery reference.

---

## Layer 1 — Route config

**Required:**
- Path: single-segment route (e.g. `/calendar`, `/schedule`, `/timetable`). One
  period view per route.
- Wrap in the project's **route-level auth guard**. No role requirement
  unless RBAC is explicitly in scope.
- Code-split the page behind the framework's **lazy-load boundary**.
- The visible period (e.g. `?week=2026-W26`) is allowed as a query param and is
  the canonical way to make a period bookmarkable; in-memory state alone is not
  sufficient for a navigable calendar.

**Forbidden:**
- Static imports of calendar pages.

---

## Layer 2 — Page shell

**Required:**
- The page renders inside the project's **top-level app shell**. The shell
  mounts providers; consumers do not re-mount them at the page level.
- Outer container uses the **canonical vertical rhythm** for internal section
  spacing only — **no page inset** (the app shell's main region supplies it).
- A **render-error boundary** wrapping page content at the page-component level.

**Forbidden:**
- Outer padding classes that double-inset inside the app layout.
- A second **card surface** wrapping the **calendar shell** — the shell **is**
  the one card boundary (nested chrome).

---

## Layer 3 — Header bar

The calendar's header is **integral to the shell's card**, not a detached
floating page header. It carries both the period identity and the period
controls in one ruled band.

**Required (via the calendar shell):**
- **Title** — always present, in the project's **canonical page-title type
  style**. Names the visible period (e.g. "June 2026 · Week 26"). Any numeric
  run in the title (week number, date span) renders in the **canonical
  monospace identifier style**.
- **Kicker** — the overline above the title, in the **canonical
  overline/kicker style**.
- **Header fill** — the bar renders per the **header-fill contract**: `solid`
  (accent-filled, default) / `tint` (muted tint) / `white` (hairline only).
  Set once per project on the app shell, overridable per page via the
  calendar shell's `headerFill` prop.

**Allowed variation:**
- **Nav / create cluster** (`actions` slot) — right-aligned small **buttons**:
  a `‹` previous, a "Today", a `›` next (icon-only buttons use `aria-label`),
  and a single primary `+ Event` create action (primary/default style). At
  most one primary creation action.

**Forbidden:**
- A separate floating page header above the card — the period title lives in
  the shell's header bar (one home for the period identity).
- More than one primary button in the cluster.
- A baked brand accent on the primary — it stays the donor-neutral default; a
  consuming app re-skins it via its **brand/primary color** token.

---

## Layer 4 — Grid

**Required:**
- The shell renders a seven-column grid from the `days` prop — the consumer
  passes seven `CalendarDay` columns in display order; the shell never
  computes the period.
- **Day header cell** — centred: a dow overline in the **canonical
  overline/kicker style** over a day-number in the **canonical monospace
  identifier style**. The day flagged `today` tints its header cell (a muted
  tint) and brightens its number to the foreground.
- **Hairlines** — grid lines render as a faint hairline; the header bar
  carries a hairline bottom border.
- **Day column** — tall enough to hold a few stacked event chips, stacking
  them top-down with tight gap.

**Allowed variation:**
- **Empty-day label** — `emptyDayLabel` renders faint centred copy (e.g. "—")
  when a day has no events. Omit for a blank column.
- **Horizontal scroll** — the grid keeps a minimum width and scrolls
  horizontally on narrow viewports rather than reflowing. A week stays a
  week.

**Forbidden:**
- Reflowing the seven columns into a stacked/accordion list on mobile (that
  loses the period shape — scroll instead).
- Per-column chrome styled differently from its siblings.

---

## Layer 5 — Event chip

**Required:**
- Each event is a chip: a left accent bar plus a faint tinted background, a
  time in the **canonical monospace identifier style** over a semibold sans
  title.
- **Tone → token classes.** A chip's `tone` selects a token-backed bar+tint
  pair via the **calendar tone tokens, owned by the calendar primitive**.
  `default` = muted / foreground; `success` / `info` / `warning` borrow the
  same semantic tints as the shared **status-badge primitive**. **No literal
  hex** — tones resolve to tokens so a consuming app's palette re-skins them.

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
- `tone` is the `CalendarEventTone` union — derived from the event's own
  domain status, never the page author's taste (ADR-0004: two consumers of the
  same domain derive the same value for the same event). The shell owns the
  tone → token translation; the consumer owns only the status → tone mapping,
  fixed by this exhaustive rule:
  - **`warning`** — the domain marks the event **failed, blocked, or overdue**:
    a state the user must act on (a failed event, a missed deadline, a
    cancelled commitment).
  - **`success`** — the domain marks the event **completed or confirmed**: a
    state the user must do nothing about (a delivered invoice, a closed
    review, a settled payment).
  - **`info`** — the domain marks the event **noteworthy or externally
    driven**: a state that is neither action-required nor outcome-final
    (an external appointment, a shared-team ritual, a system-side task).
  - **`default`** — the event carries **no such status in the domain**: a bare
    scheduled item with no domain-marked state. The shell resolves an omitted
    `tone` to `default`, so a consumer maps nothing to it and simply passes
    no `tone`.

**Forbidden:**
- A tone chosen per page instance instead of per domain status
  (the inherited-default defect — ADR-0004).
- Hand-written event types that duplicate a machine-generated schema.

---

## Forbidden patterns

1. **A detached page header above the card.** The period title lives in the
   shell's header bar.
2. **Nested card chrome.** The calendar shell is the one card boundary.
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

- [ ] **One calendar shell** owns the header bar + the seven-column grid —
      **no** hand-rolled grid, no second card wrapping it. *Wrapper tell:* a
      floating page header bolted above a bare grid.
- [ ] **Period title + nav/create live in the shell header bar**, not a
      detached page header. At most one primary create action.
- [ ] **Tones are token-backed** (the calendar tone tokens) — no literal-hex
      chip colour maps.
- [ ] **Day-numbers + event times render in the canonical monospace
      identifier style**; titles + button labels stay sans.
- [ ] **[spine] S1–S6** (single inset · shell-not-hand-rolled · token tones ·
      aligned mono figures · neutral-default primary).

**SHOULD** (yellow, not red)

- [ ] Today's cell carries a muted tint, with its number brightened to
      foreground.
- [ ] Grid scrolls horizontally on narrow viewports rather than reflowing the
      seven columns.
- [ ] Empty days carry a faint `emptyDayLabel` rather than a bare column.
