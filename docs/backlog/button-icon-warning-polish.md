---
area: a11y
opened: 2026-09-29
status: ready
value: low
model: sonnet
model_reason: "four scoped edits in one primitive and its test, each with a named cause and fix"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-09-29T08:10:00Z
---

# Button icon a11y dev warning polish after sr-only fix

## Context

Follow-ups from the PR #370 independent review (v0.2.25), which taught the `size="icon"` dev warning in `src/components/ui/button.tsx` (`hasAccessibleName`) to accept a `<span className="sr-only">` child and, under `asChild`, a labeled child. Four gaps remain: the warning text still names only `aria-label`/`aria-labelledby`/`title`; a non-`asChild` child that names itself (`<svg aria-label="Close"/>`, `<img alt="Close"/>`) still warns (false positive); the `console.warn` fires on every render rather than once per instance, spamming consumers (controlling-app, hk-crm) in re-render-heavy views; and `src/components/ui/button.test.tsx` calls `warn.mockRestore()` after the `expect`, so a failing assertion leaks the spy into later tests.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Extend the warning message to name the `sr-only` child option alongside `aria-label` / `aria-labelledby` / `title`.
- [ ] In `hasAccessibleName`, count a direct child element carrying `aria-label` or (for `img`) `alt` as an accessible name, with or without `asChild`.
- [ ] Warn once per mounted instance (e.g. a `useRef` flag or a `useEffect` keyed on the label inputs) instead of on every render.
- [ ] Replace the per-test `warn.mockRestore()` calls in `button.test.tsx` with `afterEach(() => vi.restoreAllMocks())`.

## Acceptance

- `<Button size="icon"><svg aria-label="Close"/></Button>` and `<Button size="icon"><img alt="Close"/></Button>` no longer warn.
- Re-rendering an unlabeled icon Button three times emits exactly one warning.
- The warning text mentions `sr-only`.
- No other self-labeling child shape covered by `hasAccessibleName` regresses: every existing button.test.tsx case still passes.

## Related

- PR [#370](https://github.com/aleph11111/design-baseline/pull/370) — the sr-only / asChild fix these follow up on
- [[progress-stepper-aria-current]] — prior a11y primitive fix
