---
key: Sk
slug: skeleton-loader
kind: component
version: 1.0
promoted_from: brickshop-manager (fleet synthesis; hk-crm, controlling-app)
promoted_at: 2026-07-23
source_spec_version: n/a (fleet synthesis — no single source spec)
status: locked
---

# Archetype Sk — skeleton-loader

A **route/list-shaped loading placeholder**: greyed, gently pulsing rows shaped
like the content that is about to arrive, shown in place of a spinner over blank
space. The first baseline **Component-kind** archetype — a molecule reused across
page archetypes, not a page shape of its own.

Promoted as a fleet synthesis: brickshop-manager hand-rolls this ~40 times across
5 divergent shapes (list rows, avatar rows, table grids, card tiles, opaque
blocks) with no shared component and no accessibility affordances; hk-crm and
controlling-app repeat the same idea. Rule-of-2 is met several times over, so the
`component` kind is formalized here (see `README.md` → "Archetype kinds"). This is
the convergence target that idea should collapse onto.

> **Reference implementation.** This file is the **stack-agnostic contract** —
> every rule names a *role*, not a primitive. The baseline-stack binding (the
> concrete primitive + Tailwind-4 class strings) lives in
> [`skeleton-loader.baseline.md`](./skeleton-loader.baseline.md). A project on a
> different stack adopts this contract without needing that file.

## When to use it (and when not)

- **Use** where the row/column shape is **known ahead of the fetch** — a list, a
  table, a feed. The placeholder can mirror that shape, so the layout doesn't jump
  when data lands.
- **Do not use** where the shape is unknown, or the wait is sub-perceptible, or the
  surface is a detail pane whose layout depends on the fetched record. There, the
  text loading plane (the shared loading/empty/error state role) stays correct.

This replaces the older absolute "no skeleton screens in a list/table shell" rule
with a **conditional**: text loader is the default; a skeleton is a sanctioned
alternative when its shape is known. See `README.md` → "Layer 7 — canonical state
treatments".

## Component layers

The `component` kind defines eleven layers; only the layers that bear on this
molecule carry a rule. The rest are explicitly N/A.

### L1 — Invocation contract
Rendered while a collection is loading and swapped for the real collection when it
arrives. Two invocation shapes, both sanctioned:
- **Direct** — the owning surface renders the skeleton in its own loading branch.
- **Via the loading-plane role** — the shared loading/empty/error state role
  accepts a skeleton node as a loading-plane override and renders it verbatim
  (the skeleton owns its own status semantics), instead of the default text.

### L2 — State shape
Stateless and presentational. It reflects a loading condition the caller already
holds (a boolean, a suspense boundary, a route-level loading segment); it owns no
state and starts no timers.

### L3 — Selection model
N/A — not interactive.

### L4 — Keyboard / focus
N/A — contains no focusable elements and must not be a tab stop.

### L5 — Empty / loading states
This **is** the loading state. Required knobs, expressed as roles:
- **row count** — how many placeholder rows to render.
- **columns** — one column renders stacked bars; more than one renders a
  table-shaped grid whose first cell is widest (the identifier column).
- **header** — an optional wider placeholder (or a row of header cells, in the
  grid shape) above the rows.
- **leading media** — an optional circular placeholder per row (avatar / thumbnail
  shape), for row shapes that lead with one.

Forbidden: encoding real data widths that leak content length; a full-page single
opaque block standing in for structured content (that is the "gave up" shape the
fleet audit flagged, not this molecule).

### L6 — Mobile affordance
Fluid — rows and grid cells are full-width and reflow with their container. No
separate mobile component.

### L7 — Theming
Rides the shared neutral placeholder tone and the shared pulse animation. No
bespoke colors; honors reduced-motion at the animation-token level.

### L8 — Render-prop surface
N/A — the shape is driven by the knobs in L5, not by a render prop. A caller
needing a genuinely bespoke shape composes the shared skeleton atom directly.

### L9 — Error surface
N/A — a load error is the loading/empty/error state role's concern, not this
molecule's. The owning surface must swap the skeleton for the error plane on
failure (never leave a skeleton pulsing over a failed fetch).

### L10 — Performance contract
Pure render, no effects, no layout thrash; cost is linear in `rows × columns`.
Intended for the brief initial-fetch window, not as a persistent animation.

### L11 — Accessibility contract
**Required.** The placeholder announces the wait: it carries a status role and a
busy state, and exposes an overridable, screen-reader-only label (default
"Loading…"). Decorative placeholder blocks are not individually announced. This is
the single biggest gap in every hand-rolled fleet copy, and is non-negotiable in
the baseline version.
