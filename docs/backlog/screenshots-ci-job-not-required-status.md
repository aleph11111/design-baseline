---
area: tooling
opened: '2026-10-29'
status: ready
value: high
model: sonnet
model_reason: "one ruleset API call plus a header-comment edit; the fold-into-check alternative is ruled out by the container split in check.yml"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-29T12:00:00Z'
---

# Register the screenshots CI job as a required status on main

## Context

`.github/workflows/check.yml` gained a `screenshots` job in PR #624 (v0.18.0): pixel baselines in `tests/screenshots/` compared inside the pinned Playwright container. The file header still says auto-merge waits on the required status `check` only, and the `main-protected` ruleset (id 24341708, `gh api repos/aleph11111/design-baseline/rulesets`) carries only `deletion`, `non_fast_forward` and `pull_request` rules, with no `required_status_checks` rule at all. So a PR whose baselines go red can still auto-merge and the pixel gate blocks nothing. The same ruleset gap also leaves `check` itself unrequired, which is the blocked ticket [[code-health-no-pr-check-workflow]].

Folding the compare into the `check` job is not viable: `check` runs on the bare runner with its preinstalled Chrome (`CHROME_PATH=/usr/bin/google-chrome`), while `screenshots` must run in the `mcr.microsoft.com/playwright` `container:` so renders match the committed baselines. The fix is the ruleset.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add a `required_status_checks` rule to the `main-protected` ruleset requiring both contexts `check` and `screenshots` (one rule, so this also discharges [[code-health-no-pr-check-workflow]]). This is an admin action on origin; the operator or an admin-authed session runs it.
- [ ] Update the header comment of `.github/workflows/check.yml` to name both `check` and `screenshots` as required statuses.
- [ ] Re-check every other job in `.github/workflows/*.yml` that runs on `pull_request`; each must be either required or noted in its header as advisory.

## Acceptance

- `gh api repos/aleph11111/design-baseline/rulesets/24341708` lists a `required_status_checks` rule whose contexts include `check` and `screenshots`.
- A PR that changes a baseline-visible style fails `screenshots` and auto-merge is blocked until it is green.
- No other `pull_request` job in `.github/workflows/` is left neither required nor documented as advisory.
- The `check.yml` header comment matches the ruleset's required contexts.

## Related

- [[code-health-no-pr-check-workflow]] — same ruleset gap for `check`; one rule covers both
- [[device-triad-screenshot-baselines]] — shipped the `screenshots` job in PR #624
