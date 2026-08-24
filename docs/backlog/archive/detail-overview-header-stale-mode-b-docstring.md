---
area: docs
opened: 2026-08-24
status: done
value: normal
model: sonnet
model_reason: "comment-only rewrite following an established sibling pattern (PageHeader/SectionHeading JSDoc) with the exact replacement text fixed by the shipped v3.0 contract"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-08-24T00:00:00Z
---

# DetailOverviewHeader docstring still permits ad-hoc Mode B heading

## Context

`src/components/archetypes/detail-overview/DetailOverviewHeader.tsx:43-45`
documents the pre-convergence Mode B rule: for a nested page, "omit this
header entirely. Optionally introduce a section-level `<h2>` if the parent's
tab label is insufficient context." That per-call-site freedom is exactly what
the archetype-convergence roadmap closed — the detail-overview contract is now
at v3.0 (`docs/archetypes/detail-overview.md:377-400`) and requires Mode B to
pass `title`/`subtitle`/`badges`/`actions` to `<DetailOverviewShell>`, which
renders the nested title itself through the `NestedPageHeading` layout
primitive (`src/components/layout/NestedPageHeading.tsx`) at one fixed
scale/weight with no variant prop (confirmed: `DetailOverviewShell.tsx:134`
renders `<NestedPageHeading title={title} subtitle={subtitle} …>` internally).
Because `/style-archetypes` distributes this docstring verbatim to downstream
projects, the stale text re-opens the drift the primitive shipped to close.

## What to do

- Confirmed single call site: `grep -rn "section-level" src/ docs/archetypes/`
  shows only this one stale sentence in `DetailOverviewHeader.tsx`; the two
  other "section-level" hits (`docs/archetypes/detail-overview.md:26,394`) are
  the contract's own historical note describing the freedom it closed, and
  `grouped-list.md:136` uses the phrase for an unrelated empty-state concept —
  no other archetype docstring carries this drift.
- Rewrite the Mode A/Mode B paragraphs in the `DetailOverviewHeader.tsx`
  docstring (lines ~38-45): Mode A stays "call this header above the shell
  (renders the canonical `<h1>` through `PageHeader`)"; Mode B becomes "do not
  call this header — pass `title`/`subtitle`/`badges`/`actions` to
  `<DetailOverviewShell>`, which renders the fixed-scale nested `<h2>` itself
  via `NestedPageHeading`."
- Drop the "optionally introduce a section-level `<h2>`" sentence entirely —
  no per-call-site heading choice survives in the replacement text.
- Comment-only change: no behaviour, props, or exports touched; keep the rest
  of the docstring (layout sketch, breadcrumb note, PageHeader-wrapper note)
  as-is.

## Acceptance

- `grep -rn "section-level" src/` returns no hits under `detail-overview/`.
- The docstring names both modes and states Mode B goes through the shell's
  `title` prop / `NestedPageHeading`, with no per-call-site heading choice
  offered anywhere in `detail-overview/`.
- `npx tsc --noEmit` and `npm test` still pass; the diff is confined to
  `DetailOverviewHeader.tsx` comments.

## Related

- [archetype-convergence roadmap](../archetype-convergence.md) — Phase 1 shipped
  the `NestedPageHeading` primitive and closed this exact freedom.
- [archive/archetype-convergence-nested-heading-primitive.md](../archive/archetype-convergence-nested-heading-primitive.md)
  — ships the primitive this docstring must now point to.
- [archive/archetype-convergence-detail-overview-close-api.md](../archive/archetype-convergence-detail-overview-close-api.md)
  — closed the shell's derived-prop API in the same phase.
