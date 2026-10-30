---
key: Cb
slug: raw-combobox
kind: component
version: 1.0
promoted_from: fleet synthesis (controlling-app, my-finance-app, hk-crm)
promoted_at: 2026-10-30
source_spec_version: n/a (fleet synthesis — no single source spec)
status: locked
---

# Archetype Cb — raw-combobox (Combobox field)

A **labeled searchable single-select**: a label, a trigger showing the current
choice, a popover list the user narrows by typing, an optional hint, and an error
message — wired with the combobox/listbox semantics a searchable picker must carry.
The searchable sibling of [`raw-select`](./raw-select.md) (S): same field frame,
same value-in / raw-value-out contract, for option sets too long to scan.

Promoted as a fleet synthesis. Each project that needed a searchable picker built
its own: controlling-app's account picker keeps its own open, search and highlight
state, swaps its trigger for a text box, filters the options itself and
re-implements arrow / Enter / Escape — with no combobox or listbox semantics at all;
my-finance-app's category picker wraps the raw command-list library in its own
open + search state and outside-click listener; hk-crm grew a local combobox shell
and a company-picker field on top of it. Rule-of-2 is met; the donor already shipped
the popover and command-list atoms but no field composing them, and the promotion
radar had filed the shape as a sanctioned one-off. This is the convergence target.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/raw-combobox`; the prop surface is the API and the sandbox demo (`src/examples/raw-combobox-demo.tsx`) is the gallery reference.

## When to use it (and when not)

- **Use** for a labeled, single-value field whose value is one **choice from a set
  too long to scan** — an account, a category tree, a person, a location — and for
  any option set fetched per query from a server.
- **Do not use** for a short known option set (that is the enum field — S,
  `raw-select`), for free text or values the user may invent (a creatable /
  free-entry field is a distinct control), for a **multi-value** selection, or for a
  **command palette** (a global action launcher, not a form field).
- **Compose, don't replace, a form library.** As with S: under a form-binding role
  that owns value and error, this molecule is the presentational field inside it.

## Component layers

The `component` kind defines eleven layers; only the layers that bear on this
molecule carry a rule. The rest are explicitly N/A.

### L1 — Invocation contract
Rendered as one labeled field within a form, dialog or filter surface. The label
always **stacks above** the trigger (a toolbar-band joined label is out of scope for
v1). Fully **controlled**: the caller passes the current value and receives the
chosen option's raw value on change. Same two invocation shapes as S — standalone
with local state, or inside a form-binding role.

### L2 — State shape
The field owns only ephemeral interaction state: whether the list is open and the
current query (reset when the list closes). It owns no value and no validation
state. It generates a stable control id when the caller supplies none. In async mode
it remembers the last chosen option so the trigger keeps its label after the result
set moves on.

### L3 — Selection model
**Single-value.** The option set is supplied as **data** — an ordered list of
`{ value, label }` pairs, each optionally carrying a group heading, extra search
keywords (e.g. a code beside a name), and a disabled flag. Groups render in order of
first appearance. Two filtering modes:
- **Local** (default) — typing narrows the list on each option's label and keywords.
- **Async** — the caller takes every query through a search callback, fetches, and
  passes the matching options back; local filtering is off. A loading flag shows a
  status line while the caller fetches.

### L4 — Keyboard / focus
The trigger is the single tab stop; Enter / Space / click opens the list with focus
in its search box. Typing filters; Arrow Up / Down move the highlight; Enter selects
the highlighted option and closes; Escape closes without changing the value and
returns focus to the trigger. Activating the label does not open the list.

### L5 — Empty / loading states
No selection shows a **placeholder** on the trigger. A query that matches nothing
shows a "no results" line; while an async fetch runs, a loading status line replaces
it. An explicit "none" choice, when the domain allows one, is a real option — not a
magic sentinel.

### L6 — Mobile affordance
Fluid — the trigger is full-width and the popover matches the trigger's width (with
a readable minimum). No separate mobile component.

### L7 — Theming
The trigger rides the **same chrome as the enum field's trigger** (border,
background, control-height step, focus ring) and the destructive role for the error
state; the list rides the shared popover and command-list chrome. No per-call-site
look props (ADR-0004); a width override on the wrapper is the one sanctioned
per-site deviation.

### L8 — Render-prop surface
N/A — options are `{ value, label }` data. Rich option rows (icons, secondary text)
are not in v1; a site that needs them files a ticket rather than forking the field.

### L9 — Error surface
**Owned here**, exactly as S: the error renders below in the destructive role, marks
the trigger invalid and is associated with it; a hint co-renders and is associated
too; required shows the marker and conveys "required" through the trigger's
semantics. Whether a value is invalid stays the caller's judgment.

### L10 — Performance contract
Local filtering runs over the full option set per keystroke — fine for hundreds of
options. Beyond that, use the async mode and let the server narrow the set.

### L11 — Accessibility contract
**Required**, non-negotiable in the baseline version:
- The trigger has the **combobox** role, reports **expanded / collapsed**, and while
  open **controls** the option list, which has the **listbox** role (options carry
  the option role and the highlighted one is the active descendant of the search box).
- The label is **programmatically associated** with the trigger; hint and error are
  associated descriptions; error marks the trigger invalid.
- Group headings are associated with their options.

## Rollout

Consumer migrations, filed as tickets in each consumer once the package version
carrying this archetype ships:

1. **controlling-app — account picker** (`frontend/src/components/ui/combobox.tsx`,
   `AccountCombobox`): replace with this field; the account code moves into
   `keywords`, the account class into `group`.
2. **controlling-app — account-number free-text input** in
   `PlanAnnahmenDialog.tsx`: replace with this field over the account list.
3. my-finance-app `CategoryCombobox` and hk-crm's local combobox shell — migrate on
   their next design-baseline tag bump.

The `hand-rolled-combobox` adherence rule (`docs/PACKAGE.md`, gate 2) flags the
local-state shape at `warn`; it flips to `error` once the fleet is clean (ADR-0003).
