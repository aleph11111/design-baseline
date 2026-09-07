# 2026-09-07 — ADR-0004 `ui/`-stays-vendored clause narrowed by spec decision P2

**Scope:** the "`src/components/ui/` primitives **stay vendored**" bullet in
[ADR-0004's distribution split](../adr/0004-appearance-locality-derived-vs-inherited.md).
Recorded per spec decision P2 ("a consumer deletes its vendored copy and
re-points `@/components/ui/*` at the package … Narrows ADR-0004's '`ui/` stays
vendored' clause … recorded as an amendment to that ADR, not a silent
reversal").

## What changed

Phase `pkg` ships `src/components/ui/` *in* the source package (the
`./ui/*` exports subpath plus the `files` scope). From the first
package-consuming project onwards, `ui/` is no longer a copy-only layer:
it has one source of truth in the donor and consumers point their
`@/components/ui/*` alias at `node_modules/design-baseline/src/components/ui/*`.
The vendored-copy model stays alive only for projects that take the shell /
tokens but never an archetype (the package's 141 archetype→ui edges mean
archetype consumption ships `ui/` with it).

## Why this is an amendment, not a reversal

ADR-0004's rationale for the vendored copy-in: *"They are leaves, they do not
drift — the fleet's copies are byte-identical — and copy-in is correct for
them."* That rationale survives unchanged in kind but weakens in force:

1. **Byte-identical copies become byte-identical dependencies.** The drift
   the ADR was neutralising (fleet copies diverging from the donor) is now
   structurally impossible — there is one copy.
2. **The leaf / governance status is untouched.** `ui/` primitives remain
   out of the appearance-prop governance (ADR-0004 Amendment 2026-09-06)
   and out of the `_adherence.json` archetype-layer rules. P2 moves the
   *distribution* of `ui/`, not the *governance* of it.
3. **The copy channel is not retired.** Until the last project migrates
   off a vendored copy, the `cp -R` channel — and `ui/`'s place in it —
   stays valid; P2's package channel and the copy channel coexist through
   the migration overlap (relative import paths keep both working, per P1).

## The narrowed reading (for a re-deriving reader)

- A project that installs the package and takes any archetype takes `ui/`
  from the package; its vendored copies are deleted, not kept and
  re-synced.
- A project that takes only the shell + tokens layer may still vendor
  `ui/` per the original ADR-0004 bullet; nothing in this narrowing forces
  those projects off copy-in.
- The ADR-0004 "they do not drift" sentence now reads: *they do not drift
  *when packaged*; fleet copies remain byte-identical while the copy
  channel lives.*

**Not a new ADR** — the ruling itself (appearance locality) is untouched;
this is the distribution-layer bookkeeping the spec says P2 requires. If
the fleet's last vendored consumer migrates off the copy channel, the
original bullet can be retired outright by an ADR-0004 amendment of its
own — at that point the vendored-copy model has no remaining member.
