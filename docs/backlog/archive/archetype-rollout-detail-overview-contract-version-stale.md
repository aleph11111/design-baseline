---
area: archetype-rollout
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
  graded_at: '2026-10-01T16:42:53.082Z'
---

# Detail-overview contract version lags the shipped manifest

## Context

[docs/archetypes/detail-overview.md](/docs/archetypes/detail-overview.md) declares `version: 3.2` in its frontmatter and its changelog callouts stop at v3.2 (2026-09-28). [docs/archetypes/MANIFEST.json](/docs/archetypes/MANIFEST.json) lists key `C` at version `3.6`. A reader of the contract cannot tell which of the v3.3 to v3.6 changes the shipped `DetailOverviewShell` carries, or whether the contract still describes the component. Consumers adopt the contract as the binding for their detail pages, so a stale one invites rebuilding behaviour the component already provides.

## What to do

- [ ] Reconcile the contract with every change shipped between 3.2 and 3.6, using the shell's props and the git history of `src/components/archetypes/detail-overview/` as the source of what changed.
- [ ] Add a changelog callout per missing version and set the frontmatter `version` to the manifest value (or state in the callouts why contract and manifest versions differ, per RULES rule 8).
- [ ] Keep the contract role-only: no Tailwind classes or primitive names (RULES rule 3).

## Acceptance

- The contract's changelog has an entry for each version up to the manifest's `3.6`, or explains which versions changed no contract rule.
- The contract no longer describes a prop, slot or behaviour the shell does not have, and no longer omits one it has.
- The contract body contains no Tailwind class strings or `src/components/...` primitive names.

## Related

- [[archetype-rollout-contract-version-stale-vs-manifest]]
- [docs/archetypes/detail-overview.md](/docs/archetypes/detail-overview.md)
