---
area: archetypes
opened: 2026-07-03
status: ready
model: sonnet
model_reason: scoped copy-logic change in two plugin skills, clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-03T15:50:00Z
---

# Teach /style-archetypes and /promote-archetype to carry the .baseline.md sibling

## Context

The `decouple-archetype-contract-from-reference-impl` feature split every archetype doc into a stack-agnostic contract (`docs/archetypes/<slug>.md`) and a baseline reference-implementation sibling (`docs/archetypes/<slug>.baseline.md`), recorded in `MANIFEST.json` as a new `reference_impl` field alongside `spec`. The archetypes `README.md` documents the two-file convention (including "what gets copied per archetype") as the intended behavior. But the `/style-archetypes` and `/promote-archetype` plugin skills are external to this repo and still only handle `docs/archetypes/<slug>.md` + `src/components/archetypes/<slug>/` — they don't yet carry the sibling. Until they catch up, a baseline-stack target that adopts an archetype gets the portable contract but not its reference-implementation binding doc.

## What to do

- [ ] `/style-archetypes`: add the entry's `reference_impl` file to the per-archetype copy set (alongside `spec` and `primitives_dir`), so baseline-stack targets receive `<slug>.baseline.md`.
- [ ] Preserve the non-baseline path: a target that only wants the portable contract can still take `<slug>.md` alone; the sibling is additive, never required to read the contract.
- [ ] `/promote-archetype` create path: author the `<slug>.baseline.md` sibling as a donor file (the de-source-ification step already separates primitives from contract — route the concrete primitives + class strings into the sibling).
- [ ] `/promote-archetype --update` path: diff the sibling too, not just the contract, when the source spec advances.
- [ ] Update the skills' own "what gets copied" documentation to match the archetypes README.

## Acceptance

- After `/style-archetypes <slug>` on a baseline-stack target, the target's `docs/archetypes/` contains both `<slug>.md` and `<slug>.baseline.md`, and `MANIFEST.json` merged the `reference_impl` field.
- `/promote-archetype <slug>` on a new archetype writes a `<slug>.baseline.md` donor file and a `reference_impl` MANIFEST entry.
- The archetypes README "what gets copied" paragraph no longer describes behavior the skills don't implement.

## Related

- [decouple-archetype-contract-from-reference-impl.md](wip/decouple-archetype-contract-from-reference-impl.md) — the split that created the siblings
- [style-baseline-stack-aware-preflight.md](style-baseline-stack-aware-preflight.md) — sibling stack-awareness work
- docs/archetypes/README.md — the two-file convention this ticket makes the skills honor

## Implementation note — the edits live OUTSIDE this repo

The two skills are **user-global command files**, not tracked in design-baseline:

- `~/.claude/commands/style-archetypes.md` — the per-slug copy set is its **Step 6**
  (`~line 185+`): the Python block that resolves `spec = $TARGET/docs/archetypes/<slug>.md`
  and copies it + `primitives_dir`. Add the `reference_impl` file to that copy set (copy
  `$BASELINE/docs/archetypes/<slug>.baseline.md` → `$TARGET/docs/archetypes/<slug>.baseline.md`
  when the MANIFEST entry has a `reference_impl`; skip silently if absent, so older
  entries don't break). The `--list` file-count check (`~line 81`) and the minor-update
  copy (`~line 137–140`) touch the same copy set — update all three call sites.
- `~/.claude/commands/promote-archetype.md` — the donor-write step (create path) and the
  `--update` diff step. Author/diff the `.baseline.md` sibling and stamp `reference_impl`
  into the MANIFEST entry it writes.

**Consequence for shipping:** because the skill files are global, the substantive edits
will **not** appear in this feat branch's diff. Use this worktree for (a) the backlog
wip→archive move, (b) any repo-side doc sync (README/PLUGIN-CONTRACT "what gets copied"),
and (c) **test evidence** — run `/style-archetypes <slug> --force` into a scratch target
and confirm both `<slug>.md` and `<slug>.baseline.md` land + the MANIFEST merges
`reference_impl`. The global edits are the real fix; the branch carries the proof + the
doc reconciliation. Recommended: make the global edits directly (that's the only place
they take effect), don't just document them.

## Resolution (2026-07-04)

Implemented directly in the **global** command files:

- `~/.claude/commands/style-archetypes.md` — Step 6 copy loop carries `<slug>.baseline.md` (guarded by `-f`: additive, silent-skip for sibling-less entries); Step 5 collision check flags the sibling so `--force` governs it; Step 4 minor-update copies it; Notes + Step 9 report document the two-file convention. The MANIFEST merge already propagated `reference_impl` unchanged (it merges the whole donor entry `{**prev, **a}`), so acceptance "MANIFEST merged the `reference_impl` field" needed no code change.
- `~/.claude/commands/promote-archetype.md` — 4b produces a role-only contract; new **4d′** authors the `.baseline.md` sibling; 4g stamps `reference_impl`; update path 5a reads the sibling, 5b routes each propagated change to contract-vs-sibling by kind, 5d writes to the routed file and self-heals `reference_impl` for pre-split entries; dry-run/report/Notes list it.

**Deliberate deviation from the note above:** the `--list` file-count (`~line 81`) was left unchanged. It counts *primitive* files in `primitives_dir` for the FILES column — it is a display hint, not part of the copy set — so adding the sibling there would muddy that column's meaning. `--list` writes nothing, so it has no bearing on acceptance.

Repo-side (this branch's diff): `docs/PLUGIN-CONTRACT.md` reconciled — its manifest-entry field list and archetype-bodies list now include `reference_impl` / the `.baseline.md` sibling. The archetypes README "what gets copied" paragraph was already ahead and is now accurate (the skills implement it).

**Test evidence:** copy logic + MANIFEST merge exercised into a scratch target — both `<slug>.md` and `<slug>.baseline.md` land and the entry carries `reference_impl` (settings-table + crud-dialog, ALL PASS); collision check includes the sibling; the `-f` guard skips silently for a sibling-less slug; the 5d self-heal backfills `reference_impl` on `--update`.
