# Changelog

One entry per `package.json` version (`## v<version>`), newest first. Each records what changed, what a consumer must do, and whether it is breaking. `scripts/verify-package-version.mjs` fails `npm test` on a version bump without an entry here. Per-archetype removals live in the migration table in `docs/PACKAGE.md`.

## v0.11.0

- **Added:** two exports on `design-baseline/archetypes/crud-dialog` (archetype J v3.10) so the footer can stay a pinned sibling of the body:
  - `CrudDialogSubmitOnEnter` is the hidden submit control for a dialog body's `<form>`. The footer's primary sits outside the form, so without it Enter submits nothing.
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
