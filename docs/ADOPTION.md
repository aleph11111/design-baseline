---
slug: adoption
kind: methodology
version: 1.0
status: locked
---

# ADOPTION.md — how a project adopts the baseline, and how the baseline stays enforced

The baseline's guarantees only hold if consuming projects can't silently drift. This
document defines the **adoption contract**: what a project MUST do when it takes on the
Design Baseline, and the mechanical gates that keep it true afterwards. Everything here
was designed against real drift observed in a consuming project (hk-crm 360° audit,
2026-07): unwired lint, forking vendored copies, split navigation conventions, unstamped
versions.

> **The one rule.** Adoption is not "copy the components." Adoption is: pin the stack,
> wire the gates, resolve the surfaces, stamp the versions. A project that skips a step
> is not "on the baseline" — it is downstream of it, drifting.

---

## The adoption contract (checklist)

A project is *adopted* when all eight hold. Keep this checklist, checked, at the top of
the project's `docs/ADOPTION.md`.

1. **Stack pinned** — dependencies match `STACK.md`; any overlap/divergence has an ADR in
   `docs/adr/`. No second headless-UI, icon, toast, or form library without one.
2. **Adherence lint wired** — `lint:design` script pointing at the baseline's
   `_adherence.oxlintrc.json`, running in CI. Warnings allowed during rollout; each rule
   ratcheted to error as its violation class is cleaned.
3. **Surfaces resolved** — `docs/SURFACES.md` exists: one row per entity (create/edit/read
   surface per `CHOOSING-A-SURFACE.md`) and one row per page (archetype). Reviews check
   against it.
4. **Placement inherited** — `PLACEMENT.md` referenced from the project's review checklist;
   the project adds no competing placement rules, only documented yellows.
5. **Versions stamped** — every vendored file carries a header line
   (`/* design-baseline@<version> — vendored <date> */`); the adopted baseline version and
   Tailwind version are recorded in `docs/ADOPTION.md`.
6. **State law honored** — async states go through `StateView` (or its archetype adapters);
   no project-local skeleton/loading/error inventions.
7. **Visual baselines captured** — one Playwright screenshot test per archetype in use,
   committed at adoption time.
8. **Scar channel open** — the project has `docs/RULES.md`; recurring violations get
   promoted per the feedback loop below.

---

## The enforcement stack — four gates, cheapest first

| Gate | Catches | Mechanism | When |
|------|---------|-----------|------|
| 1. Types | wrong props, wrong variants | vendored `.d.ts` / package types, `tsc --noEmit` | on save / CI |
| 2. Adherence lint | raw hex/px/palette classes, raw `<button>`/`<table>`, off-contract props | `_adherence.oxlintrc.json` via oxlint | pre-commit + CI |
| 3. Visual baselines | drift the linter can't see (spacing, chrome, states) | Playwright `toHaveScreenshot()` per archetype page | CI |
| 4. Review against docs | surface choice, placement, navigation model | `SURFACES.md` + `PLACEMENT.md` + `CHOOSING-A-SURFACE.md` as the review checklist | PR review |

Gates 1–3 are mechanical; gate 4 is human but checklist-driven. A rule that lives only in
prose (gate 4) and keeps being violated should be pushed down the stack — into the lint
config (gate 2) or a snapshot (gate 3) — so it stops costing review attention.

## The feedback loop (both directions)

- **Downstream (baseline → project):** on every baseline version bump, the project diffs
  the baseline changelog against its stamped version, migrates, re-stamps. No stamp = the
  question "are we up to date?" is unanswerable — that is itself a contract violation.
- **Upstream (project → baseline):** when the same drift lands twice in one project, it
  becomes a scar in that project's `RULES.md`. When the same scar appears in a second
  project — Rule of 2, same as archetypes — it is promoted into the baseline: into
  `PLACEMENT.md` / `STACK.md` / `CHOOSING-A-SURFACE.md` as prose, and into
  `_adherence.oxlintrc.json` as a check where mechanically possible. Every consumer then
  inherits the fix.

## Lint rules the baseline should grow next

Promoted candidates from the first consumer audit (add to `_adherence.oxlintrc.json` as
they become checkable):

- no bare `<h1>` in app page bodies — titles go through `PageHeader`
- exactly one primary action per `PageHeader`
- `RowActionsMenu` is the only per-row overflow menu
- no `bg-red-50`-class ad-hoc error colors — the two canonical error treatments only
- no local `*-skeleton` components — `StateView` owns async planes
- vendored-file header stamp present (`@ds-version`)

---

## Revision log

- **1.0** — First draft, generalizing the hk-crm adoption/enforcement plan
  (IMPLEMENTATION.md, 2026-07) into the baseline's standing contract.
