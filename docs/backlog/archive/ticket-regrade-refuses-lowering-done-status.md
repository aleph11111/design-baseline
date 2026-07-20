---
area: tooling
opened: 2026-07-20
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T00:00:00Z
model: sonnet
model_reason: single guard clause in an established skill flow (re-grade path), acceptance is directly checkable
---

# /ticket --regrade should refuse to lower an archived ticket's done status

## Context

`/ticket --regrade <slug>` (documented in the `ticket` skill's Re-grade flow) reads
the ticket file, re-runs the gate against its current content, and writes the
resulting `score`-derived `status` (`ready` or `needs-enrichment`) back into the
frontmatter — it does not special-case `status: done`. Since `docs/backlog/archive/`
tickets carry `status: done` (set by the ship archive step, not by the gate — see
`backlog-archive-status-never-set-to-done.md`, which fixed `ship-archive-wip.sh` and
backfilled the archive to this state), pointing `--regrade` at an archived ticket
would silently recompute its status back to `ready`/`needs-enrichment`, undoing the
backfill on any archived ticket it touches.

## What to do

- [ ] In the `ticket` skill's Re-grade flow (step 4, "Update the `gate` frontmatter
      block... Update `status` based on the new score"), add a guard: if the
      resolved file is under `archive/` (or its current `status` is `done`), skip
      the `status` rewrite — update only the `gate` block, or refuse the re-grade
      entirely with a message that the ticket is archived and immutable.
- [ ] ? Decide whether to hard-refuse (matching `archive/`'s "immutable" rule already
      stated in `docs/backlog/README.md` for `--enrich`) or to soft-warn while still
      updating `gate`. Recommend hard-refuse for consistency with the existing
      `--enrich` refusal on `archive/`.

## Acceptance

- Running `/ticket --regrade <slug>` against a file in `docs/backlog/archive/` with
  `status: done` leaves `status: done` unchanged in the file afterward.
- Running `/ticket --regrade <slug>` against a non-archived ticket behaves exactly
  as before (status still recomputed from the gate score).

## Related

- [backlog-archive-status-never-set-to-done.md](backlog-archive-status-never-set-to-done.md)
  — established that archive tickets carry `status: done` set by the archive step,
  not the gate; this ticket is the follow-up "?" item that ticket's own What-to-do
  flagged but left out of its Acceptance.
