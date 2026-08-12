---
area: tooling
opened: 2026-08-12
status: done
model: sonnet
model_reason: a two-line path-resolution fix in a command file with an already-known correct target (the package root next to package.json), no design decisions left
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-12T00:00:00Z
---

# /style-baseline copies components.json to the cwd instead of the target's package root

## Context

`/style-baseline` (`~/.claude/commands/style-baseline.md`) detects the target's source root as `$SRC` in step 2 and copies every donor file relative to it — except `components.json`, which step 4 copies with a hardcoded cwd path: `cp "$BASELINE/components.json" ./components.json` (line 130). The step-3 pre-flight collision check has the same bug: it tests a bare `components.json` (line 93) while every sibling path in the same loop is `$SRC`-prefixed.

On a flat target (`repo/src/`) cwd and the package root coincide, so the bug is invisible. On a **nested-frontend** target it is not: mistra's frontend is `frontend/` with `$SRC = frontend/src`, so the command dropped a donor-starter `components.json` (with the donor's own `rsc: true`) at the *repo root*, one level above the project's real `frontend/components.json` (`rsc: false`). Nothing read the stray file — it is not in any tsconfig, vite config, Dockerfile, or compose file — but it shipped to `origin/main` in mistra PR #508 and had to be removed by hand in mistra PR #527, and it also poisons the next run's collision check (step 3 reports `EXISTS: components.json` for a file the project never owned, forcing `--force`).

The correct destination is the **package root** — the directory holding `package.json`, which is what the shadcn CLI resolves `components.json` from. That is where both existing copies live: the donor's own at `~/Documents/dev/design-baseline/components.json` next to its `package.json`, and mistra's at `frontend/components.json` next to `frontend/package.json`.

## What to do

- [x] In step 4, replace `cp "$BASELINE/components.json" ./components.json` with a copy to the target's package root — derived from `$SRC` (its parent when `$SRC` ends in `/src`, else `$SRC` itself), or equivalently the nearest ancestor directory of `$SRC` containing a `package.json`.
- [x] Apply the same resolution to the step-3 pre-flight collision list so the `EXISTS:` check tests the path the copy will actually write, not a bare cwd-relative `components.json`.
- [x] Do not overwrite a `components.json` that already exists at that package root — it carries the target's per-project overrides (`rsc`, `tailwind.css`, aliases), which the step-4c/Notes curated-diff pass then has to revert by hand on every re-broadcast.
- [x] Update the step-9 verification checklist line "components.json at project root" (line 246) and the `$SRC`-layout note (line 179) to name the package root explicitly, so the two are no longer ambiguous about which root is meant.

## Resolution

Fixed in **coding-dashboard PR #251** — `/style-baseline` is owned there
(`~/.claude/commands/style-baseline.md` symlinks to
`~/Documents/dev/coding-dashboard/claude-skills/commands/style-baseline.md`), so this
design-baseline ticket carries no code change of its own.

Step 2 now resolves `PKG_ROOT` (nearest ancestor of `$SRC` holding `package.json`, cwd as
fallback); steps 3 and 4 both use it; step 4 skips the copy when the package root already has a
`components.json`, which also drops it from the `--force` curated-diff revert list. Covered by
`claude-skills/tests/style-baseline-components-json.test.sh` (11 checks: nested, re-broadcast over
a customized file, flat, and no-`package.json` layouts).

## Acceptance

- Running `/style-baseline --force` in a nested-frontend target (`$SRC = frontend/src`) writes no `components.json` at the repo root; `git status` after the run shows no such file.
- The step-3 pre-flight prints the package-root path (e.g. `EXISTS: frontend/components.json`) rather than a bare `components.json`, and a target whose only copy lives at the package root is detected as a collision.
- A re-broadcast into a target that already has a customized `components.json` leaves that file byte-identical — the `rsc` flag no longer appears in the curated-diff revert list.

## Related

- [style-baseline-stack-aware-preflight.md](archive/style-baseline-stack-aware-preflight.md) — the earlier preflight hardening of the same command
- mistra PR #508 (the re-broadcast that produced the stray file) and mistra PR #527 (removed it)
- coding-dashboard PR #251 — the fix itself (command file + shell self-check)
