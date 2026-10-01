---
area: code-health
opened: '2026-10-01'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-10-01T15:47:02.117Z'
value: high
model: sonnet
model_reason: one workflow file wiring four existing npm commands; no design judgment beyond the job split
---

# Add a pull-request check workflow so auto-merge waits on typecheck and tests

## Context

`/ship` opens a PR and enables auto-merge "on green CI" ([CLAUDE.md](/CLAUDE.md), "How We Work Together"). The repo has no CI that runs on a PR. `.github/workflows/` holds exactly one file, `tag-version.yml`. It runs only on `push` to `main` with `paths: [package.json]`, and all it does is create a tag. Nothing runs on `pull_request`, so auto-merge has no check to wait for and every PR merges with nothing executed against it.

The gates already exist; they just run nowhere automatically:

- `npx tsc --noEmit` is the strict typecheck. [docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md) §1 names it a donor verification path.
- `npm test` runs vitest. Its `pretest` hook runs `verify:manifest` and `verify:package-version`.
- `scripts/lint-design.test.mjs` runs `scripts/lint-design.mjs` over the real repo and expects exit 0. That test is the only thing enforcing the seven `error`-severity appearance-prop rules.
- `npm run verify:exports` checks the package export map. No npm script chains it.

[docs/RULES.md](/docs/RULES.md) rule 10 says an ungoverned appearance prop "blocks CI". Today nothing blocks it, so the ratchet depends on each parallel session remembering to run `npm test`. That makes it a convention, not a lock. Every merge that bumps the version also becomes a `v<version>` tag that consumers install. A missed type error is therefore a broken install downstream (ARCHITECTURE §3a), which costs far more than a red PR.

If this finding is wrong, a required check is configured outside the repo. Look at the status checks on a recent PR before starting.

## What to do

- [ ] Add `.github/workflows/check.yml`, triggered on `pull_request` targeting `main`. It should use Node 22 (matching `engines.node` in `package.json`), run `npm ci`, then `npx tsc --noEmit`, `npm test` and `npm run verify:exports`.
- [ ] Make `origin/main` available in the checkout (`fetch-depth: 0`, or an explicit fetch), because `scripts/verify-package-version.mjs` reads `origin/main:package.json`.
- [ ] Pin every action to a commit SHA, as [[hygiene-security-tag-version-action-unpinned]] does for the tag workflow.
- [ ] Register the job as a required status check on `main`, so auto-merge waits for it. This belongs with the ruleset from [[hygiene-security-release-tags-and-main-unprotected]].

## Acceptance

- A PR against `main` shows a `check` status that runs the typecheck, the tests and `verify:exports`.
- A PR that introduces a type error, or an `error`-severity `_adherence.json` hit, shows a failed check, and auto-merge does not merge it.
- After the change, an ordinary `/ship` PR still auto-merges once the check passes.

## Related

- [.github/workflows/tag-version.yml](/.github/workflows/tag-version.yml): the only workflow today. It runs after merge, not before.
- [docs/RULES.md](/docs/RULES.md): rule 10's "blocks CI" claim, which this ticket makes true.
- [[hygiene-security-release-tags-and-main-unprotected]]: the main-branch ruleset that would carry the required check.
- [[code-health-no-dependency-update-bot]]: bot PRs are only safe to auto-merge once this check exists.
