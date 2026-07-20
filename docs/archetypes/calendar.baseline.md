---
slug: calendar
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/calendar.md
---

# Calendar — baseline reference implementation

> The stack-specific binding of the [calendar contract](./calendar.md) to the
> **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell). Each
> role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<CalendarShell>` in `src/components/archetypes/calendar/`. A single structural
shell: a ruled header bar (`kicker` + `title` left, a nav/create `actions`
cluster right) over a 7-column grid it renders internally from a `days` prop.
Row 1 is the day headers (dow overline + mono day-number, today's cell tinted);
row 2 is the day columns, each stacking tone-coded `CalendarEvent` chips. Event
interaction (open / create) is **consumer-owned** — the shell renders chips and
the header actions; the consumer wires their click handlers.

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each
contract role. Only layers with a baseline-specific binding appear.

### Layer 1 — Route config
- Route-level auth guard → `<ProtectedRoute>`.
- Lazy-load boundary → lazy-import the page component.

### Layer 2 — Page shell
- Top-level app shell → `<AppShell>` (baseline). The shell mounts providers;
  consumers do not re-mount them at the page level.
- Canonical vertical rhythm / no page inset → outer container
  `<div className="space-y-5">`; `AppShell`'s `<main>` supplies the inset.
- Render-error boundary → `<ErrorBoundary>`.
- Card surface (forbidden second wrapper) → `<Card>`; `<CalendarShell>` is the
  one card boundary.

### Layer 3 — Header bar
- Canonical page-title type style → `text-lg font-semibold tracking-tight`.
- Canonical monospace identifier style (title's numeric run) → `font-mono
  tabular-nums`.
- Canonical overline/kicker style → `OVERLINE_CLASS` (`text-[10.5px]`).
- Header-fill contract → `--header-fill` / `headerFill.ts` /
  `HeaderFillContext`: `solid` (accent-filled, default) / `tint` (`bg-muted`)
  / `white` (hairline only). Set once per project on `<AppShell headerFill>`,
  overridable per page via `<CalendarShell headerFill>`.
- Nav/create buttons → `<Button size="sm">`; primary create action
  `variant="default"`.

### Layer 4 — Grid
- Seven-column grid → `grid grid-cols-7`.
- Day header cell → dow overline `text-[9.5px] … uppercase tracking-[0.09em]`
  over day-number `font-mono text-base tabular-nums`; today's header cell
  tint `bg-muted`.
- Hairlines → grid lines `border-border/60`; header bar `border-b
  border-border`.
- Day column height → `min-h-[170px]`.
- Horizontal scroll → grid keeps a `min-w` and scrolls-x.

### Layer 5 — Event chip
- Left accent bar → `border-l-[3px]` plus a faint tinted background.
- Canonical monospace identifier style (event time) → `font-mono text-[10px]
  tabular-nums`.
- Sans title → `text-[11.5px] font-semibold`.
- Calendar tone tokens → the shell's `TONE_CLASS` map: `default` = muted /
  foreground; `success` / `info` / `warning` resolve to the semantic CSS tokens
  (`--success` / `--primary` / `--warning`) as a `/10` chip tint, a solid
  `border-l-*` accent, and a `text-*` time label. No literal palette classes and
  no `dark:` overrides — the tokens flip with the theme themselves.
- Status-badge primitive → `<Badge>`.

## Acceptance gate (baseline tells)
- Shell → `<CalendarShell>`; a `<PageHeader>` bolted above a bare grid fails
  "one shell owns the header bar + grid".
- Token-backed tones → the shell's `TONE_CLASS` map.
- Day-numbers + event times → `font-mono tabular-nums`.
