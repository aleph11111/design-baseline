---
slug: stack
kind: methodology
version: 1.2
status: locked
---

# STACK.md — the pinned package contract

The Design Baseline is not just components and tokens — it is built **on** a specific
stack, and its behavior guarantees (focus trapping, sheet animations, form validation,
figure alignment) only hold on that stack. This file pins it.

> **The one rule.** The packages below are a hard preference. Diverging from any of them
> — adding a competitor, majoring a version, swapping a peer — requires an ADR in
> `docs/adr/` stating the grounding, same standard as any RULES.md scar. "It was already
> in the project" is not grounding.

## The contract

| Layer | Package | Pin | Why this one |
|---|---|---|---|
| UI runtime | `react` / `react-dom` | 19.x | DS components are React 19 code |
| Styling | `tailwindcss` + `@tailwindcss/postcss` | ^4 | Token layer is Tailwind-4 `@theme`; v3 plugins do not resolve |
| Animation utilities | `tw-animate-css` | ^1 | The v4-compatible port. **Not** `tailwindcss-animate` (a Tailwind-3 plugin — see scar below) |
| Headless primitives | `@radix-ui/*` | per shadcn | Every DS dialog/menu/popover behavior (focus, keyboard, portal) is Radix's |
| Variants | `class-variance-authority` + `tailwind-merge` + `clsx` | ^0.7 / ^3 / ^2 | The component contract encoding |
| Forms | `react-hook-form` + `zod` + `@hookform/resolvers` | ^7 / ^4 / ^5 | The one form pattern; B and J archetypes assume it |
| Icons | `lucide-react` | pinned minor | Single icon source; `[&_svg]:size-4` sizing convention |
| Toasts | `sonner` | ^2 | `Toaster`/`toast()` contract |
| Command palette | `cmdk` | ^1 | `Command` contract |
| Date picking | `react-day-picker` | ^10 | `Calendar` contract; breaking majors |
| Drawers | `vaul` | ^1 | Mobile sheet behavior |
| Type | IBM Plex Sans + Mono | — | House face; however loaded (`next/font`, `@font-face`), it MUST land on `--font-sans` / `--font-mono` |

## Known trip points (the scars this file exists for)

1. **Tailwind 3 plugin on a Tailwind 4 pipeline.** `tailwindcss-animate@1.x` cannot be
   resolved by `@tailwindcss/postcss@4`; without its utilities every Sheet — i.e. every
   J crud-dialog — *pops* instead of sliding. Fixed by `tw-animate-css`. Never reintroduce
   the v3 plugin.
2. **Two headless foundations at once.** A consuming project that adds a second headless
   UI library (e.g. `@base-ui/react` alongside `@radix-ui/*`) runs two focus-trap and
   keyboard models at once — the dependency-level version of "two navigation conventions."
   Overlapping packages get an ADR or get removed. *(Scar origin: hk-crm, 2026-07.)*
3. **Compiled-CSS version skew.** *Void for a source-distributed package.* There is no
   compiled `_ds_bundle.css` — the package ships source, and the consumer compiles every
   class itself with its own Tailwind, so the two-version skew the hazard describes cannot
   occur. The skew remains a hazard only for the copy-once `cp -R` channel (a vendored
   bundle compiled elsewhere). Install via `docs/PACKAGE.md` instead of vendoring a bundle.
4. **Fonts coupled by variable name.** `next/font` sets `--font-ibm-plex-*`; `@theme` maps
   them into `--font-sans`/`--font-mono`. Renaming either side silently falls back to
   system UI. Treat the var names as part of this contract.
5. **Unstamped vendored peers.** `react-day-picker`, `sonner`, `vaul`, `cmdk`, `recharts`
   all have breaking majors, and nothing records which versions the vendored components
   were written against. The package version is the answer: with package consumption
   (`docs/PACKAGE.md`) the installed donor tag IS the stamp — one number names every
   vendored component and its peers, and a tag bump moves them in lockstep. Per-file
   vendor stamps stay required only for the `cp -R` copy channel, where no package
   version exists to carry them.

## What needs an ADR

- Adding any package that overlaps a contract row (a second icon set, a second toast
  library, a styled-component system, a different form library).
- A major-version bump of any contract row.
- Opting any surface out of the Radix-based primitives.

## Revision log

- **1.2** — Hazards 3 and 5 corrected for the source-distributed package (phase `pkg`):
  the compiled-CSS skew is void when no compiled bundle ships, and the package version
  replaces per-file vendor stamps. Both now point at `docs/PACKAGE.md`.

- **1.1** — Promoted to the Design Baseline; scars generalized to any consumer, with the
  originating project noted.

- **1.0** — First draft, from the 360° audit (dimension 6/7 findings + package.json and
  tokens.css evidence).
