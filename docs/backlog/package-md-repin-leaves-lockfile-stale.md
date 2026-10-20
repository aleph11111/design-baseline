---
area: docs
opened: 2026-10-20
status: ready
value: normal
model: sonnet
model_reason: "doc-only edit with an established cause and a verified working command"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-20T00:00:00Z
---

# PACKAGE.md re-pin step leaves consumer lockfile on old commit

## Context

`docs/PACKAGE.md` §1 ("`package.json` — pin the tag", line ~27) tells consumers a bump "re-pins one tag", i.e. edit the `#vX.Y.Z` suffix of the `design-baseline` dependency in `package.json`. Editing the tag and running plain `npm install` does not re-resolve a git dependency whose `package-lock.json` entry already exists, so the lock stays on the old commit. Repro 2026-10-20 in brickshop-manager: `#v0.13.0` → `#v0.14.1`, `npm install` exit 0, `node_modules/design-baseline` still 0.13.0 (lock resolved `aef2da9`). Command that worked: `npm install 'design-baseline@github:aleph11111/design-baseline#v0.14.1'` (lock then resolved `2ac3249`).

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `docs/PACKAGE.md` §1, add the re-pin command `npm install 'design-baseline@github:aleph11111/design-baseline#vX.Y.Z'` (placeholder, not a literal version, per the §1 "never a version copied from a doc" rule) and state that editing the tag alone plus plain `npm install` keeps the old lock entry.
- [ ] Add a verify step to §1: `grep '"version"' node_modules/design-baseline/package.json` must show the new version.
- [ ] Check the other PACKAGE.md passages that tell consumers to bump or add the pin (the wiring-line-1 reference near line 438 and the bump/migration runbook) and point them at the same command instead of restating it.

## Acceptance

- `docs/PACKAGE.md` §1 shows the `npm install 'design-baseline@github:…#vX.Y.Z'` re-pin command and the `node_modules/design-baseline/package.json` version check.
- No other PACKAGE.md passage instructing a re-pin or bump still describes editing the tag alone as sufficient.
- Every example version in the added text is the `vX.Y.Z` placeholder, unchanged from the existing pin snippet convention.

## Related

- [[package-md-example-pin-stale]] — same §1 pin snippet, earlier staleness fix
- [[package-runbook-brickshop-manifest-contradiction]] — runbook consumer-wiring docs
- [[archetype-package-consumer-wiring]] — origin of the consumer wiring steps
