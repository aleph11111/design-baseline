# design-baseline

A reusable frontend foundation extracted from the patterns that worked in `controlling-app` and `brickshop-manager`. The goal: start a new project, say "use the baseline," and get a coherent, dark-mode-ready, accessible UI on day one.

**This repo is donor source, not a buildable app.** Files in `src/` are meant to be copied into a target project — either manually or via the `/style-baseline` skill. Verify the donor with `npm install && npx tsc --noEmit` (strict TypeScript settings real targets use) and `npm test` (component tests guarding shared primitives like `SurfaceHeader`).

## What's in it

```
design-baseline/
├── components.json                 # shadcn-cli config
├── _adherence.json                 # adherence-lint rules; consumers wire `lint:design` -> scripts/lint-design.mjs (ADOPTION.md gate 2)
├── package.json                    # reference dep list + typecheck devDependencies
├── scripts/
│   └── lint-design.mjs             # zero-dep adherence-lint runner for `lint:design` (reads _adherence.json)
├── docs/
│   ├── STYLE.md                    # tokens, components, conventions, re-skin checklist
│   ├── CHOOSING-A-SURFACE.md       # methodology — which surface/archetype for which job
│   ├── PLACEMENT.md                # methodology — what goes where inside any archetype
│   ├── STACK.md                    # methodology — the pinned package contract (divergence needs an ADR)
│   ├── ADOPTION.md                 # methodology — the adoption contract + 4-gate enforcement stack
│   └── archetypes/                 # page-shape contracts + MANIFEST.json registry
└── src/
    ├── styles/
    │   └── tokens.css              # Tailwind 4 entry + HSL design tokens (light + dark)
    ├── lib/
    │   └── utils.ts                # cn()
    ├── hooks/
    │   ├── use-mobile.ts           # useIsMobile() — required by ui/sidebar.tsx
    │   └── use-toast.ts            # canonical shadcn toast hook — required by ui/toaster.tsx
    ├── utils/
    │   └── logger.ts               # console wrapper — required by ui/error-boundary.tsx
    ├── components/
    │   ├── ui/                     # 36 shadcn/ui primitives
    │   ├── layout/                 # AppShell, AppSidebar, AppHeader (router-agnostic)
    │   └── archetypes/             # page-shape contracts (list-with-detail, settings-table, crud-dialog)
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
| [`docs/ADOPTION.md`](docs/ADOPTION.md) | The adoption contract — 9-point checklist (point 1: adopt the `AppShell` frame), 4-gate enforcement stack, two-way feedback loop. The zero-dep `scripts/lint-design.mjs` (rules in `_adherence.json`) is its mechanical gate 2. |

## How to apply it

### Option 1 — `/style-baseline` skill (recommended)

From inside a fresh project:

```
/style-baseline
```

The skill detects your target stack (Next.js vs Vite), copies `src/styles/tokens.css`, `src/lib/utils.ts`, `src/hooks/`, `src/utils/`, `src/components/ui/`, `src/components/layout/`, and `components.json` into the project, adds `"use client"` where Next requires it, installs the dependency set, and prints the brand-token edits you should make next.

Optionally, run `/style-archetypes` after `/style-baseline` to also copy the page-shape archetypes (list-with-detail, settings-table, crud-dialog) into the project. See `docs/archetypes/README.md` for the methodology.

### Option 2 — manual

1. Install the deps from `package.json` (plus `@tailwindcss/postcss` for Next or `@tailwindcss/vite` for Vite).
2. Copy `components.json` to project root.
3. Copy `src/styles/tokens.css`, `src/lib/utils.ts`, `src/hooks/`, `src/utils/`, `src/components/ui/`, `src/components/layout/` into your project (preserving the structure). The `hooks/` and `utils/` files are required imports from `components/ui/` (sidebar, toaster, error-boundary) — skipping them breaks the TypeScript build.
4. Import `tokens.css` once at the app entry (Next: `app/layout.tsx`; Vite: `src/main.tsx`).
5. Make sure `@/` resolves to your `src/` directory (`tsconfig.json` + bundler config).
6. For Next.js App Router: prepend `"use client"` to every `.tsx` in `components/ui/` and `components/layout/` (Vite ignores the directive — harmless either way).
7. Open `docs/STYLE.md` and follow the **Re-skin checklist** to customize colors, radius, and brand font.
8. (Optional) Apply the archetype layer: copy `docs/archetypes/` and `src/components/archetypes/` into the project. See `docs/archetypes/README.md` for what's in each archetype and `docs/STYLE.md` for the convention.

## What's intentionally out of scope

- **Auth**, **data fetching**, **routing**, **charts**, **i18n** — these are stack- or project-dependent. Pick per project.
- **Tailwind 3 config** — the baseline is Tailwind 4 only. If you need v3, copy the tokens but translate them into a `tailwind.config.ts` `theme.extend.colors` block manually.
- **Nav content and grouping shape** — see "Ownership boundary" below.

## Ownership boundary

The baseline owns how the sidebar and header **render and behave**; each project owns **what's in its nav** and **how it's grouped**. `brickshop-manager` (flat domain groups) and `controlling-app` (asset-scoped nav with a switcher) deliberately disagree on grouping, and that's fine — they both consume the same `<AppSidebar>` primitive with different `navItems` / `groups` props. Behaviour fixes belong in this donor; nav content lives in each project's `MainLayout` / `AppShell` composition.

If a behaviour bug shows up in a target (e.g. nav-item text gets selected on click), fix it here in `src/components/layout/Sidebar.tsx` or `src/components/ui/sidebar.tsx` and re-broadcast via `/style-baseline --force` — don't patch the target's snapshot. See `docs/STYLE.md` § "Ownership boundary" for the full statement.

## Provenance

Components, tokens, and the sidebar/header pattern come from `brickshop-manager` (the more mature design system of the two). The LEGO brand colors and project-specific editable-field variants have been stripped. The layout primitives are genericized versions of brickshop's `MainLayout` / `AppSidebar` / `Header`. See `docs/STYLE.md` for the full conventions list.
