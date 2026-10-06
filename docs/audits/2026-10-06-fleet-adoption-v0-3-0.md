# Fleet adoption audit for design-baseline v0.3.0 — 2026-10-06

**Reader:** the operator and each consumer's own session. Read-only sweep of the working trees of hk-crm, mistra and brickshop-manager with the donor's `scripts/scan-adoption-quality.mjs` against this repo's `docs/audit-signals.json` (v0.3.0 signal set: `page-*` + `retired-surface-header-props`). Context: [ADR-0008](../adr/0008-one-page-frame-slot-owned-placement.md), [ADR-0005](../adr/0005-adoption-quality-scan-zero-dep-donor-script.md); the shape follows [2026-10-03-page-frame-contradictions.md](2026-10-03-page-frame-contradictions.md). controlling-app is already handled by its own playbook and is not re-measured here.

No consumer repository was written to. Hits are candidates, not verdicts (`docs/ADOPTION-QUALITY.md`): the per-page gate in each project decides.

## Scan targets

| Consumer | Scan root | Commit scanned | Pinned `design-baseline` |
|---|---|---|---|
| hk-crm | `hk-crm/` (`src`, 639 files) | `4689a2b9` | `v0.2.24` |
| mistra | `mistra/frontend/` (`src`, 215 files) | `81318a11` | `v0.2.30` |
| brickshop-manager | `brickshop-manager/` (`src`, 1302 files) | `aab5bf8b` | `v0.2.7` |

Working trees were scanned as found (all on `main`, clean); origin was not fetched, so a consumer may be a few commits behind its remote.

## Hit counts

Every signal is measured; `0` means measured-zero.

| Signal | tier | hk-crm | mistra | brickshop-manager |
|---|---|---:|---:|---:|
| `page-header-above-shell` | red | 0 | 0 | 1 (false positive, see below) |
| `page-titled-card-under-header` | yellow | 1 | 2 | 1 |
| `page-control-row-under-header` | yellow | 0 | 1 | 0 |
| `retired-surface-header-props` | red | 23 | 4 | 16 |
| **total** | | **24** | **7** | **18** |

## Reading the hits

- **hk-crm** — 22 `headerActions=` / `kicker=` call sites on list, board and settings pages plus `headerFill="tint"` in `(app)/layout.tsx`. All map mechanically to the `actions` slot; kickers are dropped. One `PageHeader` on the dashboard page (`(app)/page.tsx:49`) sits above a titled card.
- **mistra** — smallest surface. `headerFill="white"` in `App.tsx`, `kicker=` on two `DashboardShell` admin pages and `NotificationsPage`; two pages with a `PageHeader` over titled cards and one with a control row under the header (`MeetingsListPage.tsx`).
- **brickshop-manager** — mostly kickers on the **locally owned** shells (`SettingsPageShell.tsx`, `FeedShell.tsx`, `SurfaceHeaderSlot.tsx`, `headerFill.ts`) — vendored pre-ADR-0008 copies, so the hits are in the shell code itself plus every page that feeds them. The single `page-header-above-shell` hit is a doc comment in `SettingsPageShell.tsx:9` ("rendered by `<PageHeader>`"), not a page title; it disappears with the shell copy.
- Pins are far behind v0.3.0 for hk-crm and brickshop-manager (`v0.2.7` crosses many closed-API removals); each playbook's step 1 is the bump.

## Playbooks

Each consumer has one self-heal playbook naming its own hits, to be executed from that project's own session (fleet-adoption rule — the donor does not migrate):

- [hk-crm](2026-10-06-adopt-v0-3-0-playbook-hk-crm.md)
- [mistra](2026-10-06-adopt-v0-3-0-playbook-mistra.md)
- [brickshop-manager](2026-10-06-adopt-v0-3-0-playbook-brickshop-manager.md)

## Re-run

```bash
node scripts/scan-adoption-quality.mjs --root <consumer-src-root> --signals docs/audit-signals.json --json
```
