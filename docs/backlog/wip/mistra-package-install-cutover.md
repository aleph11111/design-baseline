---
area: archetypes
opened: '2026-09-23'
status: blocked
depends_on:
  - mistra-list-detail-settings-table-fork-promotion
  - mistra-fork-triage-promotions
value: normal
model: opus
model_reason: "cross-repo migration plus a real fork reconciliation (component-API forks across ten archetypes) that needs judgment"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-23T14:30:00Z'
---

# Install the design-baseline package in mistra and delete its vendored archetype copies

## Context

The `archetype-convergence` completion review found `mistra` unmigrated on `origin/main` (read
2026-09-23). `frontend/package.json` (Vite 7 + Tailwind 4) has no `design-baseline` entry.
`frontend/src/components/archetypes/` vendors ten archetype directories: analytics-dashboard,
crud-dialog, detail-overview, entity-circle, form-page, list-with-detail, overline-typed,
raw-input, raw-select and others. `docs/archetypes/` holds 26 files, including a `MANIFEST.json` fork
and a `detail-overview.md` that has diverged from the donor contract by 156 lines. That leaves D1,
D2, D3 and D5 of the roadmap's Done-when open for this repo. Run the cutover from a mistra session
using `docs/PACKAGE.md`'s "Migrating a vendored consumer" runbook, the same way
`hk-crm-package-install-cutover` did.

## What to do

- [x] From a mistra `/feat` worktree, add `design-baseline` to `frontend/package.json` pinned to the current
      donor tag (`v0.2.3` at filing time) and install.
- [x] Runbook step 1, fork triage: normalise and diff every file under `frontend/src/components/archetypes/`
      against the donor. For the `detail-overview.md` divergence, decide per section whether it is a
      contract change to promote upstream (use `/promote-archetype --update` from mistra) or local drift
      to drop. Record each decision before deleting anything.
- [ ] Runbook steps 2–4: split the brand `tokens.css`, wire the tsconfig paths and `tokens.layer.css`
      + `@source`, then delete `frontend/src/components/archetypes/` and the per-file stamps in one commit.
      This is a Vite consumer, so the `transpilePackages` line does not apply.
- [x] Runbook step 6: delete `docs/archetypes/` including `MANIFEST.json`, the package-owned methodology
      docs, and their Doc-Paths keys in mistra's `CLAUDE.md`.

## Acceptance

- In `mistra/frontend`, `node -e "require.resolve('design-baseline/package.json')"` succeeds, and
  `frontend/src/components/archetypes/` is absent.
- `git -C mistra show origin/main:docs/archetypes/MANIFEST.json` fails.
- `tsc --noEmit` and `vite build` are clean, and archetype-rendering routes render unchanged against
  pre-migration screenshots, except where a triage decision deliberately dropped local drift.
- Every section of the `detail-overview.md` divergence has a recorded decision (promoted or dropped).
  None is lost silently.

## Related

- [archive/hk-crm-package-install-cutover.md](../archive/hk-crm-package-install-cutover.md) — the template cutover.
- [controlling-app-package-install-cutover.md](../archive/controlling-app-package-install-cutover.md) — sibling cutover.
- [[roadmap-review-archetype-convergence]] — the review that filed this.
- ADR-0004 — appearance locality, which the donor's closed API enforces.

## Progress — 2026-09-24 (increment 1, mistra PR #1025, merged)

Shipped in mistra (`feat/design-baseline-package-install`, squash-merged as #1025):

- `design-baseline#v0.2.3` installed in `frontend/package.json` (+ `@types/node` for the package's
  `button.tsx`). `require.resolve('design-baseline/package.json')` succeeds.
- Runbook step 2: `tokens.css` split. The donor half is now `@import "design-baseline/tokens.layer.css"`
  plus `@source "../../node_modules/design-baseline/src"`. The brand values, plugins, `--chart-N` roles
  and a font binding that keeps Tailwind's system stack stay project-owned, because the layer binds
  IBM Plex and mistra does not load it. The status-chip tier gets the donor's default values. Diffing
  the built CSS against main showed every mistra rule and brand variable unchanged; the only changes
  are added package classes and the status tier.
- Runbook step 6: deleted the package-owned doc copies, versioned `ADOPTION.md`, `ADOPTION-QUALITY.md`,
  the chrome stamp, the `/style-baseline` exclusion list and its check, and every
  `docs/archetypes/<slug>.md` fork and `.baseline.md` sibling. Also deleted `MANIFEST.json`, since all
  11 entries were versioned and F4 empties it, and `verify-archetype-versions.mjs`, its only reader.
  The project-local `backend-crud-route` and `card-grid-portfolio` contracts stay, so the `archetypes:`
  key stays and now describes only those. The adoption audit is frozen to `docs/archive/`. The
  `design:` key is trimmed to its project-owned entries.
- Private dependency: `frontend/Dockerfile` fetches the package with a GitHub token passed as the
  BuildKit secret `gh_token` and applied through `GIT_CONFIG_*` env inside the `npm ci` RUN.
  `release-images.sh` and compose pass it. A real `docker buildx build frontend` succeeded. An
  ssh-agent mount was tried first and failed.
- Verified before shipping: `tsc -b` 0, `vite build` ok, vitest 971/971, `lint:design` 0 errors.

**detail-overview.md decision (acceptance bullet 4).** The fork differed from the donor in 3 hunks.
All are DROP-DONOR-AHEAD: two say propagation is "via `/style-archetypes --update`" where the donor now
says "by a package tag bump", and one is the reference-implementation note pointing at the retired
`.baseline.md` sibling. Nothing was promoted. The 156-line gap in Context had already been closed by
mistra's 2026-08 re-sync of its MANIFEST pairs. mistra's `detail-overview.baseline.md` is DROP-LOCAL
(rule 2/3 mirror), and its blueprint SVG was byte-identical to the donor's.

**Why `frontend/src/components/archetypes/` still exists (acceptance bullet 1 is open).** Only
`entity-circle` normalises to identical. Deleting the directory and re-pointing the imports at
`design-baseline/archetypes/<slug>` produced 81 tsc errors.

- **Consumer-ahead and general, needing donor promotion** (each one a rule-10 call):
  - [mistra-list-detail-settings-table-fork-promotion](../archive/mistra-list-detail-settings-table-fork-promotion.md):
    `hideBelowMd`, list `footer`, `emptyStateAction`, per-row `RowAction` label/disabled, settings
    `rowLabel`.
  - [mistra-fork-triage-promotions](../mistra-fork-triage-promotions.md): `destructiveDisabled`, the
    `useCrudDialogController` post-save reset fix, the detail header's leading/back-link slot,
    `UnifiedSurfaceContext` access for mistra's `CollapsibleSection`, and `DashboardGrid` `columns`.
- **Donor-ahead renames** (call-site mapping when re-pointing): `headerSubtitle`→`subtitle`,
  `headerIcon`→`icon`, `SELECT_NONE` for the literal `"__none__"`. The per-shell `headerFill` is dropped
  as local drift; `<AppShell>`'s `HeaderFillContext` replaces it.
- **Mistra-only compositions** (move to project files, no donor change needed):
  `CrudDialogSubmitOnEnter`, `SettingsTableSearchToolbar`, `useEntityDialogState`.
- **Also blocking, cross-repo:** mistra's `design-baseline-package-ui-layout-triage`. Every vendored
  `ui/` primitive differs from the package's copy, and package archetypes import the package's own
  `ui/` and `layout/` relatively. Re-pointing before that triage would render mixed primitives and read
  the package's own `HeaderFillContext` instead of mistra's.
- **Unrelated to the cutover:** mistra's `ci-design-baseline-private-repo-token`. Actions `npm ci`
  cannot read the private repo; it is dormant while Actions billing is down.

**Remaining for this ticket, once the above land:** bump mistra to the new tag, re-point each slug,
move the three compositions out, delete `frontend/src/components/archetypes/` together with its
`_adherence.json` archetype rules in one commit, then take screenshots against the pre-migration
routes. Runbook step 5 (the radar sync row) waits for that commit, because until then the
kept-file count is still the full vendored tree.
