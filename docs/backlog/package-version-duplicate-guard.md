---
area: tooling
opened: '2026-09-27'
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-09-27T00:00:00Z'
value: normal
model: sonnet
model_reason: mirrors the existing verify-manifest-versions.mjs / pretest wiring pattern exactly — no design decisions left
---

# Nothing guards against a duplicate package.json version across parallel branches

## Context

Two parallel house-look slices (#309, #310) both bumped `package.json`'s `"version"` to `0.2.9` — the rebase didn't flag it because both sides wrote the byte-identical string, and only a manual re-diff caught it (one branch was rebumped to `0.2.10`). `package.json:2` is `"version"` (currently `0.2.11`). The repo already has a zero-dependency guard for exactly this class of problem: `scripts/verify-manifest-versions.mjs` (checks `docs/archetypes/MANIFEST.json` version drift) is wired into `package.json`'s `"pretest"` script, which `npm test` runs automatically (`package.json:14-18`) — so it fires in every `/ship` precondition-3 test run without any extra step. The global `/ship` command (`~/.claude/commands/ship.md`) also has a "shared-counter collision gate" for duplicate ADR/migration number prefixes, but that file lives in the `coding-dashboard` repo, not this one — out of scope for a design-baseline ticket; the project-local `pretest`-script pattern is this repo's own established lever for this exact problem class.

## What to do

- [ ] Add a `verify:package-version` script (new file, e.g. `scripts/verify-package-version.mjs`, or extend `verify-manifest-versions.mjs`) that reads the current `package.json`'s `"version"`, reads `origin/main`'s `package.json` `"version"` via `git show origin/main:package.json` (falling back to a no-op with a clear message if there is no `origin/main`, e.g. a fresh clone with no fetch yet — mirroring `verify-manifest-versions.mjs`'s zero-dependency, `node:fs`-only style), and fails with a clear message if the current version is not strictly greater (semver comparison, not just string inequality — a `0.2.9` vs `0.2.10` string compare would pass by luck but the check must actually order them).
- [ ] Wire it into `"pretest"` alongside `verify:manifest` so it runs on every `npm test`.

## Acceptance

- Running the new script against a `package.json` whose version equals or is lower than `origin/main`'s fails with a non-zero exit and names both versions.
- Running it against a `package.json` whose version is strictly greater than `origin/main`'s passes.
- `npm test` (which now runs the new check via `pretest`) passes on current `main`.

## Related

- [package-tag-post-v0-2-0-sync.md](package-tag-post-v0-2-0-sync.md) — prior incident where `package.json`'s version field drifted from the git tag
- `scripts/verify-manifest-versions.mjs` — the existing pretest-wired version-drift guard this mirrors
- RULES.md rule 8 — version fields track different things and must not be conflated
