---
area: tooling
opened: 2026-07-20
status: done
model: sonnet
model_reason: one field rewrite in a shell helper plus a mechanical backfill loop; acceptance is exactly checkable
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T13:55:00Z
---

# Archived backlog tickets keep status ready because /ship's archive helper never rewrites it

## Context

`docs/backlog/README.md` defines the two lifecycle axes as orthogonal: **location**
encodes stage (`docs/backlog/` open → `wip/` in flight → `archive/` resolved) and the
`status` frontmatter field encodes enrichment readiness, with `done` documented as
"resolved. Lives in `archive/`". In practice the two disagree for most of the archive:
measured against `origin/main`, **50 of 66** files under `docs/backlog/archive/` carry
`status: ready`, and only 16 carry `status: done`.

The cause is the producer, not the tickets. `~/.claude/lib/ship-archive-wip.sh` — the
helper `/ship` step 4b delegates its archive move to — resolves the ticket path and then
archives it with a bare `git mv "$src" "$dst"` (`:65`), with no rewrite of the
frontmatter. Nothing else in the `/ship` path touches `status`, so every ticket that ever
shipped through the normal lifecycle lands in `archive/` still reading `ready`. The 16
correct ones were almost certainly set by hand.

Two consequences. Anything that filters tickets by `status` rather than by directory —
the dashboard kanban, or any future query — sees ~50 resolved tickets claiming to be
ready for `/feat` handoff. And the README's own schema is contradicted by 76% of the
corpus, which erodes the file's authority as the stated schema authority for `/ticket`.

Noticed while deleting the superseded `feat/crud-dialog-footer-submitting-label` branch:
its ticket had been archived on 2026-07-04 and still read `status: ready`, which made it
briefly unclear whether the work had actually shipped.

## What to do

- [ ] Rewrite `status:` to `done` inside `~/.claude/lib/ship-archive-wip.sh` as part of the
      archive move, alongside the existing `git mv` at `:65`, so the field is correct at the
      moment a ticket enters `archive/`. Fix the producer before the backfill, or the
      backfill re-rots on the next `/ship`.
- [ ] Backfill the existing archive: set `status: done` on every file under
      `docs/backlog/archive/` that currently reads `status: ready` or
      `status: needs-enrichment` (50 of 66 on `origin/main` at time of filing).
- [ ] Leave the `gate` block untouched during the backfill. `gate.score` records how
      well-formed the ticket was and stays meaningful in the archive; only `status` is
      lifecycle state. (The same separation `README.md` draws between location and status.)
- [ ] Note in `docs/backlog/README.md` that `status: done` is set by the archive step, not
      by the gate — the schema table currently says status is "Set by the gate, not by
      hand", which is what made the drift invisible.
- [ ] ? Consider whether `/ticket --regrade` should refuse to lower a `done` ticket back to
      `ready`, since the gate recomputes `status` purely from score and would undo the
      backfill on any archived ticket it is pointed at.

## Acceptance

- After shipping one ticket end-to-end through `/feat` → `/ship`, its file in
  `docs/backlog/archive/` reads `status: done` with no manual edit.
- `grep -c "^status: ready" docs/backlog/archive/*.md` returns 0.
- Every file under `docs/backlog/archive/` has `status: done`, and no file outside
  `archive/` was modified by the backfill.
- The `gate` block of a backfilled ticket is byte-identical to what it was before the
  sweep — only the `status` line changed.
- `docs/backlog/README.md` no longer describes `status` as set solely by the gate.

## Related

- [archive/backlog-readme-schema-doc.md](archive/backlog-readme-schema-doc.md) — established
  `README.md` as the schema authority this ticket reconciles the corpus against.
- [archive/archetype-spec-frontmatter-version-backfill.md](archive/archetype-spec-frontmatter-version-backfill.md)
  — the closest precedent: a prior one-off frontmatter backfill across many files.
- [ship-cleanup-local-orphan-reaper.md](ship-cleanup-local-orphan-reaper.md) — sibling
  `tooling` ticket also targeting a `~/.claude/lib/` helper rather than repo code; note its
  `kind: ops`. This ticket omits `kind` because the work is mixed: the producer fix lands in
  `~/.claude/`, the backfill lands in this repo as a normal PR.
