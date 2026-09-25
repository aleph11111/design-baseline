---
key: J
slug: crud-dialog
kind: dialog
version: 3.1
promoted_from: brickshop-manager
promoted_at: 2026-08-04
source_spec_version: 1.7
status: locked
---

# Archetype J — Entity CRUD Dialog

> **v3.1 (2026-09-25) — promoted from mistra's fork.** Cancel after a save now
> resets the form to the last-saved values, not the pre-save record (a
> controller bug fix). The footer's Delete gets a static disabled gate distinct
> from the in-flight spinner, so "disabled in view mode" (Layer 7) and any
> business-rule gate are expressed as disabled, not as a no-op handler.
> Additive; no breaking change.
>
> **v3.0 (2026-08-18) — the shell API closes (archetype-convergence Phase 1,
> archetype J).** The per-call-site appearance props are deleted or derived;
> the shell's chrome is no longer a per-consumer choice. The `className`
> escape hatch is deleted from the CRUD-dialog shell and its header / body /
> footer — an unenumerable superset, re-adding it reopens every appearance
> axis the convergence roadmap is retiring and it is invisible to the lint
> (ADR-0004 / RULES.md hard rule 12). The `width` axis is **kept but no longer
> a free choice**: an exhaustive keying rule (Layer 2) keys every step to the
> body's tab count and field count, and the "Width variant choice per consumer"
> line that re-opened the step the Required section had just closed is
> deleted. The `layout` axis was already keyed to the body's field shape
> (Layer 6) and is carried through unchanged — no default-contradiction
> defect. Deliberate breaking change; the lint ratchet for this class is
> engaged in the same pass, including widening the generic `*Shell`-scoped
> `className` rule to also catch `*Sheet.tsx`-named overlay shells (the
> CRUD-dialog shell is not named `*Shell.tsx` — the gap this close exposed),
> plus a per-folder `crud-dialog-shell-class-name` `error` rule. See
> `_adherence.NOTES.md`.

## Purpose

An **entity CRUD dialog** is a right-side overlay surface that creates, views, or edits a single domain entity without navigating away from the current page. Use this archetype whenever a surface owns a full CRUD lifecycle for a single entity — loading skeleton, mode state machine, footer contract, and cache invalidation. It is the most common dialog shape in a business application.

J is the first non-page archetype in the baseline. It extends the twelve-layer page framework with three dialog-specific layers: mode contract, footer contract, and cross-context invocation. Dialogs that own a single entity's lifecycle belong here. Confirm dialogs (destructive only, no entity model), transient flow dialogs (multi-step action, no owned entity), and read-only reference viewers are out of scope.

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/crud-dialog`; the prop surface is the API and the sandbox demo (`src/examples/crud-dialog-demo.tsx`) is the gallery reference.

---

## Layer 1 — Open/close contract

**Required:**
- Props: `open: boolean` and `onClose: () => void`. The caller owns open/close state (imperative pattern).
- Wire the overlay-surface primitive's `onOpenChange` internally as `(next) => { if (!next) onClose(); }`. The dialog never calls `onClose()` on open transitions.
- Optional: `onSaved?: (entity: Entity) => void` side-effect callback for callers that need to act on the saved result (e.g. pre-fill a parent form after creating an entity mid-flow).

**Allowed variation:**
- URL sync via a `useSheetUrlSync()` hook for deep-linking. Not required by J v1; add when deep-linking becomes a product requirement.

**Forbidden:**
- `isOpen` as the prop name — must be `open`.
- `onOpenChange: (open: boolean) => void` as the external close prop — callers must not receive raw booleans.
- Closing the dialog from inside via any mechanism other than `onClose()`. The caller owns the state.

---

## Layer 2 — Dialog shell

**Required:**
- Use the **CRUD-dialog shell** — the single primitive that owns this archetype's chrome (the overlay wrapper with mobile-adaptive width).
- Pass `open`, `onOpenChange` (wrapping `onClose`), and `width` (`"sm" | "md" | "lg"`). `width` is **derived from the rendered body's shape** — not chosen per call site:
  - `"sm"` — minimal entity form: 3–4 form fields, no tabs.
  - `"md"` — standard entity form: 5+ form fields, single section (no tabs).
  - `"lg"` — tabbed or complex entity: a two-tab body (Tab 1 + Tab 2 per Layer 6) or an entity whose form spans multiple logically distinct sections.
- Derive the width from the body's **tab count** (two-tab body → `"lg"`) and **field count** (3–4 fields → `"sm"`; 5+ fields → `"md"`), not from a per-consumer preference. The call site that owns the entity knows its shape; pass the derived value.
- Desktop: right-side slide-in at the derived width. Mobile: full-viewport (handled automatically by the CRUD-dialog shell via the **viewport-breakpoint hook**).

**Forbidden:**
- Using the overlay-surface primitive's modal variant directly for J dialogs — all J dialogs use the CRUD-dialog shell (its sheet variant).
- Manual max-width or viewport-relative width-override classes on the overlay content. Width is controlled via the `width` prop only.
- Custom scroll/max-height overrides on the shell — scroll is managed by the dialog-body primitive (Layer 5).
- Adding a trigger element inside the dialog component — triggers belong at the call site.

---

## Layer 3 — Dialog header

**Required:**
- Use the **dialog-header primitive**.
- `title` prop: entity name or entity type + name (e.g. `"Customer · Acme Corp"`, `"Workout · Morning Run"`). Never a static string like `"Edit Item"`.
- Optional `actions` slot: rendered right of title, before the close button. Use for mode-toggle affordances or secondary icon buttons. Primary CRUD actions (Save, Create, Edit, Delete) belong in the footer (Layer 14).
- The overlay-surface primitive's built-in close button (X) is provided by the shell — do not add a separate manual close button unless the design requires an explicit labeled close.
- **Accessible name (a11y contract).** The dialog-header primitive MUST render `title` through the overlay-surface primitive's title element and `subtitle` through its description element, so the overlay-surface primitive's content region always exposes an accessible name and a non-dangling `aria-describedby`. When no `subtitle` is supplied, render an empty visually-hidden description element as the fallback.
- **Header fill.** The dialog-header primitive is the CRUD-dialog shell's first band, so it follows the project's **header-fill contract** the same way every framed archetype header does: on the brand-filled mode, the bar fills with the brand accent and the title/subtitle/`actions` buttons invert (white text, inverted outline/primary treatment); a quieter muted-tint mode and a hairline-border-only mode are also available. Override per dialog via the `headerFill` prop on the dialog-header primitive. The shared **status-badge primitive** placed in `actions` is never inverted.

**Allowed variation:**
- `subtitle` prop for secondary identifying info (e.g. created date, status string). Rendered via the overlay-surface primitive's description element per the accessible-name contract above.
- `onClose` prop on the dialog-header primitive to render an explicit close button in the header alongside the `actions` slot.

**Forbidden:**
- A header `title` rendered as a bare element (e.g. a plain `<h2>` or `<div>`) instead of the overlay-surface primitive's title element, or overlay content with no title-element descendant — this leaves the dialog with no accessible name and a dangling `aria-describedby`.
- Static entity-type titles like `"Customer Details"` or `"Item Details"` — entity name must appear in the title.
- Action buttons (Edit, Save, Cancel) placed in the header; these belong in the footer.

---

## Layer 4 — Toolbar (n/a for dialogs)

Dialogs do not have a toolbar layer. This layer number is reserved to keep parity with the page-archetype layer numbering (where Layer 4 is the page toolbar). Any action button that is not a primary CRUD action and does not fit the footer contract must be placed inside the body, not in the header.

---

## Layer 5 — Body wrapper

**Required:**
- Use the **dialog-body primitive**.
- Pass `isLoading={true}` while the entity fetch is pending. The body renders a skeleton automatically; children are suppressed.
- The body provides the **canonical dialog-body padding and scroll treatment** — do not add extra padding inside direct children of the dialog-body primitive.

**Allowed variation:**
- `isLoading` omitted (defaults `false`) for dialogs that receive entity data via prop (no in-dialog fetch).

**Forbidden:**
- Extra vertical padding inside the body's immediate children.
- A scroll wrapper on the overlay content or its direct children — scroll belongs in the dialog-body primitive.
- Centered spinner as the loading state — use the `isLoading` prop on the dialog-body primitive, which renders a skeleton.
- Hand-rolled pulsing-skeleton blocks.

---

## Layer 6 — Body content shape

Three shapes — the dialog's graded "richness" axis (simple → dense → split). These
are **variants of the one J archetype, not separate tiers** — see
`docs/CHOOSING-A-SURFACE.md`. Pick the shape that fits the entity's depth; escalate
to a detail page (C) when the entity outgrows a dialog (owns collections, etc.).

**Required (pick one):**
- **Flat stack** — the dialog-body primitive with `layout="flat"`. A single stack, using the **canonical vertical rhythm**, of labeled field groups. For simple entities (5–8 fields).
- **Two-column** — the dialog-body primitive with `layout="two-column"`. A paired-field grid; the body bakes in the mandated mobile collapse so consumers don't hand-roll (or forget) it. For entities with paired fields.
- **Two-tab** — the project's **tab primitive** with exactly 2 tabs, composed as the body's children (the dialog-body primitive with no `layout`). Tab 1 owns mode state (entity data + form). Tab 2 is read-only (connected entities, KPIs, history).

**Allowed variation:**
- **Mixed bodies** (a 2-col section beside full-width flat fields) — omit `layout` and compose the **canonical vertical rhythm** plus an inner responsive paired-field grid yourself. The `layout` prop is for the *pure* flat / two-column cases; mixed stays manual.
- Sub-sections with the project's **card / section-card surface** for grouping logically distinct blocks (e.g. Contact vs. Address within Tab 1).

**Forbidden:**
- More than 2 tabs. If 3+ tabs are needed the entity belongs in a dedicated page, not a J dialog.
- Nested J dialogs inside the body. The one allowed exception is the **confirm-dialog primitive** (confirm-only, no entity lifecycle) opened from the footer's Delete action.
- Edit actions for sub-entities inside Tab 1 — navigate to that sub-entity's own dialog or page instead.

---

## Layer 7 — States

**Required:**
- **Loading:** the dialog-body primitive with `isLoading` renders a skeleton. Required for any dialog that fetches data on open.
- **Error (fetch):** render the **compact inline-error box** treatment with a human-readable message. Not a hardcoded ad-hoc color.
- **Saving:** pass `isSubmitting={true}` to the dialog-footer primitive. The footer disables and relabels the primary button automatically.
- **Empty (Tab 2):** if Tab 2's connected-entity list is empty, render the shared **state-view primitive** (empty variant) with an icon and "No {things} yet." title — not `null`, not a blank area, and not a hand-rolled centered-icon container.

**Allowed variation:**
- Additional inline loading states for secondary queries within Tab 2 (e.g. a connected-orders list that loads separately from the entity data).

**Forbidden:**
- Centered spinner as the primary loading state.
- Saving indicator via text replacement on the button label ("Updating…", "Creating…"). Use `isSubmitting` on the dialog-footer primitive.
- No saving indicator at all on mutation buttons.

---

## Layer 8 — Data fetching (contract)

The primitive does not wire data. It expects consumer-provided state.

**Required (consumer hook contract):**
- Entity fetched by `entityId` via a dedicated query hook, gated so it only runs while the dialog is open and an `entityId` is present (React Query: `enabled`; SWR: conditional key; RTK Query: `skip`).
- Apply a freshness window of at least 30 seconds and a cache-retention window of at least 5 minutes for entity detail queries, dialog-scope data (React Query: `staleTime` / `gcTime`; SWR: `dedupingInterval`; RTK Query: `keepUnusedDataFor`).
- Create mode: no entity fetch. Form defaults to empty or caller-supplied `defaultValues`.

**Allowed variation:**
- Prop-fed entity data when the caller's list query already holds the full entity shape. Secondary lookups (dropdowns, linked data) may still use query hooks.

**Forbidden:**
- Manual local-state-plus-effect fetching pattern inside the dialog.
- Direct database/API calls inside the dialog component. Route through a service module layer.
- Raw inline queries for dropdown options — use dedicated hooks.

---

## Layer 9 — Type shapes (contract)

**Required:**
- Entity type shared with list/detail views. Not re-declared inside the dialog.
- Form state typed as the inferred output of the project's **schema-validation definition**, defined in the same file (or imported from a shared forms module).
- Wire the schema-validation definition through the project's **schema-validated form hook** — a typed form-state hook whose validation is resolved against that definition.

**Allowed variation:**
- For dialogs that receive entity data via prop and have no editable form (view-only or edit delegated to caller via `onSave`), the schema-validated form hook is optional.

**Forbidden:**
- Multiple individual local-state fields, one `useState` per form field.
- Untyped (`any`) form state.
- Entity types declared inside API modules or hooks — they must live in the project's shared types layer.

---

## Layer 10 — Mutations & invalidation (contract)

Mutations are the consumer's responsibility. The primitive's footer exposes callbacks.

**Governing principle: invalidation follows the mutation owner.** Whichever component owns the mutation owns invalidation, and routes it through a centralized self-invalidating helper. This admits two sanctioned shapes:

1. **Self-contained dialog** — the dialog owns its mutation(s). It MUST call `invalidate<Entity>()` in its own success handler and MUST NOT delegate that invalidation to the caller.
2. **Controlled form** — the dialog owns no mutation; it emits values via a typed `onSave(values)` callback and the parent persists them. Delegating is compliant **provided** the parent persists through a self-invalidating mutation hook or `invalidate<Entity>()` helper.

**Required (consumer contracts):**
- All mutations use the project's async state library (React Query, SWR, RTK Query, or equivalent).
- On mutation success in a self-contained dialog: call a centralized `invalidate<Entity>(queryClient, entityId)` helper that enumerates every queryKey where the entity appears (list, detail, and all parent queries that join or embed the entity).
- A controlled form's `onSave(values)` must be persisted by the caller through a self-invalidating mutation hook or `invalidate<Entity>()` helper — never an ad-hoc per-call-site `invalidateQueries`.
- Toast on success via the project's toast library. If more than one toast surface is mounted by the app shell, pick one and document the choice.

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
- On desktop: right-side overlay surface at the chosen width. On mobile: full-viewport overlay surface. The CRUD-dialog shell handles this automatically via the **viewport-breakpoint hook**.
- Body 2-col grids must collapse to a single column on narrow viewports — the only allowed per-consumer responsive override.

**Forbidden:**
- Custom width overrides at the consumer level that bypass the width system.
- Per-consumer viewport-query hooks inside dialog components for anything beyond column collapse.

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
- Showing the Delete button in create mode. The dialog-footer primitive enforces this automatically.

---

## Layer 13 — Mode contract *(dialog-specific)*

**Required:**
- Use the **mode-state hook**. Returns `{ mode, setMode, isView, isEdit, isCreate }`, where `setMode(next, opts?: { force?: boolean })`.
- Use the **action-flow controller** to own the action flow on top of the mode-state hook. It is the canonical owner of `handleClose`, `handlePrimary`, and `handleSecondary` — the dialog wires these to the overlay's close, the footer primary, and the footer secondary respectively, and does not reimplement the transition logic inline. The controller composes the mode-state hook, the schema-validated form hook instance, and the create/update mutations; the dialog keeps its schema, default values, mutation bodies, and form JSX.
- `initialMode`: pass `"create"` when `entityId` is absent; pass `"view"` or `"edit"` when `entityId` is present. Caller controls the initial mode via prop.
- **view → edit:** Call `setMode("edit")`. Fields switch from read-only display to form inputs. No confirmation needed (no data loss on forward transition).
- **edit → view (cancel):** Call `setMode("view")` via `onConfirmDiscard`. If `isDirty` is true and `onConfirmDiscard` is provided, the mode-state hook requests confirmation before transitioning. On confirmed: transition + reset form to the last-saved values (the record as loaded, until the first save in this dialog session).
- **edit → view (save success):** owned by the **action-flow controller**'s primary-action handler — it resets the form to the saved values and calls `setMode("view", { force: true })`. The dialog's update-mutation success callback only calls `invalidate<Entity>()` and shows a success toast; it must not transition the mode itself. `force` skips the dirty-discard guard: nothing is being discarded after a save, and the consumer's `isDirty` has not re-rendered yet from the form reset, so the unforced guard would prompt spuriously. Never `force` a user-initiated cancel.
- **create → closed (success):** Call `onClose()` after mutation `onSuccess`. Call `invalidate<Entity>()` and show a success toast.
- **any → closed (X / backdrop / Esc):** Wrap `onClose()` in a dirty-check guard. If mode is `edit` or `create` and the form is dirty, request confirmation before calling `onClose()`.
- On form field change: keep `isDirty` in sync with the schema-validated form hook's dirty-state flag via `useEffect` or inline comparison.

**Allowed variation:**
- View-only dialogs (no edit path) may initialize with `mode="view"` and never call `setMode`. The footer shows only a Close action.
- **Edit-only dialogs** — the entity is created outside the UI (import, sync, a matcher, provisioning), so the dialog owns view/edit but never create. Omit the action-flow controller's `createMutation`; it is optional. Do **not** alias the update mutation into it or declare a stub whose body throws: the reachable modes belong in the types, not in a comment, and a stub leaves the create path silently issuing an update (or throwing unhandled) if a call site ever passes `initialMode="create"`. With the option omitted, `handlePrimary` in create mode logs an explicit console error and submits nothing. `updateMutation` is optional in the same way for a create-only dialog.

**Forbidden:**
- Passing a mutation the dialog never intends to run — the update mutation aliased as `createMutation`, or a `mutationFn` that only throws — to satisfy the controller's option shape. Omit the option instead (see the edit-only allowed variation).
- `isEditing: boolean` local state instead of the mode-state hook.
- Mode driven entirely by prop null-check (e.g. `isEdit = entity !== null`) without a runtime-switchable mode state.
- Silently discarding unsaved changes when the X button is clicked — dirty-check on close is required in edit and create modes.
- Mode transitions outside the mode-state hook.
- Closing the dialog after a successful *edit* save. Only a create closes on save; an edit returns to view so the user keeps their place on the record they just saved.
- Reimplementing `handleClose` / `handlePrimary` / `handleSecondary` inline instead of deriving them from the action-flow controller.

---

## Layer 14 — Footer contract *(dialog-specific)*

**Required:**
- Use the **dialog-footer primitive**.
- Pass `primaryLabel`, `onPrimary`, `isSubmitting`, and optionally `secondaryLabel`, `onSecondary`, `destructiveLabel`, `onDestructive`.
- `primaryLabel` / `secondaryLabel` and the `onPrimary` / `onSecondary` handlers are derived by the **action-flow controller** (per mode: Edit/Save/Create for primary, Close/Cancel for secondary) — read them off the controller rather than hand-rolling per-mode label and handler switches in the dialog.
- **i18n.** The controller's label derivation reads from a `labels` option that defaults to a neutral-language default set (Edit / Create / Save / Close / Cancel / "Discard changes?"). A consumer in another language passes a localized label set to the controller's `labels` option (and a matching `onConfirmDiscard` to the mode-state hook); the baseline ships no non-English strings. Keep the localized strings in a project-local module, not inside the donor-managed archetype directory, so a re-apply of the archetype cannot overwrite them.
- **i18n (submitting label).** The dialog-footer primitive's in-flight primary label defaults to an English derivation of `primaryLabel` (stripping a trailing "e" and appending "ing…"), which only produces correct output for "Save"/"Create". The action-flow controller resolves the real label from `labels.saving` / `labels.creating` (falling back to that same derivation from `labels.save` / `labels.create`) and exposes it as `submittingLabel` — read it off the controller and pass it straight to the dialog-footer primitive rather than letting the primitive derive it from a localized `primaryLabel`, which would mangle non-English words into invalid gerunds.
- The footer enforces the mode-aware button layout described below.
- Delete click must open the **confirm-dialog primitive** before executing the delete mutation. Never call the delete mutation directly on button click.

**Mode-aware layout:**

| Mode   | Left edge (destructive) | Right edge (secondary → primary) |
|--------|------------------------|----------------------------------|
| View   | Delete (outline style, destructive color, disabled) | Close · **Edit** |
| Edit   | Delete (outline style, destructive color, enabled)  | Cancel · **Save** |
| Create | —                      | Cancel · **Create** |

- Delete: always left-aligned. Disabled in view mode — and under any business-rule gate — as a static disabled state, distinct from the in-flight spinner; never a no-op handler. Absent in create mode. Triggers the confirm-dialog primitive before mutation.
- Primary (Edit / Save / Create): rightmost, the primary button style. When `isSubmitting`, disabled and labeled with the controller's `submittingLabel` ("Saving…" / "Creating…" by default).
- Secondary (Close / Cancel): the secondary (outline) button style, to the left of primary.

**Allowed variation:**
- Secondary actions (Duplicate, Archive, Export) may be added as a `⋯` overflow menu button to the left of the primary action group.
- `destructiveLabel` / `onDestructive` omitted when the entity cannot be deleted (e.g. a permanent system entity).

**Forbidden:**
- Footer actions placed in the dialog header or inside the body.
- Primary button on the left, secondary on the right (reversed order).
- Using a raw browser confirm dialog for delete confirmation — use the confirm-dialog primitive.
- Delete button visible in create mode.
- Using a generic, unstyled footer container in a J dialog instead of the dialog-footer primitive.

---

## Layer 15 — Cross-context invocation *(dialog-specific)*

**Required:**
- A single dialog component per entity, invocable from every call site. Zero per-context duplicates.
- The same entity dialog (e.g. a Workout dialog, a Customer dialog) is opened from a list row, from a header search result, from a detail panel — wherever the entity appears. The caller passes `entityId` + `open` + `onClose` only.
- Entity fetching lives outside the primitive shell (consumer hook). The dialog's API is open/close + entityId (for view/edit) or null/undefined (for create).
- Multiple call sites must not race — the rendering shell is the caller's concern; data fetching is outside the primitive.

**Allowed variation:**
- Separate create and view/edit dialogs for the same entity when the surfaces are genuinely different (e.g. a creation wizard vs. a view/edit surface). Justify per entity.

**Forbidden:**
- Two separate components for the same entity's edit path (duplicate edit dialogs).
- Dialog-inside-dialog pattern (opening a second J dialog from inside a first J dialog). The exception is the confirm-dialog primitive (confirm-only).
- Passing context-specific props (e.g. `orderId`, `sourcePageId`) to a J dialog to distinguish invocation-site behavior. The dialog must work identically from all call sites.

---

## Forbidden patterns

The following patterns are never permitted in a J dialog, regardless of domain:

1. **Silently discarding dirty state.** Always confirm before closing when the user has unsaved changes.
2. **Mode outside the mode-state hook.** All mode logic is centralized there.
3. **Footer actions in the header or body.** Footer has a fixed slot; header and body do not own CRUD actions.
4. **Bottom-sheet on desktop.** Right slide-in is the J convention on desktop.
5. **Inline editing of sub-entities inside Tab 1.** Navigate to the sub-entity's own dialog or page.
6. **More than 2 tabs.** If 3+ are needed, the entity is a page-archetype candidate, not a J dialog.
7. **Raw browser confirm for delete.** Use the confirm-dialog primitive.
8. **Re-declaring entity types inside the dialog.** Entity types live in the project's shared types layer.
9. **Nested J dialogs.** No J dialog may open another J dialog on top of itself.
10. **Static entity-type titles.** The entity's name or identifier must appear in the dialog-header primitive's title.

---

## Migration notes (project-extension contract)

When a target project applies this archetype, it wires the generic primitives to its own data layer and may extend them with project-specific behavior as described below.

**Allowed project extensions:**
- **Project-specific form fields.** The body content is fully consumer-controlled. Pass any form, field group, or tab layout as children of the dialog-body primitive.
- **Project-specific footer secondary actions.** The dialog-footer primitive accepts an optional overflow menu slot for domain-specific secondary actions (Duplicate, Archive, Export).
- **Project-specific permissions.** Pass `canEdit` and `canDelete` booleans derived from the project's RBAC hook.
- **Project-specific `invalidate<Entity>()` helpers.** Each entity must have its own invalidation helper that enumerates every derived queryKey. These live in the project, not in the baseline primitive.
- **Separate create and view/edit dialogs.** When the create and edit surfaces genuinely differ (different field set, different trigger context, different width), two separate components for the same entity are allowed. Justify per entity.

**What stays in the project (does not propagate to baseline):**
- Domain-specific query hooks (e.g. `useWorkout()`, `useCustomer()`).
- Domain-specific entity types, schema-validation definitions, and form default values.
- Centralized `invalidate<Entity>()` helpers (per entity, per project).
- Business rules governing which footer actions appear for a given entity state.
- Cross-resource invalidation topology.

---

## Revision log

- **2026-06-13 — v1.2.** Promoted the action-flow controller (shared view/edit/create action flow + derived footer labels) and the neutral-defaults strings module from mistra. Added the controller's `labels` i18n option (a neutral-language default set) so localized consumers inject their strings rather than forking the donor primitives. Layers 13–14 now name the controller as the canonical owner of `handleClose`/`handlePrimary`/`handleSecondary` and the footer label derivation. Additive, backward-compatible.
- **2026-06-14 — v1.5.** Closed a spec-ahead-of-code gap: the v1.2 controller (action-flow controller, neutral-defaults strings module) was documented but its files had never been committed. Committed them, and migrated the reference demo to actually consume the controller with a schema-validated form hook and the shared table / status-badge / form-field molecules — it no longer reimplements `handleClose`/`handlePrimary`/`handleSecondary` inline (the spec's own anti-pattern). The demo now remounts per open, fixing stale mode/dirty state across reopens. Reconciled the frontmatter `version` (was stuck at 1.2) and `source_spec_version` (1.3) with the MANIFEST. Spec contract unchanged.
- **2026-07-03 — v1.7.** Board-form sync: on-surface header-bar treatment, ledger title scale, single-owner molecule references.
- **2026-08-04 — v2.0 (major).** Promoted mistra's forced mode-transition fix: the mode-state hook's `setMode` gains an optional `{ force?: boolean }` that skips the dirty-discard guard, and the action-flow controller's `handlePrimary` now awaits the save, resets the form, and splits Layer 13's two outcomes itself — create closes, edit returns to view via `setMode("view", { force: true })` — instead of leaving the post-save transition to the dialog's own `onSuccess`. `CrudDialogMutation` now requires `mutateAsync` (was a fire-and-forget `mutate`) so the controller can sequence the reset and transition after the save resolves — a breaking rename for any existing consumer's mutation shape, hence the major bump. Layer 13 documents the new bullet and adds a Forbidden entry against closing the dialog on a successful edit save. `source_spec_version` reconciled to 1.7 (mistra).
- **2026-08-04 — v2.1.** `createMutation` and `updateMutation` are now **optional** on the action-flow controller, for dialogs whose entity has an external creation path (import, sync, matcher, provisioning) or is create-only. `handlePrimary` resolves the mutation its mode needs and, when it was not supplied, logs an explicit console error and submits nothing rather than falling through to the other mutation. It deliberately does not `throw` — call sites invoke `handlePrimary` as `void handlePrimary()`, so a throw would surface as an unhandled rejection with no toast. Layer 13 gains the edit-only allowed variation and a Forbidden entry against passing a mutation the dialog never intends to run (an aliased update mutation, or a `mutationFn` that only throws) to satisfy the option shape. Additive and backward-compatible: consumers passing both options compile unchanged.
- **2026-08-18 — v3.0 (major).** The shell API closes — archetype-convergence Phase 1 (archetype J), applying ADR-0004 / RULES.md hard rule 12 to every per-call-site appearance prop on the shell. The `className` prop is **deleted** from the CRUD-dialog shell, the dialog-header primitive, the dialog-body primitive, and the dialog-footer primitive — the same unenumerable superset escape hatch the `detail-overview` / `form-page` / `list-with-detail` close-API tickets removed, and the `*Sheet.tsx`-named overlay shell this archetype uses was the one the prior `*Shell`-only gate had missed. The `width` axis is **kept but no longer a free choice**: Layer 2 now carries an exhaustive keying rule that derives the step from the rendered body's tab count and field count (two-tab body → `lg`; 3–4 fields minimal form → `sm`; 5+ fields standard form → `md`), and the Layer 2 Allowed-variation bullet "Width variant choice per consumer" that re-opened the step the Required section just closed is deleted. The reference demo (`src/examples/crud-dialog-demo.tsx`) reworks the free-choice `width` toggle into a `deriveDialogWidth({ tabs, fieldCount })` helper computed from the body JSX — the body layout picker is kept because it still demonstrates all three body shapes. The lint ratchet for this class is engaged in the same pass: the generic `archetype-shell-class-name` rule's `include` is widened to an array covering `*Shell.tsx` **and** `*Sheet.tsx` (a shell not named `*Shell` no longer slips the gate), the `archetype-look-union-prop` drain now excludes `crud-dialog/**` (the kept `width` / `layout` union props are contract-derived), and a folder-scoped `crud-dialog-shell-class-name` `error` rule re-gates the deleted `className` axis across the whole archetype directory. Deliberate breaking change — the deleted `className` props were the contract's documented escape hatch (ADR-0004 / RULES.md hard rule 12), and a consumer passing a hand-typed width or a `className` now fails `tsc --noEmit` / `lint-design.mjs`.

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

- [ ] **CRUD actions in the footer.** Save/Create/Edit/Delete live in
      the dialog-footer primitive; the header `actions` slot holds only mode-toggle/icon
      affordances. *Wrapper tell:* a Save button in the header or body.
- [ ] **Body scroll owned by the dialog-body primitive** — no custom scroll/max-height
      override on the shell.
- [ ] **Shell composition** — the dialog-header/body/footer primitives compose the
      CRUD-dialog shell, not a raw overlay primitive with hand-rolled padding/scroll.
- [ ] **Mode contract honored** — view vs edit vs create driven by `entityId`/mode,
      not duplicated dialogs.
- [ ] **Secondary actions in a `⋯` overflow** left of the primary group, not a button row.
- [ ] **[spine] S2, S4, S5, S6** (+ S3 as the body loading-skeleton slot).
