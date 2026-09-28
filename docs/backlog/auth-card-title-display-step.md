---
area: layout
opened: '2026-09-27'
status: ready
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T09:47:33Z'
value: low
model: opus
model_reason: "requires a scope judgment call (does the display step apply outside archetype headers), not a mechanical class swap"
---

# Decide whether AuthCard's h1 adopts the ADR-0007 display-title step

## Context

`src/components/layout/AuthCard.tsx:47` still renders its `<h1>` as `text-lg font-semibold leading-tight tracking-tight text-foreground` — the exact class PageHeader carried before #309. Since #309, `PageHeader.tsx:113` renders its `<h1>` as `text-display-title font-semibold leading-tight tracking-tight text-foreground` (ADR-0007 §2: `--text-display-title: 30px`, "the single title treatment shared by every archetype header in the baseline"). `AuthCard` is documented (its own JSDoc, `AuthCard.tsx:19-21`) as "NOT a page archetype" — a layout primitive for off-app utility screens (sign-in, not-authorized, 404) rendered *outside* `AppShell`/`PageHeader`. ADR-0007 §2's display step is scoped to "every archetype header," so whether AuthCard's heading is in scope is a real reading question, not a mechanical follow-on to #309. `AuthCard` currently has no test file (`find src -iname "*AuthCard*"` returns only the component itself).

## What to do

- [ ] Add one JSDoc line next to the existing "NOT a page archetype" disclaimer in `src/components/layout/AuthCard.tsx` stating it is deliberately excluded from the ADR-0007 §2 display-title step.

## Acceptance

- The JSDoc line is present next to the "NOT a page archetype" note.
- `AuthCard`'s `<h1>` className is unchanged (`text-lg font-semibold leading-tight tracking-tight text-foreground`).

## Related

- [archive/house-look-page-header-title-step.md](archive/house-look-page-header-title-step.md) — #309, the slice that moved `PageHeader`'s `<h1>` onto the display step
- ADR-0007 — The fleet house look: donor-fixed roles vs brand-overridable roles

## Decision

**Question:** Does ADR-0007 §2's display-title step extend to `AuthCard`'s heading, or is AuthCard's own "NOT a page archetype" scope note a deliberate exclusion?

**Answer:** AuthCard stays on `text-lg`. It's a 384px (`max-w-sm`) off-app card, and a 30px display title would wrap most German headings; ADR-0007 §2 scopes the display step to archetype headers, and AuthCard's own JSDoc already disclaims archetype status.

**Date:** 2026-09-28
