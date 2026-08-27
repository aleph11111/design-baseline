---
area: over-engineering
opened: '2026-08-26'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-26T17:17:19.296Z'
model: sonnet
model_reason: >-
  single-file deletion with one thing to confirm first (that the sandbox demo covers the same
  contract surface) — mechanical
---

# Delete the one-off matrix-grid donor-fit type assertion file

## Context

`src/examples/matrix-grid-donor-fit.ts` (88 lines) is a type-only file whose own header states: *"This file is not exported anywhere; it exists purely so `tsc --noEmit` breaks if the shell's public contract drifts away from the original donor."* It declares frozen copies of hk-crm's private types — `DonorMatrixCell` with fields `filled` / `menge` / `assignmentCount`, mirrored from `hk-crm/src/lib/matrix.ts` and `src/db/queries/matrix.ts` — and assigns them into a `MatrixGridShellProps<DonorMatrixCell>` literal that also carries hk-crm's German UI strings (`rowHeaderLabel: "Unternehmen"`).

Nothing references it: `grep -rn "matrix-grid-donor-fit" src gallery docs` returns no matches. It participates only by sitting inside `tsconfig.json`'s `include`.

It is the **only** file of its kind — no other one of the 21 archetypes has a donor-fit file, and the promotion methodology never asked for one. What it guards is already guarded, twice over and better: RULES.md hard rules 6 and 7 make the *sandbox second-consumer demo* the contract for genericness ("the sandbox demo domain must use completely different nouns from the source project", "a baseline primitive's TypeScript must compile against zero domain types … verified mechanically by the sandbox second-consumer demo compiling clean"), and `src/examples/matrix-grid-demo.tsx` (367 lines) is that demo. A domain-far demo proves the primitive accepts *arbitrary* shapes; a frozen copy of one source project's shapes proves only that it still accepts the shape it was extracted from — a strictly weaker check, and one that pulls the source project's vocabulary back into the donor the promotion flow's de-source-ification step exists to strip.

Concretely, it is 88 lines of dead-by-design code whose failure mode is misleading: if `MatrixGridShellProps` were tightened for a good reason, this file breaks the donor typecheck on behalf of a consumer whose real types have since moved on (it says so — "kept frozen here"), pointing the next engineer at hk-crm's 2026 shapes rather than at the archetype contract.

## What to do

- [ ] Confirm `src/examples/matrix-grid-demo.tsx` exercises the same `MatrixGridShellProps` surface the donor-fit file asserts — `columns`, `rows`, `rowHeaderLabel`, `isFilled`, `renderCell`, `cellStyle`, `onCellClick` — and extend the demo with whichever of those props it does not already pass.
- [ ] Delete `src/examples/matrix-grid-donor-fit.ts`.
- [ ] Check `docs/archetypes/matrix-grid.baseline.md` and the MANIFEST `M` entry for a reference to the file and remove it if present; do not add a reference to the contract `docs/archetypes/matrix-grid.md` (RULES.md hard rule 3 forbids naming primitives or source paths there).
- [ ] If a per-archetype trial-migration check is judged worth keeping as a pattern, record it in `docs/archetypes/README.md` as a methodology step for **all** archetypes rather than leaving one archetype with an undocumented extra artifact — but do not add 20 more of these files as part of this ticket.

## Acceptance

- `src/examples/matrix-grid-donor-fit.ts` no longer exists and `grep -rn "donor-fit" src docs` returns no matches.
- `npx tsc --noEmit` passes, and `src/examples/matrix-grid-demo.tsx` still passes every prop the deleted file asserted, so a tightening of `MatrixGridShellProps` still breaks the typecheck through the demo.
- `grep -rn "Unternehmen\|menge" src` returns no matches — no hk-crm domain vocabulary remains in the donor's example surface.
- `npm test` passes and the matrix-grid demo still renders in `npm run gallery:build`.

## Related

- [docs/RULES.md](../../RULES.md) — hard rules 6 and 7: the sandbox demo, with domain-far nouns, is the sanctioned genericness proof this file duplicates weakly.
- [archive/refactor-matrix-grid-cell-and-head-extraction.md](../archive/refactor-matrix-grid-cell-and-head-extraction.md) — the most recent change to `MatrixGridShell`'s internals, the contract this file claims to guard.
- [archive/layout-primitives-hardcoded-german.md](../archive/layout-primitives-hardcoded-german.md) — the prior sweep for source-project German strings in the donor; this file still carries one.
- [src/examples/matrix-grid-donor-fit.ts](../../src/examples/matrix-grid-donor-fit.ts) — the file to delete.
