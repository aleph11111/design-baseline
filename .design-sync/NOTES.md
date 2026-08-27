# design-sync NOTES — Design Baseline (shadcn/ui + Tailwind 4, package shape)

Repo-specific gotchas a future re-sync must know. Committed alongside config.json.

## Build model (why the scratch package exists)
- This repo is **typecheck-only** (no `dist/`, no `.d.ts`; `package.json` has no `main`/`module`/`types`).
  The converter's synth-entry mode would yield **empty `<Name>Props`** (props come from `.d.ts`).
- So `cfg.buildCmd` runs `.design-sync/build-pkg.mjs`, which assembles a conventional package at
  `.design-sync/.cache/pkg/` (gitignored) and points the converter at it via `cfg.entry`:
  - `barrel.ts` — bundle entry. `export *` from every ui/layout/archetype module (so ALL 225 exports,
    incl. shadcn subparts like CardHeader/DialogContent, reach `window.DesignBaseline`), then explicit
    `export { primaries }` lines that **win over ambiguous `export *` collisions** (an un-re-exported
    name colliding across modules would drop to undefined → `[BUNDLE_EXPORT]`).
  - `types/**` — real `.d.ts` via `tsc --emitDeclarationOnly` + `tsc-alias` (rewrites `@/` → relative so
    ts-morph resolves them). `types/index.d.ts` is the **carded** barrel: PRIMARIES only.
  - `tsconfig.json`, `styles.css`, `fonts/`, `package.json`, `src`→symlink to repo `src/`.
- **`cfg.tsconfig` points at the REPO tsconfig (`../../../tsconfig.json`), NOT the pkg's own.** esbuild's
  tsconfig-paths directory→index resolution fails through the `pkg/src` symlink for aliased *directory*
  imports (`@/components/layout`, `@/components/archetypes/shared` — 5 source files use these). Resolving
  against the real `repo/src` fixes it. The pkg-local tsconfig.json is unused by esbuild (harmless).
- `--node-modules ./node_modules` (repo). `@types/react`, `esbuild`, `ts-morph`, `tsc-alias`, `playwright`
  live in the isolated `.ds-sync/node_modules`.

## Carded set: 94 primaries, 225 importable
- The DS pane cards **94 primaries** (`types/index.d.ts`), not all 225 exports — build-pkg prunes
  within-module subparts (a name prefixed by a shorter same-module export: Card←CardHeader,
  Dialog←DialogContent, StatTile←StatTileRow). All 225 stay importable via the bundle namespace, and the
  bare-package import shim (`export * from window.DesignBaseline`) resolves ANY of them in authored
  previews — so compound previews can freely compose subparts (DialogContent, CardHeader, …).
- ui primitives land in group **`general`** (the converter's GENERIC_DIR skips the `ui/` segment). Cosmetic;
  layout→`layout`, archetypes→per-archetype. Not worth 40 docsMap stubs to relabel.
- `componentSrcMap` pins 4 layout/report comps whose export name ≠ filename (AppHeader←Header.tsx, etc.)
  so name-based src enrichment (group + JSDoc) matches.

## Fonts — house style is IBM Plex (shipped, not runtime)
- `tokens.css @theme` sets `--font-sans`/`--font-mono` to IBM Plex (the "Plex Ledger" house style). The
  gallery loads Plex via a Google-Fonts `<link>`; the DS must NOT depend on that.
- `.design-sync/fetch-fonts.mjs` harvested the **latin subset** (Sans 400/500/600/700 + Mono 400/500/600,
  7 woff2 ≈ 200 KB) into `.design-sync/fonts/` (committed). build-pkg copies them into `pkg/fonts/`;
  `cfg.extraFonts: "fonts/plex.css"` ships them as `@font-face`. Clears `[FONT_MISSING]`.

## CSS — compiled Tailwind, not raw tokens.css
- Tailwind 4 generates utilities by scanning source; raw `tokens.css` (`@import "tailwindcss"` + `@theme`)
  is NOT a usable standalone stylesheet. `cfg.buildCmd` runs `npm run gallery:build` (its `@source "../src"`
  compiles every component's classes) and copies the compiled CSS to `pkg/styles.css` (`cfg.cssEntry`).

## Known render warns (triaged, expected on re-sync)
- 18 floor-card `[RENDER_THIN]`/`[RENDER_BLANK]` warns = unauthored previews (small/compound comps render
  tiny with floor props). Resolved by authoring previews, not failures.

## Preview authoring learnings (folded from wave 1)
- **Full-page shells need `cardMode` overrides** — they render larger than the default grid card.
  DetailOverviewShell → `column` (rail+unified clips otherwise). Dialog (overlay) → `single` + viewport.
  Watch for the same on other shells (AppShell, MatrixGridShell, list/settings/kanban shells) — flag & override.
- **Percent-height charts render zero-height in the capture harness.** The `Bars` helper ported from
  `src/examples/analytics-dashboard-demo.tsx` (nested flex + `height: N%`) captured as zero-height bars;
  fixed in `DashboardGrid.tsx` with fixed-pixel heights. Width-percent (`HBars`) is fine. If porting a
  chart from a demo, use pixel heights in the preview. (Latent fragility in the real demo, out of scope.)
- **KeyValueRow/KeyValueList** only render meaningfully wrapped in `<DetailSection flush>` — compose them there.
- Import everything in previews from the bare `"design-baseline"` package (resolves the whole window namespace,
  including uncarded subparts like DialogContent/CardHeader).
- **Previews have NO global provider wrapper.** Components needing context must be wrapped IN the preview:
  - **Tooltip / any tooltip-using comp** → wrap in `<TooltipProvider>` (from `design-baseline`) or it mounts
    blank (Radix portal silently fails). MatrixGridShell hit this via `cellStyle.tooltip`.
  - **AppHeader / AppSidebar / Sidebar** need `SidebarProvider` (NOT re-exported cleanly) — compose them inside
    a real `<AppShell>`, or standalone with `showSidebarTrigger={false}`.
  - **BottomNav** hardcodes react-router `NavLink` → wrap the preview in `<MemoryRouter>` (from react-router-dom,
    resolves from node_modules), AND it's `md:hidden` so it's `display:none` at the default 900px capture →
    needs `cfg.overrides.BottomNav = {cardMode:single, viewport:"390x760"}` (only single-mode honors viewport).
  - **ThemeToggle** `useTheme()` degrades gracefully — no wrapper needed.
- **API gotchas** (check the `.d.ts`, docs can lag): `FormPageActions` Delete needs BOTH `destructiveLabel`
  AND `onDestructive` (`hasDestructive` checks both). `Select` is the Radix compound API
  (SelectTrigger/Content/Item/Value), not an `options`-prop component. `OVERLINE_CLASS` is not re-exported —
  re-declare the class string locally if a `renderHeader` override needs it.
- **BottomNav ships a FLOOR CARD (no authored preview).** It hardcodes react-router `NavLink`/`useLocation`,
  and the DS bundle inlines its OWN react-router copy — a preview's `MemoryRouter` is a different module
  instance whose Router context can't reach the bundle's `useLocation` (`useLocation() must be used within a
  <Router>`). It's genuinely un-renderable statically. It stays importable (`.d.ts` + prompt). Conventions
  header must note: **BottomNav requires a react-router `<Router>` ancestor.**
- **`preview-rebuild.mjs` does NOT recompile Tailwind** — `styles.css` is frozen from the last full gallery
  build, whose `@source "../src"` scans `src/` but NOT `.design-sync/previews/`. A Tailwind class used ONLY in
  a preview (esp. arbitrary values like `h-[420px]`) compiles to DEAD CSS silently. Authoring rule: for one-off
  dimensions use inline `style={{...}}`; otherwise reuse classes that already appear in `src/`. The capture-grade
  loop self-corrects (a dead class shows broken in the sheet → regrade), but subtle spacing can slip.
- **Toaster ships a FLOOR CARD** (same class as BottomNav): `Toaster` is sonner-based, and the bundle embeds its
  own `sonner` instance — a preview firing `toast()` from a separate `sonner` import doesn't share state, so the
  capture stays empty. `ScrollArea`/`ScrollBar` need `type="always"` (default `hover` hides the thumb in a
  static capture). `RadioGroupItem` (and other subparts) aren't in `types/index.d.ts` but ARE on the bundle
  global — import them from `"design-baseline"` and they resolve (by design).
- **Wide/full-page shells → `{cardMode:"column"}`**: DetailOverviewShell, BoardShell, ListWithDetailShell,
  MatrixGridShell, SettingsTableShell, SectionNavShell, Table. **Overlays/fixed/portal → `{cardMode:"single", viewport}`**:
  Dialog, AppShell, AppSidebar, AppHeader, CrudDialog{Sheet,Header,Body,Footer}, Select, AlertDialog,
  ConfirmationDialog, Sheet, Popover, DropdownMenu, Command, Tooltip. AppSidebar/AppShell need a DESKTOP-width
  viewport (≥1000) or the sidebar collapses to mobile.

## Re-sync risks (watch-list)
- **Fonts fetched from Google Fonts** — `fetch-fonts.mjs` needs network on first run of a fresh clone; the
  woff2 are committed so re-syncs are offline-deterministic. If Plex weights change in tokens.css, re-run it.
- **Latin subset only** — no Cyrillic/Greek/Vietnamese glyphs. Fine for the English-default baseline.
- **compiled CSS via gallery build** — if the gallery harness changes, confirm `styles.css` still carries
  all component utilities.
- **subpart pruning is prefix-based** — a new compound whose subpart isn't name-prefixed by its parent
  (e.g. MetricList/MetricRow) will card the subpart too. Harmless, just an extra card.
