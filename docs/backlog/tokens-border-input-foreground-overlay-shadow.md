---
area: ui
opened: '2026-11-18'
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-18T00:00:00Z'
---

# Token refinements for border, input, foreground and overlay shadow

## Context

Refero visual audit 2026-11-18 (artifact https://claude.ai/artifact/JdrHqEoSKLShybLfYWUcoS) compared the donor tokens in `src/styles/tokens.css` with Attio and Column style references and found four house-style value changes that reach every consumer through the package. Light theme first, verify dark. All values below are estimates: confirm contrast with a checker before landing. Independent of the other audit tickets.

- K1: light `--border` is `214.3 31.8% 91.4%` (bluish slate-200), more chromatic than both references and than our own `--sidebar-border` (`220 13% 91%`).
- K2: light `--input` equals `--border`, so field and outlined-button edges sit at ~1.2:1 on white and barely show (seen on statement-with-filters selects, settings-sections fields, import-wizard drop zone).
- K3: light `--foreground` / `--card-foreground` / `--popover-foreground` are `222.2 84% 4.9%`, a saturated navy-black. `.dark` uses that same value as `--background` and must not change.
- K4: overlays (`src/components/ui/dialog.tsx` `shadow-lg`, `popover.tsx` `shadow-md`, `sheet.tsx` `shadow-lg`) use a flat shadow; the layer `src/styles/tokens.layer.css` defines no overlay shadow recipe.

## What to do

- [ ] K1: in `src/styles/tokens.css` `:root`, change `--border` to about `220 13% 91%`; check `.dark` `--border` for a matching chroma issue and leave it unless it clearly reads off.
- [ ] K2: in `src/styles/tokens.css` `:root`, split `--input` from `--border` to about `218 16% 83%`; add the separate `input` row to the Color roles table in `docs/STYLE.md` (today a combined `border` / `input` row) with light and dark values.
- [ ] K3: in `src/styles/tokens.css` `:root` only, soften `--foreground`, `--card-foreground`, `--popover-foreground` to about `222 22% 10%` (must stay above 15:1 on white); update the `foreground` row in `docs/STYLE.md` Color roles; do not touch `.dark`.
- [ ] K4: define a tinted ring-plus-layers overlay shadow in `src/styles/tokens.layer.css`, e.g. `0 0 0 1px hsl(var(--foreground)/.06), 0 4px 12px -1px hsl(var(--foreground)/.06), 0 1px 3px -1px hsl(var(--foreground)/.18)`, and apply it to dialog, popover and sheet in place of `shadow-lg` / `shadow-md`; keep ADR-0015's rule that shadow lives on overlays only (raised surfaces keep the hairline).
- [ ] Verify contrast of the new `--input` against `--background` and of `--foreground` against `--background` with a checker, adjust the estimates if they miss, and run `npm run scan:adoption-quality`.
- [ ] Regenerate screenshot baselines with `npm run screenshots:update` and review the PNG diff for the whole set (light theme changes touch most pages); add a `CHANGELOG.md` entry under a new `## v<version>` and bump `package.json` version (consumer note: re-baseline screenshots).

## Acceptance

- Light `--border` in `src/styles/tokens.css` is within a few points of `220 13% 91%`, and `--input` no longer equals `--border`.
- Light `--foreground` / `--card-foreground` / `--popover-foreground` render with contrast above 15:1 on `--background`; `.dark` token values are unchanged.
- Dialog, popover and sheet render the layered ring-plus-layers shadow from the layer token; no raised non-overlay surface gains a shadow.
- `npx tsc --noEmit`, `npm test` and `npm run scan:adoption-quality` pass, and the regenerated screenshot baselines show the intended diff only.
- `docs/STYLE.md` Color roles lists `input` as its own role, and `CHANGELOG.md` has an entry matching the bumped `package.json` version.

## Related

- [[house-look-tokens-layer-roles]]
- [[house-look-adr]]
- [[page-body-section-card-stack-adr-0015]]
- [ADR-0007](/docs/adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — fixed vs brand roles
- [ADR-0015](/docs/adr/0015-page-body-section-card-stack.md) — page body section card stack, bordered raised surfaces
