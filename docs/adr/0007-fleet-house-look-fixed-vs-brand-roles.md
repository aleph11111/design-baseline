# 0007 — The fleet house look: donor-fixed roles vs brand-overridable roles

- **Status:** Accepted
- **Date:** 2026-09-27
- **Extends:** [ADR 0004](0004-appearance-locality-derived-vs-inherited.md) (appearance locality) — this ADR fills the *token* and *fixed in the component* tiers with an actual look.

## Context

The 2026-09-27 visual audit of controlling-app, mistra and hk-crm (mockup canvas https://claude.ai/artifact/WTzamiq9fWH9RDM136njKG, rows 1–3) found the three apps consistent with each other but flat: the default shadcn look, small type on an unbounded full-width canvas, no focal point, card-in-card borders, no brand accent, and status pills louder than the content they annotate.

The root cause is in the donor, not the consumers. The tokens split ([tokens-brand-font-seam-and-split-guard](../backlog/archive/tokens-brand-font-seam-and-split-guard.md)) gave the donor a layer it owns (`src/styles/tokens.layer.css`) and a brand file the project owns (`src/styles/tokens.css`), but the donor used its layer only to *map* roles, never to *hold an opinion*. It declares what a project may override and says nothing about scale, width, surfaces, or where the accent goes. So every consumer inherits the same neutral defaults (ADR 0004's "a look nobody chose"), and roles that should be shared drift per app because the only place they can be declared is the brand file:

- mistra's `--ring` is blue on a teal `--primary`;
- controlling-app's dark `--primary` falls back to the donor's near-white slate, so dark mode loses the brand;
- there is no chart palette at all — mistra, hk-crm and controlling-app each invent their own `--chart-*` order, and controlling-app hardcodes hex in recharts.

Per ADR 0004 these are global or fixed-in-component appearance, never per-call-site props, so the decision belongs to the donor.

## Decision

**The donor owns a house look.** Every role below is classified as **fixed** — donor-owned, declared in `tokens.layer.css` or inside a `src/components/layout/` / `ui/` component, not overridable by a project — or **brand-overridable** — declared in the project's `tokens.css`. A role not listed here keeps its current classification (brand-overridable HSL value in `tokens.css`, role mapping in the layer).

**How "not overridable" is made mechanical.** A fixed role is fixed by *wiring*, not by convention: the layer's `@theme` maps the Tailwind colour straight to the source it follows (e.g. `--color-ring: hsl(var(--primary))`), so a brand-file `--ring` declaration is dead — nothing reads it. Where a fixed role needs its own per-theme value, the layer declares it under a donor-reserved `--db-` prefix in its own `:root` / `.dark` block. A brand file declaring a retired role (`--ring`, `--sidebar-primary`, `--sidebar-ring`, `--chart-*`) or any `--db-*` variable is a conformance hit for the adoption-quality scan (ADR 0005), not a silent win.

### 1. Content width and page rhythm — fixed

- **Content column: 1180px max, centred** in `AppShell`'s `<main>`. Layer token `--db-content-max: 1180px` (fixed). On a wide desk it widens in two fixed steps (see the Amendment 2026-09-29 section).
- **Page padding: 48px from `md`, 56px from `xl`; 16px below `md`.** Still owned once by `AppShell`'s `<main>` (the one-owner inset rule in `docs/STYLE.md` stands; only the values change from `p-4 md:p-6`).
- **Full-bleed is a property of the archetype, not the call site.** The page archetypes whose content is a working surface rather than a reading column — `matrix-grid`, `list-with-detail`, `kanban-board`, `calendar` — render full-bleed; every other page archetype sits in the column. This is a closed, enumerated set keyed by archetype (derived, per ADR 0004), not a width prop.

### 2. Display type step — fixed

Two display sizes join the Plex Ledger scale as layer `@theme` tokens: **`--text-display-title: 30px`** (the page `<h1>`) and **`--text-display-stat: 34px`** (a headline number). `PageHeader`'s `<h1>` moves off `text-lg` onto the title step; `StatTile`'s value moves off `text-2xl` onto the stat step. The rest of the ledger scale (overlines, `NestedPageHeading`, body) stays tight — the display step is the focal point, and it works *because* everything else stays small. `docs/STYLE.md`'s "page title `text-lg`" line is rewritten by the slice that ships the change.

### 3. Surface elevation — fixed

Three steps, in a fixed order: **sunken** (sidebar) < **canvas** (page background) < **raised** (cards, tiles, popovers). Separation comes from tone, not borders: a raised surface directly on the canvas carries no border, and a raised surface nested inside another raised surface carries neither border nor its own fill (no card-in-card). The layer derives all three steps from the brand's `--background` / `--foreground` with fixed per-theme `color-mix` percentages under `--db-surface-*`, so the ordering holds under any brand palette; the shells (`AppShell`, `Sidebar`, `SectionCard`, `StatTileRow`) read the surface roles. The mockup's tones are the starting percentages; the slice tunes them.

### 4. Accent usage — brand-overridable value, fixed placement

- **One brand accent: `--primary`** (brand-overridable, light and dark).
- **Placement is fixed:** primary action, active nav item, progress/selection indicators, and `--chart-1`. Nowhere else — not headings, not borders, not decoration.
- **`--ring` follows the accent (fixed):** `--color-ring: hsl(var(--primary))`. Same for `--color-sidebar-primary` and `--color-sidebar-ring`. The brand-file `--ring`, `--sidebar-primary`, `--sidebar-ring` declarations are retired. This makes mistra's blue ring on teal impossible once adopted.
- **Dark-mode `--primary` follows the brand accent:** it stays brand-overridable (a dark theme needs its own lightness), but must share the light `--primary`'s hue (±10°) and stay chromatic (saturation ≥ 30%). The adoption-quality scan checks the two `--primary` triplets in `tokens.css`. Controlling-app's slate dark primary fails both conditions and is non-conformant once adopted.
- shadcn's `--accent` is the neutral hover tone, not the brand accent; it stays brand-overridable and unchanged.

### 5. Status pills — fixed look, brand-overridable values

Status renders as a **quiet tinted chip** on the existing `--status-*-bg` / `--status-*-fg` tier — the donor `Badge` status variants already do this. Solid status fills (`bg-success`, `bg-destructive` as a chip) are non-conformant for status; the solid roles stay for filled *actions* and alerts. The chip's size and weight are fixed in `Badge` (small, medium weight — quieter than the row's primary text). The tier's HSL values stay brand-overridable.

### 6. `StatTile` context line — fixed

A KPI value never stands alone: `StatTile` renders a **context line** under the value (comparison, period, or delta — e.g. "+4% vs last quarter"). The existing `hint` prop is that line; its typography and placement are fixed in the component. Whether a given tile *has* context is data, not appearance, so the prop stays optional.

### 7. Empty state — fixed

An empty state offers **exactly one next-step action**. `StateView`'s `empty` variant is the one primitive for it (no new component); its `action` slot is the single next step, and archetype empty states route through it. Two actions, or an empty state with prose and no action where an action exists, is non-conformant.

### 8. Chart palette — fixed

`--chart-1` … `--chart-6` are layer roles with a **fixed series order**: `--chart-1` is the brand accent (`--color-chart-1: hsl(var(--primary))`); `--chart-2` … `--chart-6` are donor-fixed hues declared under `--db-chart-*` for both themes. A project does not reorder or re-value them; a chart library reads the CSS variables, never hex. controlling-app's hardcoded recharts hex is non-conformant.

### Classification table

| Role | Class | Where |
|---|---|---|
| content max width (`--db-content-max`) | fixed | layer + `AppShell` |
| page padding | fixed | `AppShell` `<main>` |
| full-bleed archetype set | fixed | archetype shells |
| `--text-display-title`, `--text-display-stat` | fixed | layer `@theme` |
| `PageHeader` title step, `StatTile` value step | fixed | component |
| surface steps (`--db-surface-sunken/canvas/raised`) | fixed (derived) | layer |
| border-vs-tone separation, no card-in-card | fixed | component |
| `--background`, `--foreground` | brand-overridable | `tokens.css` |
| `--primary` (light + dark) | brand-overridable (dark: hue-constrained) | `tokens.css` |
| accent placement | fixed | components |
| `--ring`, `--sidebar-primary`, `--sidebar-ring` | fixed (follow `--primary`) | layer `@theme` |
| `--accent` (neutral hover) | brand-overridable | `tokens.css` |
| status chip look (size, weight, tint) | fixed | `Badge` |
| `--status-*-bg` / `--status-*-fg` values | brand-overridable | `tokens.css` |
| `StatTile` context line | fixed | `StatTile` |
| empty-state single action | fixed | `StateView` |
| `--chart-1` | fixed (follows `--primary`) | layer `@theme` |
| `--chart-2` … `--chart-6` and series order | fixed | layer |

## Consequences

- **Implementation is five donor slices**, each its own backlog ticket: tokens-layer roles (ring/sidebar/surface/width/display tokens + `AppShell` rhythm + the scan's conformance checks), the `PageHeader` title step, the `StatTile` context line, the `StateView` empty-state rule, and the chart palette. No code ships under this ADR.
- **The donor's own defaults must conform**: the default `tokens.css` dark `--primary` is near-white slate today; the tokens slice gives the donor a same-hue dark primary so the gallery demonstrates the rule.
- **Adoption blockers — no donor change reaches the fleet until each consumer adopts:**
  - consumers are pinned behind the donor: hk-crm at `v0.2.2`, controlling-app and mistra at `v0.2.3`, against donor `0.2.7`;
  - all three keep local copies of `components/layout/` (`PageHeader`, `AppShell`) instead of importing the package, so even a tag bump leaves their shell untouched. mistra's cutover is tracked by [mistra-package-install-cutover](../backlog/mistra-package-install-cutover.md).
- **Rollout happens from each consumer's own session**, not from the donor: bump the tag, delete the vendored layout copies, drop the retired brand roles from `tokens.css`, fix the dark `--primary` hue, and replace hardcoded chart colours. Until then the scan reports each app's non-conformance.
- Least-sure calls, flagged for review: binding `--chart-1` to the brand accent (a brand hue close to a fixed `--chart-2..6` hue would collide — the chart slice must check contrast against the donor hues), and deriving surfaces from `--background`/`--foreground` rather than trusting brand `--card`/`--sidebar-background` (safer ordering, but those two brand roles stop reaching the shells).

## Amendment 2026-09-29 — wide-desk steps for the content column

A single 1180px cap left a 1920 window with ~370px of empty desk and a 2560–3440 window with 1000px+, which is the fleet's real hardware (27" and 34" ultrawide monitors next to 14" laptops). The column now widens in **two fixed steps**, still donor-owned and still not a page or call-site choice:

| `<main>` content box | column max |
|---|---|
| < 1552px | 1180px |
| ≥ 1552px (a 1920 window) | 1440px |
| ≥ 1792px (a 2560 window and up) | 1680px |

- **Keyed to the desk, not the viewport.** `AppShell`'s `<main>` is a size container (`db-desk`), and the layer redefines `--db-content-max` on the column (`.db-content-column`) per container width. A collapsed sidebar is room the column can use; a viewport media query could not see it.
- **The step rule:** a step applies once the desk holds it plus a 56px gutter each side (step + 112px), so the column never widens straight into the desk edge.
- **1680px is the ceiling.** Past it, dashboard card rows and detail sections stretch thinner than they read; the four full-bleed working surfaces are unaffected and still take the whole desk.
