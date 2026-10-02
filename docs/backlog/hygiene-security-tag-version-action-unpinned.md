---
area: hygiene-security
opened: '2026-10-01'
status: blocked
blocked_reason: "needs admin to enable Actions SHA pinning (acceptance criterion 2, sha_pinning_required: true): the settings write was denied in the unattended session. To discharge: gh api -X PUT repos/aleph11111/design-baseline/actions/permissions -F enabled=true -f allowed_actions=all -F sha_pinning_required=true"
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-10-01T15:20:32.802Z'
model: sonnet
model_reason: single-line SHA pin plus one repo setting; fully specified
---

# Pin actions/checkout to a commit SHA in the tag-writing workflow

## Context

[.github/workflows/tag-version.yml](/.github/workflows/tag-version.yml) is the only automated writer of release tags. It runs with `permissions: contents: write` and uses `actions/checkout@v4`, which is a mutable tag. Whoever controls that tag controls code that runs in a job holding a write-scoped `GITHUB_TOKEN` for this repo. That job then executes `git tag` and `git push origin refs/tags/$tag`.

The tag it pushes is what every consumer installs (`github:aleph11111/design-baseline#v<version>`, [docs/PACKAGE.md](/docs/PACKAGE.md) §1). A retargeted or compromised upstream action can therefore mint or push a release tag on attacker-chosen code. This is the tj-actions/changed-files class of incident from 2025. A repo setting would catch it, but it is off: `gh api repos/aleph11111/design-baseline/actions/permissions` returns `"allowed_actions":"all","sha_pinning_required":false`.

Threat actor: an upstream action maintainer compromise or tag retarget. The exploit is that the next `package.json` bump on `main` runs the substituted action with `contents: write`, and that action can push a tag consumers will install.

## What to do

- [ ] Replace `uses: actions/checkout@v4` with `uses: actions/checkout@<full 40-char SHA> # v4.x.y` in `.github/workflows/tag-version.yml`.
- [ ] Set `persist-credentials: false` on the checkout step if the tag push can authenticate another way. If not, keep the default and record why in a comment.
- [ ] Turn on the repo's SHA-pinning requirement in Actions settings so a future workflow cannot reintroduce a mutable `@vN` ref (`sha_pinning_required: true`).

## Acceptance

- `grep -nE "uses: [^@]+@v[0-9]" .github/workflows/*.yml` no longer matches.
- `gh api repos/aleph11111/design-baseline/actions/permissions` returns `"sha_pinning_required":true`.
- After the change, the next version bump merged to `main` still produces its `v<version>` tag, so the pinned checkout works end to end.

## Related

- [.github/workflows/tag-version.yml](/.github/workflows/tag-version.yml): the workflow carrying the unpinned action.
- [[hygiene-security-release-tags-and-main-unprotected]]: the ruleset that keeps even a compromised writer from moving existing tags.
- [[tag-version-workflow-hardening]]: the prior hardening pass on the same workflow.

## Status (2026-10-02)

- Done: checkout pinned to `11d5960a…7262 # v4` in tag-version.yml (same SHA as check.yml); `persist-credentials` kept default because the tag push authenticates via the checkout token (comment in workflow). `grep -nE "uses: [^@]+@v[0-9]" .github/workflows/*.yml` has no match.
- Blocked: `sha_pinning_required` is still `false`. The unattended session's permission classifier denied the settings write (`gh api -X PUT repos/aleph11111/design-baseline/actions/permissions -F enabled=true -f allowed_actions=all -F sha_pinning_required=true`). Operator must run it (needs admin token), then confirm `"sha_pinning_required":true`.
- Pending: third acceptance bullet (next `package.json` bump on main still tags) is verified only after that bump merges.
