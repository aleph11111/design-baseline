---
slug: overline-typed
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/overline-typed.md
---

# Typed overline — baseline reference implementation

> The stack-specific binding of the [overline-typed contract](./overline-typed.md) to the
> **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell). Each role
> in the contract is bound here to a concrete primitive + class strings. A project on a
> different stack does **not** need this file.

## Primitive binding

`<Overline>` in `src/components/archetypes/overline-typed/`. It **composes** the donor's
existing base signature rather than re-deriving it:

- the base signature + color → `OVERLINE_CLASS` from `src/components/layout/overline.ts`
  (`text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground`) — the
  single source SectionHeading, SurfaceHeader, BottomNav, StatTile, and BoardColumn
  already share. The color is part of the signature (the contract's L7, v2): the
  component owns **no `tone` prop and no color map**.
- the one-off deviation → the `className` passthrough merged over the base via
  `cn` (tailwind-merge), so a single `text-*` color class wins over the base
  `text-muted-foreground`. A one-class one-color escape on a leaf label — the contract's
  documented leaf exemption from the `*Shell`/`*Sheet` className ban, which that ban
  never scoped over (it scopes to page/overlay shells).

The base string already lived in the donor; the fleet kept re-copying it (mistra/hk-crm)
or inlining it (finance/dashboard). This promotion wraps it in a component — it does
**not** re-type the class. Existing donor consumers keep composing `OVERLINE_CLASS`
directly; adopting `<Overline>` over time is drift-tracked, not forced.

```tsx
import { Overline } from "@/components/archetypes/overline-typed";

<Overline as="h2">Latest episodes</Overline>          {/* section heading kicker: the fixed base signature */}
<Overline className="mb-1">Season 3</Overline>        {/* layout classes only — the one-off channel */}
<Overline className="text-emerald-700">Income</Overline>  {/* the one-off color (the finance case, per site) */}
```

On an accent-filled surface (the hk-crm solid-header case) the label recolor comes from
the surface's own binding — `headerFillClasses().kicker` on `SurfaceHeader` — not from a
prop on this molecule.

## Role → primitive map

Only layers with a baseline-specific binding appear.

### L1 — Invocation contract
- children → the label text; `as?: OverlineElement` (default `"div"`); `className?`
  passthrough. No value/callback surface. **No tone prop** (contract L7, v2) — the API
  is `children`, `as`, `className`.

### L7 — Theming (fixed signature + the one-off channel)
- base signature + color → `OVERLINE_CLASS` (`src/components/layout/overline.ts`),
  composed first in every render. Never re-typed at a call site. The
  `text-muted-foreground` in that string **is** the label's color — there is no color map
  to merge over it (the tone set this promotion shipped with was retired in v2 as a
  non-derivable appearance axis; see the contract's L7 for the call).
- one-off deviation → a single `text-*` color class (finance's `text-emerald-700` etc.)
  passed via `className` and merged over the base by `cn` (tailwind-merge), so only the
  conflicting `text-*` color drops and size/weight/tracking/case in `OVERLINE_CLASS`
  win nothing. Layout-only classes (`mb-1` …) ride the same passthrough. This is the
  contract's documented leaf exemption from the `*Shell`/`*Sheet` className ban.
- accent-filled surface → the recolor comes from the surface contract's binding:
  `headerFillClasses().kicker` (→ `text-primary-foreground/80`) on `SurfaceHeader`'s
  kicker slot — the hk-crm solid-header case, owned by the header shell, never by this
  component.

### L8 — Element selection
- `as` → one of `"div" | "span" | "p" | "h2" | "h3" | "h4"`, rendered via
  `React.createElement`. Use `h2`/`h3` when the overline **is** the section heading
  (as SectionHeading does with its `<h2 className={OVERLINE_CLASS}>`); default `div` for a
  decorative kicker above a separate heading.

### L11 — Accessibility contract
- When the overline is the section heading → `as="h2"` / `as="h3"` so the outline is
  correct; otherwise a real heading element sits below the overline.
- Case → `uppercase` is a CSS transform in `OVERLINE_CLASS`; the accessible name is the
  original children string, not the visually-uppercased text.
- Color → the fixed base color carries emphasis only, and the one-off `text-*` class
  recolors emphasis only; a status label carries its meaning in its text, never in its
  color.

## Consuming from the page archetypes
The natural homes are anywhere a kicker sits above a title: `SectionHeading`,
`SurfaceHeader`'s `kicker` slot, `StatTile` labels, `BoardColumn` (K) headers, and nav
group labels. Those donor primitives currently compose `OVERLINE_CLASS` directly and
continue to work unchanged; new consumers (and projects re-inventing the inline copies)
adopt `<Overline>` so the base signature stays in one place. On a solid accent surface
the kicker recolor is the surface contract's job — `headerFillClasses().kicker` on
`SurfaceHeader` — and a project whose pages genuinely need a *set* of recolors has a
badge or a local fork, not this label.

## Acceptance gate (baseline tells)
- Uppercase kicker above a heading → `<Overline>` (or a donor primitive composing
  `OVERLINE_CLASS`); a hand-typed `className="text-xs uppercase tracking-wider text-gray-400"`
  fails "one signature owns the overline look".
- Base signature → `OVERLINE_CLASS`, never a re-typed `uppercase tracking-* text-xs`
  string; a bespoke size/weight/tracking is drift.
- Tone → **deleted in v2**: a `tone=` prop on `<Overline>` fails — the component has no
  color prop, and a `text-*` color class is legal only as a single-site one-off
  `className` (or via a surface contract's binding); a *set* of recolors is a badge or a
  fork.
- Heading semantics → when the overline is the section title, `as="h2"`/`"h3"`, not a
  `<div>` that leaves the page heading-less.
