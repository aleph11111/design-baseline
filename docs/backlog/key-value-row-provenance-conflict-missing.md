---
area: archetypes
opened: 2026-11-05
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-05T09:00:00Z
---

# KeyValueRow lacks provenance, contested-value and missing-value affordances

## Context

archetype-gap on `detail-overview`: `KeyValueRow` (`src/components/archetypes/detail-overview/KeyValueRow.tsx`) takes only `label` / `value` / `block`, so enrichment-style consumers hand-roll three shapes. Consumer: hk-sales-agent Firmenakte (`web/src/app/(app)/firmen/[firmaId]/page.tsx` + `web/src/components/akte-teile.tsx`, tab "Daten und Quellen", `?tab=daten`). Repro: hk-sales-agent dev on localhost:3040, open `/firmen/e9178319-0af8-4e1b-8bc1-e60bed432e17?w=hk-ma&tab=daten` (IKADO GmbH).

1. **Provenance outweighs the value.** ~26 fields each print a full source line (e.g. `Handelsregister (DE-HRB-R3101-4207) · 5.11.2026 · via OpenRegister Register + Gesellschafter · 33 Credits`), repeated ~15 times.
2. **Competing claims are stacked by hand.** A contested field ("widersprochen": Inhabergeführt *ja* per Register vs *nein* per Impressum) renders as stacked value/source pairs with no shared conflict marker.
3. **Missing fields look like data.** An unenriched field renders a "fehlt · provider: noch nicht angereichert" row mixed in with real values, with no treatment distinct from the em-dash the primitive documents for unavailable data.

## What to do

- [ ] Add an optional provenance affordance to `KeyValueRow`: a compact source chip next to the value; the full provenance (source, id, date, via, cost) opens on demand in a popover (tap-reachable, not hover-only — the device triad includes a touch phone) and is keyboard-operable.
- [ ] Add an optional contested-value affordance: the winning claim stays the row's value, a conflict marker shows next to it, and the N alternative claims (value + source each) open on demand through the same popover pattern.
- [ ] Add a defined missing-value treatment (a typed prop, not an em-dash string) that renders visibly distinct from both real values and the `"—"` unavailable placeholder, and carries an optional reason such as "noch nicht angereichert".
- [ ] Keep the props role-only and data-shaped (provenance object, `alternatives[]`, `missing`), no consumer vocabulary (Firmenakte, OpenRegister, Credits) in the primitive; keep the existing `label`/`value`/`block` behaviour unchanged when none of the new props are passed.
- [ ] Add a living demo of each state (sourced, contested, missing, plus `block` combined) to `src/examples/detail-overview-demo.tsx`, extend `KeyValueRow.test.tsx`, update the `docs/archetypes/detail-overview.md` contract (role-only wording per `docs/RULES.md` rules 2–3), and bump contract + package version with a CHANGELOG entry.
- [ ] Verify the three shapes at the device triad (desk27 / laptop14 / phone) via `npm run check:viewports` and `npm run screenshots`, including a long source line on the phone.

## Acceptance

- A `KeyValueRow` given provenance shows a compact chip and no inline source line; activating the chip by click, tap or keyboard shows the full provenance.
- A `KeyValueRow` given alternatives shows the winning value plus a conflict marker, and lists every alternative claim with its source on demand.
- A `KeyValueRow` flagged missing renders a treatment distinct from the `"—"` placeholder and from a real value, with the reason when one is given.
- A `KeyValueRow` rendered with only `label` / `value` / `block` is unchanged: existing tests and screenshot baselines pass without regeneration.
- The new states render without horizontal overflow at the phone viewport, and every enrichment-style row shape in the demo goes through `KeyValueRow` props rather than a hand-rolled wrapper.

## Related

- [[key-value-row-stack-below-md]] — same primitive's responsive layout; the new affordances must keep its below-`md` stacking
- [[key-value-row-mono-on-text-values]] — same primitive's value typography
- [[detail-overview-stats-prop-demo-gap]] — precedent for a demo-per-prop requirement on this archetype
- [ADR-0009](/docs/adr/0009-figures-in-the-house-sans.md) — figures stay in the house sans, tabular
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — appearance lives in the component, not per call site
