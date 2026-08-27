---
area: over-engineering
opened: '2026-08-26'
status: ready
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-26T17:17:19.296Z'
model: sonnet
model_reason: >-
  small deletion, but the break condition is downstream — needs a fleet grep before cutting, which
  is a scoped judgment call not a design one
---

# Cut the logger facade down to the one method that carries logic

## Context

`src/utils/logger.ts` exports a four-method logger. Three of the four are zero-logic pass-throughs:

```ts
info: (...args: LogArgs) => { console.info(...args); },
warn: (...args: LogArgs) => { console.warn(...args); },
error: (...args: LogArgs) => { console.error(...args); },
```

Only `debug` does anything a caller could not write inline — it gates on `process.env.NODE_ENV !== "production"`, and the ambient `declare const process` above it exists solely so that gate typechecks without `@types/node` (the framework-agnostic trick the file's own comment documents, added after an `import.meta.env.DEV` variant broke under Next builds).

The consumer side is one call site. `src/components/ui/error-boundary.tsx:33-34` is the only importer in the repo, and it uses `logger.error` twice. `logger.debug`, `logger.info` and `logger.warn` have **zero** callers in `src/`, `gallery/` or `.design-sync/` — the only other references are in `src/utils/logger.test.ts`, which tests the delegation itself (`it.each(levels)("logger.%s forwards to the matching console method")`). A test asserting that `logger.warn` calls `console.warn` is the clearest signal that the wrapper adds nothing: the assertion and the implementation are the same statement.

`docs/ARCHITECTURE.md` §3 lists the file as "console wrapper required by `ui/error-boundary.tsx`", which is accurate and is also the whole justification — one consumer, one method.

The one real consideration is that this file is **copy-source**: `/style-baseline` copies `src/utils/`, so a downstream project may import `logger.warn` even though the donor does not. That makes the fleet grep a prerequisite, not the deletion itself questionable — and if a consumer does call `logger.warn`, the honest finding is that the *baseline* should not be the one shipping it.

## What to do

- [x] Grep the fleet (`hk-crm`, `controlling-app`, `mistra`, `brickshop-manager`, `my-finance-app`, `pmo`, `dashboard`) read-only for `logger.info`, `logger.warn` and `logger.debug` call sites, and record the counts in this ticket before cutting. (Counts below.)
- [x] Delete `info`, `warn` and — if the grep finds no consumer — `debug` from `src/utils/logger.ts`, leaving `error` as the single exported method that `ui/error-boundary.tsx` needs. (`debug` does have consumers — see below — so the reduced surface is `error` + `debug`, per the next bullet.)
- [x] If `debug` survives the grep, keep it plus its ambient `process` declaration and the comment explaining why `import.meta.env.DEV` was rejected — that is the one method with real logic.
- [x] Trim `src/utils/logger.test.ts` to the surviving methods, dropping the `it.each(levels)` delegation block, which asserts nothing beyond `console` itself.
- [x] Update the `src/utils/logger.ts` row in `docs/ARCHITECTURE.md` §3 and the `src/utils/` line in `docs/STYLE.md` to describe the reduced surface. (`docs/STYLE.md` also had a stale claim that `debug` was gated on `import.meta.env.DEV` — corrected to the `process.env.NODE_ENV` guard the code actually uses.)
- [x] ? If the grep shows the fleet genuinely wants a logging facade, file a follow-up to promote it as a real archetype rather than leaving it as an un-versioned util — do not widen it back here. (Filed: `promote-logger-to-archetype`.)

## Fleet grep results (2026-08-27, read-only, pre-cut)

Method: scan keyed on `import { logger } from .../utils/logger` (the `/style-baseline` copy location) so only actual *copied-facade* consumers are counted — not unrelated pino/winston `logger` variables in the same repos. `node_modules` and dot-directories (`.worktrees/` mirrors, `.captures/` snapshots) pruned.

| repo | facade copy | importer files | `.debug` | `.error` | `.info` | `.warn` |
|---|---|---|---|---|---|---|
| `brickshop-manager` | yes — `src/utils/logger.ts` (original four-method copy) | 44 | 158 | 21 | 9 | 2 |
| `controlling-app` | yes — `frontend/src/utils/logger.ts` | 0 (copy is orphaned) | 0 | 0 | 0 | 0 |
| `hk-crm` | no | 0 | 0 | 0 | 0 | 0 |
| `mistra` | no | 0 | 0 | 0 | 0 | 0 |
| `my-finance-app` | no | 0 | 0 | 0 | 0 | 0 |
| `pmo` | no | 0 | 0 | 0 | 0 | 0 |
| `coding-dashboard` (the ticket's `dashboard`; `~/.claude/dashboard` does not exist on this host) | no | 0 | 0 | 0 | 0 | 0 |

Raw `logger.info|warn|debug` substring hits in `hk-crm` (13 files), `controlling-app` (44) and `mistra` (9) are unrelated loggers (own/pino), none of them the copied facade — they do not count.

Verdict: `debug` **survives** the grep (brickshop-manager, 158 call sites — the dominant level in practice). `error` has the donor's own `ui/error-boundary.tsx` call site. `info`/`warn` are cut from the donor; the 9/2 downstream brickshop call sites keep working against the copy they already have, and if brickshop wants those levels re-supplied from baseline that is what the promotion follow-up exists for — the donor does not widen back.

## Acceptance

- `grep -n "info:\|warn:" src/utils/logger.ts` returns no matches.
- `src/components/ui/error-boundary.tsx` still logs both the error and the component stack, and its existing behaviour is unchanged — `npm test` passes.
- `npx tsc --noEmit` passes with no unused-export or unused-local error (`noUnusedLocals` is on).
- `src/utils/logger.test.ts` no longer contains an assertion whose body is "the wrapper calls the identically named `console` method".
- After the change, every method exported from `src/utils/logger.ts` either has a call site in `src/` or has a recorded fleet consumer named in this ticket.

## Related

- [archive/test-gap-logger-zero-tests.md](../archive/test-gap-logger-zero-tests.md) — added the test suite this ticket trims; the delegation tests it introduced are the evidence the delegation is empty.
- [src/utils/logger.ts](../../src/utils/logger.ts) — the facade.
- [src/components/ui/error-boundary.tsx](../../src/components/ui/error-boundary.tsx) — the single consumer, and the only method it uses.
