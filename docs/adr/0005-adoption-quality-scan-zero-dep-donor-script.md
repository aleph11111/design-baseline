# 0005 — The adoptionQuality (Axis-C) scan ships as a zero-dep donor script, not a consumer-local scanner

- **Status:** Accepted
- **Date:** 2026-08-25
- **Extends:** the zero-dep scanner precedent of [ADR-0003](0003-adherence-lint-zero-dep-scanner.md); the candidate-not-verdict split of `docs/ADOPTION-QUALITY.md` / `docs/FLEET-AUDIT.md`.

## Context

`docs/audit-signals.json` defines three signal families. Two have a machine
consumer: `molecule` and `conformance`, which the dashboard's `moleculeAudit`
scanner reads from the connected baseline (per
`coding-dashboard/server/rituals-prompts.ts:117`). The third — `adoptionQuality`,
Axis C, the wrapper-adoption tripwires — has had none: its only pass is the
per-page LLM acceptance-gate walk, which runs once, at adoption time. There was
no recurring fleet-wide count for Axis C, and consumer repos (mistra included)
recorded their vendored snapshot of the array as "measured by nobody",
deliberately declining to build a local scanner — the same "never fork the
runner" rule that keeps `scripts/lint-design.mjs` unforked. That gap is the
ticket `docs/backlog/adoption-quality-scanner.md`.

## Decision

**Ship `scripts/scan-adoption-quality.mjs` as the donor-owned, zero-dependency
Axis-C discovery scan** (wired as `npm run scan:adoption-quality`), mirroring
the ADR-0003 shape:

- **Zero-dep by design.** Node only, no ripgrep, no ESLint. The entries' PCRE2
  regexes are run under V8's `RegExp`: every construct the array uses (lookahead,
  tempered windows, the `\1` backreference in `list-button-row-above-shell`) is
  native to JS, and the one divergent PCRE construct — the `\A`/`\Z` string
  anchors of `form-page-missing-errorboundary` — is rewritten to `^`/`$` (the
  same meaning for a single-string input). A test suite asserts `uncompiled === 0`
  on the live file, so the next PCRE-only addition to the array is caught by the
  donor's own CI rather than silently misfiring in the field.
- **Reads the signals, never forks them.** The scan reads the `adoptionQuality`
  array plus the header's `globs`/`exclude` from `docs/audit-signals.json`
  (default `<root>/docs/audit-signals.json`, overridable with `--signals`). A
  consumer vendors the signals file and the script via the existing donor
  file-copy sync and calls the same script — a mistra-authored scanner variant
  is exactly the fork the "never fork the runner" rule forbids.
- **Respects each entry's `coOccursWith` gate**: the gate (a PCRE alternation of
  the archetype's shell import names) is tested against the whole file, so a
  signal fires ONLY on a file that actually adopts the gated archetype.
- **Measures every signal.** Each entry in the array appears in the report; a
  hitless signal reports `hits: []` ("measured, zero"), so a vendored snapshot
  diffs clean against the live file per id — the "measured, not absent"
  guarantee the ticket's acceptance criterion needs.
- **Radar, not ratchet.** A hit is a candidate, never a verdict — the per-page
  LLM acceptance-gate pass remains the decision layer — so the scan exits `0`
  even when red-tier signals fire and carries no threshold flag. It reports; it
  never gates. (The ratchet shape belongs to `lint-design.mjs`, which enforces
  the rubric; this scan measures it.)
- **One hit per signal per file** — the counting unit is the candidate surface
  (a file), matching how the fleet runs the entries by hand (`rg -l` counts
  files, not lines).
- **Its own path**, not an extension of the moleculeAudit read:
  `rituals-prompts.ts:117` documents that scanner as deliberately blind to
  `adoptionQuality`; this script is the new module a dashboard or CLI can call
  the same way `moleculeAudit.ts` is called for the other two families.

## Why (a) over (b)

The alternatives were (b) extending `moleculeAudit.ts` to read the third array,
and (c) a per-consumer scanner. (b) is ruled out by the documented intent of the
dashboard module and would couple the third axis to the dashboard build;
`rituals-prompts.ts:117` warns a proposal must not ask for the wire-in that "does
not exist". (c) violates the never-fork rule and would immediately drift from
the signal file it claims to measure — the 26-vs-30 snapshot gap mistra already
hit. (a) needs nothing but Node at the call site, is testable in the donor's own
CI, and is what a donor repo ships: a script, not a promise.

## Consequences

- Every repo with a vendored `docs/audit-signals.json` can show `adoptionQuality`
  hit counts (on the hub's Radar/Adoption view, in CI, by hand) without writing a
  local scanner — `node scripts/scan-adoption-quality.mjs [--root <repo>]
  [--signals <path>] [--targets <dirs>] [--json]`.
- The donor runs the scan on itself (`npm run scan:adoption-quality`) as its own
  tripwire smoke: the shipped signal set must compile under V8, and the
  hits it reports on `src/` (the `src/examples/*-demo.tsx` surfaces, `crudStrings.ts`,
  `FormPageShell.tsx`/`index.ts`, `CrudDialogSheet.tsx`) are the documented
  expected residuals named in each entry's `smell`, not bugs.
- The dashboard-side wiring (hub calling the script per connected repo and
  rendering the counts) is the consumer-side follow-up this ticket pre-authorizes;
  until then the script is callable by any CLI/CI job.
- `moleculeAudit.ts` stays blind to `adoptionQuality` — the split is load-bearing,
  not an oversight.
- No `MANIFEST.json` / `plugin.version` bump: the script is scan machinery in
  `scripts/`, not a plugin-contract surface; `docs/audit-signals.json` gains the
  signal file's own note pointing at its machine consumer.
- A new PCRE-only construct added to the array (e.g. a PCRE-specific branch)
  fails loud under Node (`uncompiled` in the summary, named in the report) and in
  the donor CI, rather than silently never firing.
