---
area: archetypes
opened: 2026-10-06
status: ready
value: normal
blocked_on_branch: feat/settings-tab-body-duplicate-heading
model: sonnet
model_reason: "scoped doc + JSDoc narrowing plus one test; the cause is established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-06T06:10:00Z
---

# SettingsTableBody flush default bleeds outside a SettingsPageShell tab

## Context

`SettingsTableBody` (D2 frameless body, added on PR #466) defaults `flush` to `true`. That bleeds the band and table row out of `SettingsPageShell`'s tab panel `p-5`: `-mx-5` on the band and row wrapper, `-mt-5` on the body root. But the `SettingsTableBody` JSDoc in `src/components/archetypes/settings-table/SettingsTableShell.tsx` and the v3.2 note in `docs/archetypes/settings-table.md` also advertise the body for "any other page frame that already owns the heading". Placed with defaults in a plain `PageFrame` body or a detail pane, which pad nothing, the band and table push 20px past both side edges and 20px up into the frame's band. The `flush` JSDoc does say to pass `false` there, but the advertised second placement is wrong out of the box. Raised as a follow-up by the PR #466 review gate (round 7).

Decision: narrow the advertised placement to `SettingsPageShell` tab content, and state that every other placement passes `flush={false}`. A standalone page uses `SettingsTableShell`, which already forces `flush={false}` (per ADR-0008, the frame owns placement). Flipping the default would put the burden on the primary tab placement, and deriving the inset from context would need a new context provider for one consumer.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names. (Here: every doc or JSDoc sentence that advertises `SettingsTableBody` placement, and every `SettingsTableBody` usage in `src/examples/`.)
- [ ] Reword the `SettingsTableBody` JSDoc and the `docs/archetypes/settings-table.md` usage sentence: direct `SettingsPageShell` tab content is the default placement, and any other frame passes `flush={false}`.
- [ ] Add a test: `SettingsTableBody` with `flush={false}` inside a bare `PageFrame` renders no `-mx-5`/`-mt-5` on the band, the row wrapper, or the body root.
- [ ] Bump the D2 contract patch version in `docs/archetypes/settings-table.md` and MANIFEST, and bump `package.json`.

## Acceptance

- `docs/archetypes/settings-table.md`, the `SettingsTableBody` JSDoc, and no other doc or JSDoc sentence advertise default-`flush` placement in any frame other than a `SettingsPageShell` tab.
- With `flush={false}`, no bleed class (`-mx-5`, `-mt-5`) renders on any of the body's containers (band, row wrapper, body root); the new test asserts every one.
- Every `SettingsTableBody` usage in `src/examples/` outside a `SettingsPageShell` tab passes `flush={false}`.

## Related

- [[settings-tab-body-duplicate-heading]] — the ticket PR #466 implements; this ticket's files exist only on its branch until it merges.
- [[settings-table-split-pane-one-surface]]
- [ADR-0008](/docs/adr/0008-one-page-frame-slot-owned-placement.md) — One page frame, slot-owned placement
