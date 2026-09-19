# design-baseline

A reusable frontend foundation extracted from the patterns that worked in `controlling-app` and `brickshop-manager`. The goal: start a new project, say "use the baseline," and get a coherent, dark-mode-ready, accessible UI on day one.

**This repo is donor source, not a buildable app.** `src/` ships as a **git source package** — consumers add one dependency line and import from `design-baseline/...`; see [`docs/PACKAGE.md`](docs/PACKAGE.md). Verify the donor with `npm install && npx tsc --noEmit` (strict TypeScript settings real targets use) and `npm test` (component tests guarding shared primitives like `SurfaceHeader`).

## What's in it

```
design-baseline/
├── components.json                 # shadcn-cli config
├── _adherence.json                 # adherence-lint rules; consumers wire `lint:design` -> scripts/lint-design.mjs (gate 2 of the four-gate stack)
├── package.json                    # reference dep list + typecheck devDependencies
├── scripts/
│   ├── lint-design.mjs             # zero-dep adherence-lint runner for `lint:design` (reads _adherence.json)
│   └── scan-adoption-quality.mjs   # zero-dep Axis-C (adoptionQuality) discovery radar — per-signal hit counts over docs/audit-signals.json (ADR-0005)
├── docs/
│   ├── STYLE.md                    # tokens, components, conventions, re-skin checklist
│   ├── CHOOSING-A-SURFACE.md       # methodology — which surface/archetype for which job
│   ├── PLACEMENT.md                # methodology — what goes where inside any archetype
│   ├── STACK.md                    # methodology — the pinned package contract (divergence needs an ADR)
│   ├── PACKAGE.md                  # package consumption: the four gates + migration runbook
│   └── archetypes/                 # page-shape contracts + MANIFEST.json registry
└── src/
    ├── styles/
    │   └── tokens.css              # Tailwind 4 entry + HSL design tokens (light + dark)
    ├── lib/
    │   └── utils.ts                # cn()
    ├── hooks/
    │   └── use-mobile.ts           # useIsMobile() — required by ui/sidebar.tsx
    ├── utils/
    │   └── logger.ts               # console wrapper — required by ui/error-boundary.tsx
    ├── components/
    │   ├── ui/                     # shadcn/ui primitives — see docs/ARCHITECTURE.md for the current count
    │   ├── layout/                 # AppShell, AppSidebar, AppHeader (router-agnostic)
    │   └── archetypes/             # page-shape contracts — docs/archetypes/MANIFEST.json is the living list
    └── examples/
        ├── DemoNextApp.tsx         # wiring for Next.js 16 App Router
        └── DemoViteApp.tsx         # wiring for Vite + React Router 7
```

### Methodology

Four cross-archetype methodology docs sit upstream of the individual archetype specs — they decide *which* surface a job gets, *where* things go inside it, *what* stack it runs on, and *how* a project adopts and stays on the baseline. Registered in `docs/archetypes/MANIFEST.json` under the `methodology` key.

| Doc | Owns |
|-----|------|
| [`docs/CHOOSING-A-SURFACE.md`](docs/CHOOSING-A-SURFACE.md) | Selection — which surface/archetype for which job (the CRUD ladder + collection chooser). Every archetype spec defers to it. |
| [`docs/PLACEMENT.md`](docs/PLACEMENT.md) | Placement — what goes where inside any archetype; each recurring slot → its owning primitive; green/yellow/red grid. |
| [`docs/STACK.md`](docs/STACK.md) | The pinned package contract + known trip points; diverging from a row requires an ADR. |
| [`docs/PACKAGE.md`](docs/PACKAGE.md) | Package consumption — four wiring lines, the six-step migration runbook, proof matrix, and the 4-gate enforcement stack. The zero-dep `scripts/lint-design.mjs` (rules in `_adherence.json`) is its mechanical gate 2. |

## How to apply it

Install the package and wire it in — four lines, all of them load-bearing. The full
runbook (tsconfig `paths`, the two CSS lines, the migration steps for a project that
already vendored a copy, and the proof matrix) lives in
[`docs/PACKAGE.md`](docs/PACKAGE.md).

```jsonc
// package.json — pin a tag; a version bump is a one-digit change
"design-baseline": "github:aleph11111/design-baseline#v0.2.2"
```

```css
/* src/styles/tokens.css */
@import "design-baseline/tokens.layer.css";
@source "../../node_modules/design-baseline/src";
```

Then import from the package rather than copying files:

```ts
import { AppShell } from "design-baseline/layout";
import { Button } from "design-baseline/ui/button";
import { DetailOverviewShell } from "design-baseline/archetypes/detail-overview";
```

The package ships **source** (`.tsx` / `.ts`), never compiled JS or CSS — your own
toolchain transpiles it and compiles every Tailwind class from source, so there is no
compiled bundle to drift out of sync.

The archetype layer comes with the package: `docs/archetypes/MANIFEST.json` is the living
list of what ships, and each archetype is importable as `design-baseline/archetypes/<slug>`.
See [`docs/archetypes/README.md`](docs/archetypes/README.md) for the methodology and
[`docs/CHOOSING-A-SURFACE.md`](docs/CHOOSING-A-SURFACE.md) for picking one.

Your project still owns its brand: `src/styles/tokens.css` is yours to edit — open
[`docs/STYLE.md`](docs/STYLE.md) and follow the **Re-skin checklist** to set colors, radius,
and brand font.

## What's intentionally out of scope

- **Auth**, **data fetching**, **routing**, **charts**, **i18n** — these are stack- or project-dependent. Pick per project.
- **Tailwind 3 config** — the baseline is Tailwind 4 only. If you need v3, copy the tokens but translate them into a `tailwind.config.ts` `theme.extend.colors` block manually.
- **Nav content and grouping shape** — see "Ownership boundary" below.

## Ownership boundary

The baseline owns how the sidebar and header **render and behave**; each project owns **what's in its nav** and **how it's grouped**. `brickshop-manager` (flat domain groups) and `controlling-app` (asset-scoped nav with a switcher) deliberately disagree on grouping, and that's fine — they both consume the same `<AppSidebar>` primitive with different `navItems` / `groups` props. Behaviour fixes belong in this donor; nav content lives in each project's `MainLayout` / `AppShell` composition.

If a behaviour bug shows up in a consumer (e.g. nav-item text gets selected on click), fix it here in `src/components/layout/Sidebar.tsx` or `src/components/ui/sidebar.tsx`, cut a new tag, and bump the consumer's pinned `design-baseline` version — don't patch the consumer's tree. See `docs/STYLE.md` § "Ownership boundary" for the full statement.

## Provenance

Components, tokens, and the sidebar/header pattern come from `brickshop-manager` (the more mature design system of the two). The LEGO brand colors and project-specific editable-field variants have been stripped. The layout primitives are genericized versions of brickshop's `MainLayout` / `AppSidebar` / `Header`. See `docs/STYLE.md` for the full conventions list.
