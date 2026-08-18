---
slug: tabbed-settings
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/tabbed-settings.md
---

# Tabbed settings — baseline reference implementation

> The stack-specific binding of the [tabbed-settings contract](./tabbed-settings.md)
> to the **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell).
> Each role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<SettingsPageShell>` / `<SettingsPageHeader>` — shared primitives.

**Location:** `src/components/archetypes/tabbed-settings/`

### What they provide

`<SettingsPageShell>` wraps every settings-page body (tabbed settings, settings
form, settings table) with:
1. an error boundary — catches render errors,
2. an optional breadcrumb slot,
3. `<SettingsPageHeader>` — title plus optional subtitle / icon / actions,
4. a `space-y-6` body container with no outer padding.

### Signatures

```ts
type SettingsPageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  actions?: ReactNode;       // empty for F2; used by the D1 form consumer
  className?: string;
};

type SettingsPageShellProps = SettingsPageHeaderProps & {
  breadcrumbs?: ReactNode;   // slot — derivation is project-specific
  children: ReactNode;       // F2: <Tabs>; D1: <form>; D2: settings-table shell
};
```

### Notes

- The `actions` slot is always empty for tabbed-settings pages (no page-level
  actions). A settings-form (D1) page may use it for a Save button. A
  settings-table (D2) page leaves it empty (its toolbar handles actions).
- The outer container intentionally omits padding — the page inset is owned by
  `<AppShell>`'s `<main>` (docs/STYLE.md); the shell never adds its own.
- `<SettingsPageHeader>` is a thin wrapper over the baseline `<PageHeader>`
  layout primitive (`@/components/layout`) — it narrows the surface to the
  settings contract while title layout and typography live in one place.

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each
contract role. Only layers with a baseline-specific binding appear.

### Layer 2 — Page shell
- Content-shell primitive → `<SettingsPageShell>` (`src/components/archetypes/tabbed-settings/`).
- Canonical vertical rhythm → `space-y-6` stack wrapping breadcrumbs + header + body.
- Render-error boundary → `<ErrorBoundary>` (provided by `<SettingsPageShell>`).
- Page inset → `<AppShell>`'s `<main>` supplies it — the shell adds none.
- Forbidden page inset → `p-6`, `px-6 py-6` on the page's own outer container.
- Page-header treatment → `<SettingsPageHeader>` exclusively (no inline `<h1>`/`<h2>`).

### Layer 3 — Page header
- Board-form on-surface header bar → the shared `<SurfaceHeader>`
  (`@/components/layout/SurfaceHeader`), rendered inside a bounded card when
  `kicker` and/or `headerActions` is passed to `<SettingsPageShell>` (suppresses
  `<SettingsPageHeader>`).
- No-actions slot → `headerActions` (board form) / `actions` (classic
  `<SettingsPageHeader>`, from `SettingsPageHeaderProps`) stay empty for F2.
- Classic page-header treatment → `<SettingsPageHeader>`, a thin wrapper over the
  baseline `<PageHeader>` layout primitive (`@/components/layout`).
- Canonical page-title type style → `text-lg font-semibold` (both the board-form
  `SurfaceHeader` and the classic `<SettingsPageHeader>` render at this scale).

### Layer 4 — Tab strip
- Tab-strip primitive → the design system's `Tabs` / `TabsList` / `TabsTrigger`.
- Dropdown select (forbidden alternative) → `<Select>`.

### Layer 5 — Per-tab body delegation
- Divider → `<Separator>`, used below the `Tabs` component at the page level for
  a persistent below-tab section.

### Layer 7 — Empty / loading / error states
- Render-error boundary → the error boundary provided by `<SettingsPageShell>`.

### Layer 10 — Mutations & invalidation
- Confirm-dialog primitive → the crud-dialog / `<AlertDialog>` pattern.

### Migration acceptance checklist
- Layer 2 → `<SettingsPageShell>`; no outer padding class when nested in a
  settings layout.
- Layer 3 → title (board-form `SurfaceHeader` or classic `<SettingsPageHeader>`)
  is `text-lg font-semibold`.
- Layer 4 → design-system `Tabs` primitives.
- Layer 5 → persistent below-tab content separated by a `Separator`.

### Acceptance gate
- Tab-strip deck (forbidden pattern) → a `Tabs` deck wrapping unrelated pages.

### Revision log — implementation detail
- **v1.0 (2026-05-31):** De-source-ified from brickshop-manager (source spec
  v1.1): brickshop routes (`/data-mapping`, `/settings/*`), framework specifics
  (`<ProtectedRoute>`, `<MainLayout>`, `<SettingsLayout>`, the `<S>` Suspense
  helper), and stack brands (React Query `staleTime`/query keys, Supabase
  `supabase.from()`, Sonner, shadcn `useToast`) generalised into
  framework-neutral contracts. The `<SettingsPageShell>` breadcrumb auto-derive
  (router `useLocation()` in the source) became an explicit slot. Header split
  into `<SettingsPageShell>` + `<SettingsPageHeader>` to match the baseline
  form-page convention.
- **2026-07-03:** Board-form sync: on-surface `SurfaceHeader` header, ledger
  title scale, single-owner molecule references.
