# Changelog

One entry per `package.json` version (`## v<version>`), newest first. Each records what changed, what a consumer must do, and whether it is breaking. `scripts/verify-package-version.mjs` fails `npm test` on a version bump without an entry here. Per-archetype removals live in the migration table in `docs/PACKAGE.md`.

## v0.78.0

- **Changed (invariants, `checkPageInvariants`):** `zeroClipped()` — the gate that keeps a zero-clipped `.sr-only` label out of every `visible()`-gated check (`clipped`, `headingLines`, `tapTargets`, `figureTable`) — now parses the legacy `clip: rect(…)` form **unit-agnostically**: each of the four coordinates matches `0` with or without a unit (bare `rect(0,0,0,0)` or `rect(0px, 0px, 0px, 0px)`, any spacing or case), read by regex instead of `parseFloat` on a clip value. The old pattern (`/rect\(0[^,]+, …/`) required at least one character after every `0` (a unit), which held in Chrome and jsdom only because both re-serialize a bare `rect(0,0,0,0)` as `rect(0px, 0px, 0px, 0px)` — a fragile unit assumption that a non-normalizing engine would break (`ticket invariants-zero-clipped-inset-units`). The unit-aware `inset(…)` parse that shipped in v0.65.0 (`%` as given, `px` measured against the element's own box, any other unit as no cut) is unchanged.
- **Evidence:** `invariants.test.ts` pins the sr-only cases the ticket names: `clip:rect(0px, 0px, 0px, 0px)` (explicit-unit form) and bare `clip:rect(0,0,0,0)` both stay zero-clipped alongside `clip-path:inset(50%)`, and a still-visible clipped-text control still fails the check. The px-inset test gains the ticket's exact values — `inset(50px 0 50px 0)` on a 300×200 box (visible, still checked) and `inset(50px 0)` on a 300×100 box (collapsed, hidden) — alongside the existing `inset(0 0 120px 0)` and `inset(100px 0)` cases. `npx tsc --noEmit` and `npm test` pass (1211 tests, jsdom unit surface).
- **Consumer:** none required; bump `design-baseline`. No API, code, or message-shape change; no page effect in real browsers (Chrome serializes `clip` as `0px` either way) — the parse is robust where the engine does not.
- **Breaking:** no.

## v0.77.0

- **Changed (transaction-document):** the next-step panel's "Running alongside" side-effect line now **wraps within the panel** on a phone instead of overflowing the card's `overflow-hidden` clip — the `SideEffects` items in `TransactionDocumentShell` (the shipped primitive, transaction-document v1.9) clamp each item to the panel width (`max-w-full`) and let its label span shrink (`min-w-0`), with the state icon `shrink-0`. This closes the v0.76.0 `textClip` phone finding on all three `transaction-document` phone variants (default, Sales order, Shipped no scan): the ~37px of cut-off side-effect text on a 390px phone is gone, the line is fully readable at 390px, and the `check:viewports` page gap (`textClip` on `transaction-document`) is removed so the check re-asserts. Desktop (laptop14 and wider) is unchanged: the panel's content box there is far wider than the one-line items, so each stays on one line at identical geometry — the pinned pixel baselines for the shipped variants do not move.
- **Settled (invariants, `checkPageInvariants`):** the `textClip` scroller-card case from v0.76.0 is closed as **per-page settlement is the final home** (case 2b, ticket `invariants-textclip-phone-demos`). The `invariants.mjs` textClip check is unchanged — no scroller-aware box-level exemption is added, because a box clipping its own text while coincidentally holding a wide `data-scroll-region` scroller would be wrongly exempted, and the verified probe geometry (import-wizard phone card: card `scrollWidth` 487px in a 356px box, the marked scroller's border box at right 357px INSIDE the card's 374px edge) shows the marker/box relationship cannot discriminate the two at box level. The `check:viewports` `PAGE_GAPS` entry for the `import-wizard` phone step strip is now the **recording** of that settlement (commented as the final settlement; it is not a candidate for a check change), and the `invariants.mjs` textClip block comment records the closure so a later branch does not re-try the box-level exemption. The sibling page gap for the `transaction-document` panel is removed with the layout fix above.
- **Evidence:** the transaction-document phone panel's side-effect line renders its full text at the 390px phone width in the `check:viewports` contact sheet on every demo that carries a failed side effect; `check:viewports` passes 155/155 with only the warnings the settlement leaves (the `headingLines` gap on `transaction-document`, owned by ticket `transaction-document-title-vs-heading-lines`, and the `textClip` known gap on the `import-wizard` phone demo, now the closed per-page settlement). `npm test` passes unmodified — including the `textClip` unit test that pins the import-wizard-shape report (a clipping box whose text sits in a marked scroller still reports), which is the control proving the check keeps reporting genuine clips and the settled case.
- **Consumer:** bump `design-baseline` to get the wrapping side-effect line; no API change, no message-shape change. A consumer whose `TransactionDocumentShell` next-step panel clipped a long side-effect line on a phone now sees it wrap; a consumer asserting on the exact one-line rendering of that line on a phone must assert the wrapped rendering.
- **Breaking:** no.

## v0.76.0

- **Changed (invariants):** the two text-geometry checks in `checkPageInvariants` (exported `design-baseline/testing/invariants`) get the scoping the gate reviews flagged twice:
  - `textClip` now reaches the **nested text holder**: a box that clips horizontally (`overflow-x: hidden|clip`, wider than its box, no `text-overflow: ellipsis`) is the offender when its text sits in a nested element that does not clip itself — the common shape `<button class="overflow-hidden"><span>label</span>`: the clipping button has no direct text node and the span does not clip, so the cut-off label was invisible to the check before. A box that clips text INSIDE a `data-scroll-region` horizontal scroller is NOT exempted by the check itself: the DOM geometry is ambiguous (the scroller's border box can sit inside the clipping box while the box reports the scroller's overflow as its own `scrollWidth` — verified on the `import-wizard` phone demo in real Chrome), so the scroller-card vs genuine-clip distinction is settled **per page** — the donor demos carry the two known cases as page-scoped known gaps in `check:viewports`'s `PAGE_GAPS` (`transaction-document` and `import-wizard`, ticket `invariants-textclip-phone-demos`) while the code reports the raw clip. The outermost-offender dedupe and the five-offender cap are unchanged.
  - `textOverlap` intersects the text's painted **line fragments per line**, not the element's `getClientRects` box: a `Range` is built per own text node (`document.createRange()` — a detached `createRange` call throws in real Chrome, so it is invoked on `document`) and its `getClientRects()` (the painted line boxes) is used where real layout exists. This corrects the block-holder case — a wrapping `p`/`td`/`div`'s element `getClientRects` is a single BORDER box, whose multi-line bounds intersected any neighbour sitting inside them even when the glyph lines do not touch; a neighbour now clears a wrapping title's own lines (and the gaps between them). For INLINE holders this is a quiet geometry change: the element's `getClientRects` is the PADDING box (padding included) while Range rects are the GLYPH boxes — fragments are now slightly tighter on padded inline text. The clipping to overflow-hiding/scrolling ancestors is unchanged, the empty-clipped ⇒ empty-fragments invariant (hidden text never overlaps) is unchanged, and the border box still stands in where no Range geometry exists (jsdom unit surface).
- **Consumer:** none required; bump `design-baseline`. No code or message shape changed. Effect on pages: a nested-clip shape that was missed is now reported, and a wrapping block holder with a neighbour inside its border box but clear of its painted lines is no longer falsely reported. Donor `check:viewports` results are identical to the previous version except the new page-scoped known-gap warnings (`textClip` on the `transaction-document` phone next-step panels — genuinely cut-off text, and on the `import-wizard` phone step strip — an intended `data-scroll-region` scroller; both settled per page in ticket `invariants-textclip-phone-demos`).
- **Breaking:** no API break.

## v0.75.0

- **Changed (invariants):** `checkPageInvariants` (exported `design-baseline/testing/invariants`) caps the per-element failure reports in `measure` — every code that reports one line per offender now reports at most **five outermost** offenders, the same pattern `clipped` and `nestedOverflow` already carried:
  - `textClip` — a clipped element contained by an already-reported clipped element is not listed separately, and past five offenders the report stops at five.
  - `textOverlap` — each box appears in **at most one** reported pair (either role), so an element reported as the `a` of one pair is not reported again as the `b` of a later one; at most five pairs are reported, and the pair scan ends as soon as the five are found (later checks in the same pass still run).
  - Audit cap for the other per-element codes that had no cap: `headingLines`, `titleSqueeze`, `figureTable` and `tableColumn` each report at most five offenders; `scrollCue` reports the outermost uncued scrollers only (a nested scroller inside an already-reported one is not listed separately), at most five. Codes that already carried the cap (`overflow`/`clipped`/`nestedOverflow` at 5 outermost, `duplicateFact` at 5 tokens, `tapTargets`/`tapOverlap` at 6/4 items plus an ellipsis) and the one-line codes (`column`, `fullBleed`, `toolbarRows`, `phoneToolbar`, `phoneNav`) are unchanged.
  - The O(n²) `textOverlap` pair scan keeps its box-level early-exit (`boxesMeet`) but gains no spatial index: measured in real Chrome (laptop14), `measure` takes 8–12 ms end to end with 2 000 visible text boxes in the worst-case layout (every pair meeting at box level), so a thousands-of-cells matrix adds no measurable time to a consumer's Playwright suite per checked width.
- **Consumer:** none required; bump `design-baseline`. Failure output is identical on pages with fewer than six offenders per code (same codes, same messages, same order); on pages with more, the report now stops at five outermost offenders instead of one line per offender — any consumer asserting on the COUNT of `textClip`/`textOverlap` lines of a broken page must expect at most five.
- **Breaking:** no API break; report volume is upper-bounded at five offenders per code on broken pages only, and the set of codes is unchanged.

## v0.74.0

- **Changed (pinned image):** the screenshot-rendering image and the exact Playwright pin move from `1.63.0` to `1.65.1`. `PLAYWRIGHT_VERSION` is now `1.65.1`, `PLAYWRIGHT_IMAGE` is re-pinned to `mcr.microsoft.com/playwright:v1.65.1-noble@sha256:1507cbfc…` (index digest, re-resolved with `docker buildx imagetools inspect`), and the CI `screenshots` job image moves with it. `@playwright/test` and `playwright-core` are pinned to `1.65.1` exactly, so `assertInPlaywrightImage` keeps passing against the new image. The donor's `tests/screenshots/` baselines were re-captured in the pinned `v1.65.1-noble` image and the comparison pass is clean — the donor's pixels are unchanged between the two image versions, so no baseline file changed.
- **Consumer:** bump `design-baseline` **and** Playwright together in the same change: `npm install --save-dev --save-exact @playwright/test@1.65.1` (and matching `playwright-core` if pinned directly) — a consumer that bumps only one side has `assertInPlaywrightImage` throw (installed version ≠ `PLAYWRIGHT_VERSION`) until the other side catches up, and running the old image with 1.65.1 browsers (or vice versa) is exactly the baseline-rot scenario the pin guards. Then re-run `npx design-baseline-playwright playwright test --update-snapshots` and review the PNG diff — on the donor the 1.63.0→1.65.1 re-capture was byte-identical, so a clean comparison is the expected outcome; a diff in a consumer means its own app renders something the new Chromium draws differently (fonts/antialiasing or a real layout change) and it re-baselines the intended parts.
- **Breaking:** no. The pin contract is unchanged (same exports, same throw conditions); the shipped image and its Playwright version move together, and re-baselining is the documented consumer step, not an API break.

## v0.73.0

- **Changed (invariants):** `checkPageInvariants` (exported `design-baseline/testing/invariants`, used by the donor's `check:viewports` and every consumer's Playwright suite) adds a code, in the stable `<code>: <message>` pattern so `options.knownGaps` downgrades it:
  - `titleSqueeze` — the page title squeezed narrow of its longest unbreakable word (`titleSqueeze: <h1 …> squeezed to 162px, longest word 224px ("SO-2025-00417") — wraps mid-token`). The header actions row (`HeadingRow`'s shared classes, capped at 60% of a side-by-side row) crowds the title block past the width its words need and the browser breaks a token mid-token. A squeezed title **re-wraps**, so the element box alone and the text's own `scrollWidth`/`getClientRects` never see the break — the check measures each title word's **natural width** with a hidden probe at the heading's own font (family/size/weight/style/stretch/letter-spacing, `text-transform` applied; 2px sub-pixel tolerance) and fails when the longest word outgrows the heading's content box. Guarded exactly on `HeadingRow`'s stable `data-slot="heading-row-title"` marker — the `h1` rung (`PageHeader`, every shell through `PageFrame`) and the `NestedPageHeading` `h2` rung: one check, every heading row, no per-page assertion, and a coverage scope that a scale change cannot silently narrow. Other headings (section headings, detail-panel titles) are not guarded — they legitimately narrow and wrap at word boundaries. **Non-mobile only** — a stacked row gives the title the full width, so there is nothing to squeeze. The `InvariantCode` union gains the member.
  - `HeadingRow`'s title/badges row gains a stable `data-slot="heading-row-title"` marker (same slot-marker treatment as the heading subtitle).
- **Evidence:** with the regression reintroduced (the actions wrapper's cap dropped so the cluster claims the row), `check:viewports` fails `detail-overview @ sweep 1024` and `detail-overview @ sweep 1133` — at 1133 the titleSqueeze is the **only** new finding on the label, the sibling invariants (`overflow`, `clipped`, `textOverlap`, …) pass there, proving the gap this check covers. On the current code `check:viewports` passes 155/155 with no page newly failing at any triad device or sweep width (the donor demos' titles keep their width at every checked width — a consumer with a longer title and a wide actions cluster in the same narrow band will see the finding, which is the intended behaviour).
- **Consumer:** bump `design-baseline`. The new code can fail a consumer's Playwright suite at non-mobile widths: a page whose title is narrower than its longest word (a wide actions cluster crowding the title in the 1024–1512 band) now returns its own coded failure; where the narrow width is intentional (a custom, deliberately compressed header), add the code to `knownGaps` with a ticket.
- **Breaking:** no API break; the `InvariantCode` type widens.

## v0.72.0

- **Changed (invariants):** `checkPageInvariants` (exported `design-baseline/testing/invariants`, used by the donor's `check:viewports` and every consumer's Playwright suite) adds a code, in the stable `<code>: <message>` pattern so `options.knownGaps` downgrades it:
  - `duplicateFact` — a formatted money or percent fact rendered **more than twice** in the main content region (`<main>`, or `<body>` when the page has none) is reported as `duplicateFact: "<token>" rendered N times in main`. This is the check the `archetype-gap-transaction-document` split-off promised: the same number in three places (a rail, a table column, a total row) is a layout smell, not content. It is a deliberately loose heuristic — only tokens matching a formatted figure are counted: money (digits with optional thousands/decimal separator followed by a currency symbol `€ £ $ ¥` or a 3-letter ISO code) and percent (digits followed by `%`), so a bare number, an order ID, an address line or a tracking number are never matched (no false positives on the house formats; a fact written as a bare number is missed). Each element contributes only its **own** text (direct child text nodes), so a figure nested in a value (`<strong>` inside a label row) counts once per rendered surface, and a `.sr-only` figure under a visible parent is not read through it. Both locale forms — `1,234.50 €` and `1.234,50 €` — are matched, and the NBSP/figure-space a real `Intl` emits before the symbol or `%` is normalised to one space so the two spellings of the same fact agree; the symbol is read only after the figure, so the en-US prefix form `$1,234.50` is never matched. A legitimate label/value repeat (a column label and its total row) renders twice and passes; at most five findings are reported per run (one per offending token), with a count line for any further repeats. The shipped `transaction-document` demo passes — its ledger repeats at most twice (a column label and its total row), under the `> 2` threshold.
- **Consumer:** bump `design-baseline`. The new code can fail a consumer's Playwright suite: a money or percent figure the consumer renders three times in `main` (the brickshop-manager `StandaloneOrderDetailView` rail threads `formatCurrency` into three sections) now returns its own coded failure; a percent fact is any `digits %` string, so a VAT rate repeated on three ledger lines (`19 %`) fires too — expected on statements, worth `knownGaps` + a ticket anywhere the repeat is intentional. If the repeat is intentional, the consumer adds the code to `knownGaps` with a ticket.
- **Breaking:** no API break; the new invariant code can fail a consumer suite (see Consumer). The `InvariantCode` type widens.

## v0.71.1

- **Fixed (`HeadingRow` actions overlapping the title):** the shared header actions wrapper (`HEADING_ROW_CLASSES.actions`, every `PageHeader`/`NestedPageHeading` and so every `PageFrame` archetype) carried `min-w-0`, so between the row's `@xl` (576px) and `@3xl` (768px) container widths it shrank below its widest action. A `whitespace-nowrap` button wider than the wrapper then overflowed **left** under `@xl:justify-end` and painted over the title — `transaction-document` at a 1024px window (672px row): the 173px "Print packing slip" button sat in a 132px wrapper and covered the title's first line by 22px (`textOverlap`). The wrapper drops `min-w-0`, so its floor is its widest single action (min-width beats the `@xl:max-w-[60%]` cap) and the `min-w-0` title block absorbs the squeeze. Unchanged from a 768px row up (`@3xl:shrink-0` already held the cluster) and when stacked; the `check:viewports` sweep gap `transaction-document@1024:textOverlap` is removed.
- **Consumer:** none required; bump `design-baseline` to pick it up. A header whose widest action exceeds 60% of a 576–767px row now keeps the action whole and narrows the title instead of overlapping it.
- **Breaking:** no.

## v0.71.0

- **Changed (invariants):** `checkPageInvariants` (exported `design-baseline/testing/invariants`, used by the donor's `check:viewports` and every consumer's Playwright suite) adds four codes, each a stable `<code>: <message>` so `options.knownGaps` downgrades them:
  - `nestedOverflow` — a visible horizontal scroller (`overflow-x: auto|scroll`) whose content is wider than its box. The page scrolls inside `main`, so the viewport-edge checks never see a container that scrolls sideways on its own. An intended region (a wide table, matrix, code block) opts out with `data-scroll-region` on the scroller or an ancestor; the outermost offender is reported, as `clipped` is.
  - `textClip` — a text-bearing box clipped horizontally (`overflow-x: hidden|clip`) wider than it is. Intentional ellipsis (`text-overflow: ellipsis`, the `truncate` surface) and `pre`/`textarea`/`[role=dialog]` are exempt; a zero-clipped `.sr-only` label (`clip-path: inset(50%)`; a `px` inset is measured against the box, never read as a percent) is not cut-off text.
  - `headingLines` — a page `h1` that wraps onto a third line (content height past 2 line-heights). No archetype is exempt, `transaction-document`'s document column included.
  - `textOverlap` — two visible text boxes painted on top of each other. Intersects **painted** line fragments (`getClientRects` clipped to the element's overflow-hiding/scrolling ancestors — hidden or scrolled-off text never counts), not the element box, so a wrapping title's own lines never count as an overlap; ancestor/descendant pairs and **cross-layer** overlays are exempt — text in a dialog/tooltip/menu/popover or in `position: fixed|sticky` chrome (an `AppHeader`, a `BottomNav`, a sticky action bar) legitimately sits over page text, so a box is only checked against text in its own overlay layer (two elements inside the same bar still collide).
  - The `InvariantCode` union is now complete (it was missing `figureTable`, `tableColumn`, `scrollCue`).
- **Changed (`ScrollCue`):** the shared scroller `ScrollCue` (`archetypes/shared`) renders its inner scroller with the `data-scroll-region` marker, so the donor's tables, matrices, boards and steppers — which all render through it — are already opted out of `nestedOverflow`; no per-call-site marking.
- **Consumer:** bump `design-baseline`. The new codes can fail a consumer's Playwright suite: a consumer's own `overflow-x-auto` scroller that overflows at a checked width now fails `nestedOverflow` (mark the scroller or an ancestor `data-scroll-region` when the scroll is intended, or add the code to `knownGaps` with a ticket); a cut-off text, a 3-line `h1`, and two overlapping text boxes each return their own coded failure.
- **Breaking:** no API break; the new invariant codes can fail a consumer suite (see Consumer). The `InvariantCode` type widens.

## v0.70.0

- **Fixed (`analytics-dashboard` `DashboardAssignmentList` columns):** the edit-mode assignment list's column grid (`grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3`) keyed on the **viewport** width, but inside `AppShell` (256px sidebar) the page column is much narrower than the window, so the list stepped to 2/3 columns too early. This was the last viewport-keyed layout in the `analytics-dashboard` archetype, left by the `viewport-breakpoints-container-query-audit` sweep (v0.51.0), which converted the `DashboardGrid` (same class string) but not this sibling. The list now sits in its own `@container` wrapper and the steps are `grid-cols-1 … @4xl:grid-cols-2 @5xl:grid-cols-3` — the same thresholds the `DashboardGrid` sits at, so the two grids step together. No new prop (ADR-0004), no structural change.
- **Threshold change:** the list's column count now follows the *list's own box* (its `@container` wrapper — the card's content box, inside its padding), not the window's: 1 column under 896px, 2 from 896px, 3 from 1024px. The old viewport steps (`sm` 640px / `lg` 1024px of the window) over-split on a wide desktop window with a narrow column and under-split otherwise.
- **Evidence:** `check:viewports`' container-query layout cases now assert the list in edit mode with real Chrome, selected by its own `data-slot` box (the widget grid carries the same `@4xl`/`@5xl` classes, so a class selector would measure the grid): 1 column in the ~738px box inside the 1133px window's ~780px column, 3 columns in the ~1102px box at laptop14. The `data-slot` marker and the `@4xl`/`@5xl` steps are pinned in `container-query-pins.test.tsx`.
- **No triad render change:** at the device triad the outcome the pixel baselines hold is unchanged — phone stays single-column (viewport 390px was already 1 column), and on the two desktop devices the list (edit mode only; the default view is untouched) already showed 3 columns (viewport 1512/2560px was past the old `lg` 1024px window breakpoint), so no `screenshots:` baseline regeneration. What changes: a wide viewport over a narrow column no longer squeezes the list into 3 cramped columns, and a narrow window over a wide column no longer stacks it.
- **Scope note (criterion 2):** no layout `sm:`/`md:`/`lg:` viewport variant remains in `src/components/archetypes/analytics-dashboard/` (`DashboardTitleEditor`'s `md:text-[length:inherit]` is a text-size variant on the page header line, never a layout class, never inside the widget grid). The same `grid-cols`/`col-span`/`divide`/`flex-row`/`border-l`/`border-r` sweep across `src/components/` finds no other viewport-keyed **layout** class on a shipped archetype primitive: the only hits are the shadcn overlay primitives' footers (`dialog`/`sheet`/`alert-dialog` `sm:flex-row sm:justify-end`) and the two-months `calendar` — sheets are viewport-keyed by design (their width is their own, independent of any page column), and neither sits inside a page content column. No other ticket required.
- **Consumer:** none required; bump `design-baseline` to `0.70.0`.
- **Breaking:** no.

## v0.69.0

- **Added (`import-wizard` `WizardStep` per-step `hideNext`):** a `WizardStep` may carry `hideNext: true`. The `WizardPanel` footer — and `WizardShell`, which forwards `steps` to it — then renders no forward action (Next, or Commit on the last step) for that step while keeping Back, `onFirstBack` / `firstBackLabel` and the footer layout unchanged. The footer stays navigation with **one primary**: a step whose body already carries its own primary action (e.g. a side-rail "Strecke prüfen") sets `hideNext` so the footer never doubles it. The flag is per-step — no other step of the same wizard loses its forward action. A step without `hideNext` renders the footer exactly as before (`canProceed`, `busy` and labels unchanged). The stepper ignores the flag; only the panel footer reads it.
- **Docs:** `docs/archetypes/import-wizard.md` Layer 5 now states the footer holds Back plus at most one primary and documents the per-step `hideNext` contract (contract v2.5, MANIFEST 3.10).
- **Consumer:** optional; set `hideNext: true` on the `WizardStep` that owns its body primary, and bump `design-baseline` to `0.69.0`.
- **Breaking:** no.

## v0.68.1

- **Fixed (`ui/progress` a11y):** the wrapper destructured `value` for the Indicator's `translateX` transform but never passed it to `ProgressPrimitive.Root`, so every `<Progress value={40} />` rendered `data-state=indeterminate` with no `aria-valuenow` on the `role=progressbar` — screen readers announced no value. The `value` is now forwarded to the Root; the Indeterminate transform is untouched. The no-value form still renders indeterminate, unchanged.
- **Audit (acceptance criterion 3):** no other `src/components/ui/` wrapper destructures a Radix root prop without re-passing it (`DropdownMenuCheckboxItem` re-passes `checked` explicitly; the rest spread `...props`). No sibling fix required.
- **Consumer:** bump `design-baseline` to `0.68.1` and drop the explicit `aria-valuenow` workaround in behandlungskompass's `src/app/(portal)/portal/page.tsx` (it passed the value attribute by hand because the primitive swallowed it).
- **Breaking:** no.

## v0.68.0

- **Fixed (`analytics-dashboard` `DashboardPeriodPair` split):** the pair's month/YTD split (`grid-cols-1 … sm:grid-cols-2 sm:divide-x sm:divide-y-0`) keyed on the **viewport** width. Since v0.51.0 a `DashboardGrid` widget is a card in a container-query grid, so the real width of a pair is its card (full-width inside the page grid's column), not the viewport: on a wide desktop viewport a narrow pair card split into two squeezed columns, and on a narrow window a wide card stacked. The split now sits inside the primitive's own `@container` wrapper and the classes are `@4xl:grid-cols-2 @4xl:divide-x @4xl:divide-y-0` — container-query, following the `StatTileRow` / `DashboardGrid` steps, so the pair stacks when its *card* is under 896px regardless of window width, and splits when the card is at least that wide. The wrapper carries the card's gutter-cancel (`-mx-5 -my-4`) directly: a plain wrapper in between would have stopped that top margin from collapsing against the card body and grown every pair card by the body's 16px top gutter at every width. No new prop (ADR-0004), no structural change.
- **Threshold change:** the pair split fires at container width 896px instead of viewport 640px. Inside `AppShell`, a pair card is full-width: at the 1133px laptop window (~742px column) the pair now stacks (viewport 1133px said two columns); on the wide desk column it splits as before.
- **Evidence:** `check:viewports`' container-query layout case now asserts, in real Chrome, the pair split (1 col in the ~742px card @ the 1133px window, 2 cols @ laptop14 where the card is ~1104px). Pinned in `DashboardPeriodPair.test.tsx` and `container-query-pins.test.tsx`.
- **Scope note (criterion 3, viewport-keyed primitives rendered inside the container-query grid):** the grep of `src/components/archetypes/analytics-dashboard/` finds two other viewport variants, each out of scope — `DashboardAssignmentList`'s `sm:grid-cols-2 lg:grid-cols-3` renders as a canvas-level card beside (not inside) the `DashboardGrid`, so it is tracked by its own split-off ticket ([[dashboard-assignment-list-container-query]]; the parent audit [[viewport-breakpoints-container-query-audit]] split it exactly this way, same as `crud-dialog-body-two-column-container-query` shipped in v0.67.0), and `DashboardTitleEditor`'s `md:text-[length:inherit]` is a text-size variant on the page header line, not a layout class, and that line is never inside the widget grid. With `DashboardPeriodPair` converted, no primitive rendered inside the container-query widget grid still keys its layout on a viewport breakpoint.
- **Consumer:** none required; bump `design-baseline` to `0.68.0`. A `DashboardPeriodPair` card narrower than 896px on a wide viewport now stacks its halves (the fix); at the device triad every pair card is already ≥ 896px, so the split outcome — and the 57 pixel baselines — are unchanged.
- **Breaking:** no.

## v0.67.0

- **Fixed (`crud-dialog` `two-column` layout):** the body's paired-field grid (`layout="two-column"`) previously keyed on the viewport breakpoint (`sm:grid-cols-2`). Because a crud-dialog has a fixed width (width presets `sm`/`md`/`lg`/`xl` via `CrudDialogSheet`) independent of the viewport, this meant a narrow dialog on a wide desktop viewport always showed two columns and a wide dialog on a narrow window could collapse to one — the opposite of what consumers expect. The body's padding box now carries `@container`, and the class is `@md:grid-cols-2` (container-query, content-width keyed). The loading skeleton — which shares the same `LAYOUT_CLASS["two-column"]` and `BODY_INSET` — collapses at the same content width. No new prop (ADR-0004), no structural change.
- **Consumer:** none required. Any `layout="two-column"` crud-dialog now collapses correctly when the dialog content is narrower than the `@md` container threshold (~448px), regardless of viewport width.
- **Breaking:** no.

## v0.66.4

- **Fixed (`ui/checkbox` indeterminate indicator):** a bulk-select header checkbox in the `indeterminate` state (some rows ticked) rendered the lucide `Check` icon — Radix mounts `CheckboxPrimitive.Indicator` for `indeterminate` as well as `true`, and the primitive drew `Check` unconditionally — so "2 of 25 selected" looked identical to "all selected". The root now carries `group`, and the two icons toggle off the root's `data-state`: `hidden group-data-[state=indeterminate]:block` on the new lucide `Minus`, `group-data-[state=indeterminate]:hidden` on the `Check`. The visible `checked` (check mark) and `unchecked` (empty box) outcomes are unchanged — the extra markup (a `group` token, the carried-but-hidden `Minus`, and the state-gated variant tokens) resolves to the same pixels — and no call site changes (both shipped bulk headers — `settings-table`'s `SettingsTableShell` and `list-with-detail`'s `TableBody` — already pass `"indeterminate"` and now read it correctly).
- **Added (test, `src/components/ui/checkbox.test.tsx`):** `checked={true}` (Check shown, Minus carried-but-hidden), `checked="indeterminate"` (Minus shown, Check hidden) and `checked={false}` (no indicator mounted). jsdom does not resolve Tailwind utilities, so a token is "shown" iff no standalone `hidden` hides it; the state-gated variants (`group-data-[state=indeterminate]:…`) are not resolved there and are asserted as the distinct mechanism that flips the indicators.
- **No donor baseline move:** the check→minus glyph is ~256 px in a 329k-px 390×844 frame — inside the `toHaveScreenshot` `maxDiffPixelRatio: 0.001` (~329 px) floor — so the `list-with-detail-bulk-summary` and `settings-table` baselines are byte-identical with or without the fix, and `screenshots:update` leaves `tests/screenshots/` untouched (verified: check-only and the full 57-shot suite pass on both source states). The fix is visible in the rendered gallery; the pixel gate is simply not sensitive at this glyph size.
- **Consumer:** none required; bump `design-baseline` to `0.66.4`. Any `checked="indeterminate"` checkbox (bulk-select headers and the like) now draws a dash instead of a check mark.
- **Breaking:** no.

## v0.66.3

- **Fixed (barrel, `listModules` in `.design-sync/modules.mjs`):** the bundled barrel no longer re-exports the donor's own `src/components/ui/*.test.tsx` files. `listModules` — the shared module list both `build-pkg.mjs` (the package barrel) and `scripts/design-sync-entry.test.mjs` (the drift guard) consume — filtered only `*.tsx`, so every ui test file (`button.test.tsx`, `calendar.test.tsx`, …) shipped in the published barrel and had to be hand-listed as an `@/components/ui/<x>.test` export in `.design-sync/typecheck-entry.ts`; adding a new `*.test.tsx` under `components/ui` broke `npm test` until that list was edited. The filter now drops `*.test.tsx`, and the 14 hand-listed test exports in `typecheck-entry.ts` are deleted (new test files need no entry).
- **Consumer:** none required; bump `design-baseline` to `0.66.3`. The barrel no longer re-exports the (meaningless out-of-package) `<ui-module>.test` specifiers — no consumer code can reference a non-existent test file, so nothing imports them.
- **Breaking:** no.

## v0.66.2

- **Fixed (package `files`):** the published tarball ships the methodology docs the shipped surface points at. `docs/STYLE.md` and `docs/PACKAGE.md` were referenced by `README.md` (the re-skin pointer and the four-line runbook) and by `scripts/lint-design.mjs` (whose header names `PACKAGE.md` as the home of the four-gate stack), yet they were absent from the `files` list, so a consumer following a failing `pnpm lint:design` into those files found them missing under `node_modules/design-baseline/docs/`. The `files` list now also ships the rest of the top-level doc set those two close over — `docs/ADOPTION-QUALITY.md`, `docs/TAXONOMY.md`, `docs/ARCHITECTURE.md`, `docs/RULES.md`, `docs/PROMOTION-RADAR.md`, `docs/PLUGIN-CONTRACT.md` — so no shipped doc, script, or source leaf points at a top-level `docs/<name>.md` the tarball does not ship. (Per-project docs a consumer authors locally, e.g. `docs/SURFACES.md`, are intentionally not donor files.)
- **Added (invariant 11, `verify:exports`):** `findDeadDocLinks` fails `npm test` when any shipped file (`README.md` or a file under the `files` scopes) references a top-level `docs/<name>.md` that exists in the donor repo but is outside every `files` scope — the dead-tarball-doc-link class this gap is, checked mechanically so the next `files` edit cannot silently drop a shipped doc again. Top-level only: a `docs/archetypes/<slug>.md` pointer is a sibling inside the always-shipped `docs/archetypes` dir and an `adr`/`backlog`/`superpowers` pointer is donor-internal tooling, so those are out of scope by construction.
- **Consumer:** none required; bump `design-baseline` to `0.66.2` and `docs/STYLE.md` / `docs/PACKAGE.md` (and their sibling methodology docs) are present under `node_modules/design-baseline/docs/`.
- **Breaking:** no.

## v0.66.1

- **Fixed (`SelectTrigger` content-fit overflow, `ui/select`):** a content-fit labelled trigger could grow wider than its container (no cap; the value column was floored at `max-content`), overflowing a phone card and widening the page. Its value column is now `minmax(0,1fr)` and the trigger is `w-fit max-w-full shrink-0`: label + widest option, never wider than its container (the value ellipsizes), never squeezed in a crowded band (the band still scrolls). Every `SelectTrigger` (base variant, labelled or not) now renders its value start-aligned (`text-start`), not centred.
- **Changed (scope):** content-fit applies only inside a `PageFrame` toolbar band. Outside a band a labelled trigger without a width class is `w-full` with no option ghosts (the `options` prop is ignored there). `SelectField`'s frame in a band is `shrink-0 max-w-full` (was `shrink-0` only with a width class). STYLE.md "Toolbar field labels" documents both rules.
- **Added (checks/demos):** `check:joined-label` gains a run on the new `content-fit-narrow` page-frame demo (a 360px container): band select capped and ellipsized, out-of-band labelled triggers fill their row with no ghosts, every value start-aligned, nothing overflows.
- **Consumer:** none required. A form/card `SelectTrigger label=… options=…` outside a band fills its row again — drop any width class added to work around the overflow; a labelled trigger in a hand-rolled toolbar row (not a `PageFrame` band) that went content-fit on v0.66.0 also fills its row again. A band select inside the app's own wrapper element needs `shrink-0` on that wrapper, or a crowded band squeezes it. Pixel baselines with a truncated or wrapped select value diff (value now start-aligned).
- **Breaking:** no.

## v0.66.0

- **Added (`SelectTrigger` content-fit mode, `ui/select`):** a labelled `SelectTrigger` with no width class is now **content-fit**: `w-fit` instead of the base `w-full`, so it no longer stretches across a toolbar band, and a new optional `options?: ReactNode[]` prop stacks every option label as invisible, `aria-hidden` text in the value's grid cell, so the trigger is as wide as label + its **widest** option and keeps that width when the selection changes. `SelectField` (`raw-select`, MANIFEST 1.3; contract unchanged) fills `options` from its own `options` (plus the placeholder) automatically. The fixed-box path (a width class or `fixedWidth`) is unchanged and renders no ghosts; unlabelled triggers are unchanged.
- **Added (lint):** `fixed-width-band-select` (`warn`) in `_adherence.json` — a fixed `w-*` / `size-*` on a labelled `<SelectTrigger label=…>` or an app's `<…Select label=…>` wrapper anywhere, or on a `<SelectField>` inside `toolbar={…}`. Opt-out for a deliberate fixed box: `// adherence-ok: fixed-width-band-select — <reason>`. Audit signal `band-select-fixed-width` (Axis C) mirrors it for the fleet scan.
- **Added (checks/demos):** `check:joined-label` gains six runs (plus: content-fit selects still fill the 430px filter-sheet row): every content-fit band select on the page-frame gallery route and the statement-with-filters, analytics-dashboard and matrix-grid demos carries option ghosts and shows its longest option whole at 1440px, and the new `content-fit-band` demo (`Jahr` with `2026 · A+B`, a bare `Struktur` trigger with `HGB §275 GKV`) keeps its width across a short-to-longest selection change. The matrix-grid, analytics-dashboard and statement-with-filters demos drop their guessed `w-*` widths and pass `options`; their pixel baselines move in the toolbar band only.
- **Consumer:** none required to keep working; a labelled `SelectTrigger` without a width class now hugs its content instead of filling its container. To adopt: drop the guessed `w-*` on band selects (the new lint rule lists them) and pass `options` to bare labelled triggers / labelled wrapper components. A content-fit trigger now contains every option label as hidden (`aria-hidden`, `invisible`) text: a consumer test doing `getByText(<option label>)` or matching the trigger's exact `textContent` sees the duplicate — scope it to the value (`getByRole("combobox")` + the selected text) or to the open listbox.
- **Breaking:** no (layout change only for an unsized labelled trigger, which used to fill its container).

## v0.65.1

- **Fixed:** a full-bleed (`matrix-grid`, `list-with-detail`, `kanban-board`, `calendar`, `statement-with-filters`) or document-column (`transaction-document`) shell rendered inside a `PageFrame` / `DashboardShell` body (frame or canvas stack) no longer marks the page column. `useFullBleedClass` / `useDocumentColumnClass` now also return `undefined` when `PageFrameContext` (hoisted into `layout/surface.ts`) is true, so only the outermost page shell sets the width mode (ADR-0007 §1). Before, a `MatrixGridShell` in a `DashboardShell` canvas dropped `--db-content-max` and the page jumped edge-to-edge.
- **Consumer:** none required; bump `design-baseline` to `0.65.1`. Page-root shells are unchanged.
- **Breaking:** no.

## v0.65.0

- **Added (`ui/checkbox-list-field`):** `CheckboxListField` — a labelled multi-pick list (`options` `{ value, label, badge?, disabled? }`, `value: string[]`, `onChange(string[])`, label/hint/error via the shared field frame) built on `Checkbox`, so it keeps the touch hit area. **Uncapped by default**: inside a `CrudDialogBody` (or any scrolling host) it grows and the host scrolls. Opt-in `scroll` applies the component's one fixed cap (`max-h-64`) for inline use. Gallery demo: 12 options in a `CrudDialogSheet` plus one inline capped list.
- **Audit:** new adoption-quality signal `checkbox-list-handrolled-capped` (a `max-h-<n>` / `max-h-[<n>rem|px]` + `overflow-y-auto` container wrapping `<Checkbox`); `crud-custom-scroll` widened to catch rem-step caps (`max-h-64`) inside a dialog, not only `max-h-Nvh`.
- **Consumer:** none required. A hand-rolled capped checkbox list (controlling-app consolidation "Mitglieder") bumps `design-baseline` and swaps to `<CheckboxListField>`.
- **Breaking:** no.

## v0.64.2

- **Fixed (`list-with-detail`, `ListWithDetailToolbar`):** the search no longer sits at its 14rem band floor when the band has room. The toolbar wrapper now grows (`grow`, basis auto), so `SearchInput` reaches its `max-w-sm` (384px) and a long placeholder shows in full; in a crowded band the floor holds and the band scrolls, unchanged. The kanban-board demo's toolbar wrapper got the same fix. `check:joined-label` asserts the 384px width at desk27 and laptop14.
- **Consumer:** none required; controlling-app search placeholders (e.g. `/workspace/consolidation`) stop clipping after a `design-baseline` bump to `0.64.2`.
- **Breaking:** no.

## v0.64.1

- **Added (`transaction-document` demo, no shipped-code change):** a realistic 2-line **warning-state** order case ("Shipped, no carrier scan") to the living demo — the consumer's `/orders/:id` shipped/no-scan shape: two ledger lines, `compactRowLocks` on with a locked column riding the ledger's header line (not a note row), and a warning next step whose single failed side effect renders inline with the shipment line. The case is not a strip option: it loads from the page hash (`#/a/transaction-document?variant=shipped`), and `check:viewports` navigates to it by URL. This is the shape the ledger **Total row fold is measured**: at the 1133×739 laptop window the Total row ends at **719px**, at most 739px. `check:viewports` now reports that fold for the case and fails if the Total row ends below the 739px fold (a post-loop guard fails the run if the 1133×739 window was never measured).
- **Why no shipped-code change (the ticket's two "costs" were already resolved):** the ticket opened on v0.54.0 flagging (1) a ~65px `LedgerTable` header row and (2) a padded `SideEffects` line. Both are already compact on `main`: the header row is `h-9`/`sm:h-6` (v0.54.0) and tightened to ~24px by the ADR-0017 compact density step (v0.59.0), and the `failedOnly` branch (v0.55.0) already renders the failed side effect inline with the shipment line. Measured at `main`, the only remaining cost was the demo's old title (a long marketing line, not the order number the consumer renders), which pushed the Total below the fold. The citation is the consumer itself: brickshop-manager's sales order page `/orders/:id` (`order/sales/SalesOrderDocument.tsx`) renders the shell with `title={order.order_number}` — a one-line order number, not a heading-sized marketing line — and its visual gate (`tests/visual/projects.ts`) imports the donor's `laptop14Window` (1133×739) and `widthSweep` from `design-baseline/testing/devices`. The demo now titles the page with the order number the same way.
- **No donor baseline move (acceptance criterion 2):** this entry changes no shipped file and no donor screenshot baseline. `git diff -- src/components/archetypes/` against the previous version is empty, and the demo's default (non-compact) view is byte-identical to v0.64.0 — the strip keeps its four options and the new case is reachable only from the page hash — so the `transaction-document` pixel baselines (`tests/screenshots/{phone,laptop14,desk27}/transaction-document.png`) do not move and the non-compact `LedgerTable` / `nextStep` rendering is byte-identical to v0.64.0.
- **Consumer:** none required; shipped `LedgerTable` / `nextStep` rendering is byte-identical to v0.64.0. A consumer chasing the laptop fold (brickshop-manager `/orders/:id`, shipped, no carrier scan) bumps `design-baseline` to `0.64.1` as the anchor and re-baselines its `laptop14Window` screenshot with `known-failing` cleared.
- **Breaking:** no.

## v0.64.0

- **Added (`list-with-detail`, contract v4.8, MANIFEST 4.12):** optional `onBeforeDetailClose?: () => boolean | Promise<boolean>`. The shell consults it before the detail overlay leaves its row — Esc, backdrop click, the close button, and a `detailStepping` previous/next step. `false` (or a rejected / `false`-resolving promise) keeps the overlay open on the same row with its draft intact and skips `onDetailClose`; `true` proceeds and `onDetailClose` fires once after the close. Further close/step attempts while an async guard is pending are ignored. The demo gains a "Close guard" panel (dirty notes draft, discard / keep-editing confirm).
- **Consumer:** none required; without the prop every close proceeds as before. A detail holding unsaved input (e.g. controlling-app Planung account sheet) bumps `design-baseline` and passes the guard.
- **Breaking:** none.

## v0.63.0

- **Added (`crud-dialog`, contract v3.11, MANIFEST 3.12):** `CrudDialogSheet` width step `"xl"` (54rem, ~860px) for a two-pane body: inputs beside a live result pane, stacked on mobile. Layer 2 keys a body with a live result pane to `"xl"` first, then tab count, then field count, so every body still resolves to exactly one step. The demo gains a "Two-pane" layout (inputs left, computed preview right, container query). Mobile stays full-viewport; `sm` / `md` / `lg` unchanged.
- **Consumer:** none required. A two-pane dialog (e.g. controlling-app Planung "Neuer Effekt") bumps `design-baseline` and passes `width="xl"`.
- **Breaking:** none; the `width` prop type widens.

## v0.62.0

- **Added (`list-with-detail`, contract v4.7, MANIFEST 4.11):** three optional, default-off props. `bulkSelectable` + `selectedIds` / `onBulkSelectChange` / `bulkActions` / `onBulkDelete` (table presentation only): a checkbox column; while a shown row is ticked, a bulk band ("{n} selected", the actions, "Clear selection") replaces the page's toolbar band. Ids a filter hides are pruned from the consumer's selection via `onBulkSelectChange` (not while loading/erroring). `detailStepping`: previous/next buttons in the detail overlay header that call `onRowSelect` with the adjacent row of `rows` (the displayed order), disabled at the ends. `summary`: a band above the body, sticky below the app header while rows scroll. New `labels` keys: `selectAll`, `selectRow`, `selectedCount`, `deleteSelected`, `clearSelection`, `previous`, `next`; new baseline label `clearSelection`.
- **Moved:** settings-table's `computeBulkSelection` / `resolveCountLabel` / `resolveBulkActions` now live in `archetypes/shared` (exported there); settings-table behaviour is unchanged (MANIFEST 3.9).
- **Consumer:** none required; pages that pass none of the new props render unchanged. A custom `BaselineLabels` object must add `clearSelection`.
- **Fixed:** the shared "Delete {n} selected" button (settings-table, list-with-detail) now calls `onBulkDelete` even when `onBulkSelectChange` is not passed; it was a silent no-op.
- **Breaking:** type-only, for a hand-built full `BaselineLabels` object (it must add `clearSelection`); no runtime break.

## v0.61.0

- **Changed (ADR-0018):** `matrix-grid`'s `inspector` renders on every viewport as the standard edge overlay over a dimmed backdrop, with list-with-detail's content-sized geometry (floor 28rem, ceiling `100vw − 4rem`, full-screen below `sm`); it no longer docks at ~480px beside a narrowed grid. The grid keeps its width and is inert while the overlay is open: switch lines with prev / next, or close (backdrop click, Escape, close button — all through `onBeforeSelect`) and click. `body` / `dock` keep the full column. The geometry is one shared class (`archetypes/shared/detailOverlay`) used by both surfaces. Contract v4.0, MANIFEST matrix-grid 4.0.
- **Consumer:** bump `design-baseline`; re-baseline screenshots of pages with an open inspector (controlling-app `workspace/planung`). Remove any layout that assumed the narrowed grid beside the panel.
- **Breaking:** placement only; no prop changes.

## v0.60.0

- **Added:** `ScrollCue` and `FIRST_COLUMN_CLASS` (`archetypes/shared`). `ScrollCue` is the one horizontal scroller with a right-edge fade while content lies past the edge (none at the end or when it fits), promoted from print-statement. `FIRST_COLUMN_CLASS` is the label-column width rule: ~8ch min, ~40% (`cqw`) max, truncated.
- **Changed (phone column allocation):** `matrix-grid`'s sticky label column follows `FIRST_COLUMN_CLASS` (the 180px floor now applies from `sm` only), so at 390px three value columns show. Right-aligned table cells (`alignClass("right")`: figures, amounts, dates, "35 / min") never wrap, in `list-with-detail`, `grouped-list` and `settings-table`; `settings-table` header cells never wrap and its identifier (name) cell truncates. Horizontal scrollers render through `ScrollCue`: `ui/Table`, `FigureTable` (report, statement-with-filters), `matrix-grid`, `calendar` week grid, `import-wizard` stepper (which now scrolls instead of cropping "4 Commit"), `kanban-board` lanes, the phone view-switch strip, print-statement. MANIFEST: list-with-detail 4.10, settings-table 3.8, grouped-list 4.7, matrix-grid 3.10, import-wizard 3.9, kanban-board 3.8, calendar 3.4, print-statement 1.2.
- **Changed (invariants):** `checkPageInvariants` adds `tableColumn` (a table's first text column under ~6ch fails) and `scrollCue` (a horizontal scroller clipping content with no `[data-slot="scroll-cue"]` sibling fails).
- **Consumer:** bump `design-baseline`; re-baseline phone screenshots of pages with tables, boards, matrices or a stepper. A page that hand-rolls an `overflow-x-auto` strip which overflows at phone width now fails `scrollCue` in its Playwright suite: wrap it in `ScrollCue` (or add the code to `knownGaps` with a ticket). The same failure has a second, quieter cause: a consumer that resolves `ui/` project-first (the two-entry alias array, `docs/PACKAGE.md`) keeps its own copied `src/components/ui/table.tsx`, which **shadows** the package's `Table` and so never receives this release's `ScrollCue` wrapper — it still renders the bare `overflow-auto` scroller, so any of its tables that overflows at phone width clips sideways with no `[data-slot="scroll-cue"]` sibling and fails `scrollCue`. Fix the copy, not the page: re-sync `table.tsx` from the donor (the diff-and-keep-or-delete rule in `docs/PACKAGE.md` — delete it when normalisation shows it identical or behind), or wrap the table in `ScrollCue`; `knownGaps` plus a ticket stays the escape hatch.
- **Moved:** `className` on `WizardStepper` and `FigureTable` now lands on the outer `ScrollCue` box (was the `<ol>` / the scroller); layout classes (margins, width) behave the same, flex or gap classes meant for the strip itself no longer reach it.
- **Breaking:** no API break; the new invariant codes can fail a consumer suite (see Consumer).

## v0.59.0

- **Changed (ADR-0017 compact density step):** surfaces tighten at every app density but touch (`useCompactDensity()`, new export of `ui/toolbar-band`); under touch (phones by default, `density="touch"`) they keep today's roomy step and no control target changes. `Table`: 13px body, `TableHead` `h-9`, `TableCell` `px-3 py-2` (~37px rows, was ~53px). `StatTile`: `px-4 py-2`, 24px value (~60px, was ~105px). `KeyValueList`/`KeyValueRow` and `MetricList`/`MetricRow`: unruled 28px rows (were ruled 38px).
- **Changed (chrome, every density):** `AppHeader` is 48px (was 64px) and no longer renders `title` (now optional; it names the header landmark). `AppSidebar` has one borderless 48px top row: brand mark + the `aboveNav` switcher (the app name becomes screen-reader text) or the app name; the separate bordered switcher row is gone. Kanban lanes (`BoardColumn`) drop the sunken tray, cards 6px apart (kanban-board MANIFEST 3.7). The toolbar band's Filter and View buttons are `ghost`. detail-overview MANIFEST 4.9.
- **Consumer:** bump `design-baseline`; re-baseline screenshots (every page with a table, stat tile, key-value or metric list, board, toolbar band, plus header and sidebar chrome) — controlling-app, hk-crm, brickshop-manager. An `aboveNav` switcher styled as an outlined full-width button with its own margin should become a ghost `w-full` button; under `collapsible="icon"` the slot is hidden (only the brand mark shows), so an icon-mode switcher variant no longer renders. To keep the roomy surfaces on desktop set `AppShell density="touch"` (also lifts controls to 44pt).
- **Breaking:** no (visual only; `AppHeader.title` became optional).

## v0.58.0

- **Added:** `list-with-detail` `detailActions` accepts the typed `HeaderActions` form (`{ primary, secondary, menu }`), rendered through the page header's renderer: at most 1 primary + 2 secondary inline, the rest behind one `⋯` menu (last in the actions row), destructive only in the menu. From `sm` up the typed row stays on one line and widens the overlay (ADR-0010 amendment); below `sm`, whenever `⋯` renders anyway, the secondaries fold into it too (primary + `⋯`); with no overflow they stay inline (primary + 1 secondary shows no `⋯`). Contract v4.6, MANIFEST 4.9.
- **Consumer:** none required; existing `ReactNode` callers render unchanged (uncapped). To get the cap, pass `detailActions={{ primary, secondary, menu }}`.
- **Breaking:** no.

## v0.57.2

- **Fixed:** the shared figure table (statement-with-filters, report) no longer squeezes the label column to one character at phone width. The label track is floored at `7rem`; below the grid's minimum width `FigureTable` scrolls horizontally, so no figure is dropped.
- **Consumer:** bump `design-baseline`; re-baseline screenshots of pages using these tables.
- **Breaking:** no.

## v0.57.1

- **Fixed (print-statement):** `PrintStatementShell` shows a screen-only right-edge fade while its body overflows to the right, so a clipped wide table no longer reads as complete; it hides at the scroll end, when the body fits, and in print. The gallery demo pins its Position column.
- **Consumer:** bump `design-baseline`; re-baseline `print-statement` screenshots.
- **Breaking:** no.

## v0.57.0

- **Changed (tokens, light theme only):** `--border` `220 13% 91%` (neutral, matches `--sidebar-border`; was bluish `214.3 31.8% 91.4%`); `--input` split from `--border`, now `218 16% 83%` (~1.5:1 on white, field and outlined-button edges show); `--foreground` / `--card-foreground` / `--popover-foreground` `222 22% 10%` (~17.9:1 on white; was saturated navy-black). `.dark` unchanged.
- **Added:** `--shadow-overlay` in `tokens.layer.css` (tinted ring plus two layers); `dialog`, `popover` and `sheet` use `shadow-overlay` instead of `shadow-lg` / `shadow-md`. Raised non-overlay surfaces keep the hairline.
- **Consumer:** bump `design-baseline`; a brand `tokens.css` that overrides these values keeps them. Re-baseline screenshots (light theme, most pages).
- **Breaking:** no (visual only).

## v0.56.0

- **Changed (ADR-0016, amends ADR-0007 §2):** the uppercase overline is retired for a quiet sentence-case hierarchy. Page title 30px (unchanged) > section heading 15px semibold foreground > card title 13px semibold foreground > body 13px; labels are 12px medium muted. No shared heading or label renders uppercase or letter-spaced any more.
- **Changed — visuals of these owners and every archetype composing them:** `SectionHeading` (15px bare, 13px inside a card) and `SectionCard` (title inside the card padding, no ruled `border-b` band; body `px-5 pb-4` under a title) — so `DetailSection` (detail-overview), grouped-list groups and form-page field groups; `StatTile` / `StatTileRow` labels (detail-overview stats, analytics-dashboard KPI row); `Sidebar` group labels (chevron now shows on hover / keyboard focus only); `SectionNav` group headings; `BottomNav` sheet title; kanban-board `BoardColumn` titles; the typed `<Overline>` (overline-typed v2.1); column headers via `COL_HEADER_CLASS` in shared `FigureTable` (report, statement-with-filters), `StatementTable` section rows, `CalendarShell` weekday labels, and the report and print-statement demos; `SurfaceHeaderBar` (list-with-detail detail sheet, `CrudDialogHeader`) and the matrix-grid `MatrixInspector` header lose their `border-b`; `Alert` `variant="warning"` is border-only (status colour on border and icon, foreground text, no tinted fill).
- **Added:** `SECTION_HEADING_CLASS` and `CARD_TITLE_CLASS` in `layout/overline`. `OVERLINE_CLASS` and `COL_HEADER_CLASS` keep their names and now carry the 12px label rung.
- **Consumer:** no API changes; bump `design-baseline`. Re-baseline screenshots (every page with a section card, stat tile, table header, sidebar, dialog/drawer header or warning alert). A hand-typed `uppercase tracking-*` label still renders the old look: compose `OVERLINE_CLASS` / `<Overline>` instead.
- **Breaking:** no (visual only).

## v0.55.2

- **Fixed:** the dialog/drawer header bar (`SurfaceHeaderBar`, used by the `list-with-detail` detail sheet and `CrudDialogHeader`) no longer squeezes its title to zero width next to several actions. The bar wraps, and the title block keeps a 12rem basis: actions that do not fit beside it move onto a row beneath the title. With one short action and a short title the header looks as before. A long title still truncates and never widens the sheet (ADR-0010 rule 3, amended).
- **Changed:** the `list-with-detail` sheet's close-button clearance moved from the actions row to the bar's right padding (`pr-13`), so the title clears the close button when the actions wrap. `ListWithDetailShell` no longer wraps `detailActions` in its own `shrink-0` div, and `CrudDialogHeader`'s actions group no longer has `shrink-0`.
- **Consumer:** none required; bump `design-baseline`. behandlungskompass can move its patient-detail actions back into `detailActions` (ticket `patient-detail-sheet-name-hidden`). Re-baseline screenshots of detail sheets or crud dialogs with several header actions.
- **Breaking:** no.

## v0.55.1

- **Fixed:** `transaction-document` with `ledger.compactRowLocks`: the 12px ledger-body pull-up (`sm:-mt-3`) and the `h-6` header row (`h-9 sm:h-6`) from v0.55.0 now apply from the `sm` breakpoint only. On a phone the shorter page put a ledger lock button under the next-step panel's action buttons (a tap overlap in brickshop-manager's phone visual check). Laptop widths are unchanged.
- **Consumer:** none; bump `design-baseline`.
- **Breaking:** no.

## v0.55.0

- **Changed:** `transaction-document`: in a toned (warning/error) next-step panel (any ledger mode; default tone is unchanged) whose side effects are all failed, they render under the description inside the panel's text column instead of a separate "Running alongside" block (every failed effect stays visible; the row uses `leading-4`); and, only with `ledger.compactRowLocks`, the ledger header row is `h-6` (was `h-9`) and the ledger card's top padding above it shrinks by 12px (unless the ledger itself is locked, which keeps its note above the table). Non-compact ledgers are unchanged.
- **Measured:** brickshop-manager `/orders/:id (shipped, no carrier scan)` at `laptop14Window` (1133x739): ledger Total row bottom 774px on v0.54.0, 748px with the first cut (h-7, pt-0.5), at or under 739px (visual check passes with the known-failing entry removed) with this release.
- **Consumer:** none; re-baseline screenshots of toned documents and compact-lock ledgers.
- **Breaking:** no.

## v0.54.0

- **Changed:** `HEADING_ROW_CLASSES.actions` (every `PageHeader`, `PageFrame`, `NestedPageHeading` and the transaction-document header): from a 768px (`@3xl`) row the cap rises from 60% to 80% (768px is the narrowest row where a primary + secondary + overflow cluster fits one line), so it no longer wraps beside the title at a laptop window. The cluster no longer shrinks from that width (the title absorbs it). A wider cluster still wraps instead of overflowing, and the title keeps at least 20%. Below `@3xl` nothing changes.
- **Changed:** `transaction-document`: with `ledger.compactRowLocks` the ledger header row is `h-9` instead of the shared `h-12`. Default rendering is unchanged.
- **Consumer:** no new props. Re-baseline screenshots of pages with header actions at 768px+ column width and of compact-lock ledgers; brickshop-manager bumps `design-baseline` and re-runs its visual check.
- **Breaking:** no.

## v0.53.1

- **Fixed:** `checkPageInvariants` / `assertPageInvariants` measure against `device.viewport.width` instead of `window.innerWidth`, and report `overflow:` when the layout viewport has grown past it. Under mobile emulation the viewport grows to fit overflowing content, so real phone overflow (and `clipped:` edges) passed silently. `device` must now carry `viewport` (every `devices.*` triad entry does).
- **Consumer:** none if you pass a `devices.*` entry; expect previously hidden phone overflow to start failing.
- **Breaking:** no for API; stricter check.

## v0.53.0

- **Changed:** `transaction-document` (contract v1.7): with `ledger.compactRowLocks`, a locked cell's lock icon now sits inline left of its figure (one line per row, not stacked above it), and a column lock (`LedgerColumn.lock`) moves from a note row above the table into the ledger card's title line as a lock icon with a popover (reason and way out; keyboard and touch reachable, sr-only reason). Default rendering is unchanged. `LedgerTable` gains `columnLocksInHeader` (the shell sets it with `compactRowLocks`; a standalone ledger keeps its notes).
- **Changed:** `identity.progress` now renders full width under the header instead of inside the header's subtitle column, so a six-step line stays on one line at a laptop window instead of wrapping beside the header actions. Applies to every document that sets `identity.progress`; no prop change. The line now sits between the header and the next-step card.
- **Consumer:** no new props; `compactRowLocks: true` already covers the lock changes. Re-baseline any screenshot of a document with a progress line.
- **Breaking:** no.

## v0.52.0

- **Changed:** layout switches of seven primitives now key on their own container width instead of the viewport (the `DetailOverviewShell` `@container` pattern): `StatTileRow` (`sm` to `@4xl`), `KeyValueRow`/`KeyValueList` (`md` to `@sm`, so the 300px rail stacks label over value), `CardGridBody` and `DashboardGrid` (`sm`/`lg` to `@4xl`/`@5xl`; `DashboardWidget` spans follow), `StructureBuilderShell` (`lg` to `@4xl`), `SettingsTableShell` edit pane (`md` to `@4xl`), `SectionNavShell` (`md` to `@4xl`), `DashboardGrid` gap (`md:gap-5` to `@2xl:gap-5`). Inside `AppShell` (256px sidebar) the real column is narrower than the viewport, so the wide layouts now start later: a ~780px column keeps the narrow layout of every one of them (`@4xl` = 896px; this is the intended jump from the old 640px `sm` point, e.g. the KPI strip stays single-column below 896px), while the 1144px laptop column shows the wide layout. In detail-overview the main column beside the 300px rail is ~820px on a laptop, so its KPI strip now stacks there.
- **Consumer:** `StatTileRow`, `DashboardGrid`, `SectionNavShell` forward `className` to a new outer `@container` wrapper (the element the parent lays out), the grid/surface sits inside it; `CardGridBody` gains a wrapper element. Layout classes like `lg:col-span-2` / `h-full` still apply to the laid-out element. Re-baseline pixel snapshots of affected pages. `KeyValueRow` has no container of its own and must sit in `KeyValueList` (the `<dl>` is its container), otherwise it queries whatever ancestor container exists. A wrapper is `container-type: inline-size`, so do not place one as a shrink-to-fit flex/grid item. `check:viewports` gains a ~780px-column vs wide-column assertion on the analytics-dashboard.
- **Not converted (own tickets on `main`):** `DashboardPeriodPair` (`dashboard-period-pair-container-query`), `DashboardAssignmentList` (`dashboard-assignment-list-container-query`), `CrudDialogBody` two-column grid (`crud-dialog-body-two-column-container-query`). `SettingsTableShell` column `hideBelow` tiers now key on the body's container too (`md` hides below 896px, `2xl` below 1152px); the shared `hideBelowClass` used by the list-with-detail table body and matrix-grid stays viewport-keyed (follow-up `settings-table-edit-surface-container-query`).
- **Consumer (SettingsTableShell):** the edit pane now appears when the body's container is at least 896px wide, not at viewport `md`. A consumer that opens its edit dialog from a viewport check (`useIsMobile`) must switch to the shipped `useEditPaneNarrow(ref)` (exported from `design-baseline/archetypes/settings-table`, with `SETTINGS_TABLE_EDIT_PANE_MIN_WIDTH`; `ref` wraps the shell; see `src/examples/settings-table-demo.tsx`), otherwise a column between 768px and 896px of body width has neither pane nor dialog.
- **Breaking:** yes for `SettingsTableShell` consumers that pass `editPane` and open a viewport-keyed dialog fallback (migration above); otherwise no (visual threshold change only).

## v0.51.0

- **Added:** `transaction-document` (contract v1.6): `ledger.compactRowLocks` (also `LedgerTable` `compactRowLocks`), opt-in. A row's cell lock shows as a lock icon beside the locked figure, with the reason and way out in a popover opened from it (keyboard and touch reachable; the reason also reads aloud without opening), instead of a sentence under the line's label. Default off: no ledger changes unless it opts in.
- **Consumer:** set `ledger={{ ..., compactRowLocks: true }}` to keep a 2-item ledger's Total above the laptop fold.
- **Breaking:** no.

## v0.50.8

- **Fixed:** `ComboboxField` groups options with an in-place push instead of re-spreading the bucket per option (O(n²) per group on every `onSearch` result). Group and option order unchanged.
- **Consumer:** none.
- **Breaking:** no.

## v0.50.7

- **Fixed:** `structure-builder` keyboard palette placement no longer drops focus to `<body>`: contract v1.1 specifies focus moves to the next palette item's place action (previous if last; the placed tree line when the palette empties). `StructureTree` rows now carry `data-node-id`; demo and `templates/structure-builder.tsx` follow the rule.
- **Consumer:** pages scaffolded from the old template can copy its `focusAfter` effect.
- **Breaking:** no.

## v0.50.6

- **Fixed:** a joined `NativeField` in the mobile `PageFrame` filter sheet no longer overflows its control — the sheet's existing re-scope (the one that already fixed the `SelectTrigger` `button` and `SegmentedControl` `radiogroup` rows) now also re-scopes the `NativeField` grid row's track to `130px + minmax(0,1fr)`, and the value cell carries `min-w-0` so a number input can shrink below its 258px intrinsic width. In the toolbar band itself the value column still floors at `max-content` (the band scrolls, it does not clip the value), so a content-sized band is unchanged.
- **Consumer:** none; only the filter sheet's number inputs shrink to fit. No prop or behaviour change.
- **Breaking:** no.

## v0.50.5

- **Fixed:** `MatrixGridShell` with `emptyState` no longer drops the `body` and `dock` workbench slots; the empty state replaces the grid only, and `body` then `dock` render below it (`matrix-grid` contract v3.9). Without `body` / `dock` the empty-state DOM is unchanged.
- **Consumer:** none. controlling-app `workspace/planung` with no plan lines now keeps its config panel.
- **Breaking:** no.

## v0.50.4

- **Changed:** `AppShell`'s `<main>` drops its top padding to 16px (`has-[.db-document-column]:pt-4`) on pages that carry `DOCUMENT_COLUMN_CLASS` (transaction-document), so the breadcrumb sits 16px under the app header at every width. Horizontal and bottom insets, and every other archetype, are unchanged.
- **Consumer:** none; a document-column page renders 32px (md) / 40px (xl) higher. Re-baseline pixel snapshots of such pages.
- **Breaking:** no.

## v0.50.3

- **Fixed:** `JoinedLabelText` sets `title` to its text when the label is a string, so a joined toolbar label ellipsized at the `max-w-32` cap (SelectTrigger, SegmentedControl, ToggleField, NativeField) shows its full text on hover. ReactNode labels get no `title`.
- **Consumer:** none.
- **Breaking:** no.

## v0.50.2

- **Fixed:** `DialogContent` spaces a direct `<form>` child with `grid gap-4` (`[&>form]:grid [&>form]:gap-4`), so a header / input / footer inside the form no longer sit flush. `usePrompt` drops its now-redundant `grid gap-4` on the form.
- **Consumer:** controlling-app drops the manual `mt-4` on the Input at `dashboard-templates/page.tsx:156` (else 32px above the input); a direct form child using `space-y-*` would get doubled spacing.
- **Breaking:** no.

## v0.50.1

- **Changed:** `SettingsTableShell` splits its props with the new `PAGE_SHELL_FRAME_KEYS` / `splitShellFrameProps` (exported from `layout/PageFrame`) and spreads the rest into `SettingsTableBody`, so a new body prop reaches the body with no shell edit. `SettingsTableBody` skips its count/bulk derivation when `band={false}`. No prop or behaviour change.
- **Consumer:** none.
- **Breaking:** no.

## v0.50.0

- **Added:** `WizardShell` takes `viewSwitch`, `viewOptions` and `viewOptionsLabel` (import-wizard contract 2.4, MANIFEST 3.8) and forwards them to `PageFrame` in both the stepper and the `done` state. The history toggle ("New import" / "History") goes in `viewSwitch`; display-only toggles (decimals) in `viewOptions`. Demo shows one route hosting `WizardShell` and `ListWithDetailShell` behind the same switch.
- **Consumer:** controlling-app `/workspace/import` moves its tab strip into `viewSwitch` and its decimals checkbox into `viewOptions`, and drops its direct `PageFrame`.
- **Breaking:** no.

## v0.49.1

- **Added:** `design-baseline-playwright` always passes `--add-host host.docker.internal:host-gateway` (resolves the name on a Linux engine; no-op on Docker Desktop) and splices `DESIGN_BASELINE_PLAYWRIGHT_DOCKER_ARGS` (whitespace-split `docker run` args: `--network`, `-e`, `-v`) before the image name. Documented in `docs/PACKAGE.md` Gate 3 setup.
- **Consumer:** none required; compose-served consumers can drop their `uname`-based host switch.
- **Breaking:** no.

## v0.49.0

- **Added:** `WizardPanel` (import-wizard contract 2.3, MANIFEST 3.7): the embeddable wizard frame — stepper, step body and Back / Next·Commit footer with no `PageFrame` and no title, for Dialog and tab-body hosts. Props: `steps`, `current`, `onBack`, `onNext`, `onCommit`, `canProceed`, `busy` (spinner + disabled footer), `nextLabel`, `commitLabel`, `backLabel`, `busyLabel`, `firstBackLabel` + `onFirstBack` (outline exit button on the first step), `stateLabels`, `className`. `WizardShell` now composes it (public props unchanged); its busy commit button now shows a spinner. Dialog-hosted demo added to the gallery.
- **Consumer:** controlling-app swaps its local `WizardShell` for `WizardPanel` as a rename and deletes the local copy.
- **Breaking:** no.

## v0.48.1

- **Fixed:** `DetailOverviewShell` rail layout switches on its own container width (`@container`, `@4xl` = 896px) instead of the viewport `lg`, so inside `AppShell` (sidebar eats 256px) a ~780px column stacks instead of squeezing the main column next to the 300px rail. Class change only, no new prop.
- **Consumer:** none required.
- **Breaking:** no; visual change between ~1024px and ~1150px viewports (stacked instead of rail).

## v0.48.0

- **Added:** grouped-list work-queue variant (contract 4.6, MANIFEST 4.6): `WorkQueueViewSwitch` (Open · Completed · All with counts, for the shell's `viewSwitch`), `WorkQueueGroups` (one card per non-empty workflow step with a toned count and one bulk action; empty steps collapse into one pipeline line; 44px open / 38px archive single-line rows) and `WaitingAgeCell` (age toned by warning/danger thresholds). New shared `WorkflowStep` / `WorkflowTone` types, exported from `grouped-list` and `transaction-document`; `TransactionNextStepTone` is now an alias of `WorkflowTone` (same union), and `TransactionDocumentShell`'s `nextStep` takes an optional `step: WorkflowStep` that supplies the panel tone and the default title (contract 1.5, MANIFEST 1.6); a step-keyed `nextStep` rejects its own `tone` at type level.
- **Consumer:** none required. Work-queue pages (orders, invoices) adopt the variant instead of hand-rolling status tabs.
- **Breaking:** no.

## v0.47.0

- **Added:** transaction-document compact header and next step (contract v1.4, MANIFEST 1.5; operator mockup V2). `TransactionNextStep.secondary?: HeaderAction[]` (at most two) renders outline buttons beside the primary (extras beyond two are dropped) in one right-aligned, wrapping row next to the title and description (hidden with the primary under a `locks.nextStep`). `sideEffects` render as one inline wrapping line (icon + label + link per effect, state kept). `TransactionProgressStep.date?: Date | string` renders after the label ("Placed 30.10."; a `Date` as day.month in the page locale). `facts` also accepts `TransactionFactGroup` (`{ title, items, subline?, change?, lock? }`) beside flat facts. The header uses the new `PageFrame`/`PageHeader` `titleStep="document"` (shell-only, not in `PageShellFrameProps`): 24px h1, tighter header-to-body gap. The next-step "Next step" eyebrow is now screen-reader-only (prefixed to the heading).
- **Consumer:** none required; optional: move state actions into `nextStep.secondary`, step dates into `progress[].date` (and drop them from facts), related facts into groups.
- **Breaking:** no for API; visual change — transaction-document pages render a shorter header and next-step panel.

## v0.46.3

- **Fixed:** `TransactionDocumentShell` shows the document number once: when `title` equals `identity.id`, the header `td-id` chip renders the copy button only (no repeated number text). A differing title is unchanged (MANIFEST 1.4).
- **Consumer:** none required.
- **Breaking:** no.

## v0.46.2

- **Fixed:** `BoardCard`s keep their border and raised fill when the board is nested in another raised surface (a titled `SectionCard`, a dialog/drawer, a parent `PageFrame`). `BoardColumn` now resets the nested-surface context for its cards: a sunken lane starts a fresh surface (ADR-0015 rule 2 amendment; kanban-board contract v3.6, MANIFEST 3.6). Top-level boards are unchanged.
- **Consumer:** none required.
- **Breaking:** no.

## v0.46.1

- **Changed:** `PageFrame` `body="stack"` keeps the toolbar band (search, filters, mobile filter sheet) as a band-only card when no child renders (e.g. every group hidden by an active search); it used to drop the band, so the search could not be cleared. `GroupedListShell`'s per-shell guard for this is removed.
- **Consumer:** none required.
- **Breaking:** no.

## v0.46.0

- **Changed:** `FormPageShell` renders a `PageFrame` stack body (contract v3.3, MANIFEST 3.3, ADR-0015): each field-group `SectionCard` is its own bordered, rounded card on the canvas, and the shell no longer wraps the children in a padded inset div. `FormPageActions` stays outside every card (sticky on the phone).
- **Consumer:** a form with fewer than 3 groups, or a field grid, must wrap its fields in one untitled `SectionCard` (bare fields would sit on the canvas); the shell owns the gap between cards, so the `<form>` needs no spacing class (drop a `space-y-*` to avoid doubling it). The `<form>` must be a direct child of the shell (a wrapper `<div>` loses the card gap). `FormPageActions`' mobile bar now defaults to 0.75rem side padding when no `--form-inset` is published (was 0); surfaces that publish it (`FORM_INSET_CLASS`) are unchanged.
- **Breaking:** no for API; visual change — groups render as separate cards, and bare fields sit on the canvas until wrapped.

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
