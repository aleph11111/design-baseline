# Adherence lint — notes & ledger

The prose that used to live inside the lint config, moved out so the config stays pure data.
The config (`_adherence.json`) and its runner (`scripts/lint-design.mjs`) are the mechanical
half of **ADOPTION.md gate 2** (see `docs/ADOPTION.md`, `docs/PLACEMENT.md`).

## How it runs

A consuming project wires a `lint:design` script (`node scripts/lint-design.mjs`) and runs it
in CI. The scanner is **zero-dependency** — a heuristic `.tsx` source scan, no ESLint or oxlint
required — so a consumer with no linter still gets a working gate. Warnings are allowed during
rollout; flip a rule to `"severity": "error"` in `_adherence.json` as its violation class is
cleaned (the ratchet). Matching is case-sensitive, so the design-system primitives `<Button>` /
`<Table>` are never flagged — only the bare lowercase HTML elements.

A rule carries either `tag` (a bare-element ban — the scanner builds the `<tag` open-tag regex)
or `pattern` (an arbitrary JS `RegExp` source, used verbatim). The three `pattern` rules —
`literal-color`, `weak-focus-ring`, `raw-html-control` — are ported from `docs/audit-signals.json`'s
`conformance` array, so a consumer's `lint:design` and the dashboard's fleet scan measure the same
violations. Keep them in sync: change one, change the other. `raw-html-control` is deliberately
narrowed to `input|select|textarea` — `button` and `table` already have dedicated tag rules, and
the full alternation would double-warn the same line.

A rule may also carry an optional `include` glob (repo-root-relative), restricting it to that path
set — `**` spans any run of directory segments, `*` matches within one. This is what lets a rule
target a single layer of the tree without firing on the rest: the `src`-wide `targets` would
otherwise flag `src/components/ui/`, where `variant` and `size` are correct shadcn practice.

A rule may also carry an optional `exclude`, which removes a matching path from the rule
(in addition to `include`, when both are set). `exclude` is a glob, or an array of globs —
the file is skipped when ANY entry matches. That is the per-archetype **ratchet valve**: once an
archetype's class is closed, its folder is excluded from the shared `warn` drain rules and a set of
per-folder `error` rules is added for the closed API, so the scanner no longer counts a closed
archetype as an open one (the `detail-overview-*` rules below are the first to use it; the
`form-page-shell-class-name` rule is the second closed archetype's ratchet).

`targets` lists the directory roots the scanner walks for `.tsx` files. The donor ships `["src"]`;
a consumer retargets it to its app-page directories (e.g. `["src/app/(app)"]`), since these bans
apply to page bodies, not marketing/auth chrome or the primitive definitions themselves (the DS
`table.tsx` / `button.tsx` legitimately contain the raw elements they wrap).

> **Why not oxlint?** The original config leaned on oxlint's `no-restricted-syntax`, which oxlint
> does not implement (`Rule 'no-restricted-syntax' not found`), and carried `_`-prefixed comment
> keys oxlint rejects as `unknown field` — so it loaded nothing and enforced nothing. Replaced by
> this zero-dep scanner (ADR-0003).

## The `archetype-*` appearance-prop rules (enforcing hard rule 12)

These four ship at `severity: warn` in the archetype-convergence Phase 1
(`docs/backlog/archetype-convergence.md`) and are `include`-scoped to
`src/components/archetypes/` so the shadcn leaf layer (`src/components/ui/`) is never flagged.
Their `message` cites `docs/RULES.md` hard rule 12 — an appearance is either global (a token, or
one of the closed project contexts set once at `<AppShell>`) or fixed in the component; a
per-call-site prop is legal only if the contract derives it. They exist because prose has not held
the rule: eighty-nine `archetype-rollout` tickets were filed against hk-crm before the mechanical
check landed.

| id | shape caught | include |
|---|---|---|
| `archetype-appearance-noun-prop` | a prop named from the appearance-noun list (`surface`, `variant`, `tone`, `density`, `appearance`, `rhythm`, `fill`, `framed`, `bordered`, `compact`, `padded`) | `src/components/archetypes/**` |
| `archetype-look-union-prop` | a prop typed as an inline string-literal union of look-names | `src/components/archetypes/**` |
| `archetype-shell-class-name` | `className` declared on a `*Shell` component | `src/components/archetypes/**/*Shell.tsx` |
| `archetype-appearance-slot` | an appearance-bearing `ReactNode` slot (`header`, `stats`) | `src/components/archetypes/**` |

Each drain rule also carries an `exclude` array with one glob per closed archetype (both
`detail-overview/**` and `form-page/**` as of this update) — once an archetype's class is closed
it drops out of the `warn` drain and is gated by its own `error`-tier rules instead (the ratchet,
per the `exclude` above). `detail-overview` was the first: the close-API ticket removed `surface`,
`rhythm`, `className`, `headerFill`, and the `header`/`stats` `ReactNode` slots (and corrected the
`width` default), so the drain rules no longer fire on it. `form-page` is the second: its close
removed the `className` escape hatch and keyed `width` exhaustively to field count / column
layout in the contract, so the `form-page-shell-class-name` ratchet rule gates the closed API.

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
