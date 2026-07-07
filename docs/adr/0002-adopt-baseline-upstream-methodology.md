# 0002 — Adopt the baseline-upstream methodology docs (selection, placement, stack, adoption)

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

The donor's archetype specs each defer *selection* questions to `docs/CHOOSING-A-SURFACE.md` ("see `docs/CHOOSING-A-SURFACE.md`" appears in `crud-dialog`, `detail-overview`, `list-with-detail`, `matrix-grid`, `tabbed-settings`, `README`). Until now the donor shipped only a **v1-era** CHOOSING-A-SURFACE (the "tiers vs. compose/escalate" framing, no frontmatter) and had **no** companion doc for the three sibling laws that a coherent multi-page app also needs:

- **Placement** — *where* recurring elements go inside a chosen surface. Absent, so placement rules were scattered across individual archetype specs, drifting.
- **Stack** — *which* packages the behavior guarantees rest on. Absent, so a consumer could add a second headless-UI or swap `tw-animate-css` for the Tailwind-3 `tailwindcss-animate` with nothing to catch it.
- **Adoption** — *how* a project takes on the baseline and stays on it. Absent, so "on the baseline" had no definition and no enforcement stack.

A staged package (`docs/baseline-upstream/`), generalized from the hk-crm 360° audit (2026-07), supplied all four as merge-ready docs: CHOOSING-A-SURFACE **v2.0** (restructured into Part 1 entity surfaces / Part 2 collection chooser, pointing at the new PLACEMENT.md), plus net-new PLACEMENT (v1.1), STACK (v1.1), ADOPTION (v1.0). The package README defined the merge; the instruction was to adopt all four with no deviation.

The one non-mechanical question was `_adherence.oxlintrc.json`, referenced by ADOPTION.md/PLACEMENT.md as the baseline's shippable adherence-lint config but never created. Most candidate rules ("exactly one primary action per PageHeader", "RowActionsMenu is the only per-row menu") require AST-aware custom rules oxlint cannot express natively today.

## Decision

**Adopt the four docs as a first-class `methodology` layer of the donor, alongside archetypes.**

- `docs/CHOOSING-A-SURFACE.md` is **replaced** by v2.0; `docs/PLACEMENT.md`, `docs/STACK.md`, `docs/ADOPTION.md` are added. The `docs/baseline-upstream/` staging folder is removed (provenance lives in each doc's revision log and here).
- `docs/archetypes/MANIFEST.json` gains a **`methodology` array** (sibling of `archetypes`) — one entry per doc (`slug`, `kind`, `version`, `status`, `doc`, and `governs` where applicable) — so the methodology layer is machine-discoverable like archetypes. `plugin.version` bumps **0.2.4 → 0.3.0** (new discoverable layer).
- The root `README.md` indexes the four under a **Methodology** subsection; `docs/ARCHITECTURE.md` maps all four and notes the new MANIFEST key.
- `_adherence.oxlintrc.json` is created at repo root as an **honest scaffold**: the rules oxlint *can* express (bare `<h1>`/`<table>`/`<button>` bans via `no-restricted-syntax`, scoped to app `.tsx`) are live as warnings; the rules that need custom tooling are enumerated in a `_candidate_rules_todo` block rather than faked. It grows into real checks as a plugin/codegen lands. **[Superseded by [ADR-0003](0003-adherence-lint-zero-dep-scanner.md): this config never ran — oxlint does not implement `no-restricted-syntax` and rejects the `_`-prefixed keys. Replaced by a zero-dep scanner.]**

## Consequences

- The dangling `docs/CHOOSING-A-SURFACE.md` and (new) `docs/PLACEMENT.md` references the archetype specs already make now resolve, and to the current (v2.0 / v1.1) framing.
- Selection, placement, stack, and adoption are now four separately-versioned, `status: locked` contracts a consuming project inherits — and `CHOOSING-A-SURFACE.md`/`ADOPTION.md` require each project to resolve them into a local `docs/SURFACES.md` and adoption checklist.
- **STACK.md introduces a new ADR trigger:** diverging from a pinned package row (second headless-UI/icon/toast/form library, a major bump, opting a surface out of Radix) now requires an ADR here — the same standard as a RULES.md scar.
- The `methodology` docs carry no primitives or demos and are correctly absent from the `archetypes` array and the gallery; they are cross-archetype law, not page shapes. This is a deliberate second MANIFEST category, not a new archetype (Rule 1 "baseline never originates archetypes" is untouched).
- The adherence lint is real but partial. Gate 2 of ADOPTION.md is only as strong as `_adherence.oxlintrc.json`; the `_candidate_rules_todo` block inside that file is the honest ledger of what still lives in prose (gate 4) until custom oxlint tooling can express it.

## 2026-07-06 amendment — app-frame slot (donor v0.3.1)

A corrected/completed cut of the same handoff bundle landed the same day, refining two of the four docs (the other two, CHOOSING-A-SURFACE and STACK, were byte-identical):

- **`PLACEMENT.md` v1.1 → v1.2** adds *the app frame* as the outermost placement slot: `AppShell` is the single owner of the sidebar/header/content desk (`bg-muted/30 p-4 md:p-6`). A hand-rolled `<main>` with its own padding/background (the `p-8 bg-slate-50` "iframe-feel" scar, origin hk-crm 2026-07) is red, not yellow.
- **`ADOPTION.md` 8 → 9 points** promotes that to adoption **point 1, "Frame adopted"**, and adds the matching `_candidate_rules_todo` entry (no raw `<main>` frame).
- Ripple: `MANIFEST` placement 1.1 → 1.2 and `plugin.version` 0.3.0 → **0.3.1** (a refinement of the 0.3.0 layer, not a new layer); the global `/adopt-baseline` skill's hardcoded checklist updated 8 → 9 points.

This does not change the decision above — it completes it. The app frame was the one placement slot the original cut omitted, and it is the exact drift the audit that produced these docs diagnosed.
