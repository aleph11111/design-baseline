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
shadcn `Textarea` atom (`src/components/ui/textarea.tsx`) and the **shared field
frame** (`src/components/archetypes/shared/fieldFrame.tsx`, re-exported from
`shared/index.ts`) — the same `FieldLabel`/`FieldFrame`/`FieldHint`/`FieldError`
+ `useFieldIds` that NativeField (I) and SelectField (S) compose — so the
label, hint and error slots, the `${id}-hint` / `${id}-error` scheme and the
`aria-invalid` / `aria-describedby` wiring are the frame's, not this molecule's.
It adds no new field chrome; the atom owns the border/surface/focus-ring. It
forwards its ref to the underlying textarea and spreads native
`TextareaHTMLAttributes`, so it drops into a `useState` value or a react-hook-form
`register()` / `field` spread unchanged.

```tsx
import { TextareaField } from "@/components/archetypes/raw-textarea";

<TextareaField label="Notes" hint="Markdown is fine." rows={4} />
<TextareaField label="Review" maxLength={280} />
<TextareaField label="Config" mono error={jsonError} rows={5} />
<TextareaField label="Signature" required rows={2} />
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
frame's `FieldLabel htmlFor`, so a label click focuses the field. Native textarea
key handling is untouched.

### L5 — Counter (allowed variation)
`maxLength` alone renders a `{length}/{maxLength}` span with `tabular-nums` —
the counter is derived from the contract's own condition ("when a maximum length
is set"), never opted into per call site. There is no `showCount` flag: it was a
per-call-site discretion on top of that keying rule, which ADR-0004's
derived-vs-inherited test disqualifies, and it is gated by
`archetype-appearance-boolean-prop`.
Length is `String(value).length` when controlled, else an internal tracker seeded
from `defaultValue`. Tone scale:
- default → `text-muted-foreground`
- warning (`length ≥ maxLength * 0.9`) → `text-amber-600 dark:text-amber-500`
- over/at limit (`length ≥ maxLength`) → `text-destructive`

`maxLength` is passed to the native textarea, so the limit is enforced, not just shown.

### L7 — Theming
- **mono** → `font-mono text-xs` on the textarea + `spellCheck={false}`.
- **error tone** → `border-destructive focus-visible:ring-destructive` on the
  textarea; the message renders via the frame's `FieldError`
  (`text-sm font-medium text-destructive`).
- hint line → the frame's `FieldHint` (`text-sm text-muted-foreground`) — the same
  scale as every other field's hint, replacing the pre-frame `text-xs` helper row.
- counter-neutral → `text-sm tabular-nums text-muted-foreground` (right-aligned
  under the textarea); the counter's tone tokens are unchanged.

### L9 — Error surface
`error` (any node) renders via the frame's `FieldError`, sets `aria-invalid` on
the textarea (via the frame's `useFieldIds`), and tints the border/ring destructive.
A `hint` prop (any node; the deprecated alias is `helperText`) renders via the
frame's `FieldHint` **alongside** the error — the frame's coexistence rule is the
same for every field.

### L11 — Accessibility contract
The frame's `FieldLabel` (`htmlFor={fieldId}`) associates the caption. The frame's
`useFieldIds` joins the hint id (`id={fieldId}-hint`) and the error id
(`id={fieldId}-error`) — whichever are present — into the textarea's
`aria-describedby`, alongside any caller-supplied `aria-describedby` and the
counter span (`id={fieldId}-count`), so assistive tech announces them with the
field. `error` also drives `aria-invalid` (frame-derived).

### Required marker
`required` → the frame's `FieldLabel` marker (`ml-0.5 text-destructive` `*`,
`aria-hidden`) plus the native `required` attribute on the textarea. Pre-frame,
TextareaField had no required affordance; the frame supplies it.
