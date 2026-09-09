---
area: archetypes
opened: '2026-09-09'
status: done
gate:
  score: 5
  passed:
    - title
    - context
    - what-to-do
    - acceptance
    - related
  failed: []
  graded_at: '2026-09-09T00:00:00Z'
value: high
model: sonnet
model_reason: >-
  mechanical — one package.json files entry, one field removal across six MANIFEST entries, one loop
  added to scripts/verify-manifest-versions.mjs; every decision is settled in the spec's F3/F6
roadmap: archetype-convergence
---

# Ship the four surviving methodology docs in the package and make each doc's frontmatter its only version

## Context

Two defects in the donor's methodology layer, both blocking the `docs-retire` phase of
[archetype-convergence](../archetype-convergence.md) (spec section *"## Phase docs-retire — retire the
copies, ship the successor"*, decisions F3 and F6).

**No successor.** `package.json`'s `files` is `["src/components", "src/lib", "src/hooks",
"src/utils", "src/styles"]` — the package ships no docs at all. So `docs-retire`'s instruction to a
migrated consumer, *"delete your copy and read the package's"*, currently means *delete it and read
nothing*: after installing, a consumer still has to answer "which archetype is this page?" and
`docs/CHOOSING-A-SURFACE.md` is the only artifact that answers it. Reading the donor checkout
instead is the version skew this roadmap exists to kill, one level down — the doc a consumer reads
would be whatever `main` has, not what its installed tag pins.

**Three numbers for one fact.** `docs/archetypes/MANIFEST.json`'s `methodology[].version` says
`placement 1.2`, `stack 1.1`, `adoption 1.2`, while the donor's own doc frontmatter says `1.3`,
`1.2`, `1.3`. coding-dashboard's `server/methodologyAdoption.ts` compares each consumer copy against
the **MANIFEST** number, so `controlling-app` sitting at `PLACEMENT 1.2` reports *fresh* while
genuinely one bump behind, and `hk-crm`'s `STACK.md` at `1.3` reads as ahead of a donor claiming
`1.1` whose file actually says `1.2`. This is E3's rule (`docs/PLUGIN-CONTRACT.md` — one number per
meaning) applied one level down, and it is a live under-report against three unmigrated consumers.

Distinct from the archived
[archetype-doc-manifest-version-drift](../archive/archetype-doc-manifest-version-drift.md), which
decided the **archetypes[]** doc-vs-MANIFEST counters are independent by design (spec contract vs
deliverable iteration). A methodology doc has no primitives, demo or blueprint, so it has no
deliverable counter — the MANIFEST copy is a mirror, and mirrors go stale.
`scripts/verify-manifest-versions.mjs` was built to catch exactly this class and loops
`manifest.archetypes` only (`:30`), which is why the methodology drift was never caught.

## What to do

- [x] Before editing, grep every reader of `methodology[].version` — donor `scripts/`, coding-dashboard `server/` and `client/src/` — and fix at the shared point, not only the call site this report names. (Measured: `server/methodologyAdoption.ts` is the sole reader — the `d.version` filter at `:403`, `donorVersion` at `:434` and `isNewer` at `:436`; `designPlugin.ts` reads `plugin.version`, the contract-shape number, which `PLUGIN-CONTRACT.md:62-80` already separated; the client renders the scanner's `MethodologyDoc` shape only, and no donor script reads the field.)
- [x] Add `docs/CHOOSING-A-SURFACE.md`, `docs/PLACEMENT.md`, `docs/STACK.md` and `docs/DETAIL-PAGE-TEARDOWN-PLAYBOOK.md` to `package.json`'s `files` array — 68 KB total. Do **not** add `docs/` wholesale (4.5 MB of backlog, ADRs, audits and specs), and do **not** add `docs/ADOPTION.md` or `docs/ADOPTION-QUALITY.md` — those stay donor-internal and get no successor (F3).
- [x] Remove the `version` field from every `methodology[]` entry in `docs/archetypes/MANIFEST.json`; each doc's own frontmatter `version:` becomes the single source (F6). (All six entries, not just the three stale.)
- [x] Extend `scripts/verify-manifest-versions.mjs` to assert the absence of `version` on `methodology[]` entries, so the field cannot be reintroduced by hand — the script already owns this drift class for `archetypes[]` and its loop at `:30` never covered the second array. The new loop fails the script (exit 1) when any `methodology[]` entry carries `version`.
- [x] State in `docs/PLUGIN-CONTRACT.md`'s Versioning section that a methodology doc's version is its own frontmatter, alongside the bundle-vs-contract split already recorded there.
- [x] File the coding-dashboard side as a re-scope of that repo's existing `dashboard-drop-drift-machinery` (per the spec's F7/E8): `methodologyAdoption.ts` reads the donor doc's frontmatter via the `splitFrontmatter` it already imports, and shrinks around its surviving `AdherenceLint` half rather than being deleted. (Landed 2026-09-10 as a `"## 2026-09-10 re-scope"` section appended to coding-dashboard's archived ticket; the scanner fix + F6 fixture remain gated on that repo's `docs-retire` execution.)

## Acceptance

- [x] `npm pack --dry-run` lists exactly four `docs/` entries — the four named above — and no other path under `docs/`. (Verified 2026-09-10: exactly `docs/CHOOSING-A-SURFACE.md`, `docs/DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`, `docs/PLACEMENT.md`, `docs/STACK.md`, no other `docs/` path.)
- [x] `node scripts/verify-exports.mjs` still reports `7/7 ok`; the docs are files, not exports, so any invariant moving here is a regression. (Verified: `7/7 ok`, exit 0.)
- [x] `python3 -c "import json;print([d.get('version') for d in json.load(open('docs/archetypes/MANIFEST.json'))['methodology']])"` prints all `None` — every methodology entry, not only the three currently stale. (Verified: `[None, None, None, None, None, None]`.)
- [x] `node scripts/verify-manifest-versions.mjs` exits non-zero when a `version` field is reintroduced on any `methodology[]` entry, and zero otherwise. (Verified: clean=exit 0; a mutation setting `methodology[0].version="2.1"` → exit 1; after restore clean=exit 0 — the mutation is verified to have applied before the non-zero reading.)
- [x] A fixture consumer copy at `PLACEMENT 1.2` against a donor `docs/PLACEMENT.md` whose frontmatter says `1.3` reports **stale** — it reports fresh today, so the check fails before the change and passes after. (The donor side of this is demonstrated: `tasks/f6-stale-comparator-demo.mjs` reads the donor `docs/PLACEMENT.md` frontmatter `1.3` and, via the same `isNewer` the scanner uses, computes `stale=true` against a consumer `1.2`, with the MANIFEST carrying no mirror. The scanner itself — which today filters on the now-deleted `d.version` — lands in coding-dashboard's `dashboard-drop-drift-machinery` re-scope as its F6 fixture: consumer `PLACEMENT 1.2` vs donor frontmatter `1.3` must now come back **stale**, and it is not expressible before the field removal because the filter returns `[]`.)
- [x] `npx tsc --noEmit` clean, `node scripts/lint-design.mjs` 0 errors, `npm run gallery:build` ok. (`npm test` carries the known `src/components/layout/Sidebar.test.tsx` jsdom `localStorage` failure, unrelated.) (Verified 2026-09-10: `tsc` exit 0, `lint-design` 59 warn / 0 error exit 0, `gallery:build` built ok. `npm test` ran 55 files / 392 tests, all passed — the known `Sidebar` jsdom failure did not reproduce in this environment, so the suite was green end to end.)

## Related

- [archetype-convergence.md](../archetype-convergence.md) — the roadmap; phase `docs-retire`, decisions F3 and F6
- [archive/archetype-doc-manifest-version-drift.md](../archive/archetype-doc-manifest-version-drift.md) — decided `archetypes[]` doc-vs-MANIFEST counters are independent by design; methodology docs are the opposite case
- [archive/archetype-manifest-version-verify-script.md](../archive/archetype-manifest-version-verify-script.md) — shipped `scripts/verify-manifest-versions.mjs`, whose loop never covered `methodology[]`
- [archive/plugin-version-contract-vs-bundle-split.md](../archive/plugin-version-contract-vs-bundle-split.md) — E3's one-number-per-meaning rule, applied here one level down
- [archive/package-ui-ownership-and-vendored-consumer-runbook.md](../archive/package-ui-ownership-and-vendored-consumer-runbook.md) — the runbook this ticket's successor docs are consumed by
