---
slug: raw-input
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/raw-input.md
---

# Native field — baseline reference implementation

> The stack-specific binding of the [raw-input contract](./raw-input.md) to the
> **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell). Each
> role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<NativeField>` in `src/components/archetypes/raw-input/`. It **composes** the donor
controls rather than re-deriving their chrome:
- text-like / numeric / date / time / password / url / email → the shadcn `Input`
  (`src/components/ui/input.tsx`).
- `multiline` → the shadcn `Textarea` (`src/components/ui/textarea.tsx`).
- `range` → a bare native `<input type="range">` styled directly, because the box
  chrome of `Input` (`h-10`, border) is wrong for a slider and shadcn ships **no**
  slider primitive. This is the one control NativeField styles itself.
- The label is the shadcn `Label` (`src/components/ui/label.tsx`).

```tsx
import { NativeField } from "@/components/archetypes/raw-input";

<NativeField label="Batch name" required value={name} onChange={setName}
             error={nameError} hint="Shown on the fermenter tag." />
<NativeField label="Original gravity" type="number" step={0.001}
             value={og} onChange={setOg} />
<NativeField label="Brewed on" type="date" value={date} onChange={setDate} />
<NativeField label="Ferment temp (°C)" type="range" min={0} max={30}
             value={temp} onChange={(v) => setTemp(Number(v))} />
<NativeField label="Tasting notes" multiline rows={3} value={notes} onChange={setNotes} />
```

## Role → primitive map

Only layers with a baseline-specific binding appear.

### L1 — Invocation contract
- Standalone → `value: string | number` in, `onChange: (value: string) => void` out
  (raw string, like `ColorField`). Numeric callers convert with `Number(v)`.
- Inside a form-binding role → render `<NativeField>` inside the shadcn
  `FormField`/`FormItem` (`ui/form.tsx`) render body, passing `field.value` /
  `field.onChange` through. The RHF context stays the value + error owner.

### L2 — State shape
- Generated id → `React.useId()`, overridable via the `id` prop; drives `htmlFor`
  and the `-hint` / `-error` description ids.

### L7 — Theming (chrome)
- text-like / numeric / date / time / etc. → inherited from `Input`: `h-10 w-full
  rounded-md border border-input bg-background px-3 py-2 … focus-visible:ring-2
  focus-visible:ring-ring focus-visible:ring-offset-2`.
- multiline → inherited from `Textarea` (`min-h-[80px]` + the same border/ring).
- range → `h-2 w-full cursor-pointer accent-primary` + the shared
  `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`, paired
  with a `w-12 text-right text-sm tabular-nums text-muted-foreground` value readout.
- label → `Label` (`text-sm font-medium leading-none`); required marker is a
  `ml-0.5 text-destructive` `*` (`aria-hidden`).
- wrapper → `flex flex-col gap-1.5`; hint → `text-sm text-muted-foreground`; error →
  `text-sm font-medium text-destructive`.
- `labelClassName` / `controlClassName` → passed through via `cn()` onto the `Label` and the
  control (`Input`/`Textarea`/the raw `range` input), for consumers running a denser chrome
  than the fixed binding above (e.g. `text-xs text-muted-foreground` labels over `h-8 text-sm`
  controls in a dense settings grid).

### L9 — Error surface
- `error?: string` → renders the destructive `<p id={`${id}-error`}>` and adds
  `border-destructive focus-visible:ring-destructive` to the control.
- `required?: boolean` → the label marker **and** the native `required` attribute.

### L11 — Accessibility contract
- Label association → `<Label htmlFor={id}>` against the control's `id`.
- Invalid → `aria-invalid={true}` on the control when `error` is set.
- Description → `aria-describedby` on the control joins the hint id and the error id
  (whichever are present), so both are announced.
- Required → the native `required` attribute (not the visual `*` alone).

## Consuming from the page archetypes
`form-page` (B) and `crud-dialog` (J) are the natural homes: a labeled native field
inside their form body is a `<NativeField>` rather than a hand-rolled label + input +
error. Boolean rows still use `Checkbox`/`Switch`, enum rows still use `Select`, and
grid-cell edits still use `CellInput` — `NativeField` owns the labeled standalone
field, not those specialized controls.

## Acceptance gate (baseline tells)
- Labeled native field → `<NativeField>`; a hand-rolled `<label>` + `<input
  className="border rounded px-2 py-1">` + error `<p>` triad fails "one primitive
  owns the labeled-field assembly".
- A11y → the label is associated (`htmlFor`/`id`) and the error is announced
  (`aria-invalid` + `aria-describedby`); a visually-adjacent-but-unassociated label,
  or a silent error, fails the L11 contract.
- Chrome → the shared `Input`/`Textarea` chrome and the `accent-primary` range; a
  literal `border-gray-300` / bespoke padding string is drift.
