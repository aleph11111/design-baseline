# Playbook — adopt design-baseline v0.3.0 in mistra

Written 2026-10-06 by the design-baseline donor session. Reader: mistra's own session. Execute from that repo: file tickets via `/ticket`, work in `/feat` worktrees, finish with `/ship`. Decide and proceed. Measurements: [fleet audit](2026-10-06-fleet-adoption-v0-3-0.md) (scanned commit 81318a11, pin v0.2.30).

## Rule (short)

Every page = one title → one untitled raised surface → toolbar band → body. Shells render this through `PageFrame`; pages pass content into slots: `title`/`subtitle`/`badges`, `actions` (whole-page verbs, the one primary action), `toolbar` (scoping controls/search), `count` (result-count string), `viewOptions` (display-only toggles → one "View" menu). `kicker`, `headerActions`, `headerFill` are gone; no `PageHeader` next to a shell. Read after the bump, from `node_modules/design-baseline/`: `docs/adr/0008-one-page-frame-slot-owned-placement.md`, `docs/PLACEMENT.md`, `docs/PACKAGE.md` ("Closed-API removals per archetype version" — the prop → call-site table, including every release between your pin and v0.3.0).

Scan root is `frontend/` (not the repo root).

## Work, in order

### 1. Pin bump + compile fixes
`frontend/package.json` → `design-baseline#v0.3.0`, install, typecheck, fix breaks via the PACKAGE.md table (v0.2.30 → v0.3.0).

### 2. Retired props — 4 hits, `retired-surface-header-props` (red)
- `src/App.tsx:321` `headerFill="white"` → delete (prop removed, no replacement; update visual baselines deliberately).
- `src/pages/admin/AdminDashboardPage.tsx:56` `<DashboardShell kicker="Admin" title="Admin Dashboard">` → drop `kicker`.
- `src/pages/admin/HealthPage.tsx:421` `<DashboardShell kicker="Admin" title="Systemzustand">` → drop `kicker`.
- `src/pages/NotificationsPage.tsx:91` `kicker="Posteingang"` → drop; if a `headerActions` neighbours it, move to `actions`.

### 3. Titled card / control row under header — 3 hits (yellow, triage each)
- `src/pages/MeetingsPage.tsx:106` `<PageHeader title="Meetings" />` over titled cards → one title, adopt the page shell, card titles become section headings or go.
- `src/pages/QuickRecordSetupPage.tsx:36` `<PageHeader …>` over a titled card → same; a setup form fits `FormPageShell`.
- `src/pages/MeetingsListPage.tsx:101` `<PageHeader title="Meetings" icon={Video} />` followed by a hand-rolled control row → adopt `ListWithDetailShell`: search/filters in `toolbar`, count in `count`, create verb in `actions`.
Skip any hit the gate clears (a legitimately multi-section page).

### 4. Sweep
Re-run the scan; zero `page-*` / `retired-surface-header-props` hits.

## Verify (every PR)
- Typecheck, lint (incl. `lint-design.mjs`), the test suite, the project's own gates.
- Re-run `node node_modules/design-baseline/scripts/scan-adoption-quality.mjs --root <src-root> --signals node_modules/design-baseline/docs/audit-signals.json`; red signals at zero, yellows fixed or ticketed.
- Browser check of each migrated page: exactly one `h1`, one control band, controls work.
