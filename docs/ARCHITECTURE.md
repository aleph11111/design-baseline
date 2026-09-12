# Architecture

This is an initial architecture map for the design-baseline donor, drafted from a survey of the repo (not exhaustive — flagged where uncertain). See `docs/archetypes/README.md` and `docs/PLUGIN-CONTRACT.md` for the primary-source detail this summarizes.

## 1. What this repo is, and isn't

`design-baseline` is **donor source, not a buildable app**. There is no app entry point that renders the baseline itself in production — `src/` exists to be *copied* into target projects (manually, or via `/style-baseline` + `/style-archetypes`). The only thing this repo builds and runs on its own is the **gallery** (`gallery/`), a donor-dev harness that mounts every archetype demo behind a nav so the baseline can be browsed and, separately, iframed by the dashboard hub as a "design plugin" surface.

Two independent verification paths, both donor-only (never copied to targets):
- `npx tsc --noEmit` — strict TypeScript (`noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`) against `src/**/*` (examples' Next/Vite demo wiring excluded via `tsconfig.json`).
- `npm test` (Vitest + jsdom + Testing Library) — component tests co-located as `*.test.tsx` guarding shared primitives (e.g. `SurfaceHeader`, `CrudDialogFooter`, `SegmentedControl`).

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Build (gallery only) | Vite 6 + `@vitejs/plugin-react` | `vite.config.ts`, `root: "gallery"`, relative base + hash routing so the built gallery is mountable at an arbitrary iframe subpath |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) | CSS-first config; no `tailwind.config.ts`. Tokens in `src/styles/tokens.css` (brand, per project) + `src/styles/tokens.layer.css` (donor-owned layer) |
| UI primitives | shadcn/ui via `components.json` (style `default`, base color `slate`, RSC-aware) | 44 primitives in `src/components/ui/` |
| Framework (donor typecheck) | React 19, TypeScript 5.6 (strict) | React/react-dom are **devDependencies only** — donor typechecking; targets pin their own |
| Testing | Vitest 4 + jsdom + `@testing-library/react` | Separate `vitest.config.ts` (repo-root scoped) from `vite.config.ts` (gallery-scoped) |
| Forms / icons / toasts | react-hook-form + zod, lucide-react, sonner (the only toast runtime) | Per `docs/STYLE.md` |
| Typography | IBM Plex Sans (prose) / IBM Plex Mono (`font-mono tabular-nums` for figures) | "Plex Ledger" house style, `docs/STYLE.md` |

`package.json`'s `designBaseline.notes` block is explicit about scope creep guardrails: `vite`/`@vitejs/plugin-react`/`@tailwindcss/vite`/`react-router-dom` are donor-dev-only (power the gallery, never copied); `vitest`/testing-library/`jsdom` are donor-dev-only (run the donor's own tests, never copied); charts, auth, and data-fetching libraries are deliberately absent from the baseline.

## 3. Component map

| Path | What it is |
|---|---|
| `src/styles/tokens.css` | Brand token file — the `:root` / `.dark` HSL palette (light + dark) + `--radius`; the project-owned re-skin surface; imports the donor-owned layer below |
| `src/styles/tokens.layer.css` | Donor-owned token layer — the Tailwind 4 entry + `@theme` roles / keyframes, re-applied (overwritten) by `/style-baseline --force`; shipped as the `./tokens.layer.css` package export |
| `src/lib/utils.ts` | `cn()` |
| `src/hooks/` | `use-mobile.ts` (`useIsMobile`, required by `ui/sidebar.tsx`) |
| `src/utils/logger.ts` | console logger — `logger.debug` (gated on `NODE_ENV !== "production"`) + `info`/`warn`/`error` pass-throughs; framework-agnostic. Not an archetype and carries no per-file version: it is plain copy-source, and the invariant that governs it is **the donor surface must be a superset of what the fleet calls** (see §3a) |
| `src/components/ui/` | 44 shadcn/ui primitives (button, dialog, table, sidebar, form, sheet, command, calendar, segmented-control, state-view, cell-input, confirmation-dialog, icon-avatar, search-input, color-field, file-field, …) |
| `src/components/layout/` | App-shell layer: `AppShell`, `AppSidebar`/`Sidebar` (+ `NavItem`/`NavGroup` types), `AppHeader`, `PageHeader`, `SectionHeading`, `SectionCard`, `SurfaceHeader` (+ `headerFill` context/classes), `StatTile`/`StatTileRow`, `ProgressTracker`, `MetricList`, `AuthCard`, `SectionNavShell`, `BottomNav`, `ThemeToggle` |
| `src/components/archetypes/<slug>/` | Reference primitives per shipped archetype (one dir each; 21 registered in MANIFEST — see §4). Plus a non-archetype `shared/` dir (`RowActionsMenu`, `interactiveRow`) holding primitives reused across archetypes — correctly absent from MANIFEST |
| `src/examples/<slug>-demo.tsx` | Sandbox demo per archetype — the "generic-ness contract" proving the primitive has zero domain-type leakage. Donor-dev only, **never copied** to targets |
| `src/examples/DemoNextApp.tsx` / `DemoViteApp.tsx` | Reference wiring for Next.js 16 App Router / Vite + React Router 7 consumers |
| `gallery/` | Donor-dev Vite app (`Gallery.tsx`, `registry.ts`, `layout-demos.tsx`) that mounts every demo behind a nav; also the buildable `gallery-dist/` surface the dashboard hub iframes per `docs/PLUGIN-CONTRACT.md` |
| `docs/archetypes/MANIFEST.json` | Versioned registry: `plugin` block (hub-binding metadata + declared actions), `namespaces`, the `archetypes` array (key, slug, version, promoted_from/promoted_at, source_spec_version, spec, primitives_dir, example), and the `methodology` array (the cross-archetype methodology docs: slug, version, status, doc, governs) |
| `docs/archetypes/<slug>.md` | Stack-agnostic **contract** per archetype (see §5) |
| `docs/archetypes/README.md` | The methodology: layer sets, phases, Rule of 2, promotion contract, versioning rules |
| `docs/STYLE.md` | Tokens, spacing/rhythm scale, typography, re-skin checklist, ownership-boundary statement |
| `docs/TAXONOMY.md` | Canonical vocabulary (Baseline / Token / Layout primitive / Archetype / Reference primitive / Demo / Gallery / Plugin) |
| `docs/CHOOSING-A-SURFACE.md` | **Methodology** (v2.0) — surface *selection*: the entity CRUD ladder (token → row → dialog → pane → page), the create/edit (J vs B) and read/detail (A vs C) spectrums, and the Part 2 collection/overview chooser. Every archetype spec defers to it; each project resolves it into a local `docs/SURFACES.md` |
| `docs/PLACEMENT.md` | **Methodology** (v1.2) — *placement*: what goes where, from the outermost app frame (`AppShell` owns the desk — a hand-rolled `<main>` is the iframe-feel scar) down to each recurring slot (title, primary action, search, count, per-row menu, footer order) → its single owning primitive; green/yellow/red enforcement grid |
| `docs/STACK.md` | **Methodology** (v1.1) — the pinned package contract (React 19, Tailwind 4, Radix, RHF+zod, …) + known trip points; diverging from a contract row requires an ADR |
| `docs/PACKAGE.md` | **Package consumption** — install the baseline as a git source package: the four wiring lines, the six-step vendored-consumer migration runbook, and the four-gate enforcement stack (gate 2 ships as the zero-dep `scripts/lint-design.mjs` + `_adherence.json` at repo root) |
| `docs/PLUGIN-CONTRACT.md` | What makes this repo a hub-connectable "design-plugin" (MANIFEST `plugin` block + buildable gallery surface) |
| `docs/STYLE.md` "The fleet audit rubric" + `docs/audits/*.md`/`.json` | The read-only fleet sweep's rubric (Axis A/B + fit + triage) and its dated per-run reports, scored against archetype contracts; the machine form is `docs/audit-signals.json` |
| `docs/ADOPTION-QUALITY.md`, `docs/PROMOTION-RADAR.md`, `docs/DETAIL-PAGE-TEARDOWN-PLAYBOOK.md` | Supporting audit axis (adopted-but-not-torn-down pages), a rule-of-2 candidate radar, and a stack-agnostic teardown-first adoption playbook. Skimmed, not deeply read — treat as living/audit-machinery docs |
| `.design-sync/` | Appears to sync component previews + fonts for a `claude.ai/design` integration (`config.json`, `previews/*.tsx`, `fetch-fonts.mjs`, `build-pkg.mjs`). **Uncertain** — not fully explored; distinct from the gallery/hub plugin path |
| `docs/superpowers/specs/2026-05-22-archetype-promotion-design.md`, `docs/superpowers/plans/2026-05-22-archetype-promotion-implementation.md` | Design spec + implementation plan that originated the whole archetype layer |
| `docs/backlog/` | Open root tickets + a `wip/` (in-flight) and `archive/` (resolved) subdir; `docs/backlog/README.md` is the ticket frontmatter schema authority `/ticket` reads (canonical `area` list, `gate` block, optional `kind`/`model` fields) |

### 3a. How leaf utils version (they don't — they carry a superset invariant instead)

`src/utils/` and `src/lib/` hold framework-agnostic leaf files with no gallery demo and no
page-shape contract. They are **not** archetypes: no MANIFEST entry, no `<slug>.md`
contract, no per-file version. `MANIFEST.plugin.version` is not their version
either — per `docs/PLUGIN-CONTRACT.md` it versions the *hub contract shape*, not shipped content.

What governs them instead is a one-line invariant, because `/style-baseline` step 4 copies these
files over a target's existing copy unconditionally (`cp "$BASELINE/src/utils/logger.ts" …`):

> **The donor's exported surface for a copy-source util must be a superset of what the fleet
> already calls.** Narrowing it doesn't deprecate a downstream call site — it breaks it on the
> next `/style-baseline --force`.

That is why `logger` carries `info`/`warn` despite having no donor call site: `brickshop-manager`
does (14 `logger.info` + 5 `logger.warn` as of 2026-08-27), and the donor is the file's owner.
Widening a leaf util is cheap; a downstream typecheck break is not. See
`docs/backlog/archive/promote-logger-to-archetype.md` for the decision record.

## 4. The 21 shipped archetypes (per `MANIFEST.json`)

| Key | Slug | Kind | Promoted from |
|---|---|---|---|
| A | list-with-detail | page | brickshop-manager |
| B | form-page | page | hk-crm |
| C | detail-overview | page | hk-crm |
| D2 | settings-table | page | brickshop-manager |
| J | crud-dialog | dialog | brickshop-manager |
| K | grouped-list | page | hk-crm |
| M | matrix-grid | page | hk-crm |
| F2 | tabbed-settings | page | brickshop-manager |
| G | analytics-dashboard | page | fleet-audit-2026-06-13 (multi-source) |
| W | import-wizard | page | fleet-audit-2026-06-13 (multi-source) |
| H | feed-inbox | page | fleet-audit-2026-06-13 (multi-source) |
| P | kanban-board | page | fleet-audit-2026-06-13 (multi-source) |
| R | report | page | baseline-authored — sanctioned exception ([ADR 0001](adr/0001-grandfather-authored-report-calendar.md)) |
| Cal | calendar | page | baseline-authored — sanctioned exception ([ADR 0001](adr/0001-grandfather-authored-report-calendar.md)) |
| Sk | skeleton-loader | component | brickshop-manager (fleet synthesis; hk-crm, controlling-app) |
| I | raw-input | component | fleet synthesis (controlling-app, my-finance-app, mistra, dashboard, brickshop-manager) |
| T | raw-textarea | component | brickshop-manager (fleet synthesis; dashboard, controlling-app, my-finance-app, mistra, hk-crm, pmo) |
| S | raw-select | component | fleet synthesis (mistra, my-finance-app, dashboard, brickshop-manager, controlling-app) |
| O | overline-typed | component | (see MANIFEST) |
| Sg | segmented-toggle | component | (see MANIFEST) |
| E | entity-circle | component | fleet synthesis (brickshop-manager, mistra) |

`Sk` (skeleton-loader), `I` (raw-input), `T` (raw-textarea), `S` (raw-select), `O` (overline-typed), `Sg` (segmented-toggle), and `E` (entity-circle) are the **component**-kind archetypes — molecules reused across page archetypes rather than page shapes of their own. The `flow` kind remains **deferred** (no baseline archetypes yet; formalized once two projects independently need the shape, per Rule of 2).

## 5. The contract and its binding

An archetype is **one contract plus the exported component** (the stack-specific reference-implementation sibling docs were retired — a closed archetype's props are the binding, and a second doc restating shipped code is a mirror that drifts):

- `docs/archetypes/<slug>.md` — the **contract**: every required/forbidden/allowed-variation rule expressed by *role* ("the top-level app shell", "the canonical page-title type style"), never a concrete component or Tailwind class. Portable to any stack.
- `src/components/archetypes/<slug>/` — the **binding**: the shipped, typed export of the concrete baseline primitives (`design-baseline/archetypes/<slug>` in `package.json` exports). A closed archetype's props are the API; the sandbox demo (`src/examples/<slug>-demo.tsx`) renders them live in the gallery.

`MANIFEST.json` records the contract (`spec`) and the primitives (`primitives_dir`) per entry. The contracts are the fleet fit/drift audit's comparand (the rubric in `docs/STYLE.md`): adoption is scored against the role-only contract, independently of which stack a repo's primitives come from.

Each page-kind archetype covers **12 layers** (route config → page shell → header → toolbar → content wrapper → table/grid → states → data fetching → types → mutations → mobile → permissions); dialog-kind archetypes (currently just `crud-dialog`) extend to **15** (+ mode contract, footer contract, cross-context invocation). Two independent version counters exist per archetype and are expected to diverge: the spec's frontmatter `version:` (contract changes only) and the MANIFEST entry's `version:` (any shipped change — contract, primitives, demo, or blueprint); the deliverable version always runs ≥ the spec version.

## 6. Promotion flow (source project → donor)

```
Source project (e.g. brickshop-manager)
  Phase 1 Scope lock → Phase 2 Audit → Phase 3 Spec (locked, versioned) → Phase 4 Migration (≥1 page live)
                                    │
                                    ▼
                     /promote-archetype <slug> [--update] [--source <path>]
                       1. Maturity gate check (spec status=locked or governing ADR; version ≥ v1;
                          --force-promote required, and must be explicitly added to the skill, to override)
                       2. De-source-ification (strip domain types/routes/brand, generic names)
                       3. Layer-by-layer review (12 or 15 questions, accept/edit/reject each)
                       4. Sandbox second-consumer demo, domain-far nouns, types written first
                       5. Write donor files: contract, primitives, demo, MANIFEST entry
                                    │
                                    ▼
                     docs/archetypes/<slug>.md + src/components/archetypes/<slug>/
                     + src/examples/<slug>-demo.tsx + MANIFEST.json entry
                                    │
                                    ▼
                     Target projects: /style-baseline (chrome) → /style-archetypes [<slug>] (page shapes)
```

`--update` diffs each layer between an advanced source spec and the current baseline, triaging each difference as generic-improvement (propagate), project-specific (stays in source), or spec-correction (propagate), then bumps versions and the MANIFEST.

**Known gap (see the skill's own Notes):** `promote-archetype.md` was written when the donor was an unversioned directory; it still writes docs/MANIFEST directly rather than inside a `/feat` worktree, which the `block-main-checkout-tracked-write` hook will now reject on the primary checkout. The skill has not yet been rewired for this — flagged as a TODO in the skill file itself, not yet resolved.

## 7. Downstream consumption

- **`/style-baseline`** — detects target stack (Next vs Vite), copies tokens/utils/hooks/utils/ui/layout + `components.json`, installs deps, prints re-skin next-steps. Owns the sidebar/header *behavior*; nav *content* stays project-owned (see README "Ownership boundary").
- **`/style-archetypes [<slug>] [--list|--update|--force]`** — requires `/style-baseline` first. Copies the contract + reference-impl pair + primitives per archetype; merges `MANIFEST.json` by `slug` (never touches non-`baseline`-namespace/project-local entries); copies the framework `README.md` only when the target has none or it's byte-identical (a diverged target README is left alone, donor's copy dropped as `README.donor.md`). Sandbox demos are never copied.
- **Dashboard hub binding** — the hub (a separate managed project) treats this repo as a `design` plugin per `docs/PLUGIN-CONTRACT.md`: it validates `MANIFEST.json` has a `plugin` block, serves the built `gallery-dist/` (`npm run gallery:build`), and maps declared `actions` (`adopt-baseline`, `adopt-archetype`, `iterate-baseline`) to its own machinery. Connection is optional and path-configured — the hub degrades gracefully if disconnected.

## 8. Fleet audit system

The rubric in `docs/STYLE.md` ("The fleet audit rubric") defines a read-only, per-project scanner that classifies every route against the archetype set (fit score), flags `adopted` vs `hand-rolled` vs `gap`, and — per `docs/ADOPTION-QUALITY.md` (Axis C) — separately checks whether an "adopted" page actually removed the legacy content the archetype subsumes (vs. wrapping old furniture in a new shell). Dated snapshots live in `docs/audits/`, which keeps only reports cited by a shipped phase; retired sweeps' unpromoted rows are folded into the radar. `docs/PROMOTION-RADAR.md` tracks hand-rolled patterns trending toward a rule-of-2 promotion candidacy. The Axis-C (adoptionQuality) tripwires have a recurring machine consumer the other two axes get from the dashboard's `moleculeAudit`: the donor's zero-dep `scripts/scan-adoption-quality.mjs` (`npm run scan:adoption-quality`) — the per-signal hit-count radar over any repo that vendors `docs/audit-signals.json`, on its own scan path and never a gate (ADR-0005). This machinery never writes to the audited projects — it's evidence, not automation.

## 9. Open questions / uncertainty

- Exact current relationship between `.design-sync/` and the gallery/hub plugin path is not fully understood from this survey — both seem to serve "preview this component set elsewhere" but via different mechanisms (`claude.ai/design` sync vs. dashboard hub iframe).
- ADRs have begun to accrue under `docs/adr/` (index at `docs/adr/INDEX.md`) — the first, [ADR 0001](adr/0001-grandfather-authored-report-calendar.md), grandfathers the baseline-authored `report`/`calendar` archetypes and serves as the "governing ADR" alternative the promotion maturity gate references. Further ADRs are expected as this repo's own architecture decisions mature.
