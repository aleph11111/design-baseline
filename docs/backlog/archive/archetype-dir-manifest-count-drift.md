---
area: archetypes
opened: 2026-07-05
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-05T00:00:00Z
---

# `src/components/archetypes/` holds 15 slug dirs but `MANIFEST.json` registers only 14 entries

## Context

`docs/ARCHITECTURE.md` §9 records that `src/components/archetypes/` holds one more slug directory than `docs/archetypes/MANIFEST.json` registers — **15 directories vs 14 registered entries**. The extra directory is either an unregistered/WIP archetype whose promotion never completed, or leftover drift from a renamed/removed archetype. `MANIFEST.json` is the versioned source of truth for what baseline ships, so an on-disk primitive dir with no MANIFEST entry is either an incomplete promotion (should be registered or finished) or dead code (should be removed). This is distinct from the already-archived `archetype-doc-manifest-version-drift` ticket, which was about *version* mismatch between docs and MANIFEST, not *directory-count* mismatch.

## What to do

- [ ] Diff the slug directories under `src/components/archetypes/` against the `slug`/`primitives_dir` values in `docs/archetypes/MANIFEST.json` to identify the one unregistered directory.
- [ ] Determine whether it is a WIP/incomplete promotion (finish it: add the contract + baseline docs + MANIFEST entry + demo) or orphaned drift (remove the directory and any dangling `src/examples/<slug>-demo.tsx` / doc references).
- [ ] Update `docs/ARCHITECTURE.md` §9 to remove the drift bullet once reconciled.

## Acceptance

- The count of slug directories under `src/components/archetypes/` equals the number of entries in `MANIFEST.json.archetypes`.
- Every `src/components/archetypes/<slug>/` directory maps to exactly one MANIFEST entry, and vice versa (no orphans in either direction).
- `docs/ARCHITECTURE.md` §9 no longer lists the 15-vs-14 drift as an open question.

## Related

- [archetype-doc-manifest-version-drift.md](archive/archetype-doc-manifest-version-drift.md)
- [archetype-spec-frontmatter-version-backfill.md](archive/archetype-spec-frontmatter-version-backfill.md)
- `docs/ARCHITECTURE.md` §9 — open questions / uncertainty
- `docs/archetypes/MANIFEST.json` — the registry to reconcile against
