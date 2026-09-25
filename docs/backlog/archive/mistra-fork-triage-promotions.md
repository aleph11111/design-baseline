---
area: archetypes
opened: '2026-09-24'
status: done
value: high
model: opus
model_reason: "five ADR-0004/rule-10 appearance-vs-capability calls plus one genuine encapsulation fork (export UnifiedSurfaceContext vs ship a collapsible variant) — real design judgment, not pattern-following"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related, open_question]
  failed: []
  graded_at: '2026-09-24T10:02:02Z'
---

# Promote mistra's crud-dialog, detail-overview, and analytics-dashboard fork findings upstream

## Context

Fork triage for [`mistra-package-install-cutover`](../wip/mistra-package-install-cutover.md) (against donor tag
`v0.2.3`) diffed mistra's vendored copies at mistra `origin/main`
`frontend/src/components/archetypes/{crud-dialog,detail-overview,analytics-dashboard}` against this donor and
found five real divergences, each an ADR-0004 / RULES.md rule-10 appearance-vs-capability or contract-shape
call. Confirmed against the current donor tree:

- `src/components/archetypes/crud-dialog/CrudDialogFooter.tsx` has `isDeleting?: boolean` (spinner) but no
  static gate distinct from it — mistra's 5 dialogs (SpeakerDialog, SkillDialog, MeetingAgentDialog,
  ProviderProfileDialog, UserDialog) all need one.
- `src/components/archetypes/crud-dialog/useCrudDialogController.ts` `handleSecondary` (~line 199) calls
  `form.reset(defaultValues)` on Cancel — confirmed stale: after a Save, `defaultValues` is still the
  pre-save prop, so Cancel-after-Save reverts to old data instead of the just-saved values. mistra's fix
  (a `lastSavedValues` ref) is a real upstream bug fix.
- `src/components/archetypes/detail-overview/DetailOverviewHeader.tsx` explicitly documents "no icon, no
  back link" and does not forward `backHref`/`backLabel`/`renderBackLink`, even though the wrapped
  `src/components/layout/PageHeader.tsx` already implements that exact adapter (RULES.md rule 10 names
  `renderBackLink` as an already-blessed structural pattern, not appearance).
- `src/components/archetypes/detail-overview/DetailOverviewShell.tsx` exports `UnifiedSurfaceContext` with
  the JSDoc "INTERNAL — not part of the shell's public API," and `package.json`'s `exports` map only
  publishes the archetype barrel (`./archetypes/*` → `index.ts`), which does not re-export it. mistra's
  `CollapsibleSection` composes detail-overview via that internal context directly.
- `src/components/archetypes/analytics-dashboard/DashboardGrid.tsx` fixes its column count in the
  component with an explicit comment citing ADR-0004/rule 12: "a per-page column count is an appearance
  the contract does not derive." mistra's `DashboardGrid` `columns?: 2|3|4` on `DashboardPage` is exactly
  the ungoverned numeric-look-union prop that comment warns against.

`mistra-package-install-cutover` is blocked on this ticket — its runbook step 1 (fork triage) needs these
five items resolved (shipped or rejected) before mistra can delete its vendored copies.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern (`useCrudDialogController`'s
      `handleSecondary`/mode-reset path, and every `CrudDialogFooter` call site); fix at the shared point,
      not only the Cancel-after-Save case this report names.
- [ ] Ship `CrudDialogFooter` `destructiveDisabled?: boolean` — a capability boolean gating the destructive
      button, distinct from `isDeleting`'s spinner (RULES.md rule 10: a behaviour/capability boolean like
      this is explicitly carved out of the appearance vocabulary, so no keying rule is needed).
- [ ] Fix `useCrudDialogController`'s Cancel path to reset to the last-saved values (a `lastSavedValues` ref
      set on successful mutation, read by `handleSecondary` instead of `defaultValues`) with a regression
      test covering Cancel-after-Save.
- [ ] Forward the existing `backHref` / `backLabel` / `renderBackLink` triad from `PageHeader` through
      `DetailOverviewHeader` (reuse the adapter RULES.md rule 10 already blesses as structural, rather than
      inventing a new `leading?: ReactNode` slot) so RecordingDetailPage / ProjektDetailPage /
      MeetingDetailPage's back buttons compose through the standard pattern.
- [ ] Ship a collapsible `DetailSection` variant (e.g. a `collapsible` prop or a `CollapsibleDetailSection`
      composing `UnifiedSurfaceContext` internally) rather than exporting `UnifiedSurfaceContext` from the
      package — see Open question below; this is the auto-resolved Recommended default, confirm before
      `/feat`.
- [ ] Reject `DashboardGrid` `columns?: 2|3|4` as an ungoverned numeric-look-union prop, per the component's
      own existing ADR-0004 comment — record mistra's adaptation (drop the prop; use `DashboardWidget`
      `span` for per-widget width, or propose a contract keying rule from `DashboardPage`'s entity/data if
      mistra has one) rather than shipping the prop as-is.
- [ ] Bump `docs/archetypes/MANIFEST.json` versions for `crud-dialog`, `detail-overview`, and
      `analytics-dashboard` per RULES.md rule 8 (MANIFEST `version` counts any shipped-deliverable change),
      add/update each archetype's gallery demo in `src/examples/`, and cut a new donor tag after
      `node scripts/verify-exports.mjs` is green.

## Acceptance

- `CrudDialogFooter.tsx` renders the destructive button disabled when `destructiveDisabled` is true,
  independent of `isDeleting`, and a test covers both flags set independently.
- After a Save, clicking Cancel in `useCrudDialogController`'s edit mode shows the just-saved form values,
  not the pre-save `defaultValues` — and no other reset call site in `useCrudDialogController.ts` (the
  discard-guard reset, the create-mode close) is left reading stale `defaultValues` where the just-saved
  values are available; the fix lands at the shared `handleSecondary`/mode-reset point, not only the
  Cancel-after-Save case.
- `DetailOverviewHeader` renders a back link when `backHref` is passed, matching `PageHeader`'s existing
  adapter behavior, with no new prop added to the archetype's public surface.
- Either `UnifiedSurfaceContext` is exported from `package.json`'s `exports` map and its JSDoc is updated
  to drop "INTERNAL," or a collapsible `DetailSection` variant ships and mistra's `CollapsibleSection`
  is rewritten against it instead of the internal context — one of the two, recorded in the ticket body,
  never left silently unresolved.
- `DashboardGrid` is either unchanged (rejected, with mistra's adaptation recorded) or gains a `columns`
  prop whose contract entry states the keying rule that determines its value from `DashboardPage`'s entity
  or data.
- `node scripts/verify-exports.mjs` exits 0 and `docs/archetypes/MANIFEST.json` versions for all three
  archetypes are bumped once every item above has shipped or been recorded rejected; a new donor tag is
  cut after.

## Related

- [wip/mistra-package-install-cutover.md](../wip/mistra-package-install-cutover.md) — the cutover ticket
  blocked on this one; its fork-triage runbook step needs these five items resolved first.
- [archive/archetype-convergence-crud-dialog-close-api.md](../archive/archetype-convergence-crud-dialog-close-api.md) — prior promotion precedent on this same archetype.
- [archive/archetype-convergence-detail-overview-close-api.md](../archive/archetype-convergence-detail-overview-close-api.md) — prior promotion precedent on this same archetype.
- [archive/analytics-dashboard-column-span-props-unclosed.md](../archive/analytics-dashboard-column-span-props-unclosed.md) — prior appearance-prop audit on this same archetype, same auto-resolve-to-Recommended shape.
- ADR-0004 — appearance locality: derived vs. inherited, governing items 1 and 5.
- RULES.md rule 8 (version-field semantics) and rule 10 (appearance-locality enforcement), both directly invoked above.

## Open question

Item 4: export `UnifiedSurfaceContext` from the package (quick, but breaks its documented "INTERNAL — not
part of the shell's public API" contract and makes an implementation detail public API to version forever)
vs. ship a collapsible `DetailSection` variant that composes the context internally (keeps the context
private, consistent with RULES.md rule 3 — never leak a primitive's internals into what a consumer
depends on). Auto-resolved to the collapsible-variant option (Recommended) per the headless-capture rule;
confirm before `/feat`.

Resolved 2026-09-25 (operator confirmed): collapsible variant. `UnifiedSurfaceContext` stays internal.

## Outcome (v0.2.6)

- **Shipped: `destructiveDisabled`** on `CrudDialogFooter`, with the gate in the shared `ActionFooterBar`
  so `FormPageActions` can pick it up later. It disables the button with no spinner, separate from
  `isDeleting`, and both flags are tested on their own. The crud-dialog demo now passes
  `destructiveDisabled={mode.isView}`. Before this, the demo left Delete enabled in view mode, against
  contract Layer 7.
- **Shipped: the Cancel-after-Save fix.** It uses mistra's `lastSavedValues` ref, falling back to
  `defaultValues`, and has a regression test. `handleSecondary` was the only stale reset. The save path
  already reset to the saved `values`, and create-mode close does no reset at all.
- **Shipped: the back link.** `DetailOverviewHeader` forwards `PageHeader`'s
  `backHref`/`backLabel`/`renderBackLink`, the adapter rule 10 already allows, with no new slot. This
  changes the contract: `detail-overview.md` v3.1 drops "no back link" and allows a back link only
  through that adapter. **mistra adaptation:** replace `leading={<BackButton…/>}` with the three
  back-link props. A `leading` ReactNode slot would fail the `archetype-appearance-slot` lint.
- **Shipped: `DetailSection` `collapsible` / `defaultOpen`.** These are behaviour booleans. The
  section's title turns into the disclosure trigger (a button inside the `<h2>`), and the
  chromeless/bounded surface is still derived from `UnifiedSurfaceContext` internally. The context is
  not exported. **mistra adaptation:** rewrite `CollapsibleSection` as
  `<DetailSection title collapsible defaultOpen actions={summary}>`, and delete the file and its direct
  `UnifiedSurfaceContext` import.
- **Rejected: `DashboardGrid` `columns?: 2|3|4`.** It's a numeric-look-union with no keying rule, and
  the component's own ADR-0004 comment already rules it out. **mistra adaptation:** none needed in
  product code. The prop is only used in mistra's `DashboardShell.test.tsx`, so drop the prop and those
  two cases. analytics-dashboard ships nothing, so it gets no MANIFEST bump (rule 8). The "bump all
  three" line in What to do was wrong on that point.
- Versions: MANIFEST `crud-dialog` 3.1→3.2 and `detail-overview` 3.3→3.4; contracts both 3.0→3.1;
  package 0.2.5→0.2.6. `verify-exports` 8/8, `verify-manifest-versions`, tsc and 412 tests all pass.
  Tag `v0.2.6` gets cut after merge.

