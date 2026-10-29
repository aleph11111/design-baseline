---
area: tooling
opened: '2026-10-29'
status: done
value: high
model: opus
model_reason: "cause not established — the nondeterministic phone render source must be diagnosed from CI diffs before it can be fixed"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-29T13:00:00Z'
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
