---
key: E
slug: entity-circle
kind: component
version: 1.1
promoted_from: fleet synthesis (brickshop-manager, mistra)
promoted_at: 2026-07-24
source_spec_version: n/a (fleet synthesis — no single source spec)
status: locked
---

# Archetype E — entity-circle

A **circular avatar that represents a named entity** — a person, contact, or
account rendered as a round holder showing a headshot when one exists and
**initials derived from the entity's name** when it does not. A Component-kind
archetype: a molecule reused across page archetypes (feed rows, detail headers,
personnel lists, the app-shell account menu), not a page shape of its own.

Promoted as a fleet synthesis. Two projects hand-roll it independently:
brickshop-manager's signed-in-user avatar (initials from the account name, fixed
brand fill) and mistra's speaker roster (initials from a speaker label, a tinted
circle). Both re-derive the initials inline and neither associates an accessible
name with the circle. Rule-of-2 is met, so the shape is formalized here as the
convergence target. Three other fleet repos surface *near-misses* that are
deliberately **out of scope** (see "When to use it").

> **Reference implementation.** This file is the **stack-agnostic contract** —
> every rule names a *role*, not a primitive. The baseline-stack binding (the
> concrete primitive + Tailwind-4 class strings) lives in
> [`entity-circle.baseline.md`](./entity-circle.baseline.md). A project on a
> different stack adopts this contract without needing that file.

## When to use it (and when not)

- **Use** to represent a **named entity** as a circle: a person in a roster or
  feed row, an assignee, a contact, the signed-in user in the account menu. The
  distinguishing job is *name → initials* with an optional image on top.
- **Do not use** for:
  - an **icon holder** — a round holder for a leading glyph or a pre-computed
    label you pass in yourself is the sibling `IconAvatar` role, not this one.
  - a **numbered step indicator** (wizard step circle) — a different molecule.
  - a **status / category dot** — a small solid `rounded-full` swatch carrying a
    priority/tag/status color is a status indicator, not an entity avatar.
  - **per-entity hue variety** — see L7; the baseline does not hash a name to a
    color, and a multi-hue palette is a project-local extension, not this shape.

## Component layers

The `component` kind defines eleven layers; only the layers that bear on this
molecule carry a rule. The rest are explicitly N/A.

### L1 — Invocation contract
Rendered wherever a named entity appears as a circle. It takes the entity's
**display name** (required) and an **optional image source**. It renders the
image when present and legible, and the name-derived initials otherwise. It owns
no data fetching — the caller supplies name and image URL.

### L2 — State shape
Stateless and presentational. The only internal state is the image's own
load/error transition (image shown → initials shown on failure), owned by the
underlying avatar role, not by the caller.

### L3 — Selection model
N/A — not interactive on its own. A caller may wrap it in a link or button
(account menu trigger), but the circle itself is not a control.

### L4 — Keyboard / focus
N/A — contains no focusable elements and is not a tab stop. Focus belongs to any
interactive wrapper the caller adds.

### L5 — Empty / loading states
- **Missing image** → the initials fallback is the resting state, not an error
  state. An entity with no headshot is the common case.
- **Empty name** → the initials role degrades to a single neutral placeholder
  glyph rather than rendering blank.
- Initials are **derived**, not passed: split the name on whitespace/word
  separators; a single token yields its first two characters, a multi-token name
  yields the first character of the first and last token; uppercased. This rule
  is fixed so the same name yields the same initials everywhere.

### L6 — Mobile affordance
Fluid — a fixed-size circle that reflows with its row. No separate mobile
component. Size is chosen by the caller from a small discrete scale (L7), not by
the viewport.

### L7 — Theming
Rides the shared token set. The initials fill is one of the **sanctioned tones**:
a neutral tone (default) and a brand tone. It carries **no bespoke colors**.

**Tone is keyed to the entity's identity role, not chosen per call site.** The
brand tone is reserved for the entity that *is* the app's identity — the
signed-in user rendered in the account/identity context — and the neutral tone
is every other entity: a roster member, an assignee, a contact, a speaker. Two
engineers holding the same entity derive the same tone: the entity they render
is either the signed-in identity or it is not. The brand tone exists because a
fleet project (the app's own account menu) renders the signed-in user with the
brand fill, while the same shape in a roster is neutral — the choice follows the
entity's role, not the page's taste. A page that wants its *whole* roster in the
brand tone has a different problem (a per-project categorical decision) that the
component's class passthrough or a local fork answers, not this prop.

**Per-entity hue variety is intentionally excluded.** Two fleet repos color the
circle from a multi-hue palette *indexed by list position* — which both (a) uses
off-token literal colors and (b) is a latent bug: the same entity recolors when
the list reorders. A correct version would hash the *name/id* to a stable color,
but the baseline token set has no categorical hue palette to hash across (its
non-semantic tones are near-identical greys, and its semantic tones —
success/warning/destructive — carry meaning a person's avatar must not imply).
Restoring hue variety therefore requires a net-new theme-aware categorical token
set; until that exists as its own change, a project that needs it extends the
primitive locally. The baseline conforms the circle to the neutral/brand look.

### L8 — Render-prop surface
N/A — the content is driven by `name`/`src`, not a render prop. A caller needing
bespoke inner content composes the underlying avatar role directly.

### L9 — Error surface
N/A as a distinct plane — an image that fails to load is not an error, it is the
initials fallback (L5). The molecule surfaces no error state of its own.

### L10 — Performance contract
Pure render, no effects, no timers. Cost is constant per instance; a roster of N
avatars is linear in N with no shared work.

### L11 — Accessibility contract
**Required.** The circle exposes the **entity's name as its accessible name** —
via the image's alt text when the image renders, and via an equivalent label on
the initials fallback otherwise. Raw initials or a bare decorative circle (the
gap in every hand-rolled fleet copy) are **not** an acceptable accessible name: a
screen reader must announce "Miles Davis", never "MD". When the circle is purely
decorative and the name is already adjacent in the DOM, the caller may instead
mark it `aria-hidden` — but silent, unlabeled initials are non-conforming.
