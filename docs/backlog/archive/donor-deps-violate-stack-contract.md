---
area: tooling
opened: 2026-07-20
status: ready
model: sonnet
model_reason: the correct dependency set is already pinned in STACK.md — this is reconciling package.json against an existing contract, no design judgment left
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-20T00:00:00Z
---

# Donor package.json ships the Tailwind-3 animate plugin STACK.md forbids and omits tw-animate-css

## Context

`package.json:44` lists `"tailwindcss-animate": "^1.0.7"` in `dependencies`, and `tw-animate-css` appears nowhere in the manifest. That directly contradicts the donor's own pinned package contract: `docs/STACK.md:25` pins `tw-animate-css` ^1 for the Animation-utilities layer and annotates it "**Not** `tailwindcss-animate` (a Tailwind-3 plugin — see scar below)", while STACK.md scar #1 (lines 38–40) records that `tailwindcss-animate@1.x` cannot be resolved by `@tailwindcss/postcss@4`, so every Sheet — i.e. every J crud-dialog — *pops* instead of sliding. `src/styles/tokens.css:14–21` repeats the same warning and tells consumers to install `tw-animate-css` and add `@plugin "tw-animate-css";`.

This is not cosmetic drift, because the manifest is a **consumed** artifact. `/style-baseline` step 7 ("Install dependencies", `~/.claude/commands/style-baseline.md:190`) parses `$BASELINE/package.json` `dependencies` and `devDependencies` verbatim and installs them into the target, appending `@tailwindcss/postcss` for Next.js targets. So the skill installs the exact forbidden package into the exact pipeline scar #1 names, and never installs the replacement — the donor propagates its own documented defect to every consumer. Surfaced from controlling-app (recorded in that engagement's spec §7); filed here rather than in controlling-app's backlog because the defect is the donor's.

A second instance of the same manifest-vs-contract divergence sits alongside it: STACK.md pins `vaul` ^1 for the Drawers layer, but `vaul` is absent from `package.json` and has no import anywhere in `src/`, so consumers never receive the dependency the Drawer contract assumes.

The donor is copy-source, not a buildable app, and `tokens.css` deliberately does not load either plugin — which is why nothing in the donor's own `npx tsc --noEmit` / `npm test` / gallery build catches this. `scripts/lint-design.mjs` (the ADR-0003 zero-dep adherence scanner) does not read `package.json` at all, so the manifest is currently unguarded by any mechanism.

## What to do

- [ ] Replace `"tailwindcss-animate": "^1.0.7"` with `"tw-animate-css": "^1"` in `package.json` `dependencies`, matching the pin in `docs/STACK.md:25`.
- [ ] Regenerate `package-lock.json` so the stale `tailwindcss-animate` resolution at `package-lock.json:4884` is dropped.
- [ ] Add `"vaul": "^1"` to `dependencies` to match the Drawers row of the STACK.md contract, or record an ADR removing that row if the Drawer contract is no longer shipped — the manifest and STACK.md must agree either way.
- [ ] ? Extend `scripts/lint-design.mjs` with a rule that diffs `package.json` dependencies against the STACK.md contract table, so this class of drift fails the scanner instead of surfacing via a downstream consumer. Deferred — scope call, and ADR-0003 scoped the scanner to source files, not the manifest.

## Acceptance

- `grep tailwindcss-animate package.json package-lock.json` returns no matches.
- `jq -r '.dependencies["tw-animate-css"]' package.json` returns a `^1` pin.
- Every package named in the `docs/STACK.md` contract table that the donor is responsible for shipping appears in `package.json`, and no package the table marks as forbidden appears.
- A `/style-baseline` run against a fresh Vite target installs `tw-animate-css` and no longer installs `tailwindcss-animate`.
- `npx tsc --noEmit` and `npm test` still pass after the swap.

## Related

- [docs/backlog/archive/style-baseline-stack-aware-preflight.md](archive/style-baseline-stack-aware-preflight.md) — the sibling that hardened `/style-baseline` against divergent target stacks; this ticket fixes the same skill's *source* side.
- [docs/backlog/archive/adherence-lint-oxlint-mechanism-nonfunctional.md](archive/adherence-lint-oxlint-mechanism-nonfunctional.md) — prior work on the scanner the deferred guard bullet would extend.
- ADR-0002 — Adopt the baseline-upstream methodology docs; its rationale explicitly names swapping `tw-animate-css` for `tailwindcss-animate` as the drift STACK.md exists to catch.
- ADR-0003 — Adherence lint ships as a zero-dep scanner; scopes the mechanism the deferred bullet would extend to `package.json`.
- `docs/STACK.md` — contract table row 3 and scar #1.
- `src/styles/tokens.css:14–21` — the in-source warning that already states the correct package.
