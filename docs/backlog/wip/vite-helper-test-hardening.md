---
area: tooling
opened: 2026-09-29
status: ready
value: low
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-09-29T20:30:00Z
---

# Harden the vite helper tests and type stub

## Context

Review of PR #369 (v0.2.27) left three small gaps around `src/vite/design-baseline-ui.test.ts` and `src/vite/design-baseline-ui.d.mts`. The test's `mkdtempSync` fixture directory is never removed, so every run leaves a `db-vite-*` directory in the OS temp dir. The `.d.mts` is kept in step with `design-baseline-ui.mjs` by a comment alone. The tests cover a consumer copy shadowing the package only for `layout/`, not for `ui/`, which also went through the resolver refactor.

## What to do

- [ ] Remove the fixture root in `design-baseline-ui.test.ts` with an `afterAll(() => rmSync(root, { recursive: true }))`.
- [ ] Add a small type-level test that imports every export of `design-baseline-ui.mjs` through `design-baseline-ui.d.mts`, so an added or renamed export fails `tsc`.
- [ ] Add a test where a consumer copy under `ui/` shadows the package, mirroring the existing `layout/` case.

## Acceptance

- After `npm test`, no `db-vite-*` directory is left in the OS temp dir.
- Renaming an export in `design-baseline-ui.mjs` without updating the `.d.mts` fails `npx tsc --noEmit`.
- The `ui/` shadowing test fails when the resolver stops preferring the consumer copy, and no other resolver path (`layout/`, `ui/`) lacks a shadowing case.

## Related

- [[package-vite-consumer-dev-wiring]]
