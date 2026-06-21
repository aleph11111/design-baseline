---
key: F2
slug: tabbed-settings
kind: page
version: 1.1
promoted_from: brickshop-manager
promoted_at: 2026-05-31
source_spec_version: 1.1
status: locked
---

# F2 — Tabbed settings archetype — Spec

This document is the cross-project contract for every **tabbed settings** page.
Any new page of this archetype must satisfy every rule marked *required*.

The archetype owns the shared `<SettingsPageShell>` / `<SettingsPageHeader>`
primitives, which are also reused by the settings-form (D1) and settings-table
(D2) archetypes.

---

## What this archetype is

A **tabbed settings** page is an admin/config surface where multiple settings
categories are organized under a top-level tab strip. Tabs are navigation
within the settings page — each tab reveals a distinct body. The defining
distinctions from a domain hub (F1) are:

- **No page-level actions.** Tabbed-settings pages have no global action buttons
  (no "Refresh All", no period selector). Actions are per-tab and live inside
  the tab body.
- **No URL tab sync required.** Admin/config surfaces do not need deep-linking
  by default. A page may opt in (documented per-page), but this is not mandated.
- **Per-tab body delegation.** Each tab body must satisfy one of: list-with-detail
  (A), settings-form (D1), or settings-table (D2). Forbidden body types are
  listed under Layer 5.

---

## The twelve-layer spec

### Layer 1 — Route config

**Required:**
- The page module is lazy-imported (code-split), e.g.
  `const Page = lazy(() => import("./pages/settings/SomePage"))`.
- The route is wrapped in a suspense fallback.
- The route is behind the app's auth guard with no role requirement.

**Allowed variation:**
- **Settings-tree pages** (nested under a shared settings layout route): inherit
  the auth guard, app shell, and settings layout from the parent route. Do not
  re-apply them at the child route.
- **Standalone pages** (not under a settings layout): apply the auth guard and
  app shell inline on the route. These render full-width with no settings
  sidebar and must supply their own page inset (see Layer 2).

**Forbidden:**
- Static (non-lazy) imports of tabbed-settings pages — bundle-size regression.
- Re-applying the auth guard / app shell at a child route that already inherits
  them from a parent.

### Layer 2 — Page shell

**Required (via `<SettingsPageShell>`):**
- Outer container is a `space-y-6` stack wrapping breadcrumbs + header + body.
- An error boundary wraps all page content (provided by the shell).
- Breadcrumbs render at the top, above the header, when supplied.
- The page header renders the title block.
- No outer padding classes on the page component itself — the surrounding
  settings layout supplies the inset for settings-tree pages.

**Allowed variation:**
- **Standalone pages:** pass `className` (e.g. `container mx-auto px-6 py-6`) to
  add the padding the settings layout would otherwise provide. No double-inset,
  because the settings layout is absent.
- **Breadcrumb derivation is project-specific.** The shell takes breadcrumbs as
  a slot rather than deriving them from the router, so the consuming project
  wires its own router-aware breadcrumb component.

**Forbidden:**
- Padding classes (`p-6`, `px-6 py-6`) on the page's own outer container when it
  is nested inside a settings layout — causes double-inset.
- Inline `<h1>` / `<h2>` header markup. Use `<SettingsPageHeader>` exclusively.
- Omitting the error boundary or (for pages that have a trail) the breadcrumbs —
  both are provided by `<SettingsPageShell>`.

### Layer 3 — Page header

**Required (via `<SettingsPageHeader>`):**
- **Title** — always present, rendered `text-2xl font-semibold tracking-tight`
  (`<SettingsPageHeader>` is a thin wrapper over the baseline `<PageHeader>`).
- **No action buttons in the page header.** A tabbed-settings page has no
  page-level actions.

**Allowed variation:**
- **Subtitle** — optional; use when the title alone does not convey purpose.
- **Icon** — optional, decorative; pass a sized icon component to the `icon`
  prop.

**Forbidden:**
- Inline `<h1>` / `<h2>` elements — use `<SettingsPageHeader>`.
- A `text-3xl` (or otherwise off-scale) title — the contract is `text-2xl
  font-semibold`.
- Action buttons in the page-header row. Page titles name categories, so actions
  live in per-tab toolbars (typically inherited from each tab's table or form
  body). The header's `actions` slot exists only for the shared settings-form
  (D1) consumer.

### Layer 4 — Tab strip

**Required:**
- Use the design system's `Tabs` / `TabsList` / `TabsTrigger` primitives.
- The tab strip is a direct child of the page shell's body (a sibling of the
  header), not nested inside a card or toolbar.

**Allowed variation:**
- **Icons in tab triggers** — optional.
- **Filter-mode tab strip:** when a page uses the tab strip as a type-filter
  (all values render the same body, only the filter changes), this is allowed.
  The filter tab strip may live inside the toolbar area rather than at the top
  level; document the "filter" role in an inline comment. `<SettingsPageShell>`
  still applies.
- **URL sync** — optional per-page choice (manage a `?tab=` search param).

**Forbidden:**
- A `<Select>` dropdown instead of tabs for multi-category navigation.
- Nested page-level tabs inside a tab body (tabs within tabs).

### Layer 5 — Per-tab body delegation

**Required:**
- Each tab body must satisfy one of:
  - **A** — list-with-detail (a navigable list body)
  - **D1** — settings-form (a form body)
  - **D2** — settings-table (an editable table body)

**Allowed variation:**
- **Tabbed detail (F2 shell over a C body):** the tab-strip shell is not limited to
  settings — it may wrap a single *entity's* detail, where each tab body is a
  **detail-overview (C)** segment of that entity (e.g. an entity with Overview /
  Activity / Related tabs). This "tabbed detail" composition is conformant, not a
  blur of F2 and C (see `docs/CHOOSING-A-SURFACE.md`): F2 owns the tab strip, C owns
  each tab's body. Use it when a deep entity's detail page is too large for one
  scroll and splits cleanly into tabs.
- **Persistent below-tab section:** content that applies to all tabs may render
  below the `Tabs` component at the page level, separated by a `Separator`. This
  section is always visible (it is not a tab body); document the reason inline.
- **Log/feed tab body:** a read-only activity-log tab body is accepted. If the
  project later ships a consolidated activity surface, such a tab should become a
  filtered preview linking to that global view.

**Forbidden:**
- Embedding a dashboard, wizard, state-machine, inbox/feed tool, lookup tool,
  domain hub, or another tabbed-settings page as a tab body — these violate the
  per-tab delegation contract.
- Custom one-off table implementations inside a tab body that bypass the
  settings-table (D2) contract.

### Layer 6 — Tab body content

Per-tab content rules are inherited from whichever body archetype applies (A,
D1, or D2). Refer to that archetype's spec for column shapes, identifier cell
styling, empty states, etc.

**Archetype-specific:**
- A tab body must not add a second header or sub-heading that duplicates the
  page title — the tab trigger's label is the body's heading.
- Currency and date formatting follow the consuming body's archetype spec.

### Layer 7 — Empty / loading / error states

**Required:**
- Per-tab loading and empty states are handled by the tab body's own primitives
  (the table shell for D2 bodies, a form skeleton for D1, etc.).
- Page-level errors are caught by the error boundary in `<SettingsPageShell>`.

**Allowed variation:**
- A custom tab-body loading indicator is acceptable when the body is a legacy
  custom component.

**Forbidden:**
- A page-level loading card that replaces the whole tab strip. Loading state is
  per-tab, not per-page.

### Layer 8 — Data fetching (contract)

The shell and header primitives are presentational — they fetch nothing. The
data contract for the page and its tab bodies:

**Required:**
- Use the project's server-state / query layer for all fetching. No
  `useState + useEffect + imperative call` fetch pattern in the page component.
- Fetching is per-tab (or per-tab-body), not a single page-level blocking load.
- Keep data access behind the project's service/hook boundary — no direct
  database-client calls inside page or tab-body components.
- Surface fetch errors through the project's single toast system.

### Layer 9 — Type shapes (contract)

**Required:**
- Row types in table tab bodies and form-state types in form tab bodies are
  explicit TypeScript types — never `any`.
- The shell/header primitives are domain-agnostic; they carry no row, entity, or
  database types.

### Layer 10 — Mutations & invalidation (contract)

**Required:**
- All mutations go through the project's mutation layer; on success, invalidate
  the affected list/query state.
- **Destructive actions** are gated through a shared confirm dialog (the
  crud-dialog / AlertDialog pattern). Native `window.confirm` and ad-hoc
  per-page confirm dialogs are forbidden.
- Mutation feedback uses the project's single toast system.

**Forbidden:**
- A destructive action that fires immediately without confirmation.

### Layer 11 — Mobile variant

**Required:**
- No dedicated mobile route for tabbed-settings pages. The settings surface is
  desktop-oriented; any settings sidebar collapses on narrow viewports via CSS,
  and no mobile-specific layout is needed.

### Layer 12 — Permissions

**Required:**
- The route is behind the app's auth guard with no specific role requirement.
- No feature flags and no read-only mode at the page level.

---

## `<SettingsPageShell>` / `<SettingsPageHeader>` — shared primitives

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
  className?: string;        // standalone pages add their own padding here
};
```

### Notes

- The `actions` slot is always empty for tabbed-settings pages (no page-level
  actions). A settings-form (D1) page may use it for a Save button. A
  settings-table (D2) page leaves it empty (its toolbar handles actions).
- The outer container omits padding — the settings layout supplies the inset.
  Standalone pages must add their own padding via `className`.
- `<SettingsPageHeader>` is a thin wrapper over the baseline `<PageHeader>`
  layout primitive (`@/components/layout`) — it narrows the surface to the
  settings contract while title layout and typography live in one place.

---

## Migration acceptance checklist

A page is conformant when **every required rule** above is satisfied:

- [ ] **Layer 1** — Route is lazy + suspense-wrapped; auth guard applied
      correctly (inherited or inline)
- [ ] **Layer 2** — Uses `<SettingsPageShell>`; no outer padding class when
      nested in a settings layout; error boundary + breadcrumbs present
- [ ] **Layer 3** — `<SettingsPageHeader>` title is `text-2xl font-semibold`; no
      action buttons in the header
- [ ] **Layer 4** — Design-system `Tabs` primitives; tab strip at page-body
      level (not in a card)
- [ ] **Layer 5** — Each tab body satisfies the A / D1 / D2 delegation contract;
      any persistent below-tab content is separated by a `Separator` and
      documented inline
- [ ] **Layer 7** — Loading / empty handled per-tab by the body's own primitives
- [ ] **Layer 8** — Project query layer for all fetching; no imperative fetch;
      no direct database-client calls in components
- [ ] **Layer 10** — Mutation layer + invalidation; destructive actions via a
      shared confirm dialog; single toast system
- [ ] **Layer 11** — No mobile route variant
- [ ] **Layer 12** — Auth guard with no role requirement

---

## Revision log

- **v1.0 (2026-05-31):** Promoted from brickshop-manager (source spec v1.1).
  De-source-ified: brickshop routes (`/data-mapping`, `/settings/*`), framework
  specifics (`<ProtectedRoute>`, `<MainLayout>`, `<SettingsLayout>`, the `<S>`
  Suspense helper), and stack brands (React Query `staleTime`/query keys,
  Supabase `supabase.from()`, Sonner, shadcn `useToast`) generalised into
  framework-neutral contracts. The `<SettingsPageShell>` breadcrumb auto-derive
  (router `useLocation()` in the source) became an explicit slot. Header split
  into `<SettingsPageShell>` + `<SettingsPageHeader>` to match the baseline
  form-page convention.

---

## Acceptance gate

> **Axis-C (adoption-quality) checklist** — the canonical list a page adopting this
> archetype is scored against (see [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md)).
> A page that composes this archetype's shell is **conformant** only when every
> REQUIRED box passes; one that fails any REQUIRED box is a 🔴 **wrapper adoption**,
> routed to the teardown ritual ([`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`](../DETAIL-PAGE-TEARDOWN-PLAYBOOK.md)).
> `adoptionQuality.score = REQUIRED passed ÷ REQUIRED applicable`; `wrapper = true`
> when score < 1.0. **[spine]** = the shared conformance spine **S1–S6** (single inset ·
> shell-not-hand-rolled · canonical states · atoms+tokens · mono figures · brand
> primary), defined in [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md).

**REQUIRED**

- [ ] **Tabs are real section navigation**, driven by the shell + URL/state — not a
      `Tabs` deck wrapping unrelated pages, and not faked with show/hide divs.
- [ ] **Each panel is a form-page/settings body**, composing those primitives — tabs
      don't excuse hand-rolled cards inside.
- [ ] **Actions per panel follow that panel's archetype** (form → footer; table →
      toolbar), not a global action bar straddling tabs.
- [ ] **[spine] S1, S2, S4, S5, S6.**

**SHOULD** (yellow, not red)

- [ ] ≤ ~7 top-level tabs; deeper taxonomy nests inside a panel, not more top tabs.
