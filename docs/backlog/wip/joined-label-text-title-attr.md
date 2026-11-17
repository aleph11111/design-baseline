---
area: layout
opened: 2026-11-10
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-10T00:00:00Z
---

# Joined toolbar label text lacks title attribute when ellipsized

## Context

`JoinedLabelText` in `src/components/ui/toolbar-band.tsx` (line ~139) renders `<span className="truncate">{children}</span>` with no `title`, so a label ellipsized at the `max-w-32` cap or inside a fixed-width box cannot be read even on hover. Every joined label routes through it: `src/components/ui/select.tsx` (~79), `src/components/ui/segmented-control.tsx` (~95), `src/components/ui/toggle-field.tsx` (~64) and `src/components/archetypes/raw-input/native-field.tsx` (~269) — so every fixed-width SelectTrigger / SegmentedControl / ToggleField / NativeField label in every consumer is affected. Seen in controlling-app `DeckGroupSelect` with the label "Konsolidierungsgruppe".

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `JoinedLabelText`, pass `title={children}` when `typeof children === "string"`; leave non-string (ReactNode) children without a title.
- [ ] Add a render test (vitest, beside the other `src/components/ui/*.test.tsx`) covering string children (title present, equals the text) vs ReactNode children (no title attribute).

## Acceptance

- A truncated joined label shows its full text as the native `title` tooltip on hover.
- Non-string children render unchanged: no `title` attribute.
- No other `JoinedLabelText` caller renders a joined label without the title — all four callers get it from the shared component, none sets its own.
- The new render test passes for string and ReactNode children.

## Related

- [[joined-label-floor-too-small]] — same label cell, floor width
- [[joined-label-shrinks-before-value]] — same label cell, shrink order
- [[pageframe-filter-sheet-long-label-truncation]] — archived, same label cell
- [[native-field-joined-label-sheet-column]] — NativeField joined label
