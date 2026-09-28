---
area: tooling
opened: '2026-09-28'
status: done
value: high
model: sonnet
model_reason: "small, fully specified workflow file plus one doc line; no design decision left"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T00:00:00Z'
---

# Tag every package.json version bump on origin/main automatically

## Context

Consumers pin the donor as `github:aleph11111/design-baseline#v<version>` (`docs/PACKAGE.md` §1, "pin the tag"), so a `package.json` version bump without a matching git tag is unreleased. The house-look slices #308–#311 bumped `"version"` to `0.2.8`–`0.2.11`, but no `v0.2.8`–`v0.2.11` tag reached origin: the latest remote tag stayed `v0.2.7`. hk-crm's adoption then failed with pnpm `Could not resolve v0.2.11`, and the tags were pushed by hand on 2026-09-28 (annotated, on the squash-merge commits `2a83ffb`, `d1764be`, `927c67a`, `61bc389`). Nothing in this repo creates tags: there is no `.github/workflows/` and no tagging step in `docs/PACKAGE.md` or `docs/RULES.md`, and the global `/ship` only opens and merges the PR. A tag has to exist after the squash-merge commit, so the pre-merge `pretest` guard (`scripts/verify-manifest-versions.mjs`, and the planned `package-version-duplicate-guard`) cannot create it. The operating rule "process is mechanical or absent" (operator `~/.claude/CLAUDE.md`) points at a post-merge trigger that runs whichever session or button performed the merge.

## What to do

- [ ] Add `.github/workflows/tag-version.yml`, triggered on `push` to `main` with `paths: [package.json]`. It reads `"version"` from `package.json` and, if `v<version>` does not exist on origin, creates an annotated tag `v<version>` on the pushed commit and pushes it. Use `permissions: contents: write` and the default `GITHUB_TOKEN`, with no third-party actions beyond `actions/checkout`.
- [ ] Make it idempotent: an existing tag is a no-op, never a move or force-push. A version that did not change (a `package.json` edit to scripts or deps) is also a no-op.
- [ ] Add one line to `docs/PACKAGE.md` §1 stating that tags are created by that workflow on merge, so a consumer or a session knows not to tag by hand.

## Acceptance

- After a PR that bumps `"version"` merges to `main`, `git ls-remote --tags origin v<version>` returns the tag, pointing at the merge commit, with no manual step.
- A merge that touches `package.json` without changing `"version"` creates no tag, and the workflow exits 0.
- Re-running the workflow when `v<version>` already exists leaves the tag unchanged.

## Related

- [package-version-duplicate-guard.md](package-version-duplicate-guard.md) — the sibling pre-merge guard (duplicate or non-increasing version). It is complementary, and neither has to ship first.
- [package-tag-post-v0-2-0-sync.md](package-tag-post-v0-2-0-sync.md) — earlier drift between `package.json` `"version"` and the git tag
- [house-look-chart-palette.md](house-look-chart-palette.md) — #311, the last bump that shipped untagged
