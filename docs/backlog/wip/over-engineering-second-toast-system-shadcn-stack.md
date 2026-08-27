---
area: over-engineering
opened: '2026-08-26'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-26T17:17:19.297Z'
model: sonnet
model_reason: >-
  the target state is already pinned in STACK.md — delete one of two implementations and unmount it;
  no design judgment left
---

# Delete the shadcn toast stack the donor ships alongside sonner

## Context

The donor ships **two complete toast systems and mounts both**. `src/components/layout/AppShell.tsx:44-45` renders `<Toaster />` (the shadcn/Radix viewport, `src/components/ui/toaster.tsx`) and `<Sonner />` (`src/components/ui/sonner.tsx`) side by side, so every consumer of `/style-baseline` receives two toast runtimes, two portals and two APIs.

`docs/STACK.md:30` pins exactly one: `| Toasts | sonner | ^2 | Toaster/toast() contract |`. That file's own "What needs an ADR" section (`docs/STACK.md:59`) names "a second toast library" as the first example of a package that must carry an ADR or be removed, and scar 2 generalizes the rule ("Two headless foundations at once"). No ADR in `docs/adr/` covers the shadcn toast. `docs/STYLE.md:385` concedes the state rather than defending it: *"prefer sonner for new code; the shadcn `<Toaster>` is mounted for legacy `use-toast` callers."* There are zero `use-toast` callers in this repo other than the machinery that exists to serve them — `src/components/ui/toaster.tsx` (the viewport) and `src/components/ui/use-toast.ts`, a three-line re-export shim whose whole body is `export { useToast, toast }` from `@/hooks/use-toast`, kept "so legacy callers keep working."

The duplication already costs real work elsewhere. `.design-sync/NOTES.md` records that `Toaster` is exported by **both** `ui/sonner.tsx` and `ui/toaster.tsx`, so the barrel assembled by `.design-sync/build-pkg.mjs` had to hand-card sonner's `Toaster` with an explicit re-export — without it the ambiguous `export *` collision drops the symbol to `undefined`. A name collision inside the donor's own package build is the duplication surfacing as a defect, not a preference.

The deletable surface is `src/hooks/use-toast.ts` (189 lines), `src/hooks/use-toast.test.tsx` (28), `src/components/ui/toast.tsx` (127), `src/components/ui/toaster.tsx` (33) and `src/components/ui/use-toast.ts` (3) — 380 lines — plus the `@radix-ui/react-toast` dependency in `package.json`, which `/style-baseline` installs into every target verbatim.

## What to do

- [ ] Delete `src/hooks/use-toast.ts`, `src/hooks/use-toast.test.tsx`, `src/components/ui/toast.tsx`, `src/components/ui/toaster.tsx`, and the `src/components/ui/use-toast.ts` re-export shim.
- [ ] Remove the `<Toaster />` mount and its import from `src/components/layout/AppShell.tsx`, keeping `<Sonner />` as the single toast viewport.
- [ ] Drop `"@radix-ui/react-toast"` from `package.json` `dependencies` and regenerate `package-lock.json`.
- [ ] Remove the explicit sonner-`Toaster` carding workaround from `.design-sync/build-pkg.mjs` and the paragraph documenting it in `.design-sync/NOTES.md`, since the collision it works around no longer exists.
- [ ] Update the `Toasts` row and the vendored-primitive / hooks lists in `docs/STYLE.md` (lines 13, 152, 158, 168, 262, 385) and the primitive count in `docs/ARCHITECTURE.md` §3 so they name sonner only.
- [ ] Delete `.design-sync/previews/Toast.tsx` so the preview corpus stops carding a component the baseline no longer ships.

## Acceptance

- `grep -rn "use-toast\|ui/toaster" src` returns no matches, and `npx tsc --noEmit` still passes.
- `AppShell` mounts exactly one toast viewport — `grep -c Toaster src/components/layout/AppShell.tsx` returns 1 (the sonner import).
- `jq '.dependencies["@radix-ui/react-toast"]' package.json` returns `null`, and `grep -c react-toast package-lock.json` returns 0.
- The `.design-sync` package build resolves `Toaster` to sonner's export with no explicit carding line, and `npm test` passes after the `use-toast` suite is removed.
- After the change no package in `package.json` overlaps the Toasts contract row, so `docs/STACK.md`'s "What needs an ADR" rule holds for the donor itself.
- A fresh `/style-baseline` run against a target no longer installs `@radix-ui/react-toast` and no longer copies `ui/toast.tsx` / `ui/toaster.tsx`.

## Related

- [docs/STACK.md](../../STACK.md) — the contract row pinning `sonner` and the rule forbidding a second toast library without an ADR.
- [archive/donor-deps-violate-stack-contract.md](../archive/donor-deps-violate-stack-contract.md) — the prior instance of `package.json` diverging from the STACK.md contract, and the precedent for fixing the manifest here rather than downstream.
- [archive/use-toast-listener-subscription-deps.md](../archive/use-toast-listener-subscription-deps.md) — a bug fixed *inside* the stack this ticket deletes; that maintenance cost is the argument for removing it.
- [src/components/layout/AppShell.tsx](../../src/components/layout/AppShell.tsx) — the double mount.
