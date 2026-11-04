---
area: docs
opened: '2026-11-04'
status: ready
value: normal
model: sonnet
model_reason: "docs-only edit to two known passages with an established cause (CI run 41873948155)"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: '2026-11-04T00:00:00Z'
---

# Consumer docs: self-host Inter for pixel baselines

## Context

`docs/PACKAGE.md:574` (ADR-0009 row) tells consumers to load Inter via `next/font/google` or "the Google Fonts `<link>`". Consumers who run pixel baselines through the exported `design-baseline-playwright` harness (`docs/PACKAGE.md` "Visual baselines" setup, lines ~363-384) inherit the same flake the donor had ([[phone-screenshot-baselines-flake]]). Google intermittently answers `fonts.googleapis.com/css2?family=Inter:wght@400..700` with a `/l/font?kit=` CSS that points at a different 38 KB Inter build instead of `/s/inter/v20/...woff2`; that build renders 12px semibold text about 1px wider. Evidence: donor diag CI run 41873948155 — 6/6 failing renders got the kit CSS, 0/46 passing. The donor now vendors `gallery/fonts/inter-latin-v20.woff2` instead of the runtime link.

## What to do

- [ ] In `docs/PACKAGE.md:574`, qualify the Google `<link>` option: fine at runtime, but not for any project that runs pixel baselines.
- [ ] In the PACKAGE.md visual-baselines setup (~lines 363-384), add a step: self-host the Inter woff2 (pinned version, e.g. `inter-latin-v20.woff2`) and load it by `@font-face` / `next/font/local`, so the baseline render never depends on a Google response; cite run 41873948155 as the reason.
- [ ] Check `docs/STYLE.md` and ADR-0009's consumer guidance for the same "Google link" instruction and align them.

## Acceptance

- `docs/PACKAGE.md` no longer recommends the Google Fonts `<link>` or `next/font/google` for a project that runs `design-baseline-playwright` baselines, and shows the self-hosted alternative.
- No other consumer-facing doc (`docs/PACKAGE.md`, `docs/STYLE.md`, ADR-0009) still tells baseline-running consumers to load Inter from Google at runtime.

## Related

- [[phone-screenshot-baselines-flake]] — the donor-side flake this root cause explains
- [[device-triad-screenshot-baselines]] — shipped the harness consumers reuse
- [ADR-0009](/docs/adr/0009-figures-in-the-house-sans.md) — Figures in the house sans (Inter)
