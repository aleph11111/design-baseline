---
area: tooling
opened: 2026-08-24
status: ready
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-24T00:00:00Z
---

# Ship a fleet scan for the adoptionQuality (Axis-C) tripwire signals

## Context

`docs/audit-signals.json` defines three signal families; `docs/ADOPTION-QUALITY.md` documents `adoptionQuality` as Axis C, the "wrapper adoption" detector — each entry gated by `coOccursWith` so it only fires when a page actually imports the archetype it targets, and explicitly "a CANDIDATE, never a verdict." Today only `molecule` and `conformance` have a machine consumer: coding-dashboard's `server/rituals-prompts.ts:117` documents that `moleculeAudit.ts` reads only `signals.molecule` and `signals.conformance` and "never touches `adoptionQuality` — it is walked by the LLM fleet-audit acceptance-gate pass instead," and warns that a proposal must not ask for it to be "wired into `moleculeAudit.ts`; that work does not exist." That per-page LLM gate walk happens once, at adoption time — there is no recurring fleet-wide count the way `molecule`/`conformance` get one. Consumer repo `mistra` vendors `docs/audit-signals.json` verbatim and records in `docs/archetypes/adoption-audit.md` that its local 26-signal snapshot of `adoptionQuality` (the donor's live file has since grown to 30) is "measured by nobody," deliberately declining to build a local scanner — the same "never fork the runner" rule that keeps `scripts/lint-design.mjs` unforked.

## What to do

- [x] Ship a recurring discovery scan over the `adoptionQuality` array — the same "discovery radar, not gate" treatment `moleculeAudit.ts` already gives `molecule`/`conformance` — producing per-signal hit counts for every connected repo, still respecting each entry's `coOccursWith` gate and its candidate-not-verdict semantics. (Landed as `scripts/scan-adoption-quality.mjs` + `npm run scan:adoption-quality`, ADR-0005; one hit per signal per file — the counting unit is the candidate surface, matching the `rg -l` fleet convention; a red hit still exits 0.)
- [x] Give it its own scan path rather than extending `moleculeAudit.ts`'s existing read — `rituals-prompts.ts:117` documents that file as deliberately blind to `adoptionQuality` today, so this is a new function/module a dashboard or CLI can call the same way `moleculeAudit.ts` is called for the other two families. (Own path: a standalone donor script — `node scripts/scan-adoption-quality.mjs --root <repo> --json` — callable by any CLI/CI job; `moleculeAudit.ts` stays untouched, as documented.)

## Acceptance

- A repo with `docs/audit-signals.json` vendored shows `adoptionQuality` hit counts (e.g. on a Radar/Adoption view) and measures every signal in the array, without writing a local scanner.
- After the next donor file-copy sync, mistra's `docs/archetypes/adoption-audit.md` D4 "explicitly open" note on the `adoptionQuality` axis no longer applies, since no mistra-authored scanner code is needed.

## Related

- [docs/ADOPTION-QUALITY.md](../../ADOPTION-QUALITY.md)
- [docs/FLEET-AUDIT.md](../../FLEET-AUDIT.md)
- [docs/PROMOTION-RADAR.md](../../PROMOTION-RADAR.md)
