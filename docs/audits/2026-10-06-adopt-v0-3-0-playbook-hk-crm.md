# Playbook — adopt design-baseline v0.3.0 in hk-crm

Written 2026-10-06 by the design-baseline donor session. Reader: hk-crm's own session. Execute from that repo: file tickets via `/ticket`, work in `/feat` worktrees, finish with `/ship`. Decide and proceed. Measurements: [fleet audit](2026-10-06-fleet-adoption-v0-3-0.md) (scanned commit 4689a2b9, pin v0.2.24).

## Rule (short)

Every page = one title → one untitled raised surface → toolbar band → body. Shells render this through `PageFrame`; pages pass content into slots: `title`/`subtitle`/`badges`, `actions` (whole-page verbs, the one primary action), `toolbar` (scoping controls/search), `count` (result-count string), `viewOptions` (display-only toggles → one "View" menu). `kicker`, `headerActions`, `headerFill` are gone; no `PageHeader` next to a shell. Read after the bump, from `node_modules/design-baseline/`: `docs/adr/0008-one-page-frame-slot-owned-placement.md`, `docs/PLACEMENT.md`, `docs/PACKAGE.md` ("Closed-API removals per archetype version" — the prop → call-site table, including every release between your pin and v0.3.0).

## Work, in order

### 1. Pin bump + compile fixes
`package.json` → `design-baseline#v0.3.0`, install, typecheck, fix every break via the PACKAGE.md table. Delete `headerFill="tint"` in `src/app/(app)/layout.tsx:25` (prop removed; no replacement).

### 2. Retired props — 23 hits, `retired-surface-header-props` (red)
`headerActions={…}` → `actions={…}` on the shell (page verbs: the create button). `kicker=` → delete (the nav/breadcrumb already says where you are). Where `headerActions` holds filters/selectors rather than verbs, move those to `toolbar`.

| Area | Files (line) |
|---|---|
| Lists / boards | `companies/companies-list-client.tsx` (82), `contacts/contacts-list-client.tsx` (93), `leads/leads-list-client.tsx` (100), `events/events-list-client.tsx` (29), `tasks/tasks-list-client.tsx` (147), `opportunities/opportunities-list-client.tsx` (196, `newButton`), `opportunities/opportunities-kanban-client.tsx` (94), `projects/projects-list-client.tsx` (180, `pageActions`), `projects/projects-board-client.tsx` (89) |
| Embedded tabs | `_shared/deals-tab-client.tsx` (71), `companies/[id]/contacts/company-contacts-client.tsx` (80), `companies/[id]/projects/company-projects-client.tsx` (53), `events/[id]/event-participants-client.tsx` (101), `projects/[id]/project-tickets-client.tsx` (188) |
| Reports | `reports/page.tsx` (34, `<ReportsToolbar asOf=…/>` → scoping control, goes to `toolbar`) |
| Settings | `settings/page.tsx` (11, `kicker=""`), `settings/catalog/catalog-client.tsx` (99), `settings/email-integration/page.tsx` (17), `settings/services/services-list-client.tsx` (228), `settings/synchronisation/page.tsx` (99), `settings/synchronisation/sync-run-list-client.tsx` (138), `components/settings/settings-crud-surface.tsx` (70) |

Embedded tab clients that render a full shell inside a detail page: nest the frameless body/shell per `detail-section-wraps-shell-client` guidance (a shell inside a `PageFrame` joins the parent surface).

### 3. Titled card under header — 1 hit (yellow)
`src/app/(app)/page.tsx:49` `<PageHeader title={de.dashboard.title} />` over titled cards. Adopt the analytics-dashboard shell (`CHOOSING-A-SURFACE.md`) or drop card titles that repeat the page title; the dashboard widgets keep section headings inside one frame.

### 4. Sweep
Re-run the scan; zero `page-*` / `retired-surface-header-props` hits. Update project docs that describe the old header shape.

## Verify (every PR)
- Typecheck, lint (incl. `lint-design.mjs`), the test suite, the project's own gates.
- Re-run `node node_modules/design-baseline/scripts/scan-adoption-quality.mjs --root <src-root> --signals node_modules/design-baseline/docs/audit-signals.json`; red signals at zero, yellows fixed or ticketed.
- Browser check of each migrated page: exactly one `h1`, one control band, controls work.
