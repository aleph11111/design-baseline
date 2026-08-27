---
area: tooling
opened: '2026-08-27'
status: done
gate:
  score: 4
  passed:
    - title
    - context
    - what-to-do
    - related
  failed:
    - acceptance: "design decision, not yet a testable assertion — the versioning model is open"
  graded_at: '2026-08-27T00:00:00Z'
model: opus
model_reason: >-
  versioning/ownership decision with a real tradeoff (donor ships multi-level util vs fleet
  migrates off it) — a design call, not a mechanical cut
---

# Decide the versioning vehicle for the multi-level logger util

## Context

`src/utils/logger.ts` is copy-source: `/style-baseline` ships it to downstream projects, so each consumer holds an un-versioned, drifting copy. The donor-side cut from `over-engineering-logger-passthrough-facade` left the surface at `error` + (gated) `debug`. A read-only fleet grep (recorded in that ticket, 2026-08-27) found the copy genuinely in use by `brickshop-manager` — 44 importer files across 158 `logger.debug` + 21 `logger.error` + 9 `logger.info` + 2 `logger.warn` call sites — while `controlling-app` carries an orphaned copy with zero importers and the other fleet repos (`hk-crm`, `mistra`, `my-finance-app`, `pmo`, `coding-dashboard`) have none.

So the question this deferred is not "does the donor use it" (it does not — `ui/error-boundary.tsx` is the only donor importer, on `error`) but "should a multi-level console logger be a first-class, versioned part of what the baseline ships, and if so through which vehicle?" The naive answer — "promote it as an archetype" — is a poor fit, because the archetype/MANIFEST mechanism (`docs/archetypes/`, `src/components/archetypes/<slug>/`, the four-cross-archetype methodology) is built for page-shape contracts (list/form/kanban/report) plus their reference primitives, not for framework-agnostic leaf utilities under `src/utils/`. Filing it under that vehicle would mislabel the MANIFEST. The honest fork is either (a) the donor re-adopts the full `info`/`warn`/`debug`/`error` surface because real fleet demand justifies it, or (b) the donor stays trimmed to `error` + `debug` and the fleet's `info`/`warn` callers in `brickshop-manager` are migrated to the levels it keeps (or its own logger) — in which case this ticket closes the loop by saying so.

## What to do

- [x] Read the `over-engineering-logger-passthrough-facade` fleet grep results (its `## Fleet grep results` section) and confirm the `info`/`warn`/`debug` call-site counts still hold against `brickshop-manager` before deciding.
- [x] Decide the vehicle: (a) re-adopt a multi-level `src/utils/logger.ts` in the donor and re-point `docs/STYLE.md` + `docs/ARCHITECTURE.md` §3 at the widened surface, or (b) confirm the trimmed `error` + `debug` surface is the donor's and record that `brickshop-manager`'s `info`/`warn` callers are out-of-scope for the donor (migrated locally or to a project-owned logger).
- [x] ~~If the answer is (b), open a scoped note (or ticket) in `brickshop-manager` for migrating its 9 `logger.info` + 2 `logger.warn` call sites — do not do that migration from this donor repo.~~ (n/a — answer was (a))
- [x] If the answer is (a), state where a *utility* (not a page archetype) versions and syncs to downstream copies in `docs/ARCHITECTURE.md`, so the next `/style-baseline` run delivers the widened surface instead of a stale one.

## Decision (2026-08-27) — (a), and the vehicle is "no vehicle"

**Answer: (a).** The donor re-adopts `info`/`warn`. `src/utils/logger.ts` exports the full
four-level surface again. `brickshop-manager` needs no migration and gets no follow-up.

### Re-verified fleet counts (read-only, 2026-08-27, post-cut)

The predecessor's numbers had drifted **upward** — brickshop is still actively adding these calls,
which is what settles the fork:

| | predecessor grep | now |
|---|---|---|
| importer files | 44 | 45 |
| `.debug` | 158 | 158 |
| `.error` | 21 | 23 |
| `.info` | 9 | **14** |
| `.warn` | 2 | **5** |

Option (b) would have meant migrating 19 call sites that are still being written. Option (a) is
8 lines.

### The finding that actually decided it

`/style-baseline` step 4 (`fleet/commands/style-baseline.md:145`) copies this file
**unconditionally**:

```bash
cp "$BASELINE/src/utils/logger.ts" "$SRC/utils/logger.ts"
```

The pre-flight collision check (step 3) only stops the run when `--force` is absent. So the next
`/style-baseline --force` in `brickshop-manager` would have overwritten its four-method copy with
the donor's two-method one and broken 19 call sites at typecheck. That is a live hazard on the
documented re-apply path, not a hypothetical — and it inverts the predecessor ticket's reasoning:
a pass-through with no donor call site is not dead weight, it is the thing keeping a downstream
consumer compiling.

### The open question, answered

> Is a framework-agnostic leaf utility supposed to version through an archetype/MANIFEST vehicle,
> or does the baseline have a missing utility-versioning story?

**Neither. It needs no version, and the gap is smaller than filed.**

- **Not an archetype.** The ticket's premise that MANIFEST is page-shape-only is stale — it already
  carries 7 `kind: component` and 6 `kind: methodology` entries. But logger still doesn't fit: no
  gallery demo, no page-shape contract, nothing for a `<slug>.md` / `<slug>.baseline.md` pair to
  say. A MANIFEST entry would be a label with no content behind it.
- **Not `plugin.version` either.** Per `docs/PLUGIN-CONTRACT.md` § Versioning that field versions
  the *hub contract shape*, not shipped content — it is not a util version by another name.
- **What governs it instead is an invariant, not a number:** the donor's exported surface for a
  copy-source util must be a **superset** of what the fleet calls, because the copy is
  unconditional. Narrowing an export doesn't deprecate a downstream caller, it breaks it. Recorded
  in `docs/ARCHITECTURE.md` §3a and `docs/STYLE.md` § "Donor file scope".

Building per-file version machinery for one leaf util would be motion without a problem: there is
one sync mechanism (`/style-baseline`) and one direction (donor → target). The superset rule is
the whole story.

### Not re-added: the delegation tests

`src/utils/logger.test.ts` keeps only the `debug` tests. The predecessor deleted the
`it.each(levels)` block because an assertion whose body is "the wrapper calls the identically named
`console` method" restates the implementation — that reasoning survives this reversal untouched.
`info`/`warn` are trivial pass-throughs and get no test; `debug` has the only logic and keeps its
coverage.

### Follow-up filed

The clobber hazard is general — `/style-baseline --force` silently overwrites *any* target-local
divergence in a copied util, and only logger got lucky enough to be noticed. Filed separately
against `coding-dashboard` (which owns `fleet/commands/style-baseline.md`).

## Acceptance

- [x] A decision is recorded here naming (a), and stating the fleet outcome for
  `brickshop-manager`'s `info`/`warn` callers: **no migration — the donor re-supplies both levels.**
- [x] `src/utils/logger.ts` exports the full four-level surface (`debug`, `info`, `warn`, `error`).
- [x] The `docs/` logger references match: `docs/ARCHITECTURE.md` §3 row + new §3a, `docs/STYLE.md`
  § Utils + § "Donor file scope".
- [x] `npx tsc --noEmit` clean; `npm test` 329/329 passing.

## Related

- [over-engineering-logger-passthrough-facade](../archive/over-engineering-logger-passthrough-facade.md) — the donor cut this defers to; its `## Fleet grep results` table is the evidence this ticket decides against.
- [src/utils/logger.ts](../../../src/utils/logger.ts) — the copy-source util in question.
- [src/components/ui/error-boundary.tsx](../../../src/components/ui/error-boundary.tsx) — the sole donor importer, on `logger.error`.

## Open question

- Is a framework-agnostic leaf utility even *supposed* to version through an archetype/MANIFEST vehicle, or does the baseline have a (missing) mechanism for versioning `src/utils/` leaf files? The current architecture documents archetype versioning only — there is no documented path for a `src/utils/` util to carry a per-file version the way MANIFEST entries do — so part of this ticket may be "the baseline has no utility-versioning story, and that's the gap to close."
