---
area: tooling
opened: '2026-11-04'
status: ready
value: normal
model: sonnet
model_reason: "one detection branch in bin/design-baseline-playwright.mjs; cause established (rootless userns maps container uid 0 to the host user)"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-11-04T00:00:00Z'
---

# Playwright container bin breaks ownership on rootless Docker

## Context

PR #657 made the linux branch of `bin/design-baseline-playwright.mjs` (~line 60) run the container with `--user <uid>:<gid>` and a one-shot `chown` of the `design-baseline-nm-<id>` / `design-baseline-npm-cache` volumes (~line 44). That fixes rootful Docker, but on rootless Docker (and likely Docker Desktop for Linux) container uid 0 already maps to the host user, so `--user 1000:1000` maps to a subordinate uid (e.g. 100999) and recreates root-like unowned files in the bind mount. Repro on rootless Docker: `npx design-baseline-playwright npx playwright test --update-snapshots`, then `ls -ln tests/screenshots`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `bin/design-baseline-playwright.mjs`, on linux detect rootless via `docker info -f '{{.SecurityOptions}}'` containing `rootless`, and in that case skip both the `--user <uid>:<gid>` arg and the volume `chown` pre-step (keep the `-e HOME=/tmp` env only if still needed for a writable npm home).
- [ ] Keep rootful Linux args (the #657 behaviour) and macOS/Windows args unchanged; if the `docker info` probe itself fails, fall through to the rootful path rather than aborting.

## Acceptance

- On rootless Docker on Linux, after `npx design-baseline-playwright npx playwright test --update-snapshots`, `ls -ln tests/screenshots gallery-dist test-results playwright-report` shows every file owned by the invoking host uid, none by a subordinate uid.
- On rootful Docker on Linux the files are still owned by the invoking user, and macOS runs are unchanged.

## Related

- [[playwright-bin-linux-root-owned-output]] — the ticket whose fix (#657) introduced the `--user` mapping this refines
- [[hygiene-security-playwright-image-mutable-tag-rw-repo-mount]] — touches the same docker run arg list
