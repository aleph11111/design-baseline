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

**Phase 5 — delete the compensating machinery.** `server/archetypeDrift.ts`,
`server/methodologyAdoption.ts`, most of `server/archetypeShapeAudit.ts`, the
four `MANIFEST.json` forks, the per-file vendor stamps and
`docs/design-baseline-chrome.json` exist only to ask whether copies are still the
same. A package makes the question meaningless. Kept: `docs/promotion-radar.json`
and `/promote-archetype`, the adherence lint, and the LLM audit narrowed to its
one genuine job.

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
