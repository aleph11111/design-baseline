---
key: O
slug: overline-typed
kind: component
version: 2.0
promoted_from: fleet synthesis (mistra, hk-crm, my-finance-app, dashboard)
promoted_at: 2026-07-24
source_spec_version: n/a (fleet synthesis — no single source spec)
status: locked
---

# Archetype O — overline-typed (Typed overline)

A **typed overline**: the small, uppercase, letter-spaced "eyebrow / kicker" label that
sits above a heading or section title, on one shared base signature whose color — like
its size, weight, tracking, and case — is fixed in the molecule (L7, v2 retired the
per-call-site tone set this name was promoted with). The sectional companion to a heading — a molecule reused
above page-headers, section titles, card kickers, and nav-group labels, not a page shape
of its own.

Promoted as a fleet synthesis. The `overline-typed` scan signal fires on the same shape
everywhere: `uppercase` + `tracking-*` + a small size + a muted color, rendered above a
title. Every project re-invents it — and two projects prove the *typed* need on top of
the base: mistra and hk-crm each keep a copy of a shared overline class string (already
drifted between them); my-finance-app hand-types the class inline across ~5 sites **and
recolors it per category** through a domain color map; the dashboard hub inlines a muted
variant at ~7 sites with no abstraction. The base look never varies; what varies is the
color, keyed off domain state or surface. This is the convergence target that shape
should collapse onto: one primitive owning the base signature + a closed semantic tone
set. (See L7 — v2 retired that tone set as an appearance axis the contract could not
derive, and keeps the base signature plus two documented channels instead.)

> **Reference implementation.** This file is the **stack-agnostic contract** — every
> rule names a *role*, not a primitive. The baseline-stack binding (the concrete
> primitive + Tailwind-4 class strings) lives in
> [`overline-typed.baseline.md`](./overline-typed.baseline.md). A project on a different
> stack adopts this contract without needing that file.

## When to use it (and when not)

- **Use** for a short label rendered **above** a heading, section title, card, or nav
  group — a kicker/eyebrow that names the entity class, section, or status ("Season 3",
  "Details", "Now playing"). It is the one-stop assembly for the uppercase-label
  signature, including where the label's color must change on an accent-filled surface.
- **Do not use** for the heading itself (that is the page/section-title role — the
  overline sits *above* it), for body prose or a normal-case clarifier line (that reads
  as a subtitle, not a label), for a status **pill/badge** (a bounded, filled token — a
  distinct control), or for a **link/tab label** (interactive, not a static eyebrow).
- **Color is fixed in the molecule except for one documented one-off.** The base
  signature carries the color; the only per-site color deviation is a one-off color the
  signature does not cover (e.g. an arbitrary per-category palette), applied via the
  wrapper's class passthrough (documented leaf exemption — see L7). Everything else —
  a *set* of recolors keyed to domain state — is drift: it belongs to a badge or a
  local fork, not to this label.

## Component layers

The `component` kind defines eleven layers; only the layers that bear on this molecule
carry a rule. The rest are explicitly N/A.

### L1 — Invocation contract
Rendered as one inline label, standalone, wherever a heading needs a kicker. Fully
presentational: the caller passes the label text as children and, optionally, the
element to render as. No controlled value, no callbacks. There is no color prop (L7);
the label renders in the base signature's color, except via the two sanctioned
channels a surface contract or the one-off class passthrough provides.

### L2 — State shape
Stateless and presentational. It owns nothing and generates nothing; it renders the text
it is given in the base signature — which includes the color (L7).

### L3 — Selection model
N/A — the overline is not a choice control.

### L4 — Keyboard / focus
N/A — a static label is not focusable and is not a tab stop. If the label must be
interactive it is a link/tab/button, not this molecule.

### L5 — Empty / loading states
N/A — the label renders whatever text it is given; an absent overline is simply not
rendered by the caller (no placeholder, no loading state).

### L6 — Mobile affordance
Fluid — the label reflows with its container; no separate mobile component. The signature
(size, tracking, case) is identical across breakpoints.

### L7 — Theming
Rides one shared **base signature** — uppercase, letter-spaced, small, weighted, **muted** —
that is the single source of the label look, including its color; it must not be re-typed
per site. A bespoke size/weight/tracking string is accidental drift, not variation.

**The color is part of the fixed signature. There is no per-call-site color prop on this
molecule (v2).** The tone set this archetype promoted with could not survive its own
discriminator: the label's role is emphasis — a kicker above a title carries no meaning,
and emphasis is a per-page judgement, not a value derivable from the entity or its data.
A closed set of recolors behind a backwards-compatible default is a design space two
projects fill differently, and that is the inherited-default defect this roadmap retires;
the contract never carried a keying rule that would have made the value derivable.
Retiring it is a breaking change on a prop the fleet never consumed — no fleet copy took
the primitive with its tone set — so the cost is paid once here, not per project later
(ADR 0004 amendment, 2026-09-06: a `kind: "component"` archetype is governed prop-by-prop
with the same derived-vs-inherited test the page shells face; it is not a leaf the way a
vendored UI primitive is, because it ships).

Two sanctioned channels remain:

- **Accent-filled surface** — where the page sits a label on a filled (accent, brand,
  or status) surface, the neutral base color must not vanish. That is the project's
  **context layer**, not this molecule's: the surface's own contract carries the label
  recolor (e.g. the solid-header fill is a closed project context set once at the app
  shell, and its binding recolors the surface's labels). A label outside any such
  surface stays in the base color.
- **One-off color** — where a *single* site needs a color the base signature does not
  cover (e.g. an arbitrary per-category color at one card), the call site passes it via
  the wrapper's class passthrough. This is a **documented leaf exemption from the
  shell-class-name ban** — that ban scopes to `*Shell`/`*Sheet` page and overlay
  wrappers, where `className` is an unenumerable superset escape hatch over a whole
  page. On a leaf label it degrades to a one-class one-color escape, which the
  passthrough makes visible at the call site and the `text-*` class shape keeps auditable.
  It is not a contradiction of the ban (different scope) and not a second meaning of it
  (different channel): a closed *set* of per-category recolors is still drift — that
  belongs to a badge or a local fork, never to this label's deviation channel.

### L8 — Render-prop surface
N/A — the label content is passed as children, not by a render prop. The element it
renders as is selectable (a label above a heading may be a non-heading element, or may
itself be the section `h2`/`h3`), but the content is plain children.

### L9 — Error surface
N/A — a label carries no validation and surfaces no error.

### L10 — Performance contract
Pure render — no effects, no timers, no state. Cost is constant per label.

### L11 — Accessibility contract
- The overline is a **label above** a heading, not a replacement for it — a page/section
  must still carry a real heading; the overline does not stand in for one.
- When the overline **is** the semantic section heading, it renders as the heading element
  (an `h2`/`h3`) rather than a generic element, so the document outline stays correct.
- The label conveys **emphasis, not meaning** — color alone must not be the only carrier
  of information a reader needs (e.g. a status must also be legible from its text, not
  just its color; the one-off-class channel recolors emphasis only, so a status label
  recolors to a brand color but never to a status color by implication).
- Case is a **visual** transform; the accessible text is the original, un-uppercased
  string the caller passes.
