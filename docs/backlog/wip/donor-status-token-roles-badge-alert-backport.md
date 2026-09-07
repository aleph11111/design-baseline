---
area: ui
roadmap: archetype-convergence
opened: '2026-09-07'
status: ready
value: normal
model: sonnet
model_reason: "mechanical — ten @theme roles, two sets of HSL triplets, and two cva variant tables; the source values and the role/value ownership split are both settled in the spec's C4"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-09-07T00:00:00Z
---

# Backport the status-token roles and the badge/alert chip tier from hk-crm

## Context

The donor has **no `--color-status-*` roles at all**. `src/components/ui/badge.tsx`
still keys its `secondary` / `destructive` / `success` / `warning` variants off
the solid brand roles (`bg-secondary`, `bg-success`, `hover:bg-*/80`), and
`src/components/ui/alert.tsx` off `border-warning/50 text-warning`. hk-crm's
vendored copies of both moved to a soft-chip tier —
`bg-status-{tier}-bg` / `text-status-{tier}-fg` over five tiers (success,
warning, danger, info, neutral) — and `badge` gained an `info` variant the donor
lacks. hk-crm's own `src/styles/tokens.css:76-85,165-169,223-227` carries the
ten `--color-status-*` roles plus their `:root` and `.dark` triplets and
annotates them as one AA-verified source. On these two files the donor is behind
its consumer, which is measured, not asserted: they are 2 of the 8 genuinely
divergent files out of 36 shared `src/components/ui/` primitives (the other 28
differ only by vendor stamp, `"use client"`, and `@/`-versus-relative imports).

This blocks the `consumer-migration` phase's runbook: with the donor behind,
step 1 of that runbook tells every consumer to keep a permanent fork of two
files the donor should simply have. Filed as decision **C4** of the
`consumer-migration` section of the archetype-convergence design spec.

## What to do

- [ ] Add the ten `--color-status-{success,warning,danger,info,neutral}-{bg,fg}`
      roles to `src/styles/tokens.layer.css`'s `@theme`, as
      `hsl(var(--status-<tier>-<bg|fg>))` indirections — roles live in the
      donor-owned layer (ADR-0004 / RULES rule 12's token tier; spec decision T2).
- [ ] Add their default `:root` and `.dark` HSL triplets to the brand
      `src/styles/tokens.css` — values live in the project-owned half, so a
      consumer rebrands the chip tier without editing a file the donor owns.
      Seed from hk-crm's AA-verified pairs.
- [ ] Move `src/components/ui/badge.tsx` onto the pairs and add the `info`
      variant; move `src/components/ui/alert.tsx`'s `warning` / `success` /
      `info` variants onto the same pairs.
- [ ] Update the gallery demo(s) that render badges or alerts so every tier,
      `info` included, has a visible demo (per the living-demos rule).

## Acceptance

- [ ] `node scripts/verify-exports.mjs` reports `6/6 ok` — T5's "token layer
      declares no brand values" invariant is what proves the roles landed in
      `tokens.layer.css` and the triplets did not.
- [ ] `npx tsc --noEmit`, `npm test` and `node scripts/lint-design.mjs`
      (0 errors, warns unchanged at 59) all pass, and `npm run gallery:build`
      succeeds.
- [ ] Every status-bearing variant in `src/components/ui/badge.tsx` and
      `alert.tsx` keys off the `--color-status-*` pairs — not only the two
      variants this ticket names; no sibling variant in either file is left on
      the old solid-role tier.
- [ ] Diffing hk-crm's `src/components/ui/badge.tsx` and `alert.tsx` against the
      donor's, normalised for stamp / `"use client"` / import style, shows no
      remaining difference — the two files drop out of the 8-file fork list.

## Related

- [archetype-convergence.md](../archetype-convergence.md) — roadmap; phase
  `consumer-migration`, decision C4
- [archive/tokens-brand-font-seam-and-split-guard.md](../archive/tokens-brand-font-seam-and-split-guard.md)
  — shipped the layer/brand ownership split and `verify-exports`' two CSS invariants
- ADR-0004 — appearance locality: derived vs inherited; the token tier this uses
