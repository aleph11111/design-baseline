---
area: archetypes
opened: 2026-08-03
status: done
model: sonnet
model_reason: mechanical skill-script edit — add one frontmatter write mirroring the existing MANIFEST write, pattern already established by three prior manual backfills
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-03T00:00:00Z
---

# `/promote-archetype --update` should sync doc frontmatter `source_spec_version` alongside MANIFEST

## Context

`~/.claude/commands/promote-archetype.md`'s update path (step 5, the inline
Python block around line ~700) only writes `source_spec_version` into
`docs/archetypes/MANIFEST.json` — it never touches the corresponding
`<slug>.md` frontmatter field, even though `docs/archetypes/README.md`'s
Versioning section documents the two as meant to be an exact copy of each
other. This has now caused the same drift three separate times, each fixed by
a manual backfill ticket instead of the skill itself: `archetype-doc-manifest-version-drift`,
`archetype-spec-frontmatter-version-backfill`, and
`archetype-source-spec-version-fleet-backfill` (which just backfilled 7
archetypes in one pass). `scripts/verify-manifest-versions.mjs` (from
`archetype-manifest-version-verify-script`, PR #82) now runs as a `pretest`
hook and gates `npm test` on the two staying in sync, so any future promotion
that updates MANIFEST's `source_spec_version` without the doc side will
immediately re-red the gate.

## What to do

- [x] In `~/.claude/commands/promote-archetype.md`'s update-path Python block,
      after writing `a["source_spec_version"] = source_version` into
      MANIFEST, also update the matching `source_spec_version:` line in
      `docs/archetypes/<slug>.md`'s frontmatter to the same value.
- [x] Run `npm run verify:manifest` after the promotion write to confirm the
      two stay in sync, so a future mismatch fails fast at promotion time
      rather than silently landing.

## Resolution

The touched file (`~/.claude/commands/promote-archetype.md`) is a symlink
into the `dashboard` repo (`claude-skills/commands/promote-archetype.md`),
not design-baseline itself, so the fix shipped there instead of here:
[aleph11111/dashboard#178](https://github.com/aleph11111/dashboard/pull/178)
(merged). The update-path Python block now patches the doc frontmatter's
`source_spec_version:` line to match MANIFEST in the same pass, then runs
`npm run verify:manifest` in the baseline worktree. No design-baseline file
needed changing — this ticket closes as doc-only (backlog move) here.

## Acceptance

- Running `/promote-archetype <slug> --update` with a bumped
  `source_spec_version` updates both `MANIFEST.json` and the doc frontmatter
  in the same pass — no follow-up backfill ticket needed.
- `npm run verify:manifest` exits 0 immediately after an update-path
  promotion.

## Related

- [archive/archetype-doc-manifest-version-drift.md](archive/archetype-doc-manifest-version-drift.md)
- [archive/archetype-spec-frontmatter-version-backfill.md](archive/archetype-spec-frontmatter-version-backfill.md)
- [archive/archetype-source-spec-version-fleet-backfill.md](archive/archetype-source-spec-version-fleet-backfill.md) — the
  fleet backfill that recorded this as its own Open question
- [archive/archetype-manifest-version-verify-script.md](archive/archetype-manifest-version-verify-script.md)
- `docs/archetypes/README.md` (Versioning section)
