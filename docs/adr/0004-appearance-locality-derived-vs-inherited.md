# 0004 — Appearance locality: global or fixed in the component; per-call-site only when derived

- **Status:** Accepted
- **Date:** 2026-08-17
- **Supersedes:** hk-crm's `docs/adr/0030-vendor-stamp-design-baseline.md` (vendor-stamp-not-package), **on its compiled-CSS skew argument only** — see the Supersession section below.

## Context

The [archetype-convergence roadmap](../backlog/archetype-convergence.md) stated its governing rule as: *a visual choice is either global — a token or context, set once per project — or fixed in the component; never a per-call-site prop.* Contact with the code showed that formulation fails in both directions, and the design spec ([`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md`](../superpowers/specs/2026-08-17-archetype-convergence-design.md)) reformulated it before this ADR recorded it:

- **Too loose.** `headerFill` — the roadmap's own exemplar of the correct shape — shipped a per-instance override prop next to `HeaderFillContext` on `SurfaceHeader`, `SurfaceHeaderSlot`, and `DetailOverviewShell`. A rule whose own exemplar carries the escape hatch it forbids cannot be enforced, and an escape hatch that exists gets used: that is exactly how `surface` broke archetype C.
- **Too strict.** `layout="rail" | "vertical"` is per-call-site, yet the archetype contract carries a decision table keying it to entity profile (dense/transactional/financial entities get the rail, light/early-stage entities stay vertical). An order renders `rail` in hk-crm and `rail` in controlling-app. The literal rule condemns a prop that is not a divergence channel.

The discriminator is not *where the value is passed* but *whether it was derived or inherited*:

| axis | keying rule | outcome |
|---|---|---|
| `surface` | none. Default annotated in-source as *"the v2.0/v2.1 look. Zero churn."* | nobody derived it; nobody chose it — twelve tabs inherited it |
| `layout` | contract decision table keyed to entity profile | two engineers with the same entity derive the same value |

## Decision

**The governing rule is *derived, not inherited*.** This ADR is the single statement of the rule; `docs/RULES.md` hard rule 12 restates it as the enforceable form.

> A visual choice is either **global** — a token, or one of a closed set of project contexts declared once at `<AppShell>` — or **fixed in the component**.
>
> A per-call-site prop is legal **only** if the archetype contract carries a decision rule that determines its value from the entity or its data, such that two engineers holding the same entity derive the same value, and its values are exhaustively enumerated there.
>
> A backwards-compatible default is disqualifying on its own. It means the value was inherited rather than derived, and inheritance is how a whole fleet ends up on a look nobody chose.
>
> An appearance-bearing `ReactNode` slot is a per-call-site appearance prop by another name, and is governed identically.

Three tiers, and the closed context set after Phase 1 has exactly one member:

- **token** — brand: colour, font binding, radius. Declared once per project in `src/styles/tokens.css`.
- **context** — a closed, enumerated set of project-wide axes, set once at `<AppShell>`, with **no override prop**. Membership: `headerFill`.
- **fixed in the component** — everything else.

Context axes carry no override prop. The per-instance `headerFill` overrides on `SurfaceHeader`, `SurfaceHeaderSlot`, and `DetailOverviewShell` are deleted in Phase 1; `<AppShell headerFill=…>` is the only entry point.

**`surface` is deleted rather than promoted to a context.** A container model is structure, not brand: the roadmap's "Done when" requires two projects to differ only by declared brand tokens, and a project-level `surface` context would keep the fleet bimodal one level up. hk-crm never chose `separated` — it inherited the default across all twelve tabs, and only one call site passes `unified`. Deleting the mode removes an unchosen default, not a decision.

**The distribution split:**

- `src/components/ui/` primitives **stay vendored** (shadcn's copy-in model). They are leaves, they do not drift — the fleet's copies are byte-identical — and copy-in is correct for them. *Narrowed* by [`docs/audits/2026-09-07-pkg-ui-vendored-clause-narrowing.md`](../audits/2026-09-07-pkg-ui-vendored-clause-narrowing.md): a project that installs the package and takes any archetype takes `ui/` from the package (via the `./ui/*` exports subpath) and deletes its vendored copies; a project that takes only the shell + tokens layer may still vendor it. The governance of `ui/` (leaf status, no appearance-prop governance) is untouched — the narrowing moves distribution, not governance. See the Amendment 2026-09-07 section.
- `src/components/archetypes/` compositions **ship as a source package**, because every observed divergence is compositional: hk-crm's vendored detail-overview primitives are byte-identical to this donor's, and the page is still wrong, because every divergence lives in how twelve route files fill the slots.

## Supersession of hk-crm ADR-0030

hk-crm's `docs/adr/0030-vendor-stamp-design-baseline.md` (2026-07) rejected package consumption of this donor on two grounds:

1. **No publishable artifact existed here.** Refuted now, against the shipped tree: `package.json` carries an `exports` map with seven subpaths (`./layout`, `./archetypes/*`, `./ui/*`, `./lib/utils`, `./hooks/*`, `./utils/logger`, `./tokens.layer.css`), a `files` scope (`src/components`, `src/lib`, `src/hooks`, `src/utils`, `src/styles`), and `react` / `react-dom` as `peerDependencies` (^19.0.0) — a consumer brings its own React. `node scripts/verify-exports.mjs` reports 4/4 invariants ok. `private: true` is **retained on purpose, not dropped**: the dependency channel is a git dependency against a tag (`v0.2.0` exists), which needs no publish, so the flag costs nothing and blocks an accidental publish of a private donor. The objection is discharged; the paragraph is the shipped-state record of that, replacing the original text's prediction that the discharge would come from a later phase.
2. **A compiled-CSS package is wrong in principle** — the consumer's compiled bundle and the donor's `tokens.css` drift into version skew.

This ADR supersedes ADR-0030 **on ground 2 only**. The skew argument holds for a package shipping *compiled CSS*, and is void for a source-distributed package shipping none: its `exports` point at `.tsx`, and the consumer's own Tailwind 4 build scans it via `@source` and compiles every class itself. No compiled artifact exists on either side, so nothing can skew. What changes on a version bump is source the consumer was already recompiling — not a prebuilt bundle going stale against a new token sheet.

## Amendment 2026-09-06 — a `kind: "component"` archetype is governed, not a leaf

The [archetype-convergence-component-kind-appearance-gap](../backlog/wip/archetype-convergence-component-kind-appearance-gap.md) ticket surfaced the third category this ADR never named: a MANIFEST `kind: "component"` entry. It is a leaf in the sense that a page shell is not — a molecule with no slots, no data-fetching surface, no page of its own — but it lives under `src/components/archetypes/`, promoted as a shipped entry, not vendored under `src/components/ui/`. The ADR's exemption for `ui/` leaves ("They are leaves, they do not drift") is **directory-scoped and does not extend to this category**: the exemption exists because the `ui/` copies are byte-identical across the fleet and never ship; a component-kind archetype *does* ship (it is in the source-package distribution layer), and a shipped prop is API.

So the classification is: **a `kind: "component"` archetype is governed prop-by-prop by the same derived-vs-inherited test the page-shell compositions face.** It gets no leaf exemption and no composition leniency; the test simply runs per prop, and a prop whose value the contract keys to the entity or its data is legal on a molecule exactly as on a shell.

The first application, on the two component_kind entries of the appearance-prop audit:

- `entity-circle`'s `tone` ("muted" | "primary") **passes** — its contract (L7) keys it to the entity's identity role: the brand fill is reserved for the signed-in entity rendered in the account/identity context; every other entity is neutral. Two engineers holding the same entity derive the same value. The prop stays; the contract records the keying rule (minor version).
- `overline-typed`'s `tone` ("muted" | "foreground" | "primary" | "inverted") **fails** — the contract states the label conveys *emphasis, not meaning*, and emphasis is a per-page judgement: no rule derives a tone from the entity or its data, and the set sits behind a backwards-compatible default. The prop is deleted; the color is locked into the base signature, the accent-surface recolor belongs to the surface's own context/binding, and the one-off per-site color rides the documented `className` leaf channel (major version).

A later reader classifies a new `kind: "component"` entry without re-deriving this call: shipped means governed; the test is per prop; a contract keying rule is what makes a prop legal.

## Amendment 2026-09-07 — the `ui/` distribution clause is narrowed, not reversed

The `pkg` phase shipped `src/components/ui/` *in* the source package (the `./ui/*` exports subpath plus the `files` scope). From the first package-consuming project onwards, `ui/` is no longer a copy-only layer: it has one source of truth in the donor, and a consumer that takes any archetype deletes its vendored copies and points its `@/components/ui/*` alias at `node_modules/design-baseline/src/components/ui/*`. The vendored-copy model stays alive only for projects that take the shell / tokens but never an archetype (the package's 141 archetype→ui edges mean archetype consumption ships `ui/` with it). The full record is [`docs/audits/2026-09-07-pkg-ui-vendored-clause-narrowing.md`](../audits/2026-09-07-pkg-ui-vendored-clause-narrowing.md).

In kind the original rationale survives and weakens in force: byte-identical copies become byte-identical dependencies (the drift the ADR neutralised is now structurally impossible — there is one copy); the leaf / governance status of `ui/` is untouched by the narrowing, which moves distribution, not governance; and the `cp -R` copy channel is not retired — it coexists with the package channel through the migration overlap until the last vendored project migrates off it.

Not a reversal and not a new ADR — the ruling (appearance locality: derived, not inherited) is untouched. If the fleet's last vendored consumer migrates off the copy channel, the original bullet can then be retired outright by an amendment of its own.

## Consequences

- `docs/RULES.md` gains hard rule 12 (the enforceable restatement of this rule, including the closed context set).
- Every other `archetype-convergence-*` ticket is graded against this ADR; the roadmap's original "never a per-call-site prop" phrasing is retired in its favour.
- Enforcement reuses the ADR-0003 zero-dep scanner: the appearance-prop rules land at `severity: "warn"` and each archetype flips them to `error` as it closes. The *inherited-default* check (a prop whose default the contract does not state) is deliberately not expressible as a rule in that scanner and stays a contract-close review step.
- Supersession of hk-crm ADR-0030 is partial and named: its skew argument is dead, and its no-artifact objection is discharged by the shipped `pkg` phase (see the supersession section's ground-1 record).
