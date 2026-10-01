---
area: code-health
opened: '2026-10-01'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-10-01T15:47:02.113Z'
value: normal
model: sonnet
model_reason: >-
  a keep-or-delete call on one directory, then either a tsconfig include plus prop fixes or a
  deletion; scoped once decided
---

# Typecheck or delete the 91 drifting design-sync previews

## Context

`.design-sync/previews/` holds 91 hand-written `.tsx` previews of the shipped components for the `claude.ai/design` sync ([.design-sync/NOTES.md](/.design-sync/NOTES.md)). They are a second demo corpus alongside `src/examples/*-demo.tsx`, and nothing checks them:

- [tsconfig.json](/tsconfig.json) `include` lists `src/**/*`, `gallery/**/*` and the two vite configs, but not `.design-sync/`.
- Vitest and `scripts/lint-design.mjs` never touch the previews.
- The previews import from a bare `"design-baseline"` shim, so they get no type signal at all.

`git log -- .design-sync` puts the last real sync at `dd05523` (2026-07-03), followed only by two incidental edits on 2026-08-05 and 2026-08-27. Since then the package has had 200+ commits of v0.2.x API change, and the previews have already broken. [.design-sync/previews/DetailOverviewShell.tsx](/.design-sync/previews/DetailOverviewShell.tsx) lines 25 and 114 still pass `surface="unified"` and `surface="separated"`. `DetailOverviewShell` dropped that prop in `b1bda53` (2026-08-17, #122), when the ADR-0004 close-API work landed ([docs/RULES.md](/docs/RULES.md) rule 10). The next re-sync will either fail or publish a retired appearance axis. No `/promote-archetype` run or close-API change knows these files exist.

[docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md) §3 still lists `.design-sync/` as "Uncertain — not fully explored". The underlying question is whether the sync is alive. If it is not, the 91 files are dead weight that every API change would otherwise have to drag along.

If this finding is wrong, a type pass runs on the previews at sync time. Today `buildCmd` in `.design-sync/config.json` runs only `build-pkg.mjs` and the gallery build, with no typecheck of `previews/`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Decide whether the `claude.ai/design` sync is still used. Check the last sync date or ask the operator, then record the answer in `.design-sync/NOTES.md`.
- [ ] If the sync is dead: delete `.design-sync/` and its `.gitignore` block, and drop the `.design-sync/` row from `docs/ARCHITECTURE.md` §3.
- [ ] If the sync is alive: add `.design-sync/previews/**/*` to the tsconfig `include`, plus a `paths` mapping from `"design-baseline"` to the package entry points. Then fix every resulting error, starting with the retired `surface` prop in `DetailOverviewShell.tsx`.

## Acceptance

- Either `.design-sync/` no longer exists, or `npx tsc --noEmit` covers `.design-sync/previews/` and passes.
- No preview under `.design-sync/previews/` passes a prop that its current component does not declare, not only the `surface` prop on `DetailOverviewShell`.
- After the change, renaming or removing any shell prop fails the typecheck wherever a preview uses it.

## Related

- [.design-sync/previews/DetailOverviewShell.tsx](/.design-sync/previews/DetailOverviewShell.tsx): the confirmed stale `surface` usage.
- [docs/adr/0004-appearance-locality-derived-vs-inherited.md](/docs/adr/0004-appearance-locality-derived-vs-inherited.md): the decision that retired `surface`.
- [docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md): §3 lists the directory as uncertain.
