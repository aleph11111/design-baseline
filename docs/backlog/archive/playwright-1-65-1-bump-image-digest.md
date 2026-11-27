---
area: tooling
opened: 2026-11-27
status: done
value: high
conventional_hours: 2
conventional_hours_by: agent
model: sonnet
model_reason: "mechanical pin bump across five known files with a documented procedure in docs/PACKAGE.md; docker.test.ts guards the drift"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-27T00:00:00Z
---

# Bump Playwright 1.63.0 to 1.65.1 image digest

## Context

`PLAYWRIGHT_VERSION` in `src/testing/docker.mjs` is `1.63.0` and `PLAYWRIGHT_IMAGE` is `mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30…` (the digest pin shipped under [[hygiene-security-playwright-image-mutable-tag-rw-repo-mount]]). The same pin lives in `.github/workflows/check.yml` (`screenshots` job image, line 55), `docs/STYLE.md` (line 767), and the exact `@playwright/test` / `playwright-core` devDependencies in `package.json` (lines 114, 123). Consumer controlling-app holds Dependabot #2362 (`@playwright/test` + `playwright-core` 1.63.0 to 1.65.1) until this ships, because `assertInPlaywrightImage` throws when the installed Playwright is not exactly `PLAYWRIGHT_VERSION`. The procedure is in `docs/PACKAGE.md` ("Gate 3 setup" step 1 and the closing paragraph: bumping Playwright is a donor version bump).

## What to do

- [ ] Re-resolve the digest for `mcr.microsoft.com/playwright:v1.65.1-noble` (`docker buildx imagetools inspect <tag>`, the index `Digest:`), then set `PLAYWRIGHT_VERSION` to `1.65.1` and `PLAYWRIGHT_IMAGE` to the new tag plus `@sha256` digest in `src/testing/docker.mjs`.
- [ ] Set the same image in the `screenshots` job of `.github/workflows/check.yml` and in the `docs/STYLE.md` reference; update the `v0.18.0 ships 1.63.0` wording in `docs/PACKAGE.md` Gate 3 step 1 to the new version.
- [ ] Pin `@playwright/test` and `playwright-core` to `1.65.1` exactly in `package.json` and refresh `package-lock.json`.
- [ ] Re-capture the donor's own baselines with `npm run screenshots:update` (pinned docker image) and review the PNG diff; commit only intended changes.
- [ ] Cut the release: bump the package version and add a `CHANGELOG.md` entry per the `docs/RULES.md` version-bump rules, naming the consumer step (bump `design-baseline` and Playwright together). After it ships, tell controlling-app that Dependabot #2362 can merge.

## Acceptance

- `src/testing/docker.test.ts` passes: the `docker.mjs` image, the `check.yml` image and `docs/STYLE.md` carry the identical `@sha256` digest, and `PLAYWRIGHT_VERSION` equals the installed `playwright-core` version.
- `npm run screenshots` passes in the pinned image with the re-captured baselines, and the CI `screenshots` job is green on the 1.65.1 image.
- No `1.63.0` Playwright reference remains in `src/testing/docker.mjs`, `.github/workflows/check.yml`, `docs/STYLE.md`, `docs/PACKAGE.md` or `package.json` (historical `CHANGELOG.md` lines and archived tickets stay unchanged).
- `package.json` version is bumped and `CHANGELOG.md` has the matching entry.

## Related

- [[hygiene-security-playwright-image-mutable-tag-rw-repo-mount]] — introduced the `@sha256` digest pin this bump re-resolves
- [[package-version-bump-required-for-shipped-code]] — a Playwright bump is shipped code, so a version bump is required
- [[package-version-bump-auto-tag]] — the release tag follows the version bump
- [[device-triad-screenshot-baselines]] — origin of `design-baseline/testing/docker` and the donor screenshots
