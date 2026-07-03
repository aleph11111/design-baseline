---
slug: form-page
kind: reference-implementation
stack: baseline (shadcn/ui + Tailwind 4 + sidebar app shell)
contract: docs/archetypes/form-page.md
---

# Form page — baseline reference implementation

> The stack-specific binding of the [form-page contract](./form-page.md) to the
> **design-baseline** stack (shadcn/ui + Tailwind 4 + the sidebar app shell). Each
> role in the contract is bound here to a concrete primitive + class strings. A
> project on a different stack does **not** need this file.

## Primitive binding

`<FormPageShell>` in `src/components/archetypes/form-page/` — the max-width single-column container for the form route. Composed of:

- `<FormPageHeader>` — title, optional subtitle, optional icon. No action slot (actions live in the footer).
- `<FormPageActions>` — sticky-or-inline footer with destructive (left) + secondary + primary (right) buttons. Mode-aware.
- `useFormPageState` — hook centralizing form mode (`create` / `edit`), dirty state, isSubmitting, and the dirty-guarded discard flow.

## Role → primitive map

Layer by layer, the concrete primitives and class strings that realize each contract role. Only layers with a baseline-specific binding appear.

### Layer 2 — Page shell
- Top-level app shell → `<AppShell>` from `src/components/layout/` (or the project's top-level layout primitive).
- Content-shell primitive → `<FormPageShell>` from `src/components/archetypes/form-page/`.
- Single-column max-width → default `max-w-xl` (~36rem), left-aligned. `width` prop: `"sm"` (`max-w-md`), `"md"` (`max-w-xl`, default), `"lg"` (`max-w-2xl`), `"xl"` (`max-w-4xl`).
- Canonical vertical rhythm → `space-y-6` between header and form body.
- Canonical page inset → not re-added at this layer; `AppShell`'s `<main>` supplies `px-6 py-6`.
- Render-error boundary → `<ErrorBoundary>` (or framework equivalent).
- Card-surface wrapper (optional) → `<Card>`.
- Two-column layout → `grid grid-cols-1 lg:grid-cols-2 gap-6`, only with `width="lg"` or `width="xl"`.
- Hand-rolled wrapper (forbidden) → `<div className="max-w-xl px-6 py-6">…`; centering via `mx-auto`.

### Layer 3 — Page header
- On-surface header bar → the shared `<SurfaceHeader>` (`@/components/layout/SurfaceHeader`), mounted by `<FormPageShell>` at the top of its bounded card.
- Canonical page-title type style → `text-lg font-semibold`. Monospace identifier style → `font-mono` at the call site (e.g. `"Edit Recipe — Sunday Carbonara"`).
- Header-fill contract → `HeaderFillContext` (`@/components/layout/headerFill`) — `solid` (default) / `tint` / `white`; override per instance via `<FormPageShell headerFill="…">`.
- Floating page-header treatment → `<FormPageHeader>`, a thin wrapper over the baseline `<PageHeader>`, same `text-lg font-semibold` title treatment.
- Muted extra-small supporting-text style (subtitle) → `text-xs text-muted-foreground`.
- Icon → `h-6 w-6`, placed inside `<FormPageHeader>` before the title.
- Back link → `backHref` prop on `<FormPageHeader>`.
- Actions-footer primitive → `<FormPageActions>`.

### Layer 5 — Content wrapper (form body)
- Form-provider bridge → shadcn's `<Form>` from `src/components/ui/form` (the react-hook-form `FormProvider` bridge).
- Form-field primitive tree → `<FormField>` + `<FormItem>` + `<FormLabel>` + `<FormControl>` + `<FormMessage>`.
- Canonical field-group gap → `<form className="space-y-4">`.
- Card / section-card surface (section grouping) → shared `<SectionCard title="…">` (`@/components/layout`); same primitive used by detail-overview's `<DetailSection>`. Fields render in the card's padded (non-`flush`) body.
- Card-grouped sections → `<Card>` around each section.
- Two-column field grid → `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">`.

### Layer 6 — Form fields
- Form-field primitives → shadcn `<Form>` primitives — `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` (and optionally `FormDescription`), bound to react-hook-form's `Controller`.
- Field input components → shadcn `<Input>`, `<Textarea>`, `<Select>`, `<Switch>`, `<Checkbox>`, `<RadioGroup>`, `<DatePicker>` (or `<Input type="date">`).
- Required-field marker → `<FormLabel>` asterisk.
- Form-message slot → `<FormMessage />`.

### Layer 7 — States
- Actions-footer primitive → `<FormPageActions>`.
- Form-message primitive → shadcn's `<FormMessage />`; form-field → `<FormField>`.
- Compact inline-error box → `bg-destructive/10 p-4 rounded text-sm text-destructive` (shared with the J crud-dialog inline error).
- Destructive alert treatment (contrast case) → the shell's full `<Alert>` load-error treatment; not `bg-red-50`.

### Layer 9 — Type shapes
- Dropdown select → Radix's `<Select.Item>` (reserves `''` as the "no value / placeholder" sentinel).

### Layer 11 — Mobile variant
- Form-page shell → `<FormPageShell>` (same max-width container on all viewports).
- Field grid collapse → `grid-cols-1 sm:grid-cols-2`.
- Actions-footer sticky behavior → `<FormPageActions>` becomes `sticky bottom-0` below the `sm` breakpoint (`sm:static` on desktop). The primitive handles this automatically.
- Max-width override (forbidden) → `max-w-*` bypassing the `width` prop on `<FormPageShell>`.

### Layer 12 — Permissions
- Actions-footer primitive → `<FormPageActions>` (Delete affordance hidden via `canDelete`).

### Layer 13 — Form contract
- Form-state hook → `useFormPageState` from `src/components/archetypes/form-page/`.

### Layer 14 — Actions footer
- Actions-footer primitive → `<FormPageActions>` from `src/components/archetypes/form-page/`.
- Layout → flex container, `justify-between`, `gap-2`, top padding `pt-2`.
- Default/primary button style → `variant="default"`.
- Secondary button style → `variant="outline"`.
- Destructive button style → `variant="destructive"`.
- Confirm-dialog primitive → shadcn `<AlertDialog>` (recommended); `window.confirm` acceptable in early-phase consumers and demos.
- Sticky on mobile → `sticky bottom-0` with a background fill below the `sm` breakpoint.
- Dialog-footer / card-footer chrome (forbidden reuse) → shadcn's `<DialogFooter>` or `<CardFooter>`.

### Layer 15 — Cross-context invocation
- Overlay surface (forbidden mounting) → a `<Sheet>` / `<Dialog>`.

### Migration notes
- Confirm-dialog primitive → shadcn `<AlertDialog>` (used by `requestDiscard` and as the general project confirm-dialog pattern).

## Acceptance gate (baseline tells)
- Actions-footer primitive → `<FormPageActions>` (the acceptance-gate checklist also refers to it as `<FormPageFooter>` — same primitive).
- Form-page shell → `<FormPageShell>`; hand-rolled wrapper tell → `max-w-xl px-6 py-6`; `mx-auto` centering.
- Card/section-card rhythm (SHOULD) → `<SectionCard>` / fieldset.
