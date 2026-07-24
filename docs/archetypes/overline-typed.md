---
key: O
slug: overline-typed
kind: component
version: 1.0
promoted_from: fleet synthesis (mistra, hk-crm, my-finance-app, dashboard)
promoted_at: 2026-07-24
source_spec_version: n/a (fleet synthesis — no single source spec)
status: locked
---

# Archetype O — overline-typed (Typed overline)

A **typed overline**: the small, uppercase, letter-spaced "eyebrow / kicker" label that
sits above a heading or section title, with a closed set of semantic **tones** layered
on one shared base signature. The sectional companion to a heading — a molecule reused
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
set.

> **Reference implementation.** This file is the **stack-agnostic contract** — every
> rule names a *role*, not a primitive. The baseline-stack binding (the concrete
> primitive + Tailwind-4 class strings) lives in
> [`overline-typed.baseline.md`](./overline-typed.baseline.md). A project on a different
> stack adopts this contract without needing that file.

## When to use it (and when not)

- **Use** for a short label rendered **above** a heading, section title, card, or nav
  group — a kicker/eyebrow that names the entity class, section, or status ("Season 3",
  "Details", "Now playing"). It is the one-stop assembly for the uppercase-label
  signature, including where the label's color must change by domain state or surface.
- **Do not use** for the heading itself (that is the page/section-title role — the
  overline sits *above* it), for body prose or a normal-case clarifier line (that reads
  as a subtitle, not a label), for a status **pill/badge** (a bounded, filled token — a
  distinct control), or for a **link/tab label** (interactive, not a static eyebrow).
- **Tone is a closed semantic set, not a color prop.** Where a project needs a color the
  set doesn't cover (e.g. an arbitrary per-category palette), that is the one sanctioned
  per-site deviation via the wrapper's class passthrough — not a new tone. A tone outside
  the closed set is drift.

## Component layers

The `component` kind defines eleven layers; only the layers that bear on this molecule
carry a rule. The rest are explicitly N/A.

### L1 — Invocation contract
Rendered as one inline label, standalone, wherever a heading needs a kicker. Fully
presentational: the caller passes the label text as children and, optionally, a tone and
the element to render as. No controlled value, no callbacks.

### L2 — State shape
Stateless and presentational. It owns nothing and generates nothing; it renders the text
it is given in the base signature plus the chosen tone.

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
Rides one shared **base signature** — uppercase, letter-spaced, small, weighted, muted —
that is the single source of the label look; it must not be re-typed per site. On top of
it sits a **closed semantic tone set** that overrides **color only** (never size, weight,
tracking, or case): a muted base, a louder foreground tone, a brand tone, and an inverted
tone for accent-filled surfaces. A bespoke size/weight/tracking string is accidental
drift, not variation. A one-off color the tone set does not cover is the single sanctioned
per-site deviation, applied via the wrapper's class passthrough.

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
- Tone conveys **emphasis, not meaning** — color alone must not be the only carrier of
  information a reader needs (e.g. a status must also be legible from its text, not just
  its tone).
- Case is a **visual** transform; the accessible text is the original, un-uppercased
  string the caller passes.
