# Playbook — adopt design-baseline v0.3.0 in brickshop-manager

Written 2026-10-06 by the design-baseline donor session. Reader: brickshop-manager's own session. Execute from that repo: file tickets via `/ticket`, work in `/feat` worktrees, finish with `/ship`. Decide and proceed. Measurements: [fleet audit](2026-10-06-fleet-adoption-v0-3-0.md) (scanned commit aab5bf8b, pin v0.2.7).

## Rule (short)

Every page = one title → one untitled raised surface → toolbar band → body. Shells render this through `PageFrame`; pages pass content into slots: `title`/`subtitle`/`badges`, `actions` (whole-page verbs, the one primary action), `toolbar` (scoping controls/search), `count` (result-count string), `viewOptions` (display-only toggles → one "View" menu). `kicker`, `headerActions`, `headerFill` are gone; no `PageHeader` next to a shell. Read after the bump, from `node_modules/design-baseline/`: `docs/adr/0008-one-page-frame-slot-owned-placement.md`, `docs/PLACEMENT.md`, `docs/PACKAGE.md` ("Closed-API removals per archetype version" — the prop → call-site table, including every release between your pin and v0.3.0).

## Work, in order

### 1. Pin bump (v0.2.7 → v0.3.0) — its own PR
Large jump: read every PACKAGE.md removals row between the two. Typecheck, fix breaks. Run the generator scripts (`generate:page`) only after the bump.

### 2. Retire the local shell copies — 4 hits are in shell code, not pages
`src/components/layout/headerFill.ts` (22), `layout/SurfaceHeaderSlot.tsx` (24), `shared/FeedShell.tsx` (116), `shared/SettingsPageShell.tsx` (88, plus the doc comment at :9 that is the lone `page-header-above-shell` hit — a false positive that vanishes with the file). These are vendored pre-ADR-0008 shells: after the bump (the package shells exist only in v0.3.0), replace with the package's `design-baseline/archetypes/<slug>` shells (`feed-inbox`, `settings-page`) and delete the local copies and `headerFill` context.

### 3. Kickers on pages — 12 hits, `retired-surface-header-props` (red)
Delete `kicker=` (no replacement). If a `headerActions` neighbours it, → `actions`.
`components/messages/MessagesInbox.tsx` (60), `components/settings/LotDescriptionTemplateSettings.tsx` (196), `pages/Activity.tsx` (27), `pages/CreateOrder.tsx` (41, `FormPageShell kicker={parentLabel}`), `pages/CreateSharedList.tsx` (129), `pages/ItemMasterEditor.tsx` (212, `FormPageShell kicker="Item"`), `pages/Notifications.tsx` (268), `pages/settings/BrickLinkIntegrationSettings.tsx` (20), `pages/settings/CalculationRules.tsx` (175), `pages/settings/NotificationSettings.tsx` (131), `pages/settings/NumberingSettings.tsx` (112), `pages/settings/StatusDefinitions.tsx` (160).
`FormPageShell` has no `actions` slot: save/submit stays in `FormPageActions` at the form foot.

### 4. Titled card under header — 1 hit (yellow)
`src/pages/MarketIntelligence.tsx:141` `<PageHeader title="Market Intelligence" icon=… />` over titled cards → adopt the analytics-dashboard shell; controls to `toolbar`/`viewOptions`; card titles become section headings inside one frame.

### 5. Sweep
Re-run the scan; zero `page-*` / `retired-surface-header-props` hits. Brand-token scan reports 1 hit (separate, ADR-0007) — out of scope here, file via `/ticket` if not already tracked.

## Verify (every PR)
- Typecheck, lint (incl. `lint-design.mjs`), the test suite, the project's own gates.
- Re-run `node node_modules/design-baseline/scripts/scan-adoption-quality.mjs --root <src-root> --signals node_modules/design-baseline/docs/audit-signals.json`; red signals at zero, yellows fixed or ticketed.
- Browser check of each migrated page: exactly one `h1`, one control band, controls work.
