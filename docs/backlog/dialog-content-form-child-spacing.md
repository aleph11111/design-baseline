---
area: ui
opened: 2026-11-13
status: ready
value: normal
model: sonnet
model_reason: one-class change in a primitive plus a render test; cause established
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-13T00:00:00Z
---

# DialogContent form child gets no vertical spacing

## Context

`DialogContent` in `src/components/ui/dialog.tsx:53` spaces its children with `grid gap-4`, which only applies to DIRECT children. A `<form>` wrapper (needed for Enter-to-submit) becomes the only child, so `DialogHeader` / `Input` / `DialogFooter` inside it get no gap: footer buttons sit flush (0px) under the last input, and the focused input's ring overlaps the buttons' top edge. Seen in controlling-app 'Neue Vorlage' (`src/app/admin/dashboard-templates/page.tsx:139`). The baseline works around it by hand in `src/components/archetypes/native-browser-dialog/usePrompt.tsx:84` (`<form className="grid gap-4">`). Consumers that miss the workaround are broken: controlling-app `dashboard-templates/page.tsx:139` and `workspace/scenarios/page.tsx:381`, brickshop-manager `src/components/email/block-editor/properties/RichTextInput.tsx:159`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Add `[&>form]:grid [&>form]:gap-4` to `DialogContent`'s class list in `src/components/ui/dialog.tsx` so a direct `<form>` child inherits the 16px spacing.
- [ ] Add a render test: `<DialogContent><form><DialogHeader/><Input/><DialogFooter><Button/></DialogFooter></form></DialogContent>` asserts the content node carries the `[&>form]:grid [&>form]:gap-4` classes.
- [ ] Drop the now-redundant `className="grid gap-4"` on the form in `usePrompt.tsx:84` (optional; harmless if kept).
- [ ] Bump the version and release a tag so consumers can bump their pin.
- [ ] PR note for consumers: controlling-app drops the manual `mt-4` on the Input at `dashboard-templates/page.tsx:156`, else 32px above the input. Known caveat: a direct form child using `space-y-*` would get doubled spacing (none found in current consumers).

## Acceptance

- The markup above renders header / input / footer with 16px gaps; the footer no longer sits flush under the input.
- No other direct `<form>` child of `DialogContent` (crud-dialog, native-browser-dialog, any form-in-dialog call site in `src/`) loses or doubles its spacing.
- `usePrompt` renders unchanged after the redundant class is removed.
- A tag is released after the change merges.

## Related

- [[archetype-convergence-crud-dialog-close-api]]
- [[crud-dialog-footer-submitting-label]]
