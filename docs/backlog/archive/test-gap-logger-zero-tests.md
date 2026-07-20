---
area: test-gap
opened: 2026-07-19
status: ready
---

# logger's NODE_ENV-gated debug branch has zero test references

## Context

`src/utils/logger.ts` exports `logger` (`debug`/`info`/`warn`/`error`), required by `src/components/ui/error-boundary.tsx` and documented in `docs/ARCHITECTURE.md` as core `src/` infrastructure. A repo-wide search (`grep -rl "logger" src --include="*.test.*"`) finds zero test references — the module is completely unexercised by the test suite.

The `debug` method's branch is exactly the kind of thing worth pinning down: it guards on `typeof process !== "undefined" && process.env.NODE_ENV !== "production"`, and the file's own comment records that an earlier Vite-only variant (`import.meta.env.DEV`) broke under Next.js builds ("see hk-crm regression"). That history means this environment-detection logic has already regressed once in the field with no test to catch a repeat — e.g. a future edit reintroducing a Vite-only or Next-only env check.

## What to do

- [ ] Add `src/utils/logger.test.ts` covering: `logger.debug` calls `console.debug` when `process.env.NODE_ENV` is not `"production"`.
- [ ] Test `logger.debug` is a no-op when `process.env.NODE_ENV === "production"`.
- [ ] Test `logger.debug` doesn't throw when `process` is undefined (simulating a non-Node/non-bundled environment).
- [ ] Test `logger.info`/`warn`/`error` always forward to their respective `console` methods regardless of `NODE_ENV`.

## Acceptance

- `logger.test.ts` exists and passes under `npm test`.
- A test fails if the `NODE_ENV` production gate on `debug` is removed or inverted.

## Related

- `src/components/ui/error-boundary.tsx` — the sole current consumer of `logger`.
