---
area: hygiene-security
opened: '2026-11-04'
status: blocked
blocked_reason: "needs operator: install the Renovate GitHub App on aleph11111/design-baseline (admin step, not doable from a worktree), then confirm the first Dependency Dashboard issue or bot PR. Code criteria shipped in PR #654: npm audit clean, minimumReleaseAge + vulnerabilityAlerts added."
value: high
model: sonnet
model_reason: "scoped dependency bumps plus one renovate.json field; cause established, acceptance checkable with npm audit"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-04T12:00:00Z'
---

# Renovate config is inert so dependency advisories go unpatched

## Context

[renovate.json](/renovate.json) was merged 2026-10-01 (closing [[code-health-no-dependency-update-bot]]), but the Renovate GitHub App was never installed on `aleph11111/design-baseline`: `gh pr list --state all --search author:app/renovate` returns `[]` and there is no Dependency Dashboard issue. `npm audit` on `package-lock.json` shows 13 advisories (7 high):

- `zod` <4.6.6 (GHSA-mrhx-c7xc-m3w5, memory exhaustion validating oversized collections). `zod` is a **runtime** dependency shipped to consumers and the `package.json` floor `^4.4.3` permits vulnerable versions.
- `vite` <=6.4.3 ("files outside server.fs.allow could be served", plus `launch-editor` command-exec advisories). `vite.config.ts` already widens `server.fs.allow` to `..` for the operator's `npm run gallery` dev server.
- `vitest` / `@vitest/mocker` path traversal and code injection via unauthenticated mock registration.
- `react-router` <7.18.0 open redirect (gallery-only, low reach).

Latent risk: `renovate.json` automerges minor/patch `devDependencies` with no `minimumReleaseAge`. Once the app is installed, a hijacked npm patch release (Shai-Hulud class) would be merged within hours and executed via `npm ci` on the operator box that holds `gh`/push credentials.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `renovate.json`, add `minimumReleaseAge` of about 3 days (top-level, so it covers the automerge rule) and `vulnerabilityAlerts` before the app's first run.
- [ ] Bump `zod` to `^4.6.6` in `package.json` together with a `package.json` version bump (runtime dependency change, per the `verify:package-version` note in `renovate.json`).
- [ ] Bump `vite` past 6.4.3, `vitest` past its patched release, and `react-router-dom` to `>=7.18.2`; refresh `package-lock.json`.
- [ ] Operator/admin step (cannot be done from a worktree): install the Renovate GitHub App on `aleph11111/design-baseline` (or add `.github/dependabot.yml` instead), then confirm the first Dependency Dashboard issue or bot PR appears.

## Acceptance

- `renovate.json` contains `minimumReleaseAge`.
- `npm audit --omit=dev` reports no `zod` advisory.
- `npm audit` reports no high advisory for `vite`, `vitest` or `react-router`, and no other high advisory is left unaddressed or explicitly justified.
- After the operator installs the app, a Renovate/Dependabot PR or a Dependency Dashboard issue exists.

## Related

- [[code-health-no-dependency-update-bot]] — closed ticket that added the config this one finds inert
- [[hygiene-security-tag-version-action-unpinned]]
- [renovate.json](/renovate.json)
