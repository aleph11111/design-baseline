---
slug: raw-textarea
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/raw-textarea.md
---

# raw-textarea — baseline reference implementation

> The stack-specific binding of the [raw-textarea contract](./raw-textarea.md) to
> the **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell).
> Each role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<TextareaField>` in `src/components/archetypes/raw-textarea/`. It composes the
shadcn `Textarea` atom (`src/components/ui/textarea.tsx`) and the `Label` atom
(`src/components/ui/label.tsx`) — it adds no new field chrome; the atom owns the
border/surface/focus-ring, and this molecule only wires the label, the helper/error
slot, the counter, and the mono variant around it. It forwards its ref to the
underlying textarea and spreads native `TextareaHTMLAttributes`, so it drops into a
`useState` value or a react-hook-form `register()` / `field` spread unchanged.

```tsx
import { TextareaField } from "@/components/archetypes/raw-textarea";

<TextareaField label="Notes" helperText="Markdown is fine." rows={4} />
<TextareaField label="Review" showCount maxLength={280} />
<TextareaField label="Config" mono error={jsonError} rows={5} />
```

## Role → primitive map

Only layers with a baseline-specific binding appear.

### L1 — Invocation contract
`<TextareaField {...props} />`. Label via the `label` prop → `<Label htmlFor>`;
value via the native `value`/`defaultValue` + `onChange` spread (or an RHF field
spread). The internal `onChange` wrapper updates the counter tracker, then calls the
caller's `onChange`.

### L4 — Keyboard / focus
`id` is auto-generated with `React.useId()` when not supplied and linked to the
`<Label htmlFor>`, so a label click focuses the field. Native textarea key handling
is untouched.

### L5 — Counter (allowed variation)
`showCount` + `maxLength` render a `{length}/{maxLength}` span with `tabular-nums`.
Length is `String(value).length` when controlled, else an internal tracker seeded
from `defaultValue`. Tone scale:
- default → `text-muted-foreground`
- warning (`length ≥ maxLength * 0.9`) → `text-amber-600 dark:text-amber-500`
- over/at limit (`length ≥ maxLength`) → `text-destructive`

`maxLength` is passed to the native textarea, so the limit is enforced, not just shown.

### L7 — Theming
- **mono** → `font-mono text-xs` on the textarea + `spellCheck={false}`.
- **error tone** → `border-destructive focus-visible:ring-destructive` on the
  textarea; the message renders in `text-destructive`.
- helper line + counter-neutral → `text-muted-foreground`. The helper/error row is
  a `flex items-start justify-between gap-2 text-xs` under the field.

### L9 — Error surface
`error` (any node) renders in the helper slot as `text-destructive`, sets
`aria-invalid` on the textarea, and tints its border/ring destructive. When `error`
is set, `helperText` is not rendered (error supersedes helper).

### L11 — Accessibility contract
`<Label htmlFor={fieldId}>` associates the caption. The helper/error span
(`id={fieldId}-help`) and the counter span (`id={fieldId}-count`) are joined into
the textarea's `aria-describedby` (alongside any caller-supplied `aria-describedby`),
so assistive tech announces them with the field. `error` also drives `aria-invalid`.
