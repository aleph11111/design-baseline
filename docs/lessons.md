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
