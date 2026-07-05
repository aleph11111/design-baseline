---
area: tooling
opened: 2026-07-05
status: needs-enrichment
gate:
  score: 4
  passed: [title, context, what-to-do, related]
  failed:
    - acceptance: "acceptance bullets are plausible but not yet verified against the actual esbuild code path, since the root cause wasn't fully isolated"
  graded_at: 2026-07-05T00:00:00Z
---

# Vite/vitest config loading climbs past a worktree's own package.json into the main checkout

## Context

Both `vite.config.ts` (the donor-dev gallery harness) and the newly added `vitest.config.ts` (unit tests, from `segmented-control-radio-keyboard`) are loaded via Vite's `loadConfigFromFile`, which bundles the config with esbuild. When run from inside a `.worktrees/<slug>` directory (the `/feat` workflow's standard layout), this loading step was observed reaching two directories up — the **main checkout's** `package.json` — rather than stopping at the worktree's own `package.json`, which sits right next to the config file.

This surfaced concretely during `segmented-control-radio-keyboard`: `npx vitest run` failed with `[ERROR] Expected string in JSON but found "<<"` pointing at `design-baseline/package.json:50`, because a *different*, concurrent session had that file mid-merge-conflict (`<<<<<<< HEAD` markers) while resolving `feat/crud-dialog-delete-in-flight-state`. The vitest run in the unrelated worktree started passing again the moment that other session committed and the conflict markers disappeared — confirming the failure was caused by reading a file entirely outside the current worktree, not anything in the worktree's own config.

Vite's `searchForWorkspaceRoot`/`searchForPackageRoot` (`node_modules/vite/dist/node/chunks/dep-*.js`) do climb ancestor directories looking for a lockfile, a `pnpm-workspace.yaml`, or a `package.json` with a `workspaces` field, wrapped in try/catch — so that path alone shouldn't crash. The exact crash site (a config-file `type` (ESM/CJS) detection step inside esbuild's own bundling of the config, most likely) wasn't fully isolated before time ran out on the ticket that found it; it needs a closer look to pin down which specific call is unguarded.

## What to do

- [ ] Isolate the exact esbuild/Vite call that reads the ancestor `package.json` during config-file loading (as opposed to the try/catch-guarded `searchForWorkspaceRoot`), to confirm whether it's an ESM/CJS `type` detection step or something else.
- [ ] Pin an explicit root/workspace boundary for `vite.config.ts` and `vitest.config.ts` (e.g. an explicit `root`, or whatever option stops the climb) so config loading from inside any `.worktrees/<slug>` directory never reads a `package.json` outside that worktree.
- [ ] ? Consider whether this also affects other Vite-based donor tooling (e.g. `gallery:build`, `gallery:preview`) or is specific to the dev/test config-loading path.

## Acceptance

- ? Running `npm test` or `npm run gallery` from inside a `.worktrees/*` worktree succeeds regardless of the syntactic validity of the main checkout's `package.json` two levels up (e.g. simulate by temporarily writing invalid JSON there and confirming no crash).
- No behavior change for running the same commands from the main checkout itself.

## Related

- segmented-control-radio-keyboard.md — the ticket that surfaced this while adding `vitest.config.ts`
- `vite.config.ts`, `vitest.config.ts` — the two config files loaded via the affected code path
- CLAUDE.md, "Parallel-Safe Workflow" — the reason multiple sessions can have the main checkout mid-merge at any moment

## Open question

The exact unguarded call site in Vite/esbuild's config-loading pipeline wasn't identified — worth a focused debugging pass (e.g. `DEBUG=vite:* npx vitest run` or stepping through `loadConfigFromFile`) before attempting a fix.
