---
area: archetypes
opened: '2026-09-23'
status: ready
value: normal
model: opus
model_reason: "cross-repo migration with fork-triage calls on every vendored ui/ file that differs from the donor"
gate:
  score: 5
  passed: [title, context, what_to_do, acceptance, related]
  failed: []
  graded_at: '2026-09-23T14:30:00Z'
---

# Install the design-baseline package in controlling-app and delete its vendored copies

## Context

The `archetype-convergence` completion review found that only hk-crm consumes `design-baseline` as a
package. On `origin/main` (read 2026-09-23), `controlling-app` has no `design-baseline` entry in
`frontend/package.json` (a Next 16 + Tailwind 4 app under `frontend/`, not the repo root). It
still vendors 45 files in `frontend/src/components/ui/` and carries a 55-file `docs/archetypes/`
corpus, including a `docs/archetypes/MANIFEST.json` fork. That leaves the roadmap's Done-when
criteria D2 (a `--font-sans` bump reaches every consumer), D3 (no MANIFEST fork) and D5 (no vendored
methodology corpus) open for this repo. The cutover follows the path hk-crm took
(`hk-crm-package-install-cutover`) and uses `docs/PACKAGE.md`'s six-step "Migrating a vendored
consumer" runbook. Run it from a controlling-app session: the fleet self-heals, and the donor never
writes into a consumer.

## What to do

- [ ] From a controlling-app `/feat` worktree, add `design-baseline` to `frontend/package.json` pinned to
      the current donor tag (`v0.2.3` at filing time) as a git dependency, per `docs/PACKAGE.md` § "1.
      `package.json` — pin the tag".
- [ ] Apply the runbook's steps 1–6 in order (`docs/PACKAGE.md` § "Migrating a vendored consumer"),
      starting with step 1 fork triage. A `ui/` file that differs from the donor by more than the
      stamp and the `"use client"` line (ADR-0006) is a real fork. Keep it project-first through the
      two-entry `ui/` paths array rather than deleting it.
- [ ] Wire the four lines `docs/PACKAGE.md` § "The four wiring lines" names: tsconfig paths, the
      `tokens.layer.css` import plus `@source`, and `transpilePackages` (controlling-app is a Next
      consumer).
- [ ] Run step 6 over `docs/`: delete `docs/archetypes/` including `MANIFEST.json`, the package-owned
      methodology docs, and their Doc-Paths keys in controlling-app's `CLAUDE.md`.
- [ ] Run step 5: record the tag and the kept-file count in the donor's `docs/promotion-radar.json`,
      in a donor-side follow-up PR.

## Acceptance

- In `controlling-app/frontend`, `node -e "require.resolve('design-baseline/package.json')"` succeeds.
- `git -C controlling-app show origin/main:docs/archetypes/MANIFEST.json` fails, and no
  `docs/archetypes/` directory remains.
- `npx tsc --noEmit` and `next build` are clean in `frontend/`, and every route renders unchanged against
  pre-migration screenshots.
- `grep -rn 'design-baseline@' frontend/src/` returns nothing, and every remaining file in
  `frontend/src/components/ui/` is a triaged project-first fork.

## Related

- [archive/hk-crm-package-install-cutover.md](archive/hk-crm-package-install-cutover.md) — the template cutover.
- [[roadmap-review-archetype-convergence]] — the review that filed this (gaps D2/D3/D5).
- [archetype-convergence.md](archetype-convergence.md) — the roadmap.
- ADR-0006 — "use client" is consumer-measured per leaf.
