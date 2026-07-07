#!/usr/bin/env node
// design-baseline adherence lint — the mechanical half of ADOPTION.md gate 2.
//
// Zero-dependency by design: a heuristic source scan, no ESLint or oxlint required, so a
// consumer with no linter still gets a working gate the moment /adopt-baseline wires it.
// (oxlint cannot express `no-restricted-syntax`, which the earlier config depended on — see
// _adherence.NOTES.md and ADR-0003.)
//
// Reads `_adherence.json` (rules + target dirs) from the repo root, walks every `.tsx` file
// under the target dirs, and reports each bare banned tag as a warning — case-sensitive, so
// the design-system primitives `<Button>` / `<Table>` are never flagged. Warnings exit 0
// (allowed during rollout); any `error`-severity hit exits 1. That is the ratchet: flip a
// rule to `"severity": "error"` in _adherence.json once its violation class is clean.
//
// Usage:  node scripts/lint-design.mjs
// Config: ADHERENCE_CONFIG=path overrides the default `_adherence.json`.

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const CONFIG = process.env.ADHERENCE_CONFIG || '_adherence.json';

let config;
try {
  config = JSON.parse(readFileSync(join(root, CONFIG), 'utf8'));
} catch (err) {
  console.error(`lint:design — cannot read ${CONFIG}: ${err.message}`);
  process.exit(2);
}

const targets = config.targets?.length ? config.targets : ['src'];
const rules = config.rules ?? [];

// Collect every .tsx file under a directory root, skipping node_modules and dotfiles.
function walk(dir, acc) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc; // missing target dir — skip silently (a consumer may not have every root)
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.tsx')) acc.push(p);
  }
  return acc;
}

const files = targets.flatMap((t) => walk(join(root, t), []));

let warnings = 0;
let errors = 0;
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  for (const rule of rules) {
    // Match a bare lowercase element: `<tag` immediately followed by whitespace, `/`, or `>`.
    // Case-sensitive (no `i` flag) so the capitalized DS primitive `<Button>` is not a hit.
    const re = new RegExp(`<${rule.tag}(?=[\\s/>])`, 'g');
    const severity = rule.severity === 'error' ? 'error' : 'warn';
    lines.forEach((line, i) => {
      for (const m of line.matchAll(re)) {
        severity === 'error' ? errors++ : warnings++;
        console.log(
          `${relative(root, file)}:${i + 1}:${m.index + 1}  ${severity}  <${rule.tag}>  ${rule.message}`,
        );
      }
    });
  }
}

const summary = `lint:design — ${files.length} file(s) scanned, ${warnings} warning(s), ${errors} error(s)`;
if (errors) {
  console.error(`\n${summary}`);
  process.exit(1);
}
console.log(`\n${summary}`);
process.exit(0);
