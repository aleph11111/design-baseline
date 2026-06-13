# Choosing a surface

The same entity shows up at very different depths across projects — a `Company`
is a two-field afterthought in one app and a hub with contacts, deals, and
contracts in another. The wrong reflex is to build **tiers of the same
component** ("simple / enhanced / super-detailed dialog"). That explodes into a
matrix nobody can maintain, with boundaries no one can agree on.

This doc is the rubric instead: **one archetype per surface shape, chosen by
entity depth + interaction context** — and two mechanisms (compose *within*,
escalate *between*) that absorb depth without tiering.

## The two mechanisms (not tiers)

1. **Compose within an archetype.** Depth is *compositional*, not a discrete
   tier. A deep entity isn't a "tier-3 layout" — it's the same layout with **more
   sub-surfaces mounted**. `detail-overview` (C) is the canonical example: a
   slotted shell (`header → summary → stats → content → references`). A shallow
   entity fills `summary` and stops; a deep one mounts `stats` + several `content`
   tables + `references`. Same archetype, same code — it just holds more.

2. **Escalate between archetypes.** When depth crosses a threshold the *container*
   itself must change (a dialog can only get so big). The entity climbs a
   **surface ladder** — and the *same entity legitimately sits on different rungs
   in different projects.* That is correct, not drift.

> Tiers conflate these. Keep them separate: **compose** for graded content,
> **escalate** for graded depth, **variants** (below) for graded presentation.

## The surface ladder

Increasing surface area for one entity. Pick the lowest rung that fits — climb
only when a threshold below forces it.

| Rung | Surface | Donor archetype / primitive | Use when |
|------|---------|------------------------------|----------|
| 1 | **Inline token** | `Badge`, table cell, `KeyValueRow` value | The entity is only a *reference* inside another surface (an FK, a chip). |
| 2 | **List row** | list-with-detail (A) · settings-table (D2) · grouped-list (K) | You need to scan / compare / filter many of them. |
| 3 | **Quick dialog** | crud-dialog (J) | Create/edit is light and should happen **without leaving the list**. |
| 4 | **Detail section** | `SectionCard` / `DetailSection` embedded in a parent page | The entity is a *sub-object* of another entity's page (composition). |
| 5 | **Detail page** | detail-overview (C) | The entity **owns collections** (1-to-many children), carries cross-entity references, or is a primary navigation target. |

## Escalation thresholds — when to climb

The deciding signals, in priority order:

- **Owns 1-to-many collections?** (contacts, deals, line items…) → **rung 5** (a
  detail page, with the collections as `content` sections). This is the single
  strongest signal: collections need slots a dialog can't give.
- **Is it a primary navigation target / deep-linkable / refreshable?** → **rung 5**.
- **Is it a meaningful part *of another* entity's page?** → **rung 4** (a section).
- **Edited in passing, few fields, no children?** → **rung 3** (quick dialog).
- **Only ever referenced, never edited here?** → **rung 1** (token).

If you're between rungs, prefer the **lower** one and escalate when a real need
appears — progressive disclosure at the entity level beats pre-building depth.

## The create spectrum (a sub-case)

"Create" is not one pattern — it's two rungs of the same ladder, chosen by the
*weight* of the create:

| Create surface | Archetype | Use when |
|----------------|-----------|----------|
| **Dialog create** | crud-dialog (J) | ≤ ~6–8 fields, no nested/related-entity creation, user is mid-task on another surface and shouldn't lose their place. |
| **Page create** | form-page (B) | Many fields, multiple sections, uploads, heavy validation — the create *is* the task and deserves its own route. |

**Audit rule:** a *small* create living in a form-page is drift — it belongs in a
dialog. A many-section create crammed into a dialog is drift — it belongs on a
page. Match the create surface to the field weight, not to habit.

## Variants — where graded richness IS legitimate

Within a *single* container you sometimes want a simple→rich gradient. Do it as a
**variant axis on one component**, never as separate components:

- **detail-overview** already grades via `rhythm` (compact/default), `tone`
  (default/muted), and `width`.
- **crud-dialog** should grade via a `layout` axis — `flat` (≤6 fields) →
  `two-column` (moderate) → `tabbed` (distinct concerns). This is the honest
  version of "T1/T2/T3 dialog": one shell, one maintained component, three
  presentations.

This keeps the "tier" feeling for the consumer while the design system maintains
exactly one of each archetype.

## Worked example — `Company` at two depths

**brickshop (shallow).** A company is name + a couple of fields, no owned
collections, edited in passing.
- Rung 2 (settings-table row) + rung 3 (crud-dialog, `flat` layout). No detail
  page — there's nothing to put in the slots.

**hk-crm (deep).** A company owns contacts, deals, leads, contracts.
- Rung 5 (detail-overview page): `summary` = company master data, `stats` = deal
  value / open contracts, `content` = a contacts table + a deals table + a
  contracts list, `references` = parent group / external links. Create is a
  form-page (B) given the field weight; quick-add of a child contact is a
  crud-dialog launched from the contacts section.

Same entity, same baseline, different rungs — **because the domain depth differs,
not because we built three Company layouts.**

## Quick decision

```
Creating?
  few fields, stay-in-context ........... crud-dialog (J), flat
  many fields / sections / the task ..... form-page (B)

Displaying?
  only a reference ...................... inline token (Badge / cell)
  scanning many ......................... list row (A / D2 / K)
  sub-object of a parent page ........... detail section (SectionCard)
  owns collections / nav target ........ detail-overview page (C)
```

See also: `docs/archetypes/README.md` (the archetypes + the twelve layers),
`docs/TAXONOMY.md` (vocabulary), `docs/STYLE.md` (tokens, primitives).
