---
area: archetypes
opened: '2026-09-06'
status: ready
value: normal
model: opus
model_reason: "extending a regex scanner's type-alias pre-pass plus a contract-promotion-and-exclude triage is design judgment, not pattern-following (mirrors report-calendar-appearance-prop-lint's model_reason)"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-09-06T00:00:00Z'
---

# Widen appearance-prop adherence lint past inline quoted-string unions

## Context

`_adherence.json`'s `archetype-look-union-prop` rule (added by
[archetype-convergence-appearance-prop-lint](archive/archetype-convergence-appearance-prop-lint.md))
matches only an inline union of quoted string literals on one line
(`^\s*\w+\??:\s*"a"\s*\|\s*"b"`), so `node scripts/lint-design.mjs` currently
reports zero hits under `src/components/archetypes/**` for two shapes of the
same RULES.md hard rule 12 defect that already exist in the tree:

- **Aliased unions** — `src/components/archetypes/entity-circle/EntityAvatar.tsx:14`
  declares `size?: EntityAvatarSize`, where `EntityAvatarSize = "xs" | "sm" | "md"`
  is a type alias at `EntityAvatar.tsx:5` in the same file. `entity-circle` is a
  `kind: "component"` MANIFEST entry (`docs/archetypes/MANIFEST.json:363`), so
  ADR-0004's amendment ("a `kind: 'component'` archetype is governed, not a
  leaf") applies to it the same as any page shell.
- **Numeric-literal unions** — `src/components/archetypes/analytics-dashboard/DashboardGrid.tsx:16`
  (`columns?: 2 | 3 | 4`), `src/components/archetypes/analytics-dashboard/DashboardWidget.tsx:22`
  (`span?: 1 | 2 | 3`), `src/components/archetypes/statement-with-filters/StatementTable.tsx:61`
  (`indent?: 0 | 1 | 2`), and `src/components/layout/StatTileRow.tsx:19`
  (`columns: 2 | 3 | 4`) — the pattern only matches quoted strings, so a bare
  numeric union never matches at all.

`scripts/lint-design.mjs` is a zero-dep regex scanner with no type resolution
(ADR-0003) — it must stay that way.

## What to do

- [ ] Before editing, grep every prop declaration under `src/components/archetypes/**`
      and `src/components/layout/**` for a bare numeric-literal union or a
      bare identifier typed against a local union alias, not only the four
      call sites this report names — the pattern search already run for this
      ticket (`grep -rnE '^\s*\w+\??\s*:\s*[0-9]+(\s*\|\s*[0-9]+)+'`) found
      exactly those four and no others, but re-run it after the rule changes
      to confirm nothing new is silently in scope.
- [ ] Add a second rule (or extend `archetype-look-union-prop`'s pattern) in
      `_adherence.json` matching a prop typed as a bare numeric-literal union
      (`^\s*\w+\??:\s*[0-9]+\s*\|\s*[0-9]+`), scoped via `include` to both
      `src/components/archetypes/**` and `src/components/layout/**` — the
      second root is required because `StatTileRow.tsx` lives under
      `src/components/layout/`, outside every existing appearance-prop rule's
      `include`, and the acceptance below requires it to be named.
- [ ] Add a pre-pass to `scripts/lint-design.mjs` that harvests, per scanned
      file, `export type X = "a" | "b" | …` and `export type X = 1 | 2 | …`
      alias declarations (a line-level regex, not a parser — this is the
      "small closed set of union type-alias NAMES the scanner can harvest per
      file" the ticket calls for), then a rule (or an extension of
      `archetype-look-union-prop`) that matches `\w+\??:\s*(X|Y|…)` against
      that per-file harvested name set. Keep the alias resolution scoped to
      names declared in the same file the prop is declared in — the ticket
      does not ask for cross-file resolution and `lint-design.mjs` walks one
      file at a time.
- [ ] Cover both new shapes in `scripts/lint-design.test.mjs` (numeric-literal
      union rule; aliased-union pre-pass rule), the way the existing
      `include`/`exclude` behaviour is already tested there.
- [ ] Read `CalendarShell.tsx`-style precedent aside — verify
      `docs/archetypes/statement-with-filters.md`'s current text against
      `StatementTable.indent`: as of this ticket it says only "row
      grouping/indentation where useful" (`statement-with-filters.md:65` and
      `:170`) and "a tree of statement rows (group → children) is permitted
      where the statement type is hierarchical" (`:174`) — neither
      exhaustively enumerates which data depth yields `0`, `1`, or `2`, so
      ADR-0004's derived test does not yet pass. Promote that prose into a
      Layer 6 decision rule stating the mapping explicitly (indent = the
      row's tree depth in the statement's group→children data, capped at 2),
      mirroring how `report.md`'s width JSDoc was promoted into contract prose
      in [report-calendar-appearance-prop-lint](archive/report-calendar-appearance-prop-lint.md),
      **then** add `src/components/archetypes/statement-with-filters/**` to
      the numeric-union rule's `exclude`, with the rule's `message` naming
      `statement-with-filters.md`'s new keying-rule clause.
- [ ] Do not exclude `DashboardGrid.columns`, `DashboardWidget.span`,
      `StatTileRow.columns`, or `EntityAvatar.size` — none of their contracts
      (`analytics-dashboard.md`, `entity-circle.md`) state a decision rule
      keying the value to the entity or its data, so these are genuine hard
      rule 12 hits. Leave them at `warn`; each gets its own close-API ticket
      later, the way `archetype-convergence-crud-dialog-close-api` and
      siblings closed the Phase-1 set.
- [ ] If `statement-with-filters.md` is edited, bump its frontmatter `version`
      (minor — additive keying rule, per `docs/archetypes/README.md`'s
      Versioning table) and the matching `docs/archetypes/MANIFEST.json`
      entry's `version`, majors aligned.

## Acceptance

- [ ] `node scripts/lint-design.mjs` exits 0.
- [ ] Its output names `DashboardGrid.tsx`, `DashboardWidget.tsx`,
      `StatTileRow.tsx`, and `EntityAvatar.tsx` under the appearance-prop
      rules, and no other file under `src/components/archetypes/**` or
      `src/components/layout/**` carries an un-triaged numeric-literal or
      aliased-union appearance prop the new rules should have caught but
      didn't.
- [ ] It names no file under `src/components/ui/` and no already-closed
      archetype (`detail-overview`, `form-page`, `list-with-detail`,
      `settings-table`, `crud-dialog`).
- [ ] Every `exclude` entry added to `_adherence.json` carries, in the rule's
      `message`, the contract file and the line/section that supplies its
      keying rule (matching the pattern already used for `report`'s and
      `form-page`'s exclusion entries).
- [ ] `scripts/lint-design.test.mjs` passes, covering the numeric-literal-union
      rule and the aliased-union pre-pass rule.
- [ ] `npx tsc --noEmit` and `npm test` pass.

## Related

- [archetype-convergence-appearance-prop-lint.md](archive/archetype-convergence-appearance-prop-lint.md) — shipped the rule this ticket extends; same path-scoping mechanism (`include`/`exclude`, `path.matchesGlob`).
- [report-calendar-appearance-prop-lint.md](archive/report-calendar-appearance-prop-lint.md) — the precedent this ticket mirrors for `StatementTable.indent`: promote contract prose into an exhaustive keying rule, then exclude, citing the clause in the rule's `message`.
- [archetype-convergence-component-kind-appearance-gap.md](archive/archetype-convergence-component-kind-appearance-gap.md) — established that a `kind: "component"` archetype (entity-circle) is governed under hard rule 12, not exempt as a leaf.
- [archetype-convergence.md](archetype-convergence.md) — parent roadmap; Phase 1's `?`-marked "audit the remaining twenty archetypes... in MANIFEST order" is what this scanner gap was blocking from being mechanically checkable.
- ADR-0004 (`docs/adr/0004-appearance-locality-derived-vs-inherited.md`) — the derived-vs-inherited rule, and its 2026-09-06 amendment on `kind: "component"` archetypes.
- ADR-0003 — adherence lint ships as a zero-dep scanner; this ticket stays inside that constraint (no TS parser).
