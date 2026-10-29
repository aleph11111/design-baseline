---
area: tooling
opened: '2026-10-29'
status: done
value: normal
model: sonnet
model_reason: "one pinned upload-artifact step in check.yml; pattern and report paths already established"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-29T12:00:00Z'
---

# Upload Playwright report artifacts when the CI screenshots job fails

## Context

The `screenshots` job in `.github/workflows/check.yml` (shipped in v0.18.0, PR #624) runs `npx playwright test` inside the pinned Playwright container. `playwright.config.mjs` writes the HTML report to `playwright-report/` and per-run diffs go to `test-results/` (both gitignored). The job has no `actions/upload-artifact` step, so when a baseline compare fails the expected/actual/diff PNGs are discarded with the container and a triager must re-run locally in docker (`npm run screenshots`) to see them.

## What to do

- [ ] Add a step after `npx playwright test` in the `screenshots` job: `actions/upload-artifact` pinned by full commit SHA with a `# vN` comment (repo convention, matches the `actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4` step), `if: failure()`, uploading `playwright-report/` and `test-results/`.
- [ ] Set a short `retention-days` so diff PNGs do not pile up.

## Acceptance

- After a PR with one broken baseline, the failed `screenshots` job run lists an artifact containing `playwright-report/` and `test-results/` with the expected, actual and diff PNGs.
- A green `screenshots` run uploads no artifact.
- The upload action is pinned by SHA, unchanged from the repo's pinning convention.

## Related

- [[screenshots-ci-job-not-required-status]] — same job, ruleset side
- [[device-triad-screenshot-baselines]] — shipped the `screenshots` job in PR #624
- [[hygiene-security-tag-version-action-unpinned]] — SHA-pinning convention for actions
