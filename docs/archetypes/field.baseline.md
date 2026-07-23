---
slug: field
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/field.md
---

# Field — baseline reference implementation

> The stack-specific binding of the [field contract](./field.md) to the
> **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell). Each
> role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<Field>` in `src/components/archetypes/field/`. It composes the shadcn `Label` atom
(`src/components/ui/label.tsx`) and wires an id via React's `useId()`. It adds no new
tokens — its label, helper, and error type all match `ui/form.tsx`'s
`FormLabel`/`FormDescription`/`FormMessage` exactly, so a standalone `Field` and an
RHF `FormItem` field render identically.

```tsx
import { Field } from "@/components/archetypes/field";
import { Input } from "@/components/ui/input";

<Field label="Recipe name" required error={nameError}>
  {(props) => <Input {...props} value={name} onChange={(e) => setName(e.target.value)} />}
</Field>

<Field label="Notes" description="Shown on the print card." >
  {(props) => <Textarea {...props} value={notes} onChange={…} />}
</Field>

<Field label="Course" orientation="inline">
  {(props) => (
    <Select value={course} onValueChange={setCourse}>
      <SelectTrigger id={props.id} aria-describedby={props["aria-describedby"]} className="w-40">…</SelectTrigger>
    </Select>
  )}
</Field>
```

## Role → primitive map

Only layers with a baseline-specific binding appear.

### L1 / L8 — Invocation + render-prop surface
- `children: (props: FieldControlProps) => React.ReactNode`, where
  `FieldControlProps = { id; "aria-describedby"?; "aria-invalid"? }`.
- The caller spreads `{...props}` onto a shadcn `Input`/`Textarea`, or applies `id` +
  `aria-describedby` to a `SelectTrigger` (which takes an `id`).
- `orientation?: "stacked" | "inline"` (default `"stacked"`). Stacked → wrapper
  `space-y-1.5`; inline → wrapper `flex items-center gap-2`.

### L4 / L11 — Label binding + accessibility
- Label → the `Label` atom with `htmlFor={id}`; `id` from `React.useId()`.
- `aria-describedby` is composed from `${id}-description` and `${id}-error`, joined by
  a space, only for the parts that are present (`undefined` when neither is).
- `aria-invalid` is `true` only when `error` is set, else omitted.

### L7 — Theming (token parity with the RHF stack)
- Field vertical rhythm → wrapper `space-y-1.5` (identical to `FormItem`).
- Label → `Label` atom; on error it gains `text-destructive` (identical to `FormLabel`).
- Description → `<p className="text-sm text-muted-foreground">` (identical to `FormDescription`).
- Error → `<p className="text-sm font-medium text-destructive">` (identical to `FormMessage`).

### L9 — Error + required marker
- `error?: React.ReactNode` — the destructive message node (id `${id}-error`).
- `required?: boolean` → a decorative `<span aria-hidden className="ml-0.5 text-muted-foreground">*</span>`
  after the label text. Announce required-ness via the control's own `required`/`aria-required`.

## Consuming from the page + dialog archetypes

`crud-dialog` (J), `settings-table`'s edit dialog (D2), and any non-RHF fields in the
page archetypes should use `<Field>` for standalone labeled controls rather than a
hand-rolled `<Label>` + control. Inside an RHF `form-page` (B), keep the
`FormField`/`FormItem` stack — `Field` is its library-free twin, not a replacement,
and the two are designed to render identically.

## Acceptance gate (baseline tells)
- Standalone labeled control → `<Field>`; a hand-rolled `<label className="text-sm …">`
  + control with no `htmlFor` fails "one primitive owns the labeled-field shape".
- A11y → the label is bound (`htmlFor`/`id`) and description/error are associated
  (`aria-describedby`); a visually-labeled but unwired control fails the L11 contract.
- Token parity → label/description/error type matches the RHF stack; bespoke
  `text-gray-*`/`text-[10px]` label classes are drift.
- Nesting-associated controls (checkbox/radio/file-dropzone `<label>` wrapping the
  control) are **out of scope** and correctly stay raw — not a `Field`.
