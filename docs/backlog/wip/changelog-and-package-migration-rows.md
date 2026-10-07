---
area: docs
opened: 2026-10-07
status: ready
model: sonnet
model_reason: "pattern-following docs backfill plus one pretest-gate extension; all three deliverables specified by the thought, no design decision left"
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-10-07T00:00:00Z'
---

# Add CHANGELOG.md and PACKAGE.md migration rows for v0.5.0 through v0.6.5 design-baseline releases

## Context

Design-baseline releases ship their `package.json` bump and `v<version>` git tag (`.github/workflows/tag-version.yml` auto-tags on bump — currently `v0.5.0` … `v0.6.5`, shipped 2026-10-06/07), but there is no changelog: `CHANGELOG.md` is absent, and `docs/PACKAGE.md`'s consumer-migration table (the "Closed-API removals per archetype version" block) stops at `v0.5.0`. So the v0.5.1 (Input size), v0.6.0 (mobile filter sheet), v0.6.1 (viewOptions on the list/board shells), v0.6.2 (label props), v0.6.3 (PageShellFrameProps filter slots) and v0.6.4 / v0.6.5 (Button inline / icon-sm) releases are invisible to upgrading apps — hk-crm PR #1252 had to note that it relies on the green checks instead of reading what changed. The repo already has the lever for the third deliverable: `scripts/verify-package-version.mjs` (the `verify:package-version` pretest guard) already enforces shipped-code / version-bump coupling, so the "bump without a changelog" check extends that same zero-dep pattern.

## What to do

- [ ] Add `CHANGELOG.md` with one entry per version (`## v0.x.y`) recording what changed, what a consumer must do, and whether it is breaking — backfilled for `v0.5.0` … `v0.6.5` from the already-landed release commits.
- [ ] Add a `docs/PACKAGE.md` migration row for every consumer-visible change from `v0.5.0` to `v0.6.5` (the last row currently stops at `v0.5.0`).
- [ ] Extend `scripts/verify-package-version.mjs` (the `verify:package-version` pretest guard) so that on a `package.json` version bump it fails `npm test` when `CHANGELOG.md` has no entry for the new version — the forward-looking generalisation of the backfill.

## Acceptance

- `CHANGELOG.md` contains an entry for every version from `v0.5.0` to `v0.6.5`, each recording what changed, what a consumer must do, and breaking yes/no.
- `docs/PACKAGE.md`'s migration table has a row for every consumer-visible change in `v0.5.1` … `v0.6.5`, no longer stopping at `v0.5.0`.
- `npm test` (via the extended `verify:package-version` guard) fails when the bumped `package.json` version has no `CHANGELOG.md` entry, and no longer flags a bump that is accompanied by one.

## Related

- [[package-version-guard-hardening]] — shipped the `verify-package-version.mjs` guard this extends
- [[package-version-duplicate-guard]] — shipped the pretest-wired pattern the new check mirrors
- [[package-version-bump-auto-tag]] — the post-merge `v<version>` tagging this documents
