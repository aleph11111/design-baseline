---
area: archetypes
opened: 2026-09-06
status: ready
value: normal
model: opus
model_reason: "exhaustive keying-rule verification plus a message-carrying lint-exclude change is design judgment, not pattern-following (mirrors archetype-convergence-form-page-width-prop's model_reason)"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-09-06T00:00:00Z
---

# Close report's `width` and calendar's `tone` appearance-prop lint warnings

## Context

`node scripts/lint-design.mjs` reports two remaining warn hits on the grandfathered `authored` page archetypes (`docs/adr/0001-grandfather-authored-report-calendar.md`): `archetype-look-union-prop` on `src/components/archetypes/report/ReportShell.tsx:24` (`width?: "sm" | "md" | "lg"`) and `archetype-appearance-noun-prop` on `src/components/archetypes/calendar/CalendarShell.tsx:29` (`tone?: CalendarEventTone` on the `CalendarEvent` item type). Per ADR-0004 / RULES.md hard rule 12, a per-call-site prop survives only if the archetype contract carries an exhaustive decision rule keying its value to the entity or its data — the same "keep but key" resolution `archetype-convergence-form-page-width-prop.md` already applied to form-page's own width prop, whose `_adherence.json` exclude entries name the contract clause in the rule `message`.

`docs/archetypes/report.md:97` currently states only a SHOULD checklist line — "`width` matched to the document's column count (`md` default; `lg` for wide statements)" — which doesn't even enumerate `sm` (the code's own JSDoc at `ReportShell.tsx:19-24` already documents `sm` as "a compact receipt / short Beleg", `md` as the ~700px default column, `lg` as "a wide statement with many columns"). That JSDoc is the real keying knowledge; it needs to move into the contract body as a decision rule, not stay a checklist item.

`docs/archetypes/calendar.md:186` states "the consumer maps its domain status onto a tone; the shell owns the tone → token translation" and enumerates the four `CalendarEventTone` values (`default | success | info | warning`, `CalendarShell.tsx:18`) with their token treatment, but does not enumerate which domain status maps to which tone — and `tone?: CalendarEventTone` (`CalendarShell.tsx:29`) has no explicit default in the type, though the tone-resolution code likely falls back to `default` when unset, which ADR-0004 calls out as independently disqualifying ("A backwards-compatible default is disqualifying on its own"). This needs verifying against the actual chip-rendering code before deciding whether calendar's `tone` can be kept-and-keyed the same way, or must be deleted.

## What to do

- [ ] Read `CalendarShell.tsx`'s tone-resolution code (`TONE_CLASS` / chip rendering) to confirm whether an omitted `tone` silently resolves to `default` — if so, that default is disqualifying per ADR-0004 and the prop must be deleted rather than excluded, per the ticket's own fallback branch.
- [ ] If the tone default is not disqualifying (e.g. `tone` becomes required, or `default` is itself named as the contract's answer for "no domain status"), promote `docs/archetypes/calendar.md:186` into a real keying rule enumerating which domain status yields which of the four `CalendarEventTone` values, exhaustively — a mapping the contract can state as a rule even though the domain-status vocabulary is per-consumer (e.g. "a status the consumer's own domain marks as failed/blocked → `warning`"; keep this abstract, per RULES rule 3, no primitive/Tailwind names).
- [ ] Promote `docs/archetypes/report.md:97` from a checklist line into a Layer/contract-body decision rule stating which document shape yields `sm`, `md`, and `lg` (mirror the JSDoc at `ReportShell.tsx:19-24`: `sm` = compact receipt / short Beleg, `md` = standard document column (default), `lg` = wide statement with many columns), dropping the "`md` default" framing that presents it as inherited rather than derived.
- [ ] If report's `width` keying rule can be written honestly (it already can, per the JSDoc), add `src/components/archetypes/report/**` to `archetype-look-union-prop`'s `exclude` in `_adherence.json`, extending the rule's `message` to name `docs/archetypes/report.md`'s new keying-rule clause — mirror how `form-page` was added to that same exclude list.
- [ ] If calendar's `tone` keying rule can be written honestly, add `src/components/archetypes/calendar/**` to `archetype-appearance-noun-prop`'s `exclude` in `_adherence.json`, extending the rule's `message` to name `docs/archetypes/calendar.md:186`'s (and the new enumeration's) clause.
- [ ] If instead either review shows no honest keying rule exists, delete that prop from the component, fix the value directly (report: pick one width; calendar: resolve tone without a per-item override), and update `src/examples/report-demo.tsx` / `src/examples/calendar-demo.tsx` and the corresponding shell's tests accordingly.
- [ ] Bump `docs/archetypes/report.md` and/or `docs/archetypes/calendar.md` frontmatter `version` and their MANIFEST entries' `version` — minor if only a keying rule was added (backward-compatible per `docs/archetypes/README.md`'s Versioning table), major if a prop was deleted (breaking) — keeping each pair's major aligned per that same table.
- [ ] Keep both MANIFEST entries' `authored_reason` text intact (both are grandfathered `authored` entries per `docs/adr/0001-grandfather-authored-report-calendar.md`).

## Acceptance

- [ ] `node scripts/lint-design.mjs` reports zero `archetype-look-union-prop` hits naming `report/` and zero `archetype-appearance-noun-prop` hits naming `calendar/`.
- [ ] If kept: `docs/archetypes/report.md` states, in the contract body (not a checklist), which document shape yields each `width` value, exhaustively covering `sm`/`md`/`lg`; `docs/archetypes/calendar.md` states which domain status yields each `CalendarEventTone` value, exhaustively covering all four.
- [ ] Every `_adherence.json` exclusion added carries, in the rule's `message`, the contract clause that justifies it (matching the pattern already used for `form-page`'s exclusion entries).
- [ ] Neither contract names a primitive or a Tailwind class (RULES.md hard rule 3).
- [ ] `npx tsc --noEmit` and `npm test` pass.
- [ ] MANIFEST versions for `report` and/or `calendar` are bumped to match whichever of the two branches above was taken, majors aligned between spec frontmatter and MANIFEST entry.

## Related

- [archetype-convergence-form-page-width-prop.md](../archive/archetype-convergence-form-page-width-prop.md) — the precedent this ticket mirrors: kept-but-keyed width prop, message-carrying `_adherence.json` exclude, spec+MANIFEST version pairing.
- [archetype-convergence-appearance-prop-lint.md](../archive/archetype-convergence-appearance-prop-lint.md) — added the path-scoping capability to `scripts/lint-design.mjs`'s exclude handling this ticket reuses.
- [archetype-shell-classname-drop.md](../archive/archetype-shell-classname-drop.md) — sibling precedent for a `*Shell.tsx` appearance-prop cleanup on already-shipped archetypes.
- ADR-0004 (`docs/adr/0004-appearance-locality-derived-vs-inherited.md`) — the derived-vs-inherited rule this ticket applies.
- ADR-0001 (`docs/adr/0001-grandfather-authored-report-calendar.md`) — governs why report/calendar are `authored` rather than `promoted_from`, and that their `authored_reason` must stay intact.
- [archetype-convergence.md](../archetype-convergence.md) — the roadmap that established this appearance-locality enforcement pattern (report/calendar are not in its `scope`, but this ticket applies the same rule set).
</content>
