---
area: archetypes
opened: 2026-07-06
status: done
resolved: 2026-07-06
model: sonnet
model_reason: scoped copy-logic change in the plugin skill, driven by an existing MANIFEST key; clear acceptance, sibling precedent to follow
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-07-06T00:00:00Z
---

# Distribute the docs-root methodology layer + adherence lint to consumers via the style skills

## Resolution (2026-07-06)

Resolved by building a **dedicated global skill `/adopt-baseline`** (`~/.claude/commands/adopt-baseline.md`) rather than extending `/style-archetypes` as originally proposed — the distribution is only half of what "fully adopted by a project" needs, so the skill runs the whole `docs/ADOPTION.md` contract, not just a copy. It:

- distributes the four `docs/`-root methodology docs (driven by the `MANIFEST.json` `methodology` array — a fifth doc needs no skill edit) + `_adherence.oxlintrc.json`, stamping each doc's frontmatter with `vendored: design-baseline@<ver>`;
- `--update` refreshes only docs whose donor `version` exceeds the consumer copy's own `version:` (staleness keyed on the per-doc version, not the bundle stamp);
- wires the consumer's `lint:design` script → `oxlint -c _adherence.oxlintrc.json`;
- scaffolds (non-clobbering) the consumer's `docs/ADOPTION.md` 8-point checklist (recording adopted donor + Tailwind versions), `docs/SURFACES.md` template, and `docs/RULES.md` scar channel;
- flags the STACK.md stack-pin scars (a 2nd headless lib alongside Radix, `tailwindcss-animate` on TW4) and reports the un-mechanizable gates (visual baselines, surface resolution);
- `--check` scores a project against the 8-point checklist without writing.

Verified end-to-end against a throwaway consumer fixture (all modes + the update-staleness bug caught and fixed). Why a dedicated skill vs. extending `/style-archetypes`: the two skills own different layers — `/style-archetypes` copies page shapes, `/adopt-baseline` copies + enforces the laws that govern them. Keeping distribution out of `/style-archetypes` avoids conflating "apply an archetype" with "adopt the governance contract."

**Residual (optional, not filed):** `/style-archetypes` could warn "run `/adopt-baseline`" when it copies an archetype spec whose referenced `docs/CHOOSING-A-SURFACE.md` / `docs/PLACEMENT.md` are absent in the consumer. Minor nicety; deferred.

## Context

The v0.3.0 methodology layer — `docs/CHOOSING-A-SURFACE.md` (v2.0), `docs/PLACEMENT.md`, `docs/STACK.md`, `docs/ADOPTION.md`, plus the root `_adherence.oxlintrc.json` — was added by ADR-0002 but had **no distribution path** to consuming projects. `/style-baseline` referenced `docs/CHOOSING-A-SURFACE.md` only as a printed pointer (`~/.claude/commands/style-baseline.md:83`); `/style-archetypes` copied `docs/archetypes/` contents but not the `docs/`-root methodology files. So a consumer like hk-crm could not pull the layer through the normal sync — it had to be hand-copied.

## What was done

- [x] New `/adopt-baseline` global skill distributes the four methodology docs + `_adherence.oxlintrc.json`, driven by the `MANIFEST.json` `methodology` array.
- [x] Each distributed doc stamped with the donor version (`vendored:` frontmatter line).
- [x] Consumer `lint:design` script wired at the copied `_adherence.oxlintrc.json`.
- [x] `--update` re-copies only methodology docs whose donor version changed.

## Acceptance

- [x] Running `/adopt-baseline` in a fresh consumer copies the four methodology docs + `_adherence.oxlintrc.json` into it. *(verified against fixture)*
- [x] Each copied methodology doc carries a `design-baseline@<version>` stamp. *(verified: `vendored: "design-baseline@0.3.0 (…)"`)*
- [x] The `MANIFEST.json` `methodology` array drives the copy list. *(verified)*
- [x] Re-running with `--update` re-copies only methodology docs whose donor version changed. *(verified: same-version → skip; simulated bump → only that doc refresh)*

## Related

- [style-archetypes-carry-baseline-sibling.md](style-archetypes-carry-baseline-sibling.md)
- [style-baseline-stack-aware-preflight.md](style-baseline-stack-aware-preflight.md)
- ADR-0002 — Adopt the baseline-upstream methodology docs (selection, placement, stack, adoption)
