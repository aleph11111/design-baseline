---
area: tooling
opened: '2026-10-29'
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
  graded_at: '2026-10-29T13:00:00Z'
value: high
model: opus
model_reason: >-
  cause not established — the nondeterministic phone render source must be diagnosed from CI diffs
  before it can be fixed
---

# Phone screenshot baselines flake in CI screenshots job

## Context

The `screenshots` job in `.github/workflows/check.yml` fails intermittently on one or two `[phone]` tests per run, a different archetype each time, while `npm run screenshots` passes 45/45 locally. Evidence: run 40860402722 (PR #629) failed `[phone] matrix-grid` (610 px) and `[phone] tabbed-settings` (426 px); run 40860301845 failed `[phone] report` (352 px); run 40859802818 failed `[phone] calendar` (421 px). Runs 40860134320 and 40859266298 passed on the identical `tests/screenshots/phone/*.png` baselines from #624. Every failure sits just above the `maxDiffPixelRatio: 0.001` budget in `playwright.config.mjs` (about 329 px on 390x844); `desk27` and `laptop14` never fail because the same ratio buys them thousands of pixels. Local repro attempts all pass: 12x repeat, `--cpus=2 --workers=2` repeat, and a linux/amd64-emulated run (baselines were rendered on arm64). CI uploads no diff PNGs, so the differing region is unknown. PR #629 merged with this job red, which is what made it visible.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Get the CI diff PNGs for a failing phone run (the upload step from [[screenshots-ci-job-failure-artifacts]]) and identify the region that differs.
- [ ] Remove the nondeterminism at its source in `tests/screenshots.spec.mjs` or the phone-rendered component (fonts, touch-density/matchMedia flip, scrollbars, timing), without raising `maxDiffPixelRatio`.

## Acceptance

- Ten consecutive CI `screenshots` runs on unchanged baselines pass every `[phone]` test.
- No other `[phone]` archetype baseline differs between two CI runs of the same commit.
- `maxDiffPixelRatio` in `playwright.config.mjs` is unchanged.

## Related

- [[screenshots-ci-job-failure-artifacts]] — supplies the diff PNGs this diagnosis needs
- [[screenshots-ci-job-not-required-status]] — the lead makes the job a required check after this is green
- [[device-triad-screenshot-baselines]] — shipped the baselines and the job (PR #624)
- [[phone-tap-targets-touch-density-default]] — phone touch density, a candidate render-time flip

## Review gate: wrong approach (2026-10-29, PR #631)

PR https://github.com/aleph11111/design-baseline/pull/631 was closed by the `/ship` review gate. Start over from this ticket, and do not repeat the rejected approach.


This change does not remove any nondeterminism. It never diagnoses the differing region and leaves `tests/screenshots.spec.mjs` and the phone-rendered components unchanged. Instead it drops `maxDiffPixelRatio: 0.001` from `playwright.config.mjs` and puts a per-call `maxDiffPixels` budget with a floor of 1500 in the spec. That raises the phone tolerance from about 330 px to 1500 px, roughly 4.5x, so the measured flakes (352–610 px) fit under it. The ticket says to fix the source "without raising `maxDiffPixelRatio`", and one acceptance criterion requires that setting to stay unchanged. The core of the diff is the move the ticket rules out, and patching it does not reach the right fix, which is a diagnosis from CI diff PNGs followed by a source fix. One part is worth keeping: the `upload-artifact` step is the prerequisite from [[screenshots-ci-job-failure-artifacts]]. A fresh session can keep it and do the actual diagnosis.

### Findings

1. **`tests/screenshots.spec.mjs:15–18` is a symptom patch that hides regressions.**
   - `Math.max(1500, …)` gives the 390x844 phone viewport a 1500 px budget, 0.46% of the frame.
   - Failure scenario: a real phone regression up to about 1500 px now passes CI. Examples include a dropped tab label, a misaligned icon row, or a one-line text wrap change.
   - The noise source (font hinting, a touch-density/matchMedia flip, scrollbars, timing) is still present. It is only out-budgeted, so a flake above 1500 px, or one that grows, will still fail.
   - The comment calls 352–610 px "run-to-run noise". It is unexplained nondeterminism, which is exactly what the ticket asks to find.
2. **`playwright.config.mjs:21` removes the global budget.**
   - With `maxDiffPixelRatio` gone, any `toHaveScreenshot` call that does not pass its own `maxDiffPixels` now runs at Playwright's default of zero differing pixels.
   - Failure scenario: a future screenshot test, or any existing one outside this spec, becomes stricter than intended and flakes at the first anti-aliasing difference.
   - This directly violates acceptance criterion 3.
3. **`docs/backlog/archive/phone-screenshot-baselines-flake.md` marks the ticket `status: done` and archives it.**
   - None of the acceptance criteria has been demonstrated.
   - There is no evidence of ten consecutive green CI runs, and no cross-run comparison of baselines.
4. **`bin/design-baseline-playwright.mjs` changes mode from 100644 to 100755.**
   - This is unrelated to the ticket. It is harmless but out of scope.

### Acceptance

- **Ten consecutive CI `screenshots` runs on unchanged baselines pass every `[phone]` test:** not met. No evidence is offered. Any passes would come from widening the tolerance, not from making the render deterministic.
- **No other `[phone]` archetype baseline differs between two CI runs of the same commit:** not met. Nothing makes the render deterministic. The bigger budget masks the differences without removing them.
- **`maxDiffPixelRatio` in `playwright.config.mjs` is unchanged:** not met. The key is removed (`playwright.config.mjs:21`) and replaced by a larger effective `maxDiffPixels` in the spec.
- **What-to-do step "get the CI diff PNGs":** partly enabled. The `if: failure()` upload of `test-results/` and `playwright-report/` in `.github/workflows/check.yml:49–56` would provide them. No diagnosis drawn from them appears in the diff.

### Follow-ups

None.

### Notes

- The upload step is correct as written: it runs on `failure()`, captures `test-results/` (where the actual, expected and diff PNGs land), uses a pinned SHA and has a 7-day retention. A fresh attempt should keep it.
- For desk27 the new formula works out to the old budget. laptop14 rises only slightly. The real change is the phone floor, which is where the ticket wants determinism.
- Candidate sources worth checking first against the diff PNGs:
  - the touch-density default from [[phone-tap-targets-touch-density-default]]
  - overlay scrollbars on the phone viewport
  - font subpixel or hinting differences under CI CPU contention
