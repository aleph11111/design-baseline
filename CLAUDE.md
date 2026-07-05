# CLAUDE.md

This file tells Claude Code how to work in this repository. It declares the documentation convention so the generic `project-workflow`, `project-architecture`, and `project-rules` skills can operate.

## What This Is

The **design-baseline donor** — the upstream source of a shadcn/ui + Tailwind 4 + sidebar app shell, and of reusable **page archetypes** (page-shape contracts + reference implementations). It is not a buildable app; `src/` is copy-source for downstream projects. Consumed via three global skills: `/style-baseline` (applies the shell + tokens), `/style-archetypes` (applies page-shape archetypes), and `/promote-archetype` (promotes a matured archetype FROM a source project INTO this donor). It also satisfies the `design-plugin` contract (`docs/PLUGIN-CONTRACT.md`) so the dashboard hub at `~/.claude/dashboard` can connect to it and mount its gallery. This repo is **local-only** (no GitHub remote); its own truth ref is local `main`.

## How We Work Together

Single solo builder/operator. This repo is now a managed git project (as of 2026-07-05, no longer an unversioned directory) — behave as an autonomous executor: decide and present, file follow-ups via `/ticket` without asking. Lifecycle: capture/enrich a backlog ticket → implement on a `/feat <slug>` worktree → `/ship`. Because there's no remote, `/ship` lands the branch directly onto local `main` rather than opening a PR. The global `~/.claude/CLAUDE.md` supplies the parallel-safe `/feat`→`/ship` rules and git-safety hooks — this file does not duplicate them. Writing tracked docs/code directly on the primary checkout's `main` is rejected by the `block-main-checkout-tracked-write` hook — always work from a `/feat` worktree.

## Doc Paths

The generic skills read this block to find the project's documentation artifacts.

- `todo: tasks/todo.md` *(per-worktree scratch — `tasks/` is gitignored)*
- `lessons: docs/lessons.md`
- `backlog: docs/backlog/`
- `architecture: docs/ARCHITECTURE.md`
- `decisions: docs/adr/` *(per-file ADRs `<NNNN>-<slug>.md`; index at `docs/adr/INDEX.md`; no ADRs recorded yet)*
- `rules: docs/RULES.md`
- `specs: docs/superpowers/specs/` *(design specs — e.g. the archetype-promotion design)*
- `plans: docs/superpowers/plans/` *(implementation plans)*
- `archetypes: docs/archetypes/` *(MANIFEST.json registry + `<slug>.md` contract / `<slug>.baseline.md` reference-impl pairs; methodology in `docs/archetypes/README.md`)*
- `audits: docs/audits/` *(dated fleet fit/drift/molecule-adoption sweeps; methodology in `docs/FLEET-AUDIT.md`)*

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

- One idea: `docs/archetypes/MANIFEST.json` is the versioned source of truth for what baseline ships; every archetype is a **two-doc pair** — the stack-agnostic contract (`<slug>.md`) and the baseline reference implementation (`<slug>.baseline.md`) — plus reference primitives (`src/components/archetypes/<slug>/`) and a sandbox demo (`src/examples/<slug>-demo.tsx`).
- `src/components/ui/` (44 shadcn/ui primitives), `src/components/layout/` (AppShell/Sidebar/Header + shared chrome), `src/components/archetypes/` (one dir per shipped archetype; 14 registered in MANIFEST) — see `docs/ARCHITECTURE.md` for the full map.
- Promotion flow: a real project matures an archetype through Phases 1–4 (scope-lock → audit → spec → migration) → `/promote-archetype` applies maturity gates, de-source-ifies, and writes both donor docs + primitives + demo + MANIFEST entry.
- Fleet-scale fit/drift measurement lives in `docs/FLEET-AUDIT.md` + `docs/audits/`; it reads the archetype contracts to score adoption across other repos without ever writing to them.
- Full component map, promotion flow detail, and open questions: `docs/ARCHITECTURE.md`.

## Project-Specific Notes

- **Local-only repo:** no GitHub remote; truth ref is local `main`. `/ship` merges directly rather than opening a PR.
- **Contract vs. reference-implementation split is load-bearing**, not a style choice — it's what lets a non-baseline stack (Tailwind 3, different component system) adopt an archetype's page-shape contract without the baseline's primitives. Never fold Tailwind classes or `src/components/...` primitive names into a `<slug>.md` contract body — those belong only in `<slug>.baseline.md`.
- **`/promote-archetype` currently has a wiring gap**, called out in its own Notes section: it writes `docs/archetypes/<slug>.md`/`.baseline.md`/MANIFEST directly, but as of this repo becoming a managed `/feat`-worktree project those writes must happen inside a design-baseline `/feat` worktree, not the primary checkout on `main`. The skill has not yet been updated to do this automatically — a known TODO.
- **Baseline never originates archetypes** — every entry should trace to a `promoted_from` source project (maturity-gated: spec locked/ADR'd, v1+, Phase-4 migration started, stable one session). Two current MANIFEST entries (`report`, `calendar`) instead carry `authored` with no `promoted_from` — a pre-existing exception to flag, not a pattern to repeat.
