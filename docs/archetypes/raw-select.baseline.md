---
slug: raw-select
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/raw-select.md
---

# Select field — baseline reference implementation

> The stack-specific binding of the [raw-select contract](./raw-select.md) to the
> **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell). Each role
> in the contract is bound here to a concrete primitive + class strings. A project on a
> different stack does **not** need this file.

## Primitive binding

`<SelectField>` in `src/components/archetypes/raw-select/`. It **composes** the donor
enum control rather than re-deriving its chrome:
- the choice control → the shadcn `Select` / `SelectTrigger` / `SelectValue` /
  `SelectContent` / `SelectItem` (`src/components/ui/select.tsx`), a Radix Select.
- the label → the shadcn `Label` (`src/components/ui/label.tsx`).

The fleet is split between a bare native `<select>` and this Radix trigger; the contract
is control-agnostic, and the baseline binds to the canonical baseline enum control (the
shadcn `Select`), exactly as `NativeField` binds text to the shadcn `Input`.

```tsx
import { SelectField } from "@/components/archetypes/raw-select";

<SelectField label="Complexity" required value={weight} onChange={setWeight}
             options={[{ value: "gateway", label: "Gateway" },
                       { value: "heavy", label: "Heavy" }]}
             placeholder="How heavy is it?" error={weightError}
             hint="Roughly how long a game runs." />
```

## Role → primitive map

Only layers with a baseline-specific binding appear.

### L1 — Invocation contract
- Standalone → `value: string` in, `onChange: (value: string) => void` out (the chosen
  option's raw value), mirroring `NativeField`.
- Inside a form-binding role → render `<SelectField>` inside the shadcn
  `FormField`/`FormItem` (`ui/form.tsx`) render body, passing `field.value` /
  `field.onChange` through. The RHF context stays the value + error owner.

### L2 — State shape
- Generated id → `React.useId()`, overridable via the `id` prop; drives the trigger id,
  the `-label` / `-hint` / `-error` description ids.

### L3 — Selection model
- Option set → `options: { value: string; label: string; disabled?: boolean }[]`, mapped
  to `<SelectItem>` children. `value` binds Radix's `value` / `onValueChange`. This is
  the `{value,label}[]` convention **no fleet project reached** — they all pass `<option>`
  / `<SelectItem>` markup per site.

### L5 — Empty / loading states
- Placeholder → `<SelectValue placeholder={placeholder} />`, shown when `value === ""`.
  An explicit "none" is a real `SelectItem` in `options`, never a `"__none__"` magic
  sentinel with per-site null-coercion (the drift observed in controlling-app / mistra).

### L7 — Theming (chrome)
- control → inherited from `SelectTrigger`: `flex h-10 w-full items-center justify-between
  rounded-md border border-input bg-background px-3 py-2 … focus:ring-2 focus:ring-ring
  focus:ring-offset-2`.
- label → `Label` (`text-sm font-medium leading-none`); required marker is a `ml-0.5
  text-destructive` `*` (`aria-hidden`).
- wrapper → `flex flex-col gap-1.5`; hint → `text-sm text-muted-foreground`; error →
  `text-sm font-medium text-destructive`.

### L9 — Error surface
- `error?: string` → renders the destructive `<p id={`${id}-error`}>` and adds
  `border-destructive focus:ring-destructive` to the trigger.
- `required?: boolean` → the label marker **and** the Radix `required` prop on `Select`
  (surfaced as `aria-required` on the trigger).

### L11 — Accessibility contract
- Label association → the Radix trigger is a `<button>`, so association is via
  `aria-labelledby={labelId}` on the trigger paired with `id={labelId}` on the `Label`
  (not `htmlFor` — that only associates with native controls).
- Invalid → `aria-invalid={true}` on the trigger when `error` is set.
- Description → `aria-describedby` on the trigger joins the hint id and the error id
  (whichever are present), so both are announced.
- Required → the Radix `required` prop (surfaced as `aria-required`), not the visual `*`
  alone.

## Consuming from the page archetypes
`form-page` (B) and `crud-dialog` (J) are the natural homes: a labeled enum field inside
their form body is a `<SelectField>` rather than a hand-rolled label + select + error
triad. Free-text/native rows stay `NativeField` (I), multi-line rows stay `TextareaField`
(T), boolean rows stay `Checkbox`/`Switch`, and grid-cell enum edits stay `CellSelect` —
`SelectField` owns the labeled standalone enum field, not those specialized controls.

## Acceptance gate (baseline tells)
- Labeled enum field → `<SelectField>`; a hand-rolled `<label>` + `<select
  className="border rounded px-2 py-1">` + error `<p>` triad fails "one primitive owns
  the labeled enum-field assembly".
- A11y → the label is associated (`aria-labelledby`/`id`) and the error is announced
  (`aria-invalid` + `aria-describedby`); a visually-adjacent-but-unassociated label, or a
  silent error, fails the L11 contract.
- Options → `{value,label}[]` data, not re-hand-built `<SelectItem>` markup at the call
  site; empty is a real option, not a `"__none__"` sentinel.
- Chrome → the shared `SelectTrigger` chrome; a literal `border-gray-300` / bespoke
  padding string is drift.
