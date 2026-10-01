---
area: test-gap
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
  graded_at: '2026-10-01T19:39:13.281Z'
value: high
---

# Add a test suite for the verify-manifest-versions pretest gate

## Context

`scripts/verify-manifest-versions.mjs` (82 lines) is wired as `verify:manifest` and runs in `pretest`, so it gates every `npm test` and the `check` workflow. It has four independent failure guards: `source_spec_version` mismatch between `docs/archetypes/MANIFEST.json` and the spec doc frontmatter, a `version` field on a `methodology[]` entry, a `reference_impl` key on an archetype entry, and a stray `docs/archetypes/*.baseline.md` sibling. It also skips entries with no `promoted_from` (report, calendar) and parses frontmatter with a hand-rolled regex that must keep `"1.0"` a string.

No test references it. Its siblings `scripts/verify-exports.mjs`, `scripts/verify-package-version.mjs` and `scripts/scan-adoption-quality.mjs` each have a `*.test.mjs`. If a guard silently stops firing (e.g. the `promoted_from` skip widens, or the regex stops matching quoted values), drift reaches main with a green gate, and nobody notices until a downstream project installs a stale contract.

## What to do

- Add `scripts/verify-manifest-versions.test.mjs`, following the fixture-directory approach in [scripts/verify-package-version.test.mjs](/scripts/verify-package-version.test.mjs): run the script with `cwd` set to a temp tree holding a minimal MANIFEST and docs.
- Cover each guard with a failing case: version mismatch, methodology `version` field, `reference_impl` key, `.baseline.md` sibling. Assert exit code 1 and the specific stderr line.
- Cover the pass case (exit 0) and the authored-entry skip (no `promoted_from`, no frontmatter field).
- Cover a quoted `source_spec_version: "1.0"` against a MANIFEST `"1.0"` so number coercion regressions fail.

## Acceptance

- `npm test` shows a `verify-manifest-versions` suite with one test per guard plus the pass and skip cases.
- Breaking any one guard in the script makes exactly that test fail.
- The suite runs without touching the real `docs/archetypes/MANIFEST.json`.

## Related

- [scripts/verify-manifest-versions.mjs](/scripts/verify-manifest-versions.mjs)
- [docs/archetypes/README.md](/docs/archetypes/README.md)
