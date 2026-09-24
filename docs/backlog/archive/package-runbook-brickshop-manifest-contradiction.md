---
area: archetypes
opened: '2026-09-24'
status: done
value: normal
model: sonnet
model_reason: "doc reconciliation with the decision already named; no code"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-09-24T10:40:00Z'
---

# Reconcile PACKAGE.md's brickshop MANIFEST exception with the cutover ticket's acceptance

## Context

Found while running the brickshop-manager cutover (brickshop branch `feat/design-baseline-package-cutover`,
2026-09-24) against tag `v0.2.3`. `docs/PACKAGE.md` step 6's **"`brickshop-manager` exception (F9)"**
says `docs/archetypes/MANIFEST.json` stays **live** in brickshop, carrying its six versionless local
rows (`detail-view`, `settings-form`, `domain-hub`, `lookup`, `feed`, `item-selector`), because the
dashboard's promotion-candidate axis reads it. The ticket
`docs/backlog/brickshop-manager-package-install-cutover.md` requires the opposite:
`origin/main:docs/archetypes/MANIFEST.json` must **fail** after `git mv docs/archetypes docs/archive/archetypes-2026`.
Whoever implements it has to break one of the two. Other findings from the same run:
- The wiring-line example in `docs/PACKAGE.md` §1 still pins `#v0.2.1`, although the current tag is `v0.2.3`.
- The runbook presents the swap as mechanical, but closed-API removals such as `DashboardWidget span` becoming required and `DetailOverviewShell header`, `DashboardGrid columns` and `KeyValueRow mono` being dropped break a consumer that evolves its archetypes locally. There are no migration notes for these (48 type errors in brickshop).

## What to do

- [ ] Rewrite the brickshop-manager ticket's second acceptance bullet to match F9: MANIFEST.json stays at `docs/archetypes/MANIFEST.json`, shrunk to the six versionless rows, and only the `.md` corpus moves to `docs/archive/archetypes-2026/`. F9 carries the reason, since archiving the axis input is what the F4 shrink rule prevents.
- [ ] Bump the `docs/PACKAGE.md` §1 wiring example and the opening pin from `#v0.2.1` to the current tag.
- [ ] Add a "Closed-API removals per archetype version" note to `docs/PACKAGE.md`'s "Migrating a vendored consumer" section, listing the props each shell dropped or made required since the versions consumers last synced. A pre-donor consumer should be told to converge per archetype before step 3.

## Acceptance

- The brickshop cutover ticket and `docs/PACKAGE.md` F9 name the same final path for brickshop's MANIFEST.json, and no other consumer section contradicts it.
- `grep -n '#v0.2.1' docs/PACKAGE.md` returns nothing once the example is bumped.

## Related

- [brickshop-manager-package-install-cutover.md](../wip/brickshop-manager-package-install-cutover.md)
- [archive/package-doc-retirement-ownership-and-runbook-step.md](../archive/package-doc-retirement-ownership-and-runbook-step.md)
- [archive/hk-crm-package-install-cutover.md](../archive/hk-crm-package-install-cutover.md)
