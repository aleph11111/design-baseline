---
area: archetypes
opened: '2026-11-12'
status: done
value: normal
spec: docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md
model: sonnet
model_reason: "follows the shipped transaction-document and analytics-dashboard slice pattern"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-11-12T00:00:00Z'
---

# Move the settings-sections shell onto the section-card stack with one card per settings group

## Context

Phase 4 of roadmap [[page-body-section-card-stack]]; the design is in `docs/superpowers/plans/2026-11-12-page-body-section-card-stack-design.md` under "### Phase 4 — Remaining archetypes". The orchestrator decided settings-sections stacks, because each `SettingsSection` is already an independent titled settings group.

Today `src/components/archetypes/settings-sections/SettingsSectionsShell.tsx` renders `<PageFrame>` around `<div data-slot="settings-sections" className="divide-y">`, and each `SettingsSection` is a titled `SectionCard` that flattens inside the one frame.

The pattern to copy is shipped in `TransactionDocumentShell.tsx` (`body="stack"`, one `SectionCard` per section).

## What to do

- [ ] `SettingsSectionsShell` passes `body="stack"` and drops the `divide-y` wrapper. Each `SettingsSection` becomes a raised, bordered card on the canvas.
- [ ] Keep `data-slot="settings-sections"` on the stack container, or move it onto the stack body, so existing selectors keep working.
- [ ] Update `docs/archetypes/settings-sections.md`, keeping it role-only. Bump the MANIFEST minor version, add a CHANGELOG entry, and update the demo if needed.
- [ ] Update the tests:
  - a stack body is present;
  - each section is a card with `border` and `rounded-lg`;
  - no `divide-y` wrapper remains.
- [ ] Regenerate the settings-sections screenshot baselines on desk27, laptop14 and phone, and run `npm run check:viewports`.

## Acceptance

- The settings-sections demo renders `[data-page-body="stack"]` with one bordered, rounded card per settings section and a canvas gap between them.
- `grep -n "divide-y" src/components/archetypes/settings-sections/SettingsSectionsShell.tsx` returns no line.
- `npm test`, `npx tsc --noEmit`, `node scripts/lint-design.mjs`, `npm run screenshots` and `npm run check:viewports` pass at desk27, laptop14 and phone.

## Related

- [[page-body-section-card-stack]] — roadmap (phase p4)
- [[page-body-section-card-stack-transaction-document]] — the shipped pattern
- [[page-body-section-card-stack-keep-frame-decisions]] — the archetypes that keep one frame
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — one page frame (§3 superseded by ADR-0015)
