---
area: archetype-rollout
opened: '2026-10-01'
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
  graded_at: '2026-10-01T16:45:44.323Z'
---

# CRUD-dialog contract version lags the manifest entry

## Context

[docs/archetypes/crud-dialog.md](/docs/archetypes/crud-dialog.md) declares `version: 3.1` in its frontmatter and its changelog callouts stop at v3.1. [docs/archetypes/MANIFEST.json](/docs/archetypes/MANIFEST.json) lists key `J` at version `3.3`. A reader of the contract cannot tell what the v3.2 and v3.3 changes are, so consumers auditing a dialog against the contract score against a stale shape.

## What to do

- [ ] Reconcile the contract with every change shipped in 3.2 and 3.3, using the public props in [src/components/archetypes/crud-dialog/index.ts](/src/components/archetypes/crud-dialog/index.ts) and the git history of that directory as the source.
- [ ] Add a changelog callout per missing version and set the frontmatter `version` to the manifest value.
- [ ] Keep the contract role-only: no Tailwind classes or primitive names.

## Acceptance

- The contract frontmatter `version` equals the `J` `version` in MANIFEST.json.
- Every prop on the exported dialog components is covered by a layer or a changelog callout.
- No contract body line names a Tailwind class.

## Related

- [[archetype-rollout-settings-table-contract-version-stale]]
- [docs/archetypes/crud-dialog.md](/docs/archetypes/crud-dialog.md)
