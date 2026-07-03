---
area: tooling
opened: 2026-06-16
status: done
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-06-16T12:38:26Z
---

# Add a stack-aware preflight to /style-baseline so it refuses incompatible targets

## Context

`/style-baseline` (`~/.claude/commands/style-baseline.md`) hard-assumes the baseline runtime: Tailwind 4 (`@theme` + `src/styles/tokens.css`), a Vite-shaped project, ~42 shadcn components, and ~15 Radix packages. It has no preflight that checks the *target* project's stack before installing.

Run against a divergent consumer, this corrupts the project silently rather than failing fast. The `frontend-design-baseline-adoption` attempt in controlling-app (Tailwind 3 + `@tailwind` directives + `tailwind.config.js`, Next 16, tokens in `globals.css :root`) showed the failure mode: `--force` would install Tailwind 4 over a Tailwind-3 build, drop a dead `tokens.css` the project never imports, and add components that don't typecheck against the project's deps. The skill's own final "Verify it builds" step would fail — but only *after* the destructive writes.

## What to do

- [x] Add a preflight step at the top of `/style-baseline` that detects the target's CSS/Tailwind stack — presence of `tailwind.config.js` + `@tailwind` directives (v3) vs `@theme` + `tokens.css` (v4) — and the bundler (Vite vs Next).
- [x] On a Tailwind-3 / non-Vite target, **abort before any write** with a clear message: the baseline install requires a Tailwind 3→4 (and bundler) migration epic, and the consumer should use the archetype-contract audit path instead.
- [ ] ? Optionally emit a Tailwind-3-compatible variant of the install instead of refusing — larger investment; defer unless more than one consumer needs it. **Deferred** — only one consumer (controlling-app) needs it; the abort + audit-path handoff is the sanctioned route until a second consumer appears.

## Acceptance

- Running `/style-baseline` (with or without `--force`) against a Tailwind-3 / Next target aborts with an explanatory message and writes **no** files — the project's build is left untouched.
- Running against a Tailwind-4 / Vite target behaves exactly as today (no regression on the happy path).
- The abort message names the archetype-contract audit as the supported path for divergent stacks.

## Related

- [docs/PLUGIN-CONTRACT.md](../PLUGIN-CONTRACT.md)
- [docs/CHOOSING-A-SURFACE.md](../CHOOSING-A-SURFACE.md)
- [decouple-archetype-contract-from-reference-impl.md](decouple-archetype-contract-from-reference-impl.md) — the audit path this abort message should point divergent consumers toward
- `/style-baseline` command — `~/.claude/commands/style-baseline.md`

## Open question

Surfaced by the `frontend-design-baseline-adoption` ticket in the controlling-app project.

## Resolution (2026-07-03)

Done on feat/style-baseline-stack-aware-preflight. Added a **CSS/Tailwind stack gate** to `~/.claude/commands/style-baseline.md` as new step **2b** — after stack detection (step 2), before the collision check and any file write (step 3), so `--force` cannot bypass it (force only overrides collisions, never a stack mismatch).

The gate is version-gated, not bundler-gated: it reads the target's `tailwindcss` pin from `package.json` (primary signal) and falls back to a `tailwind.config.*` + `@tailwind base/components/utilities` fingerprint only when tailwind is unpinned. It emits a deterministic `PREFLIGHT VERDICT:` line — `abort:tailwind-vN` for Tailwind ≤3, else `proceed`. A v3 verdict stops the run before any write and prints an abort message that (a) confirms no files were written, (b) frames the install as a Tailwind 3→4 (and bundler) migration epic out of scope for the command, and (c) points divergent consumers at the archetype-contract fit & drift audit (`docs/FLEET-AUDIT.md` + `docs/CHOOSING-A-SURFACE.md`, tracked by `decouple-archetype-contract-from-reference-impl`).

Verified by dry-running the gate bash against synthetic targets: Tailwind-3+Next (the controlling-app failure mode) → `abort:tailwind-v3`; Tailwind-2 → `abort:tailwind-v2`; unpinned v3 fingerprint → `abort:tailwind-v3-fingerprint`; Tailwind-4+Vite, Tailwind-4+Next (no-regression), Tailwind-4 with an optional v4 config file, and greenfield/no-tailwind → all `proceed`. The Tailwind-4/Next happy path is preserved — the gate is on Tailwind version, so the command's existing Next.js support is untouched.

The optional Tailwind-3-compatible install variant (third checklist item) is deferred: single consumer today; revisit if a second divergent consumer appears.
