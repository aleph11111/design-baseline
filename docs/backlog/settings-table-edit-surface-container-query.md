---
area: archetypes
opened: 2026-11-17
status: needs-enrichment
value: normal
model: opus
model_reason: "design is the deliverable: one container-width signal must drive pane, dialog and column tiers, and the mechanism (shell-owned dialog vs exposed hook) is an open API tradeoff"
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved Open question caps the score at 4"
  graded_at: 2026-11-17T00:00:00Z
---

# SettingsTableShell edit surface and column tiers key on viewport width

## Context

`SettingsTableShell` (`src/components/archetypes/settings-table/SettingsTableShell.tsx:699`) hides the split-pane edit form with `hidden w-1/2 md:block md:border-l`, and `hideBelowClass` (`src/components/archetypes/shared/tableColumn.ts:68`) hides `hideBelow: "md" | "2xl"` columns with `hidden md:table-cell` / `hidden 2xl:table-cell`. Both key on viewport width. The consumer's dialog-versus-pane choice is the same viewport signal: `src/examples/settings-table-demo.tsx:240` uses `useIsMobile()` (md = 768px viewport) to open the click-contract edit dialog. Inside `AppShell` (256px sidebar) the real column is far narrower than the viewport, so these three switch too early or not at all. Split off from [[viewport-breakpoints-container-query-audit]], which lists the pane. Converting the pane alone was tried in PR 800 and reverted: in a ~780px column on a >=768px viewport the pane is hidden by the container while the dialog is not opened by the viewport, leaving no editing surface. So pane visibility, dialog opening and the `hideBelow` tiers must change together, off one container-width signal. Class-only conversion (ADR-0004) is not enough, because the dialog is opened by JS state, not CSS.

## What to do

- [ ] Give the shell one container-width signal (`@container` on the frame, measured width for the JS side) that decides pane visible vs pane absent.
- [ ] Drive the edit-dialog opening from that same signal, so a row click opens the dialog exactly when the pane is absent, and never when the pane shows. Replace the viewport `useIsMobile` in `src/examples/settings-table-demo.tsx:240` accordingly; the mechanism is in Open question.
- [ ] Convert `hideBelowClass` tiers `md` and `2xl` to container-query variants (`@md:table-cell`, `@2xl:table-cell`), with `@container` on the table region; spell the class strings out so Tailwind emits both tiers.
- [ ] Update `docs/archetypes/settings-table.md`, pin the classes and the pane/dialog switch in `SettingsTableShell.test.tsx`, add a gallery case at ~780px column on a wide viewport (living-demos rule), run `npm run check:viewports`, and add the `CHANGELOG.md` entry plus version bump (`scripts/verify-package-version.mjs` fails `npm test` otherwise).
- [ ] Grep every other consumer of `hideBelowClass` and every `useIsMobile`-style edit-surface choice under `src/` and convert them in the same change.

## Acceptance

- In a ~780px column on a >=768px viewport the edit pane is absent and a row click opens the edit dialog.
- In a wide column the pane shows and a row click opens no dialog.
- Columns with `hideBelow: "md"` or `"2xl"` hide by container width, unchanged in a wide column.
- No `md:`/`2xl:` viewport variant remains in `SettingsTableShell.tsx` or `hideBelowClass`, and no other consumer of `hideBelowClass` or viewport-keyed edit-surface choice is left unconverted.

## Related

- [[viewport-breakpoints-container-query-audit]] — the audit that lists the pane; this carves it out and must ship first so the audit does not repeat the PR 800 pane-only conversion
- [[detail-overview-rail-switch-container-query]] — precedent `@container` conversion
- [[settings-table-split-pane-one-surface]] — origin of the pane and the Layer 11 dialog fallback
- [ADR-0004](/docs/adr/0004-appearance-locality-derived-vs-inherited.md) — class-only default; this ticket is the case it does not cover

## Open question

Mechanism for the shared signal, unresolved (headless run; Recommended asserted above as "one container-width signal" without fixing the API):
- (Recommended) Shell-owned fallback: shell takes an `editDialog` slot and renders it when the pane is absent, so the consumer holds no width logic.
- Exposed hook/callback: shell reports pane visibility (`onEditSurfaceChange` or a `useSettingsTableEditSurface`), consumer opens its own dialog.
