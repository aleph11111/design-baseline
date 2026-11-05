---
area: tooling
opened: 2026-11-04
status: done
value: normal
model: sonnet
model_reason: "decision made (lint recognition); one scanner branch plus tests and three doc sites, cause established"
gate:
  score: 5
  passed: [title, context, what-to-do, acceptance, related]
  failed: []
  graded_at: 2026-11-05T00:00:00Z
---

# Archetype gap: auth and status card pages fail the page-shell lint

## Context

Off-app pages that are a single centered card on a bare canvas (logo/heading, one or two sentences, one primary action; no sidebar, no `PageHeader`, no toolbar, no body surface) have no `kind: page` archetype in `docs/archetypes/MANIFEST.json`. `pageShell` in `scripts/lint-design.mjs` (`findPageShellIssues`) only accepts an import from `design-baseline/archetypes/<page-shell-slug>` and rejects `PageFrame`, so these pages trip `page-requires-archetype-shell` (RULES hard rule 12) unless they carry an `archetype-gap:` waiver that needs operator approval.

The donor already ships the right component: `src/components/layout/AuthCard.tsx`, "a layout primitive (not a page archetype — these screens have no toolbar/data/list shape); render outside `AppShell`" (`docs/STYLE.md`, `AuthCard` row; look decided in archived [[auth-card-centered-tinted-icon-promotion]]). controlling-app `frontend/src/app/login/page.tsx` and `frontend/src/app/not-authorized/page.tsx` already render `AuthCard`; the lint still does not recognise it as a shell.

Rule of 2 is met: controlling-app (two pages), hk-crm `src/app/(auth)/login/page.tsx` (hand-rolled, imports only `Button`; no `AuthCard`), gebo-stock-kiosk `frontend/src/pages/SignIn.tsx` (`AuthCard`, not under `src/app`), brickshop-manager (three pages, below).

Correction (verified 2026-11-05 against each consumer's `origin/main`): brickshop-manager **does** have three `AuthCard` pages inside its `pageShell` scope (`src/pages/**/*.tsx`), all `grandfathered` in its `_adherence.json`: `src/pages/Auth.tsx`, `src/pages/NotFound.tsx`, `src/pages/public/SharedListGate.tsx` (the last also imports `design-baseline/archetypes/raw-input`, a `kind: component`, not a page shell). controlling-app's two pages are `grandfathered` too (`_adherence.json` lines 98–99), import `AuthCard` via `@/components/layout/AuthCard`; brickshop and gebo import it from `design-baseline/layout`.

Operator decision (2026-11-05): the lint recognises `AuthCard`; no `auth-card` archetype is promoted. Unlike [[archetype-gap-redirect-only-page]] — closed not-needed via a consumer-side fix with no lint change (#670) — a sign-in page cannot be deleted, so the fix belongs in the donor lint. `AuthCard` is also embedded inside `AppShell` content as an admin wall (controlling-app `admin/users`, `settings/chart-colors`, `settings/deck-kennzahlen`), so the recognition must not let an in-app page pass on an `AuthCard` import alone.

## What to do

- [x] Make a page whose only shell is `AuthCard` satisfy `pageShell` without a per-page waiver: in `scripts/lint-design.mjs` treat an import of `AuthCard` (from `design-baseline/layout` or `@/components/layout/AuthCard`) as an accepted off-app shell, and still reject `PageFrame` and `AppShell` content on the same page.
- [x] Guard the recognition: `AuthCard` counts as the shell only when the file imports no `kind: page` archetype shell, no `PageFrame` and no `AppShell`; mark the text-match heuristic with a `ponytail:` comment naming its ceiling (text match, no parser), matching the existing ceiling note on `findPageShellIssues`.
- [x] Document the recognition in `docs/RULES.md` hard rule 12, `docs/PACKAGE.md` ("The page-shape rule") and `docs/STYLE.md`'s `AuthCard` row, and extend `scripts/lint-design.test.mjs` (next to the `page-requires-archetype-shell` cases) with an `AuthCard`-only page that passes and an `AuthCard` + `PageFrame` page that fails.
- [ ] Update the `choosing-a-page-archetype` no-fit path so a centered sign-in / not-authorized / error page points at `AuthCard`, not at a gap ticket.
- [x] Grep controlling-app, hk-crm and brickshop-manager for other centered-card pages (error, 404, status) to confirm `AuthCard`'s `purpose` set (`sign-in`, `denied`, `error`) covers them; hk-crm login should adopt `AuthCard` in its own page ticket.
- [x] Consumers remove their own `grandfathered` entries in their own tickets — the existing ratchet (`staleGrandfathered` / "grandfathered page now renders a page shell") forces it once the lint passes them; file those follow-ups, do not edit consumer repos here.

## Acceptance

- `lint-design` exits 0 on controlling-app `login/page.tsx` and `not-authorized/page.tsx` with no `archetype-gap:` waiver and no `grandfathered` entry.
- `lint-design` passes brickshop-manager `src/pages/Auth.tsx`, `src/pages/NotFound.tsx`, `src/pages/public/SharedListGate.tsx` and gebo-stock-kiosk `frontend/src/pages/SignIn.tsx` as `AuthCard` shells (their `grandfathered` entries then report as stale).
- A `page.tsx` importing both `AuthCard` and `PageFrame` still fails `page-requires-archetype-shell`; a page importing `AuthCard` and `AppShell` fails too.
- No other centered-card page in controlling-app, hk-crm or brickshop-manager still needs a waiver.
- `docs/RULES.md` rule 12 names `AuthCard` as the accepted off-app shell.

## Related

- [[archetype-gap-redirect-only-page]] — closed not-needed via consumer-side fix, no lint exemption built; this ticket differs (login pages cannot be deleted)
- [[archetype-gap-waiver-operator-merge-only]] — touched the same `pageShell` waiver wording; archived, no ordering needed
- [[page-requires-archetype-shell-no-pageframe-alone]] — shipped the rule this gap trips
- [[auth-card-centered-tinted-icon-promotion]] — decided `AuthCard`'s look and `purpose` prop
- [docs/RULES.md](/docs/RULES.md) — hard rule 12
- [scripts/lint-design.mjs](/scripts/lint-design.mjs) — `findPageShellIssues`
