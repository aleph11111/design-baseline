---
area: layout
opened: 2026-09-28
status: done
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-09-28T10:30:00Z
---

# Make AppShell's bundled Sonner toaster opt-out for root-toaster consumers

## Context

`src/components/layout/AppShell.tsx` always renders `<Sonner />` (imported from `../ui/sonner`) after its `SidebarProvider`. A consumer that already mounts the toaster once at its root layout gets two toasters, and each toast renders twice. hk-crm is exactly that case: its `src/app/layout.tsx` mounts `<Toaster />` inside `ThemeProvider`, so the login routes outside the shell get toasts too. For that reason hk-crm had to keep a local `AppShell.tsx` when it adopted v0.2.11 (hk-crm PR #1093). It copies the ADR-0007 §1 page rhythm (`bg-surface-canvas p-4 md:p-12 xl:p-14`, the `--db-content-max` column, the `db-full-bleed` escape) verbatim, so the next rhythm change here will not reach it: it is a mirror that drifts.

## What to do

- [x] Add a `toaster?: boolean` prop (default `true`, so current consumers are unchanged) to `AppShellProps` in `src/components/layout/AppShell.tsx`, and render `<Sonner />` only when it is true.
- [x] Add a case to the layout tests (`src/components/layout/*.test.tsx` pattern) asserting no Sonner region renders with `toaster={false}`.
- [x] Bump the package version, cut the tag, and note in `docs/PACKAGE.md` that a root-toaster consumer passes `toaster={false}`. *(v0.2.13; the tag is cut by the tag-version workflow on merge.)*

## Acceptance

- `<AppShell toaster={false}>` renders no Sonner toaster region. The default `<AppShell>` still renders exactly one, so existing consumers are unchanged.
- hk-crm can delete its local `src/components/layout/AppShell.tsx` and render the package AppShell with `toaster={false}` and no visual change. That is a follow-up in hk-crm, not part of this ticket.

## Related

- [ADR-0007](../../adr/0007-fleet-house-look-fixed-vs-brand-roles.md) — the AppShell rhythm the local copy mirrors
- [[house-look-tokens-layer-roles]] — #308, which shipped that rhythm
