---
area: tooling
opened: '2026-09-28'
status: ready
value: low
model: sonnet
model_reason: "three small edits to one zero-dep script plus a vitest file; all behaviours specified by the PR #335 review"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T00:00:00Z'
---

# Harden verify-package-version with tests, a shallow-clone message and ref freshness

## Context

`scripts/verify-package-version.mjs` (PR #335, wired into `pretest`) fails `npm test` when a branch bumps `package.json` `"version"` to a value not strictly greater than `origin/main`'s. The PR #335 review-gate listed follow-ups outside that ticket's scope. First, the script has no test, so the exemption logic (unbumped branches pass, a missing merge-base falls through to the strict check) can regress unnoticed. Second, in a shallow clone where `origin/main` resolves but `git merge-base HEAD origin/main` fails, an unbumped docs branch fails with "a parallel branch already shipped this bump", which is misleading because the real cause is missing history. Third, the script reads the local `origin/main` ref and never fetches, so a stale ref silently misses a collision; printing the ref's SHA and commit date would make a stale comparison visible. Separately, `docs/backlog/tag-version-workflow-hardening.md:37` links `package-version-duplicate-guard.md` as a root-lane sibling, but that card now lives in `archive/`.

## What to do

- [ ] Add a vitest file (e.g. `scripts/verify-package-version.test.ts`, matching the repo's `npm test` harness) that builds temp git repos and runs the script, covering: equal (collision), lower, greater, unbumped, missing `origin/main`, and no merge-base (orphan history).
- [ ] Give the no-merge-base case its own failure message naming the missing history (e.g. "no merge-base with origin/main (shallow clone?) — cannot tell whether this branch bumped"), distinct from the collision message.
- [ ] Include `origin/main`'s short SHA and commit date in every non-skip output line.
- [ ] Fix the link in `docs/backlog/tag-version-workflow-hardening.md:37` to `archive/package-version-duplicate-guard.md`.

## Acceptance

- `npm test` runs the new test file, and every one of the six scenarios above passes with the expected exit code.
- When no merge-base exists, the script exits 1 with a message that mentions the missing merge-base and no longer says "a parallel branch already shipped this bump".
- Output lines show `origin/main`'s SHA and date.
- The `tag-version-workflow-hardening.md` link resolves to an existing file.

## Related

- [archive/package-version-duplicate-guard.md](archive/package-version-duplicate-guard.md) — the ticket that shipped the script (PR #335)
- [tag-version-workflow-hardening.md](wip/tag-version-workflow-hardening.md) — carries the broken link
- [archive/package-version-bump-auto-tag.md](archive/package-version-bump-auto-tag.md) — sibling post-merge tagging
