---
area: tooling
opened: '2026-09-28'
status: done
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

- [x] Add a vitest file (`scripts/verify-package-version.test.mjs` — the repo's `npm test` harness only picks up `scripts/**/*.test.mjs`, per `vitest.config.ts`; sibling scripts follow the same `.test.mjs` convention) that builds temp git repos and runs the script, covering: equal (collision), lower, greater, unbumped, missing `origin/main`, and no merge-base (orphan history).
- [x] Give the no-merge-base case its own failure message naming the missing history (e.g. "no merge-base with origin/main (shallow clone?) — cannot tell whether this branch bumped"), distinct from the collision message.
- [x] Include `origin/main`'s short SHA and commit date in every non-skip output line.
- [x] Make the links between this ticket and `tag-version-workflow-hardening.md` resolve correctly once both tickets are archived: both now live in `docs/backlog/archive/`, so a same-directory relative link (no `archive/` or `wip/` prefix) resolves for both — no path rewrite needed beyond the two `/ship` archive moves.

## Acceptance

- [x] `npm test` runs the new test file, and every one of the six scenarios above passes with the expected exit code.
- [x] When no merge-base exists, the script exits 1 with a message that mentions the missing merge-base and no longer says "a parallel branch already shipped this bump".
- [x] Output lines show `origin/main`'s SHA and date.
- [x] The `tag-version-workflow-hardening.md` link resolves to an existing file.

## Related

- [package-version-duplicate-guard.md](package-version-duplicate-guard.md) — the ticket that shipped the script (PR #335)
- [tag-version-workflow-hardening.md](tag-version-workflow-hardening.md) — sibling ticket, archived alongside this one
- [package-version-bump-auto-tag.md](package-version-bump-auto-tag.md) — sibling post-merge tagging

*Shipped: `scripts/verify-package-version.test.mjs` (7 cases), a distinct no-merge-base message that fails closed, `origin/main`'s short SHA + commit date on every non-skip line, and the archive move that resolves the cross-ticket links.*
