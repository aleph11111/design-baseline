# Changelog

One entry per `package.json` version (`## v<version>`), newest first. Each records what changed, what a consumer must do, and whether it is breaking. `scripts/verify-package-version.mjs` fails `npm test` on a version bump without an entry here. Per-archetype removals live in the migration table in `docs/PACKAGE.md`.

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
