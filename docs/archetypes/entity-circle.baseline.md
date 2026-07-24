---
slug: entity-circle
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/entity-circle.md
---

# Entity circle — baseline reference implementation

> The stack-specific binding of the [entity-circle contract](./entity-circle.md)
> to the **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app
> shell). Each role in the contract is bound here to a concrete primitive + class
> strings. A project on a different stack does **not** need this file.

## Primitive binding

`<EntityAvatar>` in `src/components/archetypes/entity-circle/`. It **composes** the
donor avatar primitive rather than re-deriving its chrome:
- the circular holder + image/fallback swap → the shadcn `Avatar` / `AvatarImage`
  / `AvatarFallback` (`src/components/ui/avatar.tsx`), a Radix Avatar.
- the initials derivation → the exported `entityInitials(name)` helper, the single
  home for the split-and-uppercase logic the fleet hand-rolled twice.

This is the **name-driven** sibling of `IconAvatar` (`src/components/ui/icon-avatar.tsx`),
which holds an icon or pre-computed children in a muted circle. EntityAvatar takes
a `name` and derives its own initials; IconAvatar does not. They share the shadcn
`Avatar` base and the same size scale.

```tsx
import { EntityAvatar } from "@/components/archetypes/entity-circle";

<EntityAvatar name="Miles Davis" src={player.photo} size="md" />
<EntityAvatar name="Signed-in User" tone="primary" />
```

## Role → primitive map

Only layers with a baseline-specific binding appear.

### L1 — Invocation contract
- `name: string` (required) → initials + accessible name.
- `src?: string` → passed to `AvatarImage`; absent/failed falls through to the
  `AvatarFallback`.

### L5 — Empty / loading states
- Image→initials swap → Radix `Avatar`'s built-in load/error transition; no manual
  wiring.
- Initials derivation → `entityInitials(name)`: `name.trim().split(/[\s_]+/)`, single
  token → `.slice(0, 2)`, multi-token → first char of first + last, `.toUpperCase()`,
  `"?"` when empty. Exported and unit-tested.

### L6 — Mobile affordance / size scale
- `size?: "xs" | "sm" | "md"` → `SIZE_CLASS`: `h-6 w-6 text-[10px]` / `h-8 w-8
  text-xs` / `h-10 w-10 text-sm`. Same scale as `IconAvatar`. Default `sm`.

### L7 — Theming (tone)
- `tone?: "muted" | "primary"` → `TONE_CLASS` on the fallback: `bg-muted
  text-muted-foreground` (default) or `bg-primary text-primary-foreground` (the
  brand fill brickshop's user avatar used). Both are token pairs — never a literal
  `bg-blue-100`/`text-blue-700` tint (mistra's off-token drift). The fallback also
  carries `font-medium`.
- No per-entity hue: there is no `bg-*-100` palette and no name→color hash (see the
  contract's L7 rationale). A project needing hue variety adds a categorical token
  set and extends `TONE_CLASS` locally.

### L11 — Accessibility contract
- Image path → `<AvatarImage alt={name} />` supplies the accessible name.
- Fallback path → `<AvatarFallback role="img" aria-label={name}>` so a screen
  reader announces the entity's name, not the raw initials. This closes the
  universal fleet gap (bare `<span>` of initials with `src=""`, or a plain tinted
  span, neither carrying a name).

## Consuming from the page archetypes
`feed-inbox` (H), `detail-overview` (C), and `list-with-detail` (A) rows that lead
with a person/contact circle use `<EntityAvatar name=… />` rather than a
hand-rolled `rounded-full` span. The app-shell account menu trigger uses
`<EntityAvatar name={user.name} tone="primary" />`. A leading **icon** glyph stays
`IconAvatar`; a **status/tag dot** stays a plain `rounded-full` swatch.

## Acceptance gate (baseline tells)
- Named-entity circle → `<EntityAvatar>`; a hand-rolled `<span className="…rounded-full
  bg-primary…">{initials}</span>` with its own `split(' ').map(w => w[0])` fails "one
  primitive owns the name-driven entity circle".
- Initials → `entityInitials(name)`, not a re-inlined deriver at the call site.
- Color → `tone="muted"`/`"primary"` token pairs; a literal `bg-blue-100` tint, or a
  palette indexed by list position, is drift.
- A11y → the circle's accessible name is the entity name (`alt` / `aria-label`); bare
  announced initials fail the L11 contract.
