---
area: tooling
opened: 2026-07-19
status: done
model: sonnet
model_reason: single config field in vitest.config.ts with a clear pass/fail check
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-19T00:00:00Z
---

# Donor vitest suite has no explicit testTimeout, so jsdom interaction tests flake

## Context

`vitest.config.ts`'s `test` block sets only `environment: "jsdom"` and `include: ["src/**/*.test.{ts,tsx}"]` — it does not set `testTimeout`, so every test inherits vitest's 5000ms default. That default is too tight for this suite's jsdom-heavy interaction tests when the machine is under load: on a full `npm test` run, `src/components/layout/ThemeToggle.test.tsx` and `src/components/archetypes/settings-table/SettingsTableShell.test.tsx` both failed with `Test timed out in 5000ms`, while rerunning those same two files alone with `--testTimeout=30000` passed 4/4. The suite reports 26–36s of environment setup per run, so per-test budget is being consumed by harness startup rather than by the assertions. The result is a suite that intermittently reports failures unrelated to the code under test, which erodes the signal `/ship`'s green-CI gate depends on.

## Related

- [test-gap-settings-page-shell-no-tests.md](test-gap-settings-page-shell-no-tests.md) — sibling test-gap ticket adding more tests to the same suite
- [vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md) — the other open ticket against the donor's vite/vitest config

## What to do

- [x] Add an explicit `testTimeout` to the `test` block in `vitest.config.ts`, sized above the observed jsdom interaction-test cost (the 5s default is demonstrably too tight; 30s passes reliably).
- [x] Rerun `npm test` from a loaded machine to confirm `ThemeToggle.test.tsx` and `SettingsTableShell.test.tsx` no longer time out.
- [ ] ? Investigate whether the 26–36s environment setup itself can be reduced (e.g. narrowing the jsdom environment to files that need it), which would shrink the timeout pressure at its source rather than raising the ceiling.

## Acceptance

- `vitest.config.ts` declares an explicit `testTimeout` in its `test` block.
- A full `npm test` run no longer reports `Test timed out in 5000ms` for `ThemeToggle.test.tsx` or `SettingsTableShell.test.tsx`.
- Every test file still passes when run in isolation, so the change fixes flakiness rather than masking a real hang.
