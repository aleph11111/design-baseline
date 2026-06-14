# Style guide

The design-baseline defines a small, opinionated foundation: **shadcn/ui + Tailwind 4 + HSL CSS variables + a sidebar-and-header app shell**. Every project that starts from this baseline gets the same components, tokens, and layout shape — only the brand colors and the nav items differ.

## Tech stack

| Layer        | Choice                                                |
|--------------|-------------------------------------------------------|
| UI primitives | shadcn/ui (Radix + Tailwind), 36 components          |
| Styling      | Tailwind CSS 4 (CSS-first config, no `tailwind.config.ts`) |
| Icons        | `lucide-react`                                        |
| Forms        | `react-hook-form` + `zod` (via shadcn `<Form>`)       |
| Toasts       | `sonner` + shadcn `<Toaster>` (both mounted)          |
| Dark mode    | `.dark` class on `<html>` (use `next-themes` to drive)|
| Variants     | `class-variance-authority` (CVA) + `cn()`             |

Charts, data fetching, and auth are **not** in the baseline — pick per project.

## Design tokens

All tokens are HSL triplets in `src/styles/tokens.css`. Every shadcn component reads them via Tailwind utilities like `bg-background`, `text-foreground`, `border-input`. To re-skin: edit the HSL values in `:root` and `.dark`; nothing else changes.

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
| `border` / `input`    | `214.3 31.8% 91.4%`       | `217.2 32.6% 17.5%`       | Borders, input outlines               |
| `ring`                | `222.2 84% 4.9%`          | `212.7 26.8% 83.9%`       | Focus ring                            |
| `sidebar-*`           | (separate palette)        | (separate palette)        | Sidebar surface + accents             |

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
| `px-2 py-2` | Dense grid cells (matrix-grid) — the one place padding tightens below `px-4` |

**Grid gaps:** `gap-6` between two-column form sections; `gap-4` for paired fields and dialog two-column bodies; `gap-2`/`gap-3` for inline control clusters.

### Typography

No custom font is bundled. The baseline relies on the system stack from Tailwind. Set a custom font in the target project: either via `next/font` (Next.js) or a `@font-face`/`<link>` in `index.html` (Vite). Then add the family to a top-level wrapper class.

**Heading signatures** (canonical, do not hand-roll — compose the layout primitives that own them):

| Level | Token | Owned by |
|-------|-------|----------|
| Page title (`h1`) | `text-2xl font-semibold tracking-tight` | `PageHeader` |
| Section title (`h2`) | `text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground` ("ledger overline") | `SectionHeading` |

## Component inventory (`src/components/ui/`)

Standard shadcn/ui set:

`accordion`, `alert`, `alert-dialog`, `avatar`, `badge`, `button`, `calendar`, `card`, `checkbox`, `collapsible`, `command`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `pagination`, `popover`, `progress`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `tooltip`

Plus:

- `confirmation-dialog` — opinionated wrapper around `AlertDialog` for "Are you sure?" prompts.
- `error-boundary` — React `ErrorBoundary` class component (depends on `@/utils/logger`).
- `use-toast` — re-export shim that points at `@/hooks/use-toast` so legacy callers keep working.

Don't modify these files directly. To extend or recolor a component, wrap it. To upgrade, regenerate with `npx shadcn add <name>` after copying.

## Hooks (`src/hooks/`)

These ship alongside `components/ui/` because the shadcn primitives import them directly. They must be copied with the rest of the tree.

- `use-mobile` — `useIsMobile()` matchMedia hook. Imported by `components/ui/sidebar.tsx` for the mobile sheet fallback.
- `use-toast` — canonical shadcn reducer-based toast hook. Imported by `components/ui/toaster.tsx` and re-exported from `components/ui/use-toast.ts`.

## Utils (`src/utils/`)

- `logger` — thin `console.{debug,info,warn,error}` wrapper, with `debug` gated on `import.meta.env.DEV`. Imported by `components/ui/error-boundary.tsx`. Swap for a real logger (Sentry, pino) in projects that need one — keep the same surface so the import doesn't churn.

## Archetypes (`src/components/archetypes/` + `docs/archetypes/`)

Archetypes are page-shape contracts that sit on top of the layout primitives. Each archetype is a 12–15 layer spec covering route, shell, header, toolbar, data fetching, types, mutations, mobile, permissions — plus reference primitive components that implement the chrome. See `docs/archetypes/README.md` for the methodology.

Apply with the sibling command `/style-archetypes` (requires `/style-baseline` to have run first). The first ship covers list-with-detail, settings-table, and crud-dialog.

Archetypes are optional — projects that don't want the page-shape vocabulary can use the baseline chrome alone. Project-specific archetypes live alongside baseline ones in the target's `docs/archetypes/`; `/style-archetypes` never touches files that aren't in the MANIFEST.

## Layout primitives (`src/components/layout/`)

| Component     | Responsibility                                                 |
|---------------|----------------------------------------------------------------|
| `AppShell`    | Top-level composition — mounts `TooltipProvider`, `SidebarProvider`, `<Toaster>`, `<Sonner>`. Slots: `sidebar`, `header`, `children`. |
| `AppSidebar`  | Brand + collapsible nav groups + footer. Takes `navItems`/`groups` + a `renderLink` prop so it stays router-agnostic. Persists collapsed groups to `localStorage`. |
| `AppHeader`   | Title + center slot (search) + right slot (actions, user menu). Sidebar trigger on mobile. |
| `PageHeader`  | Canonical **page** title block (distinct from the app `AppHeader`): title + optional subtitle / icon / actions / back-link. The single source of page-title typography — `text-2xl font-semibold tracking-tight`. The archetype headers (`FormPageHeader`, `SettingsPageHeader`, `DetailOverviewHeader`) are thin wrappers that narrow its prop surface to their contract. Router-agnostic via `renderBackLink`. |
| `SectionHeading` | Canonical **section** title — the "ledger" overline `<h2>` (`text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground`) + optional description / actions. The single source of sub-section title typography. Usually consumed via `SectionCard` (below); use it directly only for a bare heading with no bounding card. |
| `SectionCard` | Canonical **titled bounded section** — a card with an optional ruled `SectionHeading` title bar (+ description / actions slot) and a flush-or-padded body, graded by `tone`. The single source of the "heading bound to its content as one block" shape. Composed by `DetailSection` (detail-overview), grouped-list groups, and form-page field groups. A section heading should never float as plain text above a detached card — wrap the block in `SectionCard`. |
| `StatTileRow` / `StatTile` | Canonical **KPI / aggregate strip** — one bounded surface with hairline-divided cells (`StatTile`: overline label + `text-2xl tabular-nums` value + optional hint). Shared across archetypes: detail-overview's `stats` slot and the analytics-dashboard KPI row. (Re-exported from `@/components/archetypes/detail-overview` for back-compat.) |
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

Not every file the donor ships is meant to stay byte-identical in targets. There are two categories, and `/style-baseline --force` treats them the same way (overwrites both), so the operator running the broadcast is responsible for reviewing the diff before accepting it.

> **Donor-dev gallery is never broadcast.** The `gallery/` app, `vite.config.ts`, `gallery-dist/`, and the gallery-only dev deps (`vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `react-router-dom`) exist only so the baseline can be browsed visually (`npm run gallery`) and mounted as a "design plugin" in the dashboard hub. They are **not** part of the baseline — `/style-baseline` and `/style-archetypes` copy `src/...`, never the harness. Don't copy them into a target. Vocabulary for all of this is pinned in [`docs/TAXONOMY.md`](./TAXONOMY.md).

**Immutable primitives** — donor is the source of truth; re-broadcast freely:

- `src/components/ui/*.tsx` (shadcn primitives — regenerated by the donor, never per-project)
- `src/components/layout/Sidebar.tsx`, `Header.tsx`, `AppShell.tsx`, `SectionNav.tsx` (only when the target uses them straight; brickshop-manager wraps them in its own `AppSidebar.tsx` / `MainLayout.tsx` and is the exception, not the rule)
- `src/lib/utils.ts`
- `src/hooks/use-mobile.ts`, `use-toast.ts`
- `src/utils/logger.ts` (kept framework-agnostic via `typeof process !== "undefined"` guard — do not "improve" by Vite-only or Next-only references)

**Merged barrels** — donor owns the file but it is *not* clobbered wholesale:

- `src/components/{ui,layout}/index.ts` — the donor's export lines are the source of truth and overwrite the target's, **but** `/style-baseline` step 4b re-merges any project-local `export … from "./X"` line whose target module the donor doesn't ship. A naive `cp -R` would replace the barrel and silently forget local-only primitives that still exist on disk (e.g. mistra's `Breadcrumbs`/`PageHeader`), breaking every `@/components/layout` import on the next `tsc`. Convention for a product-local primitive that sits on top of the donor (per the consuming project's archetype layer): drop it in as `components/layout/<Name>.tsx` and add an `export … from "./<Name>"` line to `index.ts`. Because the donor ships no `<Name>` module, that line is preserved across every re-apply — no separate barrel, no import-site churn. Do **not** upstream such primitives into the donor merely to survive a re-apply; the merge is what makes them survivable while staying project-local.

**Starter files** — donor ships defaults, targets expected to diverge:

- `src/styles/tokens.css` HSL values inside `:root` and `.dark` (the Re-skin checklist below documents which to override — re-broadcasting blasts brand colors away). The rest of the file (theme config, keyframes, `@plugin` directives, layer base) is donor-owned.
- `components.json` `style`/`rsc` flags (the `rsc` flag specifically must match the target's framework: `true` for Next App Router, `false` for Vite)

**Project-only files** — donor does not ship these; targets add as needed; broadcast must not delete:

- Project-specific layout additions (e.g. `BottomNav.tsx`, `ThemeToggle.tsx`, brickshop's customized `Header.tsx`). **Note:** the donor now ships a canonical `PageHeader.tsx` (see the layout table above) — a pre-existing project-local `page-header.tsx` (lowercase) is a *different* file and survives the barrel merge, but new projects should prefer the baseline `PageHeader` and migrate local title blocks onto it.
- Project-specific layout wrappers (brickshop's `AppSidebar.tsx`, `MainLayout.tsx`)

**Operating rule for `/style-baseline --force`**: review `git diff --stat` after the cp pass and revert any change to a Starter file unless you explicitly want to reset to donor defaults. Project-only `.tsx`/`.ts` files survive automatically (cp -R never deletes; it overlays), and their barrel export lines are re-merged by step 4b (so a clobbered `index.ts` no longer forgets local-only primitives). The two real re-broadcasts of this kind to date (mistra PR #126, hk-crm PR #44) each needed a manual revert pass — that's the expected workflow, not a defect.

## Conventions

- **Path alias**: `@/` → `src/`. Configure in `tsconfig.json` and your bundler (vite or next).
- **Class composition**: always use `cn()` from `@/lib/utils` — `clsx` + `tailwind-merge` so conflicting utilities are resolved deterministically.
- **Variants**: when a component needs sizes or visual variants, reach for CVA (see `button.tsx`).
- **Forms**: `react-hook-form` + `zod` schema + shadcn `<Form>`. No `<form>` without RHF.
- **Toasts**: prefer `sonner` (`import { toast } from "sonner"`) for new code; the shadcn `<Toaster>` is mounted for legacy `use-toast` callers.
- **Server vs client components** (Next.js): the layout primitives and most shadcn components are interactive — mark the files that import them with `"use client"`. The `/style-baseline` skill does this for you when scaffolding into a Next project.

## Re-skin checklist

When applying the baseline to a new project with its own brand:

1. Edit `src/styles/tokens.css`:
   - Override `--primary`, `--secondary`, `--accent` (and dark variants) with the brand HSLs.
   - Override `--radius` if the brand wants squared or pill-shaped UI.
   - Tweak `--sidebar-*` for a contrasting sidebar surface if desired.
2. Set the brand font in the project entry (Next: `next/font/google`; Vite: `<link>` in `index.html`).
3. Replace the `brand` and `appName` props on `<AppSidebar>` with real values.
4. Wire up `renderLink` to the project's router.
5. Plug in the project's auth (user menu, sign-out) via `<AppHeader right={...}>`.

No need to touch any file in `components/ui/` — the whole library re-skins automatically.
