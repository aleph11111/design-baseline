---
area: tooling
opened: '2026-09-11'
status: done
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "leaf-component scope resolved to a default, not confirmed interactively — readiness capped at 4"
graded_at: 2026-09-11T00:00:00Z
model: sonnet
model_reason: "pattern-following consolidation with grounded acceptance criteria; the one real design fork (leaf-component scope) is pre-resolved to a Recommended default below"
value: normal
---

# Collapse the five duplicated shell-`className` adherence rules into one generic rule

## Context

`_adherence.json` carries five rule ids that all enforce the same policy — "an archetype's outer shell must not expose a `className?: string` escape hatch" (RULES.md hard rule 12, ADR-0004) — at different scopes: `archetype-shell-class-name` (generic, `include: ["src/components/archetypes/**/*Shell.tsx", "**/*Sheet.tsx", "src/components/layout/**/*Shell.tsx", "**/*Sheet.tsx"]`), `detail-overview-shell-class-name`, `form-page-shell-class-name`, `list-with-detail-shell-class-name` (each scoped to a single `*Shell.tsx` file), and `crud-dialog-shell-class-name` (scoped to the whole `src/components/archetypes/crud-dialog/**` folder). This was filed in mistra as `refactor-adherence-shell-classname-rule-five-copies` and discarded there as misfiled — mistra's spec D3 superset clause forbids dropping donor rules locally, and every consumer imports these rules verbatim, so the collapse has to land in this donor repo first before mistra/hk-crm/controlling-app/brickshop can re-adopt it.

Correction to the originating finding, verified against this repo's `_adherence.json` on 2026-09-11: all five rules already share the identical anchor `^\s{0,2}className\?\s*:` — PR #127 ("drain the `*Shell` className escape hatch across the remaining shells") normalized the three per-archetype copies onto the generic rule's `{0,2}` anchor a while ago, so the anchor drift the mistra finding described no longer exists. The live duplication is scope-only: `detail-overview-shell-class-name`, `form-page-shell-class-name`, and `list-with-detail-shell-class-name` are each fully subsumed by the generic rule's `*Shell.tsx` include glob. `crud-dialog-shell-class-name`'s folder-wide scope is *not* fully redundant, but its real contribution is narrower than "the shell isn't named `*Shell.tsx`" — `CrudDialogSheet.tsx` already matches the generic rule's `*Sheet.tsx` glob; the actual gap is `CrudDialogBody.tsx`, `CrudDialogHeader.tsx`, and `CrudDialogFooter.tsx`, none of which are `*Shell`- or `*Sheet`-named.

Separately, `detail-overview`'s four leaf components — `DetailSection.tsx`, `KeyValueRow.tsx`, `KeyValueList.tsx`, `DetailOverviewHeader.tsx` — each declare `className?: string;` at indent 2, unguarded by any rule today (only `DetailOverviewShell.tsx` itself is scoped). This is a real design fork, not a grounded consequence of existing rules: rule 12's own text pins the ban to "a shell `className`" (the archetype's outer wrapper), and the codebase's general convention is that composable leaf primitives (`SectionCard`, `SurfaceFrame`) legitimately take a pass-through `className`. Resolved below to the option consistent with that existing convention and with rule 12's own wording — see `## Open question` for the alternative, since this wasn't confirmed interactively (no `AskUserQuestion` available in this run).

Also worth correcting: `/adopt-baseline`'s `--update`/`--force` path (`~/.claude/commands/adopt-baseline.md`) recopies `scripts/lint-design.mjs`, `_adherence.json`, and `_adherence.NOTES.md` **unconditionally** — unlike the four methodology docs, there is no per-file `version:`/`vendored:` staleness key for the adherence-lint mechanism. So there is nothing to "bump" for consumers to pick up the collapse; their next plain `/adopt-baseline --update` already re-copies the whole file.

## What to do

- [ ] Extend `archetype-shell-class-name`'s `include` array with `src/components/archetypes/crud-dialog/**` (folder-wide, to cover `CrudDialogBody.tsx`/`CrudDialogHeader.tsx`/`CrudDialogFooter.tsx` — non-`*Shell`/`*Sheet`-named) and fold the crud-dialog folder-wide rationale (currently in `crud-dialog-shell-class-name`'s message) into `archetype-shell-class-name`'s message.
- [ ] Delete the four subsumed rule ids from `_adherence.json`: `detail-overview-shell-class-name`, `form-page-shell-class-name`, `list-with-detail-shell-class-name`, `crud-dialog-shell-class-name`.
- [ ] Keep the `^\s{0,2}` anchor on the surviving rule (already the current pattern on all five — no anchor edit needed) and record in the message that this was already the normalized anchor as of PR #127, so a future reader doesn't reintroduce `^\s*`.
- [ ] Leave the detail-overview leaf components (`DetailSection`, `KeyValueRow`, `KeyValueList`, `DetailOverviewHeader`) out of `archetype-shell-class-name`'s scope — their `className?: string` is a composable-leaf pass-through prop, not the archetype's outer-shell escape hatch rule 12 targets — and add one sentence to the surviving rule's message saying so explicitly, so the gap reads as a decision rather than an oversight.
- [ ] Update `_adherence.NOTES.md`'s per-rule ledger: remove the four deleted rows (`detail-overview-shell-class-name` line ~174, `form-page-shell-class-name` line ~189, `list-with-detail-shell-class-name` line ~226, and the `crud-dialog-shell-class-name` row) and update `archetype-shell-class-name`'s row (line ~105) to note the added `crud-dialog/**` folder coverage.
- [ ] No `_adherence.json` version-stamp bump is needed — `/adopt-baseline --update` recopies the file unconditionally (no per-file staleness key exists for it); mistra/hk-crm/controlling-app/brickshop pick up the collapse on their next plain `--update` run.

## Acceptance

- Exactly one rule id in `_adherence.json` ends in `class-name` after the change.
- `node scripts/lint-design.mjs` run on this repo prints the same summary line as before the change (coverage is preserved, not narrowed).
- A `className?: string` added at indent 2 to `CrudDialogBody.tsx`, or to any `*Shell.tsx`, still fails the lint (`severity: error`) after the collapse.
- Every `className` rule pattern in `_adherence.json` uses the one `^\s{0,2}` anchor — no rule regresses to `^\s*`.

## Related

- [archetype-shell-classname-drop.md](../archive/archetype-shell-classname-drop.md) — the phase that introduced the per-archetype rules being collapsed here.
- [ADR-0003](../../adr/0003-adherence-lint-zero-dep-scanner.md) — adherence lint ships as a zero-dep scanner; governs how rule scope/anchor changes are made.
- `docs/RULES.md` hard rule 12 (appearance locality — derived vs. inherited; the shell-`className` escape-hatch clause this whole rule family enforces).

## Open question

Should the detail-overview leaf components (`DetailSection`, `KeyValueRow`, `KeyValueList`, `DetailOverviewHeader`) be brought into the `className` ban by adding `src/components/archetypes/detail-overview/**` to the surviving rule's `include`, or left out of scope as composable-leaf pass-through props (current default above)?

- **Recommended (applied above):** leave them out of scope. Rule 12's own message text pins the ban to "a shell `className`" — the archetype's outer wrapper — and the existing codebase convention (`SectionCard`, `SurfaceFrame`) is that composable leaf primitives legitimately accept a pass-through `className`. Widening to leaf components would be a scope *expansion* beyond what this ticket's collapse asks for, and would require migrating four call sites' existing `className` usage away from a currently-legal prop.
- **Alternative:** add `detail-overview/**` to `include`, treating any `className?: string` in the whole detail-overview directory — leaf or shell — as the same escape hatch. This is defensible if the intent of rule 12 is read as "no archetype composition, shell or leaf, exposes an unenumerable style hatch," but it isn't grounded in the rule's current wording and wasn't confirmed with the user in this filing.
