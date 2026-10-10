---
area: docs
opened: 2026-10-10
status: needs-enrichment
value: normal
model: opus
model_reason: "design is the deliverable: where the pin derivation lives (donor JSON vs dashboard read-time overlay) spans two repos and changes who owns the sync rows"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved design fork under ## Open question — needs an interactive operator decision before /feat"
  graded_at: 2026-10-10T00:00:00Z
---

# Promotion-radar sync rows stale after the October fleet rollout

## Context

The `sync[]` rows in `docs/promotion-radar.json` still record pre-rollout state: the "donor package tag lag" ledger row carries the 2026-09 installs (hk-crm `v0.2.1` dry run, controlling-app `v0.2.3`, …). `docs/PACKAGE.md` "Migrating a vendored consumer", step 5 says each consumer bump is recorded in that row, but a consumer's PR cannot edit the donor repo, so nothing records it (brickshop-manager PR #1571 left it to the operator). Current pins on each consumer's `main` after the 2026-10-09/10 rollout: controlling-app v0.9.3, mistra v0.9.3, hk-crm v0.9.3, hk-sales-agent v0.9.3, brickshop-manager v0.9.3, gebo-stock-kiosk v0.9.1 (v0.9.3 PR #25 pending). The dashboard's `/promotion-radar` route (`server/routes/design.ts`) serves `sync` straight from this file (`sync: Array.isArray(r.sync) ? r.sync : []`), so the Radar tab shows the stale ledger. A hand-recorded pin is stale by construction; the pin is a fact readable from each registered consumer's `package.json` on its truth ref.

## What to do

- [ ] Before editing, grep every caller of the touched file / key; fix at the shared point, not only the call site this report names. (Readers of `sync[]`: `server/routes/design.ts` and `client/src/features/design/DesignView.tsx` in the dashboard, `docs/PROMOTION-RADAR.md`, `docs/PACKAGE.md` step 5.)
- [ ] Update the tag-lag `sync[]` row for all six consumers (controlling-app, mistra, hk-crm, hk-sales-agent, brickshop-manager, gebo-stock-kiosk) with the pin listed above and each consumer's current kept local-copy count, measured from its `origin/main` — not copied from the stale row.
- [ ] Make the pin mechanical: derive each registered design consumer's pin by reading its `package.json` `design-baseline#<tag>` dependency from its truth ref (repo list from the dashboard repo registry) in the dashboard's radar read path, so `sync[]` carries only what cannot be derived (kept-file count, fork notes). See Open question for where this lives.
- [ ] Update `docs/PACKAGE.md` step 5 to say the pin is derived and only the kept-file count is hand-recorded.

## Acceptance

- The Radar tab's tag-lag row shows controlling-app, mistra, hk-crm, hk-sales-agent, brickshop-manager at v0.9.3 and gebo-stock-kiosk at v0.9.1 (or v0.9.3 once PR #25 merges), each with a kept-file count.
- After a consumer merges a bump to its `package.json`, the row shows the new pin with no edit to the donor repo.
- Every registered design consumer appears in the derived pin list — no consumer's pin is recorded by hand anywhere in `docs/promotion-radar.json`.
- `docs/PACKAGE.md` step 5 and `docs/PROMOTION-RADAR.md` match the new ownership of the pin and kept-count fields.

## Related

- [[promotion-radar-stale-overlay-sync-pass]] — same rows; that ticket moves the tag-lag ledger text into `docs/PACKAGE.md` and drops it from `sync[]`. Whichever ships second rebases onto the first.
- [[docs-drift-promotion-radar-md-stale-candidate-status]] — prior instance of this overlay decaying.
- [[package-tag-post-v0-2-0-sync]] — earlier manual tag-sync record.
- [docs/PACKAGE.md](/docs/PACKAGE.md) — "Migrating a vendored consumer" step 5.
- [docs/PROMOTION-RADAR.md](/docs/PROMOTION-RADAR.md) — prose declaring the JSON its source of truth.

## Open question

Where does the derivation live? (A) dashboard `/promotion-radar` route overlays pins read from each registered consumer's truth-ref `package.json` at request time — Recommended: no commits, never stale, the registry already lives there; needs a coding-dashboard ticket/PR, since this repo cannot hold that code. (B) a donor-side script/ritual in the existing promotion-radar sync pass rewrites `sync[]` and commits — keeps data in the JSON but a commit can lag a bump. Auto-resolved to A for the mechanical bullet; the data refresh (second bullet) is donor-side either way. File the dashboard half separately if A is confirmed.
