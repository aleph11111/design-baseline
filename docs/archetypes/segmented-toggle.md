---
key: Sg
slug: segmented-toggle
kind: component
version: 1.0
promoted_from: brickshop-manager (fleet synthesis; hk-crm vendored the donor primitive)
promoted_at: 2026-07-24
source_spec_version: n/a (fleet synthesis — no single source spec)
status: locked
---

# Archetype Sg — segmented-toggle (Segmented toggle)

A **compact single-choice toggle**: a small bordered track of equal-width pills where
exactly one is active, used to switch a surface between a few mutually-exclusive
modes / filters / views in place (`Table · Cards`; `All · Unread · Mentions`;
`Day · Week · Month`; `List · Grid · Timeline`). A molecule that sits in a toolbar next
to a title or search box — not a page shape, and not primary navigation.

Promoted as a fleet synthesis. The shape was hand-rolled at every call site with drifted
button padding (`px-2` / `px-2.5` / `px-3`) and, usually, no keyboard model — a plain row
of `<button>`s toggling a `bg-primary` class. The donor consolidated it into one owner;
brickshop-manager still carries a bespoke plain-button copy, and hk-crm vendored the donor
primitive verbatim (`design-baseline@… — vendored` stamp). Rule-of-2 is met. This archetype
formalizes the already-consolidated molecule as a documented, gallery-demoed baseline entry
so downstream repos inherit the *contract* (when to reach for it, its keyboard/a11y model)
and not merely a stray component.

> **Reference implementation.** This file is the **stack-agnostic contract** — every rule
> names a *role*, not a primitive. The baseline-stack binding (the concrete primitive +
> Tailwind-4 class strings) lives in
> [`segmented-toggle.baseline.md`](./segmented-toggle.baseline.md). A project on a different
> stack adopts this contract without needing that file.

## When to use it (and when not)

- **Use** for a compact, **in-place** switch among a **small fixed set** of
  mutually-exclusive options (roughly 2–5) that all fit on one line and change what the
  adjacent surface shows *without a navigation* — a view mode, a quick filter, a time
  granularity. Selection is instant and the whole option set stays visible.
- **Do not use** for:
  - **Route-like or many-option navigation** between page sections — that is the
    tab-strip's role (larger hit targets, can overflow/scroll, may drive the URL).
  - **A binary on/off** of a single setting — that is the switch control's role.
  - **Multi-value filtering** (more than one active at once) — that is a pill/chip
    filter bar, not a single-choice toggle.
  - **A labeled form field** whose value is one choice from an option set — that is the
    enum-field molecule ([`raw-select`](./raw-select.md), S): it carries a label, a
    placeholder/empty affordance, and an error state, none of which a mode toggle has.
  - **Triggering actions** (each item *does* something rather than *selecting* a state)
    — that is a button group / action menu.

## Component layers

The `component` kind defines eleven layers; only the layers that bear on this molecule
carry a rule. The rest are explicitly N/A.

### L1 — Invocation contract
Rendered as one compact control inside a toolbar or section header. Fully **controlled**:
the caller passes the current value and receives the chosen option's raw value on change.
The option set is passed in as **data**, not composed as markup children.

### L2 — State shape
Stateless and presentational. It owns no value; it reflects the value the caller holds.
It has no open/closed, no loading, and no error state.

### L3 — Selection model
**Single-value, always-selected.** Exactly one option is active at all times — there is no
empty/unset state (the caller seeds a default value). The value is the active option's raw
value. The option set is an **ordered list** of `{ value, label }` entries, each with an
**optional leading icon**; the label may be text or a small node. Multi-value selection is
out of scope (a distinct control).

### L4 — Keyboard / focus
Follows the **WAI-ARIA radio-group pattern**, not a row of independent tab stops:
- The group is a **single tab stop** (roving tabindex — only the active option is tabbable).
- **Arrow keys** (Left/Right and Up/Down) move selection to the adjacent option and **wrap
  around** at the ends; **Home/End** jump to the first/last option.
- Moving selection **moves focus** with it, so keyboard and screen-reader users land on the
  option they just chose.

### L5 — Empty / loading states
**N/A.** One option is always active; there is no empty, placeholder, or loading state.

### L6 — Mobile affordance
Compact and inline — the control keeps its intrinsic size and sits in the toolbar on all
widths; it does not grow to full width. **Allowed variation:** where the option labels no
longer fit a narrow viewport, a consumer may swap the whole control for a single-select
dropdown of the same options. Icon-only options (label hidden, icon + accessible name
retained) are a sanctioned compaction.

### L7 — Theming
A **bordered track** of equal pills. The active pill carries the **filled accent role**
(accent background + its contrasting foreground); inactive pills use the **muted-foreground
role** with a hover to full foreground. Rides the shared token roles — no bespoke
border/padding/font-size strings. The historical drift this consolidates (per-site
`px-2` / `px-2.5` / `px-3` padding) is accidental, not sanctioned variation.

### L8 — Render-prop surface
**N/A** — the option set is supplied as `{ value, label, icon? }` data, not by a render
prop. A toggle whose items need richer content than a label + leading icon is out of this
molecule's scope.

### L9 — Error surface
**N/A** — a mode toggle has no invalid state; it is always showing a valid selected option.

### L10 — Performance contract
Pure controlled render — no effects, no timers, no internal state. Cost is constant in the
option count.

### L11 — Accessibility contract
**Required.**
- The group exposes the **radiogroup** role and carries an **accessible group label**
  (the toolbar caption it toggles, or an explicit label when there is no visible caption).
- Each option exposes the **radio** role and its **checked** state, so a screen reader
  announces "N of M, selected".
- The keyboard model of L4 is part of this contract, not an enhancement: a plain row of
  buttons where every button is a separate tab stop and arrows do nothing fails it.
