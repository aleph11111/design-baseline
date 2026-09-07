---
area: docs
opened: '2026-09-07'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what-to-do
    - acceptance
    - related
  failed: []
  graded_at: '2026-09-07T00:00:00.000Z'
value: normal
roadmap: archetype-convergence
---

# ADR-0004 line 45 vendored clause and ground-1 paragraph are stale against shipped `pkg` phase

## Context

[ADR-0004](../../adr/0004-appearance-locality-derived-vs-inherited.md) has two spots that no longer match the tree, confirmed against `package.json`, `scripts/verify-exports.mjs`, and `docs/adr/INDEX.md`:

- **Line 45** ("`src/components/ui/` primitives **stay vendored**") is narrowed by `docs/audits/2026-09-07-pkg-ui-vendored-clause-narrowing.md` (per spec decision P2: package-consuming projects that take any archetype take `ui/` from the package via the `./ui/*` exports subpath; shell-plus-tokens-only projects may still vendor it). No file in `docs/` links to that note from the ADR — `grep -rn '2026-09-07-pkg-ui' docs/adr/` returns nothing.
- **Line 52** (ADR-0030 supersession, ground 1) says "there is in fact no `exports` map and `package.json` is still `private: true`" and predicts both are discharged by "Phase 2's work." Confirmed against the shipped tree: the `exports` map exists (7 subpaths — `layout`, `archetypes/*`, `ui/*`, `lib/utils`, `hooks/*`, `utils/logger`, `tokens.layer.css`; `node scripts/verify-exports.mjs` reports 4/4 invariants ok), but `private: true` is still set in `package.json` — deliberately kept, not dropped: a git dependency against a tag (`v0.2.0` exists) needs no publish, so the flag costs nothing and blocks an accidental publish of a private donor.

## What to do

- [ ] Before editing, grep every reference to the stale claims (`grep -rn 'no.*exports map\|private.*dropped\|stay vendored' docs/`) so no other doc carries the same stale exports/private/vendored assertion this ticket names.
- [ ] Add an amendment section to ADR-0004 linking `docs/audits/2026-09-07-pkg-ui-vendored-clause-narrowing.md` from the line-45 bullet — package-consuming projects that take any archetype take `ui/` from the package; shell-plus-tokens-only projects may still vendor it; governance of `ui/` is untouched (per the narrowing note's own framing).
- [ ] Rewrite the ground-1 paragraph (line 52) to describe shipped state instead of predicting it: the `exports` map (7 subpaths), `files` scope, `peerDependencies`, and `private: true` retained on purpose with the git-tag dependency channel as the reason (matches `package.json` and `scripts/verify-exports.mjs`'s 4/4 ok).
- [ ] Do not restate the appearance-locality ruling and do not open a new ADR — the ruling is unchanged; this is bookkeeping (per the thought's own scope and the narrowing note's "Not a new ADR" precedent).
- [ ] Leave `docs/ADOPTION.md` and `docs/PLUGIN-CONTRACT.md` alone — a later phase owns their rewrite.

## Acceptance

- ADR-0004 contains no sentence a reader can falsify by opening `package.json` (no more "no `exports` map" / "`private: true`" dropped claims).
- The line-45 bullet carries an inline pointer to the narrowing note.
- The ADR-0030 ground-1 paragraph names `private: true` as kept-with-rationale, not dropped.
- `grep -rn '2026-09-07-pkg-ui' docs/adr/` returns at least one hit.
- `docs/adr/INDEX.md` still lists 0004 as Accepted (status unchanged).
- `node scripts/verify-exports.mjs` and `node scripts/lint-design.mjs` still report 0 failing invariants / 0 errors (confirmed baseline: 4/4 ok, 0 errors as of 2026-09-07).
- No other file under `docs/adr/` or `docs/RULES.md` still asserts the exports map doesn't exist or that `private: true` was dropped — a repo-wide grep for those phrases matches nothing outside the corrected ADR-0004 text.

## Related

- [docs/audits/2026-09-07-pkg-ui-vendored-clause-narrowing.md](../../audits/2026-09-07-pkg-ui-vendored-clause-narrowing.md)
- ADR-0004 — Appearance locality: global or fixed in the component; per-call-site only when derived
- [docs/backlog/archive/archetype-package-installable.md](../archive/archetype-package-installable.md)
