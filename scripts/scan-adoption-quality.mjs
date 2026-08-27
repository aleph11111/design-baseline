#!/usr/bin/env node
// Axis-C (adoptionQuality) discovery radar — the machine half of the
// "deterministic tripwires → LLM acceptance gate" split documented in
// docs/ADOPTION-QUALITY.md and docs/FLEET-AUDIT.md.
//
// Where docs/audit-signals.json's `molecule`/`conformance` arrays have a machine
// consumer (the dashboard's moleculeAudit) and `adoptionQuality` has had none —
// its per-page LLM gate walk runs once at adoption time — this script closes the
// gap: the recurring fleet-wide per-signal hit count for the third axis.
//
// Zero-dependency by design, mirroring scripts/lint-design.mjs (ADR-0003): a
// consumer with nothing but Node gets a working scan the moment it has the
// vendored docs/audit-signals.json — no ripgrep, no ESLint, no fork of the
// runner. The consumer vendors the SIGNALS (the donor file, file-copy sync) and
// calls THIS script; forking either half is the drift the FLEET-AUDIT "never
// fork the runner" rule exists to prevent.
//
// Semantics — a radar, not a ratchet:
//   - Every entry's `coOccursWith` gate is respected (PCRE alternation of the
//     archetype's shell import names, tested against the whole file) so a signal
//     fires ONLY on a file that actually adopts the gated archetype.
//   - Every signal in the array is MEASURED and appears in the output — a
//     hitless signal reports `hits: []` ("measured, zero"), never "absent", so
//     a consumer's vendored snapshot can be diffed against its live file.
//   - A hit is a CANDIDATE, never a verdict (docs/ADOPTION-QUALITY.md): the
//     per-page LLM acceptance-gate pass remains the decision layer. The scan
//     therefore NEVER gates — it exits 0 even when red-tier signals fire; it
//     only measures and reports.
//
// The donor runs it on itself (`npm run scan:adoption-quality`) as its own
// tripwire smoke — the shipped signal set must compile under a plain Node
// RegExp (the PCRE2→JS compat below), and the demo/example surfaces it flags
// are the documented expected residuals, not bugs.
//
// Regex source: `signal.regex` is written for ripgrep's PCRE2 engine. V8's
// RegExp shares the constructs this file's entries use (lookaheads, the `\1`
// backreference) and needs no engine — the only divergence this file needs is
// that PCRE's string anchors `\A`/`\Z` mean the same thing the JS anchors
// `^`/`$` mean for a single-string input (a `\A` left un-rewritten would
// compile in V8 as a literal `A` and silently never fire — the
// form-page-missing-errorboundary absence check is exactly that shape).
//
// Usage:
//   node scripts/scan-adoption-quality.mjs [--root <dir>] [--signals <path>] [--targets <a,b>] [--json]
// Options:
//   --root <dir>      repo to scan (default: current working directory)
//   --signals <path>  signals file (default: <root>/docs/audit-signals.json)
//   --targets <a,b>   dirs relative to <root> to walk (default: src)
//   --json            emit the machine-readable report on stdout
// Exit: 0 on a completed scan (regardless of findings — radar, not gate);
//       2 on usage or config errors (unresolvable signals file, unparseable JSON).

import { readFileSync, readdirSync } from 'node:fs';
import { join, matchesGlob, relative, resolve } from 'node:path';

function fail(message) {
  console.error(`scan:adoption-quality — ${message}`);
  process.exit(2);
}

// --- args -----------------------------------------------------------------
const args = process.argv.slice(2);
let jsonMode = false;
let root = process.cwd();
let signalsPath = null;
let targets = ['src'];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--json') jsonMode = true;
  else if (a === '--root') root = resolve(args[++i] ?? '');
  else if (a === '--signals') signalsPath = resolve(args[++i] ?? '');
  else if (a === '--targets') targets = (args[++i] ?? '').split(',').map((t) => t.trim()).filter(Boolean);
  else fail(`unknown argument "${a}"`);
}
if (targets.length === 0) fail('--targets requires at least one directory');

const rootResolved = resolve(root);
if (!signalsPath) signalsPath = join(rootResolved, 'docs', 'audit-signals.json');

// --- signals ----------------------------------------------------------------
let signalsDoc;
try {
  signalsDoc = JSON.parse(readFileSync(signalsPath, 'utf8'));
} catch (err) {
  fail(`cannot read signals file ${signalsPath}: ${err.message}`);
}
const signals = signalsDoc.adoptionQuality;
if (!Array.isArray(signals) || signals.length === 0) {
  fail(`${signalsPath} carries no adoptionQuality array — nothing to measure`);
}

// The header's globs (e.g. *.tsx, *.ts) select which file names to walk; the
// exclude list (node_modules, .test., dist, …) is matched per path segment.
const fileSuffixes = (signalsDoc.globs?.length
  ? signalsDoc.globs
  : ['*.tsx', '*.ts']
).map((g) => g.replace(/^\*+/, ''));
const excludes = signalsDoc.exclude ?? [];
const excludeGlobs = excludes.filter((e) => e.includes('*'));
const excludeNames = excludes.filter((e) => !e.includes('*'));

// Same minimal glob semantics as scripts/lint-design.mjs: wildcard-bearing
// excludes are matched by stdlib `path.matchesGlob` (Node >= 22) — `**` spans
// whole segments, a `*` matches within one; a `.` in a glob is a literal.

function isExcluded(relPath) {
  const segments = relPath.split(/[\\/]/);
  // A bare name (`dist`, `node_modules`) matches a segment exactly; a
  // dot-bracketed fragment (`.test.`) matches inside a segment, the way the
  // header's exclude is read when running the entry by hand. Dot-only names
  // (`.next`) never reach here — the walk skips dot-directories outright.
  if (excludeNames.some((name) => segments.some((seg) => seg === name || (name.includes('.') && seg.includes(name)))))
    return true;
  return excludeGlobs.some((glob) => matchesGlob(relPath, glob));
}

// --- walk --------------------------------------------------------------------
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
    else if (fileSuffixes.some((s) => e.name.endsWith(s))) {
      const rel = relative(rootResolved, p).split(/[\\/]/).join('/');
      if (!isExcluded(rel)) acc.push({ rel, abs: p });
    }
  }
  return acc;
}

const files = targets.flatMap((t) => walk(join(rootResolved, t), [])).sort((a, b) => a.rel.localeCompare(b.rel));

// --- PCRE2 → V8 compatibility ------------------------------------------------
// Rewrites PCRE string anchors to their V8 equivalents. `\A`/`\Z` occur OUTSIDE
// character classes in audit-signals.json (a `\A` inside a class would be
// rejected by PCRE2 itself, so the naive rewrite cannot misfire on this file);
// every other PCRE construct the entries use (lookaheads, tempered windows, the
// `\1` backreference) is native to V8's RegExp.
function pcreToJs(source) {
  return source.replace(/\\A/g, '^').replace(/\\Z/g, '$');
}

const compiled = signals.map((signal) => {
  let gateRe;
  let re;
  let error = null;
  try {
    gateRe = new RegExp(signal.coOccursWith ?? '');
    re = new RegExp(pcreToJs(signal.regex), 'g');
  } catch (err) {
    error = `${signal.id}: ${err.message}`;
  }
  return { signal, gateRe, re, error };
});

// --- scan ---------------------------------------------------------------------
// Per file: each signal whose gate (coOccursWith) matches the whole file content
// is tested with its regex; the FIRST match's line is recorded. A signal may
// hit a file at most once — the unit of counting is a candidate surface (a
// file), not a match, so a page with three hand-rolled columns is one
// kanban-handrolled-columns candidate, the same way the rg -l fleet runs count
// files, not lines.
const results = compiled.map((c) => ({ ...c, hits: [] }));

for (const { rel, abs } of files) {
  const src = readFileSync(abs, 'utf8');
  for (const r of results) {
    if (r.error) continue; // carried through uncompiled; not a scan failure
    if (!r.gateRe.test(src)) continue; // does not adopt the gated archetype
    const m = r.re.exec(src); // single exec: the first (and only counted) match
    if (m) {
      r.hits.push({ file: rel, line: src.slice(0, m.index).split('\n').length });
    }
  }
}

const entries = results.map((r) => ({
  id: r.signal.id,
  tier: r.signal.tier,
  coOccursWith: r.signal.coOccursWith,
  ...(r.error ? { error: r.error } : {}),
  hits: r.hits,
  hitCount: r.hits.length,
}));

const summary = {
  files: files.length,
  signals: entries.length,
  uncompiled: results.filter((r) => r.error).length,
  signalsWithHits: entries.filter((e) => e.hitCount > 0).length,
  totalHits: entries.reduce((n, e) => n + e.hitCount, 0),
  redHits: entries.reduce((n, e) => n + (e.tier === 'red' ? e.hitCount : 0), 0),
  yellowHits: entries.reduce((n, e) => n + (e.tier === 'yellow' ? e.hitCount : 0), 0),
};

if (jsonMode) {
  const report = {
    artifact: 'adoption-quality-scan',
    note: 'Discovery radar, not a gate — every entry is a candidate, never a verdict; the LLM acceptance-gate pass decides (docs/ADOPTION-QUALITY.md). Exit 0 regardless of findings.',
    root: rootResolved,
    signalsSource: relative(rootResolved, signalsPath) || signalsPath,
    scannedAt: new Date().toISOString(),
    config: { targets, excludes, globs: fileSuffixes },
    summary,
    signals: entries,
  };
  process.stdout.write(JSON.stringify(report) + '\n');
} else {
  console.log(
    `scan:adoption-quality — ${rootResolved}: ${summary.files} file(s) scanned, ${summary.signals} signal(s), ${summary.signalsWithHits} with ${summary.totalHits} hit(s)` +
      (summary.uncompiled ? `, ${summary.uncompiled} UNCOMPILED (PCRE construct V8 rejects): ${results.filter((r) => r.error).map((r) => r.error).join('; ')}` : ''),
  );
  for (const e of entries) {
    if (e.error) {
      console.log(`  ??     ${e.id.padEnd(40)}  (skipped — ${e.error})`);
      continue;
    }
    const filesList = e.hits.slice(0, 5).map((h) => `${h.file}:${h.line}`).join(', ') + (e.hitCount > 5 ? ' …' : '');
    console.log(`  ${e.tier.padEnd(6)} ${e.id.padEnd(40)}  ${String(e.hitCount).padEnd(3)} ${filesList}`);
  }
}

// Radar, not gate: a completed scan is a clean hand-off to whoever reads the
// counts (the dashboard hub, a CI job, the acceptance-gate walk). Findings —
// red or yellow — change nothing here.
process.exit(0);
