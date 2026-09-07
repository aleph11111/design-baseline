---
area: archetypes
kind: roadmap
opened: '2026-08-17'
status: active
spec: docs/superpowers/specs/2026-08-17-archetype-convergence-design.md
scope:
  - archetype-convergence-*
tickets:
  - archetype-convergence-phase0-appearance-locality-decision
  - archetype-convergence-nested-heading-primitive
  - archetype-convergence-detail-overview-close-api
  - archetype-convergence-appearance-prop-lint
  - adherence-lint-union-prop-blind-spot
  - analytics-dashboard-column-span-props-unclosed
  - entity-circle-size-prop-appearance-locality-gap
  - adherence-lint-alias-rule-size-noun-gap
  - adherence-lint-warn-to-error-ratchet
  - adherence-lint-closed-folder-allowlist-gap
phases:
  - name: p0
    title: Appearance-locality rule as ADR-0004 + RULES hard rule 12
    tickets:
      - archetype-convergence-phase0-appearance-locality-decision
    open: false
    spec_anchor: '## The governing rule'
  - name: p1
    title: Close detail-overview API + Mode B nested-heading primitive
    tickets:
      - archetype-convergence-nested-heading-primitive
      - archetype-convergence-detail-overview-close-api
    open: false
    spec_anchor: '## Closing detail-overview'
  - name: lint
    title: Appearance-prop adherence rules scoped to the archetype layer
    tickets:
      - archetype-convergence-appearance-prop-lint
    open: false
    spec_anchor: '## Enforcement'
  - name: warn-drain
    title: Drain the warn-level hits across the remaining archetype shells
    tickets:
      - archetype-convergence-crud-dialog-close-api
      - archetype-convergence-form-page-width-prop
      - archetype-convergence-list-with-detail-close-api
      - archetype-convergence-settings-table-close-api
      - archetype-shell-classname-drop
      - adherence-lint-union-prop-blind-spot
      - analytics-dashboard-column-span-props-unclosed
      - entity-circle-size-prop-appearance-locality-gap
      - adherence-lint-alias-rule-size-noun-gap
      - adherence-lint-warn-to-error-ratchet
      - adherence-lint-closed-folder-allowlist-gap
    open: false
  - name: pkg
    title: Consumable source package — exports map, no compiled CSS
    tickets: []
    open: true
    spec_anchor: '## Phases 2–5 — design level only'
  - name: token-split
    title: Split tokens.css into package-owned base and project-owned brand layers
    tickets: []
    open: true
    spec_anchor: '## Phases 2–5 — design level only'
  - name: consumer-migration
    title: Migrate hk-crm /companies/[id] onto the packaged archetype
    tickets: []
    open: true
    spec_anchor: '## Phases 2–5 — design level only'
  - name: drop-drift-machinery
    title: Delete the copy-comparison drift and adoption machinery
    tickets: []
    open: true
    spec_anchor: '## Phases 2–5 — design level only'
  - name: docs-retire
    title: >-
      Retire World A docs in each migrated consumer: eight methodology docs, adoption-plan, three
      JSON configs, docs/archetypes/, vendor stamps, design:/patterns: Doc Paths keys; keep
      _adherence lint
    tickets: []
    open: true
  - name: donor-docs
    title: >-
      Collapse donor spec + .baseline.md pairs into one doc per closed archetype; rewrite
      ADOPTION.md for package consumption; point PLUGIN-CONTRACT actions at the package install;
      retire FLEET-AUDIT.md and the audit reports into promotion-radar.json
    tickets: []
    open: true
  - name: fleet-commands
    title: >-
      Delete /adopt-baseline, /style-baseline, /style-archetypes from ~/.claude/commands and
      fleet/commands; keep /promote-archetype
    tickets: []
    open: true
---

# Archetype convergence — close the archetype API, then distribute it as a package

## Context

The stated requirement is that two projects using the same archetype look like
one application — a table in hk-crm and a table in controlling-app are the same
table. Today they are not, and the enforcement apparatus built to make them so
(`server/archetypeDrift.ts`, `archetypeShapeAudit.ts`, `moleculeAudit.ts`,
`methodologyAdoption.ts` in the dashboard; `docs/ADOPTION.md`'s four gates and
`docs/audit-signals.json`'s tripwires here) measures adoption paperwork rather
than appearance. It cannot close the gap because the gap is architectural, not
observational.

Two independent defects produce it, and they must be fixed in this order.

**1. Archetype components expose appearance as per-call-site props.**
`DetailOverviewShell` takes `header?: React.ReactNode`, `stats?: React.ReactNode`
and `surface?: "separated" | "unified"` — the last defaulting to `"separated"`,
annotated in-source as *"the v2.0/v2.1 look. Zero churn."* That default is why
archetype C is permanently bimodal. In hk-crm only
`src/app/(app)/companies/[id]/page.tsx:132` passes `surface="unified"`, so the
Übersicht tab renders the framed `bg-primary` header bar and its eleven sibling
tabs render a bare one. Both are legal under the contract. The same slot freedom
produces nine hand-typed `<h2 className="text-lg font-…">` sub-tab headings
(seven `font-medium`, two `font-semibold`) because the contract defines a
"Mode B — nested" header layer that no primitive implements —
`DetailOverviewHeader.tsx` exists and no company sub-tab imports it. Five of
twelve tabs render a KPI strip, in two structurally different primitives
(`StatTileRow` vs `MetricList`). None of this is drift from the archetype; it is
the design space the archetype leaves open.

**2. Archetypes are distributed by copy.** `/style-archetypes` and
`/style-baseline` `cp -R` the primitives and contracts into each consumer, so
there is no propagation path for an upstream change. Four forked archetype
corpora now exist (`hk-crm`, `controlling-app`, `mistra`, `brickshop-manager`
each carry their own `docs/archetypes/MANIFEST.json`); brickshop sits at
`detail-overview@2.5` against the donor's `2.19` and `crud-dialog@1.7` against
`2.1`; mistra's `detail-overview.md` differs from the donor's by 156 lines.
`docs/design-baseline-chrome.json` — one hand-bumped number standing in for the
whole 44-component shell — has moved ten times against 39 commits touching
`src/components/` and `src/styles/` since June, and hk-crm's per-file vendor
stamps disagree with it (41 files stamped `design-baseline@0.1.0`, 49 stamped
`@0.10.0`).

The ordering matters and is easy to get backwards. hk-crm's vendored
detail-overview primitives are **byte-identical to this donor's** — the only
difference is a `"use client"` line and the stamp comment. The code is already
perfectly in sync and the page is still wrong, because every divergence lives in
how twelve route files fill the slots. Publishing a package first would fix
propagation of the layer that is not broken. Closing the API first fixes what is
actually visible; distribution then makes the fix reach everyone.

hk-crm's `docs/adr/0030-vendor-stamp-design-baseline.md` rejected package
consumption in 2026-07 on two grounds: that no publishable artifact exists, and
that `docs/STACK.md`'s "compiled-CSS version skew" makes a package wrong in
principle. The first is a solvable packaging task. The second only holds for a
package shipping **compiled CSS**; a source-distributed package whose `exports`
map points at `.tsx` and whose consumer's own Tailwind 4 build scans it via
`@source` has no skew, because the consumer still compiles every class itself.
This roadmap supersedes that ADR on the second point and takes the first as
Phase 2's work.

## Phases

### Phase 0 — Record the decision

- [ ] Write an ADR here superseding hk-crm ADR-0030's package rejection, stating
      the split this roadmap adopts: **`src/components/ui/` primitives stay
      vendored** (they are leaves, they do not drift — the fleet's copies are
      byte-identical — and shadcn's copy-in model is correct for them), while
      **`src/components/archetypes/` compositions ship as a source package**,
      because every observed divergence is compositional.
- [ ] State the governing rule in `docs/RULES.md` as hard rule 12 and record
      it as [ADR 0004](../adr/0004-appearance-locality-derived-vs-inherited.md)
      — the ADR is the single statement of the rule; the roadmap's original
      formulation of Phase 0 does not survive contact with the code in either
      direction, and the design spec records why and what it is replaced by.
      `headerFill` already models the correct shape (`HeaderFillContext`, set
      once via `<AppShell>`); `surface` is the counterexample that broke
      archetype C.

### Phase 1 — Close the archetype API

- [ ] Retire per-call-site appearance props across
      `src/components/archetypes/`. For `detail-overview`: move `surface` to
      project-level context alongside `headerFill`, and delete the
      `surface = "separated"` "zero churn" default — a backwards-compatible
      visual default is what makes an archetype permanently bimodal.
- [ ] Ship the missing Mode B nested-header primitive the contract's Layer 3
      already specifies, so a sub-tab heading is a component call rather than a
      hand-copied className. This is the structural form of the fix
      `hk-crm/docs/backlog/archetype-rollout-mode-b-header-weight-inconsistency.md`
      already prescribes for itself.
- [ ] Decide per archetype whether the `stats` slot is required, forbidden, or
      inherited from the parent route, and encode that decision in the component
      rather than in contract prose.
- [ ] ? Audit the remaining twenty archetypes for the same class of prop and
      close them, in MANIFEST order.

### Phase 2 — Make the donor a consumable source package

- [ ] Give `package.json` an `exports` map over `src/components/archetypes/`
      (and the layout primitives the archetypes depend on), drop `private: true`,
      and ship **no compiled CSS** — that omission is what defeats ADR-0030's
      skew objection.
- [ ] Document the consumer-side `@source` directive so the consumer's own
      Tailwind 4 build scans the package's `.tsx` and compiles every class
      itself.
- [ ] ? Choose the distribution channel — git dependency against a tag versus a
      private registry. A git dependency needs no publish infrastructure and is
      the cheaper first move.

### Phase 3 — Split the token layer

- [ ] Split `src/styles/tokens.css` into a package-owned base layer and a
      project-owned brand layer, so a consumer overrides brand colour, font
      binding and radius without hand-editing a file the donor also owns. The
      current single file is why `hk-crm` diverges 132 lines (legitimately — it
      binds `--font-sans` through `next/font`), `brickshop-manager` diverges 158
      and carries no font tokens at all, and `controlling-app`, `mistra`,
      `my-finance-app` and `pmo` carry no `tokens.css` whatsoever.
- [ ] Verify the split delivers the operator-facing goal: changing
      `--font-sans` in the donor reaches every consumer through a version bump
      rather than a manual re-vendor.

### Phase 4 — Migrate consumers, one at a time

- [ ] Migrate hk-crm's `/companies/[id]` first as the proof case — twelve route
      files each independently composing `DetailOverviewShell` collapse to one
      composition with per-tab data.
- [ ] Then the remaining hk-crm archetypes, then `controlling-app`, `mistra`,
      `brickshop-manager`.
- [ ] Make divergence loud where it is genuinely needed: a consumer that must
      differ forks a component **out** of the package explicitly, visible in its
      imports — never by silently editing a vendored copy.

### Phase 5 — Delete the compensating machinery

- [ ] Retire what exists only to ask "are these copies still the same":
      `server/archetypeDrift.ts`, `server/methodologyAdoption.ts`, most of
      `server/archetypeShapeAudit.ts`, the per-project archetype doc corpora and
      their four `MANIFEST.json` forks, the per-file vendor stamps, and
      `docs/design-baseline-chrome.json`.
- [ ] Keep what does real work: `docs/promotion-radar.json` and
      `/promote-archetype` (discovering that two projects share a pattern worth
      hoisting), the adherence lint, and the LLM audit narrowed to its one
      genuine job — *this page does something no archetype covers, should it be
      one?*

### Phase 6 — Retire consumer docs

- [ ] Delete the eight vendored methodology docs, the adoption-plan doc, and
      the three JSON configs from each migrated consumer. After a package
      install, "adopted" is a version in `package.json`, so the nine-point
      ADOPTION-STATUS checklist, `SURFACES.md`, and the six vendored contracts
      have no reader left.
- [ ] Delete each consumer's `docs/archetypes/` corpus and its `MANIFEST.json`
      fork.
- [ ] Delete the per-file vendor stamps.
- [ ] Remove the `design:`/`patterns:` `## Doc Paths` keys once nothing reads
      them; keep the `_adherence` lint.
- [ ] `brickshop-manager`'s `docs/archetypes/` is a pre-donor lineage (its own
      ADR-0030, April 2026) — archive it to `docs/archive/archetypes-2026/` on
      its migration, not delete it.

### Phase 7 — Donor docs

- [ ] Collapse each closed archetype's donor spec + `.baseline.md` pair into
      one doc.
- [ ] Rewrite `ADOPTION.md` for package consumption.
- [ ] Point `PLUGIN-CONTRACT` actions at the package install.
- [ ] Retire `FLEET-AUDIT.md` and the audit reports into
      `promotion-radar.json`.

### Phase 8 — Fleet commands

- [ ] Delete `/adopt-baseline` from `~/.claude/commands` and `fleet/commands`.
- [ ] Delete `/style-baseline` from `~/.claude/commands` and `fleet/commands`.
- [ ] Delete `/style-archetypes` from `~/.claude/commands` and `fleet/commands`.
- [ ] Keep `/promote-archetype`.

## Done when

- Two projects rendering the same archetype are visually identical apart from
  their declared brand tokens, and no per-call-site prop can change that.
- Changing `--font-sans` in this donor reaches every consumer through a version
  bump, with no manual re-vendor and no per-project diff triage.
- `docs/archetypes/MANIFEST.json` exists once, here, and no consumer carries a
  fork of it.
- hk-crm's `archetype-rollout` ticket rate falls to zero for the closed
  archetypes — the class is gone, not patched. Eighty-nine such tickets have
  been filed and archived against that repo, forty-eight of them in August 2026
  alone, and the class-level acceptance is that no further ticket of that shape
  can be filed for any archetype whose API is closed.
- No consumer repo carries a vendored methodology doc or an archetypes/
  folder; the donor's docs/ is under 250 KB.

## Related

- [decouple-archetype-contract-from-reference-impl.md](archive/decouple-archetype-contract-from-reference-impl.md)
  — shipped the contract/`.baseline.md` split this roadmap partly retires: once
  the archetype is a closed component, its props are the contract.
- [style-archetypes-methodology-distribution.md](archive/style-archetypes-methodology-distribution.md)
  — built `/adopt-baseline`, the governance-copy layer Phase 5 retires.
- [style-baseline-components-json-package-root.md](archive/style-baseline-components-json-package-root.md)
  — a representative copy-distribution bug: a mis-resolved `cp` destination that
  shipped to a consumer's `origin/main` and had to be removed by hand.
- ADR-0003 — adherence lint ships as a zero-dep scanner; the lint Phase 5 keeps.
- hk-crm ADR-0030 — vendor-stamp-not-package; superseded on its skew argument by
  Phase 0.
- The coding-dashboard child for Phase 5 deletions is filed as
  `dashboard-drop-drift-machinery` in coding-dashboard's backlog.
