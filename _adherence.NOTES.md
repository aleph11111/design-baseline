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

`targets` lists the directory roots the scanner walks for `.tsx` files. The donor ships `["src"]`;
a consumer retargets it to its app-page directories (e.g. `["src/app/(app)"]`), since these bans
apply to page bodies, not marketing/auth chrome or the primitive definitions themselves (the DS
`table.tsx` / `button.tsx` legitimately contain the raw elements they wrap).

> **Why not oxlint?** The original config leaned on oxlint's `no-restricted-syntax`, which oxlint
> does not implement (`Rule 'no-restricted-syntax' not found`), and carried `_`-prefixed comment
> keys oxlint rejects as `unknown field` — so it loaded nothing and enforced nothing. Replaced by
> this zero-dep scanner (ADR-0003).

## Candidate rules — still awaiting custom tooling

These need AST-aware analysis a bare tag scan can't express; they live in human review (gate 4)
until the scanner grows to cover them. This is the honest ledger of what gate 2 does **not** yet
mechanize:

- app layout files must render `AppShell` — no raw `<main>` with padding/background classes
  (PLACEMENT.md app-frame slot; ADOPTION.md point 1). The `p-8 bg-slate-50` iframe-feel scar.
- exactly one primary action node per `PageHeader` — count primary-variant Buttons in a
  `PageHeader` subtree.
- `RowActionsMenu` is the only per-row overflow menu — ban a raw `DropdownMenu` inside a
  list/grouped/board row render.
- no `bg-red-50` / ad-hoc destructive color classes — scan `className` string literals; use the
  two canonical error treatments (Alert shell / tinted box), never a raw error color.
- no local `*-skeleton` components — StateView owns the async planes; ban project-local
  skeleton/loading component definitions.
- vendored-file `@ds-version` header stamp present — every vendored file carries a
  `/* design-baseline@<version> — vendored <date> */` header.
