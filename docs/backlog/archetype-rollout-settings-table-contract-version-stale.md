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
  graded_at: '2026-10-01T16:44:26.164Z'
---

# Settings-table contract version lags the manifest entry

## Context

[docs/archetypes/settings-table.md](/docs/archetypes/settings-table.md) declares `version: 2.2` in its frontmatter and its changelog callouts stop at v2.2. [docs/archetypes/MANIFEST.json](/docs/archetypes/MANIFEST.json) lists key `D2` at version `2.7`. A reader of the contract cannot tell which of the v2.3 to v2.7 changes the shipped shell carries (for example the `labels` copy overrides, the row-derived `rowActions` factory, and the per-row identifier gate are not described). Consumers auditing against the contract score against a stale shape.

## What to do

- [ ] Reconcile the contract with every change shipped between 2.2 and 2.7, using the shell's props in [src/components/archetypes/settings-table/SettingsTableShell.tsx](/src/components/archetypes/settings-table/SettingsTableShell.tsx) and the git history of that directory as the source.
- [ ] Add changelog callouts for the missing versions and set the frontmatter `version` to the manifest value.
- [ ] Keep the contract role-only: no Tailwind classes or primitive names.

## Acceptance

- The contract frontmatter `version` equals the D2 `version` in MANIFEST.json.
- Every prop on the shell's public type is covered by a layer or a changelog callout in the contract.
- No contract body line names a Tailwind class.

## Related

- [[archetype-rollout-contract-version-stale-vs-manifest]]
- [docs/archetypes/settings-table.md](/docs/archetypes/settings-table.md)
