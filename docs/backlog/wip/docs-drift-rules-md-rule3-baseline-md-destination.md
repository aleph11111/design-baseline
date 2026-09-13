---
area: archetypes
opened: '2026-09-13'
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-13T00:00:00Z'
---

# RULES.md rule 3 still routes residue to the retired `.baseline.md` sibling

## Context

`docs/RULES.md:11` (hard rule 3) ends: "If a required/forbidden rule mentions a
`src/components/...` import or a class string, it belongs in the `.baseline.md`
sibling." That destination no longer exists: the 22
`docs/archetypes/*.baseline.md` reference siblings were deleted in `cb43fb7`
(#255), rule 2 was rewritten to "one contract plus the exported component,"
and `scripts/verify-manifest-versions.mjs:62-77` now hard-fails if any
`docs/archetypes/*.baseline.md` file reappears. Rule 3 instructs a writer to
put content into a file the repo's own verifier forbids — the last live
`.baseline.md` reference in the tracked doc set outside `docs/backlog/`,
`docs/audits/`, and the design spec.

The same drift shows up in two more places: `docs/promotion-radar.json:259`
(the `segmented-toggle` `notes` field) describes the segmented-toggle
promotion as adding a "`.baseline.md` binding," and
`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md`'s
`donor-docs` phase verification is internally contradictory — step 3 requires
no live `.baseline.md` reference outside backlog/audits/spec, while step 4
requires rule 3 to be **byte-identical** to its pre-phase text, and that
pre-phase text is exactly the dangling reference step 3 forbids. Decision
`G3` in the same spec already resolves this the right way (residue "moves
into the primitive's JSDoc or its demo, never into the contract") — the spec
just never updated its own verification clause to match its own decision.

## What to do

- [ ] `docs/RULES.md:11` — keep rule 3's first sentence verbatim. Replace only
  the destination clause so primitive-named / class-string residue routes to
  the binding's live home: the primitive's JSDoc in
  `src/components/archetypes/<slug>/` or its gallery demo in
  `src/examples/<slug>-demo.tsx`. Keep the *Why* sentence, adjusting its
  trailing "defeating rule 2" reference so it still reads correctly against
  rule 2's current ("one contract plus the exported component") text.
- [ ] `docs/promotion-radar.json:259` — restate the segmented-toggle `notes`
  field's "`.baseline.md` binding" as the shipped typed export + gallery demo,
  so the radar does not describe a deliverable the repo now forbids.
- [ ] `docs/superpowers/specs/2026-08-17-archetype-convergence-design.md` —
  amend the `donor-docs` phase's verification step 4 (and decision `G3`'s
  "rule 3 is untouched" clause) to say rule 3's *invariant* is unchanged while
  its destination clause re-points at the primitive JSDoc/demo — the same
  residue home `G3` already prescribes. Do not weaken step 3.
- [ ] Before editing, grep every caller of the touched function / query
  pattern; fix at the shared point, not only the call site this report names.

## Acceptance

- `grep -rn 'baseline\.md' docs/ src/ CLAUDE.md README.md _adherence.json`
  returns hits only under `docs/backlog/`, `docs/audits/`,
  `docs/superpowers/`, and ADR-0004's unrelated
  `0030-vendor-stamp-design-baseline.md` citations — no other line, and no
  line instructing anyone to write into a `.baseline.md` sibling.
- `docs/RULES.md` rule 3's first sentence is unchanged; its destination names
  the primitive's JSDoc or the gallery demo.
- Spec steps 3 and 4 no longer demand mutually exclusive states; `G3` and
  step 4 agree with the shipped rule-3 text.
- `node scripts/verify-manifest-versions.mjs` passes, `node
  scripts/verify-exports.mjs` reports 7/7 ok, `node scripts/lint-design.mjs`
  reports 0 errors, `npx tsc --noEmit` and `npm test` pass, unchanged — this
  is a docs-only change; any movement there is a regression, not a result.

## Related

- [docs/backlog/archive/archetype-baseline-sibling-retire.md](../archive/archetype-baseline-sibling-retire.md) — the retirement this ticket's drift follows from
- [docs/backlog/archetype-convergence.md](../archetype-convergence.md) — parent roadmap, `donor-docs` phase
