---
area: tooling
opened: '2026-10-30'
status: ready
value: normal
depends_on: [playwright-bin-rootless-docker-user-mapping]
model: sonnet
model_reason: "one env var spliced into the docker run arg list in bin/design-baseline-playwright.mjs, one always-on --add-host, plus a PACKAGE.md paragraph with examples; cause and fix established by the report"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-16T12:45:03Z'
---

# Playwright container bin cannot take extra docker args

## Context

`bin/design-baseline-playwright.mjs` builds a fixed `docker run` arg list (`--rm --init --ipc=host`, the cwd, `.git`, `node_modules` and cache `-v` mounts, `-w`, `-e CI`, plus `--user`/`HOME` on linux) with no `--network`, no `--add-host` and no way to add docker args. So a consumer cannot attach the Playwright container to its compose network and address services by name, cannot pass config variables in, and cannot read repo-root files outside the cwd. On a Linux docker engine the container also cannot resolve `host.docker.internal`, so a consumer's hermetic stack is reachable only through host ports on the docker0 gateway IP.

Repro (controlling-app): PR #2033 (`scripts/check-visual.sh`, `docker-compose.visual.yml`) works around all of it — a `uname`-based `VISUAL_HOST`/`VISUAL_BIND` switch, publishing the stack on `127.0.0.1:3390/8390` and reaching it as `host.docker.internal` (Docker Desktop only), wrapping the command in `env VAR=...`, and copying repo-root files (`_adherence.json`, backend seed CSVs) into `frontend/`. Running any compose-served consumer through the bin on a Linux host: `host.docker.internal` does not resolve.

Decided in [[backlog-coherence-code-health-8e8dac]] (2026-11-16): one generic variable, not dedicated NETWORK/ENV/MOUNTS variables — `DOCKER_ARGS` already covers `--network`, `-e` and `-v`, so per-flag variables would duplicate it. This card absorbed the discarded [[playwright-bin-compose-consumer-support]]. The bin is the consumer entry point documented in `docs/PACKAGE.md` ("Gate 3 setup").

## What to do

- [ ] In `bin/design-baseline-playwright.mjs`, always add `--add-host host.docker.internal:host-gateway` to the `docker run` args (a no-op on Docker Desktop; makes the name resolve on a Linux engine).
- [ ] Read `DESIGN_BASELINE_PLAYWRIGHT_DOCKER_ARGS` (e.g. `--network foo_default`), split it on whitespace, and splice it into the `docker run` args before the image name; unset or empty leaves the arg list unchanged apart from `--add-host`.
- [ ] Document the variable in `docs/PACKAGE.md` Gate 3 setup step 3 with three examples: a compose network (`--network <project>_default`, consumer reaches `frontend:3000` / `backend:8000` with no host hop), env pass-through (`-e VISUAL_BASE_URL -e VISUAL_SEED`), and an extra repo-root mount (`-v $PWD/../_adherence.json:/work/_adherence.json:ro`). Note the Linux `host.docker.internal` behaviour and the limit: whitespace splitting cannot carry a path or value containing spaces.
- [ ] Bump the package version with a `CHANGELOG.md` entry so consumers can pick it up (per `docs/RULES.md` version-bump rules).

## Acceptance

- The `docker run` argv always contains `--add-host host.docker.internal:host-gateway`; on a Linux engine a container started by the bin resolves `host.docker.internal` to the host gateway.
- With `DESIGN_BASELINE_PLAYWRIGHT_DOCKER_ARGS='--network foo_default'`, the argv shows `--network foo_default` before the image, and a container on that network resolves a compose service name.
- With `-e NAME` and `-v host:container` in the variable, the host variable is visible and the mounted file readable inside the container.
- With the variable unset, the args are unchanged from today apart from `--add-host`, so `npm run screenshots` behaves as before.
- `docs/PACKAGE.md` documents the variable with the network, `-e` and `-v` examples and the no-spaces limit.

## Related

- [[playwright-bin-rootless-docker-user-mapping]] — must ship first: it edits the same `docker run` arg list (`--user`, chown step) in `bin/design-baseline-playwright.mjs`, so building both in parallel means a merge conflict
- [[playwright-bin-compose-consumer-support]] — discarded duplicate, folded in here
- [[device-triad-screenshot-baselines]]
- [[screenshots-ci-job-failure-artifacts]]
- [[backlog-coherence-code-health-8e8dac]] — the coherence decision that picked this card as survivor
