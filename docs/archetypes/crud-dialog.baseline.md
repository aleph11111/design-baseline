---
slug: crud-dialog
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/crud-dialog.md
---

# CRUD dialog — baseline reference implementation

> The stack-specific binding of the [crud-dialog contract](./crud-dialog.md) to the
> **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell). Each
> role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<CrudDialogSheet>` in `src/components/archetypes/crud-dialog/` — the Sheet wrapper with mobile-adaptive width. Composed of:
- `<CrudDialogHeader>` — title, optional subtitle, optional close button, actions slot.
- `<CrudDialogBody>` — ScrollArea body wrapper with consistent padding and loading skeleton slot.
- `<CrudDialogFooter>` — mode-aware footer enforcing the button layout contract.
- `useCrudDialogMode` — hook centralizing mode state and dirty-close logic.
- `useCrudDialogController` — hook owning the shared view/edit/create action flow (dirty-guarded close, primary/secondary handlers, derived footer labels). Composes `useCrudDialogMode` with the form and mutations.
- `crudStrings` — neutral English defaults (`CRUD_ERRORS`, `CRUD_DISCARD_PROMPT`, `confirmDiscard`). Consumers in another language inject their own via the controller's `labels` option; the baseline never bakes in a specific language.

The reference demo (v1.5) additionally composes shadcn `<Table>`, `<Badge>`, and `<FormField>`/`<FormMessage>` for its Tab 2 connected-entity list and its form fields.

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each contract role. Only layers with a baseline-specific binding appear.

### Layer 1 — Open/close contract
- Overlay-surface primitive → the Sheet's `onOpenChange`.

### Layer 2 — Dialog shell
- CRUD-dialog shell → `<CrudDialogSheet>` from `src/components/archetypes/crud-dialog/`. **No `className` prop** — the shell's outer `<SheetContent>` wrapper is styled inline via `useIsMobile` (full-viewport on mobile; `WIDTH_MAP` inline width on desktop). The v3.0 convergence close removed the per-call-site `className` escape hatch from the shell and its header / body / footer (the same `*Shell` / `*Sheet` ratchet the sibling closed archetypes engage); the lint rule `crud-dialog-shell-class-name` enforces it at the archetype-folder scope, and the generic `archetype-shell-class-name` rule's `include` array now covers `*Sheet.tsx`-named overlay shells.
- Width step binding — `CrudDialogSheet`'s `width: "sm" | "md" | "lg"` prop maps through the in-code `WIDTH_MAP` to `22rem` (sm), `30rem` (md), `40rem` (lg). The v3.0 keying rule in the contract's Layer 2 derives the step from the body's shape: a two-tab or multi-section body → `lg` (`40rem`); a 5+ field single-section form → `md` (`30rem`); a 3–4 field minimal form → `sm` (`22rem`). The demo's `deriveDialogWidth({ tabs, fieldCount })` is the reference-binding for that derivation — it reads `tabs` and `fieldCount` from the body JSX, not from a toggle.
- Overlay-surface primitive (modal variant, forbidden here) → shadcn `<Dialog>`.
- Forbidden width override → manual `max-w-*` or viewport-relative `w-[…]` classes on the Sheet content.
- Forbidden scroll override → custom `max-h-[90vh] overflow-y-auto` on the shell.
- Forbidden trigger element → `<SheetTrigger>`.
- Viewport-breakpoint hook → `useIsMobile`.

### Layer 3 — Dialog header
- Dialog-header primitive → `<CrudDialogHeader>` from `src/components/archetypes/crud-dialog/`.
- Overlay-surface primitive's title/description elements → Radix `Dialog.Title` (via shadcn `<SheetTitle>`) / Radix `Dialog.Description` (via shadcn `<SheetDescription>`); overlay content region → `<SheetContent>` (Radix `Dialog.Content`). Radix logs a development error when `Dialog.Content` has no `Dialog.Title` descendant, and a warning when `aria-describedby` references a missing node — the required `<SheetTitle>`/`<SheetDescription>` binding guarantees neither fires.
- Header-fill contract → `HeaderFillContext` (`src/components/layout/headerFill.ts`): `"solid"` (default) fills the bar with the brand accent and inverts title/subtitle/`actions` to white; `"tint"` is a quieter `bg-muted` step; `"white"` is hairline-border-only.
- Status-badge primitive → `<Badge>`, never inverted in `actions`.

### Layer 5 — Body wrapper
- Dialog-body primitive → `<CrudDialogBody>` from `src/components/archetypes/crud-dialog/`.
- Canonical dialog-body padding/scroll treatment → `flex-1 overflow-y-auto px-6 py-4`.
- Forbidden extra padding → `py-2` / `py-4` inside the body's immediate children.
- Forbidden scroll wrapper → `overflow-y-auto` on `<SheetContent>` or its direct children.
- Loading skeleton → the shared `<Skeleton>` atom (`ui/skeleton`), which already
  carries `animate-pulse rounded-md bg-muted`; the body composes it into a
  label-over-control field stack matching the real field's `space-y-1.5`. This is
  the **one** sanctioned skeleton in the baseline (see `README.md`, "Layer 7 —
  canonical state treatments").
- Forbidden hand-rolled skeleton → raw `animate-pulse` / `bg-muted` `<div>` blocks
  in place of the `<Skeleton>` atom.

### Layer 6 — Body content shape
- Flat stack → `<CrudDialogBody layout="flat">`, internally a `space-y-4` stack.
- Two-column → `<CrudDialogBody layout="two-column">`, internally `grid-cols-1 sm:grid-cols-2 gap-4`.
- Tab primitive → shadcn `<Tabs>` with exactly 2 tabs, composed as `<CrudDialogBody>` children (no `layout`).
- Mixed bodies → hand-composed `space-y-4` + inner `grid grid-cols-1 sm:grid-cols-2 gap-4`.
- Card / section-card surface → `<Card>`.
- Confirm-dialog primitive → `<ConfirmationDialog>` (`src/components/ui/confirmation-dialog.tsx`).

### Layer 7 — States
- Compact inline-error box → `<div className="bg-destructive/10 p-4 rounded text-sm text-destructive">` (not hardcoded `bg-red-50`).
- Dialog-footer primitive saving state → `<CrudDialogFooter isSubmitting>`.
- State-view primitive → `<StateView variant="empty" icon={…} title="No {things} yet." />` (`ui/state-view`).

### Layer 8 — Data fetching
- Open/entityId gate → `enabled: open && !!entityId` (React Query).
- Freshness / retention window → `staleTime: 30_000`, `gcTime: 300_000` (React Query).

### Layer 9 — Type shapes
- Schema-validation definition → a Zod schema.
- Schema-validated form hook → react-hook-form's `useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })`.
- Dirty-state flag → react-hook-form's `formState.isDirty`.

### Layer 10 — Mutations & invalidation
- Project's toast library → Sonner `toast()` (recommended); shadcn `<Toaster>` may also be mounted — pick one and document the choice.

### Layer 11 — Mobile variant
- CRUD-dialog shell mobile swap → `<CrudDialogSheet>` via `useIsMobile`.
- Body 2-col collapse → `grid-cols-1 sm:grid-cols-2`.
- Forbidden width override → `sm:max-w-*` / `w-[…]` at the consumer level.
- Forbidden viewport hook → per-consumer `useMediaQuery`.

### Layer 13 — Mode contract
- Mode-state hook → `useCrudDialogMode` (`src/components/archetypes/crud-dialog/`). Returns `{ mode, setMode, requestDiscard, isView, isEdit, isCreate }`, where `setMode: (next, opts?: { force?: boolean }) => Promise<boolean>` — `force` skips the dirty-discard guard.
- Action-flow controller → `useCrudDialogController` (`src/components/archetypes/crud-dialog/`), owner of `handleClose` / `handlePrimary` / `handleSecondary`. `handleClose` calls `mode.requestDiscard()` — the same guard `setMode` uses internally — so the X/Esc/backdrop close path and the edit→view cancel path share one `isDirty` source and one `onConfirmDiscard`.
- Post-save transition → `handlePrimary` awaits `CrudDialogMutation.mutateAsync(values)`, then `form.reset(values)`, then splits on mode: create calls `onClose()`; edit calls `mode.setMode("view", { force: true })`. `CrudDialogMutation` requires `mutateAsync`, not a fire-and-forget `mutate` — the controller must observe save completion to sequence the reset and transition.

### Layer 14 — Footer contract
- Dialog-footer primitive → `<CrudDialogFooter>` from `src/components/archetypes/crud-dialog/`.
- Neutral-language default label set → `DEFAULT_CRUD_DIALOG_LABELS`; localized override type → `CrudDialogLabels`. Keep project-local localized strings out of the donor-managed `src/components/archetypes/crud-dialog/` directory so a `/style-archetypes` re-apply doesn't overwrite them.
- Localizable submitting label → `CrudDialogLabels.saving` / `.creating`, resolved by `useCrudDialogController` into `submittingLabel` and forwarded to `<CrudDialogFooter submittingLabel>`. Omit to fall back to the English `${label.replace(/e$/, "")}ing…` derivation (mirrors `FormPageActions`'s `submittingLabel` prop).
- Confirm-dialog primitive → `<ConfirmationDialog>` (or shadcn `<AlertDialog>`).
- Delete button style → `variant="outline"`, `text-destructive`.
- Primary button style → default variant. Secondary button style → `variant="outline"`.
- Forbidden raw confirm → `window.confirm()`.
- Forbidden generic footer → shadcn `<DialogFooter>`.

### Layer 15 — Cross-context invocation
- Example entity dialogs → `<WorkoutDialog>`, `<CustomerDialog>`.
- Confirm-dialog primitive exception → `<ConfirmationDialog>`.

## Acceptance gate (baseline tells)
- Footer → `<CrudDialogFooter>`.
- Shell composition → `<CrudDialogHeader>` / `<CrudDialogBody>` / `<CrudDialogFooter>` inside `<CrudDialogSheet>`, not a raw `<Dialog>`/`<Sheet>` with hand-rolled padding/scroll.
