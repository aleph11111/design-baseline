---
slug: import-wizard
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/import-wizard.md
---

# Import wizard — baseline reference implementation

> The stack-specific binding of the [import-wizard contract](./import-wizard.md)
> to the **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell).
> Each role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

- `<WizardShell steps current onBack onNext onCommit canProceed busy kicker title
  headerFill>` — the flow shell: when `title` is set, the shell adopts the Plex
  Ledger board form — an on-surface `<SurfaceHeader>` (kicker + title; no
  `headerActions` prop — the wizard's nav actions always stay in the footer, not
  the header) atop one bounded card, over a `<WizardStepper>`, the current step's
  body in a `<SectionCard>`, and a footer that shows **Back** + **Next**, swapping
  Next for a single **Commit** on the last step. Flow state is **consumer-owned**
  (the consumer holds `current` and per-step data); the shell renders chrome and
  emits navigation intents.
- `<WizardStepper steps current>` — the read-only step indicator (done = check,
  active = ringed, upcoming = muted). Navigation is via the footer, not by
  clicking steps.
- **Reused:** `<SectionCard>` (step body surface).

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each
contract role. Only layers with a baseline-specific binding appear.

### Layer 2 — Page shell
- Top-level app shell → `<AppShell>`; its `<main>` supplies the page inset, the
  page adds none.
- Render-error boundary → `<ErrorBoundary>`.

### Layer 3 — Page header
- On-surface header bar → `<SurfaceHeader>` — the Plex Ledger board form (kicker +
  title; no `headerActions` prop on `<WizardShell>`; no subtitle slot).
- Canonical page-header treatment (not used by the wizard) → `<PageHeader>`
  (detached, floating above the surface).

### Layer 4 — Toolbar / history toggle
- Tab strip → `Tabs`.

### Layer 5 — The step flow
- Content-shell primitive → `<WizardShell steps current onBack onNext onCommit
  canProceed busy kicker title headerFill>`.
- Step-progress primitive → `<WizardStepper steps current>` (done = check, active
  = ringed, upcoming = muted).
- Step body surface → `<SectionCard>`.

## Acceptance gate (baseline tells)
- Wizard shell → `<WizardShell>` (steps + current-step body + footer nav) —
  hand-rolled conditionals with bespoke progress UI fail "one wizard shell owns
  the step model".
- Step-progress primitive → `ProgressTracker`-class component, `<WizardStepper
  steps current>` (one current marker, done/pending states — not numbered
  `<div>`s).
