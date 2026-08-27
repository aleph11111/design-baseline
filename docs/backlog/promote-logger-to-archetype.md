---
area: tooling
opened: '2026-08-27'
status: needs-enrichment
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

- [ ] Read the `over-engineering-logger-passthrough-facade` fleet grep results (its `## Fleet grep results` section) and confirm the `info`/`warn`/`debug` call-site counts still hold against `brickshop-manager` before deciding.
- [ ] Decide the vehicle: (a) re-adopt a multi-level `src/utils/logger.ts` in the donor and re-point `docs/STYLE.md` + `docs/ARCHITECTURE.md` §3 at the widened surface, or (b) confirm the trimmed `error` + `debug` surface is the donor's and record that `brickshop-manager`'s `info`/`warn` callers are out-of-scope for the donor (migrated locally or to a project-owned logger).
- [ ] If the answer is (b), open a scoped note (or ticket) in `brickshop-manager` for migrating its 9 `logger.info` + 2 `logger.warn` call sites — do not do that migration from this donor repo.
- [ ] If the answer is (a), state where a *utility* (not a page archetype) versions and syncs to downstream copies in `docs/ARCHITECTURE.md`, so the next `/style-baseline` run delivers the widened surface instead of a stale one.

## Acceptance

- ? A decision is recorded here (or its follow-up) naming either (a) or (b) and stating the fleet outcome for `brickshop-manager`'s `info`/`warn` callers.
- If (b): `src/utils/logger.ts` no longer exports `info`/`warn` and `brickshop-manager` has a named follow-up covering its `info`/`warn` call sites.
- If (a): `src/utils/logger.ts` exports the full four-level surface and the `docs/` logger references are updated to match.

## Related

- [over-engineering-logger-passthrough-facade](archive/over-engineering-logger-passthrough-facade.md) — the donor cut this defers to; its `## Fleet grep results` table is the evidence this ticket decides against.
- [src/utils/logger.ts](../../src/utils/logger.ts) — the copy-source util in question.
- [src/components/ui/error-boundary.tsx](../../src/components/ui/error-boundary.tsx) — the sole donor importer, on `logger.error`.

## Open question

- Is a framework-agnostic leaf utility even *supposed* to version through an archetype/MANIFEST vehicle, or does the baseline have a (missing) mechanism for versioning `src/utils/` leaf files? The current architecture documents archetype versioning only — there is no documented path for a `src/utils/` util to carry a per-file version the way MANIFEST entries do — so part of this ticket may be "the baseline has no utility-versioning story, and that's the gap to close."
