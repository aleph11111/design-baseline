---
area: hooks
opened: 2026-07-04
status: done
model: sonnet
model_reason: one-line dependency-array fix with a clear behavioral test, mechanical
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Fix useToast subscription effect that re-subscribes on every toast state change

## Context

Severity: **low** (performance / correctness hygiene). The subscription effect in `src/hooks/use-toast.ts` declares `[state]` as its dependency array (`use-toast.ts:180`), but its body only pushes the stable `setState` into the module-level `listeners` array and splices it out on cleanup (`:172`). Because `dispatch` calls every listener's `setState(memoryState)` on each add/update/dismiss/remove, `state` changes on every toast transition, so React tears down and re-runs this subscribe/unsubscribe effect each time — despite the intended mount-only lifecycle. `setState` identity is React-guaranteed stable, so the dependency should be `[]`. This is the known upstream shadcn/ui `use-toast` bug, and it propagates to every project adopting the baseline hook. Harmless functionally today but pure churn and a latent footgun.

## What to do

- [ ] Do red/green TDD: add a failing test (introduce `vitest` + `@testing-library/react`; the repo is typecheck-only today) asserting the module-level `listeners` array length stays constant across multiple `toast()` dispatches from a single mounted consumer (no re-subscribe churn); then make it pass.
- [ ] Change the effect dependency array from `[state]` to `[]` so the listener registers on mount and unregisters on unmount only (`use-toast.ts:180`). (Optionally note migrating to `useSyncExternalStore` as the idiomatic external-store subscription.)

## Acceptance

- A mounted `useToast` consumer registers its listener exactly once and removes it on unmount; dispatching toasts no longer tears down and re-adds the listener.
- The `listeners` array length is invariant across dispatches under test.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- src/components/ui/toast.tsx — consumer of this hook
- src/components/ui/toaster.tsx — mounts the toast viewport
