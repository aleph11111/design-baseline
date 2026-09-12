#!/usr/bin/env node
// Verifies docs/archetypes/MANIFEST.json's `source_spec_version` per archetype matches the
// same field in that archetype's spec doc frontmatter. Doc-vs-manifest drift here means the
// donor is claiming to track an upstream spec revision it has actually fallen out of sync with
// (see docs/backlog/detail-overview-spec-version-drift.md for the incident this catches).
//
// Deliberately does NOT diff `version` — MANIFEST version legitimately runs ahead of doc
// version by design (see docs/archetypes/README.md, Versioning section); only
// `source_spec_version` is meant to be an exact copy between the two files.
//
// Zero-dependency by design, mirroring scripts/lint-design.mjs.
//
// Usage:  node scripts/verify-manifest-versions.mjs

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, 'docs/archetypes/MANIFEST.json'), 'utf8'));

// Extract a scalar frontmatter value by key, unquoted — parsing doc frontmatter as JS numbers
// would mangle "1.0" into 1, breaking the string comparison against MANIFEST's quoted value.
function frontmatterField(text, key) {
  const m = text.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  if (!m) return undefined;
  return m[1].trim().replace(/^['"](.*)['"]$/, '$1');
}

let mismatches = 0;
for (const entry of manifest.archetypes) {
  // source_spec_version pins the *source project's* spec revision (README.md, Versioning
  // section) — meaningless for authored archetypes (report, calendar) that have no
  // promoted_from source project, so they carry no such field in their doc frontmatter.
  if (!entry.promoted_from) continue;
  const docPath = entry.spec ?? join('docs/archetypes', `${entry.slug}.md`);
  const doc = readFileSync(join(root, docPath), 'utf8');
  const docVersion = frontmatterField(doc, 'source_spec_version');
  const manifestVersion = entry.source_spec_version;
  if (docVersion !== manifestVersion) {
    mismatches++;
    console.log(`${entry.slug}: doc=${docVersion} manifest=${manifestVersion}`);
  }
}

// Methodology docs have no deliverable counter (no primitives, demo, or
// blueprint) — the MANIFEST copy of a methodology doc's `version` is a mirror
// that goes stale. Each doc's own frontmatter `version:` is the single source
// (PLUGIN-CONTRACT.md, Versioning section), so a `version` field on any
// methodology[] entry is a reintroduced hand-maintained number and must not
// exist. This loop covers the second array the :30 archetypes loop never
// reached, which is why the methodology drift class was never caught.
const methodologyVersions = (manifest.methodology ?? []).filter((e) => 'version' in e);

// A closed archetype's props are the binding (RULES.md rule 2): its reference
// implementation is the shipped, typed export, not a doc. Any `reference_impl`
// key on an archetype entry — or any `docs/archetypes/*.baseline.md` file — is
// a reintroduced sibling mirror that must not exist. Mirrors the
// methodology[].version guard above (same drift class: a hand-maintained copy
// of the shipped code).
const refImplEntries = (manifest.archetypes ?? []).filter((a) => 'reference_impl' in a);
const archetypesDir = join(root, 'docs/archetypes');
const baselineSiblings = existsSync(archetypesDir)
  ? readdirSync(archetypesDir).filter((f) => f.endsWith('.baseline.md'))
  : [];

if (mismatches || methodologyVersions.length || refImplEntries.length || baselineSiblings.length) {
  if (mismatches) {
    console.error(`\nverify:manifest — ${mismatches} source_spec_version mismatch(es)`);
  }
  for (const e of methodologyVersions) {
    console.error(`verify:manifest — methodology doc "${e.slug}" carries a "version" field; remove it, the doc's frontmatter is the single source`);
  }
  for (const a of refImplEntries) {
    console.error(`verify:manifest — archetype "${a.slug}" carries a "reference_impl" key; delete it, the binding is the shipped typed export (RULES.md rule 2), not a doc`);
  }
  for (const f of baselineSiblings) {
    console.error(`verify:manifest — ${join('docs/archetypes', f).replace(/\\/g, '/')} exists; the baseline reference siblings are retired (G2) — delete the file`);
  }
  process.exit(1);
}
console.log('verify:manifest — all source_spec_version fields match; no methodology version mirrors; no reference_impl keys, no .baseline.md siblings');
process.exit(0);
