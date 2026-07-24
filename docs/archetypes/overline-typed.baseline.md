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
- the base signature → `OVERLINE_CLASS` from `src/components/layout/overline.ts`
  (`text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground`) — the
  single source SectionHeading, SurfaceHeader, BottomNav, StatTile, and BoardColumn
  already share.
- the tone override → a token-backed class merged over the base via `cn` (tailwind-merge),
  so the tone's color wins over the base `text-muted-foreground`.

The base string already lived in the donor; the fleet kept re-copying it (mistra/hk-crm)
or inlining it (finance/dashboard). This promotion wraps it in a component and adds the
tone layer — it does **not** re-type the class. Existing donor consumers keep composing
`OVERLINE_CLASS` directly; adopting `<Overline>` over time is drift-tracked, not forced.

```tsx
import { Overline } from "@/components/archetypes/overline-typed";

<Overline as="h2">Latest episodes</Overline>          {/* section heading kicker, muted base */}
<Overline tone="primary" className="mt-2">New drop</Overline>  {/* typed status eyebrow */}
<Overline tone="inverted">Bonus feed</Overline>       {/* on a bg-primary surface */}
```

## Role → primitive map

Only layers with a baseline-specific binding appear.

### L1 — Invocation contract
- children → the label text; `tone?: OverlineTone`; `as?: OverlineElement` (default
  `"div"`); `className?` passthrough. No value/callback surface.

### L7 — Theming (base + tone)
- base signature → `OVERLINE_CLASS` (`src/components/layout/overline.ts`), composed first
  in every render. Never re-typed at a call site.
- tone set → `OverlineTone = "muted" | "foreground" | "primary" | "inverted"`, mapped to
  color-only classes:
  - `muted` → `""` (the base is already `text-muted-foreground`) — default.
  - `foreground` → `text-foreground` (a louder section label).
  - `primary` → `text-primary` (brand-tinted eyebrow).
  - `inverted` → `text-primary-foreground/80` (on a `bg-primary` / solid header surface —
    the hk-crm `headerFillClasses().kicker` case, generalized).
  Each tone overrides **color only**; size/weight/tracking/case stay in `OVERLINE_CLASS`
  and win nothing, because `cn` (tailwind-merge) only drops the conflicting `text-*` color.
- sanctioned deviation → an arbitrary per-category color (finance's `text-emerald-700`
  etc.) goes through `className`, not a new tone. This is the `{value,label}`-style "one
  passthrough, closed set otherwise" convention, mirroring raw-select's width override.

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
- Tone → color-only; the status text itself (not just its `tone`) carries the meaning.

## Consuming from the page archetypes
The natural homes are anywhere a kicker sits above a title: `SectionHeading`,
`SurfaceHeader`'s `kicker` slot, `StatTile` labels, `BoardColumn` (K) headers, and nav
group labels. Those donor primitives currently compose `OVERLINE_CLASS` directly and
continue to work unchanged; new consumers (and projects re-inventing the inline copies)
adopt `<Overline>` so the base signature **and** the tone layer stay in one place. The
inverted tone is the shared answer to the solid-header kicker that `headerFillClasses`
handles for `SurfaceHeader`.

## Acceptance gate (baseline tells)
- Uppercase kicker above a heading → `<Overline>` (or a donor primitive composing
  `OVERLINE_CLASS`); a hand-typed `className="text-xs uppercase tracking-wider text-gray-400"`
  fails "one signature owns the overline look".
- Base signature → `OVERLINE_CLASS`, never a re-typed `uppercase tracking-* text-xs`
  string; a bespoke size/weight/tracking is drift.
- Tone → one of the closed set (`muted`/`foreground`/`primary`/`inverted`); a raw color
  passed as a "tone" fails — arbitrary color is a `className` deviation, not a tone.
- Heading semantics → when the overline is the section title, `as="h2"`/`"h3"`, not a
  `<div>` that leaves the page heading-less.
