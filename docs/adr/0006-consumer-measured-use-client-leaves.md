# 0006 — "use client" is consumer-measured per leaf, not barrel-only — with verify-exports invariant 7

- **Status:** Accepted
- **Date:** 2026-09-08
- **Overrides (narrowing):** P4 of the `archetype-convergence` design spec (`docs/superpowers/specs/2026-08-17-archetype-convergence-design.md:474`), which set the directive boundary at one-per-exported-barrel.
- **Extends:** the zero-dep invariant precedent of ADR-0003 as instantiated by `scripts/verify-exports.mjs`.

## Context

P4 chose the barrel level because a directive "marks a module boundary, so one
per barrel covers its whole subtree" — true *for a bundled import* of the
barrel. But the package's `exports` map also publishes direct source subpaths:
`./ui/*` → `./src/components/ui/*.tsx`, plus the `layout/`/`archetypes/` trees
a consumer resolves leaf-by-leaf through `node_modules/`. A leaf reached this
way does **not** inherit the barrel's directive: for `React.createContext` and
siblings, the `"use client"` marker is per-module, and a context created in a
server-evaluated module is the wrong instance for the client bundle. The
phase-`consumer-migration` dry run proved it: a scratch consumer of `#v0.2.0`
with a single deleted project copy (`ui/sidebar.tsx`), so the import resolved
to the package copy, crashed `next build` page-data collection with
`TypeError: …createContext is not a function`; patching the directive onto the
package copy in place eliminated the crash. hk-crm's vendored corpus (the first
measured consumer) independently settled the placement: its copies carry the
directive on 38 `ui/` + 16 `layout/` + 49 `archetypes/` leaves — and 97 of
those paths exist in the donor. The donor's own gallery is a client-rooted SPA
(`createRoot` in `gallery/main.tsx`), so the directive was never load-bearing
in-house, and invariant 3 (barrels only) could not see the gap.

## Decision

**Carry `"use client";` on the first line of every donor leaf whose first
measured consumer's vendored copy carries it, and guard it as `verify-exports`
invariant 7.**

- **Per-leaf, not barrel-only.** For the 97 leaves of the consumer-measured
  set (34 `ui/`, 16 `layout/`, 47 `archetypes/`), the directive is line 1,
  canonical `";"` form — the form the consumer copies and the donor's barrels
  already use. The barrel directives (invariant 3) stay exactly as P4
  established them: they remain correct for the barrel import channel, and
  nothing here re-derives the 24-barrel list.
- **Consumer-measured, not judged.** Which files get the directive is *not*
  a per-leaf SSR-boundary judgement call (the thing P4 wanted to avoid); it is
  an empirical set from the consumer that already pays the SSR cost — where the
  consumer's copy carries the directive, the packaged leaf must too. The seven
  donor `ui/` leaves with no consumer-side directive (`accordion`, `calendar`,
  `cell-input`, `color-field`, `icon-avatar`, `progress`, `segmented-control`)
  are left directive-free for now: no measured consumer needs one. This is the
  ticket's own item-2 rule — re-derive the list from the consumer when the set
  moves, rather than freezing a guessed boundary.
- **Guarded by invariant 7 over a frozen, provenanced set.**
  `scripts/consumer-directive-set.json` records the 97 paths plus `source`
  (consumer, commit, branch, date, method). The donor cannot reach hk-crm at
  verify time, so the set is committed; a set file is missing/unreadable →
  invariant FAIL (loud, not silent), a leaf missing its line-1 directive →
  FAIL, a leaf file deleted → FAIL. Synthetic fixtures in
  `scripts/verify-exports.test.mjs` cover clean/dropped/missing-set shapes and
  the CLI exit path, so the guard cannot fail open on the real tree.

## Why (a) per-leaf over (b) keeping P4 as-is

(b) costs the donor nothing and fails only at the consumer's build — exactly
the failure mode the phase-pkg dry run exists to kill before it ships. It
would also make every future consumer re-discover the asymmetry by hand. (a)
is 97 mechanical first lines plus one invariant over a committed set; the cost
is that a consumer set move requires re-deriving the file (documented in its
header), and that a leaf newly added to `ui/` is uncovered until the next
measurement pass — bounded, and the same trade the runbook's normalisation
step (stamp/directive/imports) already imposes on the migration.

## Consequences

- `node scripts/verify-exports.mjs` gains a seventh row and reports `7/7 ok`
  on the fixed tree; its header and this ADR are the standing explanation of
  the difference from invariant 3.
- Consumers resolving `ui/`, `layout/`, or `archetypes/` leaves through the
  package get client-rooted modules without touching the consumer copy — the
  C2 project-first shadowing deletion becomes directive-safe for the whole
  measured set, not only where the consumer happens to keep a copy.
- The spec's P4 line and ADR-0004's ground citations keep their historical
  counts (frozen at the time of writing); this ADR is the narrowing record.
- A future directive *addition* on a consumer leaf is additive (re-derive,
  add, ship). A consumer *removing* a directive is out of scope for the guard:
  the invariant pins the donor's leaves to the last measured set, and a
  consumer dropping its own directive re-triggers exactly the crash class this
  ADR closes.
- Tooltip (`ui/tooltip.tsx`) pre-dated this rule as the single lone carrier,
  in the non-canonical blank-first-line, no-semicolon form; it is now on the
  same line-1 canonical form as every other carried leaf.
