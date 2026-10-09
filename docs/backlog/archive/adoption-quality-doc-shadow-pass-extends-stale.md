---
area: docs
opened: 2026-10-09
status: done
value: low
model: sonnet
model_reason: "one-sentence doc correction against shipped behaviour in #507"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-10-09T00:00:00Z
---

# ADOPTION-QUALITY.md still says the shadow pass ignores tsconfig extends

## Context

`docs/ADOPTION-QUALITY.md:84` says the `shadowed-baseline-file` pass reads "only `<root>/tsconfig.json` … (no `extends`)". Since #507 (`aa252a1`) `scripts/scan-adoption-quality.mjs:244-266` follows relative `extends` (string or array, later wins) and project `references`, honours `exclude`, and skips package `extends` that resolve into `node_modules`. The doc is the Axis-C contract that consumers and the dashboard's design-plugin reader read, so it now under-describes what the scan catches.

## What to do

- [ ] Before editing, grep every caller of the touched function / query pattern; fix at the shared point, not only the call site this report names.
- [ ] Replace the "(no `extends`)" sentence at `docs/ADOPTION-QUALITY.md:84` with the shipped behaviour: relative `extends` and `references` are followed, `exclude` is honoured, package `extends` are skipped.
- [ ] Grep `docs/` (`docs/STYLE.md`, `docs/ARCHITECTURE.md`, `docs/audit-signals.json` descriptions) for the same "no extends" claim and fix every match.

## Acceptance

- `git grep -n "no \`extends\`" -- docs` returns no match after the change, so no other doc line still claims the shadow pass ignores `extends`.
- `docs/ADOPTION-QUALITY.md` names `references` and `exclude` handling for the shadow pass.

## Related

- [[adoption-scan-shadow-pass-follows-tsconfig-extends]]
- [[adoption-scan-flags-shadowed-baseline-files]]
- [ADR-0005](/docs/adr/0005-adoption-quality-scan-zero-dep-donor-script.md) — Adoption-quality scan as a zero-dep donor script
