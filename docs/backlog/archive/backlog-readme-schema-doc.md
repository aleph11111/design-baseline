---
area: tooling
opened: 2026-07-05
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-05T00:00:00Z
---

# No `docs/backlog/README.md` documents this repo's ticket frontmatter schema

## Context

`docs/ARCHITECTURE.md` §9 records that no `docs/backlog/README.md` exists documenting this repo's ticket frontmatter schema. The `area`, `gate`, and `model`/`model_reason` fields were observed empirically across `docs/backlog/*.md` rather than written down anywhere. The `/ticket` skill explicitly treats `docs/backlog/README.md` as the schema authority when present ("read it once at the start to learn the canonical area list and any project-specific frontmatter fields") — so its absence means `/ticket` falls back to its default schema and this repo's canonical `area` buckets are never pinned. Writing the README makes `/ticket` deterministic here and gives enrichment a fixed area list to classify against.

## What to do

- [ ] Enumerate the canonical `area` buckets actually in use across `docs/backlog/*.md` and `docs/backlog/archive/*.md` (e.g. `archetypes`, `tooling`, `layout`, `crud-dialog`, …) and pin them as the allowed set.
- [ ] Document the frontmatter schema: `area`, `opened`, `status`, the `gate` block (`score`/`passed`/`failed`/`graded_at`), and the optional `kind`, `model`/`model_reason` fields — matching what `/ticket` reads and writes.
- [ ] Write `docs/backlog/README.md` capturing the above so `/ticket` uses it as the schema authority.

## Acceptance

- `docs/backlog/README.md` exists and enumerates the canonical `area` list plus every frontmatter field the existing tickets use.
- Running `/ticket <thought>` picks its `area` from the README's pinned list rather than inventing one.
- `docs/ARCHITECTURE.md` §9 no longer lists the missing backlog schema doc as an open question.

## Related

- [vite-config-worktree-root-climb.md](vite-config-worktree-root-climb.md)
- `docs/ARCHITECTURE.md` §9 — open questions / uncertainty
- `~/.claude/commands/ticket.md` (the `/ticket` skill) — reads `docs/backlog/README.md` as schema authority when present
