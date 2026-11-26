---
area: a11y
opened: 2026-11-22
status: done
model: sonnet
model_reason: "one-line forward in a single primitive plus a render test; cause established"
value: normal
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-22T00:00:00Z
---

# Progress primitive must forward value to Radix Root

## Context

`src/components/ui/progress.tsx:9` destructures `value` from props and uses it only for the Indicator's `translateX` transform; it never passes `value` to `ProgressPrimitive.Root`. Every `<Progress value={40} />` therefore renders `data-state=indeterminate` with no `aria-valuenow` on `role=progressbar`, so screen readers announce no value. Repro: render `<Progress value={40} />` and inspect the `role=progressbar` element. Consumer behandlungskompass works around it by passing `aria-valuenow` explicitly in `src/app/(portal)/portal/page.tsx`; consumers should drop that after bumping design-baseline. Audit of `src/components/ui/*.tsx` found no other wrapper that swallows a Radix root prop: `DropdownMenuCheckboxItem` (`checked`) re-passes it explicitly, the rest spread `...props`.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] In `src/components/ui/progress.tsx`, pass `value={value}` to `ProgressPrimitive.Root` (keep it destructured for the Indicator transform).
- [ ] Add a render test in `src/components/ui/progress.test.tsx` asserting the progressbar element exposes `aria-valuenow`.
- [ ] Bump the package version per `docs/RULES.md` and note in the PR that consumers (behandlungskompass) can drop their explicit `aria-valuenow` workaround.

## Acceptance

- `<Progress value={40} />` renders `role=progressbar` with `aria-valuenow="40"` and `data-state=loading`.
- `<Progress />` with no value still renders as indeterminate, unchanged.
- No other `src/components/ui/` wrapper destructures a Radix root prop without forwarding it to its primitive; every similar wrapper passes the prop through.

## Related

- [[progress-stepper-aria-current]] — earlier a11y pass on the progress primitives
