#!/usr/bin/env node
// design-baseline adherence lint — the mechanical half of ADOPTION.md gate 2.
//
// Zero-dependency by design: a heuristic source scan, no ESLint or oxlint required, so a
// consumer with no linter still gets a working gate the moment /adopt-baseline wires it.
// (oxlint cannot express `no-restricted-syntax`, which the earlier config depended on — see
// _adherence.NOTES.md and ADR-0003.)
//
// Reads `_adherence.json` (rules + target dirs) from the repo root, walks every `.tsx` file
// under the target dirs, and reports each hit as a warning. A rule matches either a bare
// banned tag (`"tag": "button"`) or an arbitrary regex (`"pattern": "focus:ring-1\\b"` — the
// form the ported docs/audit-signals.json conformance signals use). Tag matching is
// case-sensitive, so the design-system primitives `<Button>` / `<Table>` are never flagged.
// Warnings exit 0 (allowed during rollout); any `error`-severity hit exits 1. That is the
// ratchet: flip a rule to `"severity": "error"` in _adherence.json once its class is clean.
//
// Usage:  node scripts/lint-design.mjs
// Config: ADHERENCE_CONFIG=path overrides the default `_adherence.json`.

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const args = process.argv.slice(2);
const jsonMode = args.includes('--json') || args.includes('--json-output');
const ciThresholdIdx = args.indexOf('--ci-threshold');
let ciThreshold = null;
if (ciThresholdIdx !== -1 && ciThresholdIdx + 1 < args.length) {
  ciThreshold = parseInt(args[ciThresholdIdx + 1], 10);
  if (isNaN(ciThreshold)) {
    console.error('lint:design — --ci-threshold requires a number');
    process.exit(2);
  }
}

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

// Compile each rule once. `pattern` is used verbatim; a `tag` rule matches a bare lowercase
// element — `<tag` immediately followed by whitespace, `/`, or `>` — case-sensitive (no `i`
// flag) so the capitalized DS primitive `<Button>` is not a hit.
const compiled = rules.map((rule) => {
  const source = rule.pattern ?? `<${rule.tag}(?=[\\s/>])`;
  try {
    return {
      re: new RegExp(source, 'g'),
      label: rule.tag ? `<${rule.tag}>` : rule.id,
      severity: rule.severity === 'error' ? 'error' : 'warn',
      message: rule.message,
    };
  } catch (err) {
    console.error(`lint:design — rule ${rule.id}: bad pattern /${source}/: ${err.message}`);
    return process.exit(2);
  }
});

const violations = [];
let warnings = 0;
let errors = 0;
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  for (const { re, label, severity, message } of compiled) {
    lines.forEach((line, i) => {
      for (const m of line.matchAll(re)) {
        const fileRel = relative(root, file);
        const v = { file: fileRel, line: i + 1, rule: label, severity, message };
        violations.push(v);
        if (severity === 'error') errors++; else warnings++;
        if (!jsonMode) {
          console.log(
            `${fileRel}:${v.line}:${m.index + 1}  ${severity}  ${label}  ${message}`,
          );
        }
      }
    });
  }
}

if (jsonMode) {
  const result = {
    violations,
    summary: { files: files.length, warnings, errors },
  };
  process.stdout.write(JSON.stringify(result) + '\n');
} else {
  const summary = `lint:design — ${files.length} file(s) scanned, ${warnings} warning(s), ${errors} error(s)`;
  if (errors) {
    console.error(`\n${summary}`);
  } else {
    console.log(`\n${summary}`);
  }
}

if (ciThreshold !== null && (warnings + errors) > ciThreshold) {
  process.exit(1);
}
if (errors) {
  process.exit(1);
}
process.exit(0);
