---
key: J
slug: crud-dialog
kind: dialog
version: 1.0
promoted_from: brickshop-manager
promoted_at: 2026-05-22
source_spec_version: 1.0
status: locked
---

# Archetype J — Entity CRUD Dialog

## Purpose

An **entity CRUD dialog** is a right-side Sheet that creates, views, or edits a single domain entity without navigating away from the current page. Use this archetype whenever a surface owns a full CRUD lifecycle for a single entity — loading skeleton, mode state machine, footer contract, and cache invalidation. It is the most common dialog shape in a business application.

J is the first non-page archetype in the baseline. It extends the twelve-layer page framework with three dialog-specific layers: mode contract, footer contract, and cross-context invocation. Dialogs that own a single entity's lifecycle belong here. Confirm dialogs (destructive only, no entity model), transient flow dialogs (multi-step action, no owned entity), and read-only reference viewers are out of scope.

## Reference primitives

`<CrudDialogSheet>` in `src/components/archetypes/crud-dialog/` — the Sheet wrapper with mobile-adaptive width. Composed of:
- `<CrudDialogHeader>` — title, optional subtitle, optional close button, actions slot.
- `<CrudDialogBody>` — ScrollArea body wrapper with consistent padding and loading skeleton slot.
- `<CrudDialogFooter>` — mode-aware footer enforcing the button layout contract.
- `useCrudDialogMode` — hook centralizing mode state and dirty-close logic.

---

## Layer 1 — Open/close contract

**Required:**
- Props: `open: boolean` and `onClose: () => void`. The caller owns open/close state (imperative pattern).
- Wire the Sheet's `onOpenChange` internally as `(next) => { if (!next) onClose(); }`. The dialog never calls `onClose()` on open transitions.
- Optional: `onSaved?: (entity: Entity) => void` side-effect callback for callers that need to act on the saved result (e.g. pre-fill a parent form after creating an entity mid-flow).

**Allowed variation:**
- URL sync via a `useSheetUrlSync()` hook for deep-linking. Not required by J v1; add when deep-linking becomes a product requirement.

**Forbidden:**
- `isOpen` as the prop name — must be `open`.
- `onOpenChange: (open: boolean) => void` as the external close prop — callers must not receive raw booleans.
- Closing the dialog from inside via any mechanism other than `onClose()`. The caller owns the state.

---

## Layer 2 — Sheet shell

**Required:**
- Use `<CrudDialogSheet>` from `src/components/archetypes/crud-dialog/`.
- Pass `open`, `onOpenChange` (wrapping `onClose`), and optionally `width` (`"sm" | "md" | "lg"`).
- Default width `"md"` (~480 px). Use `"lg"` for tabbed or complex entities. Use `"sm"` for minimal forms (3–4 fields only).
- Desktop: right-side slide-in at the chosen width. Mobile: full-viewport (handled automatically by `<CrudDialogSheet>` via `useIsMobile`).

**Allowed variation:**
- Width variant choice per consumer.

**Forbidden:**
- Using shadcn `Dialog` directly for J dialogs — all J dialogs use `<CrudDialogSheet>`.
- Manual `max-w-*` or viewport-relative `w-[…]` classes on the Sheet content. Width is controlled via the `width` prop only.
- Custom `max-h-[90vh] overflow-y-auto` on the shell — scroll is managed by `<CrudDialogBody>` (Layer 5).
- Adding a `SheetTrigger` inside the dialog component — triggers belong at the call site.

---

## Layer 3 — Dialog header

**Required:**
- Use `<CrudDialogHeader>` from `src/components/archetypes/crud-dialog/`.
- `title` prop: entity name or entity type + name (e.g. `"Customer · Acme Corp"`, `"Workout · Morning Run"`). Never a static string like `"Edit Item"`.
- Optional `actions` slot: rendered right of title, before the close button. Use for mode-toggle affordances or secondary icon buttons. Primary CRUD actions (Save, Create, Edit, Delete) belong in the footer (Layer 14).
- The Sheet's built-in close button (X) is provided by `<SheetContent>` — do not add a separate manual close button unless the design requires an explicit labeled close.
- **Accessible name (a11y contract).** `<CrudDialogHeader>` MUST render `title` through `<SheetTitle>` (Radix `Dialog.Title`) and `subtitle` through `<SheetDescription>` (Radix `Dialog.Description`), so `<SheetContent>` (Radix `Dialog.Content`) always exposes an accessible name and a non-dangling `aria-describedby`. When no `subtitle` is supplied, render an empty `sr-only` `<SheetDescription>` as the fallback. Radix logs a development error when `Dialog.Content` has no `Dialog.Title` descendant and a warning when `aria-describedby` references a missing node; this contract guarantees neither fires.

**Allowed variation:**
- `subtitle` prop for secondary identifying info (e.g. created date, status string). Rendered via `<SheetDescription>` per the accessible-name contract above.
- `onClose` prop on `<CrudDialogHeader>` to render an explicit close button in the header alongside the `actions` slot.

**Forbidden:**
- A header `title` rendered as a bare element (e.g. a plain `<h2>` or `<div>`) instead of `<SheetTitle>`, or a `<SheetContent>` with no `<SheetTitle>` descendant — this leaves the dialog with no accessible name and a dangling `aria-describedby`.
- Static entity-type titles like `"Customer Details"` or `"Item Details"` — entity name must appear in the title.
- Action buttons (Edit, Save, Cancel) placed in the header; these belong in the footer.

---

## Layer 4 — Toolbar (n/a for dialogs)

Dialogs do not have a toolbar layer. This layer number is reserved to keep parity with the page-archetype layer numbering (where Layer 4 is the page toolbar). Any action button that is not a primary CRUD action and does not fit the footer contract must be placed inside the body, not in the header.

---

## Layer 5 — Body wrapper

**Required:**
- Use `<CrudDialogBody>` from `src/components/archetypes/crud-dialog/`.
- Pass `isLoading={true}` while the entity fetch is pending. The body renders a skeleton automatically; children are suppressed.
- The body provides `flex-1 overflow-y-auto px-6 py-4` — do not add extra padding inside direct children of `<CrudDialogBody>`.

**Allowed variation:**
- `isLoading` omitted (defaults `false`) for dialogs that receive entity data via prop (no in-dialog fetch).

**Forbidden:**
- Extra `py-2` / `py-4` padding inside the body's immediate children.
- `overflow-y-auto` on the `SheetContent` or its direct children — scroll belongs in `<CrudDialogBody>`.
- Centered spinner as the loading state — use `isLoading` prop on `<CrudDialogBody>` which renders a skeleton.
- `animate-pulse` hand-rolled skeleton blocks.

---

## Layer 6 — Body content shape

Three allowed shapes. Consumers choose exactly one.

**Required (pick one):**
- **Flat section stack** — `<div className="space-y-4">` with labeled field groups. For simple entities (5–8 fields).
- **Two-column grid** — `<div className="grid grid-cols-2 gap-4">` sections interspersed with flat stacks for full-width fields. For entities with paired fields.
- **Two-tab layout** — shadcn `<Tabs>` with exactly 2 tabs. Tab 1 owns mode state (entity data + form). Tab 2 is read-only (connected entities, KPIs, history).

**Allowed variation:**
- Combining flat stack and 2-col grid within a single tab.
- Sub-sections with `<Card>` chrome for grouping logically distinct blocks (e.g. Contact vs. Address within Tab 1).
- 2-col grids that collapse to single-column on mobile via `grid-cols-1 sm:grid-cols-2`.

**Forbidden:**
- More than 2 tabs. If 3+ tabs are needed the entity belongs in a dedicated page, not a J dialog.
- Nested J dialogs inside the body. The one allowed exception is a `<ConfirmDeleteDialog>` (confirm-only, no entity lifecycle) opened from the footer's Delete action.
- Edit actions for sub-entities inside Tab 1 — navigate to that sub-entity's own dialog or page instead.

---

## Layer 7 — States

**Required:**
- **Loading:** `<CrudDialogBody isLoading>` renders a skeleton. Required for any dialog that fetches data on open.
- **Error (fetch):** Render `<div className="bg-destructive/10 p-4 rounded text-sm text-destructive">` with a human-readable message. Not hardcoded `bg-red-50`.
- **Saving:** Pass `isSubmitting={true}` to `<CrudDialogFooter>`. The footer disables and relabels the primary button automatically.
- **Empty (Tab 2):** If Tab 2's connected-entity list is empty, render a centered icon + `"No {things} yet."` message. Not `null` or a blank area.

**Allowed variation:**
- Additional inline loading states for secondary queries within Tab 2 (e.g. a connected-orders list that loads separately from the entity data).

**Forbidden:**
- Centered spinner as the primary loading state.
- Saving indicator via text replacement on the button label ("Updating…", "Creating…"). Use `isSubmitting` on `<CrudDialogFooter>`.
- No saving indicator at all on mutation buttons.

---

## Layer 8 — Data fetching (contract)

The primitive does not wire data. It expects consumer-provided state.

**Required (consumer hook contract):**
- Entity fetched by `entityId` via a dedicated query hook with `enabled: open && !!entityId`.
- Apply `staleTime: 30_000` and `gcTime: 300_000` for entity detail queries (dialog-scope data).
- Create mode: no entity fetch. Form defaults to empty or caller-supplied `defaultValues`.

**Allowed variation:**
- Prop-fed entity data when the caller's list query already holds the full entity shape. Secondary lookups (dropdowns, linked data) may still use query hooks.

**Forbidden:**
- `useState + useEffect` fetching pattern inside the dialog.
- Direct database/API calls inside the dialog component. Route through a service module layer.
- Raw inline queries for dropdown options — use dedicated hooks.

---

## Layer 9 — Type shapes (contract)

**Required:**
- Entity type shared with list/detail views. Not re-declared inside the dialog.
- Form state typed as `z.infer<typeof schema>` using a Zod schema defined in the same file (or imported from a shared forms module).
- `useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })` — react-hook-form with Zod resolver.

**Allowed variation:**
- For dialogs that receive entity data via prop and have no editable form (view-only or edit delegated to caller via `onSave`), react-hook-form is optional.

**Forbidden:**
- Multiple individual `useState<string>` per form field.
- `any`-typed form state.
- Entity types declared inside API modules or hooks — they must live in the project's shared types layer.

---

## Layer 10 — Mutations & invalidation (contract)

Mutations are the consumer's responsibility. The primitive's footer exposes callbacks.

**Governing principle: invalidation follows the mutation owner.** Whichever component owns the mutation owns invalidation, and routes it through a centralized self-invalidating helper. This admits two sanctioned shapes:

1. **Self-contained dialog** — the dialog owns its mutation(s). It MUST call `invalidate<Entity>()` in its own success handler and MUST NOT delegate that invalidation to the caller.
2. **Controlled form** — the dialog owns no mutation; it emits values via a typed `onSave(values)` callback and the parent persists them. Delegating is compliant **provided** the parent persists through a self-invalidating mutation hook or `invalidate<Entity>()` helper.

**Required (consumer contracts):**
- All mutations use the project's async state library (`useMutation` from React Query or equivalent).
- On mutation success in a self-contained dialog: call a centralized `invalidate<Entity>(queryClient, entityId)` helper that enumerates every queryKey where the entity appears (list, detail, and all parent queries that join or embed the entity).
- A controlled form's `onSave(values)` must be persisted by the caller through a self-invalidating mutation hook or `invalidate<Entity>()` helper — never an ad-hoc per-call-site `invalidateQueries`.
- Toast on success via the project's toast library (Sonner `toast()` recommended). Both Sonner and shadcn Toaster may be mounted; pick one and document the choice.

**Allowed variation:**
- `onSaved` callback invoked after successful mutation + invalidation, for callers that need to react. In a self-contained dialog it must fire *after* the dialog's own `invalidate<Entity>()`, never as a substitute for it.
- Controlled-form delegation per the governing principle above.

**Forbidden:**
- Ad-hoc `queryClient.invalidateQueries({ queryKey: ['entity'] })` inside the dialog. Use a centralized helper.
- Narrow invalidation that misses derived caches.
- A dialog that owns its mutation(s) delegating the invalidation to the caller. (Distinct from a controlled form, which owns no mutation and may delegate via `onSave`.)

---

## Layer 11 — Mobile variant

**Required:**
- No dedicated mobile route. The same component serves all viewports.
- On desktop: right-side Sheet at the chosen width. On mobile: full-viewport Sheet. `<CrudDialogSheet>` handles this automatically via `useIsMobile`.
- Body 2-col grids must collapse via `grid-cols-1 sm:grid-cols-2` — the only allowed per-consumer responsive override.

**Forbidden:**
- Custom `sm:max-w-*` or `w-[…]` overrides at the consumer level that bypass the width system.
- Per-consumer `useMediaQuery` inside dialog components for anything beyond column collapse.

---

## Layer 12 — Permissions

**Required:**
- Role-gated Edit affordance: if the current user lacks write permission, the Edit button is hidden (not disabled). Read-only users see the dialog in permanent view mode.
- Role-gated Delete affordance: hidden (not disabled) for users without delete permission.
- Create dialog trigger: hidden at the trigger site for users without create permission. The dialog component itself does not enforce this.

**Allowed variation:**
- Role check implemented via a `useCurrentUserRole()` hook or similar. The primitive receives `canEdit` and `canDelete` boolean props (both default `true`).

**Forbidden:**
- Disabling (greying out) the Edit/Delete button for read-only users — the spec requires hiding, not disabling.
- Showing the Delete button in create mode. `<CrudDialogFooter>` enforces this automatically.

---

## Layer 13 — Mode contract *(dialog-specific)*

**Required:**
- Use `useCrudDialogMode` from `src/components/archetypes/crud-dialog/`. Returns `{ mode, setMode, isView, isEdit, isCreate }`.
- `initialMode`: pass `"create"` when `entityId` is absent; pass `"view"` or `"edit"` when `entityId` is present. Caller controls the initial mode via prop.
- **view → edit:** Call `setMode("edit")`. Fields switch from read-only display to form inputs. No confirmation needed (no data loss on forward transition).
- **edit → view (cancel):** Call `setMode("view")` via `onConfirmDiscard`. If `isDirty` is true and `onConfirmDiscard` is provided, the mode hook requests confirmation before transitioning. On confirmed: transition + reset form.
- **edit → view (save success):** `setMode("view")` after mutation `onSuccess`. Call `invalidate<Entity>()` and show a success toast.
- **create → closed (success):** Call `onClose()` after mutation `onSuccess`. Call `invalidate<Entity>()` and show a success toast.
- **any → closed (X / backdrop / Esc):** Wrap `onClose()` in a dirty-check guard. If mode is `edit` or `create` and the form is dirty, request confirmation before calling `onClose()`.
- On form field change: keep `isDirty` in sync with react-hook-form's `formState.isDirty` via `useEffect` or inline comparison.

**Allowed variation:**
- View-only dialogs (no edit path) may initialize with `mode="view"` and never call `setMode`. The footer shows only a Close action.

**Forbidden:**
- `isEditing: boolean` local state instead of `useCrudDialogMode`.
- Mode driven entirely by prop null-check (e.g. `isEdit = entity !== null`) without a runtime-switchable mode state.
- Silently discarding unsaved changes when the X button is clicked — dirty-check on close is required in edit and create modes.
- Mode transitions outside `useCrudDialogMode`.

---

## Layer 14 — Footer contract *(dialog-specific)*

**Required:**
- Use `<CrudDialogFooter>` from `src/components/archetypes/crud-dialog/`.
- Pass `primaryLabel`, `onPrimary`, `isSubmitting`, and optionally `secondaryLabel`, `onSecondary`, `destructiveLabel`, `onDestructive`.
- The footer enforces the mode-aware button layout described below.
- Delete click must open a `<ConfirmDeleteDialog>` (or shadcn `<AlertDialog>`) before executing the delete mutation. Never call the delete mutation directly on button click.

**Mode-aware layout:**

| Mode   | Left edge (destructive) | Right edge (secondary → primary) |
|--------|------------------------|----------------------------------|
| View   | Delete (outline, text-destructive, disabled) | Close · **Edit** |
| Edit   | Delete (outline, text-destructive, enabled)  | Cancel · **Save** |
| Create | —                      | Cancel · **Create** |

- Delete: always left-aligned. Disabled in view mode. Absent in create mode. Triggers confirm dialog before mutation.
- Primary (Edit / Save / Create): rightmost, default variant. When `isSubmitting`, disabled and labeled "Saving…" / "Creating…".
- Secondary (Close / Cancel): outline variant, to the left of primary.

**Allowed variation:**
- Secondary actions (Duplicate, Archive, Export) may be added as a `⋯` overflow menu button to the left of the primary action group.
- `destructiveLabel` / `onDestructive` omitted when the entity cannot be deleted (e.g. a permanent system entity).

**Forbidden:**
- Footer actions placed in the dialog header or inside the body.
- Primary button on the left, secondary on the right (reversed order).
- `window.confirm()` for delete confirmation — use `<AlertDialog>` or `<ConfirmDeleteDialog>`.
- Delete button visible in create mode.
- Using shadcn `<DialogFooter>` in a J dialog.

---

## Layer 15 — Cross-context invocation *(dialog-specific)*

**Required:**
- A single dialog component per entity, invocable from every call site. Zero per-context duplicates.
- The same `<WorkoutDialog>` (or `<CustomerDialog>`, etc.) is opened from a list row, from a header search result, from a detail panel — wherever the entity appears. The caller passes `entityId` + `open` + `onClose` only.
- Entity fetching lives outside the primitive shell (consumer hook). The dialog's API is open/close + entityId (for view/edit) or null/undefined (for create).
- Multiple call sites must not race — the rendering shell is the caller's concern; data fetching is outside the primitive.

**Allowed variation:**
- Separate create and view/edit dialogs for the same entity when the surfaces are genuinely different (e.g. a creation wizard vs. a view/edit sheet). Justify per entity.

**Forbidden:**
- Two separate components for the same entity's edit path (duplicate edit dialogs).
- Dialog-inside-dialog pattern (opening a second J dialog from inside a first J dialog). The exception is a `<ConfirmDeleteDialog>` (confirm-only).
- Passing context-specific props (e.g. `orderId`, `sourcePageId`) to a J dialog to distinguish invocation-site behavior. The dialog must work identically from all call sites.

---

## Forbidden patterns

The following patterns are never permitted in a J dialog, regardless of domain:

1. **Silently discarding dirty state.** Always confirm before closing when the user has unsaved changes.
2. **Mode outside `useCrudDialogMode`.** All mode logic is centralized there.
3. **Footer actions in the header or body.** Footer has a fixed slot; header and body do not own CRUD actions.
4. **Bottom-sheet on desktop.** Right slide-in is the J convention on desktop.
5. **Inline editing of sub-entities inside Tab 1.** Navigate to the sub-entity's own dialog or page.
6. **More than 2 tabs.** If 3+ are needed, the entity is a page-archetype candidate, not a J dialog.
7. **`window.confirm()` for delete.** Use `<AlertDialog>`.
8. **Re-declaring entity types inside the dialog.** Entity types live in the project's shared types layer.
9. **Nested J dialogs.** No J dialog may open another J dialog on top of itself.
10. **Static entity-type titles.** The entity's name or identifier must appear in the `<CrudDialogHeader>` title.

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitives to its own data layer and may extend them with project-specific behavior as described below.

**Allowed project extensions:**
- **Project-specific form fields.** The body content is fully consumer-controlled. Pass any form, field group, or tab layout as children of `<CrudDialogBody>`.
- **Project-specific footer secondary actions.** The `<CrudDialogFooter>` accepts an optional overflow menu slot for domain-specific secondary actions (Duplicate, Archive, Export).
- **Project-specific permissions.** Pass `canEdit` and `canDelete` booleans derived from the project's RBAC hook.
- **Project-specific `invalidate<Entity>()` helpers.** Each entity must have its own invalidation helper that enumerates every derived queryKey. These live in the project, not in the baseline primitive.
- **Separate create and view/edit dialogs.** When the create and edit surfaces genuinely differ (different field set, different trigger context, different width), two separate components for the same entity are allowed. Justify per entity.

**What stays in the project (does not propagate to baseline):**
- Domain-specific query hooks (e.g. `useWorkout()`, `useCustomer()`).
- Domain-specific entity types, Zod schemas, and form default values.
- Centralized `invalidate<Entity>()` helpers (per entity, per project).
- Business rules governing which footer actions appear for a given entity state.
- Cross-resource invalidation topology.
