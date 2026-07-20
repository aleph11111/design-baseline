# Lessons

Durable, tracked corrections that survive across worktrees and ship with the repo.
Reviewed at session start; drained here from `tasks/lessons.md` by `/ship`.

## Donor exports: "unused in-repo" ≠ dead code

design-baseline is a **donor** — `src/` exports are copy-source for downstream projects.
A documented public export (e.g. those enumerated in `docs/archetypes/<slug>.baseline.md`)
being unused in the local demo/gallery is the *expected, correct* state, not dead code.
Hygiene sweeps that grep for in-repo consumers will over-flag these. Before pruning an
"orphaned" export, check whether it's documented public API; if so, keep it. The genuine
dead artifacts are undocumented ones with no consumer AND no doc reference (e.g. a UI
primitive whose only trace was a JSDoc mention).

## Layer 7: a hand-rolled state plane is not automatically drift — read the contract first

An audit that greps for "shells not using `StateView`" **over-flags by design**, because
Layer 7 deliberately prescribes *different* chrome per surface. Before "fixing" any
loading/empty/error plane, check the archetype's own Layer 7 and
`docs/archetypes/README.md` → "Layer 7 — canonical state treatments":

- **Skeletons are mandated, not drift, in P (kanban) and H (feed).** Both contracts say
  "never a page spinner" — and `StateView variant="loading"` *is* a centered text
  spinner. Routing them through it would introduce violations. `README.md` states it
  globally: no skeleton screens in a list/table shell, and the J (crud-dialog) body is
  the **one** sanctioned skeleton in the baseline.
- **C (detail-overview) and M (matrix-grid) delegate loading to a route-level
  `loading.tsx`** — C's Layer 7 says outright that the archetype ships no loading
  primitive. Its bare `<Card>` early return is a feature-availability gate, not a plane.
- **Error has two treatments chosen by _surface_, not by cause.** A full destructive
  `<Alert>` is for a shell/page load failure (A, K, D2). A form or dialog inline error
  (B root error, J entity fetch) uses the compact tinted box
  `bg-destructive/10 p-4 rounded text-sm text-destructive`. Swapping one for the other
  is a violation in both directions.

The genuine drift signal is narrower: a plane that hand-rolls chrome the contract says
should be **shared** (an inline empty `<div>` where the canonical empty is `StateView`),
or a skeleton built from raw `animate-pulse`/`bg-muted` divs instead of the `<Skeleton>`
atom. Both were real; the other four flagged sites were correct as written.
