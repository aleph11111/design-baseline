---
key: T
slug: raw-textarea
kind: component
version: 1.1
promoted_from: brickshop-manager (fleet synthesis; dashboard, controlling-app, my-finance-app, mistra, hk-crm, pmo)
promoted_at: 2026-07-23
source_spec_version: n/a (fleet synthesis — no single source spec)
status: locked
---

# Archetype T — raw-textarea

A **labeled multi-line text field**: a caption above a resizable text area, with an
optional muted helper line, an error line, an opt-in character counter, and an
opt-in monospace/code variant. A **Component-kind** archetype — a molecule reused
inside form and dialog bodies, not a page shape of its own.

Promoted as a fleet synthesis. The slug names the smell it fixes: across all seven
scanned projects, a multi-line field is re-hand-composed at every call site —
label + text area + (optional) helper/error line stitched together locally, **even
in the five projects that already own a bare text-area atom**, and from a truly
raw `<textarea>` in the two that don't (dashboard, my-finance-app). No project
reaches for a shared *field* molecule; the counter and the mono/JSON variant get
re-implemented too. Rule-of-2 is met many times over (the field composition in all
7; the mono variant in controlling-app + mistra; the counter as a repeated idiom
within brickshop). This is the convergence target that composition should collapse
onto.

> **Reference implementation.** This file is the **stack-agnostic contract** —
> every rule names a *role*, not a primitive. The baseline-stack binding (the
> concrete primitive + Tailwind-4 class strings) lives in
> [`raw-textarea.baseline.md`](./raw-textarea.baseline.md). A project on a
> different stack adopts this contract without needing that file.

## When to use it (and when not)

- **Use** for any free-text field taller than one line inside a form or dialog —
  notes, descriptions, reviews, comments, a pasted JSON/config blob.
- **Do not use** for single-line input (that is the text-input field), for
  rich-text/WYSIWYG editing (out of scope — this is a plain text area), or as a
  read-only display of long text (that is body copy, not a field).
- **No auto-resize.** A fleet-wide search for auto-grow behavior
  (`scrollHeight`/`field-sizing`/an auto-resize hook) came back empty across all
  seven projects, so the baseline deliberately ships none. Height is fixed by a
  row count / min-height and the native resize handle, exactly as the fleet does it.

## Component layers

The `component` kind defines eleven layers; only the layers that bear on this
molecule carry a rule. The rest are explicitly N/A.

### L1 — Invocation contract
Rendered inside a form or dialog body as one labeled field. It is **binding-neutral**:
the caller supplies the value through whichever mechanism it already uses — a
controlled value + change handler, or a form library's field binding (a
register/field spread) — and the molecule couples to none of them. Every field
affordance below (label, helper, error, counter, mono) is opt-in; with none set it
degrades to a bare labeled text area.

### L2 — State shape
Presentational. The **value is the caller's** — the molecule owns no persistent
field state. The sole internal state it may hold is a length tracker used by the
counter (L5) when the field is uncontrolled; when the value is controlled, even the
count is derived from it, not stored.

### L3 — Selection model
N/A — not a selection widget. Native text selection inside the area is the
platform's, untouched.

### L4 — Keyboard / focus
Native text-area semantics. A single tab stop; activating the label moves focus
into the field. **Enter inserts a newline** — it never submits the surrounding
form. No custom key handling is added.

### L5 — Empty / loading states
- **Empty** — a placeholder role communicates the empty state; there is no separate
  "empty" chrome.
- **Loading** — N/A; a field does not own a loading plane. A form awaiting data
  disables or omits the field.
- **Counter (allowed variation).** When a maximum length is set, the field may show
  a `used / max` counter. Its tone follows a three-step scale — neutral by default,
  a **warning** tone as the value approaches the limit, an **over-limit** tone at or
  past it. The maximum is enforced natively, not only displayed.

### L6 — Mobile affordance
Fluid — full-width, reflows with its container. No separate mobile component.

### L7 — Theming
Rides the shared field chrome (the standard input border, surface, and focus-ring
tokens). Two token-level variations only:
- **mono / code (allowed variation)** — a monospace tone for JSON/config input,
  which also disables spell-check. It changes the font tone **only**; the field
  chrome is unchanged.
- **error tone** — an error binds the field border and its message to the shared
  destructive tone. The helper line and counter-neutral state use the shared muted
  tone; the counter's warning step uses the shared warning tone.

### L8 — Render-prop surface
N/A — the label, helper, and error are content slots that accept arbitrary nodes,
not render props. A caller needing bespoke layout composes the text-area atom
directly.

### L9 — Error surface
**Required (when an error is supplied).** The field owns its inline error: the
message renders on the line below the area in the destructive tone, the field is
marked invalid for assistive tech, and the error is associated with the field. The
optional helper line renders **alongside** the error, and both lines are associated
with the field — the coexistence rule is the one the shared labeled-field frame
owns, and is the same for every labeled field. A required field renders a required
marker by the label and sets the control's native required state. Validation itself
is the caller's job — the molecule only renders the outcome.

### L10 — Performance contract
Pure controlled render — no effects, no layout measurement. The counter derives its
length in constant time from the current value. Cost is that of a native text area.

### L11 — Accessibility contract
**Required.** The label is programmatically associated with the field (not merely
adjacent). The helper line, the error message, and the counter are each linked to
the field as descriptions, so assistive tech announces them with it. An error sets
the field's invalid state. This label/description wiring is the gap in the
hand-rolled fleet copies (several use an unassociated bare caption), and is
non-negotiable in the baseline version.
