---
area: tooling
opened: 2026-10-02
status: ready
value: high
model: sonnet
model_reason: "extends one zero-dep script and its vitest file along the pattern PR #335 set; the exemption list is decided below"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-02T19:30:00Z
---

# Require a package.json version bump when a branch changes shipped src code

## Context

Consumers pin the donor by tag (`github:aleph11111/design-baseline#v<version>`, `docs/PACKAGE.md` §1), and `.github/workflows/tag-version.yml` cuts a tag only when `package.json` `"version"` changes on `main`. `scripts/verify-package-version.mjs` (wired into `pretest`, run in `check.yml`) only checks that a bump, *if present*, is strictly greater than `origin/main`'s. It never requires one. On 2026-10-02 PR #445 (list-with-detail v3.0) and PR #447 (detail-overview v3.7) both merged with shipped `src/` changes and no bump. No tag was cut, so no consumer could pin either change until a separate release PR (v0.2.35) followed. `docs/RULES.md` rule 11 states the rule, but only as a convention; the script's own header already names "requiring every branch to bump" as the closing move it deferred because of docs-only tickets.

## What to do

- [ ] Extend `scripts/verify-package-version.mjs`: when `git diff --name-only <merge-base>...HEAD` contains a shipped path and `"version"` is not bumped relative to the merge-base, exit non-zero with a message naming the first shipped path and the rule (`docs/RULES.md` rule 11).
- [ ] Shipped paths: `src/**` excluding `src/examples/**` and `**/*.test.*` (donor-only per `docs/RULES.md`'s sandbox-demo rule), plus `docs/archetypes/MANIFEST.json` (it ships in the package). Everything else (docs, backlog, scripts, workflows) stays exempt.
- [ ] Update the script's header comment: the "requiring every branch to bump" blind-spot note becomes "required only for shipped paths".
- [ ] Add scenarios to the existing vitest file (`scripts/verify-package-version.test.mjs`): shipped change + no bump fails, shipped change + bump passes, docs-only change + no bump passes, examples/test-only change + no bump passes.

## Acceptance

- A branch that edits `src/components/**` without bumping `"version"` fails `npm test` (via `pretest`) and CI's `check.yml`, and the message names the offending path.
- A branch touching only `docs/`, `docs/backlog/`, `src/examples/`, or test files passes unchanged.
- No other shipped-code PR can merge untagged: every merge to `main` that touches a shipped path creates a new `v<version>` tag through `tag-version.yml`.
- The existing duplicate/lower-version scenarios still pass unchanged.

## Related

- [[package-version-duplicate-guard]] — introduced the script this extends
- [[package-version-guard-hardening]] — the vitest file and failure-message conventions to follow
- [[package-version-bump-auto-tag]] — the tag workflow that only fires on a bump
- [[hygiene-security-tag-version-action-unpinned]]
- [docs/RULES.md](/docs/RULES.md) — rule 11 (the convention this mechanizes)
