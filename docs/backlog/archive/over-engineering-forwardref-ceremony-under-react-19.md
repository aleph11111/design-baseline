---
area: over-engineering
opened: '2026-08-26'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-26T17:17:19.293Z'
model: sonnet
model_reason: >-
  the replacement pattern already exists in this repo (SurfaceFrame's `ref` prop) — four mechanical
  rewrites with existing tests covering ref forwarding
---

# Drop React.forwardRef from the four baseline-authored archetype components

## Context

React 19 passes `ref` as an ordinary prop to function components; `forwardRef` is legacy ceremony. `docs/STACK.md` pins React 19.x as the UI runtime, and this repo already demonstrates the native pattern: `src/components/layout/SurfaceFrame.tsx:47` declares `ref?: React.Ref<HTMLDivElement>` in its props type and passes it straight through, with no wrapper.

Four baseline-authored components still use the wrapper:

- `src/components/archetypes/list-with-detail/ListWithDetailShell.tsx:280` is the worst case. Because `forwardRef` erases the component's generic, the export is `React.forwardRef(ListWithDetailShellInner) as <Row>(props: ListWithDetailShellProps<Row> & { ref?: React.Ref<HTMLDivElement> }) => React.ReactElement | null` — a wrapper, then a cast that re-declares by hand exactly the signature React 19 would have given for free, then a *second* cast at `:286` (`(ListWithDetailShell as { displayName?: string }).displayName = …`) because the assertion destroyed the component type. The header comment even names the constraint being worked around: *"use forwardRef wrapper to preserve generic while satisfying forwardRef's constraint that the component have a stable identity."*
- `src/components/archetypes/kanban-board/BoardCard.tsx:12` and `BoardColumn.tsx:20` — `React.forwardRef<HTMLDivElement, Props>((props, ref) => …)`, both purely so the consumer can attach a DnD draggable.
- `src/components/archetypes/raw-textarea/TextareaField.tsx:54` — `React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(…))`.

`src/components/archetypes/matrix-grid/MatrixGridShell.tsx:172-177` shows where this ends up: it no longer calls `forwardRef` at all, but still carries the generic re-cast, the `as { displayName?: string }` cast, and a comment referring to "forwardRef wrapping" that no longer happens. The pattern is being copied by inertia.

These are archetype **reference primitives** — the code `/style-archetypes` copies into every consumer — so each wrapper is duplicated across the fleet, and each `as` cast is a place where a genuine prop-type mistake stops being caught by `tsc`. That last point is why this is worth doing rather than leaving: the casts defeat `strict` mode on the public contract of the fleet's most-used shell.

Out of scope: `src/components/ui/`. Those are vendored shadcn leaves that ADR-0004 keeps byte-identical across the fleet, and 34 of them use `forwardRef` upstream.

## What to do

- [ ] Rewrite `ListWithDetailShell` to export the generic `ListWithDetailShellInner` function directly, with `ref?: React.Ref<HTMLDivElement>` added to `ListWithDetailShellProps`, deleting the `forwardRef` call, the `as <Row>(…)` assertion and the `as { displayName?: string }` cast.
- [ ] Convert `BoardCard` and `BoardColumn` to plain function components taking `ref` as a prop, keeping the `...rest` spread the DnD consumers rely on.
- [ ] Convert `TextareaField` to a plain function component taking `ref?: React.Ref<HTMLTextAreaElement>` as a prop.
- [ ] Delete the now-inaccurate "forwardRef wrapping" comment and the `as { displayName?: string }` cast in `MatrixGridShell.tsx:172-177`, and the matching cast in `GroupedListSection.tsx:122`, replacing each with a plain `displayName` assignment (or dropping it where the component is a named function declaration).
- [ ] Leave `src/components/ui/**` untouched — vendored shadcn leaves stay byte-identical per ADR-0004.
- [ ] Check whether the `.baseline.md` reference-implementation docs for `list-with-detail`, `kanban-board` and `raw-textarea` describe the ref plumbing, and update the binding if so (the stack-agnostic `<slug>.md` contracts must not mention it — RULES.md hard rule 3).

## Acceptance

- `grep -rn "forwardRef" src/components/layout src/components/archetypes` returns no matches.
- `grep -rn "as { displayName" src` returns no matches.
- `ListWithDetailShell`'s exported type is inferred, not asserted: passing a `columns` entry whose `key` does not exist on `Row` is a `tsc` error, where the `as <Row>(…)` cast previously allowed the shell's own signature to drift from `ListWithDetailShellProps`.
- A ref attached to `<BoardCard ref={…}>`, `<BoardColumn ref={…}>`, `<TextareaField ref={…}>` and `<ListWithDetailShell ref={…}>` still resolves to the underlying DOM node — assert `ref.current` is an `HTMLElement` in each component's test.
- `npx tsc --noEmit` and `npm test` pass, and the kanban and raw-textarea demos still render in `npm run gallery:build`.

## Related

- [docs/adr/0004-appearance-locality-derived-vs-inherited.md](../../adr/0004-appearance-locality-derived-vs-inherited.md) — the leaf-vs-composition split that keeps `src/components/ui/` out of scope here.
- [docs/STACK.md](../../STACK.md) — pins React 19, the version that makes `ref` a plain prop.
- [src/components/layout/SurfaceFrame.tsx](../../src/components/layout/SurfaceFrame.tsx) — the in-repo component that already uses the target pattern; copy its shape.
- [archive/refactor-matrix-grid-cell-and-head-extraction.md](../archive/refactor-matrix-grid-cell-and-head-extraction.md) — recent work in `MatrixGridShell.tsx`, the file carrying the stale forwardRef comment.
