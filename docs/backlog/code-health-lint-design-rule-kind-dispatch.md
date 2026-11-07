---
area: code-health
opened: 2026-11-04
status: ready
value: normal
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: 2026-11-04T00:00:00Z
---

# Replace lint-design's five rule-kind boolean flags with one dispatch table

## Context

`scripts/lint-design.mjs` doubled in a month (354 -> 680 lines, 7 commits since 2026-10-04). Most growth is one pattern: each new file-level check was added as one more boolean rule flag (`swallowedSlots`, `toolbarTabs`, `toolbarSwitch`, `handRolledCombobox`, `pageShell`), and each flag is threaded by hand through four places: (1) the header comment, lines 1-91, one paragraph per flag; (2) `compileRules` line 447, a 5-way `||` chain swapping in the never-matching sentinel `'(?!)'`; (3) the `compileRules` return object, one copied field per flag; (4) `scanFile`, which destructures 14 fields and runs an `if (flag) { push; continue; }` ladder of 5 branches that each build the same `{file,line,col,rule,severity,message}` object. The `toolbarTabs` and `toolbarSwitch` branches are byte-identical apart from the `findToolbarTabs` arguments.

Cost: a sixth check means four distant edits. Forgetting the sentinel `||` makes the rule fall through to the regex path with `pattern` undefined, which compiles `<undefined(?=...)`, matches nothing, and reads as a clean scan — the same silent-disarm the `CompileError` reachability check exists to prevent (see [[lint-design-include-reachability-guard]]). The file ships to consumers (`package.json` `files`) and must stay zero-dependency and single-file (per [ADR-0003](/docs/adr/0003-adherence-lint-zero-dep-scanner.md)). Rules 10 and 12 in [docs/RULES.md](/docs/RULES.md) are enforced through these checks.

Fleet configs checked 2026-11-04 (design-baseline, brickshop-manager, gebo-stock-kiosk, hk-sales-agent/web, controlling-app `_adherence.json`): no rule sets two flags, or a flag plus `pattern`/`tag`, so first-match resolution changes no current behaviour.

## What to do

- [ ] Define one in-file `FILE_CHECKS` table in `scripts/lint-design.mjs`, rule-key -> `(text, rule, fileRel) => [{line, col, message}]`, wrapping the existing `find*` functions.
- [ ] Resolve it once in `compileRules` as `check`; drop the 5 per-flag return fields and the `'(?!)'` sentinel.
- [ ] Throw a `CompileError` naming the rule when it has no `pattern`, no `tag` and no known check key.
- [ ] Collapse the `scanFile` ladder to one `if (check)` branch, keeping the `pageShell` grandfathered logic inside its table entry.
- [ ] Shrink the header paragraphs to one list next to the table.

## Acceptance

- `node --test scripts/lint-design.test.mjs scripts/lint-design-core.test.mjs` passes.
- `scanFile` has at most 3 `continue` statements (include, exclude, alias skip; 7 today).
- An `_adherence.json` rule with no `pattern`, no `tag` and no check key makes `lint-design` exit non-zero and name the rule.
- After the change, adding a new file-level check touches only `FILE_CHECKS` plus its `find*` function; output of existing rules is unchanged for every fleet `_adherence.json`.

## Related

- [[lint-design-include-reachability-guard]]
- [[adherence-lint-bare-switch-in-toolbar]]
- [ADR-0003](/docs/adr/0003-adherence-lint-zero-dep-scanner.md) — zero-dep scanner
- [docs/RULES.md](/docs/RULES.md) — rules 10 and 12
