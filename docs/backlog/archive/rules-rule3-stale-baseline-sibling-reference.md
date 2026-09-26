---
area: other
opened: 2026-09-13
status: done
closed: 2026-09-26
resolution: closed-subsumed
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-09-13T00:00:00Z
value: normal
model: sonnet
model_reason: mechanical text edit — target wording already exists verbatim in CLAUDE.md, no design judgment left
---

# Fix stale `.baseline.md` reference in `docs/RULES.md` rule 3

## Context

`docs/RULES.md:11` (hard rule 3) still reads: "**A contract file (`<slug>.md`) may never name a concrete primitive or a literal Tailwind class.** If a required/forbidden rule mentions a `src/components/...` import or a class string, it belongs in the `.baseline.md` sibling." The `.baseline.md` siblings were deleted repo-wide by `archetype-baseline-sibling-retire` (PR #255), and `scripts/verify-manifest-versions.mjs:63` now hard-fails if any `docs/archetypes/*.baseline.md` file re-appears. So rule 3 routes an author to a file class the project's own guard rejects — the last live `baseline.md` reference outside `docs/backlog/`, `docs/audits/` and `docs/superpowers/specs/` (verified via `grep -rn 'baseline\.md' docs/ src/ CLAUDE.md README.md _adherence.json`).

`CLAUDE.md`'s Project-Specific Notes already carries corrected wording: "the contract is role-only; the binding is the exported component ... Never fold Tailwind classes or `src/components/...` primitive names into a `<slug>.md` contract body" — `docs/RULES.md` is the one file left behind.

## What to do

- [ ] Rewrite only rule 3's second sentence in `docs/RULES.md` to name the surviving homes for role-to-primitive residue — the primitive's JSDoc in `src/components/archetypes/<slug>/` or its gallery demo in `src/examples/<slug>-demo.tsx` — matching `CLAUDE.md`'s framing rather than inventing new wording. Keep the first sentence and the *Why* clause intact.
- [ ] Scope the edit to `docs/RULES.md` only: do not touch rule 2, do not re-version any archetype, do not edit `docs/adr/0005-*.md`'s historical `FLEET-AUDIT.md` cross-reference (an ADR is a dated record, not a live instruction).

## Acceptance

- `grep -rn 'baseline\.md' docs/ src/ CLAUDE.md README.md _adherence.json` returns no hit outside `docs/backlog/`, `docs/audits/` and `docs/superpowers/specs/`.
- `docs/RULES.md` rule 3 still forbids primitive names and Tailwind classes in `<slug>.md`, and names JSDoc / the gallery demo (not `.baseline.md`) as where such detail belongs.
- `grep -rEn 'src/components/|\bbg-|\btext-(xs|sm|lg|xl)\b' docs/archetypes/*.md` still finds nothing outside `README.md` — no other archetype contract regressed while this edit was made.
- `node scripts/verify-manifest-versions.mjs` and `node scripts/verify-exports.mjs` (7/7 ok) still pass; `node scripts/lint-design.mjs` reports 0 errors.

## Related

- [archetype-baseline-sibling-retire.md](../archive/archetype-baseline-sibling-retire.md) — the PR (#255) that deleted the `.baseline.md` siblings this rule still references
- [style-archetypes-carry-baseline-sibling.md](../archive/style-archetypes-carry-baseline-sibling.md) — earlier ticket that taught tooling to carry the now-retired sibling
- `docs/ARCHITECTURE.md` §5 "The contract and its binding"

## Verdict — SUBSUMED (closed 2026-09-26)

Already discharged on `origin/main` by f931db0 (#260, "docs(rules): re-point rule 3's residue destination off the retired .baseline.md sibling"). Rule 3 now names the primitive's JSDoc in `src/components/archetypes/<slug>/` and the gallery demo in `src/examples/<slug>-demo.tsx`; first sentence and *Why* clause intact. `grep -rn '\.baseline\.md' docs/ src/ CLAUDE.md README.md _adherence.json` has no hit outside `docs/backlog/`, `docs/audits/`, `docs/superpowers/specs/`. The Acceptance grep's looser form also matches unrelated `style-baseline.md` / `reference_design_baseline.md` / `vendor-stamp-design-baseline.md` filenames in ADR-0004 and a dated plan — false positives, not sibling references. No code change.
