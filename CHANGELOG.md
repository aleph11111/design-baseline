# Changelog

One entry per `package.json` version (`## v<version>`), newest first. Each records what changed, what a consumer must do, and whether it is breaking. `scripts/verify-package-version.mjs` fails `npm test` on a version bump without an entry here. Per-archetype removals live in the migration table in `docs/PACKAGE.md`.

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
