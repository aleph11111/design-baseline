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

import { readFileSync } from 'node:fs';
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

if (mismatches) {
  console.error(`\nverify:manifest — ${mismatches} source_spec_version mismatch(es)`);
  process.exit(1);
}
console.log('verify:manifest — all source_spec_version fields match');
process.exit(0);
