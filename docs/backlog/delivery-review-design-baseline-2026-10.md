---
area: delivery-review
kind: ops
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
  graded_at: '2026-10-01T17:39:54.641Z'
value: high
---

# Delivery review for design-baseline, September 2026

## Context

**Grade: C.** The most important point: 221 commits and 32 consumer-installable version tags shipped to `origin/main` in 30 days. Every PR up to #395 merged with **zero status checks**. The PR check workflow ([.github/workflows/check.yml](/.github/workflows/check.yml), PR #396) only landed on 2026-10-01, and it is still not a *required* check. Auto-merge "on green CI" ([CLAUDE.md](/CLAUDE.md)) has been merging on nothing. Most of the rework below is the cost of that.

Window: `git log origin/main --since=30.days` covers 2026-09-01 to 2026-10-01: 221 squash merges. Of those, 103 are `docs(backlog)` and 50 are `feat`. The rest are 14 `fix`, 13 `chore(ritual)`, plus a few refactor/test/docs.

### 1. Rework: 10 of 50 feat merges were followed by a fix (20%), and 10 of 14 fixes were rework

Method: for each `fix` merge, check whether a `feat` merge touched the same non-version file within the previous 7 days. `package.json` and the lock file are excluded because every release bumps them.

- **Layout scroll/sticky model: 6 fixes in 2 days.** These are mostly against [src/components/layout/AppShell.tsx](/src/components/layout/AppShell.tsx) and [src/components/archetypes/matrix-grid/MatrixGridShell.tsx](/src/components/archetypes/matrix-grid/MatrixGridShell.tsx). The feats were `c92a899` (#339, toaster opt-out), `e082bc0` (#356, window scroll with sticky chrome) and `df2e610` (#287, brickshop convergence promotions). Then on 2026-09-28 alone came #353 (content column `min-w-0`), #355 (full-bleed marker leak), #359 (detail rail not sticky under the new sticky header), #361 (sr-only escaping scroll boxes, matrix sticky heads), #363 (progress-tracker label wrap) and #368 (matrix header scrolling away sideways). That one day had 48 merges and moved the package from v0.2.13 to v0.2.24. Each version became a tag that consumers install. The only real-browser check for this area is `npm run check:desk-width`, which runs locally and is not in CI.
- **Scanners:** `88d49f6` (audit-signals toast-only feat), then within a few days `ee80ecd` (#342, realpath in entry-point guards) and `1a5b0fe` (false positive) on `scripts/scan-adoption-quality.test.mjs`.
- **Packaging:** `3151137` (#222, source package), then `68784d6` (#234) one day later, which adds the missing `"use client"` across the leaves and an export invariant.

### 2. Reverts: none

0 commits mention "revert". Problems get fixed forward instead, which is why the rework shows up as more patch versions rather than rollbacks.

### 3. Flow: healthy queue, one blocker that needs the operator

- Lanes: 29 open cards in `docs/backlog/` (1 roadmap, 28 tickets), 0 in `wip/`, 216 in `archive/`. Nothing has sat in `wip/` for more than 7 days.
- Ageing: every open ticket was opened 2026-10-01. Today's ritual burst (11 `chore(ritual)` filing merges, #395 to #405) refilled a backlog that auto-dispatch had drained. The oldest `ready` card has waited less than a day.
- Blocked: [[code-health-no-pr-check-workflow]] is `blocked` with "needs admin ruleset on origin: register `check` as a required status on main (ruleset POST was denied in the unattended session)". Its sibling [[hygiene-security-release-tags-and-main-unprotected]] is `ready` but needs the same admin rights. No unattended session can discharge either one.
- Roadmaps: [[archetype-convergence]] is `delivered`. No active roadmap is stalled.

### 4. Concentration: the shared release files, plus one layout module

Files changed by more than 10 merges:

- `package.json` (38) and `package-lock.json` (31). Every change bumps the version.
- [docs/archetypes/MANIFEST.json](/docs/archetypes/MANIFEST.json) (24)
- `_adherence.json` (21)
- [docs/PACKAGE.md](/docs/PACKAGE.md) (19)
- [docs/STYLE.md](/docs/STYLE.md) (11)
- `scripts/lint-design.test.mjs` (10)

The first four are serialisation points that parallel sessions collide on by design (version plus registry). They are bookkeeping, not a module to split. The only code hotspot is `AppShell.tsx` (9), and it is also where the rework lands.

### 5. Ritual yield: high ship rate, low rework, nothing gets old

- 33 ritual tickets were opened in the last 90 days and archived:
  - test-gap: 10
  - refactor: 14
  - over-engineering: 8
  - hygiene-week: 1
  - ops-health: 1
- 32 of the 33 shipped within 0 to 2 days. `test-gap-wizard-shell-no-tests` has no matching merge on `origin/main`, so check whether it was closed without shipping.
- Real rework within 14 days touches 1 to 2 of the 33. `refactor-scan-adoption-quality-pure-core-thin-main` (merged 2026-09-28) was followed by #342 and the `1a5b0fe` false-positive fix on the same scanner files. The automatic overlap with `68784d6` hits 9 of the refactor and over-engineering tickets, but that is one sweeping packaging fix, not rework of those tickets.
- Open ritual tickets: 22, all opened today. 16 are `archetype-rollout-`, and 4 of those are `needs-enrichment`. The rest are 4 `code-health-` and 2 `hygiene-security-`. Three of the rollout tickets are pure "contract version stale" cards: `archetype-rollout-contract-version-stale-vs-manifest` plus the crud-dialog, detail-overview and settings-table variants, which overlap.

## What to do

- [ ] **Discharge the CI blocker yourself.** Run the `gh api .../rulesets` POST named in [[code-health-no-pr-check-workflow]] so `check` becomes a required status on `main`. In the same sitting, apply the branch and tag protection from [[hygiene-security-release-tags-and-main-unprotected]]. Until then, auto-merge on the 22 queued tickets still does not wait for the check.
- [ ] **Hold auto-dispatch on layout scroll/sticky work** (`AppShell`, `SurfaceFrame`, sticky and overflow behaviour in the shells) until `npm run check:desk-width`, or an equivalent real-browser scroll check, runs in `check.yml`. The 6 same-day fixes on 2026-09-28 came from changes that were only checked in jsdom.
- [ ] **Batch layout patch releases.** Decide whether several merges on the same area in one day should share one version bump instead of tagging each one. The 11 consumer tags on 2026-09-28 (v0.2.13 to v0.2.24) each carried a partly broken scroll model.
- [ ] **Collapse the duplicate "contract version stale" rollout cards** into the one cross-archetype card before dispatch, and tell the archetype-rollout ritual to file a single sweep card for that class.
- [ ] **Confirm `test-gap-wizard-shell-no-tests` was actually delivered** or reopen it. It is the one archived ritual ticket with no merge on `origin/main`.

## Acceptance

- After the ruleset is applied, `gh pr list --state merged` shows every PR merged after that date with a passing `check` status, and none with 0 checks. [[code-health-no-pr-check-workflow]] is archived, not blocked.
- Next month's review shows no more than 1 layout `fix` merge within 7 days of a layout `feat` on `AppShell.tsx` or `MatrixGridShell.tsx`. `check.yml` runs a real-browser layout check, or the hold is documented as still in force.
- Next month's review shows no single day with more than 3 version tags on the same area.
- After the merge, `docs/backlog/` no longer holds per-archetype "contract version stale" cards alongside the cross-archetype one.
- After the check, `test-gap-wizard-shell-no-tests` either maps to a merge commit on `origin/main` or is back in the backlog.

## Related

- [[code-health-no-pr-check-workflow]] — the blocked CI-required-check card this report escalates
- [[hygiene-security-release-tags-and-main-unprotected]]
- [[archetype-rollout-contract-version-stale-vs-manifest]]
- [.github/workflows/check.yml](/.github/workflows/check.yml)
- [src/components/layout/AppShell.tsx](/src/components/layout/AppShell.tsx)
