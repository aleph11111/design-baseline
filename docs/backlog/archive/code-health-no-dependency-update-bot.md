---
area: code-health
opened: '2026-10-01'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-10-01T15:47:02.115Z'
value: normal
model: sonnet
model_reason: one config file plus a grouping policy; the only judgment is which groups may auto-merge
---

# Add Renovate or Dependabot for the shipped dependency set

## Context

[package.json](/package.json) lists 31 runtime `dependencies` that ship to every consumer through the git package, plus 13 devDependencies. Nothing tracks updates to any of them. The repo has no `renovate.json`, no `.renovaterc*` and no `.github/dependabot.yml`, so bumps happen only when a session happens to notice one.

That gap costs more here than it would in an app:

- `designBaselineDeps()` in `src/vite/design-baseline-ui.mjs` feeds every runtime dependency into each consumer's `optimizeDeps.include`, so a stale pin in the donor lands in every consumer's dev server.
- [docs/STACK.md](/docs/STACK.md) is the pinned contract the fleet aligns to, so donor lag becomes fleet lag.

The lockfile resolves the gallery and test toolchain to `vite` 6.4.3, `@vitejs/plugin-react` 4.7.0 and `typescript` 5.9.3. Those may be behind current upstream majors, but upstream was not checked: the sandbox had no registry access while this was filed. Run `npm outdated` before acting on any specific bump. A bot makes that check continuous instead of a one-off.

If this finding is wrong, updates are tracked outside the repo, for example by an org-level Renovate app. Open PRs from a bot author would show it.

## What to do

- [ ] Add a `renovate.json` (preferred, because it supports grouping) or a `.github/dependabot.yml`, covering both the `npm` and `github-actions` ecosystems.
- [ ] Group related families so each moves in one PR:
  - `@radix-ui/*`
  - `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite` and `tailwindcss`
  - `vitest`, `jsdom` and `@testing-library/*`
- [ ] Allow auto-merge only for patch and minor devDependency updates. Leave runtime `dependencies` and every major update for review, because they change what consumers install. Each `dependencies` bump also needs the `package.json` version bump that `verify:package-version` enforces.
- [ ] Let SHA-pinned GitHub Actions update by digest, so [[hygiene-security-tag-version-action-unpinned]] stays pinned without manual upkeep.

## Acceptance

- `ls renovate.json .github/dependabot.yml` shows at least one config file.
- Within a week of merge, the bot has opened at least one grouped update PR, or its dashboard issue lists pending updates.
- A bot PR that touches runtime `dependencies` is not auto-merged.

## Related

- [package.json](/package.json): the dependency set the bot watches.
- [docs/STACK.md](/docs/STACK.md): the pinned contract that updates must stay inside.
- [[code-health-no-pr-check-workflow]]: bot PRs can only auto-merge safely once a PR check runs.
