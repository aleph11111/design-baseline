---
area: test-gap
opened: 2026-07-19
status: done
closed: 2026-07-19
---

# useIsMobile hook has zero direct test coverage of its listener lifecycle

## Context

`src/hooks/use-mobile.ts` exports `useIsMobile`, a core hook required by `src/components/archetypes/list-with-detail/ListWithDetailShell.tsx` to decide rail vs. sheet presentation. The only test-file reference to it is in `ListWithDetailShell.test.tsx`, which polyfills `window.matchMedia` (jsdom has none) purely so the shell can mount without crashing — it does not assert on `useIsMobile`'s own behavior (initial value computation, the `change` listener callback updating state, or the cleanup removing the listener on unmount).

The hook has real logic worth pinning down directly: it registers a `matchMedia` `change` listener, computes `isMobile` from `window.innerWidth` both synchronously on mount and again inside the listener, and removes the listener in the effect cleanup. A regression that drops the cleanup (listener leak) or breaks the resize-triggered recompute wouldn't be caught by the current indirect reference.

## What to do

- [ ] Add `src/hooks/use-mobile.test.ts` (or `.tsx` if using `renderHook` from Testing Library) covering: initial render reflects `window.innerWidth` against the 768px breakpoint.
- [ ] Test that firing the `matchMedia` `change` event (or simulating a resize) updates the returned value.
- [ ] Test that unmounting removes the `change` listener (spy on `removeEventListener`).

## Acceptance

- `use-mobile.test.ts` exists and passes under `npm test`.
- A test fails if the listener cleanup is dropped or the breakpoint comparison is inverted.

## Related

- `src/components/archetypes/list-with-detail/ListWithDetailShell.test.tsx` — only polyfills `matchMedia` to unblock mounting; does not test this hook's own behavior.
