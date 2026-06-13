# Taxonomy

The shared vocabulary for the design-baseline. Use these exact terms in specs,
tickets, roadmap items, and the dashboard hub so everyone (and every tool) means
the same thing. The gallery's overview reads from this; the hub's "what is this
called" lookups resolve here.

| Term | Means | Lives in | Applied / shipped by |
|------|-------|----------|----------------------|
| **Baseline** | The whole design donor — tokens + layout primitives + shell + archetypes. The single source of truth. | the `design-baseline` repo | — |
| **Token** | A design value exposed as a CSS variable: color role, spacing rhythm, radius. Re-skinnable per project. | `src/styles/tokens.css`, documented in `STYLE.md` | `/style-baseline` |
| **Layout primitive** | App chrome and cross-cutting building blocks: `AppShell`, `AppSidebar`, `AppHeader`, `PageHeader`, `SectionHeading`, `SectionCard`, `SectionNavShell`, `ThemeToggle`. | `src/components/layout/` | `/style-baseline` |
| **Archetype** | A **page-shape contract**: how a *kind* of page is structured (route → shell → header → toolbar → data → states → permissions). Identified by a key (`A`, `B`, `C`, `D2`, `J`, `K`, `M`, `F2`) and a slug. Each = spec + reference primitives + demo. | spec in `docs/archetypes/<slug>.md`; registered in `docs/archetypes/MANIFEST.json` | `/style-archetypes <key>` |
| **Reference primitive** | The components that implement an archetype's chrome (e.g. `GroupedListShell`, `GroupedListSection`). | `src/components/archetypes/<slug>/` | copied by `/style-archetypes` |
| **Demo** | The rendered, worked example of an archetype — what the gallery shows and what you eyeball to "see" the archetype. | `src/examples/<slug>-demo.tsx` | donor-dev only (not shipped) |
| **Gallery** | The donor-dev app that mounts the demos behind a nav so the baseline can be browsed visually. | `gallery/` | donor-dev only (not shipped) |
| **Plugin** | The baseline packaged as a wireable capability for the hub: the gallery surface + the `plugin` block in `MANIFEST.json` (metadata + declared actions). | this repo, described by `MANIFEST.json` → `plugin` | wired into the dashboard hub |

## Words we deliberately avoid

- **"Template"** — ambiguous (could mean an archetype, a demo, or a starter
  file). If you must use it, it means *"a demo copied as a starting point"* —
  but prefer **demo** (to view) and **archetype** (the contract).
- **"Component"** — too generic. Say **layout primitive**, **reference
  primitive**, or **shadcn/ui primitive** (the base `src/components/ui/` set).

## How the pieces relate

```
Baseline
├── Tokens ─────────────► /style-baseline
├── Layout primitives ──► /style-baseline
├── shadcn/ui primitives ► /style-baseline
└── Archetype  (key + slug)
     ├── spec            (docs/archetypes/<slug>.md)      ── the contract
     ├── reference primitives (src/components/archetypes) ── /style-archetypes
     └── demo            (src/examples/<slug>-demo.tsx)   ── shown in the Gallery

Plugin = Gallery surface + MANIFEST.plugin (metadata + actions)
         └── wired into the dashboard hub → browse archetypes, fire adopt tickets
```

See also: `STYLE.md` (tokens, primitives, conventions),
`docs/archetypes/README.md` (the archetype methodology + the twelve layers), and
`docs/CHOOSING-A-SURFACE.md` (which archetype to use for an entity at a given
depth — the surface ladder + create spectrum).
