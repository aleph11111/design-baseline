---
key: Fd
slug: field
kind: component
version: 1.0
promoted_from: controlling-app (fleet synthesis; my-finance-app, dashboard, pmo, mistra, hk-crm)
promoted_at: 2026-07-23
source_spec_version: n/a (fleet synthesis — no single source spec)
status: locked
---

# Archetype Fd — field

A **labeled form control** — a label bound to a single input/select/textarea, with
optional helper text and an error message, wired for accessibility. The baseline's
second **Component-kind** archetype: a molecule reused inside dialogs, filters,
settings rows, and ad-hoc forms, not a page shape of its own.

Promoted as a fleet synthesis. Every project hand-rolls a raw `<label>` + control
outside of a form library: controlling-app (15 files), my-finance-app (12),
dashboard (3), mistra (2), hk-crm (2), pmo (2). controlling-app had already
converged on the exact molecule (a `useId`-wired `Field` adopted in 15 files); the
others hand-assemble it fresh, with divergent label classes, inconsistent
required-marker styling, and — near-universally — **no `htmlFor`/`aria` wiring at
all**. Rule-of-2 is met many times over. This is the convergence target that idea
should collapse onto.

> **Reference implementation.** This file is the **stack-agnostic contract** — every
> rule names a *role*, not a primitive. The baseline-stack binding (the concrete
> primitive + Tailwind-4 class strings) lives in
> [`field.baseline.md`](./field.baseline.md). A project on a different stack adopts
> this contract without needing that file.

## When to use it (and when not)

- **Use** for a labeled single control **outside a form-library context** — a
  standalone dialog field, a toolbar/filter control, a settings-row input, an
  ad-hoc `useState` form. It owns the label→control→description→error assembly and
  the accessibility wiring the caller would otherwise repeat by hand.
- **Do not use** inside a form-library field. When a field is driven by a form
  library (react-hook-form et al.), use that library's field-binding role instead
  (in the baseline: the `FormField`/`FormItem` stack) — it owns validation state
  and the same rendering. `Field` is the **library-free twin**, not a competitor:
  the two render identically by contract (see L7).
- **Do not use** for a control that is its own label by DOM nesting — a checkbox or
  radio whose `<label>` wraps the control, or a file **dropzone** whose `<label>`
  wraps a hidden `<input type=file>`. Those are already associated by nesting and
  are correct as raw markup; forcing them through this molecule adds nothing. (The
  fleet's remaining raw `<label>` sites are overwhelmingly this shape.)

## Component layers

The `component` kind defines eleven layers; only the layers that bear on this
molecule carry a rule. The rest are explicitly N/A.

### L1 — Invocation contract
Rendered wherever a labeled control is needed. The caller supplies the label and,
via a render function, the control itself; the molecule injects the wiring the
control needs (an id, and the accessibility relationships to the description and
error). One field wraps exactly one control.

### L2 — State shape
Stateless and presentational. The field owns no value and no validity state — the
caller holds both and passes the current error text in. It starts no timers and
performs no validation.

### L3 — Selection model
N/A — a single control, no selection.

### L4 — Keyboard / focus
The label is programmatically bound to the control, so clicking the label focuses
the control. The molecule adds no focusable elements of its own and is not itself a
tab stop; the control keeps its native focus behavior and focus ring.

### L5 — Empty / loading states
N/A — a field is always present; it has no empty or loading plane of its own.

### L6 — Mobile affordance
Fluid — the field and its control are full-width and reflow with their container in
the default (stacked) orientation. No separate mobile component.

### L7 — Theming
Rides the shared label, helper-text, and destructive-text roles, and the shared
field vertical rhythm. It must render **identically to the form-library field role**
(same spacing, same label/description/error type) so a library-driven field and a
standalone field are visually indistinguishable. No bespoke colors or spacing.

### L8 — Render-prop surface
**Required and central.** The control is supplied by the caller through a render
function, and the molecule passes that function the wiring the control must adopt:
- an **id** for the control (label binds to it),
- a **describedby** relationship pointing at whichever of the description and error
  are present,
- an **invalid** flag, set only when an error is present.

The caller applies these to the control. Two orientation roles are sanctioned:
**stacked** (label above control — the default) and **inline** (label beside the
control, for filter/toolbar rows). Inline is for a bare label+control only.

### L9 — Error surface
An optional error message role. When present: the label and the message take the
destructive text role, the control is marked invalid (L8), and the message is
associated to the control for screen readers (L11). When absent, no invalid state
and no error node are emitted. An optional **required** marker may follow the label
text; it is decorative (not announced) — required-ness for assistive tech rides the
control's own attribute.

### L10 — Performance contract
Pure render, no effects. Cost is a single control plus at most two short text nodes.

### L11 — Accessibility contract
**Required.** This is the single biggest gap in the hand-rolled fleet copies and is
non-negotiable in the baseline version:
- the label is bound to the control (clicking the label focuses it);
- when a description and/or error is present, the control is associated to them so a
  screen reader announces them with the field;
- when an error is present, the control is marked invalid.
A field that renders a visual label with no programmatic binding fails this
contract.
