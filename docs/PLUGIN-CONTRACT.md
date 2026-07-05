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
         { "id": "adopt-baseline",  "command": "/style-baseline",        "scope": "project" },
         { "id": "adopt-archetype", "command": "/style-archetypes {key}", "scope": "project" },
         { "id": "iterate-baseline","command": "<iterate session>",       "scope": "baseline" }
       ]
     }
     ```
   - an **`archetypes`** array, each entry: `key`, `slug`, `displayName`,
     `version`, `source_spec_version`, `spec` (repo-relative, the stack-agnostic
     contract), `reference_impl` (repo-relative, the baseline reference sibling
     `<slug>.baseline.md`), `primitives_dir`, `example` (the demo).
     `version` / `source_spec_version` are what the hub diffs against a target's
     adopted versions to compute **drift**.

2. **A buildable gallery surface** — `npm run gallery:build` emits a static,
   self-contained `gallery-dist/` (per the `surface` block). The hub serves this
   dir and iframes it; it never copies the plugin's components.

3. **The archetype bodies** the manifest points at: contracts
   (`docs/archetypes/<slug>.md`), their baseline reference siblings
   (`docs/archetypes/<slug>.baseline.md`), reference primitives
   (`src/components/archetypes/<slug>/`), and demos
   (`src/examples/<slug>-demo.tsx`).

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

The `plugin.version` is the **contract** version (bump on breaking changes to
this shape). Per-archetype `version` / `source_spec_version` are the **content**
versions (bumped when a primitive/spec changes) and drive drift detection. See
`docs/archetypes/MANIFEST.json` and `docs/TAXONOMY.md`.
