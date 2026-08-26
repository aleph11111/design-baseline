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
// A rule may carry an optional `include` glob (repo-root-relative, e.g.
// `"src/components/archetypes/**"` or `"src/components/archetypes/**/*Shell.tsx"`) that
// restricts it to that path set — checked against each walked file's path relative to the
// repo root (`**` spans any run of directory segments, `*` matches within one). Rules
// without an `include` match every walked file, as before. That is what lets an
// archetype-layer rule (e.g. an appearance-prop ban) scope to
// `src/components/archetypes/` without firing on `src/components/ui/` leaves, where
// `variant` / `size` props are correct shadcn practice.
//
// A rule may also carry an optional `exclude` that removes matching files from the
// rule (in addition to `include`, when both are set). `exclude` is a glob, or an
// array of globs — the file is skipped when ANY of them matches. That is the
// per-archetype ratchet valve: once an archetype's class is closed, its folder is
// excluded from the shared `warn` drain rules, and a per-folder `error` rule (the
// engaged ratchet) is added for the closed API — so the scanner no longer counts a
// closed archetype as an open one. As more archetypes close, the drain rules
// accumulate one exclude glob per closed folder (the array form).
//
// Usage:  node scripts/lint-design.mjs [--json] [--ci-threshold <n>]
// Config: ADHERENCE_CONFIG=path overrides the default `_adherence.json`.
//
// The module is importable: `globToRegExp`, `compileGlobs`, `compileRules` and `scanFile`
// are pure and exported (see scripts/lint-design.test.mjs). Only `main()` touches argv,
// the filesystem, stdout and the exit code, and it runs only when the file is the entry
// point — importing it scans nothing.

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

// Translate a repo-root-relative path glob into an anchored RegExp. `**` spans any run of
// directory segments (including none); `*` matches within a single segment. Only the two
// wildcards the rule shape needs — a full glob engine would be dead weight for a zero-dep
// scanner.
function globToRegExp(glob) {
  const parts = glob.split('/');
  // A `**` part matches zero or more whole path segments; a `*` matches within one
  // segment. Only the two wildcards the rule shape needs — a full glob engine would be
  // dead weight for a zero-dep scanner. Encoded per position: a leading `**` becomes
  // `(?:seg/)*` (units trail their separator); a `**` elsewhere becomes `(?:/seg)*`
  // (units lead with theirs, so the concrete part's own slash still applies).
  if (parts.length === 1 && parts[0] === '**') return new RegExp('^(.*)$');
  // Escape every RegExp metacharacter the wildcard split can't own (the caller handles
  // `*`; `**` is consumed whole). The class closes after the escaped `\`, so `]` is
  // reached as a literal class member, not a closer.
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let re = '';
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === '**') {
      re += i === 0 ? '(?:[^/]+/)*' : '(?:/[^/]+)*';
      continue;
    }
    // A concrete part takes a leading `/` (unless first). One exception: right after a
    // *leading* `**`, whose `(?:seg/)*` units already carry the trailing slash when
    // non-empty — a second slash would be wrong. (After a *non-leading* `**`, the slash
    // is required: when `**` matches zero segments it is the only separator. `a/**/b`
    // must still match `a/b`.)
    if (i > 0 && !(i === 1 && parts[0] === '**')) re += '/';
    re += p.split('*').map(esc).join('[^/]*');
  }
  return new RegExp('^' + re + '$');
}

// A rule failed to compile (bad `pattern` / `include` / `exclude` glob or pattern). Carries
// the already-formatted diagnostic `main()` prints; it is thrown instead of exiting so the
// compilers stay pure functions — the exit lives in the CLI, not the compiler.
class CompileError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CompileError';
  }
}

// Compile one rule's `include` / `exclude` (glob or array of globs, or absent) into an
// array of compiled RegExps so the scope check in `scanFile` stays one
// `includes.some(...)` / `excludes.some(...)`. Throws `CompileError` on a bad glob.
function compileGlobs(rule, key) {
  const value = rule[key];
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]).map((glob) => {
    try {
      return globToRegExp(glob);
    } catch (err) {
      throw new CompileError(`lint:design — rule ${rule.id}: bad ${key} glob "${glob}": ${err.message}`);
    }
  });
}

// Compile every rule once. `pattern` is used verbatim; a `tag` rule matches a bare lowercase
// element — `<tag` immediately followed by whitespace, `/`, or `>` — case-sensitive (no `i`
// flag) so the capitalized DS primitive `<Button>` is not a hit.
// Throws `CompileError` on a bad pattern or glob.
function compileRules(rules) {
  return rules.map((rule) => {
    const source = rule.pattern ?? `<${rule.tag}(?=[\\s/>])`;
    let re;
    try {
      re = new RegExp(source, 'g');
    } catch (err) {
      throw new CompileError(`lint:design — rule ${rule.id}: bad pattern /${source}/: ${err.message}`);
    }
    return {
      re,
      label: rule.tag ? `<${rule.tag}>` : rule.id,
      severity: rule.severity === 'error' ? 'error' : 'warn',
      message: rule.message,
      includes: compileGlobs(rule, 'include'),
      excludes: compileGlobs(rule, 'exclude'),
    };
  });
}

// Run the compiled rules against one file's text and return its violations (an empty list
// when every rule is out of scope or finds nothing). `fileRel` must be repo-root-relative,
// as the include/exclude globs are. One violation per per-line per-match hit:
// `{ file, line, col, rule, severity, message }`. The scan lives here so the CLI stays a
// thin caller and the core is unit-testable without a repo tree.
function scanFile(fileRel, text, compiled) {
  const violations = [];
  const lines = text.split('\n');
  for (const { re, label, severity, message, includes, excludes } of compiled) {
    // No `include` (or a rule whose `include` list is empty) matches every walked file;
    // with one or more `include` globs the rule applies only when ANY of them matches.
    if (includes.length && !includes.some((inc) => inc.test(fileRel))) continue;
    if (excludes.some((ex) => ex.test(fileRel))) continue; // excluded closed archetype
    re.lastIndex = 0; // the `g` flag makes `matchAll` index-sensitive — don't leak state
    lines.forEach((line, i) => {
      for (const m of line.matchAll(re)) {
        violations.push({
          file: fileRel,
          line: i + 1,
          col: m.index + 1,
          rule: label,
          severity,
          message,
        });
      }
    });
  }
  return violations;
}

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

function main() {
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

  let compiled;
  try {
    compiled = compileRules(rules);
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }

  const files = targets.flatMap((t) => walk(join(root, t), []));

  const allViolations = files.map((file) => ({
    fileRel: relative(root, file),
    violations: scanFile(relative(root, file), readFileSync(file, 'utf8'), compiled),
  }));
  const violations = allViolations.flatMap(({ violations }) => violations);
  const warnings = violations.filter((v) => v.severity === 'warn').length;
  const errors = violations.filter((v) => v.severity === 'error').length;

  if (jsonMode) {
    const result = {
      violations,
      summary: { files: files.length, warnings, errors },
    };
    process.stdout.write(JSON.stringify(result) + '\n');
  } else {
    for (const { fileRel, violations: fileViolations } of allViolations) {
      for (const v of fileViolations) {
        console.log(`${fileRel}:${v.line}:${v.col}  ${v.severity}  ${v.rule}  ${v.message}`);
      }
    }
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
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main();
}

export { globToRegExp, compileGlobs, compileRules, scanFile, CompileError, walk };
