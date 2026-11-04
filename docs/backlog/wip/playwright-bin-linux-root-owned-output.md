---
area: tooling
opened: '2026-10-29'
status: ready
value: normal
model: sonnet
model_reason: "one spawnSync arg list in bin/design-baseline-playwright.mjs; cause established (container runs as root)"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-29T12:00:00Z'
---

# Playwright container bin leaves root-owned files on Linux hosts

## Context

`bin/design-baseline-playwright.mjs` (v0.18.0, PR #624) runs `docker run` with no `--user`, so the pinned Playwright container runs as root with the project bind-mounted at `/work`. On Docker Desktop (macOS) ownership is mapped, but on a Linux host everything the container writes into the mount (`gallery-dist/`, `test-results/`, `playwright-report/`, regenerated `tests/screenshots` PNGs) is root-owned, so the host user cannot clean or rebuild without sudo. The same bin backs `npm run screenshots` and `npm run screenshots:update` (`package.json`), and consumers call it as `npx design-baseline-playwright`. Repro on Linux: `npx design-baseline-playwright npx playwright test --update-snapshots`, then `ls -l tests/screenshots`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `bin/design-baseline-playwright.mjs`, when `process.platform === "linux"`, pass `--user <uid>:<gid>` (from `process.getuid()`/`process.getgid()`) and a writable `-e HOME=…` to `docker run`; leave macOS/Windows args unchanged.
- [ ] Make the named `design-baseline-nm-<id>` and `design-baseline-npm-cache` volumes writable for that uid (the cache currently mounts at `/root/.npm`, which a non-root user cannot use) so the `npm ci` bootstrap in the script still works.
- [ ] Update the setup notes in `docs/PACKAGE.md` (~line 352, where the bin's mount and volumes are described) if the volume paths change.

## Acceptance

- After `npx design-baseline-playwright npx playwright test --update-snapshots` on a Linux host, `ls -l tests/screenshots gallery-dist test-results playwright-report` shows every file owned by the invoking user.
- No path the container writes into the bind mount is root-owned on Linux, not only the four directories named in the report.
- The first run on a fresh volume still completes `npm ci` and passes; behaviour on macOS is unchanged.

## Related

- [[device-triad-screenshot-baselines]]
- [[screenshots-ci-job-failure-artifacts]]
- [[screenshots-ci-job-not-required-status]]
