---
area: tooling
opened: '2026-09-17'
status: done
value: normal
model: sonnet
model_reason: "a one-line exports addition plus a tag bump against an established release pattern (v0.2.0/v0.2.1/v0.2.2) — no design decision left"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-17T00:00:00.000Z'
roadmap: archetype-convergence
---

# Export ./package.json from the design-baseline package exports map

## Context

`package.json`'s `exports` map enumerates seven subpaths (`./layout`, `./archetypes/*`,
`./ui/*`, `./lib/utils`, `./hooks/*`, `./utils/logger`, `./tokens.layer.css`) and carries no
`"./package.json"` entry. Node's exports encapsulation therefore refuses the subpath outright,
so in a consumer that has the package correctly installed:

```
$ node -e "require.resolve('design-baseline/package.json')"
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './package.json' is not
defined by "exports" in .../node_modules/design-baseline/package.json
```

This is not hypothetical: it is the literal acceptance command of
[wip/hk-crm-package-install-cutover.md](../archive/hk-crm-package-install-cutover.md) ("In `hk-crm`,
`node -e \"require.resolve('design-baseline/package.json')\"` succeeds"), and the same command
is the first half of [copy-channel-final-delete.md](copy-channel-final-delete.md)'s Part-B gate.
Both had to be verified against `design-baseline/archetypes/detail-overview` instead, because
the underlying property they test — a consumer resolving the package out of `node_modules` —
does hold; only the spelling fails.

Exporting `"./package.json": "./package.json"` is near-universal convention for exactly this
reason: it is how tooling reads an installed package's own `version` without reaching around
the exports map. Adding it is backwards compatible — it opens a subpath, closes none — so
consumers pinned to `v0.2.1`/`v0.2.2` are unaffected until they bump.

## What to do

- [ ] Add `"./package.json": "./package.json"` to the `exports` map in `package.json`.
- [ ] Extend `scripts/verify-exports.mjs` with the new subpath so the invariant count moves
      from 7 to 8 and a future exports edit that drops it fails the check (the script is the
      established home for this class of assertion — it already gates the other seven).
- [ ] Cut the next tag off `main` the same way `v0.2.0`/`v0.2.1`/`v0.2.2` were cut (tag on the
      merge commit, push the tag), so a consumer can pin it.

## Acceptance

- In a consumer that installs the new tag, `node -e "require.resolve('design-baseline/package.json')"`
  exits 0 and prints a path — no longer `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- `node scripts/verify-exports.mjs` reports 8/8 ok.
- Every other subpath still resolves: the check covers the entire set of `exports` entries, not
  only the one this ticket adds, so no existing consumer import breaks.
- `git tag --list 'v0.*'` shows the new tag and `git ls-remote --tags origin` lists it on the
  remote — the pin a consumer needs actually exists.

## Related

- [[hk-crm-package-install-cutover]] — surfaced it; its first acceptance bullet is this command,
  and it verified the gate through `design-baseline/archetypes/detail-overview` instead.
- [[copy-channel-final-delete]] — the same command is half of its Part-B gate.
- [package-tag-post-v0-2-0-sync.md](../archive/package-tag-post-v0-2-0-sync.md) — the dry run that
  first wrote this acceptance command, and the tag-cutting pattern this ticket follows.
- [archetype-package-installable.md](../archive/archetype-package-installable.md) — wrote the
  `exports` map and `scripts/verify-exports.mjs` this ticket extends.
