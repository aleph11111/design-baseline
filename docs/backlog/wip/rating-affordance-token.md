---
area: ui
opened: 2026-08-24
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-24T00:00:00Z
---

# Add a rating/affordance semantic token to the tokens.css scale

## Context

Consumer repo `mistra` (`aleph11111/mistra`) tokenized its model star-rating ink as part of a `literal-color` lint drain and needed a slot the donor's `src/styles/tokens.css` doesn't have. The donor ships `--success`/`--warning` (+ `-foreground`) as its two semantic-status token pairs, each flipping lightness between `:root` and `.dark` so both `bg-*` and `text-*` uses stay legible in either theme (the same pattern documented inline above `--warning` in `src/styles/tokens.css`). `--warning` was rejected for the star because a star is a quality/affordance marker, not an alert, and reusing it would drag the star's hue every time the warning hue moves. Mistra shipped a repo-local `--rating` token instead (`frontend/src/styles/tokens.css`): light `38 92% 45%`, dark `43 96% 56%`, same lightness-flip shape as `--success`/`--warning`, plus a `--color-rating: hsl(var(--rating))` Tailwind bridge alongside its other `--color-*` bridges. No foreground pair — the token is drawn straight onto the surface, like a `--chart-N` step, not paired text-on-chip.

## What to do

- [x] Ship a rating/affordance semantic token pair in `src/styles/tokens.css`, following the existing `--success`/`--warning` lightness-flip convention (dark base + light text in `:root`, light base + dark text in `.dark`) and the matching `--color-*` Tailwind bridge — mistra's shipped values (`--rating: 38 92% 45%` light, `43 96% 56%` dark) are a usable starting point, not a hard requirement.
- [x] Add the new token to the semantic-token list wherever `--success`/`--warning` are documented today (`docs/STACK.md` / `docs/STYLE.md`) so it isn't a silent addition.

## Acceptance

- Donor `src/styles/tokens.css` exposes a rating/affordance token consumable as `bg-rating`/`text-rating` (or equivalent naming) in both `:root` and `.dark`.
- Mistra's local `--rating` block in `frontend/src/styles/tokens.css` becomes deletable on the next `/style-baseline` re-adoption once the donor token lands.

## Related

- [docs/STACK.md](../../STACK.md)
- [docs/STYLE.md](../../STYLE.md)
