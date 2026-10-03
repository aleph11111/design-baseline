# Page-frame contradictions audit — 2026-10-03

**Reader:** whoever implements [ADR-0008](../adr/0008-one-page-frame-slot-owned-placement.md) — this is the defect list each slice closes. Read-only sweep of `origin/main` @ `fbad651` (five parallel passes: four archetype families + the methodology docs) plus a controlling-app inventory.

**Trigger.** controlling-app's P&L page renders its title twice ("Profit & Loss" on the canvas, "Profit & Loss — 2026" on a card one band below) and spreads its controls over three bands (view toggles in the page header, selectors in the card, a second row of display toggles + Export/PDF). The pages do not import a baseline shell — they follow the baseline's *rules*, and the rules contradict each other.

## 1. Titles — five ways, two of them parallel alternatives

| Primitive | Element / scale | Role |
|---|---|---|
| `PageHeader` | `h1`, `text-display-title` (30px) | page title — ladder rung 1 |
| `NestedPageHeading` | `h2`, `text-base` | nested page title — rung 2 |
| `SectionHeading` / `SectionCard` | overline | section — rung 3 |
| `SurfaceHeader` (via `SurfaceFrame`/`SurfaceHeaderSlot`) | `div`, `text-lg` | **parallel** — title on the card |
| `SurfaceHeaderBar` + caller element | any | **parallel** — fourth route (detail Mode B, sheets) |

- `PLACEMENT.md:75,191,208` — the title is *always* `PageHeader`; anything else is red. `STYLE.md:226,271` — "header-on-surface, one frame on the canvas" is the house contract, `PageHeader` is "the classic block". `PLACEMENT.md` never mentions `SurfaceHeader`/`SurfaceFrame`.
- Every framed shell (statement, report, matrix, dashboard, list, settings, grouped, kanban, wizard, feed, calendar, form board-form, tabbed board-form) titles on the card. Their contracts forbid a floating `PageHeader` (e.g. `calendar.md:97`, `import-wizard.md:36-38`, `feed-inbox.md:53-55`, `list-with-detail.md:114`, `settings-table.md:96`). A consumer following `PLACEMENT.md` adds a `PageHeader` *and* keeps the card title → two titles. Nothing in code prevents it; `FormPageShell` even accepts `title` plus a `FormPageHeader` child; `DetailOverviewShell` accepts `title` alongside `DetailOverviewHeader` (h1 + h2).
- `statement-with-filters.md:105` says its title comes from "the project's canonical page-header primitive"; the shell renders `SurfaceHeader` on the card.
- `calendar.md:79` says "canonical page-title type style"; the code renders a `text-lg` div. Three title scales coexist (30px / `text-lg` / `text-base`), two inversion mechanisms (`headerFill`'s `[&_h1,h2]` selector vs an explicit `hfc.title` class).
- The gallery hides the defect: shell demos never mount a `PageHeader` (only form-page and crud-dialog do).

**Mode switches handing the title decision to the page author:** `FormPageShell` (`title !== undefined` → board vs classic), `SettingsPageShell` (`kicker`/`headerActions` → board vs classic), `DetailOverviewShell` (Mode A vs B by `title`), `FeedShell` and `BoardShell` (no title → no frame at all, and `toolbar`/`headerActions`/`kicker` dropped), `WizardShell` (framed only when titled), `SurfaceHeaderSlot` (title / actions-only / nothing).

## 2. Controls — no fixed home

- **Primary/create action.** `PLACEMENT.md:77-81,97` — header, never the toolbar. `audit-signals.json:95` `list-actions-in-header` (red) and `settings-actions-in-header` — the opposite. `settings-table.md:130` (header canonical, toolbar legacy) vs `:330` ("all write actions live in the toolbar") vs `:144` (either); its demo uses both. `list-with-detail.md:158` allows a "legacy toolbar" create.
- **Filters / scoping selectors.** `PLACEMENT.md:81` — never in the header. `statement-with-filters.md:107,266`, `analytics-dashboard.md:52-56`, `kanban-board.md:45` — in `headerActions`. The statement shell itself has no `toolbar` slot although `statement-with-filters.md:48` describes a toolbar band.
- **Result count — three owners.** `PLACEMENT.md:89` (consumer via `pageActions`) vs `ListWithDetailToolbar.tsx:54-58` (inside the search box) vs `SettingsTableShell.tsx:320-324` (shell-rendered from `rowLabel`).
- **Matrix bulk actions.** `matrix-grid.md:65` (toolbar) vs `:91,:300` (`headerActions`).
- **Feed primary action** has two homes (toolbar `actions` + `headerActions`); wizard's lives in the footer; calendar's in `headerActions`.
- **Aliases:** `StatementWithFiltersShell` `headerActions ?? actions`; `report.md` calls `actions` what the code names `headerActions`; `hideBelowMd` → `hideBelow`; `SettingsRowAction` = `RowAction`.
- **Accepted-then-dropped props:** `subtitle` / `icon` type-check on statement, report, matrix, dashboard, list, settings, grouped, kanban, form, tabbed, wizard, feed (inherited `SurfaceHeaderSlotProps`) and are silently not rendered — while `import-wizard.md:38`, `feed-inbox.md:55`, `matrix-grid.md:72`, `form-page.md:109` say "no subtitle slot".

## 3. Framing — card-in-card despite the rule

`STYLE.md:206` + ADR-0007 §3 forbid card-in-card (`RaisedSurfaceContext` drops the nested fill). Violations the context cannot reach:

- **analytics-dashboard:** hand-rolled `rounded-xl bg-muted/30` mat (`DashboardShell.tsx:30-31`) → `SurfaceFrame` → `DashboardWidget` `SectionCard`s — three surfaces.
- **kanban-board:** `BoardColumn` is `rounded-lg border bg-muted/40` with its own `h3` (`BoardColumn.tsx:47,53`) inside the raised frame.
- **grouped-list:** one shell header + N titled `SectionCard`s; the header renders on the canvas, not "on the surface" as `grouped-list.md:55` claims.
- **import-wizard:** a titled `SectionCard` (step label) inside a titled `SurfaceFrame`.
- **detail-overview gate** (`detail-overview.md:823`) says one frame holds header + main; Mode A puts the header outside it.

## 4. Docs vs code drift (same topics)

- Per-shell `headerFill` override documented in `calendar.md:87`, `report.md:44-48`, `grouped-list.md:64`, `STYLE.md:228`; the code forbids it (`headerFill.ts`, `SurfaceHeaderSlot.tsx`). `STYLE.md:211,226` call it a `--header-fill` CSS variable; it is a React context.
- "Hairline border + subtle shadow" in `list-with-detail.md:173`, `settings-table.md:152`, `report.md:41,61`, `matrix-grid.md:105`, `SectionCard.tsx:38`; the code draws neither (`STYLE.md:205`).
- `grouped-list.md:112` documents `renderHeader`, `:104` `unstyled` — neither exists.
- `crud-dialog.md:99` (built-in X only) vs `CrudDialogHeader` `onClose` (second X).
- `form-page.md:99,116,448` (no header actions) vs `FormPageShell.tsx:84-91` (`headerActions`); `tabbed-settings.md:105-108` likewise.

## 5. Duplication and readers

- "No bare `h1`, use `PageHeader`" — 7 places (`PLACEMENT.md` ×4, `STYLE.md` ×2, `archetypes/README.md:66`) plus `_adherence.json` `no-bare-h1` (the only enforcement). Page inset / desk width — 4 places. No-card-in-card — 4. Section-heading rule — 5. Header fill — 3 (2 wrong). Every contract restates its shell's slot placement (e.g. `statement-with-filters.md:48-54,107-111,266-268`, `matrix-grid.md:51,57,75,85,97,300`).
- **Machine readers:** `audit-signals.json` (dashboard `moleculeAudit.ts`, `adoptionScan.ts`, `rituals-prompts.ts`; donor `scan-adoption-quality.mjs`) and `_adherence.json` / `lint-design.mjs`. `STYLE.md`, `ARCHITECTURE.md`, `RULES.md` are named in an agent prompt. `PLACEMENT.md`, `CHOOSING-A-SURFACE.md`, `TAXONOMY.md`, `archetypes/README.md` have **no** machine reader; `PLACEMENT.md` and `CHOOSING-A-SURFACE.md` ship in the npm package.

## 6. Audit gap

No signal detects (a) two page titles, (b) a titled frame/card under a `PageHeader`. Split-controls detection exists only per archetype (`list-button-row-above-shell`, `list-actions-in-header`, `settings-actions-in-header`, `list-shell-missing-toolbar`) — and two of those encode the side of contradiction §2 that ADR-0008 rejects.

## 7. controlling-app blast radius (origin/main, 2026-10-03)

| Route | Defect | Cause |
|---|---|---|
| `workspace/pnl` | double title + 3 control bands | `LedgerGrid` → `PnlGrid.tsx:296` `Card`/`CardTitle` + in-card `LedgerControls`; toggles in `PageHeader` |
| `workspace/balance-sheet` | double title (Aktiva/Passiva cards) + split controls | `BsGrid.tsx:232,307`; hand-copied card at `balance-sheet/page.tsx:280` |
| `workspace/variance` | 2 bands | header toggles + `VarianceControls` row |
| `workspace/annual-statements` | 2 bands | PDF in header, selectors row below |
| `workspace/liquidity` | 3 bands | header action, tab control, filter row |
| `workspace/cashflow-builder` | 1 overloaded header band (7 controls) | — |
| `workspace/overview` | section cards with own header controls | local `SummarySection` |
| `workspace/reconciliation`, `bankenreporting`, `internal-reporting` | selector row / "Auswahl" card | — |

`PnlGrid`/`BsGrid` comments cite matrix-grid Layer 4 as the reason for the in-card band.
