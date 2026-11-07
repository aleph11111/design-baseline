---
area: tooling
opened: '2026-10-30'
status: ready
value: normal
depends_on: [playwright-bin-linux-root-owned-output]
model: sonnet
model_reason: "one env var spliced into the docker run arg list in bin/design-baseline-playwright.mjs plus a PACKAGE.md paragraph; cause and fix established by the report"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-30T12:00:00Z'
---

# Playwright container bin cannot take extra docker args

## Context

`bin/design-baseline-playwright.mjs` builds a fixed `docker run` arg list (`--rm --init --ipc=host`, three `-v` mounts, `-w`, `-e CI`) with no `--network`, no `--add-host` and no way to add docker args, so a consumer cannot attach the Playwright container to its compose network and address services by name. On a Linux docker engine the container also cannot resolve `host.docker.internal`, so a consumer's hermetic stack is reachable only through host ports on the docker0 gateway IP. controlling-app PR #2033 (`scripts/check-visual.sh`, `docker-compose.visual.yml`) works around it with a `uname`-based `VISUAL_HOST`/`VISUAL_BIND` switch. The bin is the consumer entry point documented in `docs/PACKAGE.md` ("Gate 3 setup").

## What to do

- [ ] In `bin/design-baseline-playwright.mjs`, read `DESIGN_BASELINE_PLAYWRIGHT_DOCKER_ARGS` (e.g. `--network foo_default`), split it on whitespace, and splice it into the `docker run` args before the image name; unset or empty leaves the arg list unchanged.
- [ ] Document the variable in `docs/PACKAGE.md` Gate 3 setup step 3, with a compose-network example (consumer reaches `frontend:3000` / `backend:8000` with no host hop) and the Linux `host.docker.internal` note.
- [ ] Bump the package version and tag a release so consumers can pick it up (per `docs/RULES.md` version-bump rules).

## Acceptance

- With `DESIGN_BASELINE_PLAYWRIGHT_DOCKER_ARGS='--network foo_default'`, the `docker run` argv shows `--network foo_default` before the image, and a container on that network resolves a compose service name.
- With the variable unset, the `docker run` args are unchanged from today.
- `docs/PACKAGE.md` documents the variable and shows the compose-network usage.

## Related

- [[playwright-bin-linux-root-owned-output]] — must ship first: it edits the same `docker run` arg list in `bin/design-baseline-playwright.mjs`, so building both in parallel means a merge conflict and a second pass
- [[device-triad-screenshot-baselines]]
- [[screenshots-ci-job-failure-artifacts]]
