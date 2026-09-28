---
area: layout
opened: '2026-09-28'
status: done
value: high
model: sonnet
model_reason: "one class on one div plus one test assertion; cause measured by the consumer"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-28T15:00:00Z'
---

# AppShell content column lacks min-w-0 so wide content scrolls the page

## Context

`src/components/layout/AppShell.tsx:34` wraps `{header}` and `<main>` in `<div className="flex-1 flex flex-col">`. That div is a flex item of the `h-svh flex w-full` row, and a flex item's default `min-width: auto` keeps it from shrinking below its content's width. Wide content, such as a wide table inside `<main>`, therefore stretches the column and `<main>` past the viewport. The whole page then scrolls horizontally instead of the table's own `overflow-x-auto` container. mistra measured page-level horizontal scroll at 1440px; setting `min-width: 0` on that column fixes it. The same `min-w-0 flex-1` idiom is already how `ListWithDetailShell`'s body column (`src/components/archetypes/list-with-detail/ListWithDetailShell.tsx`) lets its `overflow-x-auto` region scroll.

## What to do

- [x] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [x] Add `min-w-0` to the content-column div in `src/components/layout/AppShell.tsx` (`flex-1 flex flex-col` → `min-w-0 flex-1 flex flex-col`).
- [x] Add an assertion to `src/components/layout/AppShell.test.tsx` that the column wrapping `<main>` carries `min-w-0`.
- [x] Bump the package patch version.

*(v0.2.17. The grep found no other page-content flex column in `src/components/layout/`; the BottomNav items are nav buttons, not content wrappers.)*

## Acceptance

- The AppShell content column renders with `min-w-0`, and a wide table inside `<main>` scrolls in its own `overflow-x-auto` container while the page no longer scrolls horizontally at 1440px.
- No other flex column in `src/components/layout/` that wraps page content is left without `min-w-0`.

## Related

- [appshell-sonner-opt-out.md](appshell-sonner-opt-out.md) — same file, adds `AppShell.test.tsx` (PR #339); fold this in if that PR is re-touched
- [list-with-detail-full-bleed-nested-leak.md](../list-with-detail-full-bleed-nested-leak.md) — the sibling AppShell content-column report from the same mistra adoption
