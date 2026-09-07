# Adherence lint — notes & ledger

The prose that used to live inside the lint config, moved out so the config stays pure data.
The config (`_adherence.json`) and its runner (`scripts/lint-design.mjs`) are the mechanical
half of **ADOPTION.md gate 2** (see `docs/ADOPTION.md`, `docs/PLACEMENT.md`).

## How it runs

A consuming project wires a `lint:design` script (`node scripts/lint-design.mjs`) and runs it
in CI. The scanner is **zero-dependency** — a heuristic `.ts`/`.tsx` source scan, no ESLint or
oxlint required — so a consumer with no linter still gets a working gate. Warnings are allowed
during rollout; flip a rule to `"severity": "error"` in `_adherence.json` as its violation class
is cleaned (the ratchet). Matching is case-sensitive, so the design-system primitives `<Button>` /
`<Table>` are never flagged — only the bare lowercase HTML elements.

A rule carries either `tag` (a bare-element ban — the scanner builds the `<tag` open-tag regex)
or `pattern` (an arbitrary JS `RegExp` source, used verbatim). The three `pattern` rules —
`literal-color`, `weak-focus-ring`, `raw-html-control` — are ported from `docs/audit-signals.json`'s
`conformance` array, so a consumer's `lint:design` and the dashboard's fleet scan measure the same
violations. Keep them in sync: change one, change the other. `raw-html-control` is deliberately
narrowed to `input|select|textarea` — `button` and `table` already have dedicated tag rules, and
the full alternation would double-warn the same line.

A rule may also carry an optional `include` glob (repo-root-relative), restricting it to that path
set — matched by stdlib `path.matchesGlob` (Node >= 22): `**` spans any run of directory segments,
`*` matches within one. This is what lets a rule
target a single layer of the tree without firing on the rest: the `src`-wide `targets` would
otherwise flag `src/components/ui/`, where `variant` and `size` are correct shadcn practice.

A rule may also carry an optional `exclude`, which removes a matching path from the rule
(in addition to `include`, when both are set). `exclude` is a glob, or an array of globs —
the file is skipped when ANY entry matches. That is the per-archetype **ratchet valve**: once an
archetype's class is closed, its folder is excluded from the shared `warn` drain rules and a set of
per-folder `error` rules is added for the closed API, so the scanner no longer counts a closed
archetype as an open one (the `detail-overview-*` rules below are the first to use it; the
`form-page-shell-class-name` rule is the second closed archetype's ratchet).

`targets` lists the directory roots the scanner walks for `.ts` and `.tsx` files
(`'**/*.{ts,tsx}'` per target). The donor ships `["src"]`; a consumer retargets it to its
app-page directories (e.g. `["src/app/(app)"]`), since these bans apply to page bodies, not
marketing/auth chrome or the primitive definitions themselves (the DS `table.tsx` /
`button.tsx` legitimately contain the raw elements they wrap).

### Why the walk spans `.ts`

`.ts` files hold the shared column/table contract (`tableColumn.ts`), the hook **result**
types (`useCrudDialogController.ts`, `useFormPageState.ts` …), and `src/components/layout/`
helpers — any of them can carry a prop declaration the rules must see. Walking `.tsx` only
silently narrowed what `targets` yields: `includeReachableUnder` proves a rule's `include` is
reachable under the targets, but the walk then never handed those files to the rule — provably
reachable, never executed. The widening (2026-09-07) surfaced exactly one live defect the
narrow walk hid: `tableColumn.ts`'s `identifierMono` / `align` (triaged by exclude, see the
rule messages).

Two boundaries of the widened walk:

- **`gallery/` is intentionally OUT of `targets`.** `gallery/` is donor-dev demo-hosting code
  that never ships to a consumer (`npm run gallery:build` emits `gallery-dist/`, the surface
  the dashboard hub iframes), so consumer-facing adherence is not what it measures — and adding
  it would put the six `error` appearance rules on a tree of deliberate raw-HTML demo markup
  (hand-rolled tables, bare buttons, literal palette classes demonstrating the primitives). The
  stale-call-site class it hid (a `<MetricRow accent>` surviving a prop deletion — see the
  `adherence-lint-boolean-classvalue-gap` session, both call sites since deleted) is already
  caught by `npx tsc --noEmit`, the donor's own verification command: the moment a gallery call
  site references a deleted prop again, the donor does not typecheck. Do not re-litigate the
  `targets` list against `gallery/`; the division is this paragraph.
- **A hook's RESULT interface is not a per-call-site prop.** The hook result types that the
  widened walk newly sees (`UseCrudDialogControllerResult.isCreate` / `isSubmitting` /
  `readOnly` / `showPrimary`, `UseCrudDialogModeResult.isView` / `isEdit` / `isCreate`,
  `UseFormPageStateResult.isDirty` / `isSubmitting`, `ResolveListStateInput.isEmpty`) declare
  non-optional fields of what a hook RETURNS — derived values the hook computes, not props
  anyone passes. A prop the caller does not supply cannot be a per-call-site appearance:
  ADR-0004's inherited-vs-derived test passes by construction. Rather than excluding each
  hook file by path, the appearance rules keep this out **at the pattern level**: the
  `archetype-appearance-noun-prop`, `archetype-look-union-prop`, `archetype-numeric-union-prop`
  and `archetype-alias-union-prop` patterns require the literal `?` of an OPTIONAL prop
  (`\w+\?` instead of `\w+\??`), so a non-optional declaration is out of scope by shape — the
  same keep-it-out-at-the-pattern-level discipline `archetype-appearance-boolean-prop` uses
  for capability booleans. A `.ts` file that declares an optional appearance-shaped prop on a
  PROP type (an interface a component accepts) stays fully gated.

> **Why not oxlint?** The original config leaned on oxlint's `no-restricted-syntax`, which oxlint
> does not implement (`Rule 'no-restricted-syntax' not found`), and carried `_`-prefixed comment
> keys oxlint rejects as `unknown field` — so it loaded nothing and enforced nothing. Replaced by
> this zero-dep scanner (ADR-0003).

## The `archetype-*` appearance-prop rules (enforcing hard rule 12)

These ship in the archetype-convergence Phase 1
(`docs/backlog/archetype-convergence.md`) and are `include`-scoped to
`src/components/archetypes/` so the shadcn leaf layer (`src/components/ui/`) is never flagged.
Their `message` cites `docs/RULES.md` hard rule 12 — an appearance is either global (a token, or
one of the closed project contexts set once at `<AppShell>`) or fixed in the component; a
per-call-site prop is legal only if the contract derives it. They exist because prose has not held
the rule: eighty-nine `archetype-rollout` tickets were filed against hk-crm before the mechanical
check landed.

| id | shape caught | include |
|---|---|---|
| `archetype-appearance-noun-prop` | a prop named from the appearance-noun list (`surface`, `variant`, `tone`, `density`, `appearance`, `rhythm`, `fill`, `framed`, `bordered`, `compact`, `padded`) | `src/components/archetypes/**` + `src/components/layout/**` |
| `archetype-look-union-prop` | a prop typed as an inline string-literal union of look-names | `src/components/archetypes/**` + `src/components/layout/**` |
| `archetype-numeric-union-prop` | a prop typed as a bare numeric-literal union (`columns?: 2 \| 3 \| 4`) | `src/components/archetypes/**` + `src/components/layout/**` |
| `archetype-alias-union-prop` | a prop typed against a union type ALIAS declared in the same file (`{{unionAliases}}` pre-pass) | `src/components/archetypes/**` + `src/components/layout/**` |
| `archetype-appearance-boolean-prop` | a boolean look FLAG from an appearance allowlist (`accent`, `emphasis`, `flush`, `sticky*`, `*mono*`, `hideCount`, `showHeader`, `showCount`, `avatar`, …) — capability booleans stay out at the pattern level | `src/components/archetypes/**` + `src/components/layout/**` |
| `archetype-shell-class-name` | `className` declared on a `*Shell` / `*Sheet` component — the prop name and its indent, NOT its type, so `className?: ClassValue` is caught too | `src/components/archetypes/**` + `src/components/layout/**`, `*Shell.tsx` / `*Sheet.tsx` |
| `archetype-appearance-slot` | an appearance-bearing `ReactNode` slot (`header`, `stats`) | `src/components/archetypes/**` + `src/components/layout/**` |
| `archetype-render-callback-prop` | a function-typed prop returning `ReactNode` (`renderHeader?: (args) => React.ReactNode`) — the appearance slot one indirection up. Two mechanisms keep structural callbacks out: OPTIONAL-only drops the required router link-adaptors (`Sidebar`/`SectionNav` `renderLink`), a negative lookahead drops the optional back-link adapter (`renderBackLink`) | `src/components/archetypes/**` + `src/components/layout/**` |

**The shared-chrome second root.** `src/components/layout/**` is a second
`include` root on every rule above, including `archetype-appearance-slot`
(widened with the `SectionCard.header` slot its own ticket surfaced and
deleted). The chrome the archetype shells compose — `SectionCard`,
`SurfaceFrame`, `StatTileRow`, `ProgressTracker` — lives outside
`src/components/archetypes/`, and hard rule 12 governs an appearance prop
there on identical terms: without the root a closed archetype can forward a
prop it is supposed to fully key to an ungated owner one directory over
(`DetailSection.tone` → `SectionCard.tone` was exactly that). Because the
layout dir is one flat folder of unrelated primitives, its triaged props are
excluded **by exact file path**, never by a `**` folder glob — a folder glob
there would disarm the whole root.

Each drain rule also carries an `exclude` array with one glob per closed archetype (
`detail-overview/**`, `form-page/**`, `list-with-detail/**`, and `settings-table/**` as of this
update) — once an archetype's class is closed it drops out of the `warn` drain and is gated by
its own `error`-tier rules instead (the ratchet, per the `exclude` above). `detail-overview` was
the first: the close-API ticket removed `surface`, `rhythm`, `className`, `headerFill`, and the
`header`/`stats` `ReactNode` slots (and corrected the `width` default), so the drain rules no
longer fire on it. `form-page` is the second: its close removed the `className` escape hatch and
keyed `width` exhaustively to field count / column layout in the contract, so the
`form-page-shell-class-name` ratchet rule gates the closed API. `list-with-detail` is the third:
the close-API ticket removed `detailPresentation`, `unstyled`, and the shell's `className` (and
deleted the per-shell `headerFill` override from the contract doc), while `presentation` and
`align` remain legal — contract-derived — so the whole folder is excluded from the shared drain
rather than flipped to `error` per rule; the `list-with-detail-*` rules below gate the retired
axes.

### The component_kind archetypes — the ADR-0004 amendment (2026-09-06)

`entity-circle` and `overline-typed` are the two `kind: "component"` MANIFEST entries the
appearance-prop audit flagged, and the amendment to the [ADR-0004 decision](docs/adr/0004-appearance-locality-derived-vs-inherited.md)
sorts the category: a component_kind archetype is **governed, not an exempt leaf** — the
`src/components/ui/` leaf exemption is directory-scoped (vendored, byte-identical, never
ships), while a component_kind archetype ships, so its props are API and the same
derived-vs-inherited test runs prop-by-prop on it. Applied to the two audited props:

- `entity-circle`'s `tone` **passes** — the contract's L7 keys it to the entity's identity
  role (the brand tone is reserved for the signed-in entity in the account/identity
  context; every other entity is neutral). It stays legal, so the folder is excluded
  from the `archetype-appearance-noun-prop` drain with the rule's `message` citing the
  keying clause (the keep-with-keying shape, like list-with-detail's kept `presentation`
  / `align`). The folder has no retired axes to re-gate by name, so no per-folder
  `error` rule is added — the exclusion is the whole disposition.
- `overline-typed`'s `tone` **fails** — its contract states the label conveys *emphasis,
  not meaning*, which no rule can derive from the entity or its data, and the closed
  set sat behind a backwards-compatible default (the inherited-default defect itself).
  The prop is deleted from the component (major version bump); the drain rule no
  longer fires because the prop no longer exists — no exclude entry needed. The
  accent-surface recolor routes to the surface contract's context/binding
  (`headerFillClasses().kicker`) and the one-off per-site color to the `className`
  passthrough, which the `*Shell`/`*Sheet`-scoped `archetype-shell-class-name` ban
  never reaches (it is a documented leaf exemption, recorded in the contract's L7 —
  not a contradiction of the ban, which keeps its `error` severity and its scope).

### The `detail-overview-*` error rules (ratchet engaged for the closed API)

`severity: error`, `include`-scoped to `src/components/archetypes/detail-overview/`. Any hit
exits 1, so re-adding a retired axis (or an appearance-bearing slot) breaks the lint immediately.
The ratchet stays engaged across future changes; the drain no longer re-flags the closed file.

| id | shape caught | include |
|---|---|---|
| `detail-overview-surface-prop` | a `surface` prop declaration (any type) | `src/components/archetypes/detail-overview/**` |
| `detail-overview-rhythm-prop` | a `rhythm` prop declaration | `src/components/archetypes/detail-overview/**` |
| `detail-overview-shell-class-name` | `className?: string` declared on the shell | `…/detail-overview/DetailOverviewShell.tsx` |
| `detail-overview-appearance-slot` | a `header`/`stats` `ReactNode` slot | `src/components/archetypes/detail-overview/**` |
| `detail-overview-headerfill-prop` | a `headerFill` prop declaration | `src/components/archetypes/detail-overview/**` |

These are deliberately *narrower* than the four drain rules — they name the specific retired
axes, not the whole appearance-noun / look-union class. `layout` and `width` (kept, contract-derived)
and `DetailSection`'s `tone` (kept, a graded-section data prop) remain legal even though they are
string-literal-union props, so the generic drain rules would over-fire on them; excluding the whole
folder and re-gating the retired axes by name keeps the lint both precise and ratcheted. That split
is the reason the ratchet needed the `exclude` glob at all.

### The `form-page` ratchet rule (second closed archetype)

| id | shape caught | include |
|---|---|---|
| `form-page-shell-class-name` | `className?: string` declared on the shell | `…/form-page/FormPageShell.tsx` |

The form-page close kept the `width` axis (keyed exhaustively to field count / column layout in the
contract — the same keep as detail-overview's derived `layout`/`width`), so the folder drops out of
the drain and the retired axis is re-gated by name, scoped to the shell file: a folder-wide
`include` would fire on `FormPageHeader`'s pass-through `className` (a non-`*Shell` wrapper — the
kept axis), which the `*Shell.tsx`-and-file scoping avoids.

Two deliberate boundary choices:

- **`shell-class-name` matches the declaration, not the usage.** The pattern anchors on the
  `className\??: string` type-annotation form (leading whitespace, then the prop name, `?:`, and
  the `string` type), so it catches a top-level *and* an indented prop declaration but not a
  bare use of a prop named `className`. The consequence: line-only matching cannot tell the
  shell's own escape hatch from a nested declaration that happens to read the same —
  `MatrixGridShell`'s per-cell `cellStyle` return type `{ className?: string }` is flagged
  alongside the shell's real one, and `SettingsPageShell`'s (extended into the shell props) is
  flagged too. That conservative over-match is acceptable for a `warn`-tier audit hit: each
  flagged line is triaged when the archetype's class drains.
- **No inherited-default rule.** Catching a prop whose default the contract does not state requires
  reading contract prose against code and is not expressible as a line pattern. It stays a review
  step in the contract-close work; the `width` finding in the design spec stands as the evidence a
  human catches what the scanner cannot.

### The `list-with-detail-*` error rules (ratchet engaged for the closed API)

`severity: error`, `include`-scoped to `src/components/archetypes/list-with-detail/`. Same shape as
the `detail-overview-*` rules above — the per-folder `error` tier is the ratchet, and the shared
drain no longer flags the closed folder. The close-API ticket deleted the three axes below;
`presentation` and `align` remain legal (contract-derived) even though they are
string-literal-union typed, so the folder is excluded from the shared drain and only the retired
axes are re-gated by name.

| id | shape caught | include |
|---|---|---|
| `list-with-detail-detail-presentation` | a `detailPresentation` prop declaration | `src/components/archetypes/list-with-detail/**` |
| `list-with-detail-unstyled-prop` | an `unstyled` prop declaration | `src/components/archetypes/list-with-detail/**` |
| `list-with-detail-shell-class-name` | `className?: string` declared on the shell | `…/list-with-detail/ListWithDetailShell.tsx` |

The `unstyled` prop is replaced by the internal `ListChromeContext` (the analogue of detail-overview's
`UnifiedSurfaceContext`). A composing archetype that owns the surrounding surface sets the context
to `flush`; the shell then drops its own card chrome. The prop itself is no longer part of the
per-page API, and re-adding one reopens the escape-hatch defect (RULES.md hard rule 12).

The first run's `warn` hits are recorded as
[`docs/audits/2026-archetype-appearance-prop-audit.md`](docs/audits/2026-archetype-appearance-prop-audit.md)
(the companion `.json` carries the structured list). That list *is* the roadmap's `?`-marked
"audit the remaining twenty archetypes in MANIFEST order": the decompose loop files against a list
with a known length (16 archetypes flagged on first run) rather than a prediction. As each archetype
closes its class, flip its rules to `severity: error` — the ratchet above does the rest.

## Candidate rules — still awaiting custom tooling

These need AST-aware analysis a line scan can't express; they live in human review (gate 4)
until the scanner grows to cover them. This is the honest ledger of what gate 2 does **not** yet
mechanize:

- app layout files must render `AppShell` — no raw `<main>` with padding/background classes
  (PLACEMENT.md app-frame slot; ADOPTION.md point 1). The `p-8 bg-slate-50` iframe-feel scar.
- exactly one primary action node per `PageHeader` — count primary-variant Buttons in a
  `PageHeader` subtree.
- `RowActionsMenu` is the only per-row overflow menu — ban a raw `DropdownMenu` inside a
  list/grouped/board row render.
- no local `*-skeleton` components — StateView owns the async planes; ban project-local
  skeleton/loading component definitions.
- vendored-file `@ds-version` header stamp present — every vendored file carries a
  `/* design-baseline@<version> — vendored <date> */` header.

The ad-hoc-error-color candidate came off this ledger when `literal-color` shipped: the class ban
(`bg-red-50` and every other palette literal) is mechanized now, but *which* of the two canonical
error treatments a page uses (Alert shell vs. tinted box) stays a gate-4 judgment.
