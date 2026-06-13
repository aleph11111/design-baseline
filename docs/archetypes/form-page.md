---
key: B
slug: form-page
kind: page
version: 1.1
promoted_from: hk-crm
promoted_at: 2026-05-24
source_spec_version: 1.1
status: locked
---

# Archetype B — Form Page

## Purpose

A **form page** is a dedicated route that creates or edits a single domain entity using a server-rendered shell and a client-side form. Use this archetype whenever a write surface is large enough to deserve its own URL — `/<resource>/new` and `/<resource>/[id]/edit` — rather than a side-sheet (J). Common cases: an entity with 5+ fields, an entity that needs deep linking, an entity whose creation context isn't owned by a parent page, or an entity whose form must remain accessible by URL for back/forward navigation.

B is the second non-list page archetype in the baseline. It extends the twelve-layer page framework with three form-specific layers: form contract (Layer 13), actions footer (Layer 14), and cross-context invocation (Layer 15) — mirroring how J extends the page layers for dialogs.

B is **not** the right choice for:

- Small entities that fit comfortably in a side-sheet → use **J (crud-dialog)** instead.
- Read-only detail views with no editable fields → use a detail-view archetype (not in baseline v1.0).
- Multi-step flows or wizards spanning multiple submission stages → use a flow archetype (not in baseline v1.0).
- Inline-table editing → out of scope for both A and B.

## Reference primitives

`<FormPageShell>` in `src/components/archetypes/form-page/` — the max-width single-column container for the form route. Composed of:

- `<FormPageHeader>` — title, optional subtitle, optional icon. No action slot (actions live in the footer).
- `<FormPageActions>` — sticky-or-inline footer with destructive (left) + secondary + primary (right) buttons. Mode-aware.
- `useFormPageState` — hook centralizing form mode (`create` / `edit`), dirty state, isSubmitting, and the dirty-guarded discard flow.

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

- The page renders inside `<AppShell>` (or the project's top-level layout primitive). The shell does not re-mount providers.
- Outer container: `<FormPageShell>` from `src/components/archetypes/form-page/`. The shell provides:
  - Padding: `px-6 py-6`
  - Single-column max-width: default `max-w-xl` (~36rem). Overridable via the `width` prop — `"sm"` (max-w-md), `"md"` (max-w-xl, default), `"lg"` (max-w-2xl), `"xl"` (max-w-4xl for wide multi-column layouts).
  - Vertical spacing: `space-y-6` between header and form body.
- `<ErrorBoundary>` (or framework equivalent) wraps the page content at the page-component level.

**Allowed variation:**

- A `<Card>` chrome wrapper around the form body when the visual emphasis is desired (e.g. tenant-onboarding forms). Default is no card; form sits directly inside the shell.
- Two-column layout via `grid grid-cols-1 lg:grid-cols-2 gap-6` inside the form body — only with `width="lg"` or `width="xl"`. Sections collapse to single-column on narrow viewports.

**Forbidden:**

- Inline `<div className="max-w-xl px-6 py-6">…` hand-rolled wrappers. Always use `<FormPageShell>`.
- Centering the form horizontally on the page (`mx-auto`) when the project's layout already left-aligns content. The shell respects whatever alignment the surrounding `<AppShell>` imposes.
- Multiple `<form>` elements on a single form page. One page, one form.

---

## Layer 3 — Page header

The form-page header is **purely informational** — title, optional subtitle, optional icon. Action buttons live in the footer (Layer 14), not in the header.

**Required (via `<FormPageHeader>`):**

- **Title** — always present. Rendered as `text-2xl font-semibold tracking-tight` (the canonical baseline title treatment). Use the entity-context phrase: `"New Task"`, `"Edit Contact — Jane Doe"`, `"New Opportunity"`. In edit mode, including the entity's identifier helps the user confirm they're editing the right record.
- The header is rendered as the first child of `<FormPageShell>`, before the form body.
- `<FormPageHeader>` is a thin wrapper over the baseline `<PageHeader>` layout primitive (`@/components/layout`) — it exposes the back-link and icon contract but omits the actions slot (form actions live in the footer).

**Allowed variation:**

- **Subtitle** — optional. Use for secondary identifying info (e.g. created date, status, "Editing as administrator"). Rendered as `text-sm text-muted-foreground` directly below the title.
- **Icon** — optional, decorative. If used, size `h-6 w-6`, placed inside `<FormPageHeader>` before the title.
- **Back link** — optional `backHref` prop on `<FormPageHeader>` renders a small "← Back to {list}" link above the title. Use when the form page is reached from a context the user is likely to want to return to.

**Forbidden:**

- Action buttons (Save, Cancel, Delete) placed in the header or its actions slot. All form-write actions belong in the footer (Layer 14). This is what separates B from a list-detail page.
- Inline `<h1>` markup that bypasses `<FormPageHeader>`. The shared header is what gives every form page the same chrome.

---

## Layer 4 — Toolbar (n/a for form pages)

Form pages do not have a toolbar layer. This layer number is reserved to keep parity with the page-archetype layer numbering (where Layer 4 is the page toolbar for list-with-detail). Any auxiliary action — Reset, Duplicate, Preview, Cancel — belongs in the footer (Layer 14) or as a secondary inline link within the form body.

---

## Layer 5 — Content wrapper (form body)

**Required:**

- The form body is wrapped in shadcn's `<Form>` from `src/components/ui/form` (the react-hook-form `FormProvider` bridge). Every field renders inside `<FormField>` + `<FormItem>` + `<FormLabel>` + `<FormControl>` + `<FormMessage>` — never bare `<input>` outside the FormField tree.
- The `<form>` element carries `className="space-y-4"` (gap between field groups). Override only when the layout uses a `grid` body, in which case the grid sets the gap.
- The form body is **the consumer's responsibility** — `<FormPageShell>` does not own the field set. Consumers render their RHF form as a direct child between `<FormPageHeader>` and `<FormPageActions>`.

**Allowed variation:**

- **Section grouping** — `<div>` blocks with optional subsection headers when the form has 3+ logical groups (e.g. "Contact info" / "Address" / "Preferences"). Use the shared `<SectionHeading>` primitive (`@/components/layout`) for subsection headers — the same ledger overline used by detail-overview and grouped-list, so a form's groupings read consistently with the rest of the app. Do not hand-roll the heading class string.
- **Card-grouped sections** — `<Card>` around each section when visual separation is desired (e.g. compliance forms with optional sub-collections).
- **Two-column field grids** — `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">` for paired short fields (firstName + lastName, city + zip). Collapse to single-column on narrow viewports.

**Forbidden:**

- Bare `<input>` / `<textarea>` / `<select>` outside `<FormField>`. Every interactive field flows through RHF + the shadcn Form bridge — that's what produces the error message under the field and the accessible label association.
- Multiple `<form>` elements within `<FormPageShell>`. Compose sub-forms as nested field groups, never as nested `<form>` tags.
- Hand-rolled error message paragraphs inside a field. Use `<FormMessage />` — it reads from RHF's validation state.

---

## Layer 6 — Form fields

**Required:**

- **shadcn `<Form>` primitives** — `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` (and optionally `FormDescription`). These bind to react-hook-form's `Controller` and surface validation errors automatically.
- **Field input components** — shadcn `<Input>`, `<Textarea>`, `<Select>`, `<Switch>`, `<Checkbox>`, `<RadioGroup>`, `<DatePicker>` (or `<Input type="date">`). No third-party form-input libraries that bypass the shadcn primitives.
- **Required-field marker** — `<FormLabel>` renders an asterisk for required fields when the Zod schema declares them as `.min(1)` / non-optional. Mark optional fields explicitly via `<FormDescription>` or label text — do not invert the asterisk semantic.
- **Server-action error mapping** — when a server action returns a field-specific error, route it back into RHF via `form.setError(<fieldName>, { message })` so the same `<FormMessage />` slot surfaces it.

**Allowed variation:**

- **Custom controls** — a project-owned compound input (e.g. an entity picker with autocomplete, an address combinator, a multi-tag chip input). The custom control must accept `value` + `onChange` so it composes with `<FormField>`'s `Controller` render prop.
- **Conditional fields** — fields shown / hidden based on other field values. Implement via `form.watch(<dep>)` and a `useMemo`-gated render. Conditional fields still register with RHF on mount.

**Forbidden:**

- Two separate `useState<string>` per field. All form state lives in RHF.
- `any`-typed form state. Form values are typed via `z.infer<typeof schema>` at the form-component boundary.
- Inline `onChange` validation that bypasses Zod. The single source of validation truth is the Zod schema passed to `zodResolver`.

---

## Layer 7 — States

**Required:**

- **Submitting** — the primary button in `<FormPageActions>` disables and shows a spinner / "Saving…" / "Creating…" text. Other interactive elements (secondary buttons, fields) remain enabled so the user can read the form during the async window.
- **Loading (initial data)** — handled by the server-component data fetch (Layer 8). The client form never sees a loading state for its `initial` values.
- **Field validation errors** — shadcn's `<FormMessage />` renders the RHF error message below each field. Required for every `<FormField>`.
- **Form-level errors** — submission errors that don't map to a specific field surface via `form.setError('root', { message })` and render in a fixed slot above `<FormPageActions>`. Use the canonical compact form/dialog inline-error treatment — a tinted box `bg-destructive/10 p-4 rounded text-sm text-destructive` (shared with the J crud-dialog inline error; see README "Layer 7 — canonical state treatments"). Not a full `<Alert>` (that is the shell load-error treatment) and not `bg-red-50`.
- **Success** — toast on save / create via the project's toast library (Sonner `toast()` recommended). The page does not render an inline success banner; success is signaled by toast + navigation.

**Allowed variation:**

- **Inline field warnings** — non-blocking notices via `<FormDescription>` for soft constraints (e.g. "This name is unusually long").
- **Optimistic redirect** — navigate to the destination before the server confirms when the operation is genuinely safe to retry. Use sparingly; default is await-then-navigate.

**Forbidden:**

- Alert banners or modal dialogs for routine validation errors. Use `<FormMessage />` and `form.setError('root', …)` only.
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
- **Sentinel for empty select values** — Radix's `<Select.Item>` reserves `''` as the "no value / placeholder" sentinel. Use a non-empty token (e.g. `'__none__'`) for "no selection" and translate to `null` / `undefined` at the server-action boundary. The token is private to the form module.

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
- `<FormPageShell>` uses the same max-width container on all viewports. Field grids collapse via `grid-cols-1 sm:grid-cols-2` — the only allowed responsive override.
- `<FormPageActions>` becomes sticky to the bottom of the viewport on narrow screens (`sm:static`) so the primary action remains reachable without scrolling past the form. The primitive handles this automatically.

**Allowed variation:**

- Touch-optimized custom field controls (date pickers, time pickers) for mobile devices. Use shadcn's responsive primitives or a project-owned compound control; do not branch on viewport in the shell.

**Forbidden:**

- Per-consumer `useMediaQuery` inside the form component for layout decisions. Shell handles responsive behavior.
- Custom `max-w-*` overrides at the consumer level that bypass the `width` prop on `<FormPageShell>`.

---

## Layer 12 — Permissions

**Required:**

- Route-level auth guard at the page boundary (not inside the form component). When the route is role-gated, the guard either renders the page or surfaces a 403.
- **Edit mode without write permission** — surface 403 at the route, not a disabled form. Read-only viewing of an entity uses a separate detail-view archetype, not B with disabled inputs.
- **Delete affordance** — hidden (not disabled) in `<FormPageActions>` when the user lacks delete permission. The primitive accepts a `canDelete` boolean prop (default `true`).

**Allowed variation:**

- `useCurrentUserRole()` or equivalent hook drives the `canDelete` prop. The primitive does not contain role-check logic.

**Forbidden:**

- Disabling (greying out) the Save button to enforce read-only viewing. Use a route-level guard or a separate detail-view route.
- Showing the Delete button in create mode. `<FormPageActions>` enforces this automatically when `mode="create"`.

---

## Layer 13 — Form contract *(form-page-specific)*

**Required:**

- **react-hook-form** is the form state library. `useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues })`.
- **`useFormPageState`** from `src/components/archetypes/form-page/` centralizes mode + dirty + isSubmitting. Returns `{ mode, isCreate, isEdit, isDirty, isSubmitting, beginSubmit, endSubmit, requestDiscard }`. The hook syncs `isDirty` from `form.formState.isDirty` automatically when given the `form` instance.
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

- Use `<FormPageActions>` from `src/components/archetypes/form-page/`.
- Props: `primaryLabel`, `onPrimary` (or omit when the form uses native `<button type="submit">`), `isSubmitting`, optional `submittingLabel`, optional `secondaryLabel` / `onSecondary`, optional `destructiveLabel` / `onDestructive`, `canDelete`.
- The footer enforces the mode-aware button layout described below.
- Layout: flex container, `justify-between`, gap-2, top padding `pt-2`. Destructive button on the leading edge; secondary + primary on the trailing edge.
- **i18n note for `submittingLabel`:** when omitted, the in-flight label is derived from `primaryLabel` by stripping a trailing `e` and appending `ing…` ("Save" → "Saving…"). That derivation is English-only — non-English consumers MUST pass `submittingLabel` explicitly, otherwise the button briefly shows mangled output (e.g. `"Speichern"` → `"Speicherning…"`).

**Mode-aware layout:**

| Mode   | Left edge (destructive)                          | Right edge (secondary → primary) |
|--------|--------------------------------------------------|----------------------------------|
| Create | —                                                | Cancel · **Create**              |
| Edit   | Delete (visible only when `canDelete === true`)  | Cancel · **Save**                |

- **Primary button** — rightmost. `variant="default"`. `type="submit"` (or `onClick={onPrimary}` if submission is controlled imperatively). When `isSubmitting === true`: disabled + spinner + the in-flight label (explicit `submittingLabel` when provided, otherwise the English derivation from `primaryLabel` — "Saving…" / "Creating…").
- **Secondary button (Cancel)** — to the left of primary. `variant="outline"`. Navigates back (e.g. `router.back()`) or to the list page. Disabled while submitting.
- **Destructive button (Delete)** — leading edge. `variant="destructive"`. Visible only in `edit` mode and when `canDelete === true`. Triggers a confirm flow (project-owned — `<AlertDialog>` recommended; `window.confirm` acceptable in early-phase consumers and demos) before calling the delete server action.
- **Sticky on mobile** — `<FormPageActions>` becomes `sticky bottom-0` with a background fill below `sm` breakpoint. Static on desktop.

**Allowed variation:**

- **Overflow menu** — an optional `⋯` button to the left of the primary group for secondary actions (Duplicate, Archive, Export).
- **Secondary actions inline** — when there are multiple write-adjacent actions in edit mode (e.g. "Save and continue" vs "Save and return"), render them as separate `Button` instances inside the `<FormPageActions>` trailing group. Keep the primary action rightmost.

**Forbidden:**

- Action buttons placed in `<FormPageHeader>`. Footer is the only home.
- Primary button on the left, destructive on the right. Reversed order breaks the cross-archetype convention (matches J's footer).
- Delete button visible in create mode. `<FormPageActions>` enforces this automatically.
- Using shadcn's `<DialogFooter>` or `<CardFooter>` — those are for dialog / card chrome, not form pages.
- Auto-submitting the form on Enter inside text inputs without a confirmation step when the form has destructive consequences. Use `<form onSubmit>` as normal, but require explicit primary-button click for destructive flows.

---

## Layer 15 — Cross-context invocation *(form-page-specific)*

**Required:**

- One form **component** per entity, composed by both `/<resource>/new` and `/<resource>/[id]/edit` routes. Zero per-route duplicate components.
- The same `<TaskForm>` (or `<ContactForm>`, etc.) is composed from a parent context's "+ New" link, from a list-page action, from a detail-page edit affordance — wherever the entity is created or edited. The caller route passes `mode`, `initial`, reference data, and (in edit mode) `id` only.
- **Pre-fill via search params** — when the entity is created from a parent context (e.g. a new task on a company detail page), the parent navigates to `/<resource>/new?<context>=…`. The server component parses the param and seeds `initial`. The form component itself does not parse URLs.
- **Post-submit destination** — defaults to the entity's list route. May be overridden via a `redirectTo` prop on the form when the caller needs a different destination (e.g. return to a parent detail page).

**Allowed variation:**

- **Embed within a wizard / parent page** — when the form's body is reused as a step inside a multi-step flow, factor the field set into a sub-component (e.g. `<TaskFields>`) that both the standalone form and the wizard step render. The standalone form retains its `<FormPageActions>` footer; the wizard supplies its own navigation.

**Forbidden:**

- Two separate form components for the same entity's create vs edit paths.
- Passing call-site-specific behavior props (e.g. `sourcePageId`) that branch field rendering. The form must render identically regardless of where it was reached from. Pre-fill is the only context-dependent input.
- Mounting the form inside a Sheet / Dialog. If the team decides the form belongs in a side-sheet, migrate it to J — don't compose B's primitives inside a Sheet shell.

---

## Forbidden patterns

The following patterns are never permitted in a form page, regardless of domain:

1. **Client-side hydration of `initial` values.** The server component fetches; the client form renders.
2. **Multiple `<form>` elements on a single form page.** One page, one form.
3. **Bare `<input>` outside `<FormField>`.** Every field flows through RHF + shadcn's `<Form>` bridge.
4. **`useState` per field.** All form state lives in RHF.
5. **Form-values type re-declared apart from the Zod schema.** Drift waiting to happen.
6. **Action buttons in `<FormPageHeader>`.** Footer is the only home.
7. **Primary button on the left, destructive on the right.** Reversed order breaks the cross-archetype convention.
8. **Delete button visible in create mode.** `<FormPageActions>` enforces.
9. **Mounting B's primitives inside a Sheet shell.** If you need a sheet, migrate to J.
10. **Sharing one route to handle both create and edit via a query string.** Mode is encoded in the URL segment.

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitives to its own data layer and may extend them with project-specific behavior as described below.

**Allowed project extensions:**

- **Project-specific field components.** A consumer may provide custom input components (autocomplete pickers, address combinators, signature pads) as long as they compose with `<FormField>`'s `Controller` render prop (accept `value` + `onChange`).
- **Project-specific Zod schemas and reference-data shapes.** The primitive's contract is mode + initial + reference props; the consumer owns the schema and the prop shape.
- **Project-specific destination routing.** A `redirectTo` prop on the form may override the default post-submit destination.
- **Project-specific confirm-discard flows.** `useFormPageState`'s `requestDiscard` is a hook into the project's confirm dialog (shadcn `<AlertDialog>` recommended).
- **Project-specific delete patterns.** Soft-delete with undo, hard-delete with confirm, archive-instead-of-delete — all are consumer-owned. The primitive exposes the destructive button slot only.

**What stays in the project (does not propagate to baseline):**

- Domain-specific Zod schemas, form-values types, and reference-data fetchers.
- Domain-specific server actions for create / update / delete.
- The project's confirm-dialog pattern (shadcn `<AlertDialog>`, custom modal, etc.).
- Project-specific toast library configuration.
- Business rules governing which footer actions appear for a given entity state.
- Cross-resource revalidation topology (which paths to `revalidatePath` on which writes).
