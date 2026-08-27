---
area: over-engineering
opened: '2026-08-26'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what_to_do
    - acceptance
    - related
  failed: []
  graded_at: '2026-08-26T17:17:19.298Z'
model: sonnet
model_reason: >-
  reconciling the manifest against actual imports and the STACK.md contract — the evidence is
  mechanical, one judgment call on react-day-picker's peer
---

# Drop the two packages in the donor manifest that nothing imports

## Context

`package.json` is a **consumed** artifact: `/style-baseline` step 7 parses the donor's `dependencies` and `devDependencies` and installs them into every target (the mechanism `archive/donor-deps-violate-stack-contract.md` documents). Two entries have no importer anywhere in the repo.

**`date-fns` (`^3.6.0`, `dependencies`).** `grep -rnI "date-fns" src gallery docs .design-sync` returns nothing — no import, no doc reference, no preview. It is also absent from `docs/STACK.md`'s contract table, so unlike `vaul` (pinned for the Drawers row and deliberately shipped un-imported) it is not held in place by the contract. The only place the string survives is `vite.config.ts`'s `optimizeDeps.include` list, which pre-bundles it for the gallery dev server — a pre-bundle entry for a package no demo imports, so the entry is dead too. The plausible original reason was `react-day-picker`, which required `date-fns` as a peer at v8; the donor pins `^10`, which carries its own date handling, and `src/components/ui/calendar.tsx` imports nothing from `date-fns`.

**`@tailwindcss/typography` (`^0.5.15`, `devDependencies`).** `src/styles/tokens.css:14` states outright: *"NOT loaded here: `tailwindcss-animate` and `@tailwindcss/typography`."* Neither `src/styles/tokens.css` nor `gallery/styles.css` carries a `@plugin "@tailwindcss/typography"` directive, and no component or demo uses a `prose` class — the four `grep prose` hits in `src/` are all prose *in comments*. So the plugin is installed, never loaded, and its utilities are unavailable by design.

Neither package is large, but the donor's whole job is to be copied: an unused runtime dependency here becomes an unused runtime dependency in `hk-crm`, `controlling-app`, `mistra`, `brickshop-manager` and every future consumer, and a manifest entry nobody can trace to a use is the thing that makes the next `donor-deps-violate-stack-contract`-class audit expensive.

## What to do

- [ ] Remove `"date-fns"` from `package.json` `dependencies` and regenerate `package-lock.json`.
- [ ] Remove the `"date-fns"` entry from `optimizeDeps.include` in `vite.config.ts`, since no gallery demo imports it.
- [ ] Remove `"@tailwindcss/typography"` from `package.json` `devDependencies`, and drop its mention from `src/styles/tokens.css:14` so the comment stops naming a package the manifest no longer carries.
- [ ] Leave `vaul` in place — it is un-imported but pinned by the `docs/STACK.md` Drawers contract row, and `archive/donor-deps-violate-stack-contract.md` added it deliberately.
- [ ] ? Consider extending `scripts/lint-design.mjs` (or a small sibling) with an unused-dependency check comparing `package.json` against the import graph, so this class of drift is caught mechanically. Deferred — ADR-0003 scoped the scanner to source files, and the same deferral is recorded in the earlier manifest ticket.

## Acceptance

- `jq '.dependencies["date-fns"], .devDependencies["@tailwindcss/typography"]' package.json` returns `null` twice, and neither package appears as a direct entry in `package-lock.json`.
- `grep -rnI "date-fns" src gallery vite.config.ts` returns no matches.
- `npm install && npx tsc --noEmit` passes and `npm test` passes on the reduced manifest.
- `npm run gallery:build` succeeds, and the calendar demo (`src/examples/calendar-demo.tsx`) and `src/components/ui/calendar.tsx` still render date picking in the built gallery.
- A `/style-baseline` run against a fresh target no longer installs `date-fns`.

## Related

- [archive/donor-deps-violate-stack-contract.md](../archive/donor-deps-violate-stack-contract.md) — the precedent: manifest-vs-contract drift in this same file, fixed here rather than downstream, and the source of the `vaul` entry this ticket deliberately leaves alone.
- [docs/STACK.md](../../STACK.md) — the pinned contract table; neither package appears in it.
- [src/styles/tokens.css](../../src/styles/tokens.css) — the in-source comment stating the typography plugin is not loaded.
