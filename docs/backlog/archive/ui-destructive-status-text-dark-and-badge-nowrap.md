---
area: ui
opened: '2026-09-28'
status: done
value: normal
model: sonnet
model_reason: "mechanical class swaps onto the existing --status-* tier plus two base classes; the target pairs are the ones the sibling warning/success/info variants already use"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T15:00:00Z'
---

# Donor ui primitives render dark-unreadable solid `text-destructive` and a wrapping Badge

## Context

The status-tier backport ([[donor-status-token-roles-badge-alert-backport]])
moved `src/components/ui/alert.tsx`'s `warning`/`success`/`info` variants onto the
`--status-*-{bg,fg}` pairs (ADR-0007 §5) but left `destructive` on the solid role:
`border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive`. In
`.dark`, `--destructive` is `0 62.8% 30.6%`, so the alert text is dark red on the dark canvas.
controlling-app's Planung liquidity alert showed this on 2026-09-28, and that app has 29
destructive `Alert` call sites. `src/components/ui/form.tsx` repeats the pattern for on-surface
error text: `FormLabel`'s error state (`:103`) and `FormMessage` (`:165`) use solid
`text-destructive`.

Separately, `src/components/ui/badge.tsx`'s base classes lack `whitespace-nowrap shrink-0`
(shadcn v4 carries both). So a badge in a flex row next to a long title wraps: "22 YTD" broke
onto two lines on controlling-app's home asset cards, which that app patched at the row in its
PR #1094. Consumers: controlling-app, hk-crm, mistra. Found by the controlling-app house-look
follow-ups (controlling-app PRs #1094 and #1095; #1095 swept that app's own on-surface text onto
`text-status-*-fg`).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] `alert.tsx` `destructive` → `border-status-danger-fg/20 bg-status-danger-bg text-status-danger-fg [&>svg]:text-status-danger-fg`. This matches the three sibling variants in the same `cva` table.
- [ ] `form.tsx` `:103` and `:165` → `text-status-danger-fg`.
- [ ] Grep `src/components/` (ui, layout, archetypes) for any other on-surface `text-destructive|success|warning` outside a `*-foreground` solid fill, and move it to `text-status-*-fg`.
- [ ] `badge.tsx` base classes gain `whitespace-nowrap shrink-0`.
- [ ] Gallery: the Alert and Badge demos show `destructive` and a badge next to a long title, in light and dark ([[living-demos-for-variants]] memory).

## Acceptance

- With `.dark` on `<html>`, the destructive `Alert` renders a light foreground on a dark danger tint in the gallery, and `FormMessage` error text is readable on the dark canvas.
- No other on-surface solid-role `text-destructive|success|warning` remains in `src/components/` outside a `*-foreground` fill (grep returns 0).
- A `Badge` next to a long title in a `justify-between` row stays on one line.
- Light-mode rendering of the destructive Alert stays a readable danger-tinted callout.

## Related

- [[donor-status-token-roles-badge-alert-backport]]: introduced the status tier and left `destructive` behind
- [[gallery-nested-dark-mode-token-resolution]]: gallery dark-mode rendering, needed to see the fix
- ADR-0007: the fleet house look (§5 status tier)
