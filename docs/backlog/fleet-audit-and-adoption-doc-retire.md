---
area: docs
opened: '2026-09-11'
status: ready
value: normal
model: opus
model_reason: "the FLEET-AUDIT split is a salvage judgement against three live scanners — deciding which rubric prose still has a reader is design reading, not a delete"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-11T00:00:00Z'
roadmap: archetype-convergence
---

# Retire `FLEET-AUDIT.md`, `ADOPTION.md` and the dated audit dumps

## Context

Phase `donor-docs` of the `archetype-convergence` roadmap, decisions
G7/G8/G9/G10 (`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md`,
section *Phase donor-docs — retire the mirrors, ship the contract*). Two
audit-era docs and 2.5 MB of dated reports outlived their readers, but neither
file is a plain delete. `docs/ADOPTION.md` was rewritten for package
consumption two phases ago under another name — `docs/PACKAGE.md` is 24 KB of
four wiring lines, a six-step runbook and a proof matrix — and its nine-point
checklist is `/adopt-baseline`'s script, which dies on `fleet-commands`; only
its four-gate enforcement table and its upstream rule-of-2 loop have no home.
`docs/FLEET-AUDIT.md` is three halves and only one is dead: its drift half lost
its comparand on `drop-drift-machinery`, its gap half is what
`docs/promotion-radar.json` already holds (16 candidates, 3 at `watch`), but its
rubric half is the prose spec for `docs/audit-signals.json`, which has three
live readers on the keep-list — `moleculeAudit.ts:117`, `adoptionScan.ts:26` and
this donor's `scripts/scan-adoption-quality.mjs` — and `docs/ADOPTION-QUALITY.md`
(read by the hub at `designStates.ts:811`) cross-references it four times,
including for its output schema and triage tier.

## What to do

- [ ] Move `ADOPTION.md`'s four-gate enforcement table into `docs/PACKAGE.md`
      and its upstream rule-of-2 loop into `docs/PROMOTION-RADAR.md`, then
      delete `docs/ADOPTION.md` and its `methodology[]` entry in
      `docs/archetypes/MANIFEST.json` (G7).
- [ ] Move `FLEET-AUDIT.md`'s rubric-half prose into `docs/ADOPTION-QUALITY.md`
      — its existing reader — leaving `docs/audit-signals.json` unchanged as the
      machine form, and drop the drift half outright (G8).
- [ ] Fold any `FLEET-AUDIT`-era gap row not already on the radar into
      `docs/promotion-radar.json`'s `candidates`, then delete
      `docs/FLEET-AUDIT.md`. Salvage first, delete second.
- [ ] Delete `docs/audits/hk-crm-adoption-2026-07/` (2.3 MB of 2026-07 HTML,
      pre-package and pre-API-close) and the two 2026-06 dated sweeps, the
      sweeps only after their unpromoted rows are on the radar. Keep
      `2026-09-07-pkg-ui-vendored-clause-narrowing.md` and
      `2026-archetype-appearance-prop-audit.{md,json}` — both are cited
      evidence for shipped phases (G9).
- [ ] Restate the roadmap's *"donor's docs/ is under 250 KB"* acceptance as the
      reader test in G10: every doc under `docs/` has a named reader and no
      dated audit dump survives without a citation. The byte target is
      unreachable — the 22 contracts alone are 335 KB and are now the package's
      payload.
- [ ] Update `CLAUDE.md:26,52` and `docs/ARCHITECTURE.md:53,152`, which name
      `FLEET-AUDIT.md` + `docs/audits/` as the fleet-measurement layer.

## Acceptance

- [ ] `docs/ADOPTION.md` and `docs/FLEET-AUDIT.md` no longer exist, the
      `adoption` entry has left `MANIFEST.json`'s `methodology[]`, and
      `grep -rn 'FLEET-AUDIT\|docs/ADOPTION\.md' docs/ CLAUDE.md README.md`
      returns no live reference from any surviving doc — every one of them, not
      only the two files the spec names.
- [ ] Both salvaged parts are findable: `grep -n 'Gate' docs/PACKAGE.md` shows
      the four-gate table and `grep -n 'rule-of-2\|Rule of 2' docs/PROMOTION-RADAR.md`
      shows the upstream loop.
- [ ] `docs/ADOPTION-QUALITY.md` carries the Axis-C triage tier and
      output-schema prose and cross-references nothing deleted.
- [ ] `node scripts/scan-adoption-quality.mjs` still runs against an unchanged
      `docs/audit-signals.json`, and the hub's `moleculeAudit` /
      `adoptionScan` readers of that file are untouched.
- [ ] `du -sh docs/audits` measures under 100 KB and every surviving file under
      it is cited from a shipped phase section of the design spec or from an
      ADR.
- [ ] Donor gates unchanged: `npx tsc --noEmit` clean,
      `node scripts/lint-design.mjs` 0 errors, `npm run gallery:build` ok.

## Related

- [archetype-convergence.md](archetype-convergence.md) — roadmap, phase `donor-docs`
- [package-doc-retirement-ownership-and-runbook-step.md](archive/package-doc-retirement-ownership-and-runbook-step.md) — the consumer-side ownership table this donor-side retirement mirrors
- [plugin-version-contract-vs-bundle-split.md](archive/plugin-version-contract-vs-bundle-split.md) — `drop-drift-machinery`, which removed the drift comparand this doc's middle half described
- ADR-0005 — the adoptionQuality scan ships as a zero-dep donor script (the rubric reader that survives)
