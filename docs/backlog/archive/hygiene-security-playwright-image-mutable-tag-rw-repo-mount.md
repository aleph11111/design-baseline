---
area: hygiene-security
opened: '2026-11-04'
status: done
value: normal
depends_on: [playwright-bin-linux-root-owned-output]
model: sonnet
model_reason: "pin a digest in two places, one docker arg, one test extension; cause and fix fully specified"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-04T00:00:00Z'
---

# Pin the Playwright image by digest and mount .git read-only

## Context

`PLAYWRIGHT_IMAGE` in [src/testing/docker.mjs](/src/testing/docker.mjs) (line 12) is `mcr.microsoft.com/playwright:v1.63.0-noble`: a mutable tag with no `@sha256` digest. It ships as `design-baseline/testing/docker`, so every fleet consumer runs it. [bin/design-baseline-playwright.mjs](/bin/design-baseline-playwright.mjs) (`npx design-baseline-playwright`, lines 33-45) runs that image as root with `-v ${cwd}:/work` read-write (including `.git/hooks`, `.git/config` and gitignored `.env*` files), shares the `design-baseline-npm-cache` volume across all repos, and runs `npm ci`.

Exploit: a retargeted or compromised tag runs attacker code on the next screenshot run. That code plants `.git/hooks/post-checkout`, which then executes on the operator's HOST at the next git command, with gh/push credentials. It can also read `.env*` secrets and poison the shared npm cache volume for every other repo. Same class as [[hygiene-security-tag-version-action-unpinned]] (Actions SHA pinning). The `screenshots` job in `.github/workflows/check.yml` (`container.image`, line 42) uses the same mutable tag, with lower blast radius (`contents: read`, no secrets).

## What to do

- [ ] Pin `PLAYWRIGHT_IMAGE` in `src/testing/docker.mjs` to `mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble@sha256:<digest>`, resolving the digest of the current tag.
- [ ] Use the identical `@sha256` ref for `container.image` in `.github/workflows/check.yml`.
- [ ] Extend `src/testing/docker.test.ts` so it fails when the digest in `docker.mjs` and `check.yml` differ, and when `PLAYWRIGHT_IMAGE` has no `@sha256:` suffix (the existing "is the image of the pinned Playwright version" assertion must be updated for the suffix).
- [ ] Mount `.git` read-only in `bin/design-baseline-playwright.mjs`: add `-v ${cwd}/.git:/work/.git:ro` to the `docker run` args.
- [ ] Document the digest bump alongside `PLAYWRIGHT_VERSION` (the `docs/PACKAGE.md` consumer steps near line 363 and the `docs/STYLE.md` device-triad note near line 727 name the tag).

## Acceptance

- `docker.mjs` and `check.yml` show the same `@sha256` ref.
- `docker.test.ts` fails when the two refs differ, and no other place that names the image tag can drift from it unnoticed.
- `npx design-baseline-playwright sh -c "touch .git/hooks/x"` fails with a read-only filesystem error.
- The `screenshots` CI job still passes with the pinned image.

## Related

- [[hygiene-security-tag-version-action-unpinned]] — same class: mutable reference to code that runs with credentials
- [[playwright-bin-linux-root-owned-output]] — must ship first: it edits the same `spawnSync` docker arg list in `bin/design-baseline-playwright.mjs`, so doing both at once invites a conflict
- [[device-triad-screenshot-baselines]] — origin of the pinned image and the screenshots CI job
- [[screenshots-ci-job-not-required-status]] — also touches the `screenshots` job
