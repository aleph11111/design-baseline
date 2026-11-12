# Changelog

One entry per `package.json` version (`## v<version>`), newest first. Each records what changed, what a consumer must do, and whether it is breaking. `scripts/verify-package-version.mjs` fails `npm test` on a version bump without an entry here. Per-archetype removals live in the migration table in `docs/PACKAGE.md`.

## v0.45.0

- **Changed:** `GroupedListShell` renders a `PageFrame` stack body (contract v4.5, MANIFEST 4.5, ADR-0015): each `GroupedListSection` is its own bordered, rounded card on the canvas with a stack gap between (the `space-y-8` wrapper is gone), the toolbar band rides on the first card, and the loading / empty / error planes render inside one card (`data-slot="grouped-list-state"`).
- **Consumer:** none required.
- **Breaking:** no (visual change only).

## v0.44.0

- **Changed:** `DetailOverviewShell` renders a `PageFrame` stack body (contract v4.4, MANIFEST 4.7, ADR-0015): each main-column `DetailSection` and the stat-tile row is its own bordered, rounded card on the canvas with the stack's gap. The identity sections stay chromeless and hairline-divided inside one card — the sticky rail (`layout="rail"`, one card at `lg`; below `lg` the summary and references are one card each, references still last) or the summary band (`layout="vertical"`). `width` presets and the rail's sticky clamp are unchanged. Nested under a parent `PageFrame` the body keeps the flat look.
- **Consumer:** none required.
- **Breaking:** no (visual change only).

## v0.43.0

- **Changed:** `SettingsSectionsShell` renders a `PageFrame` stack body (settings-sections contract v1.1, MANIFEST 1.1, ADR-0015): each `SettingsSection` is its own bordered, rounded card on the canvas with a gap between; the `divide-y` wrapper is gone and `data-slot="settings-sections"` is kept on a `display: contents` wrapper inside the stack body, so existing selectors keep working.
- **Consumer:** none required.
- **Breaking:** no (visual change only).

## v0.42.0

- **Changed:** `DashboardShell` renders a `PageFrame` stack body (contract v4.7, MANIFEST 4.7, ADR-0015): a band-only first card holds the filters when any band slot is set, the KPI row is one raised card, and each `DashboardWidget` is its own bordered, rounded `SectionCard`. `DashboardGrid` is a gapped grid (`gap-4 md:gap-5`, same column breakpoints) with no hairline cell rules. Edit mode (move/configure/remove, drag and drop) is unchanged; the drop target shows a ring instead of a fill.
- **Consumer:** none required.
- **Breaking:** no (visual change only).

## v0.41.0

- **Changed:** `BoardShell` renders a `PageFrame` stack body (kanban-board contract v3.5, MANIFEST 3.5, ADR-0015): the toolbar band sits on a band-only first card (an empty `SurfaceFrame`, rendered only when the band has content); the lane row (`data-slot="board-lanes"`) follows on the canvas and keeps its own horizontal scroller and the full-bleed marker.
- **Changed:** `BoardCard` is the raised card — `rounded-lg`, hairline border and `surface-raised` fill on the canvas (was `rounded-md border bg-card`); nested in another raised surface it drops both. `BoardColumn` lanes move from the canvas tone to `bg-surface-sunken`, still unbordered. Refs, prop spreading and the dashed empty drop zone are unchanged.
- **Added:** `useRaisedChrome()` in `layout/surface.ts` — the one raised-surface chrome string (border + fill unless nested); `SurfaceFrame`, `StatTileRow` and `BoardCard` read it.
- **Consumer:** none required.
- **Breaking:** no (visual change only).

## v0.40.0

- **Changed:** `TransactionDocumentShell` renders a `PageFrame` stack body (contract v1.3, MANIFEST 1.3, ADR-0015): next step, ledger, facts and history are each their own bordered `SectionCard` on the canvas (`data-slot`s unchanged); the next-step card keeps its tone fill as the toned callout. The phone's sticky primary bar stays in the stack body, outside every card.
- **Changed:** the Td page width has one bound. The shell's local `max-w-4xl` is gone; its root carries the derived marker `DOCUMENT_COLUMN_CLASS` (`db-document-column`, `layout/surface.ts`, dropped when nested), and `AppShell`'s content column bounds itself to the new `--db-document-max: 896px` token when it holds one — the wide-desk steps no longer apply (ADR-0015 amendment to ADR-0007 §1).
- **Added:** `SectionCard` passes `id`, `aria-*` and `data-*` attributes to its `<section>` (identity hooks only; no `style` or handlers).
- **Changed:** the `tapOverlap` page invariant (`design-baseline/testing/invariants`) no longer counts a bottom-pinned bar (sticky/fixed with `bottom` set, below the target's top) as a neighbour's overhang when the page can still scroll the target clear above it — for every page. A top-pinned bar, or a target behind a bar on a page that cannot scroll it clear, still fails (fixture-tested). Td needed it once the stack body let its phone bar actually stick over the scrolling cards.
- **Consumer:** none required.
- **Breaking:** no (visual change only).

## v0.39.0

- **Changed:** every un-nested raised surface — `SurfaceFrame` (so every `PageFrame` page), `SectionCard` (default and `muted` tone) and `StatTileRow` — now carries a hairline `border` on the canvas; a raised surface nested in another drops both border and fill, including a nested `muted` `SectionCard` (ADR-0015, superseding ADR-0007 §3).
- **Added:** `PageFrame` `body?: "frame" | "stack"` (default `"frame"`). `"stack"` renders the `PageHeader`, then each child as its own raised card in a gap column, with the toolbar band on the first card (`ToolbarLeadContext`; `SectionCard` / `SurfaceFrame` render it above their title bar). Omitted from `PageShellFrameProps`: the archetype shell chooses it. No shell uses it yet.
- **Added:** `_adherence.json` rule `pageframe-body-call-site` (error) — `body=` on `<PageFrame>` outside `src/components/archetypes/**` and `src/components/layout/**` — and the scanner's `wholeFile: true` pattern mode for multi-line JSX tags.
- **Consumer:** none required; pages render a hairline border around their surface after updating.
- **Breaking:** no (visual change only).

## v0.38.1

- **Changed:** the toolbar band moves out of `PageFrame` into one internal `ToolbarBand` (+ `BandChrome`), used by `PageFrame`, `SurfaceFrame` and `SettingsTableBody`. `MAX_INLINE_FIELDS` is still exported from `PageFrame`.
- **Fixed:** a `SettingsTableBody` toolbar now collapses into the Filter sheet below `md` and past four inline fields, like every `PageFrame` page, instead of wrapping; on desktop the tab band no longer wraps, it scrolls sideways and moves fields past four into the sheet.
- **Consumer:** none.
- **Breaking:** no.

## v0.38.0

- **Added:** transaction-document mockup fidelity (contract v1.2, MANIFEST 1.2). The shell bounds its content column (`max-w-4xl`) so ledger amounts stay beside their labels on wide screens. `TransactionLedger.result?: LedgerResult` (`{ label, value, kind, detail? }`, toned by its sign) renders one emphasized result line after the totals. `TransactionNextStep.tone?: TransactionNextStepTone` (`default | warning | danger | success`, contract-keyed to the state; omitted = the unchanged neutral panel) tones the panel; `_adherence.json` excludes it from `archetype-appearance-noun-prop` citing that keying rule. `TransactionIdentity.progress?: TransactionProgressStep[]` (`{ label, state: "done" | "current" | "pending" }`) renders one quiet ordered progress line under the summary, current step bold. Demo: the sales order declares Charged · Cost only, a Profit result line, a warning next step and a progress line.
- **Added:** label key `documentProgress` (`BaselineLabels`, En + De).
- **Not adopted:** the mockup's one-card-per-section — sections stay inside the frame's one raised surface (ADR-0008 §3, no card-in-card).
- **Consumer:** brickshop-manager `/orders/:id` drops its per-line Profit/Margin columns for `ledger.result`, sets `nextStep.tone: "warning"` for stuck shipments, and passes `identity.progress`.
- **Breaking:** no, unless you build a full `BaselineLabels` object by hand (add `documentProgress`). The Td page column is now bounded.

## v0.37.0

- **Added:** transaction-document ledger cell locks and in-ledger add/remove (contract v1.1, MANIFEST 1.1). `LedgerRow.locks?: Record<columnKey, Lock>` closes one line's cell in an editable column — read-only value plus a `LockNote` naming the column, its reason and way out — while other lines stay editable. `TransactionLedger.onAddRow` (+ optional `addRowLabel`, default "Add line") renders the ledger's own add control; `onRemoveRow(rowId)` adds a remove control per line (`LedgerRow.removable: false` opts a line out). `LedgerRow.actions?: LinkAction[]` renders per-line links. A locked ledger shows neither add nor remove. Demo: the purchase order has editable Cost with one cell locked to the accepted offer and add/remove lines.
- **Added:** label key `addLine` (`BaselineLabels`, En + De).
- **Consumer:** brickshop-manager `/orders/:id` can lock item-line Cost cells with `locks: { cost: … }` and move Add cost / delete-line out of the header menu into `onAddRow` / `onRemoveRow`.
- **Breaking:** no, unless you build a full `BaselineLabels` object by hand (add `addLine`).

## v0.36.0

- **Added:** `DashboardPeriodPair` halves (`month` / `ytd`) accept `{ label, body, actions? }` (types `DashboardPeriodBody`, `DashboardPeriodHalf`) besides the figure form: the label is a sub-heading, `body` a chart, `actions` an edit button beside it. Contract v4.4, MANIFEST 4.6.
- **Consumer:** controlling-app `/workspace/dashboard` renders each KPI's month + YTD chart tiles as one `DashboardPeriodPair` with chart-body halves.
- **Breaking:** no. The figure form renders as in v0.35.0.

## v0.35.0

- **Added:** `DashboardPeriodPair` (analytics-dashboard contract v4.3, MANIFEST 4.5), exported from `design-baseline/archetypes/analytics-dashboard`, with types `DashboardPeriodPairProps` and `DashboardPeriodFigure`. One widget holds a metric's month and year-to-date figures (`title`, `month`, `ytd` as `StatTile` label / value / hint; optional `description`, `actions`, `edit`, and `state` — the Layer 7 loading / empty / error plane that replaces both figures in the same cell): month left, YTD right, stacked month first on the one-column layout. It takes no `span`: the Layer 6 keying rule fixes the paired-period kind at full width, so a pair never splits across grid rows and two pairs are two rows. `DashboardGrid` keeps its fixed 1 / 2 / 3 columns. Living demo: two pairs at the top of the analytics-dashboard gallery entry, plus a "Month + YTD pair" kind in its tile config dialog.
- **Consumer:** controlling-app `/workspace/dashboard` replaces each month + YTD pair of one-column widgets with one `DashboardPeriodPair`.
- **Breaking:** no.

## v0.34.0

- **Added:** `FeedbackButton` in `design-baseline/layout`: a floating button opening a keyboard-operable dialog (textarea, Ctrl/Cmd+Enter submits, pending and error states, closes only on success). It hands a typed `FeedbackPayload` (`text`, `appName`, `version`, `route`, `userId`, `userRole`, `userAgent`, `consoleErrors`, `timestamp`) to the app-supplied async `onSubmit`; it never sends mail itself. Also exported: pure `formatFeedbackMail(payload)` → `{ subject, body }` (subject `[feedback] <app>: <first line>`, free text first, then a labelled context block) and `installConsoleErrorBuffer()` (idempotent; keeps the last 10 `console.error` messages). No screenshot and no `html2canvas` in v1. Gallery entry: `FeedbackButton`.
- **Consumer:** optional. Call `installConsoleErrorBuffer()` once at startup, mount `<FeedbackButton … onSubmit={…} />`, and send `formatFeedbackMail(payload)` to the intake mailbox from the backend.
- **Breaking:** no.

## v0.33.0

- **Added:** archetype `Td` (`transaction-document`, page kind), exported from `design-baseline/archetypes/transaction-document`. `TransactionDocumentShell` is the page for a sales order, offer or purchase order: five typed slots placed by the shell and no free content slot — `identity` (number with copy, one status, one attention flag, a summary sentence, the document `chain`), `nextStep` (the only home of the primary action, plus its automatic `sideEffects` `{ label, state: done | pending | failed, link? }`; pinned to the bottom on a phone), `ledger` (columns declared per document type with a `priority`; columns that don't fit move into each row's second line, so it never scrolls sideways; editable mode via `onCellChange` on `editable` columns), `facts` (typed, locale-formatted, each with an optional Change link) and `history` (collapsed). Header `actions` take the typed model without `primary` (≤ 2 secondaries inline, the rest in ⋯). `locks` (slot) and `lock` (fact / ledger column) render a reason plus a way-out link. Helpers `fitColumns`, `parseFigure`. Contract: `docs/archetypes/transaction-document.md`; ADR-0014; scaffold with `design-baseline new-page transaction-document <Name>`.
- **Added:** label keys `copyId`, `idCopied`, `documentChain`, `nextStep`, `runningAlongside`, `sideEffectDone`, `sideEffectPending`, `sideEffectFailed`, `ledger`, `ledgerItem`, `facts`, `history`, `locked` (`BaselineLabels`, En + De).
- **Gallery:** `check:viewports` runs all three transaction-document demo documents at the triad and the sweep widths, asserting no sideways ledger scroll, the long title in full, and the pinned phone primary.
- **Consumer:** none required. brickshop-manager can rebuild `/orders/:id`, the offer pages and the purchase-order page on `TransactionDocumentShell`. A custom `BaselineLabels` object must add the new keys.
- **Breaking:** no, unless you build a full `BaselineLabels` object by hand (add the keys above).

## v0.32.0

- **Added:** `design-baseline/testing/devices` exports `laptop14Window` (1133 x 739, scale 2, a real 14-inch MacBook Chrome window) and `widthSweep` (1024 / 1133 / 1280 at height 739). Invariant-only real-window widths, not delivery devices: `devices` and `playwrightProjects` still hold exactly `desk27`, `laptop14`, `phone`. `check:viewports` runs the page invariants for every `kind: page` archetype at each sweep width (no screenshots), with its own per-page-and-width `SWEEP_GAPS` map (docs/STYLE.md "The device triad").
- **Gallery:** the detail-overview demo header uses typed actions (nine verbs incl. a destructive Delete order), so the sweep exercises a crowded header row at 1133 wide. Its triad pixel baselines changed accordingly.
- **Consumer:** optional — a consumer's Playwright suite may call `assertPageInvariants(page, device)` at `widthSweep` too. No change needed.
- **Breaking:** no.

## v0.31.0

- **Added:** typed page-header actions on `PageFrame` (so every page shell): `actions={{ primary, secondary, menu, renderLink }}` with `HeaderAction = { label, onSelect?, href?, icon?, disabled?, destructive? }`. One shared renderer behind all three `PageFrame` paths (default `PageHeader`, nested `NestedPageHeading`, host-titled row) enforces the existing PLACEMENT.md rule: at most 1 primary + 2 secondary buttons inline, the rest behind one `⋯` menu (`RowActionsMenu` with a header trigger, label `headerActions` "More actions" / "Weitere Aktionen"), and a `destructive` action only inside that menu. `StructureBuilderShell` merges its History / Save into the typed form. `design-baseline/layout` exports `HeaderAction`, `HeaderActionItem`, `HeaderActions`, `isHeaderActions`, `MAX_SECONDARY_ACTIONS`. Living demo: "9 typed actions" in the `PageFrame` gallery entry.
- **Added:** `RowActionsMenu` items take an optional `href` (rendered through a new optional `renderLink` hook, default `<a>`), `onSelect` is optional, and `row` may be omitted for `RowActionsMenu<void>`.
- **Deprecated:** passing rendered nodes to `PageFrame` `actions` (typed as the `@deprecated` alias `LegacyHeaderActions`, so only the node form is flagged). It renders unchanged for this minor and bypasses the hierarchy; it will be removed in a later breaking bump, tracked by backlog ticket `docs/backlog/remove-pageframe-flat-actions-node-form.md` (controlling-app, hk-crm, brickshop-manager migrate first).
- **Consumer:** move header actions to the typed form (controlling-app, hk-crm, brickshop-manager — e.g. brickshop-manager `/orders/:id` with 9 actions incl. Delete Order).
- **Breaking:** no.

## v0.30.0

- **Added:** `body` and `dock` slots on `MatrixGridShell` (`matrix-grid` contract v3.8, MANIFEST 3.8, ADR-0013). `body` renders below the grid in the same column (a config panel, read-only preview matrices as nested `MatrixGridShell`s); `dock` renders last (a summary). With the `inspector` docked, grid, `body` and `dock` share the column beside it. The contract narrows "one matrix per route" to one *editable* matrix; read-only previews in `body` are conformant. Living demo: mode "workbench" in the matrix-grid gallery entry. `check:viewports` checks it at the device triad with the inspector open.
- **Consumer:** none required. controlling-app `workspace/planung` can move off bare `PageFrame` onto `MatrixGridShell` with `inspector` + `body` + `dock`.
- **Breaking:** no. Without `body` / `dock` the shell renders unchanged.

## v0.29.5

- **Fixed:** `HeadingRow` (so `PageHeader`, `NestedPageHeading` and every shell through `PageFrame`) keys its side-by-side layout on the row's own container width (`@container`, `@xl:`) instead of the viewport `sm:` breakpoint, and the actions block no longer carries `shrink-0`: it wraps within at most 60% of a side-by-side row. In a sidebar-narrowed content column a header with many actions no longer collapses the title or overflows `main`. Living demo: "Order title + 9 actions in a ~780px column" in the `PageHeader` gallery entry.
- **Consumer:** none. Supersedes the v0.10.3 viewport-`sm` stacking.
- **Breaking:** no. A header in a wide column renders unchanged (title left, actions right). A header whose own column is under 36rem now stacks its actions beneath the title even on a wide viewport (the `settings-table` desk27 baseline changed only for its ~430px "Empty (with CTA)" column).

## v0.29.4

- **Changed:** completes the v0.29.2 touch lift. `useTouchLift` now reads `useAppDensity() === "lg"` and lifts only an explicit `sm` (and `Input`'s `sm14`) to `lg` (`h-11`); an explicit `default` is no longer lifted (it stays `h-9`, as `lg` / `lg18` stay). `Button size="sm"`, `SegmentedControl size="sm"` and `ToggleField size="sm"` now lift too, beside `Input`, `SelectTrigger` and `SearchInput`. `docs/STYLE.md` "App touch density" names all six primitives and the opt-out.
- **Gallery:** the settings-table demo carries a dense `Input size="sm"` table column, so `check:viewports` runs `tapTargets` on it at the phone device.
- **Consumer:** none needed. A consumer that relied on v0.29.2 lifting an explicit `default` on touch gets `h-9` back.
- **Breaking:** no. Non-touch renders are byte-identical.

## v0.29.3

- **Fixed:** `design-baseline/testing/invariants` no longer reports `phoneNav` ("phone has no navigation") on a centered off-app screen. `AuthCard` now carries `data-slot="auth-card"`, and the check is skipped when that marker is present and no `AppShell` content column is; the "desktop sidebar on phone" branch and every other invariant are unchanged.
- **Consumer:** none needed; drop `phoneNav` from `KNOWN_FAILING` for sign-in / not-authorized / 404 cells (e.g. controlling-app `login` @ phone).
- **Breaking:** no. An `AppShell` page with no BottomNav or sidebar trigger still breaches `phoneNav`.

## v0.29.2

- **Changed:** under app touch density (phone default, `density="touch"`), an explicit compact step lifts to `lg` (`h-11`) on `SelectTrigger` (`size`), `Input` (`size` `sm` / `sm14` / `default`) and `SearchInput` (`inputSize` `sm` / `default`), the same lift `Button`'s `icon` / `icon-sm` already get. `lg` / `lg18` are unchanged. `docs/STYLE.md` "App touch density" documents it.
- **Consumer:** none needed; `size="sm"` call sites that failed the `tapTargets` invariant on phone now pass. Without touch density nothing changes.
- **Breaking:** no. Non-touch renders are byte-identical.

## v0.29.1

- **Added:** `MatrixGridShell` takes `backHref` / `backLabel` (and `renderBackLink`), the same three props as the other shells (`matrix-grid` contract v3.7, MANIFEST 3.7). A matrix page under a parent route shows the page header's back link. Living demo: the matrix-grid gallery entry passes `backHref` / `backLabel`.
- **Consumer:** optional. controlling-app's planset editor can move its hand-placed link out of `subtitle` into `backHref` / `backLabel`.
- **Breaking:** no. A matrix-grid page without the props renders unchanged.

## v0.29.0

- **Added:** `inspector` slot on `MatrixGridShell` (`matrix-grid` contract v3.6, MANIFEST 3.6). A selection-driven, non-modal panel for the select → tune → next-line job: docked at ~480px beside the grid from `md` (no backdrop; the grid narrows and stays clickable, a click on another cell re-roots the open panel), the full-screen overlay on phone. The consumer owns `selection` (`{ rowId, columnKey }`) and `onSelectionChange`; the panel carries prev / next (rows, keeping the column), close and Escape. `onBeforeSelect(next, current)` — `boolean | Promise<boolean>` — guards every switch; omitted, switches are immediate. The shell owns no save model. New exported types `MatrixInspectorProps`, `MatrixSelection`. Living demo: mode "inspector" in the matrix-grid gallery entry (draft-with-apply body with a discard guard). `check:viewports` checks the inspector at the device triad.
- **Consumer:** none required. controlling-app's planset `LinePanel` and planung `InspektorDrawer` can drop their `Sheet`s (and the local `InspectorDock` / `DockLayout` draft) for `inspector` on their grid's `MatrixGridShell`.
- **Breaking:** no. Without `inspector` the shell renders unchanged (the scroll box gains `min-w-0 flex-1`, inert outside a flex row).

## v0.28.1

- **Fixed:** `DetailOverviewShell layout="rail"` rendered `references` above stats and content below `lg` (summary and references shared one rail block ahead of main). The rail now dissolves below `lg` and `references` sorts last, so the narrow order is the contract's `header → summary → stats → content → references`. One mount per slot; the wide-viewport rail (sticky, foot clamp, inset hairlines) and `layout="vertical"` are unchanged. MANIFEST `detail-overview` 4.6; the contract already states the narrow order, so its version (4.3) is unchanged.
- **Consumer:** none. Rail pages that pass `references` now show them at the page end on phones.
- **Breaking:** no.

## v0.28.0

- **Added:** enrichment affordances on `KeyValueRow` (`detail-overview` contract v4.3, MANIFEST 4.5). `provenance` (`{ source, id?, date?, via?, cost? }`) renders a compact source chip beside the value; the full provenance opens in a popover on click, tap or keyboard. `alternatives` (`{ value, provenance? }[]`) keeps the row's value as the winning claim, adds a conflict marker, and lists every claim with its source in the same popover pattern. `missing` (`true | { reason? }`) renders a dashed, muted marker distinct from a real value and from `"—"`, with the reason when given. `labels` carries the copy (`missing`, `contested`, `source`; English defaults). New types `KeyValueProvenance`, `KeyValueClaim`, `KeyValueRowLabels`. `value` is now optional (omit it with `missing`). Living demo: section "Data & sources" in the nested detail-overview gallery entry.
- **Consumer:** none required. hk-sales-agent's Firmenakte ledger ("Daten & Quellen", "Lücken & Konflikte") can drop its hand-rolled source lines, stacked claims and "Fehlt" rows for these props.
- **Breaking:** no. A row with only `label` / `value` / `block` renders byte-identical markup.

## v0.27.0

- **Added:** `lint-design`'s `pageShell` rule accepts `AuthCard` as the shell of an off-app centered-card page (sign-in, not-authorized, 404). A page passes when it imports `AuthCard` from `design-baseline/layout` or `@/components/layout/AuthCard`, imports no `AppShell`, and imports no `PageFrame` (still an error). No new archetype; `AuthCard` stays a layout primitive.
- **Consumer:** remove the `grandfathered` entries of `AuthCard`-only pages from `_adherence.json` once you refresh the script (the ratchet reports them as stale): controlling-app `login/page.tsx` and `not-authorized/page.tsx`; brickshop-manager `src/pages/Auth.tsx`, `src/pages/NotFound.tsx` and `src/pages/public/SharedListGate.tsx`.
- **Breaking:** no. Pages that passed before still pass.

## v0.26.0

- **Added:** slide-deck variant of `print-statement` (contract v1.1, MANIFEST 1.1). `PrintStatementShell` takes `pageSize="none"` — no `@page` rule and no table-only print rules, so a body with its own page rule (a fixed 1280x720 deck, one slide per sheet) owns page size and margin — and `hideHeader`, which keeps the title in the DOM for assistive tech but takes the header out of the screen and print layout, so the deck's cover slide starts page 1. Toolbar, early states and once-only auto print are unchanged. Living demo: Mode "Slide deck" in the print-statement gallery entry.
- **Consumer:** none required. controlling-app's `print/bankenreporting` and `print/internal-reporting` deck routes can move onto `PrintStatementShell pageSize="none" hideHeader`.
- **Breaking:** no. Additive; defaults (`a4-landscape`, header shown) render unchanged.

## v0.25.0

- **Added:** back link to the parent page on the four list/table-style full-frame shells — `GroupedListShell` (contract v4.1, MANIFEST 4.4), `FeedShell` and `FeedMasterDetailShell` (contract v2.3, MANIFEST 3.8), `BoardShell` (contract v3.1, MANIFEST 3.4), and `StatementWithFiltersShell` (contract v2.5, MANIFEST 2.7). Each now takes `backHref` / `backLabel`, with `renderBackLink` injecting the router link — same three props, same names as `detail-overview`, `form-page` and `list-with-detail` (v0.24.0). Layer 3 (page header) lists them as an allowed variation: "back to the parent page". The remaining shells (`settings-table`, `matrix-grid`, `calendar`, `analytics-dashboard`, `structure-builder`) sit at top-level routes and are unchanged until a consumer page under a parent needs one.
- **Consumer:** none required — the props are optional; a shell without `backHref` renders no back link (unchanged). A list/table-style page that sits under a parent and renders `PageFrame` alone (the motivating case: hk-sales-agent list pages under a parent route) can switch to the shell with `backHref=…` and keep its back link while passing the `pageShell` lint rule.
- **Breaking:** no. Additive; no breaking change. `PageShellFrameProps` is unchanged, so the `TakesEveryFrameSlot` gate (`page-shell-frame-slots.test.tsx`) stays green for every shell.

## v0.24.0

- **Added:** back link to the parent page on the `list-with-detail` shell (contract v4.4, MANIFEST 4.7). `ListWithDetailShell` now takes `backHref` / `backLabel`, with `renderBackLink` injecting the router link — same three props, same names as `detail-overview` and `form-page`. Layer 3 (page header) lists them as an allowed variation: "back to the parent page".
- **Consumer:** none required — the props are optional; a shell without `backHref` renders no back link (unchanged). A list page that sits under a parent and renders `PageFrame` alone (hk-sales-agent's suchprofile list, Trefferliste, Export-Liste, Suchlauf-Liste) can switch to `ListWithDetailShell backHref=…` and keep its back link while passing the `pageShell` lint rule.
- **Breaking:** no. Additive; no breaking change.

## v0.23.2

- **Changed:** three source comments (`NestedPageHeading`, `StatTileRow`, `DashboardWidget`) cited RULES.md "hard rule 12" for appearance locality; it is rule 10. Comment text only.
- **Consumer:** none.
- **Breaking:** no.

## v0.23.1

- **Changed:** `PLAYWRIGHT_IMAGE` (`design-baseline/testing/docker`) is pinned by `@sha256` digest instead of the mutable `-noble` tag, and the `screenshots` CI job uses the same ref. `design-baseline-playwright` mounts the project's `.git` read-only, so container code cannot plant git hooks that run on the host. `docker.test.ts` fails if the digest in `docker.mjs`, `check.yml` and `docs/STYLE.md` differ.
- **Consumer:** none required. A consumer workflow that names the image tag itself should use `PLAYWRIGHT_IMAGE`'s `@sha256` ref. Bumping `PLAYWRIGHT_VERSION` now means re-resolving the digest (`docs/PACKAGE.md`).
- **Breaking:** no.

## v0.23.0

- **Added:** archetype `Sb` (`structure-builder`, page kind), exported from `design-baseline/archetypes/structure-builder`. `StructureBuilderShell` is the page that edits a hierarchical structure against a palette of items to place: the template list plus "New" / "Clone" in the toolbar band, "Version history" (a side sheet holding the `history` content) and the deferred-bulk-save "Save" in the header, an "Unsaved changes" badge while `dirty`, and a body of the tree beside an aside holding the palette and the `coverage` check (`{ unplaced, duplicates? }`). `isLoading` / `error` / `isEmpty` replace the body; error wins over loading. `StructureTree` is the keyboard-operable WAI-ARIA tree (Alt+Arrow Up/Down reorders, Alt+Right indents into the line above, Alt+Left outdents; moves are announced) with native HTML5 pointer drag and palette drops (`STRUCTURE_PALETTE_TYPE`). Pure helpers `moveNode`, `insertNode`, `findNode`, `findPosition`, `keyboardTarget`, `dropTarget`. No DnD dependency. Contract: `docs/archetypes/structure-builder.md`; ADR-0012; scaffold with `design-baseline new-page structure-builder <Name>`.
- **Added:** label keys `structureNew`, `structureClone`, `structureHistory`, `structureTree`, `structureEmpty`, `structureMoveHint`, `structureMoved`, `structurePlace`, `unsavedChanges`, `coverageComplete`, `coverageUnplaced`, `coverageDuplicates` (`BaselineLabels`, En + De).
- **Consumer:** none required. controlling-app can move `workspace/pnl-builder` onto `StructureBuilderShell` (its `EditableReport` may stay the tree if it meets the contract's keyboard rule) and drop it from its grandfathered page-shape list; `bs-builder` unblocks. A custom `BaselineLabels` object must add the new keys.
- **Breaking:** no, unless you build a full `BaselineLabels` object by hand (add the keys above).

## v0.22.1

- **Changed:** the `pageShell` lint hint (`scripts/lint-design.mjs`) and `docs/RULES.md` rule 12 / `docs/PACKAGE.md` now say an agent never adds the `// archetype-gap:` waiver; only the operator ships a waived page, by merging it by hand. The old "approval recorded in the PR body" wording was forgeable. Wording only; waiver matching, severity and the grandfather ratchet are unchanged.
- **Consumer:** none required. Refresh a vendored `lint-design.mjs` to see the new hint. Agent skills that still say approval is recorded in the PR body (e.g. `choosing-a-page-archetype`) should be reworded the same way.
- **Breaking:** no.

## v0.22.0

- **Added:** analytics-dashboard (G) **edit mode** (contract v4.2, MANIFEST 4.4, ADR-0011) for pages that edit a dashboard's tile layout. `DashboardTitleEditor` is the inline rename passed as the shell's `title` (Enter / save button saves, Escape cancels, blur saves; a rejected `onRename` keeps it open). `DashboardWidget` takes an optional `edit` object (`name`, `index`, `count`, `onMove(from, to)`, `onConfigure`, `onRemove`): the cell gains move earlier / move later / configure / remove buttons named after the tile (keyboard-operable reorder) and becomes a native drag-and-drop source and target. `DashboardAssignmentList` is the assignment checklist after the grid (`targets` with `assigned` / `pending`, `onToggle`). The tile config dialog stays consumer-owned; it sets the tile's kind, and `span` is still derived by the Layer 6 keying rule.
- **Added:** label keys `rename`, `configureNamed`, `removeNamed`, `moveEarlier`, `moveLater` (`BaselineLabels`, En + De).
- **Added:** `npm run check:viewports` also checks analytics-dashboard in edit mode at the device triad.
- **Consumer:** none required. controlling-app can move `admin/dashboard-templates/[id]` (and the layout-unlocked `workspace/dashboard`) onto `design-baseline/archetypes/analytics-dashboard` and drop the template editor from the `page-requires-archetype-shell` grandfathered list; `@dnd-kit` sortable lists of tiles go. A custom `BaselineLabels` object must add the five new keys.
- **Breaking:** no, unless you build a full `BaselineLabels` object by hand (add the five keys).

## v0.21.0

- **Added:** archetype `Pr` (`print-statement`, page kind), exported from `design-baseline/archetypes/print-statement`. `PrintStatementShell` is the print-only statement route: no app chrome, a screen-only toolbar (hint + "Print / Save as PDF", hidden under print media), the document `title` / `subtitle` / `meta` header, and an unbounded body whose table header rows repeat on every printed page. `pageSize` (`"a4-landscape"` default, `"a4-portrait"`) emits the `@page` rule with a 12 mm margin. `isLoading` / `error` / `onRetry` replace the whole document, so no print action is offered for a partial statement. `autoPrint` (default `true`) opens the print dialog once, `PRINT_DELAY_MS` after the first ready render. Contract: `docs/archetypes/print-statement.md`; scaffold with `design-baseline new-page print-statement <Name>`.
- **Added:** the `printHint` / `printAction` label keys (`BaselineLabels`, En + De).
- **Added:** `npm run check:viewports` also checks `print-statement` under print media (toolbar hidden, `@page` A4 landscape / 12 mm).
- **Consumer:** none required. controlling-app can move its eight `app/print/*` routes onto `PrintStatementShell` and delete `PrintPageShell` and `useAutoPrint`; each `Print*View` drops its own `<h1>` header into the shell's `title` / `subtitle` / `meta`. A custom `BaselineLabels` object must add `printHint` and `printAction`.
- **Breaking:** no, unless you build a full `BaselineLabels` object by hand (add `printHint`, `printAction`).

## v0.20.2

- **Changed:** `zod` floor raised to `^4.6.7` (GHSA-mrhx-c7xc-m3w5, memory exhaustion validating oversized collections); donor-dev toolchain (`vite`, `vitest`, `react-router-dom`) and transitive advisories patched in the lockfile.
- **Consumer:** none required beyond installing; the `zod` range now excludes vulnerable versions, so a consumer lockfile pinned below 4.6.6 will be bumped.
- **Breaking:** no.

## v0.20.1

- **Changed:** the `pageShell` lint hint and `docs/RULES.md` rule 12 / `docs/PACKAGE.md` now say the `// archetype-gap: <ticket-slug>` waiver requires explicit operator approval to ship before the gap closes, recorded in the PR body; otherwise page work stops and the page ticket is blocked on the gap ticket. Wording only: matching, severity and the grandfather ratchet are unchanged.
- **Consumer:** none required. Update the pin to see the new hint text.
- **Breaking:** no.

## v0.20.0

- **Added:** archetype `Cb` (`raw-combobox`, component kind), exported from `design-baseline/archetypes/raw-combobox`. `ComboboxField` is the searchable sibling of `SelectField`: label + trigger + popover search list with groups, keyboard (arrows / Enter / Escape, typing filters) and combobox/listbox ARIA, on the shared field frame (hint, error, required). Options are `{ value, label, group?, keywords?, disabled? }` data. Async: pass `onSearch` (and `loading`) and the caller owns filtering. Contract: `docs/archetypes/raw-combobox.md`.
- **Added:** `selectTriggerVariants` is exported from `design-baseline/ui/select`; the `noResults` label key (`BaselineLabels`, En "No results." / De "Keine Treffer.").
- **Added:** lint rule `hand-rolled-combobox` (`handRolledCombobox: true`, `warn`) — flags a picker built from local open + search state filtering an options list with its own keyboard / outside-click handling (`docs/PACKAGE.md` gate 2).
- **Consumer:** none required. To adopt, add the `hand-rolled-combobox` rule to your `_adherence.json` and replace flagged pickers with `ComboboxField` (controlling-app `AccountCombobox` first). A custom `BaselineLabels` object must add `noResults`.
- **Breaking:** no, unless you build a full `BaselineLabels` object by hand (add `noResults`).

## v0.19.0

- **Added:** `design-baseline/testing/invariants`, the `check:viewports` layout invariants as a Playwright helper.
  - `assertPageInvariants(page, device, options?)` throws, listing every failure, and returns the known-gap warnings. `checkPageInvariants` returns `{ failures, knownGaps }`. `TAP_TARGET_MIN` is 44.
  - The checks: no sideways scroll; nothing cut off at the viewport edge; one-row desktop toolbar; phone filters in the filter sheet; phone nav (BottomNav or sidebar sheet); 44pt phone tap targets; and the edge-tap overlap probe. With the options `column` / `fullBleed` it also checks the content column.
  - Each problem carries a code (`overflow`, `clipped`, `column`, `fullBleed`, `toolbarRows`, `phoneToolbar`, `phoneNav`, `tapTargets`, `tapOverlap`). `options.knownGaps: { <code>: "<ticket-slug>" }` downgrades that code to a reported warning.
- **Donor:** `check:viewports` now calls the export, so there is one implementation. Its results are unchanged.
- **Consumer:** in your Playwright suite, call `await assertPageInvariants(page, devices.<name>)` per page and device, after the page settles (`docs/PACKAGE.md` gate 3). Don't port the checks.
- **Breaking:** no.

## v0.18.0

- **Added:** `design-baseline/testing/docker`: `PLAYWRIGHT_VERSION` (1.63.0), `PLAYWRIGHT_IMAGE` (`mcr.microsoft.com/playwright:v1.63.0-noble`), `inPlaywrightImage()` and `assertInPlaywrightImage()`. The assert throws outside that image, or when the installed Playwright version is not exactly that one.
- **Added:** the `design-baseline-playwright` bin. `npx design-baseline-playwright <command>` runs any command inside the pinned image, with the project mounted and a Linux `node_modules` kept on a named volume.
- **Donor:** pixel baselines for every `kind: "page"` archetype at the device triad, 45 PNGs under `tests/screenshots/`. `npm run screenshots` compares them and `npm run screenshots:update` regenerates them, both only inside the image. CI gains a `screenshots` job in the same image. `@playwright/test` and `playwright-core` are pinned exactly.
- **Consumer:** to add gate 3, follow `docs/PACKAGE.md` "Gate 3 setup": pin `@playwright/test` exactly, use `playwrightProjects` plus `assertInPlaywrightImage()`, and run through `npx design-baseline-playwright`. No change is needed otherwise.
- **Breaking:** no.

## v0.17.0

- **Changed (consumer-visible):** phones are touch by default. An `AppShell` (or `ControlDensityProvider`) with no `density` prop resolves to touch below `md`, so on phones every control without an explicit size takes the 44pt `lg` step. Desktop renders are unchanged. An explicit `density` wins at every width.
- **Added:** `TOUCH_TARGET_CLASS` / `useTouchTarget()` (`design-baseline/ui/toolbar-band`). Under touch density this is a centred hit area of at least 44pt, an `::after`, around a box that keeps its size. It is applied to `Checkbox`, `Switch`, `Button` (so a className-shrunk `h-8` row-actions trigger still gets a 44pt target), `CollapsibleTrigger`, list-with-detail's sortable headers and `PageHeader`'s back link.
- **Added:** `TOUCH_TARGET_ROW_CLASS`, for flush siblings. Segmented pills and tab triggers get a real 44pt minimum width and a vertical-only hit area, so an edge tap never selects the neighbouring option.
- **Changed:** under touch, clickable matrix cells get a real 44pt height instead of an overlapping hit area. `SidebarTrigger` drops its 28px size and becomes a 44pt icon button.
- **Donor:** `check:viewports` now enforces 44pt phone tap targets. The `KNOWN_GAPS` entry is gone. A new edge-tap probe (`elementFromPoint` 1px inside each edge) fails when a tap reaches a neighbour's hit area. All 15 page archetypes pass at all three devices.
- **Consumer:** after re-pinning, check your phone screens; controls are taller. To keep the old 36px phone controls, pass `density="default"` to `AppShell`. Give your own small tap targets `useTouchTarget()`.
- **Breaking:** no API change. Phone layouts change visually.

## v0.16.0

- **Added:** `design-baseline/testing/devices`, the device triad every page is tested at: `desk27` (2560x1440, scale 1), `laptop14` (1512x982, scale 2), `phone` (390x844, scale 3, `isMobile`, `hasTouch`), plus `playwrightProjects` ready to spread into a Playwright config. Zero-dependency `.mjs` with types (STYLE.md "The device triad").
- **Added:** the toolbar band of `SurfaceFrame` and `PageFrame` carries `data-toolbar-band`, a stable hook for layout checks. Looks unchanged.
- **Donor:** `npm run check:viewports` replaces `check:desk-width`. It renders every `kind: "page"` archetype at the three devices in real Chrome, asserts the layout invariants (no sideways scroll, nothing cut off, column widths, one-row desktop toolbar, phone filters in the sheet, phone nav, 44px phone tap targets) and writes a contact sheet. It runs in CI. Phone tap targets are a known gap for now (`phone-tap-targets-touch-density-default`): reported, not failing.
- **Consumer:** replace hand-typed Playwright viewports (controlling-app 1440x900, hk-crm 1280x800) with `projects: playwrightProjects` from `design-baseline/testing/devices`.
- **Breaking:** no.

## v0.15.0

- **Added:** a `pageShell` rule type in `scripts/lint-design.mjs` (`docs/RULES.md` hard rule 12). Every file under the rule's `include` page glob must import a `kind: "page"` archetype shell from `design-baseline/archetypes/<slug>` or `@/components/archetypes/<slug>`. The slug list comes from the installed MANIFEST. A direct `PageFrame` import in a page file is an error. The one waiver is `// archetype-gap: <design-baseline ticket slug>`. `grandfathered` is a shrink-only list: a listed page that no longer violates, or no longer exists, is an error until its entry is removed. Each hit names the skill `choosing-a-page-archetype` and the no-fit path.
- **Added:** `scripts/lint-design.mjs` now ships in the package. Run it as `node node_modules/design-baseline/scripts/lint-design.mjs`.
- **Consumer:** to turn the gate on, add the rule to `_adherence.json` with your page glob and the list of current violators as `grandfathered` (`docs/PACKAGE.md`, "The page-shape rule"). Add the new-page line to `CLAUDE.md`. A vendored `scripts/lint-design.mjs` must be refreshed from the package before it understands `pageShell`. Configs without the rule behave exactly as before.
- **Breaking:** no. The rule is opt-in per consumer.

## v0.14.2

- **Fixed:** `FeedMasterDetailShell` below `@3xl`: selecting an item scrolls the detail pane (and its Back button) into view, and Back restores the list's scroll position and returns focus to the row that was opened, instead of dropping focus to `body`. Wide-surface behaviour is unchanged.
- **Consumer:** none required.
- **Breaking:** no.

## v0.14.1

- **Fixed:** `AppHeader` renders its `title` as a `<span>` (same classes), no longer an `<h1>`. The brand title sat beside every page's `PageHeader` `<h1>`, so each page had two h1s; the page title is the one h1 (ADR-0008). Looks unchanged.
- **Consumer:** none required. A test that finds the header title by `getByRole("heading")` should use `getByText`.
- **Breaking:** no API change; the header title leaves the heading outline.

## v0.14.0

- **Added:** `FeedMasterDetailShell` (`design-baseline/archetypes/feed-inbox`, archetype H v3.7, contract v2.2): the master-detail form of the feed page. The feed list sits beside the selected item's detail inside the one page surface (ADR-0008), with the same frame slots as `FeedShell` (`title`, `subtitle`, `badges`, `actions`, `toolbar`, `count`, ...). Props: `children` (the list pane), `detail` (the selected item's detail; nothing when none is selected), `emptyDetail` (required, fills the detail pane when nothing is selected), `onBack` (required, clears the selection), `empty` (replaces both panes when there are no items). Once the surface itself is `md` wide (48rem, a container query, not the viewport) the panes sit side by side and scroll independently; narrower, one column shows, and a selected detail carries a Back control that calls `onBack`. Checked in real Chrome against the gallery at 1440/1280 (split) and 1024/768/430 (swap, sidebar open at 1024 and 768).
- **Added:** `FeedItem` `selected` marks the item open in the detail pane (muted surface, `aria-current`).
- **Consumer:** brickshop-manager can replace its local `FeedShell mode="master-detail"` (`/activity`, `/messages`): `FeedShell.Filters` → `toolbar`, `FeedShell.List` → children, `FeedShell.Detail` → `detail`, `emptyDetail` stays, add `onBack` (the selection clear) and drop the page's own below-`md` back button. Single-pane `FeedShell` consumers change nothing.
- **Breaking:** no.

## v0.13.0

- **Added:** archetype `D3` (`settings-sections`, page kind), exported from `design-baseline/archetypes/settings-sections`. `SettingsSectionsShell` takes `title` / `subtitle` / `actions` (page verbs such as "Refresh" or "New template") and renders them once through `PageFrame`; its children are `SettingsSection`s stacked in the one surface, each with a required `title`, optional `description` / `actions`, and its own save at its foot (`onSave`, `saveLabel`, `isSaving`, `savingLabel`, `saveDisabled`). Contract: `docs/archetypes/settings-sections.md`; scaffold with `design-baseline new-page settings-sections <Name>`. `docs/CHOOSING-A-SURFACE.md` (v2.2) says when to pick it over `tabbed-settings`, `settings-table` and `form-page`; the adoption scan's `page-header-above-shell` signal now also co-occurs on `SettingsSectionsShell`.
- **Consumer:** none required. brickshop-manager can move its card-stack settings pages off the local `SettingsPageShell` + `PageHeader` onto this shell.
- **Breaking:** no.

## v0.12.2

- **Fixed:** a `PageFrame` inside a titled `SectionCard` (so also a titled `DetailSection`) draws no heading of its own, the same as inside a dialog or drawer since v0.12.1. The section's `SectionHeading` is the one heading; the frame renders its header actions (if any), toolbar band and body. The context is renamed `OverlayHostContext` → `HeadingHostContext` (`src/components/ui/heading-host.ts`, internal, not exported). Fixes a `MatrixGridShell` (archetype M v3.5, contract v3.3) placed in a titled detail section repeating the section title as a nested `h2`. An untitled `SectionCard` changes nothing.
- **Consumer:** a shell inside a titled section loses its duplicate heading on the version bump. Keep passing `title` (it is required).
- **Breaking:** no API change; visible change only for shells inside a titled section.

## v0.12.1

- **Fixed:** a `PageFrame` rendered inside a `DialogContent` or `SheetContent` no longer draws a page heading or a second raised surface. Dialogs and drawers are not pages (ADR-0008): their `DialogTitle` / `SheetTitle` is the one heading. Inside an overlay the frame renders only its header actions (if any), toolbar band and body; inner `SectionCard`s flatten as before. Derived from a new `OverlayHostContext` that both overlay contents set, never a prop. Fixes every shell built on `PageFrame` (e.g. `WizardShell`, archetype W v3.6, contract v2.2) hosted in a dialog showing its title twice, the second as a page `h1`.
- **Consumer:** dialog-hosted shells lose the duplicate heading on the version bump. `title` stays required; keep passing it. Put any `subtitle` text in the `DialogDescription`, since it no longer renders inside an overlay. Route-hosted pages are unchanged.
- **Breaking:** no API change; visible change only inside dialogs and sheets.

## v0.12.0

- **Changed:** `AuthCard` (`design-baseline/layout`) takes controlling-app's look as its fixed look: the icon, title and description are centered, and the icon sits in a 56px tinted circle. The title stays `text-lg` and the card `max-w-sm`.
- **Added:** required prop `purpose: "sign-in" | "denied" | "error"` (type `AuthCardPurpose`) keys the circle colour from what the screen is: `sign-in` = `bg-primary/10 text-primary`, `denied` = `bg-destructive/10 text-status-danger-fg`, `error` = `bg-muted text-muted-foreground`. Required, with no default, per RULES hard rule 10.
- **Consumer:** add `purpose` to every `AuthCard` on the pin bump. Off-app pages put the card on a `bg-muted/30` plane (the wrapper stays transparent). Call sites:
  - gebo-stock-kiosk `frontend/src/pages/SignIn.tsx` (two `AuthCard`s; pinned v0.9.3).
  - controlling-app `frontend/src/app/admin/users/page.tsx` and `frontend/src/app/settings/chart-colors/page.tsx` (`denied`; pinned v0.11.4).
  - controlling-app `/login` (`sign-in`) and `/not-authorized` (`denied`): replace the hand-built `rounded-full bg-*/10 p-3` markup with `AuthCard`.
- **Breaking:** yes. `purpose` is required, so existing call sites fail typecheck until they pass it.

## v0.11.8

- **Fixed:** `DetailOverviewShell` (archetype C v4.4, contract v4.2) no longer pads its main body horizontally, in either `rail` or `vertical` layout (body wrapper `p-5` → `py-5`). Sections, stat tiles and key-value rows already own a `px-5` gutter, so the body pad doubled it. Main-column labels sat one gutter further in than rail and summary labels, and on a 430px phone a nested section started 20px inside the frame instead of at its edge. No prop: the contract states the single gutter as a rule (ADR-0004).
- **Consumer:** every page using the shell sees its main-column content move 20px outward on the version bump (sections now start at the frame edge; their labels line up with the rail's). Remove any local padding or negative-margin override added to counter the double inset (hk-sales-agent Firmenakte).
- **Breaking:** no API change (no prop added or removed, types unchanged), but a visible layout shift on every consumer. See Consumer.

## v0.11.7

- **Fixed:** `logger.debug` (`design-baseline/utils/logger`) printed nothing in Vite browser builds. Its dev gate was `typeof process !== "undefined" && ...`, but Vite replaces only the literal `process.env.NODE_ENV` text, so `typeof process` stayed `"undefined"`. The gate is now one shared `isDevBuild()` (`src/lib/env.ts`), also used by `ListWithDetailShell` and `SettingsTableShell`. Next.js was unaffected.
- **Consumer:** none; Vite dev builds now show `logger.debug` output, production stays silent.
- **Breaking:** no.

## v0.11.6

- **Added:** `FreeTextCell` (exported from `design-baseline/archetypes/list-with-detail`, archetype A v4.6, contract v4.3, ADR-0010 amendment). A table cell in the detail overlay that holds free text wraps inside a ~24ch–48ch band from `sm` up, instead of holding the row on one line and pushing the sheet to the ceiling. Unmarked cells keep `nowrap`. No `className`/`style`: it marks content, not a width.
- **Changed:** the dev overflow warning, when the detail contains a table, now says to mark free-text columns with `FreeTextCell` before escalating to a `detail-overview` route.
- **Consumer:** render description / long-value cells in detail tables with `FreeTextCell`. A detail that warned only because of such a column now fits as an overlay.
- **Breaking:** no.

## v0.11.5

- **Changed:** the `ListWithDetailShell` detail overlay (archetype A v4.5, contract v4.2) sizes to its content instead of a fixed 448px (ADR-0010). From `sm` up it is `min-content` wide, clamped between a 28rem floor (the old width) and a `100vw - 4rem` ceiling; table cells inside the detail stay on one line, so a wide table widens the sheet instead of scrolling sideways. Prose still wraps at the floor; a long `detailTitle` truncates and never widens it. Below `sm` the overlay stays full-screen.
- **Added:** a dev-only `console.warn` when the open detail still scrolls sideways at the ceiling (the body or a nested scroll container). It names the `detailTitle` and points at the escalation rule: that detail belongs on its own `detail-overview` route.
- **Consumer:** none required. Remove any cell-padding squeeze added to fit a 448px sheet (gebo-stock-kiosk #66). A detail that warns moves to its own route.
- **Breaking:** no.

## v0.11.4

- **Fixed:** `PageFrame` desktop band wraps `viewSwitch` in a `max-w-full shrink-0 overflow-x-auto` slot (`data-view-switch`), so tabs wider than the band scroll instead of being clipped at the card edge; a crowded band scrolls rather than squeezing the switch.
- **Consumer:** none; re-check pages whose view switch was cut off.
- **Breaking:** no.

## v0.11.3

- **Changed:** `Calendar` follows `AppShell density="touch"`: nav buttons and day cells (and weekday headers) lift from 28/36pt to 44pt (`h-11 w-11`). 7 x 44pt plus padding is 332pt, so the grid still fits a phone.
- **Consumer:** none required; calendars inside a touch-density shell grow on the version bump. Without density they are unchanged.
- **Breaking:** no.

## v0.11.2

- **Changed:** `StatementWithFiltersShell` (archetype F v2.4) is now full-bleed (ADR-0007 amendment 2026-10-12). It drops the centred 1180px content column and takes the whole desk, so a twelve-month statement plus total fits a 14" laptop without horizontal scroll. Nested in another raised surface it stays in the column, like the other full-bleed shells.
- **Consumer:** none required; pages using the shell widen on the version bump (controlling-app P&L and balance sheet).
- **Breaking:** no.

## v0.11.1

- **Fixed:** `AppHeader` no longer widens the page past the viewport on phones. The row and every slot (`title`, `center`, `right`) now shrink (`min-w-0`, `title` truncates, `right` loses `flex-shrink-0`), and the header contains its inline size (`contain: inline-size`), so long content cannot widen an ancestor that lacks `min-w-0`. From `sm` up the `center` slot keeps an 8rem floor, so a long title cannot collapse it.
- **Added:** optional `AppHeader` input `user?: { email, onSignOut }`: below `sm` an account menu holds the email and sign-out, from `sm` up they render inline (email truncated). New labels `userMenu` / `signOut`; `AppHeaderUser` exported.
- **Consumer:** controlling-app can pass `user` instead of building the email and sign-out in `right`. Consumers that pass no `user` are unchanged from `sm` up.
- **Breaking:** no.

## v0.11.0

- **Added:** two exports on `design-baseline/archetypes/crud-dialog` (archetype J v3.10) so the footer can stay a pinned sibling of the body:
  - `CrudDialogSubmitOnEnter` is the hidden submit control for a dialog body's `<form>`. The footer's primary sits outside the form, so without it Enter submits nothing. Pass the primary's `isSubmitting` as `disabled` so a repeated Enter cannot double-submit.
  - `useCrudDialogFormReport` plus the `CrudDialogFooterReport` type is for a form island: a form that owns its `useForm` and its save. The form reports `submit` / `isSubmitting` / `isDeleting` / `onDelete` and its dirty flag up. The dialog keeps the report in `useState` and renders `CrudDialogFooter` from it.
- **Contract:** Layer 14 now forbids a form that renders its own footer inside the dialog body (radar candidate `crud-dialog-form-owns-footer`).
- **Consumer:** none required. To adopt:
  - hk-crm moves its five dialog-hosted forms that still return `FormPageActions` (holding, lookup, user, project-phase, service-assignment-renewal) onto the report hook, and swaps its local `use-crud-dialog-footer-report.ts` for the donor hook.
  - mistra swaps its local `CrudDialogSubmitOnEnter` for the donor export.
  - brickshop-manager adds `CrudDialogSubmitOnEnter` to its dialog forms; Enter submits nothing today.
- **Breaking:** no.

## v0.10.6

- **Changed:** archetype Sg (`segmented-toggle`) contract 1.1 → 1.2. It now records the second hand-roll idiom, a row of `Button`s whose `variant` flips on `mode === "x" ? "default" : "outline"` (or `"secondary"`), as drift that fails its keyboard and accessibility layers. It also allows the toggle inside a form or dialog section where the choice swaps the sub-form next to it. The gallery demo gains that form-section case. `SegmentedControl` is unchanged.
- **Consumer:** replace each `variant={mode === … ? "default" : "outline"}` button row with `SegmentedControl` (the `segmented-toggle-button-variant` scan signal finds them).
- **Breaking:** no.

## v0.10.5

- **Fixed:** a joined toolbar label (select, segmented control, toggle field, native field) no longer collapses to a one-letter stub (`V…`) in a crowded band: its floor is now its own text up to an 8rem cap (`JOINED_LABEL_CLASS`) instead of a 3rem track. Past the cap it ellipsizes; when the band cannot fit, it scrolls or collapses to the filter sheet as before. The sheet's 130px label column is unchanged.
- **Consumer:** a custom flex row that uses the exported `JOINED_LABEL_CLASS` no longer lets the label shrink below its text (≤8rem, `min-w-0` is gone) — size such rows for label floor + value, or the value overflows. Built-in controls need nothing.
- **Breaking:** no.

## v0.10.4

- **Fixed:** in `PageFrame`'s mobile filter sheet a long joined label (e.g. `Inhabergeführt`) wraps to at most two lines instead of truncating to `Inhabergef…`; the shared 130px label column is unchanged, so label cells stay aligned. The desktop band still ellipsizes.
- **Consumer:** none.
- **Breaking:** no.

## v0.10.3

- **Fixed:** `HeadingRow` (shared by `PageHeader`, `NestedPageHeading` and every shell through `PageFrame`) now stacks below `sm` — title and subtitle keep the full row width with the actions wrapping beneath — instead of squeezing the title into a one-word-per-line column beside the actions on phones. From `sm` up the row is unchanged.
- **Consumer:** none required; drop any local phone workaround for the header row (controlling-app).
- **Breaking:** no.

## v0.10.2

- **Added:** `FieldGroup` (archetype I, `design-baseline/archetypes/raw-input`, v1.6) — the group caption for several controls (checkbox list, radio set, toggle row, line-item editor): `<fieldset>` + `<legend>` in the field-label style, with the shared hint/error lines linked via `aria-describedby`; `disabled` disables every child natively. Shared `RequiredMarker` exported from `archetypes/shared`. Contract rule (raw-input L11): a label element names exactly one control — a caption over a group is a legend, over a read-only value a key/value term.
- **Scan:** the `raw-input-label-missing-htmlfor` signal now exempts `<Label id=…>` (an `aria-labelledby` target — correct wiring for group/button controls), cutting false positives (fleet: 34 → 21 files).
- **Consumer:** replace a bare `<Label>Topics</Label>` above a group of controls with `<FieldGroup label="Topics">…</FieldGroup>`; a bare `<Label>` beside a `Select`/`Textarea` becomes `SelectField`/`TextareaField`.
- **Breaking:** no.

## v0.10.1

- **Fixed:** `scripts/scan-adoption-quality.mjs` and `docs/audit-signals.json` were missing from the published tarball, so the documented consumer command could not run. Both now ship, and the script's default signals file resolves beside the script itself (not under the consumer's `--root`); `--signals` still overrides. New `verify:exports` invariant 10 fails when either file drops out of `files`.
- **Consumer:** brickshop-manager can run `node node_modules/design-baseline/scripts/scan-adoption-quality.mjs` again, with no vendored signals file.
- **Breaking:** no.

## v0.10.0

- **Added:** archetype `N` (`native-browser-dialog`, component kind), exported from `design-baseline/archetypes/native-browser-dialog`. It is the in-app replacement for `window.alert` / `confirm` / `prompt`. `useConfirm()` returns `{ askConfirm, dialog }`, where `askConfirm` resolves `boolean`; it renders the shared `ConfirmationDialog`, and `destructive` (default `true`) sets the tone. `usePrompt()` returns `{ askPrompt, dialog }`, where `askPrompt` resolves the trimmed value or `null`; it is a single-field `Dialog` whose form submits on Enter. Replace `alert` with the `sonner` toast. Contract: `docs/archetypes/native-browser-dialog.md`.
- **Consumer:** none required. To migrate a site the `native-browser-dialog` audit signal flags: brickshop-manager can replace its local `useDiscardConfirm` and native confirms, and controlling-app its local `useConfirm` plus its 3 `window.prompt` flows.
- **Breaking:** no.

## v0.9.3

- **Fixed:** `SearchInput` inside a `PageFrame` toolbar band now has a `14rem` minimum width, so a crowded band scrolls instead of clipping the placeholder. New optional `minWidth` prop overrides the floor. Outside a band the render is unchanged. Documented in STYLE.md "Toolbar field labels".
- **Consumer:** mistra drops its `[&>div:first-child]:min-w-[14rem]` hack.
- **Breaking:** no.

## v0.9.2

- **Fixed:** a joined toolbar label (`SelectTrigger` / `SelectField`, `SegmentedControl`, `ToggleField`, `NativeField` with `label` in a `PageFrame` band) now shrinks and ellipsizes before the control's value truncates (`Statu…`). A labelled control lays out as a grid (label column `minmax(3rem,auto)`, value columns at content width), so its minimum width is label floor + full value; `JOINED_LABEL_CLASS` is `min-w-0` + `shrink` + `overflow-hidden`; new `JoinedLabelText` (exported from `ui/toolbar-band`) provides the real ellipsis. The desktop band scrolls horizontally (focus rings preserved) instead of overflowing; the mobile filter sheet's 130px label column is unchanged.
- **Width rule:** a width class (`w-28`, `w-40`, …) on a joined `NativeField` / labelled `SelectField` / `SelectTrigger` / `SegmentedControl` / `ToggleField` sets the WHOLE box (label + control): inside it (a plain flex row) the label keeps its content width, shrinks first, then the value truncates; surplus goes to the value, and the box does not shrink in a crowded band. Without one, the control is content-sized and floors at label floor + full value, so a labelled control with a consumer `w-*` class now honours that width instead of growing past it (documented in STYLE.md "Toolbar field labels"). New `hasWidthClass` helper in `ui/toolbar-band`; `SelectTrigger` gains an optional `fixedWidth` prop.
- **Consumer:** none required. A custom joined label built from `JOINED_LABEL_CLASS` now shrinks and clips its text (no overlap onto the value); wrap the text in `JoinedLabelText` to get the ellipsis. New `npm run check:joined-label` (real Chrome) guards the behaviour.
- **Breaking:** no.

## v0.9.1

- **Changed:** under `AppShell density="touch"` (or `ControlDensityProvider`), `Button` with explicit `size="icon"` or `"icon-sm"` now renders `icon-lg` (`h-11 w-11`, 44pt), as do `PaginationLink` and the `DialogContent`/`SheetContent` close button. Unchanged without the setting.
- **Consumer:** none required; touch apps drop per-call-site `size="icon-lg"`.
- **Breaking:** no.

## v0.9.0

- **Added:** `AppShell density="touch"` (and the exported `ControlDensityProvider` / `useControlSize` from `ui/toolbar-band`, for apps without `AppShell`) resolves every control that takes no explicit `size` to the `lg` step (44pt): `Button`, `SelectTrigger`, `Input`, `SearchInput` (clear button is a 44pt target), `SegmentedControl`, `ToggleField`, `TabsList`/`TabsTrigger` and the `PageFrame` toolbar band. Density persists into dialogs, sheets and popovers. New `Button` step `icon-lg` (`h-11 w-11`).
- **Consumer:** none required; without the setting every render is unchanged. A touch app drops its per-call-site `size="lg"`.
- **Breaking:** no.

## v0.8.3

- **Changed:** the desktop `PageFrame` toolbar band is one row of at most 4 scoping fields (`MAX_INLINE_FIELDS`); fields past the cap collapse into the filter sheet (Filter button + `filterCount`/`onResetFilters`/`filterLabels`) instead of wrapping onto extra rows. `filterCount` should cover all filters (inline and sheet); `filterSummary` stays mobile-only.
- **Consumer:** a `toolbar` with more than 4 top-level fields now shows a Filter button on desktop (a visible behaviour change); pass `filterCount` / `onResetFilters` as on mobile.
- **Breaking:** no.

## v0.8.2

- **Changed:** `useLabels()` without a mounted `BaselineLabelsProvider` now resolves `labelsDe` when `<html lang>` starts with `de` (read after hydration; SSR stays English), else English. A provider still wins, per-call props (e.g. `PageFrame` `filterLabels`) still beat both. `labelsDe.filter` is now "Filtern".
- **Consumer:** none required; German pages with `<html lang="de">` lose the English fallbacks automatically. Class components reading `BaselineLabelsContext` directly do not get the lang fallback.
- **Breaking:** no.

## v0.8.1

- **Changed:** `KeyValueRow` default layout stacks label above a left-aligned, word-wrapping value below `md`; side-by-side right-aligned from `md` up. `block` unchanged. `MetricRow` checked at phone width and unaffected (label wraps via `min-w-0`, value is a short figure).
- **Consumer:** drop page-local phone-stacking wrappers around `KeyValueRow`.
## v0.8.0

- **Added:** `design-baseline/lib/labels` — `BaselineLabelsProvider`, `useLabels`, and the `labelsEn` / `labelsDe` presets. Every user-visible default string in `src/components/` (ui, layout, archetypes) now reads the provider; per-call props still win, and with no provider the English default renders unchanged. `StateView` gains `labels` (`loading` / `error` / `empty`) and `ErrorBoundary` gains `title` / `description` / `retryLabel` props.
- **Consumer:** optional. Wrap the app root in `<BaselineLabelsProvider labels={labelsDe}>` and delete any vendored copy of `state-view`, `error-boundary`, `search-input`, `confirmation-dialog`, `dialog` or `WizardStepper` kept only for German copy. Partial overrides are merged over English.
- **Breaking:** no.

## v0.7.1

- **Changed:** new adherence rule `bare-switch-in-toolbar` (`warn`) flags a bare `Switch` inside a `toolbar={…}` — the fixed 24px pill breaks the band's one height step; `ToggleField` is the replacement. `docs/PLACEMENT.md` names it in the red list.
- **Consumer:** replace the `Switch` with `ToggleField`; a Switch that genuinely belongs in a toolbar opts out with `// adherence-ok: bare-switch-in-toolbar — <reason>`.
- **Breaking:** no.

## v0.7.0

- **Changed:** new `ui/toggle-field` (`ToggleField`) — the on-ladder boolean toolbar filter. A pressed-state box at the band step (`size` `sm`/`default`/`lg`, or the band's step via `ToolbarSizeContext`) with an optional joined `label`; built on the existing Radix Switch, so `checked`/`onCheckedChange` and `role="switch"` carry over. `docs/STYLE.md` "Control heights" and "Toolbar field labels" name it as the owner.
- **Consumer:** optional. Replace a bare `<Switch>` + caption used as a filter in a `PageFrame` toolbar with `<ToggleField checked onCheckedChange>Show inactive</ToggleField>`.
- **Breaking:** no (additive; `Switch` unchanged).

## v0.6.8

- **Changed:** new adherence rule `page-tabs-in-toolbar` (`warn`) flags `Tabs` / `TabsList` / `SegmentedControl` inside a `toolbar={…}` — page-switching tabs belong in `viewSwitch`. `docs/PLACEMENT.md` v2.2 names the case in the slot table and red list.
- **Consumer:** move page-switching tabs from `toolbar` to `viewSwitch`; a tab group that genuinely scopes the body opts out with `// adherence-ok: page-tabs-in-toolbar — <reason>`.
- **Breaking:** no.

## v0.6.7

- **Changed:** the `PageFrame` mobile filter sheet now stacks fields one per row at full width even when the app wraps its toolbar fields in its own `flex` div (previously only direct children stretched, so nested joined selects stayed side by side and clipped at 430px). The shared `data-joined-label` column is unchanged.
- **Consumer:** none.
- **Breaking:** no.

## v0.6.6

- **Changed:** `Input` gains two size steps — `sm14` (`h-8` + `text-sm md:text-sm`, a 32px box with the row's 14px text) and `lg18` (`h-11` + `text-lg md:text-lg`, a 44px touch box displaying 18px figures). The step owns the text size, the way `sm`/`lg` own theirs; `docs/STYLE.md` "Control heights" table extended.
- **Consumer:** optional. Replace hand-rolled `className="text-sm md:text-sm"` on `size="sm"` inputs and `className="text-lg md:text-lg"` on `size="lg"` inputs with `size="sm14"` / `size="lg18"` — the un-prefixed pair is silently overridden at `md` by the step's own `md:` class.
- **Breaking:** no (additive `size` union values; existing steps unchanged).

## v0.6.5

- **Changed:** `Button` gains `size="inline"` (content-sized, no height or padding) and `size="icon-sm"` (`h-8 w-8` dense-row icon square).
- **Consumer:** optional. Replace `className="h-auto"` link/multi-line buttons with `size="inline"` and dense-row icon height overrides with `size="icon-sm"`.
- **Breaking:** no.

## v0.6.4

- **Changed:** new `formatFigure(value, kind, opts)` via the `./lib/format` export (de-DE, EUR defaults; U+2212 minus, em dash for missing values; `kind` is required, scale is never inferred). New `no-inline-number-format` lint rule (warn) flags inline `Intl.NumberFormat` / `.toLocaleString(` / `.toFixed(...)%`. Report, detail-overview and statement-with-filters demos migrated.
- **Consumer:** optional. Route figures through `formatFigure`; expect new lint warnings on inline number formatting.
- **Breaking:** no.

## v0.6.3

- **Changed:** new `PageShellFrameProps` type (exported from `layout`); all nine full-frame shells build their frame slots from it, so the v0.6.0 filter-sheet slots (`filterCount`, `filterSummary`, `onResetFilters`, `filterLabels`) now reach every shell, not only `statement-with-filters`. A gate test fails if a shell drops a shared slot.
- **Consumer:** none required. Pass the filter-sheet slots on any shell to get the mobile filter sheet.
- **Breaking:** no.

## v0.6.2

- **Changed:** label props for hardcoded English strings: `WizardShell` `backLabel`, `busyLabel`, `stepStateLabels`; `WizardStepper` `stateLabels`; `FeedItem` `unreadLabel`; `CrudDialogBody` `loadingLabel`. Defaults unchanged.
- **Consumer:** none required. Pass the props to localize.
- **Breaking:** no.

## v0.6.1

- **Changed:** `ListWithDetailShell` and `BoardShell` forward `viewOptions` / `count` to `PageFrame`'s View menu (previously dropped).
- **Consumer:** none required. Pass `viewOptions` / `count` to show them.
- **Breaking:** no.

## v0.6.0

- **Changed:** below `md`, the `PageFrame` toolbar band collapses to one row (Filter button with set-filter count, summary, View icon); the filters move into a bottom Sheet at the `lg` touch step. New `PageFrame` props `viewSwitch`, `filterCount`, `filterSummary`, `onResetFilters`, `filterLabels`. `statement-with-filters` 2.3 (Layer 11 reworded).
- **Consumer:** re-check mobile toolbars; pass `filterCount` / `filterSummary` / `onResetFilters` / `filterLabels` (German etc.) and move a view switch into `viewSwitch` so it stays outside the sheet.
- **Breaking:** no (mobile layout of toolbar filters changes).

## v0.5.1

- **Changed:** `Input` gains `size` (`sm` / `default` / `lg`) on the control-height ladder; `NativeField` threads it to the single-line control. `raw-input` 1.3. Default render unchanged.
- **Consumer:** optional. Drop `h-*` overrides on `Input` / `NativeField` and pass `size`.
- **Breaking:** no.

## v0.5.0

- **Changed:** one control-height ladder (`sm` `h-8` · `default` `h-9` · `lg` `h-11`) for `Button` / `SelectTrigger` / `Input` / `SearchInput` / `TabsList`; `SegmentedControl` takes `size`. `SelectField` / `NativeField` join their label to the box inside toolbar bands; `SelectTrigger label` / `SegmentedControl label` for bare controls.
- **Consumer:** delete `className` height overrides and pick a `size`; replace hand-rolled toolbar captions with `label`; pass `lg` where touch screens relied on `h-10` / `h-12` (`Button` `size="inline"` / `"icon-sm"` for the `h-auto` / dense-icon overrides arrive in v0.6.5, not here). See the two `v0.5.0` rows in `docs/PACKAGE.md`.
- **Breaking:** yes.
