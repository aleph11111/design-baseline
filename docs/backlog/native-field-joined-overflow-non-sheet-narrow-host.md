---
area: layout
opened: 2026-11-17
status: needs-enrichment
value: low
gate:
  score: 4
  passed: [title, context, what_to_do, acceptance, related]
  failed:
    - open_question: "unresolved fork auto-resolved to Recommended; operator confirms before /feat"
  graded_at: 2026-11-17T00:00:00Z
---

# Joined NativeField overflows narrow hosts other than FilterSheet

## Context

The v0.50.6 fix (PR #796, [[native-field-joined-input-overflows-sheet]]) scoped the number-input shrink to FilterSheet only: `src/components/layout/ToolbarBand.tsx` re-scopes `[&_div.grid:has(>[data-joined-label])]:grid-cols-[130px_minmax(0,1fr)]!` on its `data-filter-sheet` div. The non-`fixedBox` joined branch in `src/components/archetypes/raw-input/native-field.tsx` (~line 275) still uses `grid-cols-[auto_minmax(max-content,1fr)]` and only adds `min-w-0` on the value cell, which does nothing while the track floor is `max-content`. Any other auto-width host narrower than label + input's intrinsic width (a `type=number` input is 258px) therefore overflows — e.g. a future side-panel toolbar hits the same 8px overflow at 430px. No such host ships today; latent. Filed by the PR #796 review gate.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Invert the default in the non-`fixedBox` joined branch of `native-field.tsx`: track `minmax(0,1fr)` so the value shrinks in any host, and move the `max-content` floor into a `ToolbarBand` band-scoped re-scope (mirroring the FilterSheet re-scope), since the band must keep the value's own width and scroll instead of clipping (per the comment at `native-field.tsx` ~line 285).
- [ ] Keep the value-before-label rule of [[joined-label-shrinks-before-value]] and the label floor of [[joined-label-floor-too-small]] unchanged.

## Acceptance

- A joined `type=number` `NativeField` in an arbitrary 430px-wide auto-width container that is not FilterSheet renders with its right edge at or before the container's, in `node scripts/check-joined-label.mjs` (a new non-sheet narrow-host case).
- No other joined field type (text, number, date, select-wrapped native) overflows any narrow host, not only FilterSheet; the toolbar band still keeps the value at its intrinsic width and scrolls, and FilterSheet output is unchanged.

## Related

- [[native-field-joined-input-overflows-sheet]]
- [[native-field-joined-label-sheet-column]]
- [[joined-label-shrinks-before-value]]
- [[joined-label-floor-too-small]]

## Open question

Where does the fix live? Recommended (asserted above): default the component to `minmax(0,1fr)` and re-scope `max-content` in `ToolbarBand`. Alternative: leave the component as is and document that every narrow host must carry its own re-scope like FilterSheet (cheaper, but a new host silently regresses). Alternative 2: close as won't-fix until a real narrow host exists (the exposure is latent).
