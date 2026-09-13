# Design-plugin contract

This repo is the reference implementation of a **design-baseline plugin** — a
capability that a hub (the engineering dashboard) can *connect to* and expose
design features (browse, adopt, drift, iterate) around. The hub binds to
**whatever path is configured**, not to this repo specifically: any repo that
satisfies this contract can be connected, and the hub's design features light up
for it. No connected plugin → those features stay greyed out. This is what makes
the hub usable without a baseline, and what lets someone bring their own.

## A repo IS a design-plugin when it has

1. **`docs/archetypes/MANIFEST.json`** with:
   - a top-level **`plugin`** block:
     ```jsonc
     "plugin": {
       "kind": "design",
       "name": "<plugin name>",
       "version": "<plugin contract version>",
       "taxonomy": "docs/TAXONOMY.md",        // optional, repo-relative
       "surface": {
         "type": "vite-app",
         "build": "npm run gallery:build",     // produces the mountable surface
         "dist": "gallery-dist",               // static dir the hub serves + iframes
         "route": "/a/{slug}"                  // deep-link shape within the surface
       },
       "actions": [                            // declared, hub maps to its machinery
         { "id": "install-package",   "command": "see docs/PACKAGE.md",         "scope": "project" },
         { "id": "promote-archetype", "command": "/promote-archetype {key}",    "scope": "baseline" },
         { "id": "iterate-baseline",  "command": "design-baseline iteration",   "scope": "baseline" }
       ]
     }
     ```
   - an **`archetypes`** array, each entry: `key`, `slug`, `displayName`,
     `version`, `source_spec_version`, `spec` (repo-relative, the stack-agnostic
     contract), `primitives_dir`, `example` (the demo).
     `version` / `source_spec_version` are what the hub diffs against a target's
     adopted versions to compute **drift**.

     The binding per archetype is the shipped, typed export
     `design-baseline/archetypes/<slug>` — a closed archetype's props are the
     API; there is no reference-implementation sibling doc to point at (the
     hub's `designPlugin.ts` validates only `key` / `slug` per entry).

2. **A buildable gallery surface** — `npm run gallery:build` emits a static,
   self-contained `gallery-dist/` (per the `surface` block). The hub serves this
   dir and iframes it; it never copies the plugin's components.

3. **The archetype bodies** the manifest points at: the contracts
   (`docs/archetypes/<slug>.md`), the primitives
   (`src/components/archetypes/<slug>/`), and the demos
   (`src/examples/<slug>-demo.tsx`). The contracts ship in the package, so a
   consumer's `docs/archetypes/<slug>.md` fork is deleted and superseded by
   the installed one — `docs/PACKAGE.md`, step 6.

## How the hub binds (the connector)

- The hub stores a **connection** (a configured path, absent by default). On
  each snapshot it **validates**: path exists → has `MANIFEST.json` → has a
  `plugin` block → archetypes parse. Result: `connected: true/false (+ reason)`.
- `connected` derives a **capability** that gates every design surface. Absent
  or invalid → greyed out, endpoints refuse cleanly. Nothing runs in the shadow.
- Per-target opt-in is separate: a managed repo only participates in design
  (drift, adopt, design rituals) when it declares a frontend surface. Mechanical
  repos never see design features.

## Versioning

Two version numbers, one meaning each — do not read one where the other is
meant:

- **Installed / bundle version** — `package.json`'s `version`, equal to the
  git tag (e.g. `v0.2.1`). This is the number a consumer resolves when it
  depends on `design-baseline`, and the number that stands for the shipped
  shell (chrome + primitives). A change under `src/components/` or
  `src/styles/` bumps `package.json` and cuts a tag — demand-driven cadence:
  a tag is cut when a consumer needs the change, not on a schedule.
- **Contract shape version** — `plugin.version` in
  `docs/archetypes/MANIFEST.json`. This is the **contract** version: bump on
  a breaking change to the `plugin` block's shape (a new discoverable layer,
  a reshaped surface/action contract) and on nothing else. It does **not**
  move when `src/components/` or `src/styles/` change — chrome and primitive
  changes are `package.json` + tag, per the rule above — so no reader can
  derive an installed/bundle version from it.

Per-archetype `version` / `source_spec_version` are the **content**
versions (bumped when a primitive/spec changes) and drive drift detection. See
`docs/archetypes/MANIFEST.json` and `docs/TAXONOMY.md`.

A **methodology doc's version is its own frontmatter** `version:` — the
single source for that doc, alongside the two numbers above. Methodology docs
(`docs/CHOOSING-A-SURFACE.md`, `docs/PLACEMENT.md`, `docs/STACK.md`,
`docs/DETAIL-PAGE-TEARDOWN-PLAYBOOK.md`) have no primitives, demo, or blueprint,
so they carry no deliverable counter: the `methodology[]` entries in
`docs/archetypes/MANIFEST.json` must therefore carry **no** `version` field.
A mirror there goes stale, and a scanner comparing a consumer copy against it
under-reports staleness; the comparison key is the doc's own frontmatter.
`scripts/verify-manifest-versions.mjs` fails if a `methodology[]` entry ever
carries a `version` field.
