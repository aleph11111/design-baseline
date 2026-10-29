---
area: tooling
opened: '2026-10-29'
status: ready
value: normal
model: sonnet
model_reason: "one spawnSync arg list in bin/design-baseline-playwright.mjs; proposal names the exact flags, no design left open"
depends_on: [playwright-bin-linux-root-owned-output]
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-29T12:00:00Z'
---

# Playwright container bin cannot test docker compose consumers

## Context

`bin/design-baseline-playwright.mjs` runs a plain `docker run` that passes only `-e CI`, joins no network, mounts only the cwd at `/work`, and sets no `--add-host`. A consumer app served as a docker compose stack therefore cannot be tested through it. controlling-app (`scripts/check-visual.sh` on `feat/visual-tests-three-device-presets`) had to work around all four limits: publish the stack on `127.0.0.1:3390/8390` and reach it as `host.docker.internal` (resolves on Docker Desktop only, not on a Linux engine), wrap the command in `env VAR=...` to pass config, and copy repo-root files (`_adherence.json`, backend seed CSVs) into `frontend/` because nothing outside the cwd is mounted. Repro: run any compose-served consumer through the bin on a Linux host; `host.docker.internal` does not resolve.

## What to do

- [ ] In `bin/design-baseline-playwright.mjs`, always add `--add-host host.docker.internal:host-gateway` to the `docker run` args (a no-op on Docker Desktop, makes the name resolve on a Linux engine).
- [ ] Add an optional `DESIGN_BASELINE_PLAYWRIGHT_NETWORK` env var; when set, pass it as `--network <value>` so the container can join a compose network.
- [ ] Add env passthrough: forward every host variable matching `VISUAL_*` as `-e NAME` (alongside the existing `-e CI`), plus an optional comma-separated `DESIGN_BASELINE_PLAYWRIGHT_ENV` list of extra names, so consumers stop wrapping the command in `env VAR=...`.
- [ ] Add an optional `DESIGN_BASELINE_PLAYWRIGHT_MOUNTS` list of extra host paths, each mounted at the same path inside the container, so repo-root files outside the cwd are readable without copying them in.
- [ ] Document the new env vars next to the bin's mount/volume description in `docs/PACKAGE.md`, and add a changelog/version bump per the repo's package-version rules.

## Acceptance

- On a Linux host, a container started with the bin resolves `host.docker.internal` to the host gateway.
- With `DESIGN_BASELINE_PLAYWRIGHT_NETWORK=<net>` set, the `docker run` args contain `--network <net>`; with it unset they are unchanged.
- A host `VISUAL_*` variable and each name in `DESIGN_BASELINE_PLAYWRIGHT_ENV` is visible inside the container, and a path listed in `DESIGN_BASELINE_PLAYWRIGHT_MOUNTS` is readable there.
- With none of the new variables set, the `docker run` args are unchanged apart from `--add-host`, so existing consumers (`npm run screenshots`) behave as before.

## Related

- [[playwright-bin-linux-root-owned-output]] — must ship first: it edits the same `docker run` arg list (`--user`, volume paths) in `bin/design-baseline-playwright.mjs`, so building both in parallel means a merge conflict and re-deriving the mounts twice
- [[device-triad-screenshot-baselines]]
- [[screenshots-ci-job-failure-artifacts]]
- [docs/PACKAGE.md](/docs/PACKAGE.md) — documents the bin's mounts and volumes
