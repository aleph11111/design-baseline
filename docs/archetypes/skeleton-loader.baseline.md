---
slug: skeleton-loader
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/skeleton-loader.md
---

# Skeleton loader — baseline reference implementation

> The stack-specific binding of the [skeleton-loader contract](./skeleton-loader.md)
> to the **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell).
> Each role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<ListSkeleton>` in `src/components/archetypes/skeleton-loader/`. It composes the
shadcn `Skeleton` atom (`src/components/ui/skeleton.tsx` — `animate-pulse
rounded-md bg-muted`) into the list/table/avatar shapes the contract describes,
and carries the required status semantics itself. It adds no new pulse mechanic —
the atom is the single source of the tone + animation.

```tsx
import { ListSkeleton } from "@/components/archetypes/skeleton-loader";

<ListSkeleton rows={6} />                          // stacked bars
<ListSkeleton rows={4} avatar />                   // leading avatar rows
<ListSkeleton rows={5} columns={4} showHeader />   // table-shaped grid + header
```

## Role → primitive map

Only layers with a baseline-specific binding appear.

### L1 — Invocation contract
- Direct → the owning surface renders `<ListSkeleton …/>` in its `isLoading` branch.
- Via the loading-plane role → `<StateView variant="loading" loadingSkeleton={<ListSkeleton …/>} />`
  (`ui/state-view`). When `loadingSkeleton` is set, `StateView` renders the node
  verbatim (no extra wrapper), so the skeleton's own `role="status"` stays the sole
  status region. Omitting `loadingSkeleton` keeps the default centered "Loading…" text.

### L5 — Empty / loading states (the knobs)
- row count → `rows?: number` (default `5`).
- columns → `columns?: number` (default `1`). `1` renders stacked `<Skeleton className="h-4 w-full" />`
  bars; `> 1` renders a CSS grid `gridTemplateColumns: "1.6fr repeat(columns-1, minmax(0,1fr))"`,
  `gap-3`, cells `h-4` — the `1.6fr` first cell is the wider identifier column.
- header → `showHeader?: boolean`. Stacked shape: one `<Skeleton className="h-5 w-40" />`.
  Grid shape: a row of `h-3` cells on the same grid template.
- leading media → `avatar?: boolean` (stacked shape only): `<Skeleton className="h-9 w-9 shrink-0 rounded-full" />`
  + a two-line stack (`h-4 w-1/2`, `h-3 w-1/3`).
- vertical rhythm → wrapper `space-y-2`; rows `py-1.5`.

### L7 — Theming
- Tone + pulse → inherited from the `Skeleton` atom (`bg-muted`, `animate-pulse`).
  No color literals at this primitive; reduced-motion is honored wherever the
  baseline disables `animate-pulse`.

### L11 — Accessibility contract
- Wrapper carries `role="status"`, `aria-busy="true"`, `aria-live="polite"`.
- `label?: string` (default `"Loading…"`) renders as a `<span className="sr-only">`
  inside the status region; the pulsing blocks themselves are not separately labeled.

## Consuming from the list page archetypes

`list-with-detail` (A), `settings-table` (D2), and `grouped-list` (K) keep the
text loader as their default. Where a page knows its row shape, it may pass a
`<ListSkeleton>` through the shell's loading slot via `StateView`'s
`loadingSkeleton` prop — no shell API change is required. `feed-inbox` (H) and
other skeleton-permitting archetypes can adopt `<ListSkeleton>` in place of a
hand-rolled row skeleton.

## Acceptance gate (baseline tells)
- Skeleton rows → `<ListSkeleton>`; a hand-rolled `Array.from(...).map` of raw
  `bg-muted animate-pulse` divs fails "one primitive owns the list-skeleton shape".
- A11y → the loading region announces (`role="status"` + sr-only label); a silent
  skeleton fails the L11 contract.
- Pulse tone → the shared `Skeleton` atom; a literal `bg-gray-200` is drift.
