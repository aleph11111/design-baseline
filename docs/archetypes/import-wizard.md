---
key: W
slug: import-wizard
kind: page
version: 2.1
promoted_from: fleet-audit-2026-06-13 (controlling-app, my-finance-app)
promoted_at: 2026-06-14
source_spec_version: 1.2
status: locked
---

# Archetype W — import-wizard

A **stepped data-ingestion flow**: bring external data in through ordered stages —
typically **Upload → Map columns → Verify → Commit**. Distinct from form-page (B):
B is one form submitted once; W is a *sequence* with per-step validation, a preview
of what will happen, and a single terminal commit. The body of each step varies
(a dropzone, a mapping grid, a preview table, a summary) but the *frame* — the step
indicator and the Back / Next·Commit footer — is constant.

Promoted from the 2026-06-13 fleet audit (recurs in controlling-app and
my-finance-app — rule-of-2).

> **Binding.** The baseline binding for this archetype is the shipped, typed export — import `design-baseline/archetypes/import-wizard`; the prop surface is the API and the sandbox demo (`src/examples/import-wizard-demo.tsx`) is the gallery reference.

## Layer 1 — Route config
A dedicated route (e.g. `/imports/new`, `/transactions/import`). Lazy + suspense.
Often paired with an **import history** list (see Layer 4).

## Layer 2 — Page shell
The project's top-level app shell (its main region supplies the page inset; the
page adds none). A render-error boundary wraps content; a failed step surfaces
inline, never loses earlier steps' state.

## Layer 3 — Page header
`title` is **required** and passed once to the wizard shell — it is the page
title; there is no other title. `subtitle` carries a one-line source name
(e.g. "CSV · Checking account"); `badges` carry read-only status. The wizard
takes **no `actions`**: its only verbs are the flow's own Back / Next / Commit,
which are commit actions and live in the footer.

## Layer 4 — Toolbar / history toggle
An import wizard usually lives beside an **import history** (past runs: when, who,
counts, status). Model the history as a list-with-detail (A) and toggle between
"New import" (the wizard) and "History" — a tab strip or two routes. The
history is its own archetype, not part of W; W is the new-import flow.

## Layer 5 — The step flow
The wizard shell, given an ordered `steps` array, opens the **body** with the
shared step-progress primitive — done steps show a check, the active step is
marked, upcoming steps are muted. The stepper is read-only progress, not a
scoping control, so it is **not** `toolbar` content (the wizard has no
toolbar); navigation is via the footer, not by clicking steps. The current
step's body is a section titled with the step's label — a section of the
page's one surface, never a card of its own. The **footer** holds the commit
actions: **Back** + **Next**, swapping Next for a single **Commit** on the
last step.
Flow state is **consumer-owned** — the consumer holds `current` and per-step
data; the shell renders chrome and emits navigation intents. Canonical stages:
- **Upload** — a file dropzone (or a paste / connect-source affordance). `canProceed`
  gates on a file being present.
- **Map columns** — match source columns → target fields (a small grid of
  selects). Auto-map on a best-effort basis; let the user correct.
- **Verify** — a **preview** of parsed rows + a count summary (`N rows · M valid ·
  K skipped`). This is the "show what will happen before it happens" step — never
  skip it for a destructive/bulk import.
- **Commit** — a summary + the single terminal action.

**Forbidden:** more than ~5 steps (split the job); a commit with no preceding
Verify step; per-step "save" buttons (only Back/Next/Commit drive the flow).

## Layer 7 — States
- **Per-step validation** — `canProceed` disables Next/Commit until the step is valid.
- **Committing** — `busy` shows a spinner + disables the footer; the commit is a
  single in-flight action.
- **Done** — pass the success summary (imported / skipped counts) + a "start
  another" affordance as the shell's `done`; it replaces the stepper, step and
  footer inside the same page frame — the page title stays, never a bare card. Errors mid-commit return to the Commit step with
  a destructive message; partial progress is not silently dropped.

## Layers 8–12
Data/commit: the **Commit MUST be idempotent** — a re-run (double-click, retry,
resumed session) must not double-import; de-duplicate server-side on a stable row
key. Types: a parsed-row shape + a column-mapping shape. Mutations: the commit is
the only write; invalidate the destination list on success. Mobile: the stepper
collapses to "Step n of m"; bodies stack. Permissions: gate the route; a viewer
without import rights sees history (read-only) but not the wizard.

---

## Acceptance gate

> **Axis-C (adoption-quality) checklist** — the canonical list a page adopting this
> archetype is scored against (see [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md)).
> A page that composes this archetype's shell is **conformant** only when every
> REQUIRED box passes; one that fails any REQUIRED box is a 🔴 **wrapper adoption**,
> routed to the teardown ritual ([`DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`](../DETAIL-PAGE-TEARDOWN-PLAYBOOK.md)).
> `adoptionQuality.score = REQUIRED passed ÷ REQUIRED applicable`; `wrapper = true`
> when score < 1.0. **[spine]** = the shared conformance spine **S1–S6** (single inset ·
> shell-not-hand-rolled · canonical states · atoms+tokens · aligned figures · brand
> primary), defined in [`docs/ADOPTION-QUALITY.md`](../ADOPTION-QUALITY.md).

**REQUIRED**

- [ ] **One wizard shell owns the step model** (stepper + current-step body + footer
      nav) — steps aren't hand-rolled conditionals with bespoke progress UI.
- [ ] **Stepper is the shared progress primitive**, one current marker, done/pending
      states — not numbered `<div>`s.
- [ ] **Nav actions in the wizard footer** (Back/Next/Finish), ranked (one primary),
      not a button row in the body.
- [ ] **Mapping/preview tables use the list primitive**, not hand-built grids.
- [ ] **[spine] S1, S2, S4, S5, S6** (S3 → per-step validation/error states).

## Version log
- **2.0** (ADR-0008) — one page frame: `title` required and rendered once as the
  page title; `kicker` and the untitled/unframed branch removed; `subtitle` /
  `badges` added; the stepper is body content, not toolbar.
- **2.1** — `done` slot: the done state renders inside the one page frame
  instead of the consumer swapping the shell out.
