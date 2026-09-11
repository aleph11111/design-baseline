---
ticket: archetype-convergence
title: Archetype convergence — close the archetype API, then distribute it as a package
date: 2026-08-17
status: locked
source_brainstorm: in-conversation 2026-08-17
roadmap: docs/backlog/archetype-convergence.md
governed_paths:
  - src/components/archetypes/
  - src/components/layout/
  - docs/archetypes/
  - docs/RULES.md
  - docs/adr/
  - _adherence.json
  - scripts/lint-design.mjs
  - package.json
  - src/styles/tokens.css
---

# Archetype convergence

## Context

The roadmap (`docs/backlog/archetype-convergence.md`) states the requirement:
two projects using the same archetype must look like one application. It
identifies two independent defects and fixes their order — close the component
API first, then distribute it as a package — because hk-crm's vendored
detail-overview primitives are already byte-identical to this donor's and the
page is still wrong. Every divergence lives in how twelve route files fill the
slots, not in the code they call.

This spec designs Phase 0 and Phase 1 in full. Phases 2–5 get design-level
treatment only: the decompose loop authors their tickets after Phase 1 lands,
against reality rather than against prediction.

## The governing rule

The roadmap's Phase 0 proposes: *a visual choice is either global — a token or
context, set once per project — or fixed in the component; never a per-call-site
prop.* Two findings during design showed that formulation is both too loose and
too strict.

**Too loose.** `headerFill` is the roadmap's model of the correct shape, but
`HeaderFillContext` ships alongside a per-instance override prop on
`SurfaceHeader.tsx:28`, `SurfaceHeaderSlot.tsx:17` and
`DetailOverviewShell.tsx:58`. A rule whose own exemplar carries the escape hatch
it forbids cannot be enforced. An escape hatch that exists gets used — that is
exactly how `surface` broke archetype C.

**Too strict.** `layout="rail" | "vertical"` is per-call-site and changes only 2D
placement, so the literal rule condemns it. But the contract carries a decision
table (`docs/archetypes/detail-overview.md:140-151`) keying it to entity
profile: dense/transactional/financial entities get the rail, light/early-stage
entities stay vertical. An order is `rail` in hk-crm and `rail` in
controlling-app. That prop is not a divergence channel.

The discriminator is not *where the value is passed* but *whether it was derived
or inherited*:

| axis | keying rule | outcome |
|---|---|---|
| `surface` | none. Default annotated in-source as *"the v2.0/v2.1 look. Zero churn."* | nobody derived it; everybody inherited it |
| `layout` | contract decision table keyed to entity profile | two engineers with the same entity derive the same value |

So the rule this spec adopts, to be recorded as ADR-0004 and as `docs/RULES.md`
hard rule 12:

> A visual choice is either **global** — a token, or one of a closed set of
> project contexts declared once at `<AppShell>` — or **fixed in the component**.
>
> A per-call-site prop is legal **only** if the archetype contract carries a
> decision rule that determines its value from the entity or its data, such that
> two engineers holding the same entity derive the same value, and its values are
> exhaustively enumerated there.
>
> A backwards-compatible default is disqualifying on its own. It means the value
> was inherited rather than derived, and inheritance is how a whole fleet ends up
> on a look nobody chose.
>
> An appearance-bearing `ReactNode` slot is a per-call-site appearance prop by
> another name, and is governed identically.

Three tiers, and the closed context set after Phase 1 has exactly one member:

- **token** — brand: colour, font binding, radius. Declared once per project in
  `src/styles/tokens.css`.
- **context** — a closed, enumerated set of project-wide axes, set once at
  `<AppShell>`, with **no override prop**. Membership: `headerFill`.
- **fixed in the component** — everything else.

`surface` is deleted rather than promoted to a context. A container model is
structure, not brand: the roadmap's "Done when" requires two projects to differ
only by declared brand tokens, and a project-level `surface` context would
violate that literally by keeping the fleet bimodal one level up. hk-crm never
chose `separated` — it inherited the default across all twelve tabs, and only
`companies/[id]/page.tsx:132` passes `unified`. Deleting the mode removes an
unchosen default, not a decision.

### What the rule found

Applying "derived or inherited" to the existing props surfaced a second instance
of the same defect that no ticket had reported. The contract
(`docs/archetypes/detail-overview.md:289`) states `width="md"` — a contained
column — is the record-page default, with `width="none"` reserved for pages
carrying wide embedded tables. `DetailOverviewShell.tsx:70` ships
`width = "none"`. Every call site that omits `width` silently gets the
uncontained column the contract reserves for the exception. The keying rule is
sound; the code contradicts it. Correcting the default is part of this work.

## Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | The rule is *derived vs inherited*, not *per-call-site vs not* | Spares `layout`, kills `rhythm`, catches the `width` default. Mechanically checkable |
| D2 | Context axes carry **no** override prop; `headerFill`'s overrides are deleted from `SurfaceHeader`, `SurfaceHeaderSlot`, `DetailOverviewShell` | An exception in the exemplar makes the rule unenforceable and the lint an allowlist |
| D3 | `surface` is deleted; `unified` is the only container model | Container model is structure, not brand. Bimodality-by-project still fails "Done when" |
| D4 | Appearance-bearing slots become data props: `header` → `title`/`subtitle`/`badges`/`actions`, `stats` → `StatItem[]` | hk-crm's primitives are byte-identical to the donor's and the page is still wrong. Slot freedom is where divergence lives |
| D5 | `summary`, `content`, `references` stay `ReactNode` | Composition of documented section primitives is structure, not appearance. This is the honest boundary |
| D6 | `className` is dropped from archetype **shells**, kept on leaf `ui/` primitives | It is a superset of everything else being deleted, and unenumerable |
| D7 | Mode A/B needs no flag and no context — it is which component you call | A structural choice made once per route family, not a per-page look |
| D8 | Enforcement is `_adherence.json` rules at `severity: warn`, flipped to `error` per archetype as it closes | Reuses ADR-0003's shipped warn→error ratchet instead of a new waiver mechanism; turns Phase 1's uncertain "audit the remaining twenty" into a drain-the-warnings checklist |

### D6 in detail

Fourteen shells across thirteen archetypes declare `className?: string`. **Zero**
demos in `src/examples/` pass one — in the donor it is declared-and-unused
surface. It has to go because it is a superset of every prop being deleted:
`className="border-0 shadow-none"` reconstitutes `surface="separated"` exactly.
Closing `surface` while keeping `className` bolts the front door beside an open
window, and the lint cannot see through it — arbitrary class strings are not
enumerable the way a `"separated" | "unified"` union is.

A consumer with a genuine one-off need is not left without a channel. The
roadmap's Phase 4 already prescribes the replacement: *a consumer that must
differ forks a component **out** of the package explicitly, visible in its
imports — never by silently editing a vendored copy.* `className` is precisely
the silent channel that bullet exists to close.

To avoid a thirteen-archetype flag day, Phase 1 drops `className` on
detail-overview only. The other twelve shells surface as `warn`-level lint hits
and drain during the Phase-1 audit.

## Closing detail-overview

detail-overview is the proof archetype: it carries the reported defect, it has
the most consumers, and it is the one Phase 4 migrates first.

| prop | fate | why |
|---|---|---|
| `surface` | **deleted** | no keying rule; "Zero churn" default (D3) |
| `headerFill` override | **deleted** | `HeaderFillContext` is the only channel (D2) |
| `rhythm` | **deleted** | contract `:285` says "or a compact measure for short pages. Choose once per page." No threshold for "short"; "choose once per page" is naked discretion |
| `className` | **deleted** | D6 |
| `layout` | **kept** | contract decision table `:140-151` keys it to entity profile |
| `width` | **kept, default corrected `"none"` → `"md"`** | contract `:289` keys it to wide embedded tables; the code contradicts it today |
| `header?: ReactNode` | → `title`, `subtitle`, `badges`, `actions` | D4 |
| `stats?: ReactNode` | → `stats?: StatItem[]` | D4 — ends the `StatTileRow`-vs-`MetricList` fork by construction, and makes metric count computable |
| `StatTileRow`'s `columns` | **derived** from `items.length` | see below |
| `summary`, `content`, `references` | **kept as `ReactNode`** | D5 |

Resulting API:

```ts
export type DetailOverviewShellProps = {
  // Mode B nested heading — rendered by the shell at a fixed scale
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  // Structure, keyed to the entity by the contract
  layout?: "vertical" | "rail";
  width?: "none" | "md" | "lg" | "xl";   // default "md"
  // Content
  summary?: React.ReactNode;
  stats?: StatItem[];
  content?: React.ReactNode;
  references?: React.ReactNode;
};
```

`StatItem` does not exist yet. It ships as a new exported data type mirroring
`StatTileProps` minus its `className`:

```ts
export type StatItem = {
  label: React.ReactNode;
  value: React.ReactNode;   // pre-formatted by the consumer; the tile never formats
  hint?: React.ReactNode;
};
```

Typing the slot also retires a hand-maintained invariant. `StatTileRow` today
takes `columns: 2 | 3 | 4` alongside `children`, documented as *"Must match the
number of `<StatTile>` children for visual balance"* (`StatTileRow.tsx:17`) — a
prop keyed to nothing but a count the component cannot see, enforced by comment.
With `stats: StatItem[]` the shell derives `columns` from `items.length` and the
invariant becomes unbreakable rather than merely stated. This is a second
independent argument for D4: opaque `ReactNode` slots force appearance props to
exist that typed data makes unnecessary.

Every remaining prop is either data or a contract-keyed structural choice. There
is no prop through which two projects can arrive at different appearance for the
same entity.

`UnifiedSurfaceContext` survives as an internal implementation detail — the
unified model deliberately suppresses card chrome in the rail subtree only,
while the main column keeps flattened cards. It stops being a mode toggle
defaulting to `false` and becomes unconditional inside the shell. It is not
exported.

### Mode A / Mode B

The contract's Layer 3 declares two first-class header modes, and the second is
where the nine hand-typed `<h2 className="text-lg font-…">` headings come from.
`:351` says a nested page *"**may** introduce a section-level `<h2>`"* with no
scale and no weight — the seven-`font-medium`-two-`font-semibold` split is that
"may", written down. `DetailOverviewHeader.tsx` exists and no company sub-tab
imports it, because it renders an `<h1>` that Mode B forbids.

Resolution needs neither a mode flag nor a context:

- **Mode A — standalone.** Call `DetailOverviewHeader` above the shell. It
  renders the canonical `<h1>` via `PageHeader`, unchanged.
- **Mode B — nested.** Pass `title` to the shell. It renders the new
  fixed-scale nested heading itself.

The mode is *which component you call*, decided once per route family by whether
a parent layout owns the `<h1>`. No call site chooses a look.

The missing primitive is genuinely missing: `SectionHeading` is not it. That is
an uppercase tracked overline (`OVERLINE_CLASS`) naming a sub-section inside a
card. A Mode B heading is a nested *page* title where the parent owns the `<h1>`
— a different role and a different scale. The gap sits between `PageHeader`
(h1) and `SectionHeading` (overline).

It ships in `src/components/layout/` because both existing rungs of the
heading-scale ladder live there and the ladder's whole value is being
single-source; putting the third rung in `detail-overview/` would fork the type
scale across two directories. Note this is *not* a Rule-of-2 justification — the
guideline wants two independent consumers, and detail-overview is currently the
only one. `tabbed-settings`'s `SettingsPageHeader` is Mode A: it renders an
`<h1>` through `PageHeader` (`SettingsPageHeader.tsx:15`), so it is not a second
consumer. Placement follows the ladder; the second consumer is an open question
recorded below. The type scale and weight are fixed in the component, with no
variant prop.

## Enforcement

`docs/RULES.md` prose alone has not held: eighty-nine `archetype-rollout`
tickets have been filed and archived against hk-crm, forty-eight in August 2026
alone. The class-level acceptance in the roadmap is that no further ticket of
that shape *can* be filed, which requires a mechanical check.

The mechanism already exists and needs no waiver list invented for it.
`scripts/lint-design.mjs` (ADR-0003's zero-dep scanner) reads rules from
`_adherence.json` as `{ id, tag | pattern, severity, message }`, and its header
documents the ratchet verbatim: *"Warnings exit 0 (allowed during rollout); any
`error`-severity hit exits 1. That is the ratchet: flip a rule to
`"severity": "error"` in `_adherence.json` once its class is clean."*

So the appearance-prop rules land as `severity: "warn"` entries, and each
archetype flips to `error` as it closes. The seeded-waiver behaviour I had
designed is the ratchet that shipped with ADR-0003 — reuse it, add nothing.

Rules to add:

1. A prop declaration whose name is in the appearance-noun list (`surface`,
   `variant`, `tone`, `density`, `appearance`, `rhythm`, `fill`, `framed`,
   `bordered`, `compact`, `padded`).
2. A prop typed as a string-literal union of look-names.
3. `className` declared on a `*Shell` component.
4. An appearance-bearing `ReactNode` slot (`header`, `stats`).

One scanner change is required. Rules today are a bare `tag` or `pattern` matched
against file contents, with no path scoping, while `_adherence.json` targets
`["src"]` as a whole — so an archetype-prop rule would fire on `src/components/ui/`
leaves, where `variant` and `size` props are correct shadcn practice. The rules
need an optional per-rule path filter (an `include` glob checked against the
walked file's relative path) so they can scope to `src/components/archetypes/`.
That is a small, contained addition to a 100-line scanner, and it is a
prerequisite rather than a nice-to-have.

The **inherited-default** check — a prop whose default the contract does not
state, which is what the `width` contradiction is — is deliberately **not** a
lint rule. It requires reading the contract prose against the code and is not
expressible as a regex. It stays a review step in the contract-close work, and
the `width` finding stands as evidence a human applying the rule catches what the
scanner cannot.

Draining the warn-level hits *is* the roadmap's `?`-marked "audit the remaining
twenty archetypes... in MANIFEST order": the open question becomes a list with a
known length that the decompose loop files against, rather than a prediction.

Per the hook-vs-memory test this is a lint, not a git hook: a code-bound
architectural invariant re-checked as code changes, whose *why* at the moment of
enforcement needs the contract reference the rule's `message` carries.

## Contract-document changes

The contract prose is itself a source of the design space, so closing the
component without closing the document leaves the divergence sanctioned:

- Delete the "Surface variant — separated vs unified" section (`:208-242`) and
  the surface row from the API list (`:248`). One container model needs no
  variant section.
- Delete the "overridable per page via the detail-overview shell's own
  `headerFill` prop" clause (`:234-235`).
- Replace Mode B's *"may introduce a section-level `<h2>`"* (`:351`) with a
  required nested-heading role at a single named scale.
- Correct the Layer 2 `width` language so the stated default and the shipped
  default agree.
- Re-read every "**Allowed variation**" block against D1. A variation permitted
  without a keying rule is a design space, not a contract.

Both documents move together: `<slug>.md` keeps role-level language and names no
primitive and no Tailwind class (RULES rule 3), `<slug>.baseline.md` carries the
binding. MANIFEST gets a **major** version bump — the API breaks deliberately.

## Phases 2–5 — design level only

Not decomposed here; recorded so the later batches inherit the reasoning.

**Phase 2 — consumable source package.** Sharpened against shipped reality in
[Phase `pkg`](#phase-pkg--consumable-source-package) below; that section
supersedes the design-level sketch this paragraph used to carry.

**Phase 3 — token split.** `src/styles/tokens.css` splits into a package-owned
base layer and a project-owned brand layer, so a consumer overrides brand
colour, font binding and radius without editing a file the donor also owns. The
operator-facing acceptance is the roadmap's: changing `--font-sans` here reaches
every consumer through a version bump.

**Phase 4 — consumer migration.** hk-crm's `/companies/[id]` first, as the proof
case. The twelve route files collapse to one composition with per-tab data,
which is what D4 makes possible: a shell taking `title` and `stats: StatItem[]`
leaves twelve files nothing to disagree about. This
collapse is also what makes the entity-scoped stats decision self-enforcing:
after the collapse there is one call site, so the five-of-twelve KPI-strip
inconsistency cannot recur.

**Phase 5 — delete the compensating machinery.** Sharpened against shipped
reality in [Phase `drop-drift-machinery`](#phase-drop-drift-machinery--retire-the-copy-comparand)
below; that section supersedes the design-level sketch this paragraph used to
carry. Its correction, in one line: a package does not make the question
meaningless on its own — it makes the *comparand* wrong, and the machinery keeps
asking with a broken one until the comparand is replaced.

## Verification

Phase 1 is done when all of these hold:

1. `npx tsc --noEmit` passes, and `npm test` passes with `DetailOverviewShell.test.tsx`
   updated to the closed API.
2. `DetailOverviewShellProps` declares none of `surface`, `rhythm`, `headerFill`,
   `className`. (`UnifiedSurfaceContext` still appears in the file as an internal
   detail and is not exported — a bare `grep surface` will match it, so check the
   prop type, not the file.)
3. No archetype shell or layout primitive accepts a `headerFill` prop; the only
   `headerFill` entry point is `<AppShell headerFill=…>`.
4. `DetailOverviewShell` with `width` omitted renders the contained column the
   contract's Layer 2 specifies.
5. `stats` accepts `StatItem[]` and no `ReactNode`; the rendered strip's column
   count follows `items.length` with no `columns` value passed at the call site.
6. The gallery renders a Mode B nested heading through a component call, and
   `grep -rn 'text-lg font-\(medium\|semibold\)' src/examples/` finds no
   hand-typed sub-tab heading.
7. `node scripts/lint-design.mjs` reports the appearance-prop rules, no hit names
   a `detail-overview` file, and no hit names a `src/components/ui/` file.
8. Both detail-overview docs and the MANIFEST entry agree with the shipped API,
   and the contract still names no primitive and no Tailwind class.

The class-level acceptance is the roadmap's and outlives Phase 1: no further
`archetype-rollout`-shaped ticket can be filed for an archetype whose API is
closed, because the shape it would report is no longer expressible.

## Risks

- **The `width` default correction is visible on every existing detail-overview
  page in the fleet.** It ships inside the breaking API change rather than
  separately, so consumers absorb one migration, not two.
- **Dropping `className` will bite during Phase 4.** That is the intent — each
  bite is a divergence that was previously silent. The designed answer is an
  explicit fork, per Phase 4's third bullet.
- **Deleting `separated` is the largest visual diff in the roadmap.** Mitigated by
  it being an unchosen default, and by Phase 4 migrating one route family at a
  time.
- **`severity: warn` exits 0, so the rules could sit un-drained indefinitely.**
  ADR-0003 accepted that tradeoff deliberately ("allowed during rollout"). The
  mitigation is that detail-overview's rules flip to `error` in the same ticket
  that closes it, so the ratchet starts engaged rather than aspirational.

## Deferred to the decompose loop

- Which of the remaining twenty archetypes carry contract-keyed props versus
  inherited ones — answered by the first lint run's `warn` hits, not by prediction.
- Who the nested-heading primitive's second consumer is. It ships with one, on
  ladder-placement grounds rather than Rule of 2; if no second archetype needs a
  nested page title, that is worth knowing.
- Phase 2's tag-versus-registry choice, once a real consumer installs the package.

## Phase 1 ticket batch

Filed with this spec. Later phases are deliberately not fanned out.

| ticket | depends_on |
|---|---|
| `archetype-convergence-phase0-appearance-locality-decision` | — |
| `archetype-convergence-nested-heading-primitive` | phase0 |
| `archetype-convergence-detail-overview-close-api` | phase0, nested-heading |
| `archetype-convergence-appearance-prop-lint` | phase0 |

---

## Phase pkg — consumable source package

Sharpened 2026-09-07, after p0 / p1 / lint / warn-drain landed. Supersedes the
design-level Phase-2 sketch above, which predicted this phase before the API
was closed and before the token layer was split.

### What changed under this phase

Two shipped facts narrow it, and one widens it.

**The API is closed across the whole layer, not just detail-overview.** Every
appearance rule in `_adherence.json` now sits at `severity: "error"` scoped to
`src/components/archetypes/**` *and* `src/components/layout/**`
(`archetype-appearance-noun-prop`, `-look-union-prop`, `-numeric-union-prop`,
`-alias-union-prop`, `-appearance-boolean-prop`, `-shell-class-name`,
`-appearance-slot`), with per-archetype closed-folder rules behind them. The
ratchet is fully engaged; `node scripts/lint-design.mjs` reports 0 errors and
59 warns, all six of them the generic ADR-0003 page-level rules RULES rule 12
deliberately keeps at warn. So this phase needs **no** "export only the closed
archetypes" gate — the whole exported surface is closed. The D8 sequencing
worry is spent.

**The token split already shipped.** `src/styles/tokens.layer.css` is the
donor-owned half (`@import "tailwindcss"`, `@theme` roles and keyframes,
`@custom-variant`, utility definitions, layer base) and `src/styles/tokens.css`
is brand-only, importing the layer relatively. The roadmap's Phase-3 work is
therefore mostly done, and its operator-facing acceptance — *changing
`--font-sans` here reaches every consumer through a version bump* — is
delivered by **this** phase's exports map, not by any further split. The
`token-split` phase's own sharpening confirms what residue is left; this
section does not claim it.

**What widens it: an `exports` map alone does not make the donor installable.**
Five blockers the earlier sketch does not mention, each measured in the tree:

1. **338 internal `@/` imports** inside the surface to be packaged —
   `@/components/ui` ×141, `@/lib/utils` ×90, `@/components/layout` ×61,
   `@/components/archetypes` ×36, `@/hooks/use-mobile` ×3, `@/utils/logger` ×1.
   In a consumer, `@/` is *their* root alias, so a packaged file asking for
   `@/components/layout` resolves against the consumer's `src/`.
2. **`"use client"` exists on exactly two files** in the donor
   (`ui/tooltip.tsx`, `examples/DemoNextApp.tsx`). hk-crm's vendored copies
   differ from the donor *by that line*. A Next App Router consumer cannot add
   it — the file is inside `node_modules`.
3. **`src/components/ui/` cannot stay out of the package.** 141 archetype→ui
   edges mean shipping archetypes ships `ui/`, which puts two copies of every
   primitive — and of the Radix context-bearing ones — in a consumer.
4. **Tailwind 4 does not scan `node_modules`.** The consumer-side `@source`
   directive is a hard requirement, not documentation courtesy.
5. **`react` / `react-dom` sit in `devDependencies`** (deliberately, for donor
   typechecking). A package must declare them as peers.

### Decisions

| # | Decision | Rationale |
|---|---|---|
| P1 | Every internal import under `src/components/`, `src/lib/`, `src/hooks/`, `src/utils/` becomes **relative**; `@/` is banned there mechanically | The package must resolve its own internals without borrowing the consumer's alias. Relative paths also keep the `cp -R` channel working through the migration overlap — same folder shape, same resolution — so no flag day |
| P2 | The package **owns `src/components/ui/`**; a consumer deletes its vendored copy and re-points `@/components/ui/*` at the package with one tsconfig path entry | One copy of every primitive, no dedupe question, and every existing consumer import keeps working unchanged. Narrows ADR-0004's "`ui/` stays vendored" clause to projects that take only the shell and never an archetype — recorded as an amendment to that ADR, not a silent reversal |
| P3 | **`private: true` is kept** | A git dependency against a tag needs no publish, so the flag costs nothing and makes an accidental publish of a private donor impossible. This reverses the earlier sketch's "drop `private: true`" bullet on the narrow ground that the channel decision makes it unnecessary. Drop it only if a registry is ever chosen |
| P4 | The `"use client"` boundary is **one directive per exported barrel** — 23 archetype `index.ts` + `layout/index.ts` | `"use client"` marks a module boundary, so a directive on the barrel covers its whole subtree: 24 lines, mechanically checkable, versus a per-file judgement call re-made on every new component. Cost is that an archetype subtree cannot render as a server component; these shells are interactive anyway, and hk-crm's vendored copies already all carry the directive |
| P5 | **No compiled CSS**, but `tokens.layer.css` ships as a **source-CSS subpath** | The omission of compiled CSS is the whole answer to ADR-0030's skew objection: the consumer still compiles every class from source. Shipping the layer file is what makes a donor-side `@theme` or `--font-sans` change propagate by version bump |
| P6 | Brand `tokens.css` is **deliberately not exported** | Exporting it would let a consumer `@import` the one file it is supposed to own. It stays a copy-once artifact |
| P7 | Distribution channel: **git dependency against a tag**. Registry stays deferred | Needs no publish infrastructure. A registry decision needs a second consumer to be a real question |
| P8 | Proof is a **throwaway** consumer install plus a **committed** `scripts/verify-exports.mjs` | A second buildable app in a repo whose premise is "not a buildable app" is the wrong permanent cost. The one-off install proves it once; the script makes the invariants repeatable |

### The exports map

```json
"exports": {
  "./layout":            "./src/components/layout/index.ts",
  "./archetypes/*":      "./src/components/archetypes/*/index.ts",
  "./ui/*":              "./src/components/ui/*.tsx",
  "./lib/utils":         "./src/lib/utils.ts",
  "./hooks/*":           "./src/hooks/*.ts",
  "./utils/logger":      "./src/utils/logger.ts",
  "./tokens.layer.css":  "./src/styles/tokens.layer.css"
}
```

One wildcard covers all 23 archetype directories — each already carries an
`index.ts`, verified. All 49 files in `src/components/ui/` are `.tsx`, so the
`*.tsx` pattern is exact rather than optimistic; Node's `exports` does no
extension resolution, which is why the pattern carries the extension. `files`
scopes the pack to `src/components`, `src/lib`, `src/hooks`, `src/utils`,
`src/styles` — `src/examples/`, `gallery/` and the vite/vitest harness stay
donor-dev-only, as `package.json`'s `designBaseline.notes` already declare.
Co-located `*.test.tsx` files ride along inside the packaged component dirs;
that is a few dozen KB and no ignore machinery is worth building for it.

`react` and `react-dom` move to `peerDependencies` (`^19`). The Radix set,
`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`,
`next-themes`, `sonner`, `vaul`, `cmdk`, `react-day-picker`,
`react-hook-form`, `@hookform/resolvers` and `zod` stay real `dependencies` —
they are what the primitives import, and npm dedupes compatible ranges. No
build step is added; `exports` points at `.tsx` and the consumer transpiles.

### Consumer wiring

Four lines and one import, documented once in a new `docs/PACKAGE.md`:

```jsonc
// package.json
"design-baseline": "github:aleph11111/design-baseline#v0.2.0"
```
```jsonc
// tsconfig.json — more specific path first
"paths": {
  "@/components/ui/*": ["node_modules/design-baseline/src/components/ui/*"],
  "@/*": ["src/*"]
}
```
```css
/* the project's own tokens.css */
@import "design-baseline/tokens.layer.css";
@source "../node_modules/design-baseline/src";
```
```js
// next.config.js — Next consumers only
transpilePackages: ["design-baseline"]
```

`docs/STACK.md` carries two corrections in the same work, because it is the
document ADR-0030 cited: hazard 3 ("Compiled-CSS version skew") is void for a
source-distributed package and says so, and hazard 5 ("Unstamped vendored
peers") already ends *"or move to package consumption"* — it now names the
package version as the answer that replaces per-file stamps.

`docs/ADOPTION.md` and `docs/PLUGIN-CONTRACT.md` are **not** touched here;
their rewrite is the `donor-docs` phase's, and doing it early would rewrite
them against a package no consumer has installed yet.

### Scope boundary

This phase makes the donor installable and documents how to install it. It does
**not** migrate a consumer (`consumer-migration`), delete the drift machinery,
`design-baseline-chrome.json` or the per-file vendor stamps
(`drop-drift-machinery`), retire any consumer or donor doc (`docs-retire`,
`donor-docs`), or delete a fleet command (`fleet-commands`). Every one of those
deletions is *blocked on* this phase existing, which is the honest overhead
accounting: this phase adds one dependency line per consumer and removes the
`cp -R` distribution model that the 89 archived `archetype-rollout` tickets,
the four `MANIFEST.json` forks, and `design-baseline-chrome.json`'s ten bumps
against 39 commits were all paying for.

### Verification

Phase `pkg` is done when all of these hold:

1. `npx tsc --noEmit` passes and `npm test` passes with no `@/` import
   remaining under `src/components/`, `src/lib/`, `src/hooks/`, `src/utils/`.
2. `node scripts/verify-exports.mjs` passes, checking four invariants: zero
   `@/` specifiers in the packaged directories; every `exports` subpath
   resolves to a file that exists; all 24 exported barrels carry `"use client"`
   as their first statement; `files` ships no compiled `.css`.
3. `node scripts/lint-design.mjs` still reports 0 errors — the relativization
   must not disturb the closed-API ratchet.
4. `npm run gallery:build` still succeeds: the gallery keeps its own `@/`
   alias (`vite.config.ts:27`) and is not part of the packaged surface, so it
   is the regression check that relativization did not break composition.
5. A throwaway Vite + Tailwind 4 consumer, created outside the repo, installs
   the donor as a git dependency, applies the four wiring lines, imports
   `DetailOverviewShell` from `design-baseline/archetypes/detail-overview`, and
   both typechecks and builds with the archetype's classes present in the
   output CSS. Not committed; the run is reported in the ticket.
6. `docs/PACKAGE.md` exists and `docs/STACK.md` hazards 3 and 5 name the
   package as the answer.

### Tripwire

The failure mode worth naming: four consumers pinned to four different tags is
the same fork problem with better labels. The guard is one number per consumer
— the installed tag — recorded as a single `sync` entry in
`docs/promotion-radar.json`, the array the fleet audit already reads. No new
script, no watcher. A consumer more than one minor behind the donor tag is a
`sync` row, exactly as a stale primitive is today.

### Ticket batch

| ticket | depends_on |
|---|---|
| `archetype-package-installable` | — |
| `archetype-package-consumer-wiring` | `archetype-package-installable` |

Two, not four: the donor is either installable or it is not, and splitting
relativization, the client boundary and the exports map into separate PRs
produces intermediate states that nothing can install or verify. The wiring
doc is separated because its reader is the consumer, not the donor.

### Deferred to the decompose loop

- Registry versus git tag, once a real consumer has installed the package (P7).
- Whether the consumer's `@/components/ui/*` re-point (P2) survives contact
  with a Next.js build that also resolves the alias for files inside
  `node_modules` — proven or disproven by the Verification step 5 install, and
  the reason that install is inside this phase rather than the next one.
- Who bumps the tag and when. The package version becomes the fleet broadcast
  number that `design-baseline-chrome.json` failed to be, but retiring that
  file is `drop-drift-machinery`'s work, so tag cadence is decided there.

---

## Phase token-split — close the font seam and guard the split

Sharpened 2026-09-07, after p0 / p1 / lint / warn-drain / pkg landed. Supersedes
the design-level Phase-3 sketch above, which predicted this phase before the
split had shipped.

### What changed under this phase

**The split itself already shipped, and not under this roadmap.** PR #178
(`4e75636`, `feat(style-baseline)!: split tokens.css into donor-owned layer +
project-owned brand file`) landed the two-file shape the roadmap's Phase-3
bullet asks for: `src/styles/tokens.layer.css` is donor-owned (the
`@import "tailwindcss"` entry, the `@theme` colour/font/radius/motion roles and
keyframes, `@custom-variant`, the utility definitions, the `@layer base`
resets), and `src/styles/tokens.css` is brand-only — the `:root` / `.dark` HSL
triplets plus `--radius` — importing the layer above it.

**Its operator-facing acceptance is delivered by phase `pkg`, not by more
splitting.** The roadmap's second Phase-3 bullet — *changing `--font-sans` in
the donor reaches every consumer through a version bump* — needs a propagation
channel, and `pkg` built it: decision P5 ships `tokens.layer.css` as the
`./tokens.layer.css` export subpath, and the throwaway-consumer proof matrix
(`docs/PACKAGE.md:110`) shows a layer-`@theme` class (`bg-success/10`) present
in the consumer's `dist` only when the layer `@import` is wired. A donor-side
`@theme` edit therefore reaches a consumer by bumping the installed tag. That
row is the acceptance; this phase does not re-prove it.

So this phase is not "split the tokens" — it is **close the residue the split
left**, which is three things, each measured in the tree:

1. **Font binding has no project-owned seam.** RULES rule 12 (and ADR-0004:35)
   names the token tier as *brand colour, font binding, radius — declared once
   per project in `src/styles/tokens.css`*. Colour holds (the brand `:root` /
   `.dark` blocks) and radius holds (`--radius` in the brand file), but
   `--font-sans` and `--font-mono` are declared at `tokens.layer.css:100-101`,
   inside the donor-owned half — the file `/style-baseline --force` overwrites
   on every re-apply and that a package consumer cannot edit at all, because it
   resolves inside `node_modules`. A consumer binding its own face therefore has
   no legal place to say so. This is exactly the roadmap's observation that
   hk-crm diverges 132 lines *legitimately*, because it binds `--font-sans`
   through `next/font`.

2. **Nothing mechanical keeps the two halves apart.** The separation is stated
   in prose, in the header comment of each file and in `docs/STYLE.md:262,282`.
   Two regressions it cannot catch: brand HSL values drifting back into the
   layer, where the next `--force` re-apply silently blasts them; and a brand
   file regressing to the pre-#178 merged shape by re-acquiring the
   `@import "tailwindcss"` entry.

3. **Three donor docs still describe the pre-#178 merged file.**
   `docs/ARCHITECTURE.md:31` calls `tokens.css` the "Tailwind 4 entry point +
   HSL design tokens"; `docs/TAXONOMY.md:11` names it as the token artifact
   without the layer; `docs/STYLE.md:21` says "All tokens are HSL triplets in
   `src/styles/tokens.css`". `STYLE.md`'s own §"Broadcast surface" section
   (262, 282) already describes the split correctly, so the file contradicts
   itself.

### Decisions

| # | Decision | Rationale |
|---|---|---|
| T1 | The font seam is a **plain `@theme` block in the brand file**, after the layer import — no donor-side indirection variable | Measured, not assumed: appending `@theme { --font-sans: "ZZTestFace", sans-serif; }` to `src/styles/tokens.css` and running `npm run gallery:build` emits `font-sans:"ZZTestFace", sans-serif` in the built CSS and nothing else — Tailwind 4 merges `@theme` blocks in source order and the later declaration replaces, rather than duplicates, the donor's. The seam already exists in Tailwind's semantics; it is only undocumented |
| T2 | The layer **keeps** the house-face defaults (`"IBM Plex Sans"` / `"IBM Plex Mono"`) | Rejected alternative: move the font roles down into the brand file to make ownership uniform. That destroys the operator goal in the same stroke — if the family is only ever declared per project, a donor-side house-style change reaches nobody. The layer owns the default and the fallback stack; the brand file owns the override. Both halves are load-bearing |
| T3 | Rejected: a donor-declared `--brand-font-sans` indirection (`--font-sans: var(--brand-font-sans, "IBM Plex Sans", …)`) | It buys discoverability and costs a second name for one value plus a donor-owned mechanism that only exists to be overridden. T1's re-declaration reaches the same place with a comment. Ponytail rung: the platform feature already covers it |
| T4 | The guard is **two more invariants in `scripts/verify-exports.mjs`**, not a new script and not an `_adherence.json` rule | The script already runs four packaging invariants and is wired as `npm run verify:exports`; the split is a packaging invariant of the same kind (what the `./tokens.layer.css` subpath is allowed to contain). `_adherence.json` scans component source for appearance props — CSS-file shape is not its vocabulary, and ADR-0003's scanner would need a new matcher class to express it |
| T5 | The invariants are **channel-agnostic**: the layer declares no `:root` or `.dark` selector, and the brand file carries no `@import "tailwindcss"` | Stated this way they hold for both distribution channels — the copy channel's `@import "./tokens.layer.css"` and the package channel's `@import "design-baseline/tokens.layer.css"`. Pinning the import *specifier* would make the check channel-specific and would break on the channel this roadmap is moving toward |

### The seam, concretely

The brand file gains a commented, ready-to-uncomment stanza below its existing
`@layer base` block:

```css
/* ---- FONT BINDING — override per project (optional) ----
   The house faces ship as donor defaults in tokens.layer.css @theme. A project
   that loads its own faces (Next: next/font; Vite: a <link> in index.html)
   re-declares them here — a later @theme replaces the donor's value, it does
   not stack. Leave this block commented to inherit the house style, which is
   what makes a donor-side face change reach you on a version bump. */
/* @theme {
  --font-sans: var(--font-plex-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-plex-mono), ui-monospace, monospace;
} */
```

`--font-plex-sans` is the CSS variable a `next/font` loader exposes; a Vite
consumer names the family directly. The comment is the whole documentation
surface a consumer sees in the file; `docs/STYLE.md` §Typography and
`docs/PACKAGE.md` §3 each gain the corresponding sentence, so the wiring doc
and the style doc do not disagree with the file.

### The guard, concretely

`scripts/verify-exports.mjs` grows two entries in its `report` array, taking the
summary from `4 ok` to `6 ok`:

| invariant | fails when |
|---|---|
| `token layer declares no brand values` | `src/styles/tokens.layer.css` matches `/^\s*(:root\|\.dark)\b/m` — a `:root` or `.dark` selector block appearing in the donor-owned half means brand values a `--force` re-apply will destroy |
| `brand tokens file is not the merged shape` | `src/styles/tokens.css` matches `/@import\s+["']tailwindcss["']/` — the pre-#178 merged entry point back in the project-owned file, or the layer import gone |

Both are `readFileSync` + regex against two fixed paths, in the same shape as
the existing `findShippedCss`. No new dependency, no new npm script.

### Scope boundary

This phase closes the donor-side residue of a split that already shipped. It
does **not**:

- Give `controlling-app`, `mistra`, `my-finance-app` or `pmo` a `tokens.css` —
  they carry none at all, which is a consumer-adoption fact, not a donor
  defect. `consumer-migration`'s work.
- Reconcile hk-crm's 132-line divergence or brickshop-manager's 158. Those
  become measurable *against* the seam this phase documents, and are migrated
  in `consumer-migration`.
- Resolve the two-channel import duality (`@import "./tokens.layer.css"` in a
  copied tree versus `@import "design-baseline/tokens.layer.css"` in an
  installed one). Both are correct for their channel today; the duality ends
  when `fleet-commands` deletes `/style-baseline`.
- Touch `docs/ADOPTION.md` or `docs/PLUGIN-CONTRACT.md` — `donor-docs`' work,
  for the same reason phase `pkg` left them alone.

### Verification

Phase `token-split` is done when all of these hold:

1. `node scripts/verify-exports.mjs` reports `6/6 ok`, and each new invariant
   has been shown to fail on a deliberately broken copy of its target file
   (a `:root` block pasted into the layer; `@import "tailwindcss"` pasted into
   the brand file) before being reverted.
2. Uncommenting the brand file's font stanza with a literal family and running
   `npm run gallery:build` emits that family as the sole `font-sans:` value in
   `gallery-dist/assets/*.css`; re-commenting it restores
   `"IBM Plex Sans"`. This is the seam's proof and is reported in the ticket,
   not committed.
3. `docs/ARCHITECTURE.md`, `docs/TAXONOMY.md` and `docs/STYLE.md:21` describe
   the two-file shape, and `grep -rn 'tokens\.css' docs/` finds no line calling
   the brand file the Tailwind entry point.
4. `docs/STYLE.md` §Typography and `docs/PACKAGE.md` §3 both name the brand-file
   `@theme` override as the supported way to bind a project's own faces.
5. `npx tsc --noEmit`, `npm test` and `node scripts/lint-design.mjs`
   (0 errors) are unchanged — this phase touches CSS, a node script and docs,
   so any movement in those is a regression, not a result.

### Ticket batch

| ticket | depends_on |
|---|---|
| `tokens-brand-font-seam-and-split-guard` | — |

One, not three. The seam, its guard and the doc reconciliation are the same
statement made in three places — a brand file that documents an override the
docs do not mention, or a guard against a shape the docs still describe as
current, is a half-landed change. They are also small enough that splitting
them produces three PRs whose combined diff is smaller than one review.

### Deferred to the decompose loop

- Whether the seam should eventually also cover `--radius`'s derived scale
  (`--radius-lg/md/sm` are computed in the layer from the brand `--radius`,
  which is the shape T1 wants for fonts and already works). Nothing is broken;
  it is worth knowing whether the two axes should be described identically in
  `STYLE.md`.
- Whether `/style-baseline`'s merged-shape migration path (STYLE.md:288) still
  has a live target in the fleet, or is already dead code that `fleet-commands`
  deletes wholesale.

---

## Phase consumer-migration — swap hk-crm's copy channel for the package

Sharpened 2026-09-07, after p0 / p1 / lint / warn-drain / pkg / token-split
landed. Supersedes the design-level Phase-4 sketch above, which predicted this
phase before the API was closed and before hk-crm had absorbed the closed API
through the copy channel.

### What changed under this phase

**The page migration already happened — through the channel this phase is
meant to retire.** hk-crm's `/companies/[id]` runs the closed v3.0 API today:
`layout.tsx` owns the entity identity and tab nav (Mode A), and all twelve
sub-tab pages call `DetailOverviewShell` with `title` / `subtitle` / `badges` /
`actions` / `stats: StatItem[]`. `grep -rn 'surface=\|className=\|headerFill'`
across `src/app/(app)/companies/` finds nothing at any call site. Its vendored
shell differs from this donor's only by the stamp line, `@/` imports, and the
two post-`pkg` refinements (`SurfaceHeaderBar`, `StatTileRow`'s self-derived
cell count).

The Phase-4 sketch's prediction — *"the twelve route files collapse to one
composition with per-tab data"* — is therefore spent, and it was wrong in shape
as well as timing. The collapse never happened; **Mode A/B did the work
instead**. The parent layout renders the entity heading once, each sub-tab
passes its own sub-area `title`, and the five-of-twelve KPI-strip inconsistency
the sketch worried about is closed because `stats` is typed. The design got the
outcome it wanted from D4 and D7, not from a call-site collapse. Nothing here
re-litigates that.

So this phase is **only the channel swap**: hk-crm stops carrying 155 vendored
files under `src/components/{ui,layout,archetypes}` and installs
`design-baseline#<tag>` instead. `/companies/[id]` demotes from *the work* to
*the acceptance surface* — it must render identically before and after, which
is exactly the proof a distribution change needs.

**What widens it: `ui/` is a real fork, and one class of it can never be
un-forked.** Measured against hk-crm's tree:

1. **28 of the 36 shared `ui/` primitives are already identical** modulo the
   vendor stamp, the `"use client"` line, and `@/` versus relative imports. The
   swap is a no-op for those.
2. **8 genuinely diverge**: `alert`, `badge`, `button`, `confirmation-dialog`,
   `error-boundary`, `file-field`, `form`, `state-view`. They fall into four
   kinds, and only one is drift:
   - *hk-ahead, appearance* — `badge` and `alert` both moved to
     `bg-status-{tier}-bg` / `text-status-{tier}-fg` token pairs and `badge`
     gained an `info` variant. The donor is the one that is behind.
   - *hk-ahead, functional* — `form`'s `required` asterisk + `aria-required`,
     `confirmation-dialog`'s `isPending` async mode.
   - *donor-ahead, consumer stale* — `button`'s dev-mode `size="icon"` a11y
     warning, `file-field`'s `archetypes/shared/fieldFrame` refactor,
     `error-boundary`'s `logger` over `console`.
   - *locale* — `confirmation-dialog` imports `@/ui-text/de`; `state-view`
     hardcodes `"Lädt…"` and `"Etwas ist schiefgelaufen"`. **This is not
     drift.** The packaged surface's locale model is English defaults
     overridable per call site (`layout/MetricList.tsx:92` says so in as many
     words: *"override per locale (e.g. 'Mehr anzeigen')"*); hk-crm's model is
     German defaults baked into the file. Both are coherent and they are
     incompatible at file granularity.
3. **hk-crm carries 12 `ui/` primitives the donor has none of** —
   `breadcrumb`, `labeled-control`, `native-field`, `results-count`,
   `route-error`, `select-field`, `select-filter`, `table-row-actions`,
   `textarea-field`, `view-toggle`, plus two unit tests. Disjoint names, so no
   collision — but a blanket alias re-point makes all twelve unresolvable.
4. **170 files import `@/components/ui`.** Any answer that renames the alias
   pays 170 edits for a naming change.

`docs/PACKAGE.md:37`'s single-entry re-point therefore deletes twelve
project-owned primitives and silently reverts two the donor is behind on. P2 as
written does not survive its first real consumer.

**What is narrower than feared.** `src/components/layout/` has **zero** hk-only
files — hk-crm's copy is a strict subset of the donor's, so a blanket re-point
works there unchanged. `src/lib/utils.ts` is byte-identical. `src/hooks/` is
entirely disjoint (hk-crm has ten of its own and no `use-mobile`) but never
needs re-pointing at all: after `pkg`'s relativization the package resolves its
own internals, so only the specifiers hk-crm's *own app code* uses need an
alias entry. `ui/` is the sole file-level fork in the whole 155-file surface.

**Real remaining consumer-side work, measured.** hk-crm's `src/styles/tokens.css`
is still the pre-#178 merged shape — no `tokens.layer.css`, 288 diff lines
against the donor's brand file — and it binds `--font-sans` through `next/font`,
which is exactly the seam `token-split` documented. Its vendor stamps are split
38 × `@0.1.0` / 64 × `@0.10.0`, the per-file drift the installed tag replaces.
`next.config.ts` has no `transpilePackages` and `tsconfig.json` has only
`"@/*": ["./src/*"]`.

### Decisions

| # | Decision | Rationale |
|---|---|---|
| C1 | The phase is **hk-crm's whole channel swap**, not one route family. `/companies/[id]` is the acceptance surface, not the work | The page migration already landed via copy. Keeping the phase page-scoped would leave 141 archetype→`ui` edges resolving to a second copy of every primitive — the dedupe problem P2 exists to prevent |
| C2 | P2 narrows to a **two-entry alias array, project first**: `"@/components/ui/*": ["./src/components/ui/*", "node_modules/design-baseline/src/components/ui/*"]`. The consumer deletes only the files the package ships *and* it does not own | TypeScript tries `paths` entries in order, so a file the consumer keeps shadows the package's without any import changing. Twelve project-owned primitives and the German-defaulted files survive untouched; the other 28 come from the package. Zero of the 170 import sites move. Must be proven against a Next build before it is documented — that is this phase's verification step 3 |
| C3 | `layout/`, `archetypes/` re-point **blanket**; `lib/`, `hooks/`, `utils/` get **no alias entry at all** | Measured: `layout/` has no consumer-owned file, `lib/utils.ts` is identical, and `hooks/`/`utils/` are package internals the relativized tree resolves itself. Adding entries for them would be wiring for a problem no consumer has |
| C4 | The donor **adopts hk-crm's status-token `badge` and `alert`** before the install, and that means adopting the roles: `--color-status-{success,warning,danger,info,neutral}-{bg,fg}` enter `tokens.layer.css`'s `@theme`, their default HSL triplets enter the donor's brand `tokens.css` (`:root` and `.dark`) | The donor has **no `--color-status-*` roles at all** today; `badge`/`alert` still key off `bg-success` / `border-warning/50`. hk-crm's pairs are AA-verified and are a soft-chip tier the donor lacks. Role-in-layer + value-in-brand is exactly T2's shape, and `verify-exports`' T5 invariants already guard that direction |
| C5 | The remaining six forks are **triaged at install time, not predicted here**. The rule: donor-ahead → consumer takes the package's; hk-ahead-and-general → `/ticket` a promotion, consumer keeps its file until it lands; locale → permanent consumer file | Two of the six (`button`, `file-field`) are already known donor-ahead and two (`form`, `confirmation-dialog`) known hk-ahead-functional, but the diff at install time is the honest input. Predicting the other two buys nothing |
| C6 | A consumer-kept `ui/` file is **not invisible**: each one is a `sync` row in `docs/promotion-radar.json`, alongside the installed tag | This is the phase's one real weakness. Unlike the roadmap's "fork out, visible in imports" bullet, C2's shadowing is *not* visible at the import — `@/components/ui/badge` reads the same either way. The file's physical presence in the consumer's `src/components/ui/` is countable, so the radar carries the count. No new script; the array the fleet audit already reads |
| C7 | Donor tickets cover donor work; the **hk-crm install is a runbook in `docs/PACKAGE.md`**, executed from an hk-crm session | The donor's CI can never verify an hk-crm PR. `PACKAGE.md` today documents a greenfield install only; a vendored consumer needs an ordered migration path, and that path is a donor artifact whose reader is the consumer — the same reason `pkg` separated the wiring doc from the installable-ness ticket. Matches the fleet's "projects self-heal from their own session" practice |

### The two-entry path, concretely

`docs/PACKAGE.md` §2 is rewritten from a delete-and-re-point instruction into an
ownership statement:

```jsonc
// tsconfig.json — most specific first; within a pattern, project before package
"paths": {
  "@/components/ui/*":         ["./src/components/ui/*",
                                "node_modules/design-baseline/src/components/ui/*"],
  "@/components/layout/*":     ["node_modules/design-baseline/src/components/layout/*"],
  "@/components/archetypes/*": ["node_modules/design-baseline/src/components/archetypes/*"],
  "@/*":                       ["src/*"]
}
```

The consumer deletes every `src/components/ui/` file that is identical to the
package's, keeps the ones it owns or has deliberately forked, and deletes
`src/components/layout/` and `src/components/archetypes/` wholesale. For hk-crm
that is 28 files deleted from `ui/`, 20 kept (12 own + 8 pending triage under
C5), and all of `layout/` + `archetypes/` gone — 155 vendored files down to at
most 20, and the 20 are countable.

### The migration runbook

`docs/PACKAGE.md` gains a `## Migrating a vendored consumer` section — the
ordered sequence a project already carrying a `cp -R` corpus runs, which the
greenfield four-line section does not cover:

1. **Fork triage first, before any install.** Diff the consumer's
   `src/components/ui/` against the package's, normalising the vendor stamp,
   the `"use client"` line and `@/`-versus-relative imports — those three
   account for 28 of hk-crm's 36 apparent differences. Classify each survivor
   by C5's rule.
2. **Split `tokens.css`.** Replace the merged `@import "tailwindcss"` entry
   with `@import "design-baseline/tokens.layer.css"`, keep the `:root` / `.dark`
   brand triplets, add `@source "../node_modules/design-baseline/src"`, and move
   the project's `next/font` binding into the brand file's `@theme` stanza —
   the seam `token-split` shipped.
3. **Install, wire, delete.** The tag, the four paths entries,
   `transpilePackages`, then the file deletions from §"The two-entry path".
4. **Drop the per-file vendor stamps** in the same commit as the deletions —
   the installed tag is the stamp now (`STACK.md` hazard 5).
5. **Record the tag and the kept-file count** as a `sync` row in the donor's
   `docs/promotion-radar.json`.

Step 1 is first on purpose: it is the only step whose output can change the
plan, and running it after the install means discovering a fork by way of a
broken build.

### Scope boundary

This phase makes hk-crm installable-onto and documents how. It does **not**:

- Execute the hk-crm PR. That runs from an hk-crm session against this
  runbook (C7); this phase's donor-side proof is a reported dry run, not a
  merged consumer change.
- Migrate `controlling-app`, `mistra`, `brickshop-manager`, `my-finance-app` or
  `pmo`. The runbook is written to be consumer-agnostic, but hk-crm is the only
  consumer this phase proves it against.
- Delete `server/archetypeDrift.ts`, `design-baseline-chrome.json` or the
  dashboard's adoption machinery (`drop-drift-machinery`), retire any consumer
  or donor doc (`docs-retire`, `donor-docs`), or delete a fleet command
  (`fleet-commands`). All four remain blocked on a consumer actually consuming.
- Give the packaged surface a locale seam. hk-crm's German-defaulted files stay
  consumer-owned under C2, which is a working answer; whether the package should
  grow one is deferred below.
- Reconcile `form`'s `required` asterisk or `confirmation-dialog`'s `isPending`
  into the donor. Those are `/promote-archetype`'s channel, filed by C5's triage,
  not this phase's edits.

### Verification

Phase `consumer-migration` is done when all of these hold:

1. `docs/PACKAGE.md` §2 states the two-entry array and the per-directory
   ownership split of C2/C3, and a `## Migrating a vendored consumer` section
   carries the five ordered steps with the fork-triage normalisation named.
2. The donor's `badge` exposes the five status tiers plus `info`, `alert` keys
   off the same pairs, `tokens.layer.css`'s `@theme` declares the ten
   `--color-status-*` roles, the brand `tokens.css` carries their `:root` and
   `.dark` triplets, and `node scripts/verify-exports.mjs` still reports
   `6/6 ok` — T5's "layer declares no brand values" invariant is what proves the
   roles went in the layer and the values did not.
3. **The dry run**: a scratch copy of hk-crm, outside both repos, with the git
   dependency, the four `paths` entries, `transpilePackages`, the 28 `ui/`
   deletions and the `layout/` + `archetypes/` deletions applied, passes
   `npx tsc --noEmit` and `next build`, and `/companies/[id]` renders with the
   archetype's classes present in the built CSS. Not committed; reported in the
   ticket. This is what proves C2 against a Next build that resolves aliases
   into `node_modules` — the open question `pkg` deferred.
4. `docs/promotion-radar.json`'s package-tag `sync` row names the kept-file
   count as part of what a consumer records, so a fork surviving the swap is a
   number rather than a discovery.
5. `npx tsc --noEmit`, `npm test`, `node scripts/lint-design.mjs` (0 errors) and
   `npm run gallery:build` are unchanged in the donor. The `badge`/`alert`
   adoption is the only source-visible change here; anything else moving is a
   regression.

The class-level acceptance stays the roadmap's: after the swap, hk-crm's
`/companies/[id]` renders identically and carries no vendored archetype file,
so no `archetype-rollout`-shaped ticket about it can be filed — the copy it
would report is gone.

### Ticket batch

| ticket | depends_on |
|---|---|
| `donor-status-token-roles-badge-alert-backport` | — |
| `package-ui-ownership-and-vendored-consumer-runbook` | `donor-status-token-roles-badge-alert-backport` |

Two. The backport is separable and lands first because the runbook's triage
table cites its outcome — with the donor behind on `badge` and `alert`, step 1
of the runbook would tell every consumer to keep a fork of two files the donor
should simply have. The ownership narrowing and the runbook are one ticket
because a two-entry path documented without the migration order, or an order
that assumes the old single-entry re-point, is a half-landed change; the dry run
verifies both at once or neither.

### Deferred to the decompose loop

- Whether the packaged surface should grow a **locale seam** — the archetype
  layer already answers by prop (English default, `moreLabel`-shaped override),
  but `ui/state-view.tsx`'s fallbacks and `ui/confirmation-dialog.tsx`'s button
  labels have no prop, which is why hk-crm forked them rather than overriding.
  Two German consumers keeping the same two forks is the signal that the seam is
  worth building; one is not.
- Which of hk-crm's twelve own `ui/` primitives are fleet-general enough to
  promote (`breadcrumb`, `results-count` and `table-row-actions` are the
  obvious candidates). Answered by the triage in step 1 of the runbook,
  filed via `/promote-archetype`, not decided here.
- Whether `layout/` needs the two-entry treatment for the next consumer.
  hk-crm's copy happens to be a strict subset; `controlling-app`'s and
  `mistra`'s are not yet measured, and if either owns a layout file the
  blanket re-point of C3 becomes a two-entry array there too.
- Registry versus git tag, still (P7). The first real install is the input that
  question was waiting on, and it is this phase's dry run — but the answer is
  `drop-drift-machinery`'s to make, alongside tag cadence.

---

## Phase drop-drift-machinery — retire the copy comparand

Sharpened 2026-09-08, after p0 / p1 / lint / warn-drain / pkg / token-split /
consumer-migration landed. Supersedes the design-level Phase-5 sketch above,
which assumed the machinery becomes deletable the moment a package exists.

### What changed under this phase

**The gate is unmet, and it is four times wider than the phase title reads.**
Zero consumers have installed. hk-crm — the one consumer `consumer-migration`
made installable-onto — still carries 49 files under `src/components/ui/`, 23
archetype directories, 49 files under `docs/archetypes/` and 102 per-file vendor
stamps. `~/.claude/state/archetype-drift-flags.json` is live and non-empty
across three repos (brickshop-manager's `grouped-list` at `1.3` against the
donor's `3.0`, `matrix-grid` at `1.3` against `2.3`). Deleting the scanners now
blinds real staleness, which is exactly what the coding-dashboard child ticket
already says. Taken literally, the phase is blocked on four consecutive repeats
of `consumer-migration`.

**But migration does not silence the machinery — it makes it lie.** This is the
finding that makes the phase actionable before the first install.
`archetypeDrift.ts`'s chrome axis (`CHROME_MARKERS`, ~`:157`) treats
`src/styles/tokens.css` as proof that chrome is installed. `token-split` made
that file the **project-owned brand half**, which a migrated consumer keeps
forever by design. The axis then reads `docs/design-baseline-chrome.json` for a
version; `docs-retire` deletes that file; the absent-or-corrupt branch returns
`state: "unstamped"`. So a consumer that follows the runbook exactly reports a
permanent chrome flag, and the repos that did the right thing become the noisiest
rows in the fleet. The MANIFEST axis behaves correctly by contrast — a repo with
no local manifest is skipped (`archetypeDrift.ts`, ~`:229`), so that half already
decommissions itself per consumer.

**The donor carries two version numbers with one meaning between them.**
`package.json` says `0.2.1` — tagged, installable, what a consumer actually
resolves. `docs/archetypes/MANIFEST.json`'s `plugin.version` says `0.10.2`, and
`archetypeDrift.ts` (~`:212`) reads *that* as the chrome-bundle comparand.
`PLUGIN-CONTRACT.md:64` documents `plugin.version` as the **contract** version —
"bump on breaking changes to this shape". The scanner co-opted a contract number
as a bundle stamp, which is precisely the roadmap's Context complaint: *one
hand-bumped number standing in for the whole 44-component shell*. The two numbers
disagree by an order of magnitude because they were never measuring the same
thing.

**`archetypeDrift.ts` is not all copy-comparison.** Its `LocalArchetypeEntry`
axis reports project-local, versionless archetypes — shapes a project defined
for itself that the donor never absorbed — and its own comment states that the
molecule-only Radar structurally cannot see them. That is promotion-candidate
discovery, which the roadmap's Phase-5 keep-list already claims ("discovering
that two projects share a pattern worth hoisting"). A wholesale file deletion
would take it out with the copy comparison.

**The deletions already have a decomposed owner.** coding-dashboard's
`dashboard-drop-drift-machinery` (`status: blocked`, gate 5) enumerates the
modules, the client columns, the three state files and the docs, and already
splits the land: the archetype half clears on `consumer-migration`, the
methodology half only on `docs-retire` + `fleet-commands`, because
`methodologyAdoption.ts` compares donor methodology-doc `version:` fields against
consumer copies. Nothing here re-decomposes that; this phase re-scopes it.

### Decisions

| # | Decision | Rationale |
|---|---|---|
| E1 | The phase stays **donor + dashboard-side**. Consumer install PRs remain consumer-session work, per `consumer-migration`'s C7. The blocking gate changes from "a consumer actually consumes" to "the machinery is correct for a migrated world" | The donor's CI can never verify an hk-crm PR, and the correctness fix is *prerequisite* to the first migration rather than gated behind it — ship it after the first install and install #1 spends its whole life emitting a false flag |
| E2 | The chrome axis and the MANIFEST-version axis **collapse into one**: the consumer's installed `design-baseline` dependency range against the donor's tag. `docs/design-baseline-chrome.json` loses its last reader | The installed tag is the only comparand that survives the channel swap. It is also strictly better in the copy world's terms — it is written by the package manager rather than hand-bumped, so it cannot go stale against the thing it claims to stamp |
| E3 | `plugin.version` reverts to its documented meaning — the **contract shape version only**. The bundle/installed version is `package.json`'s, which is the tag. `PLUGIN-CONTRACT.md`'s Versioning section says so explicitly | One number per meaning. `designPlugin.ts` already reads `plugin.version` as the contract version; only the drift scanner misread it. Fixing the reader without naming the rule in the contract leaves the next reader free to misread it again |
| E4 | `LocalArchetypeEntry` **survives in place** — the module shrinks around it, no new file | Ladder rule 2: it already lives in the module that keeps existing. Splitting promotion-candidate discovery into its own file would be a new file for one function with one caller |
| E5 | Deletion is **per-repo and automatic, not an event**. The modules delete when the scan returns empty — the machinery's own output is its deletion trigger | The manifest axis already skips unadopted repos; under E2 the tag axis reports a migrated repo correctly instead of flagging it. Any explicit "consumers still copy-vendored: N" counter would be a second hand-maintained number of exactly the `design-baseline-chrome.json` kind this roadmap exists to kill |
| E6 | `methodologyAdoption.ts` and the copy half of `archetypeShapeAudit.ts` are **not this phase's**. They stay on the child ticket's own gate: `docs-retire` + `fleet-commands` | The child ticket's split is correct and measured. Pulling the methodology half forward would delete the only signal that consumer methodology docs are stale while those docs still exist |
| E7 | Consumer-side artifacts — per-file vendor stamps, the four `design-baseline-chrome.json` files, the four `MANIFEST.json` forks, the `docs/archetypes/` corpora — belong to **`docs-retire`**. This phase removes their last *reader*; `docs-retire` removes the *files* | They are double-listed in the roadmap's Phase-5 and Phase-6 bullets. Reader-then-file is the only safe order, and it puts each artifact in exactly one phase. This section supersedes the roadmap's Phase-5 prose on that point |
| E8 | The dashboard code lands via the existing `dashboard-drop-drift-machinery`, **re-scoped rather than re-filed**, and its `blocked_reason` is rewritten to E1's gate | The ticket is gate-scored 5 with an accurate module inventory. Re-filing would lose the inventory and the phase split for a title change |
| E9 | **Git tag, not a registry** — the inherited P7 question, answered. Tag cadence is demand-driven: a tag is cut when a consumer needs a change, not on a schedule | `consumer-migration`'s dry run resolved a git dependency through a Next build with no publish infrastructure at all. A registry buys distribution to machines that do not have the donor checked out, and no such consumer exists. Scheduled tagging would re-introduce a version number that moves without a reason behind it |

### The replacement axis, concretely

Everything the chrome axis and the manifest-version axis do collapses to one
read of the consumer's `package.json`:

```ts
// the whole comparand, in the package world
const dep = consumerPkg.dependencies?.["design-baseline"];   // "github:…#v0.2.1" | undefined
if (!dep) return null;                                       // not a package consumer — copy-world axes still apply
const installed = dep.match(/#v?([\d.]+)/)?.[1];             // "0.2.1"
return isNewer(donorPkg.version, installed) ? { state: "behind", installed, donor: donorPkg.version } : null;
```

`CHROME_MARKERS`, `CHROME_STAMP`, `scanChrome`, `ChromeStampEntry` and the
`plugin.version` read all go. A repo with no `design-baseline` dependency falls
through to the existing copy-world axes unchanged, which is how the three
unmigrated consumers keep their signal while hk-crm stops producing one.

### Ownership split

| Artifact | Repo | Phase | Action |
|---|---|---|---|
| `PLUGIN-CONTRACT.md` Versioning section | design-baseline | **this phase** | State that the bundle version is `package.json`'s / the tag, and `plugin.version` is the contract shape only |
| `MANIFEST.json` `plugin.version` | design-baseline | **this phase** | Stops moving with `src/` changes; bumps only on a contract-shape break |
| `archetypeDrift.ts` chrome + manifest-version axes | coding-dashboard | **this phase**, via the re-scoped child | Replaced by the tag axis (E2) |
| `archetypeDrift.ts` `LocalArchetypeEntry` | coding-dashboard | — | Kept (E4) |
| `archetype-drift-flags.json` chrome fields, `client/src/features/design/` chrome column | coding-dashboard | **this phase**, via the child | Deleted with the axis |
| `methodologyAdoption.ts`, `archetypeShapeAudit.ts` copy half | coding-dashboard | `docs-retire` / `fleet-commands` | Untouched here (E6) |
| `moleculeAudit.ts`, `adoptionScan.ts`, `designPlugin.ts`, promotion radar, `docs/audit-signals.json` | both | — | Kept — signal rubric, not copy comparison |
| Vendor stamps, `design-baseline-chrome.json` files, MANIFEST forks, `docs/archetypes/` corpora | consumers | `docs-retire` | Files deleted there; this phase only removes their reader (E7) |
| The hk-crm install PR itself | hk-crm | — | Consumer-session work against `PACKAGE.md`'s runbook (E1/C7) |

### Scope boundary

This phase makes the machinery correct for a migrated world and shrinks it to
the one comparand that survives. It does **not**:

- Execute any consumer's install. hk-crm's channel swap runs from an hk-crm
  session against `docs/PACKAGE.md`'s "Migrating a vendored consumer" runbook.
- Delete `archetypeDrift.ts`, `methodologyAdoption.ts` or `archetypeShapeAudit.ts`
  as files. Three consumers still produce real copy-world flags; the modules go
  when the scan returns empty (E5).
- Touch any consumer repo's files (E7), retire any donor doc (`donor-docs`), or
  delete a fleet command (`fleet-commands`). `MANIFEST.json`'s `plugin.actions`
  still name `/style-baseline` and `/style-archetypes`; re-pointing them at the
  package install is `donor-docs`' bullet, not this one.
- Narrow the LLM shape audit to its "should this be an archetype?" job. That is
  the surviving half of `archetypeShapeAudit.ts` and moves on the same gate as
  the copy half (E6).

### Verification

Phase `drop-drift-machinery` is done when all of these hold:

1. `docs/PLUGIN-CONTRACT.md`'s Versioning section states that the installed /
   bundle version is `package.json`'s (equal to the git tag) and that
   `plugin.version` is the contract shape version only, bumped on a shape break.
2. `grep -rn "design-baseline-chrome" ~/Documents/dev/coding-dashboard/server
   ~/Documents/dev/coding-dashboard/client/src` returns nothing outside
   `docs/backlog/archive/` and `docs/adr/`.
3. **The F2 regression fixture**: a repo with `"design-baseline": "…#v0.2.1"` in
   `package.json`, a project-owned `src/styles/tokens.css`, no
   `docs/archetypes/MANIFEST.json` and no `docs/design-baseline-chrome.json`
   produces **zero** flags. Today that same repo reports `state: "unstamped"`,
   so this test fails before the change and passes after — it is the phase's
   whole point in one assertion.
4. A fixture repo pinned at `#v0.2.0` against a donor `package.json` at `0.2.1`
   reports `behind` exactly once, on the tag axis, with no chrome row.
5. A fixture repo with **no** `design-baseline` dependency and a local
   `docs/archetypes/MANIFEST.json` still reports its version drift unchanged —
   the three unmigrated consumers keep their signal.
6. `LocalArchetypeEntry` rows still appear for a repo carrying a versionless
   namespaced archetype, and `keyCollidesWithBaseline` still fires.
7. coding-dashboard `npm test` green; the Design tab renders with no chrome
   column and no chrome-derived state string in `designStates.ts`.
8. Donor gates unchanged: `npx tsc --noEmit` clean, `node scripts/lint-design.mjs`
   0 errors, `node scripts/verify-exports.mjs` 7/7 ok, `npm run gallery:build` ok.
   (`npm test` carries the known `Sidebar.test.tsx` jsdom `localStorage`
   failure, unrelated to this phase.)

The class-level acceptance: after this phase, a consumer that migrates
correctly produces **no flag at all**, and one that falls behind its tag
produces exactly one. The question "are these copies still the same" is not
answered better — it stops being asked, per repo, at the moment that repo stops
having copies.

### Ticket batch

| ticket | depends_on |
|---|---|
| `plugin-version-contract-vs-bundle-split` | — |

One donor ticket. The dashboard work is not re-filed: coding-dashboard's
existing `dashboard-drop-drift-machinery` carries it, re-scoped per E8 — its
archetype half becomes the E2 axis replacement rather than a deletion, its
methodology half is unchanged, and its `blocked_reason` moves to E1's gate. That
re-scope is an edit in that repo's backlog, executed from a coding-dashboard
session, and it is what unblocks the ticket that has been blocked since
2026-09-06.

The donor ticket is separable and lands first because the scanner's replacement
axis needs a comparand whose meaning is settled: with `plugin.version` still
doubling as a bundle stamp, the dashboard change would have two candidate
numbers to read and no document saying which is wrong.

### Deferred to the decompose loop

- Whether `moleculeAudit.ts`'s signal rubric needs any change in the package
  world. It scans source with ripgrep and does not compare copies, so the
  presumption is no — but its per-repo `@source`-scanned surface changes when a
  consumer's primitives move into `node_modules`, and the first migrated
  consumer is the input to that question.
- Whether the surviving LLM shape audit should read the package's archetype
  contracts directly rather than a consumer's vendored copy. Same gate: it needs
  one migrated consumer to be answerable, and it belongs to `docs-retire`'s land.
- Whether `LocalArchetypeEntry` eventually belongs in the promotion radar rather
  than in the drift module. It stays put under E4; the question reopens only when
  the drift module's last copy-world axis dies, which is E5's trigger.

---

## Phase docs-retire — retire the copies, ship the successor

Sharpened 2026-09-09, after p0 / p1 / lint / warn-drain / pkg / token-split /
consumer-migration / drop-drift-machinery landed. Supersedes the roadmap's
Phase-6 bullets, which are wrong on three of their five items in ways only
measurement shows.

### What changed under this phase

**The gate is unmet in the same way, and the same answer applies.** Zero
consumers have installed: `grep '"design-baseline"'` across `hk-crm`,
`controlling-app`, `mistra`, `brickshop-manager`, `my-finance-app` and `pmo`
`package.json` files returns nothing. Taken literally — *"in each migrated
consumer"* — this phase has no target at all. `drop-drift-machinery` hit the
same wall and answered it correctly: the donor-side half is *prerequisite* to
the first migration rather than gated behind it. Ship the successor and the
order before the first consumer deletes anything, or install #1 deletes a doc
whose replacement does not exist yet.

**Deletion has no successor today.** `package.json`'s `files` is
`["src/components", "src/lib", "src/hooks", "src/utils", "src/styles"]`. The
package ships **no docs**. So the roadmap's *"delete the eight methodology
docs"* currently means *delete them and read nothing* — a consumer still has to
answer "which archetype is this page?" after installing, and
`CHOOSING-A-SURFACE.md` is the only thing that answers it. The four surviving
methodology docs total 68 KB; the whole `docs/` tree is 4.5 MB.

**Deleting the consumer MANIFEST fork kills the axis the previous phase
deliberately kept.** `archetypeDrift.ts`'s `LocalArchetypeEntry`
(~`:224`–`:240`) reads *the consumer's* `docs/archetypes/MANIFEST.json` and
reports its **versionless** entries — the project's own namespaced shapes, the
promotion-candidate discovery E4 spared by name. Measured: `hk-crm`,
`controlling-app` and `mistra` carry pure baseline forks (22 / 22 / 11 entries,
zero local slugs), but `brickshop-manager` carries six local-only slugs —
`detail-view`, `settings-form`, `domain-hub`, `lookup`, `feed`, `item-selector`
— and they are the only live rows that axis has. A wholesale file deletion
takes E4 out from the consumer side one phase after `drop-drift-machinery`
protected it from the dashboard side.

**A third hand-maintained number for one meaning, exactly E3's shape.** The
donor's `MANIFEST.json` `methodology[].version` says `placement 1.2`,
`stack 1.1`, `adoption 1.2`. The donor's own doc frontmatter says `1.3`, `1.2`,
`1.3`. `methodologyAdoption.ts` compares each consumer's copy against the
**MANIFEST** number, so `controlling-app` sitting at `PLACEMENT 1.2` reports
*fresh* while genuinely one bump behind, and `hk-crm`'s `STACK.md` at `1.3`
reads as ahead of a donor claiming `1.1` whose file actually says `1.2`. Three
numbers, one fact. The roadmap's Context complaint — *one hand-bumped number
standing in for the whole shell* — recurs here at doc granularity.

**`methodologyAdoption.ts` does not die on this phase.** Its `AdherenceLint`
interface computes gate 3 — `lint:design` in `scripts`, `scripts/lint-design.mjs`
present, `_adherence.json` present — and the adherence lint is on the roadmap's
explicit keep-list, in this phase's own title. Same shape as E4: the module
shrinks around the half that survives. `dashboard-drop-drift-machinery`'s split
("the methodology half only on `docs-retire` + `fleet-commands`") is right about
the gate and wrong about the extent.

**What the phase title's counts actually resolve to.** *Eight methodology docs*:
six are the MANIFEST `methodology[]` array, one is `SURFACES.md`, one is a stray
`FLEET-AUDIT.md` in `hk-crm` that `/adopt-baseline` never distributes
(`adopt-baseline.md:413` lists it as donor-internal) and that arrived by hand.
*Adoption-plan*: `docs/ADOPTION-STATUS.md`, which only `controlling-app` has —
`hk-crm` migrated by hand and never got one. *Three JSON configs*:
`_adherence.json` (**kept**, by this phase's own title),
`docs/design-baseline-chrome.json` (dead — `drop-drift-machinery` already
removed its reader), and `docs/archetypes/MANIFEST.json` (**shrinks**, per
above). One deletion, one shrink, one keep — not three deletions.
*`design:`/`patterns:` Doc Paths keys*: only `controlling-app` carries a
`design:` key at all; all four carry `patterns:`, and for `brickshop-manager`
and `mistra` it points at a corpus that holds project-local shapes.

### Decisions

| # | Decision | Rationale |
|---|---|---|
| F1 | The phase is **donor + dashboard-side**. Consumer doc deletions run from that consumer's own session against a runbook step. The blocking gate changes from "a consumer has migrated" to "the retirement has a successor and a safe order" | E1's precedent, unchanged: the donor's CI can never verify an hk-crm PR, and shipping the successor *after* the first install means install #1 spends its life with a dangling reference |
| F2 | Consumer docs get the **same three-way ownership split `ui/` got in C2** — package-owned, dead, project-owned-kept — not a flat delete list | The roadmap's "no reader left" is false for two of the artifacts it names. An ownership table is the only form that survives measurement, and it is the form the fleet already reads for `ui/` |
| F3 | The package **ships the four surviving methodology docs**: `CHOOSING-A-SURFACE.md`, `PLACEMENT.md`, `STACK.md`, `DETAIL-PAGE-TEARDOWN-PLAYBOOK.md` enter `files`. `ADOPTION.md` and `ADOPTION-QUALITY.md` do **not** — they are donor-internal and die in the consumer with no successor | 68 KB, one array entry, and the doc a consumer reads is then pinned to the tag it installed. Reading the donor checkout instead re-introduces the skew this roadmap exists to kill, one level down. Shipping all of `docs/` puts 4.5 MB of backlog, ADRs and audits into every `node_modules` |
| F4 | A consumer's `docs/archetypes/MANIFEST.json` **shrinks to its versionless local entries**; it is deleted only when that leaves it empty | Preserves E4's `LocalArchetypeEntry` from the consumer side. Empty for `hk-crm` / `controlling-app` / `mistra` (delete the file), six rows for `brickshop-manager` (keep the file, drop the fork) |
| F5 | `SURFACES.md`, `_adherence.json` + the lint, and an **unversioned** `ADOPTION.md` are **project-owned and kept** | `hk-crm`'s `SURFACES.md` is 30 filled rows of its own binding resolution, read at review; `/adopt-baseline` scaffolds it once and never refreshes it. `methodologyAdoption.ts` already models the unversioned-`ADOPTION.md` case as *uncomparable, not stale* — the consumer's adoption record living at the donor's contract path |
| F6 | `MANIFEST.json`'s `methodology[].version` field **is removed**; each doc's own frontmatter `version:` is the single source, and the scanner reads it | One number per meaning, E3's rule applied to docs. The scanner already calls `splitFrontmatter` on the consumer copy — reading the donor's the same way is a smaller module, not a bigger one, and it keeps the staleness axis *correct* for the three unmigrated consumers instead of silently under-reporting |
| F7 | `methodologyAdoption.ts` **shrinks around its `AdherenceLint` half**, and `dashboard-drop-drift-machinery`'s split is corrected to say so. No new file | E4's ladder rule again: the surviving half already lives in the module that keeps existing. The lint gate is on this phase's own keep-list |
| F8 | Doc Paths: the **`design:` key is removed** (`controlling-app` only). The **`patterns:` key is kept** wherever the corpus retains local shapes and removed only where the corpus was a pure baseline fork | Not a blanket removal. `brickshop-manager`'s `patterns:` points at six project-local archetypes it authored before the donor existed; `mistra`'s names project-local shapes in its own description. Removing the key there blinds the project to its own corpus |
| F9 | `brickshop-manager` archives its pre-donor `.md` corpus to `docs/archive/archetypes-2026/` per the roadmap, but its **MANIFEST stays live** at `docs/archetypes/MANIFEST.json` carrying the six local rows | The roadmap's archive bullet is about prose. Archiving the axis input alongside it would silently do what F4 exists to prevent |
| F10 | The consumer-side deletions land as **step 6 of `PACKAGE.md`'s "Migrating a vendored consumer" runbook**, not as a separate doc | C7's shape. The runbook already carries five ordered steps ending at "record the tag"; doc retirement is the sixth, and a consumer executing steps 1–5 and then hunting for a second document is how a half-migration happens |

### The ownership table, concretely

`docs/PACKAGE.md`'s runbook gains this, one row per artifact a vendored
consumer carries:

| Artifact | Owner after the swap | Action |
|---|---|---|
| `docs/CHOOSING-A-SURFACE.md`, `docs/PLACEMENT.md`, `docs/STACK.md`, `docs/DETAIL-PAGE-TEARDOWN-PLAYBOOK.md` | package | Delete the copy; read `node_modules/design-baseline/docs/<name>` |
| `docs/ADOPTION.md` **with** `version:` frontmatter | — | Delete. The contract it carries is `donor-docs`' rewrite, and "adopted" is a version in `package.json` |
| `docs/ADOPTION.md` **without** `version:` | project | Keep — it is the project's own adoption record at a donor path (`hk-crm`) |
| `docs/ADOPTION-QUALITY.md`, `docs/ADOPTION-STATUS.md` | — | Delete. The nine-gate checklist has no meaning once `/adopt-baseline` is gone (`fleet-commands`) |
| `docs/FLEET-AUDIT.md` in a consumer | — | Delete. Donor-internal; the copy in `hk-crm` was never distributed by `/adopt-baseline` |
| `docs/SURFACES.md` | project | Keep. Its reader is review, not adoption |
| `_adherence.json`, `scripts/lint-design.mjs`, the `lint:design` script | project | Keep, retargeted. This phase's title says so |
| `docs/design-baseline-chrome.json` | — | Delete. `drop-drift-machinery` removed its last reader (E2) |
| `docs/archetypes/<slug>.md` + `<slug>.baseline.md` forks | package | Delete. The closed API's props are the contract; `donor-docs` collapses the donor pair |
| `docs/archetypes/MANIFEST.json` | project, shrunk | Drop every entry carrying a `version:` (baseline adoptions). Keep versionless local entries. Delete the file only if none remain (F4) |
| Per-file `design-baseline@<ver>` vendor stamps | — | Delete — already runbook step 4; the installed tag is the stamp |
| `## Doc Paths` `design:` key | — | Remove |
| `## Doc Paths` `patterns:` key | conditional | Remove iff `docs/archetypes/` is now gone; keep if F4 left local rows |

### The version comparand, concretely

`MANIFEST.json`'s `methodology[]` entries lose their `version` field:

```jsonc
{ "slug": "placement", "kind": "methodology", "displayName": "Placement",
  "status": "locked", "doc": "docs/PLACEMENT.md", "governs": [ … ] }
```

and `methodologyAdoption.ts` reads the donor's own frontmatter through the
`splitFrontmatter` it already imports:

```ts
const donorVersion = splitFrontmatter(await readFile(join(donorPath, m.doc), "utf8")).data.version;
```

Nothing else reads the field — `designPlugin.ts` reads `plugin.version` (E3's
contract number) and the client renders the scanner's output, not the manifest.
The comparison a consumer's copy is measured against becomes the same string
`/adopt-baseline --update` would write, which is what the module's own docblock
already claims it is.

### Scope boundary

This phase gives consumer doc retirement a successor, an order, and a correct
version comparand. It does **not**:

- Delete a single file in any consumer repo. Every deletion in the ownership
  table runs from that consumer's session against runbook step 6 (F1/C7).
- Execute any consumer's install. Still `PACKAGE.md`'s runbook, still consumer
  work.
- Rewrite `ADOPTION.md`, collapse the donor's `<slug>.md` / `<slug>.baseline.md`
  pairs, re-point `PLUGIN-CONTRACT`'s actions, or retire `FLEET-AUDIT.md` **in
  the donor**. All four are `donor-docs`. This phase only decides that the
  *consumer's copies* die and which four survive as package-shipped.
- Delete `/adopt-baseline`, `/style-baseline` or `/style-archetypes`. That is
  `fleet-commands`. Until then `/adopt-baseline --update` can re-vendor a
  deleted doc into a migrated consumer — an opt-in manual command, so the
  exposure is a mis-run rather than a mechanism, and the phase order stays
  reader-then-file-then-writer.
- Delete `methodologyAdoption.ts`, `archetypeShapeAudit.ts`'s copy half, or
  narrow the LLM shape audit. The lint gate survives in the first (F7); the
  other two move on `fleet-commands` per E6, once the docs they compare are
  actually gone from the fleet rather than merely retirable.
- Touch `docs/audit-signals.json`, `moleculeAudit.ts` or the promotion radar.
  Signal rubric, not copy comparison — kept, as in E-table.

### Verification

Phase `docs-retire` is done when all of these hold:

1. `package.json`'s `files` array carries the four package-owned methodology
   docs and neither `docs/ADOPTION.md`, `docs/ADOPTION-QUALITY.md`,
   `docs/FLEET-AUDIT.md` nor any other `docs/` path; `npm pack --dry-run`
   lists exactly those four `docs/` entries.
2. `node scripts/verify-exports.mjs` still reports **7/7 ok**. The docs are
   files, not exports — an invariant moving here is a regression.
3. `docs/archetypes/MANIFEST.json`'s `methodology[]` entries carry **no**
   `version` field —
   `python3 -c "import json;print([d.get('version') for d in json.load(open('docs/archetypes/MANIFEST.json'))['methodology']])"`
   prints all `None` — and `docs/PLUGIN-CONTRACT.md` states that a methodology
   doc's version is its own frontmatter, alongside E3's two other numbers.
4. `docs/PACKAGE.md`'s "Migrating a vendored consumer" section carries a
   **step 6** with the ownership table verbatim, including the conditional
   `patterns:` row and the MANIFEST-shrink rule.
5. **The F4 regression fixture** (coding-dashboard): a repo whose
   `docs/archetypes/MANIFEST.json` holds only versionless local entries still
   produces its `LocalArchetypeEntry` rows and its `keyCollidesWithBaseline`
   flag, with **zero** baseline-adoption drift rows. Today `brickshop-manager`
   is that repo with a fork attached; after F4 it is that repo cleanly.
6. **The F6 fixture**: a consumer copy at `PLACEMENT 1.2` against a donor
   `docs/PLACEMENT.md` whose frontmatter says `1.3` reports **stale**. Today it
   reports fresh, because the MANIFEST says `1.2` — this test fails before the
   change and passes after.
7. `methodologyAdoption.ts`'s `AdherenceLint` gate still computes for every
   scanned repo, and `dashboard-drop-drift-machinery`'s scope text names the
   surviving half rather than scheduling the module for deletion.
8. Donor gates unchanged: `npx tsc --noEmit` clean,
   `node scripts/lint-design.mjs` 0 errors, `npm run gallery:build` ok.
   (`npm test` carries the known `Sidebar.test.tsx` jsdom `localStorage`
   failure, unrelated to this phase.)

The class-level acceptance: after this phase, a consumer that runs the runbook
end to end carries **no doc it did not write**, every doc it deletes has a
named successor or a stated reason it has none, and the fleet's methodology
staleness signal is measured against one number per doc rather than three.

### Ticket batch

| ticket | depends_on |
|---|---|
| `package-ships-methodology-docs-single-version-source` | — |
| `package-doc-retirement-ownership-and-runbook-step` | `package-ships-methodology-docs-single-version-source` |

Two. The first is the successor and the comparand — the `files` array (F3) and
the `methodology[].version` removal with the frontmatter read (F6) — and it
lands first because the ownership table's "read
`node_modules/design-baseline/docs/…`" row is a false instruction until the
package actually ships those files. The second is the ownership table and
runbook step 6 (F2/F4/F5/F8/F9/F10), which is one ticket because a table
without the order, or an order that omits the MANIFEST-shrink rule, is the
half-landed change that costs `brickshop-manager` its six local rows.

The dashboard work is **not re-filed**: coding-dashboard's existing
`dashboard-drop-drift-machinery` carries it, re-scoped per E8 a second time —
its methodology half becomes *shrink around `AdherenceLint`* (F7) plus the
frontmatter comparand (F6), not a module deletion. That re-scope is an edit in
that repo's backlog, executed from a coding-dashboard session.

### Deferred to the decompose loop

- Whether the four package-shipped methodology docs should eventually be one
  doc. `CHOOSING-A-SURFACE` and `PLACEMENT` answer adjacent questions and
  `donor-docs` is already collapsing the archetype pairs; whether the
  cross-archetype docs collapse the same way is that phase's call, informed by
  which of the four a migrated consumer actually opens.
- Whether `_adherence.json`'s `targets` retarget should be a package-shipped
  default rather than a per-consumer hand edit. Every consumer makes the same
  edit today (`["src/app/(app)"]`), which is the rule-of-2 signal — but the
  lint runner is vendored, not packaged, and packaging it is `fleet-commands`'
  question once `/adopt-baseline` stops shipping it.
- Whether a consumer's kept `SURFACES.md` wants a machine-readable form the
  promotion radar could read. It is the one artifact in the table that holds
  fleet-relevant project knowledge and has no reader outside a human review.
  One consumer keeping it proves nothing; four keeping it is the signal.
- Whether `archetypeShapeAudit.ts`'s surviving "should this be an archetype?"
  half should read the package's contracts. Inherited from
  `drop-drift-machinery`'s deferred list and still gated on a migrated
  consumer — F3 makes it *answerable* (the contracts now ship), but not before
  one repo installs.

---

## Phase donor-docs — retire the mirrors, ship the contract

Sharpened 2026-09-11, after p0 / p1 / lint / warn-drain / pkg / token-split /
consumer-migration / drop-drift-machinery / docs-retire landed. Supersedes the
roadmap's Phase-7 bullets, which are right on the target and wrong on the form
of three of their four items.

### What changed under this phase

**"Closed archetype" stopped being a subset.** The roadmap wrote *"one doc per
closed archetype"* when `detail-overview` was the only closed one. `warn-drain`
put all eight generic archetype rules at `severity: error` over
`src/components/archetypes/**` and drained them to zero hits, with every
surviving appearance prop carrying a cited contract keying rule. All 22 MANIFEST
archetypes are closed. The phase is all-22 or none; there is no partial form
left to choose.

**The split's own justification is retired by item 4 of this same phase.**
`docs/RULES.md:9`'s rule-2 *Why* and `docs/archetypes/README.md:18` both
justify the contract / `.baseline.md` pair as *"what makes stack-agnostic
fit-scoring (`docs/FLEET-AUDIT.md`) possible"*, and `ARCHITECTURE.md:113`
repeats it — *"a Tailwind-3/Next project can audit its pages against the
contract without installing any baseline primitive."* That reader is measured
zero: every fleet repo carrying archetypes runs the baseline stack (`hk-crm`
`tailwind ^4` + 16 `@radix-ui` packages; `brickshop-manager` `^4.3.3` + 18).
No dashboard code reads `reference_impl` at all. The hypothetical divergent-stack
consumer has been the split's only cited beneficiary for four months and has
never appeared.

**What a `.baseline.md` actually holds is the shipped code, retyped.** Read end
to end, a sibling is an import snippet, a usage block, a role→primitive map and
the class strings already literal in the source —
`skeleton-loader.baseline.md:26-31` is three `<ListSkeleton …/>` call forms the
gallery demo renders live and the prop types declare. That is E3's defect at
doc granularity: one meaning, two hand-maintained statements, and the
`/promote-archetype` flow spends four of its steps (`:386`, `:448`, `:657`,
`:675`) routing edits between them to keep the mirror true.

**`docs-retire` shipped a dangling instruction this phase must pay off.**
`PACKAGE.md:264` tells a migrated consumer its `docs/archetypes/<slug>.md` +
`<slug>.baseline.md` forks are **package**-owned — "Delete." `package.json`'s
`files` ships `src/components`, `src/lib`, `src/hooks`, `src/utils`,
`src/styles` and the four methodology docs, and **no** `docs/archetypes/` path.
The row is a false instruction until this phase ships the contracts. F3's
finding, one level down and already promised to a consumer.

**The `PLUGIN-CONTRACT` actions are a contract statement with no machine
reader.** `MANIFEST.plugin.actions` declares `/style-baseline` and
`/style-archetypes {key}` — the two commands `fleet-commands` deletes next. A
grep of the hub's `server/` and `client/src` finds no consumer of
`plugin.actions`; `designPlugin.ts:21` validates only `key` / `slug` per
archetype entry. So re-pointing them is cheap, breaks nothing, and is
**ordering-critical**: it must land before `fleet-commands`, or the connected
plugin advertises two commands that no longer exist.

**`FLEET-AUDIT.md` is not one deletable unit — it is three, and only one is
dead.** Its *drift* half lost its comparand on `drop-drift-machinery`. Its
*gap-finding* half is what `promotion-radar.json` already holds (16 candidates,
3 at `watch`). But its *rubric* half is the prose spec for
`docs/audit-signals.json`, which has three live readers on the keep-list —
`moleculeAudit.ts:117`, `adoptionScan.ts:26`, and this donor's own
`scripts/scan-adoption-quality.mjs` — and `ADOPTION-QUALITY.md` (read by the
hub at `designStates.ts:811`) cross-references `FLEET-AUDIT.md` four times,
including for its output schema and triage tier. Deleting the file before the
salvage lands orphans a rubric three scanners still run.

**`ADOPTION.md` was rewritten for package consumption two phases ago, under a
different name.** `docs/PACKAGE.md` is 24 KB of four wiring lines, a six-step
migration runbook and a proof matrix. `ADOPTION.md`'s nine-point checklist is
`/adopt-baseline`'s script and dies with it on `fleet-commands`; point 6
(vendor stamps) is already deleted by runbook step 4. Only its four-gate
enforcement table and its upstream rule-of-2 loop have no home.

**The roadmap's size acceptance is unreachable as written.** *"the donor's
docs/ is under 250 KB"*: `docs/` is 4.6 MB, of which `audits/` is 2.5 MB
(2.3 MB is one 2026-07 hk-crm HTML dump), `backlog/` 988 KB and
`archetypes/` 612 KB. The 22 contracts alone are 335 KB and are the thing the
package now ships. The measure was a proxy for "no doc without a reader" and
is restated as that.

### Decisions

| # | Decision | Rationale |
|---|---|---|
| G1 | The phase is **donor-side**, plus exactly one edit in `coding-dashboard` (`fleet/commands/promote-archetype.md`). No consumer repo is touched | E1/F1's precedent, unchanged. The promote flow is the only writer of the artifact G2 deletes; leaving it writing siblings means the next promotion re-creates the class |
| G2 | The `.baseline.md` sibling is **deleted, not merged**. 22 files, 133 KB | Merging preserves the mirror and doubles the contract's size; the roadmap's own rationale is *"once the archetype is a closed component, its props are the contract"*. The binding's live form is the shipped typed export plus the gallery demo, both already distributed by the package |
| G3 | `RULES.md` rule **2 is rewritten** (one contract + the exported component, `spec` + `primitives_dir` in the MANIFEST); rule **3 is untouched**. Residue a sibling carried that the types and demo do not — a role→primitive decision such as `StateView` rendering `loadingSkeleton` verbatim — moves into the **primitive's JSDoc or its demo**, never into the contract | Keeps the contract role-only by construction rather than by a second file. The stack-agnostic property was never the split's product; rule 3 is. `lessons.md:34` already treats the documented public export as the binding's home |
| G4 | `reference_impl` leaves every MANIFEST archetype entry, and `scripts/verify-manifest-versions.mjs` grows the guard: no entry carries `reference_impl`, no `docs/archetypes/*.baseline.md` exists | The mechanical tripwire is what stops the pair re-appearing by hand, the same way the methodology-`version` guard stopped E3's third number. Hub-safe: `designPlugin.ts:21` requires only `key`/`slug` |
| G5 | The package **ships `docs/archetypes/`** — the 22 contracts, `MANIFEST.json`, `README.md` — via one `files` entry | Pays off `PACKAGE.md:264`. ~480 KB after G2, against F3's stated ceiling (68 KB fine, 4.5 MB not): the corpus a consumer deletes must resolve somewhere, and pinning it to the installed tag is the same argument F3 made for the four methodology docs |
| G6 | `plugin.actions` re-points at the package install — one `install-package` action naming `docs/PACKAGE.md`'s runbook, `iterate-baseline` kept, `/promote-archetype` added as the one surviving fleet command — and `plugin.version` goes **0.10.2 → 0.11.0** | PLUGIN-CONTRACT's own rule: bump on a break to the `plugin` block's shape, and G4 + the action set are exactly that. Lands **before** `fleet-commands` so no window exists where the manifest advertises deleted commands |
| G7 | `docs/ADOPTION.md` is **deleted** and its `methodology[]` entry with it. The four-gate enforcement table moves into `PACKAGE.md`; the upstream rule-of-2 loop moves into `PROMOTION-RADAR.md` | PACKAGE.md is the successor and already ships. Two docs for one meaning is the defect this roadmap exists to kill. F5 is unaffected: it governs a *consumer's* unversioned `ADOPTION.md`, which stays project-owned at that path |
| G8 | `FLEET-AUDIT.md` gets the **three-way split**: the rubric half's prose moves to `ADOPTION-QUALITY.md` (its existing reader) with `audit-signals.json` unchanged as the machine form; the drift half is deleted; the gap half becomes radar candidates. The file is deleted **only after** the salvage lands | F2/C2's shape a third time. Three scanners still run the rubric; a delete-first order takes their spec out from under them |
| G9 | `docs/audits/`: the 2.3 MB `hk-crm-adoption-2026-07/` HTML dump and the two 2026-06 dated sweeps are deleted, the sweeps only after any unpromoted row is on the radar. `2026-09-07-pkg-ui-vendored-clause-narrowing.md` and `2026-archetype-appearance-prop-audit.{md,json}` **stay** — they are cited evidence for shipped phases | The test is a live citation, not a date. A dated report whose only reader was `FLEET-AUDIT.md`'s methodology has no reader once G8 lands |
| G10 | The roadmap's *"docs/ under 250 KB"* acceptance is **restated** as: every doc under `docs/` has a named reader, and no dated audit dump survives without a citation | 335 KB of contracts are the package's payload. A byte target that the deliverable itself blows is a proxy measuring the wrong thing |

### The deletion, concretely

Per archetype, three files become two and one manifest key disappears:

```
docs/archetypes/<slug>.md               kept, untouched, now package-shipped
docs/archetypes/<slug>.baseline.md      deleted (residue → JSDoc / demo first)
src/components/archetypes/<slug>/       unchanged — it is now the binding
MANIFEST: "reference_impl": …           removed; "spec" + "primitives_dir" remain
```

Each contract's *"Reference implementation"* blockquote (the
`> [`<slug>.baseline.md`](./<slug>.baseline.md)` callout at the head of all 22,
e.g. `calendar.md:38`, `raw-input.md:33`) is replaced by one line naming the
package import path for the archetype's primitives. `grouped-list.baseline.md:56`
is the one sibling that delegates to another sibling; its delegation is a
contract-level statement and moves to `grouped-list.md`.

The doc-set edits that follow the deletion, each already located:

- `docs/RULES.md:9` — rule 2 rewritten per G3; rule 3 (`:11`) untouched.
- `docs/archetypes/README.md:16,18,174,186` — the pair table row, the
  stack-agnostic *Why*, the copy list, and the deliverable-version definition.
- `docs/ARCHITECTURE.md:44,63,111,113,133` — the artifact table row, the
  version paragraph, the §5 description, the fit-audit justification, the
  promotion diagram.
- `CLAUDE.md:25,49,58` — Doc Paths gloss, the "two-doc pair" quick reference,
  and the *contract vs. reference-implementation split is load-bearing* note,
  which becomes *the contract is role-only; the binding is the exported
  component* (rule 3 is what was load-bearing).
- `docs/PLUGIN-CONTRACT.md:37,47` — the entry-key list and the bodies clause.
- `docs/PACKAGE.md:264` — the ownership row's successor path becomes real.

### The action set, concretely

```jsonc
"actions": [
  { "id": "install-package",   "label": "Install design-baseline",
    "command": "see docs/PACKAGE.md", "scope": "project" },
  { "id": "promote-archetype", "label": "Promote an archetype",
    "command": "/promote-archetype {key}", "scope": "baseline" },
  { "id": "iterate-baseline",  "label": "Iterate design-baseline",
    "command": "design-baseline iteration session", "scope": "baseline" }
]
```

`adopt-baseline` and `adopt-archetype` leave the array: their commands die on
`fleet-commands`, and a package install is not a command the hub can fire
per-project — it is a four-line wiring change the runbook owns. The hub renders
no action today, so the array's job until it does is to state which of the two
worlds the plugin lives in.

### Scope boundary

This phase collapses the donor's archetype doc pair, ships the contracts, and
retires the two audit-era docs. It does **not**:

- Touch a consumer repo. `docs-retire`'s runbook step 6 already owns every
  consumer deletion, and G5 is what makes its `docs/archetypes/` row true.
- Delete `/adopt-baseline`, `/style-baseline` or `/style-archetypes`, or their
  fleet copies. `fleet-commands`. G6 only stops the manifest advertising them.
- Delete `audit-signals.json`, `moleculeAudit.ts`, `adoptionScan.ts`,
  `scan-adoption-quality.mjs` or `ADOPTION-QUALITY.md`. The rubric is kept —
  G8 moves its prose to the reader that survives.
- Narrow `archetypeShapeAudit.ts`'s surviving "should this be an archetype?"
  half or point it at the package's contracts. Inherited from
  `drop-drift-machinery`'s and `docs-retire`'s deferred lists; G5 makes it
  answerable (the contracts now ship) but it is still gated on one repo
  installing.
- Re-version any archetype. Deleting a doc that mirrors shipped code changes
  no deliverable; `version` and `source_spec_version` stand. Only
  `plugin.version` moves (G6).
- Collapse the four package-shipped methodology docs into one. That is
  `docs-retire`'s deferred question and still wants a migrated consumer's
  reading behaviour to answer it.

### Verification

Phase `donor-docs` is done when all of these hold:

1. `ls docs/archetypes/*.baseline.md` finds nothing, and
   `python3 -c "import json;print([a.get('reference_impl') for a in json.load(open('docs/archetypes/MANIFEST.json'))['archetypes']])"`
   prints all `None`.
2. `node scripts/verify-manifest-versions.mjs` **fails** on a manifest with a
   re-added `reference_impl` key and on a re-added `*.baseline.md` file — the
   guard is tested in both directions, not merely absent-passing.
3. `grep -rn 'baseline\.md' docs/ src/ CLAUDE.md README.md _adherence.json`
   returns no live reference outside `docs/backlog/`, `docs/audits/` and this
   spec.
4. `docs/RULES.md` rule 3 is **byte-identical** to its pre-phase text, and no
   contract names a primitive or a Tailwind class:
   `grep -rEn 'src/components/|\bbg-|\btext-(xs|sm|lg|xl)\b' docs/archetypes/*.md`
   finds nothing outside `README.md`.
5. `npm pack --dry-run` lists `docs/archetypes/` — 22 contracts, `MANIFEST.json`,
   `README.md` — and still exactly the four methodology docs, and still no other
   `docs/` path.
6. `node scripts/verify-exports.mjs` still reports **7/7 ok**. Docs are files,
   not exports.
7. `docs/archetypes/MANIFEST.json` `plugin.version` is `0.11.0`, its `actions`
   array names no `/style-*` command, and
   `grep -rn 'style-baseline\|style-archetypes' docs/PLUGIN-CONTRACT.md docs/archetypes/MANIFEST.json`
   is empty.
8. The hub still reports the plugin `connected: true` against this worktree
   after the manifest edit (`designPlugin.ts`'s four validation steps), proving
   G4/G6 did not break the connector.
9. `docs/ADOPTION.md` is gone, the `adoption` entry has left `methodology[]`,
   and both salvaged parts are findable:
   `grep -n 'four gates\|Gate' docs/PACKAGE.md` and
   `grep -n 'Rule of 2\|rule-of-2' docs/PROMOTION-RADAR.md`.
10. `docs/FLEET-AUDIT.md` is gone; `ADOPTION-QUALITY.md` carries the Axis-C
    triage tier and output-schema prose that used to cross-reference it and
    cross-references nothing deleted; `node scripts/scan-adoption-quality.mjs`
    still runs against `docs/audit-signals.json` unchanged.
11. `du -sh docs/audits` is under 100 KB and every surviving file under it is
    cited from a shipped phase's section in this spec or from an ADR.
12. Donor gates unchanged: `npx tsc --noEmit` clean,
    `node scripts/lint-design.mjs` 0 errors, `npm run gallery:build` ok.
    (`npm test` carries the known `Sidebar.test.tsx` jsdom `localStorage`
    failure, unrelated to this phase.)

The class-level acceptance: after this phase, **no artifact in the donor
restates what the shipped code already says**. An archetype has one contract,
one component directory and one demo; a doc that would have to be re-edited
whenever a prop changes does not exist, so it cannot go stale.

### Ticket batch

| ticket | depends_on |
|---|---|
| `archetype-baseline-sibling-retire` | — |
| `package-ships-contracts-and-plugin-actions` | `archetype-baseline-sibling-retire` |
| `fleet-audit-and-adoption-doc-retire` | — |

Three. The first is G2/G3/G4 plus the six located doc-set edits and the
`promote-archetype` change — one ticket because a deletion without the rule
rewrite leaves `RULES.md` mandating a file that no longer exists, and a rule
rewrite without the manifest guard lets the next promotion re-create it. The
second is G5/G6, and it depends on the first because shipping
`docs/archetypes/` before the siblings are gone ships the mirror into every
consumer's `node_modules`. The third is G7/G8/G9/G10 — independent of both,
since it touches no archetype artifact.

### Deferred to the decompose loop

- Whether `docs/archetypes/README.md` should ship in the package at all, or
  whether the consumer-facing half of it belongs in `PACKAGE.md`. It is 22 KB
  of donor methodology (promotion flow, version semantics) with a consumer-facing
  head; splitting it is only worth doing once a consumer has read it.
- Whether the contracts, once package-shipped, should lose their per-archetype
  `version` in favour of the installed tag — the same collapse F6 performed on
  methodology docs. Deferred because `version` still drives the hub's drift
  axis for repos that have not installed, and `drop-drift-machinery` kept that
  axis deliberately.
- Which of the 22 contracts still carry an **Allowed variation** block with no
  keying rule. D1's re-read was scoped to `detail-overview` in p1; the closed
  API makes the rest answerable by reading the props, and a variation the
  component can no longer express is prose describing a design space that is
  gone.
- Whether `ADOPTION-QUALITY.md` survives `fleet-commands`. It is the Axis-C
  rubric's prose home after G8, and its reader is a hub ritual, not a consumer —
  so it is donor-internal by F3's test but not dead.
