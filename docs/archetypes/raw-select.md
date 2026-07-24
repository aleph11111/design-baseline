---
key: S
slug: raw-select
kind: component
version: 1.0
promoted_from: fleet synthesis (mistra, my-finance-app, dashboard, brickshop-manager, controlling-app)
promoted_at: 2026-07-24
source_spec_version: n/a (fleet synthesis — no single source spec)
status: locked
---

# Archetype S — raw-select (Select field)

A **labeled enum field**: a label, a single-value choice control, an optional hint,
and an error message, wired together with the accessibility associations a form
field must carry. The enum sibling of [`raw-input`](./raw-input.md) (I) and
[`raw-textarea`](./raw-textarea.md) (T) — a molecule reused inside forms, dialogs,
and toolbars, not a page shape of its own.

Promoted as a fleet synthesis. The `raw-select` scan signal fires on the same shape
everywhere: a hand-rolled `<label>` + a bare native `<select>` (or a re-composed
`<Select>` trigger) + an error `<p>`, each with its own ad-hoc `border rounded px-2
py-1` chrome and — nearly always — **no accessibility wiring at all**. Every project
re-invents it: my-finance-app hand-rolls ~34 native `<select>` sites across 12 files
with ~10 divergent class strings; mistra shares a `inputClass` string but leaves each
`<label>` unassociated; controlling-app grew a proper `Field` render-prop wrapper —
but its select fields bypass it; the dashboard hub gets label association right in one
place and drops it in the next. Rule-of-2 is met many times over. This is the
convergence target that shape should collapse onto — and the exact residual the
`raw-label` radar entry flagged when `raw-input` deliberately scoped enum controls out.

> **Reference implementation.** This file is the **stack-agnostic contract** — every
> rule names a *role*, not a primitive. The baseline-stack binding (the concrete
> primitive + Tailwind-4 class strings) lives in
> [`raw-select.baseline.md`](./raw-select.baseline.md). A project on a different stack
> adopts this contract without needing that file.

## When to use it (and when not)

- **Use** for a labeled, single-value field whose value is one **choice from a known
  option set** — a status, a category, a band, a mode. It is the one-stop assembly for
  an enum field, and for a labeled select in a surface that isn't wired to a form
  library.
- **Do not use** for free text or a native-only input type (that is the native-field
  molecule's role — I, `raw-input`), for a boolean (the checkbox/switch control's
  role), for a **multi-value** selection, for a **type-ahead / combobox / async
  search** (a command-palette or autocomplete widget, structurally different), or for a
  choice control sitting **flush inside a data-grid cell** (the cell-select control's
  role — no label, transparent chrome).
- **Compose, don't replace, a form library.** Where a form-binding role already owns
  value/validation state (a react-hook-form-style context), this molecule is the
  presentational field *inside* it — the binding role stays the owner of value and
  error; this molecule renders them. It is not a second source of truth.

## Component layers

The `component` kind defines eleven layers; only the layers that bear on this molecule
carry a rule. The rest are explicitly N/A.

### L1 — Invocation contract
Rendered as one labeled field within a larger form/dialog/toolbar. Fully
**controlled**: the caller passes the current value and receives the chosen option's
raw value on change. Two invocation shapes, both sanctioned:
- **Standalone** — the owning surface holds the value in local state and renders the
  field directly. This is the shape surfaces without a form library need.
- **Inside a form-binding role** — the field is composed under a form-field binding
  that supplies value + error; the binding stays the owner (see "When to use").

### L2 — State shape
Stateless and presentational. It owns no value and holds no validation state; it
reflects the value and the (optional) error the caller already holds. It generates one
thing internally: a stable control id (used to associate the label and the hint/error
descriptions) when the caller does not supply one.

### L3 — Selection model
**Single-value.** Exactly one option is selected at a time; the value is the chosen
option's raw value. The option set is supplied as **data** — an ordered list of
`{ value, label }` pairs (an option may be individually disabled) — not as markup the
caller re-hand-builds at each site. Multi-value or option-set selection is out of scope
(a distinct control).

### L4 — Keyboard / focus
The choice control keeps its native/library keyboarding verbatim (open on
Enter/Space/Arrow, type-ahead within the open list, Escape to close, arrow-key
traversal). Activating the label moves focus to the control. The control is the single
tab stop; the label, hint, and error text are not focusable.

### L5 — Empty / loading states
The empty-value affordance is a **placeholder** shown when no option is selected. There
is no loading state — the field is presentational and renders whatever value + options
it is given. An explicit "none" choice, when the domain allows one, is modeled as a
real option in the set with its own value, not as a magic empty sentinel invented per
call site.

### L6 — Mobile affordance
Fluid — the control is full-width and reflows with its container; no separate mobile
component. The control defers to the platform's native option-picking affordance on
touch.

### L7 — Theming
Rides the shared field chrome: the standard control border, background, text, and
focus-ring roles, and the destructive role for the error state. No bespoke
border/padding/font-size strings — a hand-rolled class string for any of these is
accidental drift, not variation. A width override on the wrapper/control is the one
sanctioned per-site deviation.

### L8 — Render-prop surface
N/A — the option set is supplied as `{ value, label }` data, not by a render prop. A
field whose control is outside this molecule's set (free text, a boolean, a combobox)
is built by composing that dedicated control inside the same label + hint + error
assembly, not by extending this molecule.

### L9 — Error surface
**Owned here.** When the caller supplies an error, the field: renders the message below
the control in the destructive role; marks the control invalid; and associates the
message with the control (see L11). A required field renders a required marker by the
label and conveys "required" through the control's semantics. The field does not decide
*whether* a value is invalid — that judgment stays with the caller; the field only
presents it.

### L10 — Performance contract
Pure controlled render — no effects, no timers, no internal state beyond the generated
id. Cost is constant per field.

### L11 — Accessibility contract
**Required.** This is the single biggest gap in every hand-rolled fleet copy, and is
non-negotiable in the baseline version:
- The label is **programmatically associated** with the control (not merely placed near
  it).
- On error, the control is marked **invalid**, and the error message is **associated**
  with the control so a screen reader announces it when the control is focused.
- A hint, when present, is likewise associated with the control.
- A required field conveys "required" through the control's semantics, not by the visual
  marker alone.
