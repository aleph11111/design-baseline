---
area: archetypes
opened: 2026-07-04
status: done
model: sonnet
model_reason: attach-or-drop-the-ref, one-line fix with clear acceptance
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-04T15:42:58Z
---

# Wire or drop the forwarded ref that ListWithDetailShell silently discards

## Context

Severity: **low** (correctness / API-contract). `ListWithDetailShellInner` receives the forwarded ref as `_ref` but never attaches it to any element — the root `<div>` renders with no `ref` (`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx:187` declares `_ref`; `:471` root div has no ref). Yet the exported cast (`:499-503`) publicly advertises `props: ListWithDetailShellProps<Row> & { ref?: React.Ref<HTMLDivElement> }`, so the type system tells adopters ref forwarding works. It does not — any ref they attach stays `null` forever (measuring, scroll-into-view, IntersectionObserver/ResizeObserver, focus management), a silent failure of a promised API. The sibling `MatrixGridShell` preserves its generic without `forwardRef` and does not advertise `ref?`, so this is an isolated inconsistency, not a house pattern.

## What to do

- [ ] Do red/green TDD: add a failing test (introduce `vitest` + `@testing-library/react`; the repo is typecheck-only today) that attaches a ref to `ListWithDetailShell` and asserts `ref.current` is the root element (not null); then make it pass.
- [ ] Attach the ref to the root element: `<div ref={_ref} className={...}>` at ListWithDetailShell.tsx:471 (rename `_ref` → `ref`).
- [ ] Alternatively, if ref support is not intended, drop `ref?` from the exported cast (ListWithDetailShell.tsx:499-503) so the type stops advertising an unwired capability — pick one so the type and implementation agree.

## Acceptance

- A ref passed to `ListWithDetailShell` resolves to the root `<div>` — OR the type no longer advertises `ref?`; the type contract and implementation agree either way.
- Meets the quality bar: SOLID/DRY/KISS, clean and readable, well-tested (red/green), no new TypeScript errors, lint warnings, or test failures.

## Related

- [list-with-detail-column-filter-hoist.md](list-with-detail-column-filter-hoist.md) — same shell, separate defect
- src/components/archetypes/matrix-grid/MatrixGridShell.tsx — the sibling that preserves its generic without advertising ref
