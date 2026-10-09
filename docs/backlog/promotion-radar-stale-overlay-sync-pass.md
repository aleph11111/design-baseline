---
area: docs
opened: 2026-10-09
status: needs-enrichment
value: normal
model: opus
model_reason: "curate pass with four per-row judgment calls (signal-fit vs retire; close vs restate) and live per-consumer verification in mistra, hk-crm, controlling-app"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved design fork under ## Open question — needs an interactive operator decision before /feat"
  graded_at: 2026-10-09T05:52:22Z
---

# Curate pass over promotion-radar.json stale watch candidates and sync rows

## Context

`docs/promotion-radar.json` — the machine form of the durable promotion-radar overlay that the coding-dashboard Radar tab renders (rendered by `server/routes/design.ts` in the dashboard checkout) — is stale in four ways that no commit of the past five weeks has touched. The file's last edit is `c6077bc` (2026-09-28, MetricRow `keyFigure` row) and the top-level `generated` field still reads 2026-06-15 because it is never bumped on edit — the dashboard is switching that caption to the file's git commit date, so the field's only remaining consumer is the " `· curated overlay 2026-06-15` " caption in `DesignView.tsx` (which already degrades on `null`). The four `status: watch` candidates that no scan covers — `auth-card-static`, `contextual-menu`, `filter-bar`, `iconavatar-tone` — still carry hand counts from the 2026-06-13/15 FLEET-AUDIT sweep, and every other live row in the file carries a `scanSignal` id registered in `docs/audit-signals.json` (the donor-owned executable rubric; its `note` documents that "promotion-radar.json candidates reference a molecule signal id via 'scanSignal'"). The three `sync[]` rows also predate the package channel (`355d7a5`, 2026-09-19, "Retire the copy-channel story": the package IS the channel): "FormItem gap space-y-2 -> space-y-1.5" and "dead bricklink\* Badge variants" name a copy-channel sync action that is now a package-bump action, and "donor package tag lag" is a per-consumer install ledger, not an action — `docs/PACKAGE.md`'s own "Migrating a vendored consumer, step 5" (§"Record the tag (and the kept-file count) in the radar") is the runbook it belongs under.

## What to do

- [ ] Before editing, grep every caller of the touched file / key; fix at the shared point, not only the call site this report names. (Consumers of `docs/promotion-radar.json`: the dashboard's `server/routes/design.ts` radar route + `client/src/features/design/DesignView.tsx`; the `PROMOTION-RADAR.md` prose; and the per-row `scanSignal` id must always resolve to a registered signal in `docs/audit-signals.json`.)
- [ ] For each of the four `status: watch` candidates without a `scanSignal` (`auth-card-static`, `contextual-menu`, `filter-bar`, `iconavatar-tone`): add a `scanSignal` id for the row AND register its regex in `docs/audit-signals.json` when the row's shape is still deterministic and recurring, or retire the row (remove it or move it to `sanctioned[]`) with a dated note when the pattern no longer recurs in the fleet.
- [ ] Verify the two `sync[]` rows "FormItem gap space-y-2 -> space-y-1.5" and "dead bricklink\* Badge variants" per consumer (mistra, controlling-app, hk-crm) against their live `origin/main` state, then either close each row with a dated progress note or restate it as a package-bump action for the lagging consumer. Filing-time facts to start from: the donor's `src/components/ui/form.tsx` ships the `space-y-1.5` gap (comment: "the baseline's canonical field gap"), the donor `src/components/ui/badge.tsx` carries zero `bricklink*` variants (verified 2026-10-09), and mistra has already run its package-install cutover (`design-baseline#v0.2.3`, archived ticket `mistra-package-install-cutover`, increment 1 = mistra PR #1025, 2026-09-24) — the thought's "hk-crm's v0.2.1 install was only a dry run" may also be stale, so check hk-crm's current installed tag and whether it still vendors a stale `ui/badge.tsx` / `ui/form.tsx` at all.
- [ ] Move the "donor package tag lag (installed donor tag + kept-file count, per consumer)" `sync[]` row into `docs/PACKAGE.md` under the "Migrating a vendored consumer" section (it fits beside step 5, which already assigns radar-recording to runbook users) and drop it from `sync[]`.
- [ ] Drop the top-level `generated` field from `docs/promotion-radar.json` (the dashboard switches to the file's git commit date for the caption; `DesignView.tsx` already renders it as `data.generated ? … : ""`), or, if keeping it, bump it on this edit and note the maintenance expectation in `docs/PROMOTION-RADAR.md` §"How it works" so the next curation catches it.

## Acceptance

- Every `status: watch` and `status: candidate` row in `docs/promotion-radar.json` either carries a `scanSignal` whose id resolves in `docs/audit-signals.json`, or has been retired / sanctioned — no other row carries 2026-06-13/15 hand counts.
- After the pass, `sync[]` no longer contains the "FormItem gap", the "dead bricklink\* Badge variants", or the "donor package tag lag" rows unchanged — each is either removed with a dated note, restated as a package-bump action naming the lagging consumer(s), or relocated into `docs/PACKAGE.md`.
- The "donor package tag lag" ledger text appears in `docs/PACKAGE.md` (Migrating a vendored consumer / step 5 area) and no longer appears in `sync[]`.
- The top-level `generated` field is absent from `docs/promotion-radar.json`, or equals the 2026-10-09 edit date if retained — and `DesignView.tsx` renders the Radar tab unchanged in either case.
- `docs/PROMOTION-RADAR.md` (the prose that declares the JSON its source of truth) matches the post-pass row set — not only the rows this ticket names are updated, none of the others drift.

## Related

- [[docs-drift-promotion-radar-md-stale-candidate-status]] — prior instance of this overlay decaying (prose table lagging the JSON); that pass fixed the prose, this covers the JSON itself.
- `[[mistra-package-install-cutover]]` — mistra cutover progress notes needed by the sync-row verification.
- [[package-tag-post-v0-2-0-sync]] — the runbook-side record of the tag/kept-file ledger this pass relocates into `docs/PACKAGE.md`.
- [[changelog-and-package-migration-rows]] — same "changed-existing primitives never synced after a cutover" class.
- [docs/PACKAGE.md](/docs/PACKAGE.md) — "Migrating a vendored consumer" step 5 (destination of the tag-lag ledger).
- [docs/audit-signals.json](/docs/audit-signals.json) — the donor-owned executable rubric; source of truth for registered `scanSignal` ids.

## Open question

Drop `generated` entirely (Recommended — the only remaining consumer is one caption string and `DesignView.tsx` already degrades on `null`; a field nobody bumps on edit is a stale stamp by construction) vs. keep it and bump it on every edit (needs a habit or a check to stay honest). Auto-resolved to the drop; re-file under the keep-and-bump shape if the dashboard wants caption text distinct from the commit date.
