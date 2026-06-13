---
title: Archetype promotion — brickshop seeds, design-baseline generalises, projects consume
date: 2026-05-22
status: draft
source_brainstorm: in-conversation 2026-05-22
governed_paths:
  - design-baseline/docs/archetypes/
  - design-baseline/src/components/archetypes/
  - ~/.claude/commands/style-archetypes.md
  - ~/.claude/commands/promote-archetype.md
  - ~/.claude/commands/style-baseline.md (referenced; updated to mention siblings)
---

# Archetype promotion: brickshop → design-baseline → new projects

## Context

The design-baseline donor at `~/Documents/dev/design-baseline/` ships a coherent shell: shadcn/ui primitives, Tailwind 4 tokens, sidebar + header layout. After running `/style-baseline` and overriding brand tokens, projects get the chrome and tokens right. But the visual result on two recent applications has been **underwhelming**: pages within the same project don't cohere with each other, even though each page individually uses baseline components. The chrome is consistent; the page shapes are ad-hoc.

Brickshop-manager, in contrast, has spent months developing a **page-archetype framework** (ADRs 0030, 0034, 0043, 0053; `docs/archetypes/`). Every page in brickshop derives from one of 9 active archetypes (A list-with-detail, B detail-view, D1 settings-form, D2 settings-table, F1 domain-hub, F2 tabbed-settings, G lookup, H feed, J CRUD-dialog, K item-selector), and each archetype is a 12–15 layer contract covering route, shell, header, toolbar, data fetching, types, mutations, mobile, permissions. Brickshop pages cohere because they share archetype DNA.

New projects starting from baseline have no archetype vocabulary. They build page-by-page from scratch, even though many pages (list-with-detail, settings-table, CRUD-dialog) are universal shapes.

## Problem

A new project running `/style-baseline` gets visual primitives but no page-shape vocabulary. The result is internally inconsistent layouts that don't make the project look "designed." Adding archetypes — generalised from brickshop's mature work — closes that gap.

## Goals

1. New projects can apply baseline archetypes via a sibling command and immediately have a vocabulary for list, settings, and CRUD-dialog page shapes.
2. Brickshop continues to be the lab where archetypes mature; baseline gets generalised, de-projectified versions periodically.
3. The promotion process is repeatable, structured, and triages every difference between source and baseline as either generic or project-specific.
4. Already-applied projects can pull baseline archetype updates without surprise rewrites — explicit `--update` only.
5. Other projects (controlling-app, future apps) can serve as promotion sources too, not just brickshop.

## Non-goals

- **Visual style packs** (`editorial` / `operator` / `consumer`). Not the diagnosed gap. Could be added later as a separate layer.
- **Migrating brickshop's bespoke implementations** to consume baseline primitives. Brickshop keeps its bespoke code; baseline has generalised cousins. Drift between them is expected and tracked.
- **Auto-scaffolding sample pages** in target projects after apply. Spec docs are the reference; consumers are hand-written.
- **Live submodule / npm-package distribution.** Cadence is "every now and then" — async batch beats live sync.
- **Originating archetypes in baseline.** Every baseline archetype traces back to a `promoted_from` source project. If no source project has built it, it doesn't belong in baseline yet.

## Design

### Donor architecture

```
design-baseline/
├── docs/
│   ├── STYLE.md                              # (unchanged)
│   └── archetypes/                           # NEW
│       ├── README.md                         # framework: 12-layer grid, rule-of-2,
│       │                                     # scope→audit→spec→migration phases,
│       │                                     # promotion contract
│       ├── MANIFEST.json                     # see below
│       ├── list-with-detail.md               # generalised from brickshop A v1.2
│       ├── settings-table.md                 # generalised from brickshop D2 v1
│       └── crud-dialog.md                    # generalised from brickshop J v1
└── src/
    ├── components/
    │   ├── ui/                               # (unchanged)
    │   ├── layout/                           # (unchanged)
    │   └── archetypes/                       # NEW (parallel to ui/ and layout/)
    │       ├── list-with-detail/
    │       │   ├── ListWithDetailShell.tsx
    │       │   ├── ListWithDetailToolbar.tsx
    │       │   ├── ListWithDetailEmptyState.tsx
    │       │   └── index.ts
    │       ├── settings-table/
    │       │   ├── SettingsTableShell.tsx
    │       │   └── index.ts
    │       └── crud-dialog/
    │           ├── CrudDialogSheet.tsx
    │           ├── CrudDialogHeader.tsx
    │           ├── CrudDialogBody.tsx
    │           ├── CrudDialogFooter.tsx
    │           ├── useCrudDialogMode.ts
    │           └── index.ts
    └── examples/                             # (existing dir)
        ├── DemoNextApp.tsx                   # (unchanged)
        ├── DemoViteApp.tsx                   # (unchanged)
        ├── list-with-detail-demo.tsx         # NEW — sandbox second consumer
        ├── settings-table-demo.tsx           # NEW
        └── crud-dialog-demo.tsx              # NEW
```

### Manifest (`docs/archetypes/MANIFEST.json`)

Single source of truth for what baseline ships and at what version. Read by `/style-archetypes` (apply), `/promote-archetype` (write), and target projects' local manifests for `--update` diffs.

```json
{
  "version": 1,
  "archetypes": [
    {
      "key": "A",
      "slug": "list-with-detail",
      "version": "1.0",
      "promoted_from": "brickshop-manager",
      "promoted_at": "2026-05-22",
      "source_spec_version": "1.2",
      "spec": "docs/archetypes/list-with-detail.md",
      "primitives_dir": "src/components/archetypes/list-with-detail",
      "example": "src/examples/list-with-detail-demo.tsx"
    },
    { "key": "D2", "slug": "settings-table", "version": "1.0",
      "promoted_from": "brickshop-manager", "promoted_at": "2026-05-22",
      "source_spec_version": "1.0",
      "spec": "docs/archetypes/settings-table.md",
      "primitives_dir": "src/components/archetypes/settings-table",
      "example": "src/examples/settings-table-demo.tsx" },
    { "key": "J", "slug": "crud-dialog", "version": "1.0",
      "promoted_from": "brickshop-manager", "promoted_at": "2026-05-22",
      "source_spec_version": "1.0",
      "spec": "docs/archetypes/crud-dialog.md",
      "primitives_dir": "src/components/archetypes/crud-dialog",
      "example": "src/examples/crud-dialog-demo.tsx" }
  ]
}
```

### Versioning rules (semver-lite, major.minor only)

- **Minor bump** (`1.0` → `1.1`): backward-compatible — new optional props, additional layer rules, looser allowed-variation.
- **Major bump** (`1.0` → `2.0`): breaking — required props change, layer rules tighten, primitives rename or split (precedent: brickshop D → D1/D2).
- `source_spec_version` captures the brickshop (or other source) spec version that fed the promotion. Lets `/promote-archetype --update` compute the right diff window even if multiple source versions accumulated since the last promotion.

### Primitive contract (allowed / forbidden)

| Allowed in baseline primitives | Forbidden in baseline primitives |
|---|---|
| shadcn/ui imports | Supabase / Prisma / any DB-client imports |
| Tailwind tokens (`bg-background`, `text-foreground`, etc.) | React Query keys or domain hook names |
| Props for chrome variation (slot props, tone, density) | Domain types (`Order`, `LotInstance`, `Customer`) |
| Render-prop / children for data rows | Hard-coded business rules (status colors, currency formatting) |
| Generic ARIA + keyboard handling | LEGO brand colors, brickshop page paths, brickshop routes |
| Lucide icons | Brand-specific icons |

**Hard rule:** a baseline primitive's TypeScript must compile against zero domain types. Verified by the sandbox second consumer (below).

### Naming convention

Baseline primitives keep brickshop's predicted-primitive names where they exist and are already generic-sounding (`CrudDialogSheet`, `CrudDialogHeader`, `useCrudDialogMode`). Things brickshop calls by a brickshop-shaped name (`StandardTableShell`, `ItemMasterSummary`) get renamed to the more descriptive baseline name (`ListWithDetailShell`, dropped — brickshop-only).

### `/style-archetypes` apply skill

Sibling to `/style-baseline`, lives at `~/.claude/commands/style-archetypes.md`.

**Command surface:**

```
/style-archetypes                       # apply all baseline archetypes (per MANIFEST)
/style-archetypes A D2 J                # apply selected by key or slug
/style-archetypes --list                # show what's available and what would be copied
/style-archetypes --update              # show stale archetypes in this project, ask per-archetype
/style-archetypes --update A            # update just A
/style-archetypes --force               # overwrite existing files in target
```

**Prerequisite check (fail-fast):** target must have `src/components/ui/` and `src/lib/utils.ts`. If not, stop and direct the user to `/style-baseline`. Archetypes are built on top of the baseline; applying them to a bare project produces broken imports.

**What gets copied per archetype:**

| Source (donor) | Target |
|---|---|
| `docs/archetypes/<slug>.md` | `<target>/docs/archetypes/<slug>.md` |
| `src/components/archetypes/<slug>/` | `<target>/src/components/archetypes/<slug>/` |

Framework `docs/archetypes/README.md` is always copied, even for selective applies, so the target has the methodology for adding project-local archetypes. `MANIFEST.json` is also copied so `--update` works.

**The example file (`src/examples/<slug>-demo.tsx`) is NOT copied to targets.** It lives in the donor as a generic-ness contract, not as scaffolding for consumers.

**Project-added archetypes** (anything not in the baseline MANIFEST) are never touched by `/style-archetypes`. The target's `docs/archetypes/` may freely contain project-local spec files that baseline knows nothing about.

**Collision behavior:** mirrors `/style-baseline`. Pre-flight lists existing files. Without `--force`, the skill stops and reports. With `--force`, baseline files overwrite project files. Framework README + per-archetype spec docs are overwriteable (they should stay in sync with baseline). Project-local specs are never touched.

**Stack-specific:** Next.js gets the same `"use client"` prepend treatment on copied primitives. Vite no-op.

**Verification:** run target's `npm run typecheck` (or `npx tsc -b`) after copy. Don't claim success on red.

**`--update` flow:** reads target's local MANIFEST, compares against baseline's, reports diffs:

```
A   list-with-detail   target: 1.0   baseline: 1.2   minor diff (3 files)
D2  settings-table     target: 1.0   baseline: 1.0   ok
J   crud-dialog        target: 1.0   baseline: 2.0   MAJOR diff (5 files) — review breaking changes
```

Minor diffs auto-apply with one confirmation. Major diffs open the layer-by-layer diff (same UX as `/promote-archetype --update`, just consuming instead of producing) — the project owner triages each layer.

**No silent updates:** a bare `/style-archetypes` on an already-applied target is a no-op for archetype files (just refreshes framework README + MANIFEST).

### `/promote-archetype` skill

Lives at `~/.claude/commands/promote-archetype.md`.

**Command surface:**

```
/promote-archetype <slug>                       # first-time promotion
/promote-archetype --update <slug>              # baseline already has it; sync source changes
/promote-archetype --dry-run <slug>             # show diff without writing
/promote-archetype --source <path> <slug>       # default source is brickshop-manager
```

**Maturity gates (first-time):**

1. Spec v1+ locked in source project (committed; ADR exists, or spec has `status: locked`).
2. Phase 4 migration started — at least one page is actually running on the spec.
3. Stable for at least one session of source-project work where the spec wasn't amended (user-judged).

**Maturity gate (update):** source spec version bumped (e.g., v1 → v2) AND at least one source page migrated to the new version.

**First-time path:**

1. Read source project's spec doc, audit doc, governing ADRs, and primitive implementations.
2. Apply de-source-ification ruleset (see Generalisation Methodology) → produce draft baseline spec + draft primitive files + sandbox demo skeleton.
3. Layer-by-layer review (12 cells for page kind, 15 for dialog kind). For each cell, present source version vs baseline draft; user accepts, edits, or rejects.
4. Build sandbox second consumer in `design-baseline/src/examples/<slug>-demo.tsx` with a far-from-source domain (podcasts, recipes, fitness logs — anything but the source project's domain). Types written first with zero reference to source spec; then plugged into the primitive. If types don't fit, gap is real → fix primitive before proceeding.
5. Write donor files: spec, primitives, demo, MANIFEST entry.
6. Run baseline's typecheck (if it has one) on the demo to verify generic-ness.

**Update path:**

1. Read source project's current spec + the baseline's current spec.
2. Diff layer-by-layer. For each difference, ask user to triage into one of three buckets:

| Bucket | Example | Action |
|---|---|---|
| Generic improvement | "table row keyboard navigation now uses arrow keys" | Propagate to baseline. |
| Project-specific behavior | "row click opens LotDetailDialog with sourcing thumbnail" | Stay in source. Documented in source's spec as project-extension. |
| Spec correction | "added mandatory `formatDate()` for date columns" | Propagate — refined generic rule. |

3. Write only propagated changes to baseline. Bump version (minor or major per rules above). Update `source_spec_version` and `promoted_at`.

**Frequency:** user-initiated only. No automation.

**Future trigger:** a `/ship` hook could surface "archetype X is unpromoted but its spec has been v1+ for N sessions" when the shipping branch touched `<source>/docs/archetypes/` files. Out of scope for v1 of this work; mentioned because the MANIFEST entries make it cheap to add.

### Generalisation methodology

One `/feat extract-archetype-<slug>` worktree per extraction, run inside `~/Documents/dev/design-baseline/` … except design-baseline is not a git repo (verified 2026-05-22), so the worktree convention does not apply. **Each extraction is a direct working session** against the donor.

**Per-archetype work cell:**

1. **Read the source-of-truth.** Source project's spec doc, audit doc, governing ADRs, primitive implementations. The audit doc tells you which layer-cells were "essential variation" (preserve generically) vs "accidental drift" (irrelevant to baseline).

2. **De-source-ification ruleset for the spec:**
   - Replace concrete page paths (`/orders`, `/sourcing`) with generic examples (`/items`, `/users`).
   - Replace source primitive names (`StandardTableShell`, `ItemMasterSummary`) with baseline primitive names from the MANIFEST.
   - Strip Supabase select fragments, React Query keys, concrete hook names. Replace with a generic "data shape contract" — what the primitive expects as input, leaving how-you-fetch to the consumer.
   - Strip domain types (`Order`, `LotInstance`); use placeholder generics (`Row`, `Entity`, `Detail`).
   - Strip source-internal forbidden lists (e.g., "no D2 inside H"); keep generic forbidden patterns.
   - Preserve all twelve (or fifteen, for dialog kind) layers — every baseline spec covers the same grid as the source. The grid is the framework.

3. **De-source-ification ruleset for primitives:**
   - Identify the "chrome" — wrapping elements, layout, ARIA, keyboard, transitions, spacing.
   - Identify the "data plumbing" — query hooks, mutations, type-specific cells.
   - Rewrite with chrome as the body and data plumbing as render-props or generic callback props. Concrete data types become generics with `extends`-clauses where needed.
   - For each prop, write a one-line JSDoc — public-API surface for baseline.

4. **Verify generic-ness with sandbox second consumer.** Build a demo in `design-baseline/src/examples/<slug>-demo.tsx` using the primitive against a far-from-source domain. **Pick domains far from source nouns** — anything inventory-flavored will let source-isms slip through if extracting from brickshop. Podcasts, recipes, book annotations, fitness logs work for brickshop. Write types first, with zero reference to source spec, then plug them in. If types don't fit, gap is real.

5. **Round-trip check.** Re-read the baseline spec from the source's perspective. Does source's actual implementation still satisfy the generic spec? If source has features the generic spec doesn't allow, either (a) spec missing an "allowed variation" carve-out (add it), or (b) those features stay in source as documented project-extensions (mark in source's spec). Decide explicitly.

6. **Update donor MANIFEST.json** with the new entry.

**Estimated effort for the first three (A + D2 + J):** roughly one session per archetype for spec, one for primitives + demo. ~6 sessions total. J is heaviest because brickshop hasn't built its primitives yet — baseline extraction writes them first and brickshop adopts later.

### Drift & update policy

**Brickshop keeps bespoke implementations.** Once a baseline version ships, brickshop does **not** migrate to the baseline primitive. Drift is tracked the way brickshop already does (`docs/archetypes/drift-YYYY-MM-DD.md`), and a periodic `/promote-archetype --update` brings baseline up to date with brickshop's evolved spec. The alternative — forcing brickshop to consume baseline — would have brickshop chasing baseline's API every time, and brickshop has too much specialised behavior to make that worth it.

**Observation cadence:**

1. **Source drift docs** already exist in brickshop. When you write one, that's the trigger to consider `/promote-archetype --update`.
2. **Future `/ship` hook** could surface promotion candidates by checking, when shipping any change to `brickshop-manager/docs/archetypes/`, whether the touched archetypes have a baseline `source_spec_version` lower than the current source spec. Out of scope for v1.

No active drift-scanning daemon. Surfacing is opportunistic.

**Reverse direction.** A third project (controlling-app, a new app) can be a promotion source via `--source <path>`. Real cross-project rule-of-2 starts existing the moment two projects independently shipped the same archetype shape — that's the natural moment for the most rigorous baseline version.

**Baseline never originates.** If you find yourself wanting to design an archetype directly in baseline without a real project consuming it, that's the signal you're working in the wrong repo — go build it in a real project first, then promote.

## First-ship contents

**Archetypes (3):**

| Key | Slug | Brickshop status at promotion | Notes |
|---|---|---|---|
| A | list-with-detail | spec v1.2, Phase 4 migration in progress (3 of 8 pages) | Most mature; widest applicability. |
| D2 | settings-table | spec v1, Phase 4 pending | Specs are settled; primitives unbuilt in brickshop, so extraction designs them. |
| J | crud-dialog | spec v1, primitives planned but pending | Heaviest extraction — primitives designed for first time. Brickshop adopts after. |

**Framework (1):**

- `docs/archetypes/README.md` — generalised version of brickshop's archetype README. Covers: 12-layer grid (and 15-layer dialog variant), kinds (page, dialog, flow, component), rule-of-2, scope→audit→spec→migration phases, promotion contract from source projects.

**Out of scope for v1:** B detail-view, D1 settings-form, F1 domain-hub, F2 tabbed-settings, G lookup, H feed (all scope-locked in brickshop but spec-pending), C dashboard (parked, singleton), E1/E2 (parked, singletons), K item-selector (project-specific in current form).

## Open questions

1. **Where does the framework README live in a target project's docs?** Default: `<target>/docs/archetypes/README.md`. Some projects keep all docs flat in `docs/`; some have nested structures. The skill writes to `docs/archetypes/README.md` and the user moves it if needed.
2. **Should baseline ship the example demos as `.tsx` if a target uses `.jsx`?** Decision: yes, baseline is TypeScript-first. Targets using `.jsx` won't run `/style-baseline` cleanly anyway. Document the assumption.
3. **What happens when a major version bump renames a primitive?** The `--update` flow needs a `renames` field in the MANIFEST so it can suggest the rewrite. Deferred to whenever the first major bump happens; not needed in v1.
4. **How does the framework README handle terminology drift between projects?** If a future project uses "view" instead of "page" or "modal" instead of "dialog", the README's vocabulary won't fit. Deferred — re-evaluate at second-project adoption.

## Risks

| Risk | Mitigation |
|---|---|
| Sandbox demos fool us into thinking primitives are generic when they're still brickshop-shaped | Pick demos in domains with completely different nouns; write types first with zero reference to source. |
| Brickshop evolves so fast that baseline is always stale | Acceptable — baseline is a snapshot library, not a live mirror. Drift is the design, not a bug. |
| `/promote-archetype` skill becomes a maintenance burden | Skill is thin — it orchestrates the human's layer-by-layer review and writes files. Most logic is in the user's judgment per layer. |
| Target projects on old archetype versions are forgotten | `/style-archetypes --update` makes catching up explicit and one-command. No silent rot. |
| First sandbox demo for an archetype is hard to design from cold | Acceptable cost; doubles as documentation that ships with the archetype. |

## Acceptance criteria

1. `~/Documents/dev/design-baseline/docs/archetypes/` exists with `README.md`, `MANIFEST.json`, `list-with-detail.md`, `settings-table.md`, `crud-dialog.md`.
2. `~/Documents/dev/design-baseline/src/components/archetypes/` exists with `list-with-detail/`, `settings-table/`, `crud-dialog/` subdirs, each containing primitive `.tsx` files and an `index.ts`.
3. `~/Documents/dev/design-baseline/src/examples/` has `list-with-detail-demo.tsx`, `settings-table-demo.tsx`, `crud-dialog-demo.tsx`, each consuming the primitive against a far-from-brickshop domain.
4. `~/.claude/commands/style-archetypes.md` exists; running `/style-archetypes` on a fresh `/style-baseline`-applied Vite + React 19 project copies archetypes and primitives, leaves typecheck green.
5. `~/.claude/commands/promote-archetype.md` exists; running `/promote-archetype --dry-run list-with-detail` against brickshop-manager produces a layer-by-layer diff and writes nothing.
6. `~/.claude/commands/style-baseline.md` is updated to mention the sibling commands in its final report.
7. Each baseline primitive's `.tsx` file compiles against zero domain types from any specific project.
8. `MANIFEST.json` has a versioned entry for each of A, D2, J pointing at correct paths.

## Implementation phases

Phase ordering optimises for end-to-end validation (donor structure + one archetype + apply skill) before scaling to all three archetypes.

1. **Donor scaffolding.** Create `docs/archetypes/` and `src/components/archetypes/` empty dirs. Write `MANIFEST.json` with an empty array. Write framework `README.md` (generalised from brickshop's). Update `STYLE.md` to reference the new archetype layer. Update donor `README.md` Option 1/2 to mention archetypes.
2. **Extract A (list-with-detail).** Spec + primitives + sandbox demo. Add to MANIFEST.
3. **Author `/style-archetypes` skill.** Pre-flight, copy, `--list`, `--update`, `--force`, stack-specific handling, verification. Test against a fresh Vite + React 19 project (or mistra's frontend as a stand-in).
4. **Author `/promote-archetype` skill.** First-time path, update path, `--dry-run`, `--source`. Test against brickshop-manager as source for A.
5. **Extract D2 (settings-table).** Spec + primitives + sandbox demo. Add to MANIFEST.
6. **Extract J (crud-dialog).** Spec + primitives + sandbox demo. Add to MANIFEST.
7. **Update `/style-baseline` skill** to mention sibling commands in final report.
8. **Memory updates.** Update `reference_design_baseline.md` to mention the archetype layer + `/style-archetypes` + `/promote-archetype`.

Phases 1–4 land the workflow end-to-end with one archetype. Phases 5–6 scale to the rest of the first ship. Phases 7–8 close the loop on documentation.
