# 0008 — One page frame, slot-owned placement

- **Status:** Accepted
- **Date:** 2026-10-03
- **Supersedes:** the "header on the surface" half of the Plex Ledger board form (2026-06-23) and ADR 0007's header-fill contract (`STYLE.md` "Header fill"). **Extends:** [ADR 0004](0004-appearance-locality-derived-vs-inherited.md) (a placement choice is appearance; the page author never makes it) and [ADR 0007](0007-fleet-house-look-fixed-vs-brand-roles.md) §2–§3 (the `PageHeader` display step is the page's one focal point; no card-in-card).
- **Evidence:** [docs/audits/2026-10-03-page-frame-contradictions.md](../audits/2026-10-03-page-frame-contradictions.md)

## Context

controlling-app's P&L shows "Profit & Loss" on the canvas and "Profit & Loss — 2026" on a card one band lower, with its controls spread over three bands. The page does not use a baseline shell; it follows the baseline's rules, and those rules disagree:

- **Two parallel title models.** `PLACEMENT.md` says a page is titled by `PageHeader` above the page; `STYLE.md` and every framed shell title the page *on the card* (`SurfaceHeader`). ADR 0007 then made the `PageHeader` `h1` the 30px focal point without retiring the card title. Following either doc faithfully, a consumer ends up with both.
- **Seven mode switches** (form-page board/classic, tabbed-settings board/classic, detail-overview Mode A/B, feed/kanban/wizard titled-or-unframed, `SurfaceHeaderSlot` title/actions-only/nothing) hand the frame decision to the page author.
- **Controls have no fixed home.** The create action is "header" in `PLACEMENT.md` and "toolbar" in `audit-signals.json`; filters are "never in the header" in `PLACEMENT.md` and "in `headerActions`" in three contracts; the result count has three owners.
- **The rules live three times** — `PLACEMENT.md` / `STYLE.md`, each contract, and the shell code — and drift independently: about 8 shells accept `subtitle`/`icon` and silently drop them, four docs describe a per-shell `headerFill` the code forbids.

Every one of these is a choice left to the call site. ADR 0004 already says appearance is fixed in the component or derived, never chosen per call site; placement is appearance. The defect class is "more than one way to cast the same thing".

## Decision

**A page has exactly one way to be built.** The page author supplies content into named slots; the shell decides where every slot renders. No mode, alias, or optional-title branch survives.

### 1. One page frame

Every page archetype shell renders the same stack, through one layout primitive (`PageFrame`):

```
PageHeader            title (h1, display step) · subtitle · badges · back link      [actions]
┌ SurfaceFrame (untitled, one raised surface) ───────────────────────────────────────────┐
│ toolbar band:  scoping (search · filters · selectors)          count · view options    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ body                                                                                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- The **title is passed once, to the shell**, and renders as the `PageHeader` `h1`. The frame carries no title, no kicker, no header bar. `SurfaceHeader`'s title path, `SurfaceHeaderSlot`, and the `kicker` prop are removed.
- **Nesting is derived, not chosen.** A `PageFrame` rendered inside another `PageFrame` (a tabbed sub-route under a layout that owns the page) renders its title as `NestedPageHeading` and joins the parent's surface instead of opening a second one. That is the only heading change, and the context decides it — there is no prop. detail-overview's Mode B becomes this case; Mode A is the default.
- The heading **ladder** stays: `PageHeader` (page) › `NestedPageHeading` (nested page) › `SectionHeading` (section inside the frame). Dialogs and drawers are not pages: they keep `SheetTitle` / `DialogTitle` in their own header bar.
- **`headerFill` is retired.** With no card title there is no header bar to fill; ADR 0007's display-step `h1` is the page's focal point. `AppShell headerFill` and `HeaderFillContext` are removed; dialog/drawer header bars render the fixed neutral treatment.

### 2. Slot-owned placement

Each slot has one name and one position, rendered by the shell:

| Slot | Position | Holds |
|---|---|---|
| `actions` | `PageHeader` right | verbs on the whole page/document: the one primary action (create included), export, print. ≤ 1 primary + 2 secondary; the rest collapse into `⋯`. |
| `toolbar` | frame's first band, left | everything that **scopes** the body: search, filters, scoping selectors (scenario/period/structure), tabs. |
| `count` | toolbar band, right | the result count: the archetype's formatted string (`"12 results"`), rendered by the frame in the canonical muted treatment. |
| `viewOptions` | toolbar band, far right | everything that changes **how** the body is shown without re-scoping it (decimals, KPI rows, show-zero, density, layout). Shells render it as one "View" menu. |
| footer | per archetype (form, wizard, dialog) | commit actions (save/cancel/next) — unchanged. |

- A control that fits none of these is a design question for the archetype, not a new row on the page.
- No aliases (`headerActions ?? actions`), no legacy second home for the same action, no props that type-check and are dropped: a prop the shell does not render does not exist in its type.

### 3. One raised surface per page

The frame is the page's only raised surface. Inner groupings render as sections inside it, never as cards: grouped-list groups and wizard steps as `SectionCard`s that the nested context flattens; dashboard widgets as hairline-divided cells; kanban columns as recessed lanes (canvas tone, no border). The dashboard's hand-rolled mat is removed.

### 4. Rules live in the code; docs carry roles

- Contracts state *what* a slot holds ("the statement is re-scoped by selectors"), never *where* it renders; placement prose and restated chrome are deleted from every contract.
- `PLACEMENT.md` shrinks to the slot table above; `STYLE.md` drops its duplicated placement, header-fill and title text and points here.
- Enforcement is mechanical: `audit-signals.json` gains signals for two page titles, a titled card/frame under a `PageHeader`, and a control row outside the slots; `list-actions-in-header` / `settings-actions-in-header` are retired — they encoded the rejected side, and the toolbar create slot they would now guard no longer exists in the shell types (a create button in `toolbar` is caught by review, not a signal).

## Consequences

- **Breaking, fleet-wide.** Every page archetype's MANIFEST entry takes a MAJOR bump; `docs/PACKAGE.md`'s closed-API removal table gets the rows (`kicker`, `headerActions`, `subtitle`/`icon` on shells, `headerFill`, `onAddNew` toolbar button, `pageActions`, board/classic switches). Consumers migrate from their own sessions (fleet self-heal), controlling-app first; the donor never edits consumer code but files each consumer's backlog ticket through the dashboard capture API (`POST /api/ticket/create {repoName, thought}`; the thought points at the playbook rather than pasting it), and that ticket is the handoff.
- **Vertical space.** A statement page loses its card title band (~70px) and its second control row; the page title is the one focal point ADR 0007 intended.
- **Lost:** the per-project accent header bar (`headerFill: solid`). Brand accent remains on primary actions, focus rings and charts.
- **Risk:** dashboard widgets and kanban lanes inside one frame may separate too weakly; if a review shows that, the fix is a fixed inner tone step in the component, never a per-page choice.

## Implementation

Slices, in order. Slices 1–5 shipped together as one breaking release (v0.3.0, PR #452) — the shells cannot compile against a half-retired surface, so splitting them would have meant temporary compatibility shims; slice 6 is separate work in the consumer:

1. **`PageFrame` primitive** (additive): `PageHeader` + untitled `SurfaceFrame` + toolbar band with `toolbar` / `count` / `viewOptions`, nested-frame context.
2. **Migrate every page shell** onto `PageFrame` — statement-with-filters, report, matrix-grid, analytics-dashboard, list-with-detail, settings-table, grouped-list, kanban-board, detail-overview, form-page, tabbed-settings, import-wizard, feed-inbox, calendar — removing their mode switches, aliases and dropped props; demos updated.
3. **Delete the retired surface:** `SurfaceHeader` title path, `SurfaceHeaderSlot`, `kicker`, `headerFill` / `HeaderFillContext`.
4. **Docs:** contracts role-only, `PLACEMENT.md` slot map, `STYLE.md` dedupe, MANIFEST bumps, `PACKAGE.md` removal table.
5. **Audit signals** per §4.
6. **controlling-app adoption** — the pages in the audit's §7.
