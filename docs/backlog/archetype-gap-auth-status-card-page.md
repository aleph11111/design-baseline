---
area: tooling
opened: 2026-11-04
status: needs-enrichment
value: normal
gate:
  score: 4
  passed: [title, context, what-to-do, acceptance, related]
  failed:
    - open_question: "unresolved design fork under ## Open question — needs an interactive operator decision before /feat"
  graded_at: 2026-11-04T00:00:00Z
---

# Archetype gap: auth and status card pages fail the page-shell lint

## Context

Off-app pages that are a single centered card on a bare canvas (logo/heading, one or two sentences, one primary action; no sidebar, no `PageHeader`, no toolbar, no body surface) have no `kind: page` archetype in `docs/archetypes/MANIFEST.json`. `pageShell` in `scripts/lint-design.mjs` (`findPageShellIssues`) only accepts an import from `design-baseline/archetypes/<page-shell-slug>` and rejects `PageFrame`, so these pages trip `page-requires-archetype-shell` (RULES hard rule 12) unless they carry an `archetype-gap:` waiver that needs operator approval.

The donor already ships the right component: `src/components/layout/AuthCard.tsx`, "a layout primitive (not a page archetype — these screens have no toolbar/data/list shape); render outside `AppShell`" (`docs/STYLE.md`, `AuthCard` row; look decided in archived [[auth-card-centered-tinted-icon-promotion]]). controlling-app `frontend/src/app/login/page.tsx` and `frontend/src/app/not-authorized/page.tsx` already render `AuthCard`; the lint still does not recognise it as a shell.

Rule of 2 is met: controlling-app (two pages), hk-crm `src/app/(auth)/login/page.tsx` (hand-rolled, imports only `Button`; no `AuthCard`), gebo-stock-kiosk `frontend/src/pages/SignIn.tsx` (`AuthCard`, not under `src/app`). brickshop-manager has no login/not-authorized page on `origin/main`.

## What to do

- [ ] Make a page whose only shell is `AuthCard` satisfy `pageShell` without a per-page waiver: in `scripts/lint-design.mjs` treat an import of `AuthCard` (from `design-baseline/layout` or `@/components/layout/AuthCard`) as an accepted off-app shell, and still reject `PageFrame` and `AppShell` content on the same page.
- [ ] Document the recognition in `docs/RULES.md` hard rule 12, `docs/PACKAGE.md` ("The page-shape rule") and `docs/STYLE.md`'s `AuthCard` row, and extend `scripts/lint-design.test.mjs` (next to the `page-requires-archetype-shell` cases) with an `AuthCard`-only page that passes and an `AuthCard` + `PageFrame` page that fails.
- [ ] Update the `choosing-a-page-archetype` no-fit path so a centered sign-in / not-authorized / error page points at `AuthCard`, not at a gap ticket.
- [ ] Grep controlling-app, hk-crm and brickshop-manager for other centered-card pages (error, 404, status) to confirm `AuthCard`'s `purpose` set (`sign-in`, `denied`, `error`) covers them; hk-crm login should adopt `AuthCard` in its own page ticket.

## Acceptance

- `lint-design` exits 0 on controlling-app `login/page.tsx` and `not-authorized/page.tsx` with no `archetype-gap:` waiver and no `grandfathered` entry.
- A `page.tsx` importing both `AuthCard` and `PageFrame` still fails `page-requires-archetype-shell`.
- No other centered-card page in controlling-app, hk-crm or brickshop-manager still needs a waiver.
- `docs/RULES.md` rule 12 names `AuthCard` as the accepted off-app shell.

## Related

- [[archetype-gap-redirect-only-page]] — same shape of fix (lint exemption instead of a new archetype); no ordering needed
- [[archetype-gap-waiver-operator-merge-only]] — touches the same `pageShell` waiver wording; no ordering needed
- [[page-requires-archetype-shell-no-pageframe-alone]] — shipped the rule this gap trips
- [[auth-card-centered-tinted-icon-promotion]] — decided `AuthCard`'s look and `purpose` prop
- [docs/RULES.md](/docs/RULES.md) — hard rule 12
- [scripts/lint-design.mjs](/scripts/lint-design.mjs) — `findPageShellIssues`

## Open question

Fork resolved to the recommended default: the lint recognises `AuthCard` (no baseline API change, one lint branch, matches the redirect-only precedent and STYLE.md's "layout primitive, not a page archetype"). Alternative: promote a real `kind: page` archetype (`auth-card`) with a contract in `docs/archetypes/` and a MANIFEST entry, so these pages import `design-baseline/archetypes/auth-card`. Costs a promotion (contract, demo, version bump) for a shape with no list/data structure; choose it if the operator wants every page to go through the MANIFEST uniformly. Operator confirms before `/feat`.
