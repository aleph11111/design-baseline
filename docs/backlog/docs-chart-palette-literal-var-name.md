---
area: docs
opened: '2026-09-28'
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T00:00:00Z'
---

# Document that chart-palette CSS var names must be written literally, not templated

## Context

`docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md` §8 fixes
`--chart-1` … `--chart-6` as donor-fixed roles ("a chart library reads the
CSS variables, never hex") but neither it nor `docs/PACKAGE.md` (zero
mentions of "chart") tells consumers *how* to reference them. Tailwind 4
only emits the theme variables it finds verbatim in sources — a consumer
building the class as `` var(--color-chart-${n}) `` at runtime gets no
`chart-2`..`chart-6` at all, since Tailwind never sees those literal
strings during its build scan. controlling-app hit this during its
v0.2.11 adoption (2026-09-28): chart-2 through chart-6 silently dropped
from the build until the reference was rewritten as literal
`var(--color-chart-2)`, `var(--color-chart-3)`, etc.

## What to do

- [ ] Add a consumer-guidance note to `docs/PACKAGE.md` (and/or ADR-0007 §8)
      stating that `--color-chart-1` … `--color-chart-6` must be referenced
      as literal strings (`var(--color-chart-2)`), never built dynamically
      (`` var(--color-chart-${n}) ``), because Tailwind 4 only emits theme
      variables found verbatim in source files.

## Acceptance

- `docs/PACKAGE.md` (or ADR-0007 §8) shows an explicit example of the
  correct literal-string chart-variable reference and states that a
  templated/dynamic reference silently drops the variable from the
  Tailwind 4 build.

## Related

- [archive/house-look-chart-palette.md](archive/house-look-chart-palette.md)
- ADR-0007 — the fleet house look: donor-fixed roles vs brand-overridable roles (§8, chart palette — fixed)
- [controlling-app docs/backlog/adopt-house-look-v0-2-11.md] — the v0.2.11 adoption where this gap was found (2026-09-28, cross-repo)
