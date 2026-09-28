---
area: tooling
opened: '2026-09-28'
status: ready
value: normal
model: sonnet
model_reason: "two small, fully specified edits to one workflow file; both fixes named by the PR #334 review"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T00:00:00Z'
---

# Harden the tag-version workflow with concurrency and a SHA-targeted manual backfill

## Context

`.github/workflows/tag-version.yml` (PR #334) tags each `package.json` `"version"` bump on `main` as `v<version>`, guarded by a `git ls-remote` existence check and a comparison against `github.event.before`. The PR #334 review raised two follow-ups. First, two near-simultaneous pushes that land the same new version can both pass the `ls-remote` check, so the second `git push` of the tag is rejected and that run goes red (the tag itself stays correct). Second, there is no manual trigger: a run that fails on a transient push error and is not re-run in time can only be backfilled by hand, which contradicts `docs/PACKAGE.md` §1 ("never tag by hand"). A plain `workflow_dispatch` was dropped in round 1 because it tags the dispatched ref's HEAD. That can be an unmerged branch, or `main` HEAD rather than the bump commit, and on dispatch `github.event.before` is empty.

## What to do

- [ ] Add a workflow-level `concurrency: { group: tag-version, cancel-in-progress: false }` so tag runs serialise.
- [ ] Re-add `workflow_dispatch` with a required `sha` input. Guard the job with `if: github.ref == 'refs/heads/main'`, verify the SHA with `git merge-base --is-ancestor <sha> origin/main`, and read `"version"` from `git show <sha>:package.json`. Then tag that SHA through the same `ls-remote` no-op guard. This addresses the round-1 finding that dispatch must not tag an arbitrary HEAD.
- [ ] Mention the manual `sha` backfill in the `docs/PACKAGE.md` §1 tag line.

## Acceptance

- Two pushes that land the same version in quick succession both exit 0, and exactly one `v<version>` tag exists afterwards.
- A dispatch with a SHA that is not an ancestor of `origin/main` fails without creating a tag.
- A dispatch with a merged bump SHA whose tag is missing creates `v<version>` pointing at that SHA. When the tag already exists, the tag is unchanged.
- After the first real version bump following #334, `git ls-remote --tags origin v<version>` shows the tag on the merge commit (acceptance 1 of the parent ticket, which could not be observed before merge).

## Related

- [archive/package-version-bump-auto-tag.md](../archive/package-version-bump-auto-tag.md): the parent ticket that shipped the workflow (PR #334)
- [package-version-duplicate-guard.md](package-version-duplicate-guard.md): the sibling pre-merge version guard
