---
key: B
slug: form-page
kind: page
version: 2.0
promoted_from: hk-crm
promoted_at: 2026-05-24
source_spec_version: 1.7
status: locked
---

# Archetype B — Form Page

> **v2.0 (2026-08-18) — width and className API closes (archetype-convergence
> Phase 1, archetype B).** The shell's `className` prop is deleted — an
> unenumerable superset escape hatch on a `*Shell`, re-adding it reopens the
> inherited-look defect (ADR-0004 / RULES.md hard rule 12). The `width` axis is
> **kept but no longer a free choice**: an exhaustive keying rule (Layer 2)
> keys every step to the form's field count and body column layout, and the
> two-column body clause is corrected to read as a *consequence* of the keying
> step rather than an independent permission. The stale per-instance
> `headerFill`-override language is deleted from Layer 3 — the shell carries no
> such prop; `<AppShell>`'s header-fill context is the only entry point (the
> shipped default was already contract-conformant and is untouched). Deliberate
> breaking change; the lint ratchet for this class is engaged in the same pass
> (see `_adherence.NOTES.md`).

## Purpose

A **form page** is a dedicated route that creates or edits a single domain entity using a server-rendered shell and a client-side form. Use this archetype whenever a write surface is large enough to deserve its own URL — `/<resource>/new` and `/<resource>/[id]/edit` — rather than a side-sheet (J). Common cases: an entity with 5+ fields, an entity that needs deep linking, an entity whose creation context isn't owned by a parent page, or an entity whose form must remain accessible by URL for back/forward navigation.

B is the second non-list page archetype in the baseline. It extends the twelve-layer page framework with three form-specific layers: form contract (Layer 13), actions footer (Layer 14), and cross-context invocation (Layer 15) — mirroring how J extends the page layers for dialogs.

B is **not** the right choice for:

- Small entities that fit comfortably in a side-sheet → use **J (crud-dialog)** instead.
- Read-only detail views with no editable fields → use a detail-view archetype (not in baseline v1.0).
- Multi-step flows or wizards spanning multiple submission stages → use a flow archetype (not in baseline v1.0).
- Inline-table editing → out of scope for both A and B.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/form-page`; the prop surface is the API and the sandbox demo (`src/examples/form-page-demo.tsx`) is the gallery reference.

---

## Layer 1 — Route config

**Required:**

- **Two routes per entity:** `/<resource>/new` and `/<resource>/[id]/edit`. Both compose the same form component with `mode="create"` and `mode="edit"` respectively. Zero duplicated form code between the two routes.
- The page module is a **server component**. It fetches the entity (edit mode) and any reference data (selects, lookup lists, FK options) before rendering the form. Reference data fetched in parallel via `Promise.all`.
- Edit mode: when the entity is missing, throw / surface `notFound()` (framework-equivalent) so the platform's 404 surface handles it. The form component never receives `null` for `initial` in edit mode.
- The page is wrapped in the project's auth guard. No role-requirement prop unless RBAC is explicitly in scope.

**Allowed variation:**

- A **single route with a mode-discriminating segment** (e.g. `/<resource>/edit/[id]`) when the project's router convention forbids `[id]/edit` nesting.
- Pre-fill from query params (e.g. `?companyId=…`) — fully consumer-owned. The shell does not parse query params.

**Forbidden:**

- Client-side data fetching for the initial form values in edit mode. The server component must hydrate `initial` before the form renders.
- Rendering the form before reference data resolves. No skeleton-then-replace pattern at the page level — the server suspends until data is ready.
- Sharing one route to handle both create and edit via a `?mode=create` query string. Mode is encoded in the URL segment.

---

## Layer 2 — Page shell

**Required:**

- The page renders inside the project's **top-level app shell** — the outer layout frame that mounts global providers, nav/sidebar, and the main content region. The shell does not re-mount providers.
- Outer container: the **form-page shell** — the archetype's content-shell primitive. The shell provides:
  - Single-column max-width, left-aligned. The `width` prop selects the size step; its value is **keyed to the form's field count and body column layout** by the rule below (v2.0), not the call site's taste. There is no free choice: the step follows from the form's shape.
    - **Width keying rule** (exhaustive — every step named, every trigger keyed to the entity or its data):
      - `"sm"` — a **narrow form of 3–4 fields** in a single column. The whole field set fits at reading-column width; nothing else qualifies.
      - `"md"` — the **default** for a **standard single-column entity form** (any field count that is *not* the 3–4-field narrow case). This is the shell's own default; a page whose field count falls here passes no `width` at all.
      - `"lg"` — a **wider single-column form** (longer field labels / description slots that read too cramped at `md` width), **or** a form body laid out as a **two-column field grid** — the paired-short-field shape (firstName + lastName, city + zip) that collapses to single-column on narrow viewports.
      - `"xl"` — a **wide multi-column layout**: a form body using a **3+ column field grid**, or **multiple two-column sections** stacked (each section a two-column grid, several of them) such that the combined body no longer reads at `lg` width.
    - The key reads **field count / column layout → step**, one direction only. The column layout is a *consequence* of the step the rule assigns, never an independent permission to widen.
  - The **canonical vertical rhythm** between header and form body.
  - **No page inset** — the app shell's main region supplies it; the shell adds none (re-insetting here would double-inset).
- A **render-error boundary** (or framework equivalent) wraps the page content at the page-component level.

**Allowed variation:**

- A **card-surface** chrome wrapper around the form body when visual emphasis is desired (e.g. tenant-onboarding forms). Default is no card; form sits directly inside the shell.
- A **two-column field grid** inside the form body — permitted *because* the width keying rule assigns such a form the `"lg"` (or `"xl"`) step, never independently. Sections collapse to single-column on narrow viewports.

**Forbidden:**

- Inline hand-rolled max-width/inset wrappers. Always use the form-page shell.
- Centering the form horizontally on the page when the project's layout already left-aligns content. The shell respects whatever alignment the surrounding app shell imposes.
- Multiple `<form>` elements on a single form page. One page, one form.

---

## Layer 3 — Page header

The form-page header is **purely informational** — title, optional subtitle, optional icon. Action buttons live in the footer (Layer 14), not in the header.

**Required (board form — via the form-page shell's `kicker`/`title`/`headerActions` props):**

- **Title on the surface.** Pass `title` (and optionally `kicker`, `headerActions`) to the form-page shell and it renders the shared **on-surface header bar** (the title bar that sits ON the content surface, driven by shell props) at the top of its bounded card — a `kicker` overline (the entity class, e.g. "Recipes") over the `title`, in the project's **canonical page-title type style**; embed an entity identifier in the **monospace identifier style**, e.g. `"Edit Recipe — Sunday Carbonara"`. This is the same on-surface header every framed archetype shell mounts; there is no separate floating page header above the card.
- `headerActions` — optional right-aligned secondary actions in the bar. The form's Save/Cancel/Delete stay in the **actions-footer primitive** (the sticky-or-inline footer owning the destructive/secondary/primary write actions) at the footer regardless of what's in `headerActions`.
- **Header fill.** The bar renders per the shared **header-fill contract** — three modes: brand-filled (default), muted tint, and hairline-border-only — set once per project via the top-level app shell's header-fill setting. It is a **closed context: there is no per-page or per-shell override.**

**Allowed variation:**

- **Classic floating header** — when the form-page shell is used without a `title` prop, it reverts to the unstyled column layout; compose the **floating page-header treatment** (the canonical page-header treatment, in the same canonical page-title type style) as the first child instead. Use this path when the page needs a `subtitle`, decorative `icon`, or `backHref` — the on-surface header bar carries `kicker`/`title`/`headerActions` only, no subtitle/icon/back-link slots.
- **Subtitle** — classic header only. Use for secondary identifying info (e.g. created date, status, "Editing as administrator"). Rendered in a **muted extra-small supporting-text style** directly below the title.
- **Icon** — classic header only, decorative. If used, a small icon sized to the header scale, placed inside the floating page-header treatment before the title.
- **Back link** — classic header only. Optional `backHref` prop on the floating page-header treatment renders a small "← Back to {list}" link above the title.

**Forbidden:**

- Action buttons (Save, Cancel, Delete) placed in the header or its actions slot. All form-write actions belong in the footer (Layer 14). This is what separates B from a list-detail page.
- Inline `<h1>` markup, or a hand-rolled title bar, bypassing the form-page shell's on-surface header bar / floating page-header treatment. The shared header is what gives every form page the same chrome.

---

## Layer 4 — Toolbar (n/a for form pages)

Form pages do not have a toolbar layer. This layer number is reserved to keep parity with the page-archetype layer numbering (where Layer 4 is the page toolbar for list-with-detail). Any auxiliary action — Reset, Duplicate, Preview, Cancel — belongs in the footer (Layer 14) or as a secondary inline link within the form body.

---

## Layer 5 — Content wrapper (form body)

**Required:**

- The form body is wrapped in the **form-provider bridge** (the react-hook-form `FormProvider` bridge). Every field renders inside the **form-field primitive** tree — never bare `<input>` outside it.
- The `<form>` element carries the **canonical field-group gap** between field groups. Override only when the layout uses a grid body, in which case the grid sets the gap.
- The form body is **the consumer's responsibility** — the form-page shell does not own the field set. Consumers render their RHF form as a direct child between the header and the actions-footer primitive.

**Allowed variation:**

- **Section grouping** — when the form has 3+ logical groups (e.g. "Contact info" / "Address" / "Preferences"), wrap each group in the shared **card / section-card surface** (with a `title`) so the group heading is bound to its fields as one titled bounded block — the same titled-section shape used by detail-overview (the **detail-section** primitive) and grouped-list groups. The fields render in the card's padded (non-`flush`) body. Do not float a bare heading above an unbounded `<div>` of fields, and do not hand-roll the card/heading chrome. Forms with fewer than 3 groups stay flat (no card/section-card surface) — a single bounded section adds chrome without earning it.
- **Card-grouped sections** — a card-surface wrapper around each section when visual separation is desired (e.g. compliance forms with optional sub-collections).
- **Two-column field grids** — a two-column grid for paired short fields (firstName + lastName, city + zip). Collapse to single-column on narrow viewports.

**Forbidden:**

- Bare `<input>` / `<textarea>` / `<select>` outside the form-field primitive. Every interactive field flows through RHF + the form-provider bridge — that's what produces the error message under the field and the accessible label association.
- Multiple `<form>` elements within the form-page shell. Compose sub-forms as nested field groups, never as nested `<form>` tags.
- Hand-rolled error message paragraphs inside a field. Use the **form-message primitive** — it reads from RHF's validation state.

---

## Layer 6 — Form fields

**Required:**

- **The form-field primitives** — field/label/control/message components (plus an optional description slot). These bind to react-hook-form's `Controller` and surface validation errors automatically.
- **Field input components** — the project's text, textarea, select, switch, checkbox, radio-group, and date-picker input primitives. No third-party form-input libraries that bypass those primitives.
- **Required-field marker** — the form-field label renders an asterisk for required fields when the Zod schema declares them as `.min(1)` / non-optional. Mark optional fields explicitly via a description slot or label text — do not invert the asterisk semantic.
- **Server-action error mapping** — when a server action returns a field-specific error, route it back into RHF via `form.setError(<fieldName>, { message })` so the same **form-message** slot surfaces it.

**Allowed variation:**

- **Custom controls** — a project-owned compound input (e.g. an entity picker with autocomplete, an address combinator, a multi-tag chip input). The custom control must accept `value` + `onChange` so it composes with the form-field primitive's `Controller` render prop.
- **Conditional fields** — fields shown / hidden based on other field values. Implement via `form.watch(<dep>)` and a `useMemo`-gated render. Conditional fields still register with RHF on mount.

**Forbidden:**

- Two separate `useState<string>` per field. All form state lives in RHF.
- `any`-typed form state. Form values are typed via `z.infer<typeof schema>` at the form-component boundary.
- Inline `onChange` validation that bypasses Zod. The single source of validation truth is the Zod schema passed to `zodResolver`.

---

## Layer 7 — States

**Required:**

- **Submitting** — the primary button in the actions-footer primitive disables and shows a spinner / "Saving…" / "Creating…" text. Other interactive elements (secondary buttons, fields) remain enabled so the user can read the form during the async window.
- **Loading (initial data)** — handled by the server-component data fetch (Layer 8). The client form never sees a loading state for its `initial` values.
- **Field validation errors** — the **form-message primitive** renders the RHF error message below each field. Required for every form-field.
- **Form-level errors** — submission errors that don't map to a specific field surface via `form.setError('root', { message })` and render in a fixed slot above the actions-footer primitive. Use the canonical **compact inline-error box** treatment (shared with the J crud-dialog inline error; see README "Layer 7 — canonical state treatments"). Not the shell's full **destructive alert** load-error treatment, and not an ad hoc muted-red tint.
- **Success** — toast on save / create via the project's toast library (Sonner `toast()` recommended). The page does not render an inline success banner; success is signaled by toast + navigation.

**Allowed variation:**

- **Inline field warnings** — non-blocking notices via a description slot for soft constraints (e.g. "This name is unusually long").
- **Optimistic redirect** — navigate to the destination before the server confirms when the operation is genuinely safe to retry. Use sparingly; default is await-then-navigate.

**Forbidden:**

- Alert banners or modal dialogs for routine validation errors. Use the form-message primitive and `form.setError('root', …)` only.
- Blocking spinners that cover the form during submit. The primary button's loading state is the submit affordance.
- Silently swallowing server-action errors. Either map to a specific field or surface via `form.setError('root', …)`.

---

## Layer 8 — Data fetching (contract)

The primitive does not wire data. It expects the consumer's server component to hydrate `initial` and reference lists.

**Required (server-component contract):**

- The server component fetches the entity (edit mode) and any reference data (FK select lists, role lists, enum lists) in parallel via `Promise.all`.
- Reference data is filtered for soft-deleted rows (e.g. `WHERE deleted_at IS NULL`) and sorted by display name before passing to the form.
- Edit mode: when the entity does not exist or the user lacks permission, surface `notFound()` (or framework equivalent). Do not render the form with a null entity.
- Pass the resolved entity as `initial: Partial<FormValues>` to the form component; pass reference data as `users`, `companies`, etc. The form component does not refetch.

**Allowed variation:**

- **Search-param prefill** — server component parses query params (e.g. `?companyId=…`) and adds them to `initial` so the form opens with a pre-selected default.
- **Server-action revalidation on save** — the server action's `revalidatePath` / `revalidateTag` invalidates the affected list query so the user sees fresh data after redirect.

**Forbidden:**

- Client-side `useEffect` + `fetch` for the initial form values. The server boundary owns initial hydration.
- Direct DB / API calls inside the client form component. All writes route through a server action (or equivalent typed RPC).
- Refetching reference data on every render — selects fetch once on server, are passed as props, and stay stable for the form's lifetime.

---

## Layer 9 — Type shapes (contract)

**Required:**

- **Zod schema** declared in the form component file (or imported from a shared forms module). Drives both validation and the `FormValues` type via `z.infer<typeof schema>`.
- **Form values** typed as `z.infer<typeof schema>` — never re-declared as a hand-written interface.
- **`FormProps`** discriminates on `mode`:
  ```ts
  type FormProps =
    | { mode: 'create'; initial?: Partial<FormValues>; …refs }
    | { mode: 'edit'; id: string; initial: FormValues; …refs };
  ```
  Reference-data props (`users`, `companies`, etc.) are required regardless of mode.
- **Sentinel for empty select values** — the project's **dropdown select** reserves `''` as the "no value / placeholder" sentinel for its item options. Use a non-empty token (e.g. `'__none__'`) for "no selection" and translate to `null` / `undefined` at the server-action boundary. The token is private to the form module.

**Allowed variation:**

- **Zod transforms** — the schema may include `.transform()` calls that produce the exact server-action input shape, so `buildPayload(values)` is one line. Use when transforms are mechanical (string → number, empty-string → undefined) rather than business-logic-heavy.
- **Discriminated unions inside the schema** — for forms whose field set depends on a top-level kind (e.g. `kind: 'individual' | 'company'`). Zod's `discriminatedUnion` is the canonical pattern.

**Forbidden:**

- Form-values types hand-rolled separately from the schema. They drift.
- `any`-typed form state.
- Sharing the server-action input schema directly as the form schema. The form schema models the **UI input contract** (all strings, sentinel tokens, possibly looser coercion). The server-action schema models the **persistence contract**. The form's `buildPayload` translates between them.

---

## Layer 10 — Mutations & invalidation (contract)

Mutations are the consumer's responsibility. The primitive's footer exposes the buttons; the consumer wires the server-action call.

**Required (consumer contract):**

- All writes flow through a **server action** (Next.js App Router) or equivalent typed RPC. No direct DB calls in the client form.
- On submission success:
  1. The server action calls `revalidatePath` / `revalidateTag` for the affected list + detail routes.
  2. The client form fires `toast.success(<message>)`.
  3. The client form navigates via `router.push(<destination>)` — typically the list page or the new detail page.
- On submission failure:
  - Map field-specific errors back into RHF via `form.setError(<field>, …)`.
  - Map form-level errors via `form.setError('root', { message })`.
  - Never swallow errors silently. The user must see either a field-bound message or the root-level banner.

**Allowed variation:**

- **Delete with undo** — delete actions may use an undo-toast pattern (a toast with an Undo button that calls a re-create / unsoft-delete server action). The pattern is project-owned; the primitive's footer accepts a `destructiveLabel` + `onDestructive` and does not enforce confirm-vs-undo.
- **Pre-navigate optimistic toast** — fire the toast and navigate before the server confirms, when the operation is safe to retry. Default is await-then-navigate.

**Forbidden:**

- `useState` + manual fetch for submission. Use `form.handleSubmit(onSubmit)` + a server action.
- Skipping cache invalidation. The list and detail caches must reflect the write before the user lands on the next page.

---

## Layer 11 — Mobile variant

**Required:**

- No dedicated `/mobile/...` route. The same route + same component serves all viewports.
- The form-page shell uses the same max-width container on all viewports. Field grids collapse to single-column on narrow viewports — the only allowed responsive override.
- The actions-footer primitive becomes sticky to the bottom of the viewport on narrow screens so the primary action remains reachable without scrolling past the form. The primitive handles this automatically.

**Allowed variation:**

- Touch-optimized custom field controls (date pickers, time pickers) for mobile devices. Use the project's responsive primitives or a project-owned compound control; do not branch on viewport in the shell.

**Forbidden:**

- Per-consumer `useMediaQuery` inside the form component for layout decisions. Shell handles responsive behavior.
- Custom max-width overrides at the consumer level that bypass the `width` prop on the form-page shell.

---

## Layer 12 — Permissions

**Required:**

- Route-level auth guard at the page boundary (not inside the form component). When the route is role-gated, the guard either renders the page or surfaces a 403.
- **Edit mode without write permission** — surface 403 at the route, not a disabled form. Read-only viewing of an entity uses a separate detail-view archetype, not B with disabled inputs.
- **Delete affordance** — hidden (not disabled) in the actions-footer primitive when the user lacks delete permission. The primitive accepts a `canDelete` boolean prop (default `true`).

**Allowed variation:**

- `useCurrentUserRole()` or equivalent hook drives the `canDelete` prop. The primitive does not contain role-check logic.

**Forbidden:**

- Disabling (greying out) the Save button to enforce read-only viewing. Use a route-level guard or a separate detail-view route.
- Showing the Delete button in create mode. The actions-footer primitive enforces this automatically when `mode="create"`.

---

## Layer 13 — Form contract *(form-page-specific)*

**Required:**

- **react-hook-form** is the form state library. `useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues })`.
- **The archetype's form-state hook** centralizes mode + dirty + isSubmitting. Returns `{ mode, isCreate, isEdit, isDirty, isSubmitting, beginSubmit, endSubmit, requestDiscard }`. The hook syncs `isDirty` from `form.formState.isDirty` automatically when given the `form` instance.
- **Mode is fixed at mount** — passed in as a `mode: 'create' | 'edit'` prop. The form does not transition between create and edit at runtime (that's J's territory). A new entity that has just been created navigates to the edit route, where a fresh component instance mounts in edit mode.
- **Default values** — derived from `initial` in edit mode (every field has a defined value, no `undefined`), or from a per-field default in create mode (often empty string + sentinel tokens for selects).
- **Reset on initial change** — `useEffect(() => form.reset(<derived defaults>), [initial])` so navigating between two edit pages re-hydrates the form.

**Allowed variation:**

- **Async `defaultValues`** — `useForm({ defaultValues: async () => { … } })` when the server-component hydration model is bypassed (rare; document why).
- **`mode: 'onChange'`** or `'onBlur'` on the `useForm` config for forms with cross-field validation that benefits from eager feedback.

**Forbidden:**

- Mode passed as an inferred boolean (`isEdit = id !== undefined`). The form's mode prop is explicit and discriminated.
- Sharing one `useForm` instance across both create and edit routes via a parent context. Each route mounts its own form component.
- `useState` per field. All field state lives in RHF.

---

## Layer 14 — Actions footer *(form-page-specific)*

**Required:**

- Use the **actions-footer primitive** — the sticky-or-inline footer with destructive (left) + secondary + primary (right) buttons, mode-aware.
- Props: `primaryLabel`, `onPrimary` (or omit when the form uses native `<button type="submit">`), `isSubmitting`, optional `submittingLabel`, optional `secondaryLabel` / `onSecondary`, optional `destructiveLabel` / `onDestructive`, `canDelete`.
- The footer enforces the mode-aware button layout described below.
- Layout: a flex row splitting the leading edge (destructive) from the trailing edge (secondary + primary), with a small gap and top padding.
- **i18n note for `submittingLabel`:** when omitted, the in-flight label is derived from `primaryLabel` by stripping a trailing `e` and appending `ing…` ("Save" → "Saving…"). That derivation is English-only — non-English consumers MUST pass `submittingLabel` explicitly, otherwise the button briefly shows mangled output (e.g. `"Speichern"` → `"Speicherning…"`).

**Mode-aware layout:**

| Mode   | Left edge (destructive)                          | Right edge (secondary → primary) |
|--------|--------------------------------------------------|----------------------------------|
| Create | —                                                | Cancel · **Create**              |
| Edit   | Delete (visible only when `canDelete === true`)  | Cancel · **Save**                |

- **Primary button** — rightmost, in the **default/primary button style**. `type="submit"` (or `onClick={onPrimary}` if submission is controlled imperatively). When `isSubmitting === true`: disabled + spinner + the in-flight label (explicit `submittingLabel` when provided, otherwise the English derivation from `primaryLabel` — "Saving…" / "Creating…").
- **Secondary button (Cancel)** — to the left of primary, in the **secondary button style**. Navigates back (e.g. `router.back()`) or to the list page. Disabled while submitting.
- **Destructive button (Delete)** — leading edge, in the **destructive button style**. Visible only in `edit` mode and when `canDelete === true`. Triggers a confirm flow (project-owned — the **confirm-dialog primitive** recommended; `window.confirm` acceptable in early-phase consumers and demos) before calling the delete server action.
- **Sticky on mobile** — the actions-footer primitive becomes sticky to the bottom of the viewport with a background fill below the mobile breakpoint. Static on desktop.

**Allowed variation:**

- **Overflow menu** — an optional `⋯` button to the left of the primary group for secondary actions (Duplicate, Archive, Export).
- **Secondary actions inline** — when there are multiple write-adjacent actions in edit mode (e.g. "Save and continue" vs "Save and return"), render them as separate button instances inside the actions-footer primitive's trailing group. Keep the primary action rightmost.

**Forbidden:**

- Action buttons placed in the floating page-header treatment. Footer is the only home.
- Primary button on the left, destructive on the right. Reversed order breaks the cross-archetype convention (matches J's footer).
- Delete button visible in create mode. The actions-footer primitive enforces this automatically.
- Using the dialog-footer or card-footer chrome primitives — those are for dialog / card surfaces, not form pages.
- Auto-submitting the form on Enter inside text inputs without a confirmation step when the form has destructive consequences. Use `<form onSubmit>` as normal, but require explicit primary-button click for destructive flows.

---

## Layer 15 — Cross-context invocation *(form-page-specific)*

**Required:**

- One form **component** per entity, composed by both `/<resource>/new` and `/<resource>/[id]/edit` routes. Zero per-route duplicate components.
- The same `<TaskForm>` (or `<ContactForm>`, etc.) is composed from a parent context's "+ New" link, from a list-page action, from a detail-page edit affordance — wherever the entity is created or edited. The caller route passes `mode`, `initial`, reference data, and (in edit mode) `id` only.
- **Pre-fill via search params** — when the entity is created from a parent context (e.g. a new task on a company detail page), the parent navigates to `/<resource>/new?<context>=…`. The server component parses the param and seeds `initial`. The form component itself does not parse URLs.
- **Post-submit destination** — defaults to the entity's list route. May be overridden via a `redirectTo` prop on the form when the caller needs a different destination (e.g. return to a parent detail page).

**Allowed variation:**

- **Embed within a wizard / parent page** — when the form's body is reused as a step inside a multi-step flow, factor the field set into a sub-component (e.g. `<TaskFields>`) that both the standalone form and the wizard step render. The standalone form retains its actions-footer primitive; the wizard supplies its own navigation.

**Forbidden:**

- Two separate form components for the same entity's create vs edit paths.
- Passing call-site-specific behavior props (e.g. `sourcePageId`) that branch field rendering. The form must render identically regardless of where it was reached from. Pre-fill is the only context-dependent input.
- Mounting the form inside an **overlay surface** (sheet or dialog). If the team decides the form belongs in a side-sheet, migrate it to J — don't compose B's primitives inside an overlay-surface shell.

---

## Forbidden patterns

The following patterns are never permitted in a form page, regardless of domain:

1. **Client-side hydration of `initial` values.** The server component fetches; the client form renders.
2. **Multiple `<form>` elements on a single form page.** One page, one form.
3. **Bare `<input>` outside the form-field primitive.** Every field flows through RHF + the form-provider bridge.
4. **`useState` per field.** All form state lives in RHF.
5. **Form-values type re-declared apart from the Zod schema.** Drift waiting to happen.
6. **Action buttons in the floating page-header treatment.** Footer is the only home.
7. **Primary button on the left, destructive on the right.** Reversed order breaks the cross-archetype convention.
8. **Delete button visible in create mode.** The actions-footer primitive enforces.
9. **Mounting B's primitives inside an overlay-surface shell.** If you need one, migrate to J.
10. **Sharing one route to handle both create and edit via a query string.** Mode is encoded in the URL segment.

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitives to its own data layer and may extend them with project-specific behavior as described below.

**Allowed project extensions:**

- **Project-specific field components.** A consumer may provide custom input components (autocomplete pickers, address combinators, signature pads) as long as they compose with the form-field primitive's `Controller` render prop (accept `value` + `onChange`).
- **Project-specific Zod schemas and reference-data shapes.** The primitive's contract is mode + initial + reference props; the consumer owns the schema and the prop shape.
- **Project-specific destination routing.** A `redirectTo` prop on the form may override the default post-submit destination.
- **Project-specific confirm-discard flows.** The form-state hook's `requestDiscard` is a hook into the project's confirm dialog (the **confirm-dialog primitive** recommended).
- **Project-specific delete patterns.** Soft-delete with undo, hard-delete with confirm, archive-instead-of-delete — all are consumer-owned. The primitive exposes the destructive button slot only.

**What stays in the project (does not propagate to baseline):**

- Domain-specific Zod schemas, form-values types, and reference-data fetchers.
- Domain-specific server actions for create / update / delete.
- The project's confirm-dialog pattern (the confirm-dialog primitive, a custom modal, etc.).
- Project-specific toast library configuration.
- Business rules governing which footer actions appear for a given entity state.
- Cross-resource revalidation topology (which paths to `revalidatePath` on which writes).

---

## Acceptance gate

> **Axis-C (adoption-quality) checklist** — the canonical list a page adopting this
> archetype is scored against (see [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md)).
> A page that composes this archetype's shell is **conformant** only when every
> REQUIRED box passes; one that fails any REQUIRED box is a 🔴 **wrapper adoption**,
> routed to the teardown ritual ([`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`](../DETAIL-PAGE-TEARDOWN-PLAYBOOK.md)).
> `adoptionQuality.score = REQUIRED passed ÷ REQUIRED applicable`; `wrapper = true`
> when score < 1.0. **[spine]** = the shared conformance spine **S1–S6** (single inset ·
> shell-not-hand-rolled · canonical states · atoms+tokens · aligned figures · brand
> primary), defined in [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md).

**REQUIRED**

- [ ] **Actions in the footer only.** Submit/Cancel live in the actions-footer
      primitive; the header has **no** action slot. *Wrapper tell:* a Save button
      in the header.
- [ ] **One form-page-shell column.** No hand-rolled max-width/inset wrapper;
      no horizontal centering when the app left-aligns content.
- [ ] **Fields are atoms** — form-field primitives/labelled atoms with standard error text,
      not raw `<input>`/`<select>` or bespoke label markup.
- [ ] **One destructive confirm path** for discard/delete (dialog), not an inline raw button.
- [ ] **[spine] S1, S2, S4, S5, S6.** (S3 → form submit/validation states.)

**SHOULD** (yellow, not red)

- [ ] Multi-section forms use a titled card/section-card rhythm, not flat stacks of 20 inputs.
- [ ] Card-surface chrome around the body only when emphasis is intended (default: none).

---
