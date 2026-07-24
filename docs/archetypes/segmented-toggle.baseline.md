---
slug: segmented-toggle
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/segmented-toggle.md
---

# Segmented toggle — baseline reference implementation

> The stack-specific binding of the [segmented-toggle contract](./segmented-toggle.md) to
> the **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell). Each role
> in the contract is bound here to a concrete primitive + class strings. A project on a
> different stack does **not** need this file.

## Primitive binding

`<SegmentedControl>` — the archetype re-exports the canonical donor primitive at
`src/components/ui/segmented-control.tsx` through
`src/components/archetypes/segmented-toggle/index.ts`. There is **no separate archetype
implementation**: the molecule was already consolidated into the `ui/` layer, and the
keyboard/ARIA model is supplied by `@radix-ui/react-radio-group` (the same Radix primitive
that backs `ui/radio-group.tsx`) rather than hand-rolled. The archetype adds the contract,
the demo, and a stable `@/components/archetypes/segmented-toggle` import path — not a second
copy of the component.

```tsx
import { SegmentedControl } from "@/components/archetypes/segmented-toggle";
import { List, LayoutGrid, GanttChart } from "lucide-react";

<SegmentedControl
  aria-label="Library view"
  value={view}
  onValueChange={setView}
  options={[
    { value: "list", label: "List", icon: List },
    { value: "grid", label: "Grid", icon: LayoutGrid },
    { value: "timeline", label: "Timeline", icon: GanttChart },
  ]}
/>
```

## Role → primitive map

Only layers with a baseline-specific binding appear.

### L1 — Invocation contract
- `value: T` (a string-literal union) in, `onValueChange: (value: T) => void` out — the
  active option's raw value.
- Option set → `options: { value: T; label: React.ReactNode; icon?: ComponentType<{ className?: string }> }[]`.

### L3 — Selection model
- `T extends string`: the value type is inferred from the option `value`s, so callers get a
  narrow union rather than bare `string`.
- Each `options[]` entry maps to one `RadioGroupPrimitive.Item`; `icon` renders as a
  leading `h-3.5 w-3.5` glyph before the label.

### L4 — Keyboard / focus
- Supplied by `RadioGroupPrimitive.Root` / `.Item`: roving tabindex (one tab stop), arrow
  keys move + select with wraparound, Home/End to the ends, focus follows selection. No
  hand-rolled `onKeyDown` — that path (still present in brickshop's bespoke copy) is exactly
  what binding to Radix removes.

### L7 — Theming (chrome)
- track → `RadioGroupPrimitive.Root` with
  `inline-flex items-center gap-1 rounded-md border p-0.5`.
- pill → `inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors`.
- active pill → `bg-primary text-primary-foreground`.
- inactive pill → `text-muted-foreground hover:text-foreground`.
- The single `px-2.5` padding string is the consolidation point — the drifted
  `px-2` / `px-3` per-site variants are gone.

### L11 — Accessibility contract
- Group → `RadioGroupPrimitive.Root` renders `role="radiogroup"`; `aria-label` is passed
  through and is **required** (no visible caption ⇒ supply one here).
- Options → each `RadioGroupPrimitive.Item` renders `role="radio"` with its `aria-checked`
  state managed by Radix.
- Keyboard model → inherited from Radix (see L4); it is part of this contract, not optional.

## Choosing between this and its neighbours (baseline)
- **`<Tabs>` (`ui/tabs.tsx`)** for section/route-like switching or when the option set can
  overflow — larger targets, can scroll.
- **`<Switch>` (`ui/switch.tsx`)** for a single binary setting.
- **`<SelectField>` (archetype S, `raw-select`)** for a *labeled form field* whose value is
  one enum choice — it owns a label, a placeholder/empty affordance, and an error state; a
  mode toggle owns none of those.
- **A pill/chip filter bar** for multi-select filtering.

## Acceptance gate (baseline tells)
- Compact single-choice in-place toggle → `<SegmentedControl>`; a hand-rolled row of
  `<button>`s toggling `bg-primary` fails "one primitive owns the segmented toggle".
- Keyboard → the group is one tab stop and arrows move + select (Radix radiogroup); a
  set of independently-tabbable buttons with no arrow handling fails the L4/L11 contract.
- Options → `{ value, label, icon? }` data, not re-hand-built `<button>` markup per site.
- Chrome → the shared track + pill class strings; a bespoke `px-2` / `px-3` padding string
  is drift, not variation.
