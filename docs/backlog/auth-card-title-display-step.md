---
area: layout
opened: '2026-09-27'
status: needs-enrichment
gate:
  score: 4
  passed: [title, context, what-to-do, related]
  failed:
    - open_question: "ADR-0007 §2 scope decision for AuthCard is unresolved — capped at 4"
  graded_at: '2026-09-27T00:00:00Z'
value: normal
model: opus
model_reason: "requires a scope judgment call (does the display step apply outside archetype headers), not a mechanical class swap"
---

# Decide whether AuthCard's h1 adopts the ADR-0007 display-title step

## Context

`src/components/layout/AuthCard.tsx:47` still renders its `<h1>` as `text-lg font-semibold leading-tight tracking-tight text-foreground` — the exact class PageHeader carried before #309. Since #309, `PageHeader.tsx:113` renders its `<h1>` as `text-display-title font-semibold leading-tight tracking-tight text-foreground` (ADR-0007 §2: `--text-display-title: 30px`, "the single title treatment shared by every archetype header in the baseline"). `AuthCard` is documented (its own JSDoc, `AuthCard.tsx:19-21`) as "NOT a page archetype" — a layout primitive for off-app utility screens (sign-in, not-authorized, 404) rendered *outside* `AppShell`/`PageHeader`. ADR-0007 §2's display step is scoped to "every archetype header," so whether AuthCard's heading is in scope is a real reading question, not a mechanical follow-on to #309. `AuthCard` currently has no test file (`find src -iname "*AuthCard*"` returns only the component itself).

## What to do

- [ ] Decide, and record the decision in this ticket's Open question below: does AuthCard's `<h1>` take `text-display-title` (visual consistency with every other top-level page heading in the house look), or does it stay on `text-lg` (ADR-0007 §2 scopes the step to archetype headers, and AuthCard's own JSDoc explicitly disclaims archetype status)?
- [ ] Apply the decided class to `AuthCard.tsx:47`, and if the answer is "stays on `text-lg`," add a one-line JSDoc note next to the existing "NOT a page archetype" disclaimer stating it is deliberately excluded from the ADR-0007 §2 display step, so a future pass doesn't re-open this as an oversight.
- [ ] Add a test (none exists today) that renders `AuthCard` and asserts the `<h1>`'s className, pinning whichever class is chosen so the two treatments can't silently drift apart again.

## Acceptance

- `AuthCard`'s `<h1>` className matches the decision recorded in `## Open question`.
- A new `AuthCard` test asserts that className and fails if it reverts to the other treatment.

## Related

- [archive/house-look-page-header-title-step.md](archive/house-look-page-header-title-step.md) — #309, the slice that moved `PageHeader`'s `<h1>` onto the display step
- ADR-0007 — The fleet house look: donor-fixed roles vs brand-overridable roles

## Open question

Does ADR-0007 §2's display-title step extend to `AuthCard`'s heading, or is AuthCard's own "NOT a page archetype" scope note a deliberate exclusion? Recommended: keep AuthCard on its own smaller heading scale (no `text-display-title`) — ADR-0007 §2 text ties the step to "every archetype header," and AuthCard is documented as explicitly not one; a sign-in/404 screen outside `AppShell` is a different visual context from an in-app page title. Not yet confirmed by a human.
