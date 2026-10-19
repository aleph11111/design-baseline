---
area: docs
opened: 2026-10-19
status: done
value: normal
model: sonnet
model_reason: "doc-only edit with an established cause and an existing placeholder pattern in README.md"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-19T00:00:00Z
---

# PACKAGE.md example pin is stale at v0.2.3

## Context

`docs/PACKAGE.md` lines 7 and 46 show the example pin `github:aleph11111/design-baseline#v0.2.3`, while the newest tag is `v0.12.2`. A new consumer copying the snippet installs a release from before the closed-API removals (all page shells v0.3.0 per ADR-0008, form-page 3.0). Line 29 claims "a version bump is a one-digit change", which is false now (v0.9.3 -> v0.12.2 is a multi-step, API-breaking jump). `README.md:62` already uses the `#vX.Y.Z` placeholder, so the snippet in PACKAGE.md is the odd one out. Repro: copy the snippet into a fresh consumer and `npm install`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Replace the pin at `docs/PACKAGE.md:7` and `docs/PACKAGE.md:46` with a `#v<latest>` placeholder (matching the `#vX.Y.Z` form in `README.md:62`).
- [ ] Next to the first snippet, add the lookup guidance: `git ls-remote --tags origin 'v*' | sort -V | tail -1` (or the repo's `package.json` `"version"` on `main`), so the doc cannot go stale.
- [ ] Reword the line-29 "a version bump is a one-digit change" claim to say a bump re-pins one tag but crossing a MAJOR needs the migration notes below.
- [ ] Leave `docs/PACKAGE.md:381` alone: `v0.2.3` there is a historical brickshop measurement, not a pin.

## Acceptance

- `grep -n 'design-baseline#v[0-9]' docs/PACKAGE.md` returns no hard-coded version pin.
- `docs/PACKAGE.md` no longer says a version bump is a one-digit change.
- No other doc in `docs/` or `README.md` carries a hard-coded example pin that reads as the current version.
- The `ls-remote` / `sort -V` command in the doc prints the newest tag (`v0.12.2` today) when run against `origin`.

## Related

- [[package-step5-kept-count-hand-recorded]]
- [[package-tag-post-v0-2-0-sync]]
- [[package-version-bump-auto-tag]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement
