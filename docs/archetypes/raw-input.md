---
key: I
slug: raw-input
kind: component
version: 1.0
promoted_from: fleet synthesis (controlling-app, my-finance-app, mistra, dashboard, brickshop-manager)
promoted_at: 2026-07-23
source_spec_version: n/a (fleet synthesis — no single source spec)
status: locked
---

# Archetype I — raw-input (Native field)

A **labeled native form field**: a label, a tokenized native control, an optional
hint, and an error message, wired together with the accessibility associations a
form field must carry. The second baseline **Component-kind** archetype — a molecule
reused inside forms, dialogs, and toolbars, not a page shape of its own.

Promoted as a fleet synthesis. The `<input\b` scan signal ("raw-input") fires on
the same shape everywhere: a hand-rolled `<label>` + a bare native `<input>` (or
`<textarea>`) + an error `<p>`, each with its own ad-hoc `border rounded px-2 py-1`
chrome and — nearly always — **no accessibility wiring at all**. Every project
re-invents it: controlling-app grew a private `field.tsx` (30 raw-input sites),
my-finance-app and the dashboard hub hand-roll the triad on every field because
they carry no primitive library, and native-only input types with no component
equivalent (a `range` slider in mistra, `date`/`time` pickers in several projects)
sit bare. Rule-of-2 is met many times over. This is the convergence target that
idea should collapse onto.

> **Reference implementation.** This file is the **stack-agnostic contract** —
> every rule names a *role*, not a primitive. The baseline-stack binding (the
> concrete primitive + Tailwind-4 class strings) lives in
> [`raw-input.baseline.md`](./raw-input.baseline.md). A project on a different
> stack adopts this contract without needing that file.

## When to use it (and when not)

- **Use** for a labeled, single-value field whose control is a **native input or
  textarea** — text, number, date/time, password/url/email, a `range` slider, or
  multi-line text. It is the one-stop assembly for the native-only types that have
  no dedicated tokenized control, and for labeled fields in a surface that isn't
  wired to a form library.
- **Do not use** for a boolean (that is the checkbox/switch control's role), for an
  enum choice (the select/combobox control's role), or for a value flush inside a
  data-grid cell (the cell-input control's role). The field assembly is for a
  standalone labeled field, not those specialized controls.
- **Compose, don't replace, a form library.** Where a form-binding role already owns
  value/validation state (a react-hook-form-style context), this molecule is the
  presentational field *inside* it — the binding role stays the owner of value and
  error; this molecule renders them. It is not a second source of truth.

## Component layers

The `component` kind defines eleven layers; only the layers that bear on this
molecule carry a rule. The rest are explicitly N/A.

### L1 — Invocation contract
Rendered as one labeled field within a larger form/dialog/toolbar. Fully
**controlled**: the caller passes the current value and receives the control's raw
value on change. Two invocation shapes, both sanctioned:
- **Standalone** — the owning surface holds the value in local state and renders the
  field directly. This is the shape surfaces without a form library need.
- **Inside a form-binding role** — the field is composed under a form-field binding
  that supplies value + error; the binding stays the owner (see "When to use").

### L2 — State shape
Stateless and presentational. It owns no value and holds no validation state; it
reflects the value and the (optional) error the caller already holds. It generates
one thing internally: a stable control id (used to associate the label and the
hint/error descriptions) when the caller does not supply one.

### L3 — Selection model
N/A — a single-value field, not a collection. Multi-value or option-set selection
is the select/combobox control's concern.

### L4 — Keyboard / focus
The native control keeps its native keyboarding verbatim (a date control's picker,
a range control's arrow-key stepping, a textarea's newline). Activating the label
moves focus to the control. The control is the single tab stop; the label, hint,
and error text are not focusable.

### L5 — Empty / loading states
The empty-value affordance is the control's **placeholder** (text-like and
multi-line controls). There is no loading state — the field is presentational and
renders whatever value it is given. A range control has no empty state; it always
reflects a value within its bounds.

### L6 — Mobile affordance
Fluid — the control is full-width and reflows with its container; no separate mobile
component. Numeric-text fields declare an input mode so touch keyboards show the
right keys; native date/time/range controls defer to the platform's native picker.

### L7 — Theming
Rides the shared field chrome: the standard control border, background, text, and
focus-ring roles, and the destructive role for the error state. No bespoke
border/padding/font-size strings — a hand-rolled class string for any of these is
accidental drift, not variation. A `range` control rides the shared accent role for
its track/thumb rather than a literal color.

### L8 — Render-prop surface
N/A — the control is chosen by a **type knob** (and a multi-line flag), not by a
render prop. A field whose control is outside this molecule's set (a boolean, an
enum, a bespoke widget) is built by composing that dedicated control inside the same
label + hint + error assembly, not by extending this molecule.

### L9 — Error surface
**Owned here.** When the caller supplies an error, the field: renders the message
below the control in the destructive role; marks the control invalid; and associates
the message with the control (see L11). A required field renders a required marker
by the label and sets the control's native required state. The field does not decide
*whether* a value is invalid — that judgment stays with the caller; the field only
presents it.

### L10 — Performance contract
Pure controlled render — no effects, no timers, no internal state beyond the
generated id. Cost is constant per field.

### L11 — Accessibility contract
**Required.** This is the single biggest gap in every hand-rolled fleet copy, and is
non-negotiable in the baseline version:
- The label is **programmatically associated** with the control (not merely placed
  near it).
- On error, the control is marked **invalid**, and the error message is
  **associated** with the control so a screen reader announces it when the control
  is focused.
- A hint, when present, is likewise associated with the control.
- A required field conveys "required" through the native required semantics, not by
  the visual marker alone.
