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
  graded_at: '2026-10-01T16:38:48.058Z'
---

# List-with-detail contract version lags the manifest entry

## Context

[docs/archetypes/list-with-detail.md](/docs/archetypes/list-with-detail.md) declares `version: 2.2` in its frontmatter and its changelog callouts stop at v2.2. [docs/archetypes/MANIFEST.json](/docs/archetypes/MANIFEST.json) lists key `A` at version `2.8`. A reader opening the contract cannot tell which of the v2.3 to v2.8 changes the shipped component carries, or whether the contract describes them at all. The contract is the stack-agnostic half of the archetype; if it lags the exported component, consumers audit against a stale shape.

## What to do

- [ ] Reconcile the contract with every change shipped between 2.2 and 2.8, using the shell's props and the git history of `src/components/archetypes/list-with-detail/` as the source.
- [ ] Add changelog callouts for the missing versions and set the frontmatter `version` to the manifest value.
- [ ] Keep the contract role-only: no Tailwind classes or primitive names.

## Acceptance

- The contract frontmatter `version` equals the `A` entry's `version` in `MANIFEST.json`.
- Each version from 2.3 to 2.8 has a changelog callout in the contract, or the contract states why it needs none.
- After the edit, no prop in `ListWithDetailShellProps` is absent from the contract's layers.

## Related

- [docs/archetypes/MANIFEST.json](/docs/archetypes/MANIFEST.json)
- [docs/archetypes/list-with-detail.md](/docs/archetypes/list-with-detail.md)
