---
area: hygiene-security
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
  graded_at: '2026-10-01T15:20:32.800Z'
model: sonnet
model_reason: one GitHub ruleset configuration plus a doc line; no design decisions beyond the bypass list
---

# Protect the v* release tags and main from force-moves and deletion

## Context

Consumers install the donor as a git dependency pinned to a tag, `"design-baseline": "github:aleph11111/design-baseline#v<version>"` ([docs/PACKAGE.md](/docs/PACKAGE.md) §1). Whatever commit that tag points at ends up running inside every consumer: React source goes into their browser bundle, and `src/vite/design-baseline-ui.mjs` plus `bin/new-page.mjs` run as Node code in their build and dev tooling. The tag is the release.

GitHub enforces nothing on those refs. As of 2026-10-01, read-only checks against the public repo show:

- `gh api repos/aleph11111/design-baseline/rulesets` returns `[]`, so no tag or branch ruleset exists.
- `gh api repos/aleph11111/design-baseline/branches/main/protection` returns `Branch not protected`.

`.github/workflows/tag-version.yml` promises that "tags are never moved". That promise is a convention in the workflow script, not a control on the repo. Any credential with push access can run `git push --force origin <sha>:refs/tags/v0.2.32` or delete and recreate the tag. That includes any of the parallel agent sessions on the operator's box that hold the `gh` token. A consumer resolving the tag fresh then pulls the substituted commit, for example on a new clone without a lockfile, a lockfile regeneration, or hk-crm's pnpm re-resolve that already happened once (`package-version-bump-auto-tag`). That commit then executes in the consumer's build.

`main` has the same gap. A direct push of a `package.json` bump to `main` is auto-tagged by the workflow and becomes a release with no PR or review in between.

Threat actor: a compromised or prompt-injected agent session, or a leaked token, with repo write access. The exploit is to retarget an existing release tag at malicious code that consumers execute in their build. Today nothing on GitHub's side refuses the push.

## What to do

- [ ] Add a repository ruleset targeting `refs/tags/v*` that blocks **update** (non-fast-forward or retarget) and **deletion**. Keep **creation** allowed for `github-actions[bot]` (the `tag-version` workflow) and for the repo admin as the backfill bypass.
- [ ] Add a branch ruleset on `main` that blocks force-push and deletion and requires changes through a pull request. This must stay compatible with `/ship`'s PR + squash auto-merge, so do not add required reviewers that would block solo auto-merge.
- [ ] Record the rulesets in [docs/PACKAGE.md](/docs/PACKAGE.md) §1 next to the "never tag by hand" line. State that tag immutability is enforced by the ruleset, not only by the workflow's `ls-remote` guard.

## Acceptance

- `gh api repos/aleph11111/design-baseline/rulesets` returns a tag ruleset covering `refs/tags/v*` and a branch ruleset covering `main`.
- After the change, `git push --force origin HEAD:refs/tags/v0.2.32` from a non-bypass actor is rejected by GitHub. A delete push of the same tag is also rejected.
- After the change, the next `package.json` version bump merged via `/ship` still gets its `v<version>` tag created by `tag-version.yml`, so the creation path is not blocked.
- A direct `git push origin <sha>:main` that bypasses a PR is rejected.

## Related

- [.github/workflows/tag-version.yml](/.github/workflows/tag-version.yml): the tagger whose "never moved" promise this makes enforceable.
- [docs/PACKAGE.md](/docs/PACKAGE.md): the consumer pin-the-tag contract.
- [[hygiene-security-tag-version-action-unpinned]]: the sibling hardening of the one workflow allowed to create tags.
- [[tag-version-workflow-hardening]]: the prior workflow hardening (concurrency and SHA backfill). It covered races, not tampering.
