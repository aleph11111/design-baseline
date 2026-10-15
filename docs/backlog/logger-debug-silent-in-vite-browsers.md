---
area: tooling
opened: 2026-10-15
status: ready
value: normal
model: sonnet
model_reason: "cause established and the fix already exists in the repo (isDevBuild in ListWithDetailShell.tsx); extract and reuse"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-10-15T00:00:00Z
---

# Logger debug output is silently dropped in Vite browser builds

## Context

`src/utils/logger.ts` (shipped as `design-baseline/utils/logger`) gates `logger.debug` on `typeof process !== "undefined" && process.env.NODE_ENV !== "production"`. Vite statically replaces only the literal text `process.env.NODE_ENV` and leaves the bare `process` identifier undefined in the browser. So `typeof process` is `"undefined"` and `logger.debug` never prints in any Vite consumer's dev build (gebo-stock-kiosk, mistra, controlling-app frontends). Next.js is unaffected. Found during PR #570 (ADR-0010), which solved the same problem in `src/components/archetypes/list-with-detail/ListWithDetailShell.tsx` with a `try`-wrapped `isDevBuild()` that reads `process!.env.NODE_ENV` and catches the ReferenceError.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Move `isDevBuild()` from `ListWithDetailShell.tsx` into one shared donor util (e.g. `src/lib/env.ts`). Use it in `logger.debug` and in `ListWithDetailShell.tsx`, and in any other `typeof process` dev-gate the grep finds (check `src/components/ui/error-boundary.tsx` and `src/components/archetypes/settings-table/SettingsTableShell.tsx`, both of which import the logger).
- [ ] Add a vitest case that simulates the Vite browser shape (no global `process`, with the `NODE_ENV` text substituted) and asserts that `logger.debug` calls `console.debug` in development and stays silent in production.

## Acceptance

- In a Vite dev build `logger.debug("x")` emits `console.debug("x")`, and a production build stays silent.
- No other file in `src/` gates dev-only behaviour on `typeof process !== "undefined"`, so every dev gate goes through the shared helper.
- `npx tsc --noEmit` and `npm test` pass under both the Vite-shaped and the Next-shaped test setup.

## Related

- [[promote-logger-to-archetype]]
- [[over-engineering-logger-passthrough-facade]]
- [[list-with-detail-sheet-sizes-to-content]]
