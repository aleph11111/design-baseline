# Style guide

The design-baseline defines a small, opinionated foundation: **shadcn/ui + Tailwind 4 + HSL CSS variables + a sidebar-and-header app shell**. Every project that starts from this baseline gets the same components, tokens, and layout shape — only the brand colors and the nav items differ.

## Tech stack

| Layer        | Choice                                                |
|--------------|-------------------------------------------------------|
| UI primitives | shadcn/ui (Radix + Tailwind) — see "Component inventory" below for the current count |
| Styling      | Tailwind CSS 4 (CSS-first config, no `tailwind.config.ts`) |
| Icons        | `lucide-react`                                        |
| Forms        | `react-hook-form` + `zod` (via shadcn `<Form>`)       |
| Toasts       | `sonner` (the only toast runtime)                     |
| Dark mode    | `.dark` class on `<html>` (use `next-themes` to drive)|
| Variants     | `class-variance-authority` (CVA) + `cn()`             |

Charts, data fetching, and auth are **not** in the baseline — pick per project.

## Design tokens

The re-skinnable tokens — the `:root` / `.dark` HSL triplets plus `--radius` — live in `src/styles/tokens.css`; the `@theme` roles those values map to live in the donor-owned `src/styles/tokens.layer.css`. Every shadcn component reads them via Tailwind utilities like `bg-background`, `text-foreground`, `border-input`. To re-skin: edit the HSL values in `:root` and `.dark` of `src/styles/tokens.css`; nothing else changes.

### Color roles

| Role                  | Default light             | Default dark              | Used for                              |
|-----------------------|---------------------------|---------------------------|---------------------------------------|
| `background`          | `0 0% 100%`               | `222.2 84% 4.9%`          | App background                        |
| `foreground`          | `222.2 84% 4.9%`          | `210 40% 98%`             | Body text                             |
| `card`                | `0 0% 100%`               | `222.2 84% 4.9%`          | Card / surface bg                     |
| `primary`             | `222.2 47.4% 11.2%`       | `210 40% 98%`             | Primary actions, active nav           |
| `secondary`           | `210 40% 96.1%`           | `217.2 32.6% 17.5%`       | Secondary buttons / pills             |
| `muted`               | `210 40% 96.1%`           | `217.2 32.6% 17.5%`       | Muted backgrounds, disabled rows      |
| `muted-foreground`    | `215.4 16.3% 46.9%`       | `215 20.2% 65.1%`         | Secondary text, helper text           |
| `accent`              | `210 40% 96.1%`           | `217.2 32.6% 17.5%`       | Hover states, subtle highlights       |
| `destructive`         | `0 84.2% 60.2%`           | `0 62.8% 30.6%`           | Errors, danger buttons                |
| `success`             | `142.4 71.8% 29.2%`       | `141.9 69.2% 58%`         | Positive status, confirmations        |
| `warning`             | `26 90.5% 37.1%`          | `43 96% 56%`              | Caution status, non-blocking problems |
| `border` / `input`    | `214.3 31.8% 91.4%`       | `217.2 32.6% 17.5%`       | Borders, input outlines               |
| `ring`                | `222.2 84% 4.9%`          | `212.7 26.8% 83.9%`       | Focus ring                            |
| `sidebar-*`           | (separate palette)        | (separate palette)        | Sidebar surface + accents             |

**Semantic status color — `success` / `warning` only, and there is no `info`.**
Any positive/caution state must route through these tokens (or a `<Badge>` /
`<Alert>` variant that does). Literal palette classes — `bg-green-500`,
`text-emerald-600`, `bg-amber-50` — are forbidden: they ignore the re-skin, and
because Tailwind's palette has no theme awareness they silently misrender in
dark mode. "Info" is **not** a fourth token: it maps to `--primary`, so an
informational alert or event chip re-skins with the brand like everything else.

Unlike `--destructive`, these two **flip lightness between themes** (dark base +
light text in `:root`; light base + dark text in `.dark`), matching how
`--primary` / `--secondary` / `--muted` / `--accent` already behave. That flip is
what lets one token pair serve both uses — `bg-success` as a solid chip *and*
`text-success` as an on-surface label — in either theme. A fixed-lightness token
can only ever be legible for one of the two. When tinting (`bg-success/15`), keep
the label on `text-foreground`: a colored `text-*` over a same-hue tint has
contrast in exactly one theme.

### Radius

`--radius: 0.5rem` (8 px). `rounded-lg` = `--radius`, `rounded-md` = `--radius - 2px`, `rounded-sm` = `--radius - 4px`. Override `--radius` to re-skin (e.g. `0` for squared-corners, `0.25rem` for tight).

### Spacing & rhythm

The baseline uses Tailwind's 4 px scale. A handful of values carry consistent *meaning* across archetypes — pick by intent, not by eye. New archetypes should reuse these rather than introduce a fifth rhythm.

**Page inset — one owner: `AppShell`'s `<main>`.** The page inset (`p-4 md:p-6`) is applied **once**, by `AppShell`'s `<main>` (`AppShell.tsx`). **No page, archetype shell, or section layout adds its own outer `px-6`/`py-6`** — doing so double-insets, and "who adds the padding" being a per-page decision is the #1 source of cross-app drift. A page's outer container carries only its vertical rhythm (`space-y-*`) and, for reading/entry archetypes, a `max-w-*` (left-aligned). This is consistency *by construction*: every page inside the shell inherits the same inset; there is nothing for a page author to get wrong or forget.

**Vertical rhythm** — `space-y-*` between stacked blocks:

| Token | px | Meaning | Used by |
|-------|----|---------|---------|
| `space-y-4` | 16 | Tight / intra-section — field groups within a form, a compact detail page, a tightly-coupled control+content pair | form-page (field groups), detail-overview (`compact`), matrix-grid (toolbar + grid) |
| `space-y-5` | 20 | Record-page section rhythm — between bounded `<DetailSection>`s (denser than a list page) | detail-overview (`default`) |
| `space-y-6` | 24 | Page rhythm — the default top-level stack: header band → content region | list-with-detail, grouped-list, settings-table, tabbed-settings, form-page (header → body) |
| `space-y-8` | 32 | Group separation — between whole titled groups, each its own card+table, that must read as distinct blocks | grouped-list (between sections) |

**Surface padding** — inside cards / sections / rows:

| Token | Used for |
|-------|----------|
| `px-4 py-3` | Card toolbar strip (the bordered control band atop a table card) |
| `px-5 py-3` | Section title bar (`<DetailSection>` ruled overline bar) |
| `px-5 py-4` | Section content (non-flush `<DetailSection>`), stat tile |
| `px-5 py-2.5` | Ruled list row (`<KeyValueRow>`) |
| `px-6 py-4` | Dialog body (`<CrudDialogBody>`) |
| `p-6` | Report document body (`<ReportShell>`) — the paper-like inset of a bounded formal document; the one surface with equal padding on all sides |
| `px-2 py-2` | Dense grid cells (matrix-grid) — the one place padding tightens below `px-4` |

**Grid gaps:** `gap-6` between two-column form sections; `gap-4` for paired fields and dialog two-column bodies; `gap-2`/`gap-3` for inline control clusters.

### Typography

**House style B — "Plex Ledger" (2026-06-21).** The house face is **IBM Plex Sans**;
all figures (money / IDs / quantities / dates) render `font-mono tabular-nums` in
**IBM Plex Mono**. The house faces are registered as `--font-sans` / `--font-mono` in
the donor-owned `tokens.layer.css` `@theme`. A project that loads its own faces (Next:
`next/font/google`; Vite/gallery: a `<link>` in `index.html`) binds them with a `@theme`
re-declaration in its brand `src/styles/tokens.css` — the commented FONT BINDING block —
since a later `@theme` replaces the donor's `--font-*` rather than stacking; leaving it
commented is what lets a donor-side face change reach the project on a version bump.
Prose, labels, and names stay
`font-sans`; only number cells go mono — the layout primitives (`StatTile`,
`KeyValueRow`, `MetricRow`) already carry `font-mono` on their value, so consumers
get it for free. The brand accent is **not** part of the house style — it stays each
app's `--primary` override (the baseline default is neutral slate).

**Ledger type scale.** House style B runs a tight scale — every step ~1–2px below
a conventional UI: page title `text-lg` (18px), overlines `text-[10.5px]`, ledger
body (`KeyValueRow`/`MetricRow`/embedded tables) `text-[13px]`, headline figures
`text-base` (16px). Numbers stay mono; prose/notes keep `text-sm` for readability.
This density is part of the Plex Ledger voice — apply the same step-down to new
ledger surfaces rather than reaching for the default `text-sm`/`text-xs`.

**Heading signatures** (canonical, do not hand-roll — compose the layout primitives that own them):

| Level | Token | Owned by |
|-------|-------|----------|
| Page title (`h1`) | `text-lg font-semibold tracking-tight` | `PageHeader` |
| Nested page title (`h2`) | `text-base font-medium leading-tight tracking-tight` | `NestedPageHeading` |
| Section title (`h2`) | `text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground` ("ledger overline") | `SectionHeading` |

### Surfaces

The default section surface (`SectionCard` default tone) is a **flat hairline** card
— `border`, no shadow — so cards read as fitted panels, not floaters. Shadow
(`shadow-sm`) is reserved for genuinely **raised** surfaces: modals, popovers, and
the detail-overview shell's **outer frame** (the one elevated surface on the
page). The frame depends on the page behind it being muted
(`AppShell`'s `<main>` is `bg-muted/30`); on a white page the frame has no edge and
the effect collapses.

**Header fill (the 2-token house contract).** A framed surface's header bar
(`DetailOverviewShell`'s Mode B header, `ReportShell`, `CalendarShell`, the
`ListWithDetailShell` drawer) renders one of three ways via `--header-fill`,
set once per project on `<AppShell headerFill="…">` (a `HeaderFillContext`,
default **`solid`**) and read by every framed shell so they never diverge:

- **`solid`** (default) — the bar is filled with the brand accent (`--primary`),
  white title/kicker, **inverted** action buttons (outline → transparent/white
  border; primary → white fill + accent text). Semantic status `<Badge>`s are
  **not** inverted — they stay semantic.
- **`tint`** — a soft muted fill (`bg-muted`), normal dark text.
- **`white`** — plain white, hairline border only.

The two tokens are **`--primary`** (the brand accent, each app's override; the
donor default is neutral slate) and **`--header-fill`** (per-project, default
solid). Everything else — header-on-surface, one frame on a muted mat, mono
figures, semantic pills — composes from those. A single shell may override with
a `headerFill` prop. See `src/components/layout/headerFill.ts`.

## Component inventory (`src/components/ui/`)

Standard shadcn/ui set:

`accordion`, `alert`, `alert-dialog`, `avatar`, `badge`, `button`, `calendar`, `card`, `checkbox`, `collapsible`, `command`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `pagination`, `popover`, `progress`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `tooltip`

Plus:

- `confirmation-dialog` — opinionated wrapper around `AlertDialog` for "Are you sure?" prompts.
- `error-boundary` — React `ErrorBoundary` class component (depends on `@/utils/logger`).
- `segmented-control`, `search-input`, `state-view`, `icon-avatar`, `cell-input`, `color-field`, `file-field` — shared content molecules (see "Shared content molecules" below). These are the single owners of the pill-toggle, toolbar search, async-plane, entity-circle, inline-cell-field, native-colour-picker, and native-file-picker patterns; compose them rather than hand-rolling.

Don't modify these files directly. To extend or recolor a component, wrap it. To upgrade, regenerate with `npx shadcn add <name>` after copying.

## Hooks (`src/hooks/`)

These ship alongside `components/ui/` because the shadcn primitives import them directly. They must be copied with the rest of the tree.

- `use-mobile` — `useIsMobile()` matchMedia hook. Imported by `components/ui/sidebar.tsx` for the mobile sheet fallback.

## Utils (`src/utils/`)

- `logger` — console logger with the four standard levels: `debug` (gated on `process.env.NODE_ENV !== "production"` — the `import.meta.env.DEV` variant broke under Next builds, so the `process` guard is deliberate; see the comment in `src/utils/logger.ts`), plus `info`/`warn`/`error` pass-throughs. Only `error` has a donor call site (`components/ui/error-boundary.tsx`); the other three exist for downstream consumers, because `/style-baseline` overwrites a target's copy of this file and a narrower donor surface breaks their call sites (see "Donor file scope" below). Swap for a real logger (Sentry, pino) in projects that need one — keep the same surface so the import doesn't churn.

## Archetypes (`src/components/archetypes/` + `docs/archetypes/`)

Archetypes are page-shape contracts that sit on top of the layout primitives. Each archetype is a 12–15 layer spec covering route, shell, header, toolbar, data fetching, types, mutations, mobile, permissions — plus reference primitive components that implement the chrome. See `docs/archetypes/README.md` for the methodology.

Apply with the sibling command `/style-archetypes` (requires `/style-baseline` to have run first). `docs/archetypes/MANIFEST.json` is the living catalog of what ships — read it (or `/style-archetypes --list`) rather than relying on any list enumerated here.

Archetypes are optional — projects that don't want the page-shape vocabulary can use the baseline chrome alone. Project-specific archetypes live alongside baseline ones in the target's `docs/archetypes/`; `/style-archetypes` never touches files that aren't in the MANIFEST.

## Layout primitives (`src/components/layout/`)

| Component     | Responsibility                                                 |
|---------------|----------------------------------------------------------------|
| `AppShell`    | Top-level composition — mounts `TooltipProvider`, `SidebarProvider`, and the toast viewport (`<Sonner>`). Slots: `sidebar`, `header`, `children`. |
| `AppSidebar`  | Brand + collapsible nav groups + footer. Takes `navItems`/`groups` + a `renderLink` prop so it stays router-agnostic. Persists collapsed groups to `localStorage` — pass `collapseStorageKey={null}` to run them uncontrolled (`defaultOpen`) instead, which is what an app whose shell sits in its root layout wants. `collapsible="icon"` + `rail` opt into the `ui/sidebar` icon rail; every nav row carries the primitive's `tooltip`, which is its only readable name once collapsed. An `aboveNav` slot sits between the header and the nav for a project's own workspace/tenant/asset switcher — `footer` would pin it to the bottom of the rail instead. |
| `AppHeader`   | Title + center slot (search) + right slot (actions, user menu). Sidebar trigger on mobile. |
| `PageHeader`  | Canonical **page** title block (distinct from the app `AppHeader`): title + optional subtitle / icon / actions / back-link. The single source of page-title typography — `text-lg font-semibold tracking-tight`. The archetype headers (`FormPageHeader`, `SettingsPageHeader`, `DetailOverviewHeader`) are thin wrappers that narrow its prop surface to their contract. Router-agnostic via `renderBackLink`. A `badges` slot renders read-only status `<Badge>`s inline next to the title (the detail-overview "one home for status"). |
| `NestedPageHeading` | Canonical **nested page** title — the middle rung of the heading ladder, between `PageHeader` (the `<h1>` page title) and `SectionHeading` (the overline sub-section label). Renders an `<h2>` at a single fixed scale (`text-base font-medium leading-tight tracking-tight`) with **no size/weight/variant prop** — the type scale is fixed in the component, per the appearance-locality rule (ADR 0004). Use when a parent route layout owns the `<h1>` (a tabbed sub-route like `/:resource/[id]/:section`) and the page below it still needs a title of its own (e.g. "Devices", "History", "Members"). Prop shape matches the `PageHeader` family — `title` + optional `subtitle` / `badges` / `actions` — so the three ladder rungs read as one family. |
| `SurfaceHeader` / `SurfaceHeaderSlot` | Canonical **header on the surface** — the kicker + title (+ optional `subtitle` / `icon`) bar rendered *inside* a framed shell's one bounded card, with a right-aligned `actions` cluster. Every framed archetype shell (report, calendar, wizard, feed, settings-page, the list drawer) mounts this, so the fleet shares one header treatment, driven by `--header-fill` (see "Header fill" above). (detail-overview composes `NestedPageHeading` directly in its Mode B header instead — a different role: a nested *page* title, not a surface kicker.) Distinct from `PageHeader`, which is the *classic* unbounded title block sitting above a page. `subtitle` is compact metadata at `text-xs` (matching `PageHeader`), auto-dimmed on a solid fill; use it rather than falling back to the classic header just to get a secondary line. |
| `SectionHeading` | Canonical **section** title — the "ledger" overline `<h2>` (`text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground`, i.e. `OVERLINE_CLASS`) + optional description / actions. The single source of sub-section title typography. Usually consumed via `SectionCard` (below); use it directly only for a bare heading with no bounding card. |
| `SectionCard` | Canonical **titled bounded section** — a card with an optional ruled `SectionHeading` title bar (+ description / actions slot) and a flush-or-padded body, graded by `tone`. The single source of the "heading bound to its content as one block" shape. Composed by `DetailSection` (detail-overview), grouped-list groups, and form-page field groups. A section heading should never float as plain text above a detached card — wrap the block in `SectionCard`. `chrome={false}` renders it chromeless (title bar + padding, no border/shadow) for embedding inside an already-bounded surface (e.g. the detail-overview shell's rail). |
| `StatTileRow` / `StatTile` | Canonical **KPI / aggregate strip** — one bounded surface with hairline-divided cells (`StatTile`: overline label + `text-2xl font-mono tabular-nums` value + optional hint). Shared across archetypes: detail-overview's `stats` slot and the analytics-dashboard KPI row. (Re-exported from `@/components/archetypes/detail-overview` for back-compat.) |
| `ProgressTracker` | Canonical **horizontal lifecycle / pipeline stepper** — an ordered set of stages with one `current` marker and `done`/`pending` states (dot + connector per stage). Token-pure (`--primary` for done/current, `border`/`muted` for pending) so it re-skins with the fleet. Promoted rule-of-2 (order lifecycle + deal pipeline); used in the detail-overview `content` slot. |
| `MetricList` / `MetricRow` | Canonical **compact "figures at a glance" readout** — a ruled vertical list with an emphasized right-aligned `tabular-nums` value and an optional "show more" disclosure (`MetricList more={…}`) for secondary figures. Neither `StatTileRow` (horizontal, wants the main column) nor `KeyValueRow` (no value emphasis/collapse) — a third shape for the Command Rail `summary` slot (Revenue + Gross profit / Gesamtwert + ARR pinned, the rest behind the disclosure). |
| `AuthCard` | Centered single-card shell for **off-app utility screens** — sign-in, not-authorized, generic error / 404. Title + optional icon/description + body (form/actions) + footer. A layout primitive (not a page archetype — these screens have no toolbar/data/list shape); render *outside* `AppShell`. |
| `SectionNavShell` | Secondary "section" layout — a grouped vertical nav (`ScrollArea`) beside a content slot. Takes `groups` + `pathname` + the same `renderLink` render-prop as `AppSidebar`, so it stays router-agnostic; the consumer passes its `<Outlet />` as `children`. Responsive: nav stacks above content below `md`. |
| `BottomNav`   | Mobile bottom-tab nav (`md:hidden`, fixed to viewport bottom). Takes `items` + optional `moreItems` that overflow into a bottom `<Sheet>` drawer. Pairs with `AppHeader.showSidebarTrigger={false}` when the app drives mobile nav from here instead of the sidebar sheet. **Not** router-agnostic — imports `NavLink` directly (see peer deps below). |
| `ThemeToggle` | Sun/moon icon `<Button>` opening a `<DropdownMenu>` with Hell/Dunkel/System options. Drives `next-themes` `setTheme`. Drop into the `AppHeader` `right` slot. Labels are German. |

Optional `NavItem` / `AppHeader` fields for niche shells:

- `NavItem.exact?: boolean` — require an exact pathname match for the active highlight. Set on parent routes (e.g. an `/admin` dashboard tile) that would otherwise stay highlighted on every sub-route like `/admin/users`. Default: prefix match (`pathname === path || pathname.startsWith(path + "/")`).
- `AppHeader.showSidebarTrigger?: boolean` (default `true`) — hide the mobile hamburger when the consumer owns mobile navigation outside the sidebar (e.g. a bottom-nav + a separate `<Sheet>` drawer). Leave default for projects that use the built-in mobile sidebar sheet.

Peer deps for the two optional primitives above:

- `ThemeToggle` requires **`next-themes`** (already a baseline dependency) — wrap your app in its `<ThemeProvider>`.
- `BottomNav` requires **`react-router-dom`** as a peer dependency. Unlike `AppSidebar`/`SectionNavShell`, it is **not** router-agnostic — it imports `NavLink` directly rather than taking a `renderLink` prop. The baseline does not declare `react-router-dom` (it stays router-neutral for the rest of the shell), so the consumer provides it. Next.js / TanStack-Router consumers should swap the `NavLink` calls or skip this primitive.

Pages own everything inside `<main>`. Cross-cutting things (search, notification bell, user menu) plug in via the header's `right` slot — the baseline doesn't ship them.

### Two-level navigation — `<SectionNavShell>`

Some sections (settings is the canonical case) need a *second* nav level: a grouped sub-nav that persists while you move between the section's pages. `<SectionNavShell>` is that layer. It is a layout primitive — a sibling of `<AppSidebar>`, **not** a page archetype — so it ships with `/style-baseline` and never needs `/style-archetypes`.

The shape is three nesting levels:

```
AppShell                       ← app chrome (sidebar + header + main)
 └─ <main>
     └─ SectionNavShell        ← mounted on the parent section route (e.g. /settings)
         ├─ aside (grouped sub-nav, scroll area)
         └─ children            ← the router's <Outlet/> = the active section page
             └─ SettingsPageShell  ← from the tabbed-settings (F2) archetype
```

Wire it on the parent route and pass the router's `<Outlet />` as `children`:

```tsx
// /settings route element
<SectionNavShell groups={settingsNavGroups} pathname={pathname}
  renderLink={(item, children) => <NavLink to={item.path}>{children}</NavLink>}>
  <Outlet />
</SectionNavShell>
```

The child pages rendered through the outlet are the archetype layer — typically a `<SettingsPageShell>` (tabbed-settings F2), which the shell's content slot hosts without padding clashes (`SettingsPageShell` omits outer padding precisely because a section layout supplies the inset). The nav-group *content* — routes, labels, icons — is consumer config; the primitive ships zero routes or domain nouns. See `src/examples/section-nav-demo.tsx` for a router-free worked example.

### Ownership boundary — baseline vs. project

The baseline owns the **rendering and interaction behaviour** of `<AppSidebar>` and `<AppHeader>`: markup, active-state styling, text-selection suppression on click, keyboard handling, collapse persistence, mobile sheet fallback. Behaviour bugs (e.g. clicking a nav item selecting its label) are baseline bugs — fix them once in the donor, then propagate to every target via `/style-baseline --force`.

The project owns the **content and grouping shape** of its navigation: the `navItems` / `groups` props it passes to `<AppSidebar>`, the flat-vs-grouped decision, labels, icons, route paths, and any project-specific switchers (e.g. `controlling-app`'s asset switcher). Two mature targets — `brickshop-manager` (flat domain groups) and `controlling-app` (asset-scoped nav) — deliberately use different grouping concepts, and that divergence is by design. Do **not** push project grouping logic up into the baseline.

If you find yourself patching `components/layout/Sidebar.tsx` or `components/ui/sidebar.tsx` inside a target project to fix a behaviour issue, stop — fix it in the donor here and re-run `/style-baseline --force` instead. The target's copy is a downstream snapshot, not an editable fork.

### Donor file scope — immutable primitives vs. starter files

Not every file the donor ships is meant to stay byte-identical in targets. There are two categories, and `/style-baseline --force` treats them **differently**: it overwrites the immutable primitives (with a `DRIFT:` report and an in-place keep-aid whenever a target had diverged) but **never overwrites a starter file** — an existing brand `tokens.css` and `components.json` are kept byte-identical, so a re-broadcast can never blast a target's brand palette away.

> **Donor-dev gallery is never broadcast.** The `gallery/` app, `vite.config.ts`, `gallery-dist/`, and the gallery-only dev deps (`vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `react-router-dom`) exist only so the baseline can be browsed visually (`npm run gallery`) and mounted as a "design plugin" in the dashboard hub. They are **not** part of the baseline — `/style-baseline` and `/style-archetypes` copy `src/...`, never the harness. Don't copy them into a target. Vocabulary for all of this is pinned in [`docs/TAXONOMY.md`](./TAXONOMY.md).

> **Donor component tests** live colocated as `*.test.tsx` next to the primitive they cover (see `src/components/archetypes/**/*.test.tsx`), run via `npm test` (`vitest.config.ts`, root-scoped). The test-only dev deps (`vitest`, `@testing-library/react`, `jsdom`) exist so the donor can regression-test behavior a type-only check can't verify — e.g. ref forwarding, where TypeScript can't tell a `ref` prop is silently discarded at runtime. **Caveat:** because `/style-archetypes` currently copies every `.tsx` file in an applied archetype's directory, a colocated `*.test.tsx` broadcasts into the target project along with the primitive — the target then needs the same test-only dev deps to typecheck/build, or the file should be excluded by the copy step. Not yet resolved; see the backlog.

**Immutable primitives** — donor is the source of truth; re-broadcast freely:

- `src/components/ui/*.tsx` (shadcn primitives — regenerated by the donor, never per-project)
- `src/components/layout/Sidebar.tsx`, `Header.tsx`, `AppShell.tsx`, `SectionNav.tsx` (only when the target uses them straight; brickshop-manager wraps them in its own `AppSidebar.tsx` / `MainLayout.tsx` and is the exception, not the rule)
- `src/lib/utils.ts`
- `src/hooks/use-mobile.ts`
- `src/utils/logger.ts` (kept framework-agnostic via `typeof process !== "undefined"` guard — do not "improve" by Vite-only or Next-only references)
- `src/styles/tokens.layer.css` — the donor-owned half of the tokens stack: `@import "tailwindcss"` entry, `@theme` config (colour/font/radius/motion roles + keyframes), `@custom-variant`, the utility definitions, layer base. It is the only tokens file the donor owns — the brand half below it is the only tokens file a target owns.

Because these are copied **over** a target's existing file, the donor's exported surface for the
`.ts`/`.tsx` ones must stay a **superset** of what the fleet already calls. Narrowing it (dropping
a method with no donor call site) does not deprecate a downstream caller — it breaks that
caller's typecheck on the next `/style-baseline --force`. Check the fleet before trimming an
export here, and widen rather than cut when a consumer is found. See `docs/ARCHITECTURE.md` §3a.
(For the `tokens.layer.css` there is no export surface to keep a superset of — the contract is
that a target's copy of its brand file imports it by relative path, so the layer may freely gain
`@theme` roles, keyframes and directives; a donor-side fix then reaches every target on the next
re-apply, with a `DRIFT:` line in the `/style-baseline` report naming the layer if the target's
copy had drifted.)

**Merged barrels** — donor owns the file but it is *not* clobbered wholesale:

- `src/components/{ui,layout}/index.ts` — the donor's export lines are the source of truth and overwrite the target's, **but** `/style-baseline` step 4b re-merges any project-local `export … from "./X"` line whose target module the donor doesn't ship. A naive `cp -R` would replace the barrel and silently forget local-only primitives that still exist on disk (e.g. mistra's `Breadcrumbs`/`PageHeader`), breaking every `@/components/layout` import on the next `tsc`. Convention for a product-local primitive that sits on top of the donor (per the consuming project's archetype layer): drop it in as `components/layout/<Name>.tsx` and add an `export … from "./<Name>"` line to `index.ts`. Because the donor ships no `<Name>` module, that line is preserved across every re-apply — no separate barrel, no import-site churn. Do **not** upstream such primitives into the donor merely to survive a re-apply; the merge is what makes them survivable while staying project-local.

**Starter files** — donor ships defaults, targets expected to diverge; `/style-baseline`
**keeps** an existing one (never clobbered, with or without `--force`):

- `src/styles/tokens.css` — the **brand token file**: `@import "./tokens.layer.css"` plus the
  `:root` and `.dark` HSL blocks (the Re-skin checklist below documents which values to
  override — re-broadcasting would blast brand colors away, which is precisely why it is the
  tokens file that is protected). Its whole content is the brand half; the donor-owned half
  (theme config, keyframes, `@plugin`/`@import` directives, layer base) lives in
  `tokens.layer.css` next to it and refreshes from the donor on every re-apply. A target that
  has been on the old merged single-file `tokens.css` is migrated on its next
  `/style-baseline --force`: the `:root`/`.dark` blocks are extracted verbatim into a kept
  brand file and the donor's layer lands beside it — brand values are then protected, and the
  donor half propagates again.
- `components.json` `style`/`rsc` flags (the `rsc` flag specifically must match the target's framework: `true` for Next App Router, `false` for Vite)

**Project-only files** — donor does not ship these; targets add as needed; broadcast must not delete:

- Project-specific layout additions (e.g. `BottomNav.tsx`, `ThemeToggle.tsx`, brickshop's customized `Header.tsx`). **Note:** the donor now ships a canonical `PageHeader.tsx` (see the layout table above) — a pre-existing project-local `page-header.tsx` (lowercase) is a *different* file and survives the barrel merge, but new projects should prefer the baseline `PageHeader` and migrate local title blocks onto it.
- Project-specific layout wrappers (brickshop's `AppSidebar.tsx`, `MainLayout.tsx`)

**Operating rule for `/style-baseline --force`**: review `git diff --stat` after the cp pass. Starter files never appear in it — they are kept byte-identical. The diff carries the immutable primitives, and step 4 prints a `DRIFT:` line naming every one that differed (prior version kept beside it as `<name>.local.<ext>`), so a narrowed donor surface is visible before the next typecheck instead of surfacing as a silent break. Reset a drifted starter only by deleting it and re-running (the donor's default comes back); project-only `.tsx`/`.ts` files survive automatically (cp -R never deletes; it overlays), and their barrel export lines are re-merged by step 4b (so a clobbered `index.ts` no longer forgets local-only primitives). The two real re-broadcasts of this kind to date (mistra PR #126, hk-crm PR #44) each needed a manual revert pass; with the keep-starters + `DRIFT:` report the revert pass is gone, and the curated diff review is the remaining step.

## Shared content molecules — same mental model, identical render

Two content patterns recur *inside* many different archetypes. To the user they're
the same thing, so they MUST look the same everywhere — same padding, fonts,
alignment, backgrounds, label positions — regardless of which archetype hosts
them. Each has exactly **one owner**; using it is mandatory, hand-rolling is drift.

- **A list/table of records → the shared `<Table>`** (`components/ui/table`), via
  the archetype's table shell (`ListWithDetailShell`, `SettingsTableShell`) or
  `<Table>` directly. A "team" tab, a settings table, a list-with-detail, an
  embedded detail table are the same molecule — all render through `<Table>`.
  **Never** hand-roll a record list as `<ul>`/`<div>` rows (it won't match the
  table's padding/borders/header treatment). (A chronological *feed* is a
  different molecule — see archetype H / `FeedItem`.)

- **A form field → the shared field stack**: a label *above* the control, using
  shadcn `<Label>` + `<Input>`/`<Select>`/`<Textarea>` with `space-y-1.5`. In an
  RHF form (form-page) use the bound `<FormField>`/`<FormLabel>`/`<FormControl>`/
  `<FormMessage>` variant — *same visual* (`<FormItem>` is pinned to the same
  `space-y-1.5` gap precisely so an RHF field and a manual field match). A field
  looks identical whether it's in the form-page, the extensive create form, or the
  slide-in crud-dialog. **Never** hand-roll `<label>`/`<input>`/`<select>` — the
  label weight, input height, focus ring, and spacing will drift.

Smaller molecules with the same single-owner rule (promoted from the 2026-06-14
consolidation pass, after an audit found each hand-rolled in 3–4 places):

| Molecule | Single owner | Never hand-roll |
|----------|--------------|-----------------|
| One-of-N mode/filter pill row | `SegmentedControl` (`ui/segmented-control`) | a `<div className="rounded-md border p-0.5">` of `<button>`s |
| Toolbar search box (incl. compact/mobile/clearable/match-counter) | `SearchInput` (`ui/search-input`) — `inputSize` (sm/default/lg), `clearable`, `count`, native passthrough (`inputMode`…) | a `relative max-w-sm` wrapper + `Search` icon + `<Input className="pl-9">`, or any hand-rolled clear-X / count caption |
| Per-row overflow menu | `RowActionsMenu` (`archetypes/shared`) | a private `⋯` `DropdownMenu` per shell |
| Loading / empty / error plane (icon + title + description + CTA) | `StateView` (`ui/state-view`) | inline "Loading…" / centered `<div>` / ad-hoc `<Alert>` / a two-line hand-rolled empty |
| Entity circle (icon / initials) | `IconAvatar` (`ui/icon-avatar`) | a `<span className="rounded-full bg-muted">` |
| Status / category chip | `<Badge>` (`ui/badge`) | a `<span className="rounded-full border px-2.5 py-0.5">` |
| Positive / caution status color | `--success` / `--warning` tokens (`styles/tokens.css`) | `bg-green-500`, `text-emerald-600`, `bg-amber-50`, or a second tone→class map beside `<Badge>`'s |
| Quality / affordance marker (e.g. rating stars) | `--rating` token (`styles/tokens.css`) — no `-foreground` pair, drawn onto the surface | `text-amber-500`, hard-coded hex star ink, or `--warning` for the star (it is a quality signal, not an alert) |
| Uppercase overline label | `OVERLINE_CLASS` (`layout/overline`), via `SectionHeading`/`StatTile` | a re-typed `text-xs uppercase tracking-*` string |
| Editable control flush in a table/grid cell | `CellInput` / `CellSelect` (`ui/cell-input`) | a bare native `<input>`/`<select>` in a `<td>` |
| Native colour picker (swatch + hex) | `ColorField` (`ui/color-field`) | a bare boxed `<input type="color">`, with or without a paired hex `<Input>` |
| Native file picker (trigger + selected row) | `FileField` (`ui/file-field`) — `variant` (button/dropzone), `accept`, `multiple`, `busy`, `maxSizeBytes` | a hidden `<input type="file">` + hand-rolled trigger / `input.value=""` reset / filename+size row |

One **deliberate** non-molecule (don't force it onto the owners above): the
matrix-grid pivot `<table>` (sticky columns + group spans — not a record list). Its
inline-cell control is no longer a carve-out — that's now the `CellSelect` molecule
(`ui/cell-input`), the shared owner of any editable control sitting flush in a cell. Standalone page toolbars (grouped-list,
feed) are a bare `flex gap-3` row; toolbars *inside* a bounded surface (list,
settings, kanban, matrix) are rendered by the `<SurfaceFrame>` `toolbar` slot as
the ruled `border-b px-4 py-3` band — same gap, different chrome by context.
The band's chrome is owned by the frame; a shell never spells the band itself.

This is the same discipline as the page frame (one inset owner) and headings (one
`PageHeader`): consistency by construction. The bounded surface has one owner
too — `<SurfaceFrame>` (`layout/SurfaceFrame`): the flat `rounded-lg border bg-card`
frame (House style B — no shadow) every framed archetype shell mounts. Shells
compose it with the on-surface header + an optional `toolbar` slot; the four
independent spellings the copy used to allow (`shadow-sm` in one shell,
`overflow-x-auto` in another) are its named modes, not separate frames. A reviewer's test in the gallery: two
tables, two fields, or two of any molecule above, in *different* archetypes must be
visually indistinguishable.

## The baseline is a design language — and how project add-ons stay native

The components in this repo are the convenience layer. The thing that actually
unifies the fleet is the **design language underneath them: tokens + atoms +
recipes.** Every project will, legitimately, need components the baseline doesn't
ship (domain-specific surfaces, one-off interactions). The goal is not to forbid
those — it's that **nobody can tell which components are baseline and which are the
project's own.** That holds only if the add-ons are built from the same substrate.

Two independent questions for any element (don't conflate them):

- **Own it?** (Axis A) — promote to a shared component only if its structure +
  behaviour recurs (rule-of-2) and is stable. Most things eventually should; some
  never will. "Special functionality" is no excuse to skip the *look* — an
  inline-cell editor is functionally special but visually just an `<Input>`.
- **Conform to the look?** (Axis B) — **mandatory for everything**, baseline and
  add-on alike.

### Conformance contract for project-specific components (the add-on rule)

A component the baseline will never own must still:

1. **Use tokens, never literals.** `bg-muted` / `text-muted-foreground` /
   `border-input` / `text-destructive` / `<Badge variant>` — never `bg-green-100`,
   `text-slate-500`, hard-coded hex, or arbitrary `rounded-[..]`/`shadow-[..]`.
2. **Compose from the shipped atoms** — `Button`, `Input`, `Select`, `Card`,
   `Badge`, `Table` — never raw `<button>`/`<input>` where an atom exists.
3. **Follow the recipes** — the spacing rhythm, density, focus ring, and heading /
   overline signatures documented above.

An add-on that does these three reads as native with zero baseline code behind it.
The fleet audit's **Axis-B conformance scan** enforces this against *all*
components, not just adopted ones — a rising conformance count is the early
signal that the base/add-on seam is starting to show. When a hand-rolled pattern
crosses the rule-of-2 (appears in a 2nd project), it trips onto the
[promotion radar](PROMOTION-RADAR.md) as an Axis-A candidate to absorb into the
baseline.

## The fleet audit rubric — what the scanners score

The fleet audit is a **read-only** sweep (it measures; it never gates and never
writes to an audited project — see [RULES.md](RULES.md)) that maps every
frontend project's pages onto the baseline archetypes and scores three axes:
**Axis A** (molecule drift — hand-rolled what the donor owns), **Axis B**
(conformance — off the visual substrate), **Axis C** (adoption quality — adopted
the shell but kept the legacy content). Each axis's deterministic half is the
machine form in [`docs/audit-signals.json`](audit-signals.json); its LLM half is
the per-page walk. Axis C's full treatment lives in
[`docs/ADOPTION-QUALITY.md`](ADOPTION-QUALITY.md).

**Two independent questions for every hand-rolled element** (don't conflate
them):

- **Axis A — should it be a shared *component* the donor owns?** Yes if its
  structure + behaviour recurs (rule-of-2) and is stable. Routing per finding:
  `promote` (a new primitive or a variant on an existing one) | `wrap` (a thin
  wrapper around a native control — even native-only gaps like
  `<input type="color|file">` get wrapped so they're shared *and* on-token) |
  `adopt-existing` (the donor already owns the molecule) | `conform-only`
  (Axis B is the whole disposition) | `sanctioned` (rare — both singular *and*
  already fully token-conformant). "Special functionality" is not an escape: an
  inline-cell editor is functionally special but visually just an `<Input>`.
- **Axis B — must it obey the shared *visual language* (tokens, spacing scale,
  radius, focus ring, typography, composed atoms)?** Always yes, no exceptions —
  including the legitimately project-specific elements the donor will never own.

### Molecule rubric (Axis A — hand-rolled molecule → owner)

Grep-able heuristics for hand-rolled content molecules a baseline component
already owns. Each match is a 🔴 drift hit pointing at the owner — signals, not
proof; a human confirms. Where the donor lacks the owner but the pattern
recurs, the routing is promote/wrap, not "exception".

| Hand-rolled signal (regex-ish) | Should use |
|--------------------------------|------------|
| `<ul`/`<div>` rows rendering a record list (cells, columns) | `<Table>` |
| `<label` / `<input` / `<select` / `<textarea` (raw, not shadcn) | shared field stack (`<Label>`+`<Input>`/`<Select>`/`<Textarea>` or RHF `<FormField>`) |
| `<input type="color">` (boxed swatch, optional hex `<Input>`) | `ColorField` (`ui/color-field`) |
| `<input type="file">` (hidden + hand-rolled trigger / dropzone / filename row) | `FileField` (`ui/file-field`) |
| `rounded-md border p-0.5` wrapping `<button>`s | `SegmentedControl` |
| `relative … max-w-sm` + `Search` icon + `<Input className="pl-9">` | `SearchInput` |
| `rounded-full border px-2.5 py-0.5` text pill | `<Badge>` |
| `rounded-full bg-muted` icon/initials circle | `IconAvatar` |
| inline `"Loading…"` / centered muted `<div>` / ad-hoc `<Alert>` for empty/error | `StateView` |
| re-typed `text-xs … uppercase tracking-*` overline | `OVERLINE_CLASS` / `SectionHeading` |
| private `⋯` `DropdownMenu` per table | `RowActionsMenu` (`archetypes/shared`) |

### Conformance rubric (Axis B — applies to EVERY component, incl. add-ons)

Catches the deeper problem the molecule rubric misses: **a hand-rolled thing
that doesn't look like ours.** Runs against all components — baseline, adopted,
and the legit project-specific add-ons — because that's what keeps the add-ons
visually native. A conformance hit is not "adopt a baseline component"; it's
"however you build this, build it from our substrate."

| Conformance violation (signal) | Should use |
|--------------------------------|------------|
| Literal palette color: `bg-/text-/border-(slate|gray|zinc|green|red|blue|amber|yellow|emerald|teal)-\d00` | semantic tokens (`bg-muted`, `text-muted-foreground`, `border-input`, `text-destructive`, `bg-primary`, `<Badge variant>`) |
| Hard-coded hex/rgb in `className` or `style` | tokens |
| `focus:ring-1` / `focus:outline-none` without `focus-visible:ring-2 ring-ring` | the standard focus ring |
| Hard-coded radius/shadow (`rounded-[..]`, arbitrary `shadow-[..]`) | `rounded-md`/`rounded-lg`, token shadows |
| Ad-hoc spacing off the scale (`p-[7px]`, `gap-[5px]`) | the 4px spacing scale + the rhythm above |
| Raw `<button>`/`<input>`/`<select>`/`<textarea>` where a shadcn atom exists | the shadcn atom (`Button`/`Input`/…) |
| Re-declared typography (`text-[13px]`, custom uppercase tracking) | the heading/overline signatures (`OVERLINE_CLASS`, etc.) |

Records land per route as `moleculeDrift` / `conformanceViolations` /
`handRolledMolecules` rows (the fleet pass clusters the last fleet-wide — that
cluster is what feeds the promotion radar).

### Page-level pass (fit + adoption)

The page-level walk classifies each route against the archetype set (a fit
score, driven by the signals recorded per route so a human can override it) and
flags it `adopted` (imports the archetype's baseline primitive) vs
`hand-rolled` (matches the shape, doesn't use the primitive — divergence) vs
`gap` (resembles nothing — a candidate new archetype; the durable form of the
gap list is the promotion radar).

| Signal | Archetype |
|--------|-----------|
| Table + row→detail/panel navigation | A — list-with-detail |
| Table on a `/settings/*` route, row→edit-dialog | D2 — settings-table |
| Table partitioned into titled sections | K — grouped-list |
| 2-D grid, rows × columns, cell interactions | M — matrix-grid |
| RHF form on a dedicated create/edit route | B — form-page |
| Side sheet / dialog with view·edit·create modes | J — crud-dialog |
| Read-only entity page, sections + stat tiles | C — detail-overview |
| Top tab strip delegating to per-tab bodies | F2 — tabbed-settings |
| Matches none ≥ 0.5 | (gap — candidate) |

**Fit score:** `1.0` = uses the baseline primitive (adopted, exact).
`0.6–0.9` = matches the shape structurally but hand-rolled (divergence
candidate). `< 0.5` = weak/no match (gap candidate).

### Triage rubric (green/yellow/red)

Fleet-wide application of the green/yellow/red enforcement grid (placement's
grid: [PLACEMENT.md](PLACEMENT.md)):

- 🟢 **green** — adopted + current. No action.
- 🟡 **yellow** — *essential* variation (domain-appropriate divergence). Action:
  leave it, or capture it as a **variant axis** on the archetype (like
  `crud-dialog layout`). NOT something to flatten.
- 🔴 **red** — *accidental* drift: a page that hand-rolls a shape an archetype
  already covers. Action: adopt / reconcile.
- ➕ **gap** — a shape recurring in ≥ 2 projects with no archetype. Action:
  promote a new archetype (rule-of-2, evidence-backed).
- 🔴 **molecule drift** (Axis A, within-page scan) — a hand-rolled molecule where
  a shared owner exists. Always red, usually low-effort: swap to the primitive.
  Cluster fleet-wide so one sweep fixes a whole class.
- 🟠 **conformance violation** (Axis B) — an element off the visual substrate.
  Applies to *every* component incl. legit add-ons. Action: re-base on
  tokens/atoms — does not require a baseline component.
- 🔴 **wrapper adoption** (Axis C) — the adopted-but-not-torn-down state; its
  tier and action live in [ADOPTION-QUALITY.md](ADOPTION-QUALITY.md#triage-tier).
- ➕ **promotion candidate** (rule-of-2 on hand-rolled molecules) — a pattern the
  donor doesn't own yet, now hand-rolled in ≥ 2 projects. Action: promote/wrap
  into the donor — the root-cause heal.

The hardest, most valuable call is **yellow vs red** — the audit proposes a tier
per finding; a human confirms. Default ambiguous cases to yellow (don't unify
away real difference).

### How it runs

A multi-agent fan-out (one read-only scanner per project, in parallel) → a
single synthesis pass that aggregates, clusters gaps, and triages. Every action
is a proposal a human schedules (a `/ticket`, an iteration session); the
deterministic per-family greps run from `audit-signals.json`, and Axis C's
recurring machine half is the donor's zero-dep
`scripts/scan-adoption-quality.mjs` ([ADR-0005](adr/0005-adoption-quality-scan-zero-dep-donor-script.md))
— discovery radar, never a gate.

## Conventions

- **Path alias**: `@/` → `src/`. Configure in `tsconfig.json` and your bundler (vite or next).
- **Class composition**: always use `cn()` from `@/lib/utils` — `clsx` + `tailwind-merge` so conflicting utilities are resolved deterministically.
- **Variants**: when a component needs sizes or visual variants, reach for CVA (see `button.tsx`).
- **Forms**: `react-hook-form` + `zod` schema + shadcn `<Form>`. No `<form>` without RHF.
- **Toasts**: `sonner` is the only toast runtime (`import { toast } from "sonner"`); `AppShell` mounts its `<Toaster>` viewport.
- **Server vs client components** (Next.js): the layout primitives and most shadcn components are interactive — mark the files that import them with `"use client"`. The `/style-baseline` skill does this for you when scaffolding into a Next project.

## Re-skin checklist

When applying the baseline to a new project with its own brand:

1. Edit `src/styles/tokens.css`:
   - Override `--primary`, `--secondary`, `--accent` (and dark variants) with the brand HSLs.
   - Bind a project's own faces (`--font-sans` / `--font-mono`) by uncommenting the FONT BINDING block near the bottom — leave it commented to inherit the house faces.
   - Override `--radius` if the brand wants squared or pill-shaped UI.
   - Leave `--success` / `--warning` alone unless the brand genuinely redefines
     them — they are semantic, not brand, and the donor defaults are already
     contrast-checked in both themes.
   - The `--status-{success,warning,danger,info,neutral}-{bg,fg}` pairs own the
     soft chip tier `Badge`/`Alert` status variants key off; the donor defaults
     are AA-verified in both themes. Re-skin the chip tier here — the roles
     (`--color-status-*`) live in the donor-owned layer, so the brand file is
     the only seam. `danger` has its own pair and is NOT `--destructive`:
     re-skinning the red independently is a deliberate decision, not a bug.
   - `--rating` is the quality/affordance ink (e.g. rating stars) — it lightens
     in `.dark` for on-surface legibility but carries no `-foreground` pair;
     override the donor default only if the brand's rating marker genuinely
     needs a different hue.
   - Tweak `--sidebar-*` for a contrasting sidebar surface if desired.
2. Set the brand font in the project entry (Next: `next/font/google`; Vite: `<link>` in `index.html`).
3. Replace the `brand` and `appName` props on `<AppSidebar>` with real values.
4. Wire up `renderLink` to the project's router.
5. Plug in the project's auth (user menu, sign-out) via `<AppHeader right={...}>`.

No need to touch any file in `components/ui/` — the whole library re-skins automatically.
