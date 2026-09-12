# CLAUDE.md

This file tells Claude Code how to work in this repository. It declares the documentation convention so the generic `project-workflow`, `project-architecture`, and `project-rules` skills can operate.

## What This Is

The **design-baseline donor** — the upstream source of a shadcn/ui + Tailwind 4 + sidebar app shell, and of reusable **page archetypes** (page-shape contracts + reference implementations). It is not a buildable app; `src/` is copy-source for downstream projects. Consumed via three global skills: `/style-baseline` (applies the shell + tokens), `/style-archetypes` (applies page-shape archetypes), and `/promote-archetype` (promotes a matured archetype FROM a source project INTO this donor). It also satisfies the `design-plugin` contract (`docs/PLUGIN-CONTRACT.md`) so the dashboard hub at `~/.claude/dashboard` can connect to it and mount its gallery. This repo is backed by a GitHub origin (`github.com/aleph11111/design-baseline`); its truth ref is `origin/main`.

## How We Work Together

Single solo builder/operator. This repo is now a managed git project (as of 2026-07-05, no longer an unversioned directory) — behave as an autonomous executor: decide and present, file follow-ups via `/ticket` without asking. Lifecycle: capture/enrich a backlog ticket → implement on a `/feat <slug>` worktree → `/ship`. `/ship` pushes the branch, opens a PR against `origin/main`, and enables auto-merge (squash + delete remote branch on green CI) — standard GitHub mode. The global `~/.claude/CLAUDE.md` supplies the parallel-safe `/feat`→`/ship` rules and git-safety hooks — this file does not duplicate them. Writing tracked docs/code directly on the primary checkout's `main` is rejected by the `block-main-checkout-tracked-write` hook — always work from a `/feat` worktree.

## Doc Paths

The generic skills read this block to find the project's documentation artifacts.

- `todo: tasks/todo.md` *(per-worktree scratch — `tasks/` is gitignored)*
- `backlog: docs/backlog/`
- `architecture: docs/ARCHITECTURE.md`
- `decisions: docs/adr/` *(per-file ADRs `<NNNN>-<slug>.md`; see `docs/adr/INDEX.md` for the current list)*
- `rules: docs/RULES.md`
- `specs: docs/superpowers/specs/` *(design specs — e.g. the archetype-promotion design)*
- `plans: docs/superpowers/plans/` *(implementation plans)*
- `archetypes: docs/archetypes/` *(MANIFEST.json registry + one `<slug>.md` contract per archetype — the binding is the shipped typed export `design-baseline/archetypes/<slug>` from `src/components/archetypes/<slug>/`; methodology in `docs/archetypes/README.md`)*
- `audits: docs/audits/` *(dated fleet audit reports; the rubric they score against lives in `docs/STYLE.md`'s "The fleet audit rubric")*
- `design: docs/` *(the World-A methodology layer — this donor IS the design-baseline; declared as one bare-root key so its machine readers — the `/adopt-baseline`, `/style-archetypes`, `/promote-archetype` skills and the dashboard's `design-plugin` donor gate — resolve every file below, matching controlling-app's donor-layer pattern. Frozen set: the repo's own `archetype-convergence` roadmap's `docs-retire` phase retires them later.)*
  - `docs/ADOPTION-QUALITY.md` — Axis C adoption-quality audit contract (`/style-archetypes` Phase 3)
  - `docs/CHOOSING-A-SURFACE.md` — surface-selection decision
  - `docs/DETAIL-PAGE-TEARDOWN-PLAYBOOK.md` — detail-page teardown playbook
  - `docs/PACKAGE.md` — packaging contract
  - `docs/PLACEMENT.md` — "what goes where" grammar
  - `docs/PLUGIN-CONTRACT.md` — the design-plugin contract the dashboard hub reads
  - `docs/PROMOTION-RADAR.md` — the durable promotion-candidate radar
  - `docs/STACK.md` — pinned package stack
  - `docs/STYLE.md` — the fleet-audit rubric + style contract
  - `docs/TAXONOMY.md` — the page-archetype taxonomy
  - `docs/audit-signals.json` — the machine form the audit sweep scores
  - `docs/promotion-radar.json` — the machine form of the promotion radar

## Skills

- **`project-workflow`** — session workflow, doc maintenance, ADR conventions, backlog state machine, parallel-safe `/feat` → `/ship` lifecycle. Activates at session start.
- **`project-rules`** — loads `docs/RULES.md` on demand for archetype-promotion, MANIFEST, or version-bump work.
- **`project-architecture`** — points you at `docs/ARCHITECTURE.md`. Read before grepping.
- This repo's own role: donor for the global `/style-baseline`, `/style-archetypes`, `/promote-archetype` skills (defined in `~/.claude/commands/`) — read those files, not this one, for their step-by-step mechanics.
- **`/ticket <thought>`** files a backlog item — never hand-write `docs/backlog/<slug>.md`.

## Commands

```bash
npm install && npx tsc --noEmit   # donor verification: strict typecheck (no build — donor isn't an app)
npm test                          # vitest run — donor-owned component tests (e.g. SurfaceHeader)
npm run gallery                   # dev-serve the gallery (donor-dev only; renders every archetype demo)
npm run gallery:build             # build gallery-dist/ — the static surface the dashboard hub iframes
npm run gallery:preview           # preview the built gallery
npm run gallery:view              # gallery:build + preview on :5173
```

## Architecture Quick Reference

- One idea: `docs/archetypes/MANIFEST.json` is the versioned source of truth for what baseline ships; every archetype is **one contract plus the exported component** — the stack-agnostic contract (`<slug>.md`) and the shipped typed primitives (`src/components/archetypes/<slug>/`, export `design-baseline/archetypes/<slug>`) — plus a sandbox demo (`src/examples/<slug>-demo.tsx`).
- `src/components/ui/` (44 shadcn/ui primitives), `src/components/layout/` (AppShell/Sidebar/Header + shared chrome), `src/components/archetypes/` (one dir per shipped archetype; 21 registered in MANIFEST) — see `docs/ARCHITECTURE.md` for the full map.
- Promotion flow: a real project matures an archetype through Phases 1–4 (scope-lock → audit → spec → migration) → `/promote-archetype` applies maturity gates, de-source-ifies, and writes both donor docs + primitives + demo + MANIFEST entry.
- Fleet-scale audit measurement is the read-only sweep described in `docs/STYLE.md` ("The fleet audit rubric") + `docs/ADOPTION-QUALITY.md` (Axis C) + `docs/PROMOTION-RADAR.md` (the durable candidate radar); the machine form is `docs/audit-signals.json`, and dated reports land in `docs/audits/`. It scores other repos without ever writing to them.
- Full component map, promotion flow detail, and open questions: `docs/ARCHITECTURE.md`.

## Project-Specific Notes

- **GitHub-backed repo:** `origin` is `github.com/aleph11111/design-baseline`; truth ref is `origin/main`. `/ship` pushes the feature branch, opens a PR, and enables auto-merge (squash + delete remote branch on green CI) rather than merging directly.
- **The contract is role-only; the binding is the exported component** — that is what is load-bearing (rules 2–3 of `docs/RULES.md`). Never fold Tailwind classes or `src/components/...` primitive names into a `<slug>.md` contract body: a closed archetype's props are the contract, and a doc restating the shipped code is a mirror that drifts (the retired reference-implementation siblings were exactly that).
- **`/promote-archetype` currently has a wiring gap**, called out in its own Notes section: it writes `docs/archetypes/<slug>.md` and MANIFEST directly, but as of this repo becoming a managed `/feat`-worktree project those writes must happen inside a design-baseline `/feat` worktree, not the primary checkout on `main`. The skill has not yet been updated to do this automatically — a known TODO (it also still authors the retired baseline siblings; a coding-dashboard ticket is filed to fix it).
- **Baseline never originates archetypes** — every entry should trace to a `promoted_from` source project (maturity-gated: spec locked/ADR'd, v1+, Phase-4 migration started, stable one session). Two entries (`report`, `calendar`) instead carry `authored` with no `promoted_from` — a **closed set** of sanctioned exceptions, grandfathered by `docs/adr/0001-grandfather-authored-report-calendar.md` and marked with an `authored_reason` in the MANIFEST; not a pattern to repeat.
