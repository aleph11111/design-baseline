---
area: tooling
opened: '2026-09-13'
status: ready
value: normal
model: sonnet
model_reason: "mechanical deletion plus four located prose edits — the design decisions are all settled in the spec's H1/H3/H4/H6/H8"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-13T00:00:00Z'
roadmap: archetype-convergence
---

# Retire /adopt-baseline: delete the command, its mirror test, and its four donor doc sites

## Context

Part A of the `archetype-convergence` roadmap's `fleet-commands` phase. `/adopt-baseline`
(`coding-dashboard/fleet/commands/adopt-baseline.md`, 600 lines) is the one copy-distribution
command that is genuinely dead: its payload — the four methodology docs — has shipped inside the
package since the `docs-retire` phase (`package.json` `files`, resolving from
`node_modules/design-baseline/docs/`); `docs/ADOPTION.md`, the contract its step 3 vendored, was
deleted by `donor-docs` (G7); and its nine-point `ADOPTION-STATUS.md` checklist is scored
dashboard-side by `computeCompletionGate` (`server/methodologyAdoption.ts`), which reads the
repo's working tree, not the skill. Nothing it does still works.

`/style-baseline` and `/style-archetypes` are **not** in this ticket's scope — no consumer has
installed the package yet (`hk-crm` still carries 102 vendor stamps, 49 files in
`src/components/ui/`, 23 in `src/components/archetypes/`, and no `design-baseline` dependency), so
they remain the fleet's only live distribution channel. They retire in this phase's Part B, gated
on the first real install (`copy-channel-final-delete`).

## What to do

- [ ] Delete `coding-dashboard/fleet/commands/adopt-baseline.md`, then run `bash fleet/install.sh`.
      Do **not** `rm` the `~/.claude/commands/adopt-baseline.md` symlink by hand —
      `fleet/install.sh:474-495` reaps a dangling managed link itself and prints
      `unlinked  commands/adopt-baseline.md (dangling — its mirror file was deleted)`.
- [ ] Delete `coding-dashboard/server/methodologyAdoption.test.ts:283-308` (the test
      `"computeCompletionGate — gate order matches the /adopt-baseline --adopt script"`). Delete it,
      do not re-home it onto an inline gate list: it `readFile`s the command and diffs its
      `# Gate N (name):` headers against `computeCompletionGate`'s array — one invariant stated
      twice, the mirror class this roadmap exists to kill (spec decision H4), and its subject
      (`ADOPTION-STATUS.md`'s numbering) has no writer once the skill is gone.
- [ ] One edit pass over `coding-dashboard/fleet/commands/promote-archetype.md`, sites `:5`, `:571`,
      `:917-918`: re-point its *"After promotion, the archetype ships with /style-archetypes to new
      projects"* framing at the package, and replace its step-9 verification (*"Test apply:
      /style-archetypes <slug> in a fresh /style-baseline-applied project"*) with `npm pack --dry-run`
      plus the gallery demo — the binding `donor-docs` made authoritative.
- [ ] Donor doc pass, four located sites: `CLAUDE.md:26` and `docs/README.md:16` drop
      `/adopt-baseline` from the `design:` key's machine-reader list; `docs/PACKAGE.md:268-271` turns
      its *"until `fleet-commands` removes `/adopt-baseline`"* caveat into the fact and its
      `ADOPTION-QUALITY.md, ADOPTION-STATUS.md` ownership row loses its forward tense;
      `scripts/lint-design.mjs:5` re-points its wiring owner at `PACKAGE.md`'s runbook.

Explicitly out of scope: `computeCompletionGate` / `scanMethodologyAdoption` themselves (they scan a
working tree and all four consumers are still copy-vendored — spec decision H5), every
`/style-baseline` and `/style-archetypes` reference anywhere (H9), and `docs/adr/0002`, `0003`,
`INDEX.md` — an ADR records what was decided then (H8).

## Acceptance

- `ls ~/Documents/dev/coding-dashboard/fleet/commands/` lists eleven files and no
  `adopt-baseline.md`; `ls ~/.claude/commands/adopt-baseline.md` fails.
- `bash fleet/install.sh --check` exits 0 — no `UNMIRRORED` row, no dangling managed link left.
- `npm test` in `coding-dashboard` passes, and `grep -rn 'adopt-baseline' server/` shows no
  `readFile` of a command path — every other remaining hit is a comment, not a file read.
- `grep -rn 'style-baseline\|style-archetypes' fleet/commands/promote-archetype.md` is empty and its
  step-9 verification names `npm pack --dry-run`.
- `grep -rn 'adopt-baseline' CLAUDE.md docs/README.md docs/PACKAGE.md scripts/lint-design.mjs` in the
  donor returns nothing, while the same grep over `docs/adr/` still returns all four of its
  historical citations — their survival is the check, not their absence.
- Donor gates unchanged: `npx tsc --noEmit` clean, `node scripts/lint-design.mjs` 0 errors,
  `node scripts/verify-exports.mjs` 7/7 ok, `node scripts/verify-manifest-versions.mjs` ok.

## Related

- [[archetype-convergence]] — the roadmap; this is phase `fleet-commands`, Part A. Spec section
  `## Phase fleet-commands — retire the copy channel, one part now and one gated`, decisions
  H1/H3/H4/H6/H8.
- [[copy-channel-final-delete]] — Part B, gated on the first package install; it is what deletes
  `/style-baseline`, `/style-archetypes` and the dashboard machinery this ticket deliberately keeps.
- [package-doc-retirement-ownership-and-runbook-step.md](../archive/package-doc-retirement-ownership-and-runbook-step.md)
  — wrote `PACKAGE.md:268-271`'s forward reference this ticket pays off.
- [package-ships-contracts-and-plugin-actions.md](../archive/package-ships-contracts-and-plugin-actions.md)
  — `donor-docs` G6 already dropped `/style-*` from `plugin.actions`, so no manifest advertises a
  command this ticket deletes.
- ADR-0002 — adopt the baseline-upstream methodology docs (the decision `/adopt-baseline`
  implemented; not edited here).
