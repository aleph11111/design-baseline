# docs/

This directory is design-baseline's minimum doc set. Every file here names the reader that uses it at a defined moment — the keys below are the `## Doc Paths` block in `CLAUDE.md`; anything not declared there is scratch (`tasks/`) or retired. `fleet/lib/docs-minimum-set.sh` (coding-dashboard) enforces the set.

| Doc Paths key | Path | Reader |
| --- | --- | --- |
| `todo` | `tasks/todo.md` *(worktree-local, gitignored)* | the feat session working the branch |
| `backlog` | `docs/backlog/` | `/feat`, `/ship`, the dashboard kanban |
| `architecture` | `docs/ARCHITECTURE.md` | `project-architecture` skill; session-start orientation |
| `decisions` | `docs/adr/` | `resolve-spec-plan-dirs.sh` (ADR gate at `/ship`); index at `docs/adr/INDEX.md` |
| `rules` | `docs/RULES.md` | `project-rules` skill; promotion-flow and MANIFEST work |
| `specs` | `docs/superpowers/specs/` | `resolve-spec-plan-dirs.sh` (spec fanout at `/feat` carry-in + `/ship`) |
| `plans` | `docs/superpowers/plans/` | `resolve-spec-plan-dirs.sh` (plan fanout at `/ship`) |
| `archetypes` | `docs/archetypes/` | `MANIFEST.json` registry + one `<slug>.md` contract per archetype; `/style-archetypes` + `/promote-archetype` skills |
| `audits` | `docs/audits/` | dated fleet-audit reports; the rubric they score against lives in `docs/STYLE.md` |
| `design` | `docs/` *(bare-root declaration)* | the World-A methodology layer — this donor **is** the design-baseline. Machine readers: the `/style-archetypes`, `/promote-archetype` skills and the dashboard's `design-plugin` donor gate. Frozen set — the `archetype-convergence` roadmap's `docs-retire` phase retires it later. The per-file entries are the `design:` sub-rows in `CLAUDE.md` |
