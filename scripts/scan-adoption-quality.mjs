#!/usr/bin/env node
// Axis-C (adoptionQuality) discovery radar — the machine half of the
// "deterministic tripwires → LLM acceptance gate" split documented in
// docs/ADOPTION-QUALITY.md and docs/STYLE.md ("The fleet audit rubric").
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
// calls THIS script; forking either half is the drift the fleet audit "never
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
// Brand tokens (ADR-0007): the `brandTokens` array is measured against every
// `tokens.css` under the targets — a brand file still declaring a role the
// donor layer fixes (`--ring`, `--chart-*`, any `--db-*`, …), or a dark
// `--primary` off the light hue. Same radar semantics, reported under its own
// `brandTokens` key so the `signals` array stays one entry per adoptionQuality id.
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
//
// Shape (ADR-0003, matching scripts/lint-design.mjs): the config validation,
// exclude classification, PCRE compat, signal compilation, per-file scan and
// summary are pure exported functions; only `main()` touches argv, the
// filesystem, stdout and the exit code, and it runs only when the file is the
// entry point — importing it scans nothing. Config errors throw `ConfigError`,
// which `main()` turns into exit 2.

import { existsSync, globSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, matchesGlob, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// A usage or config error. Carries the bare diagnostic; `main()` prefixes it,
// prints it to stderr and exits 2 — thrown instead of exiting so the parsing
// and validation stay pure.
class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}

// --- args -----------------------------------------------------------------
function parseArgs(args, cwd) {
  let jsonMode = false;
  let root = cwd;
  let signalsPath = null;
  let targets = ['src'];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--json') jsonMode = true;
    else if (a === '--root') root = resolve(args[++i] ?? '');
    else if (a === '--signals') signalsPath = resolve(args[++i] ?? '');
    else if (a === '--targets') targets = (args[++i] ?? '').split(',').map((t) => t.trim()).filter(Boolean);
    else throw new ConfigError(`unknown argument "${a}"`);
  }
  if (targets.length === 0) throw new ConfigError('--targets requires at least one directory');
  const rootResolved = resolve(root);
  return { jsonMode, rootResolved, signalsPath: signalsPath ?? join(rootResolved, 'docs', 'audit-signals.json'), targets };
}

// --- excludes -----------------------------------------------------------------
// The header's globs (e.g. *.tsx, *.ts) select which file names to walk; the
// exclude list (node_modules, .test., dist, …) is matched per path segment.
//
// Same minimal glob semantics as scripts/lint-design.mjs: wildcard-bearing
// excludes are matched by stdlib `path.matchesGlob` (Node >= 22) — `**` spans
// whole segments, a `*` matches within one; a `.` in a glob is a literal.
//
// The post-walk `isExcluded` check stays even though the dir descent is now
// `fs.globSync`'s: a bare-segment name like `dist` or `node_modules` translates
// to the dir exclusion `**/<name>/**`, but a name fragment like `.test.` or
// `.spec.` sits in FILE names, not directory segments — no dir exclude covers
// it, so the per-path filter remains the owner of those entries (and of any
// entry in the header whose convention is a fragment rather than a segment).
function classifyExcludes(excludes) {
  return {
    names: excludes.filter((e) => !e.includes('*')),
    globs: excludes.filter((e) => e.includes('*')),
  };
}

function isExcluded(relPath, { names, globs }) {
  const segments = relPath.split(/[\\/]/);
  // A bare name (`dist`, `node_modules`) matches a segment exactly; a
  // dot-bracketed fragment (`.test.`) matches inside a segment, the way the
  // header's exclude is read when running the entry by hand. Dot-only names
  // (`.next`) never reach here — the walk skips dot-directories outright.
  if (names.some((name) => segments.some((seg) => seg === name || (name.includes('.') && seg.includes(name)))))
    return true;
  return globs.some((glob) => matchesGlob(relPath, glob));
}

// --- PCRE2 → V8 compatibility ------------------------------------------------
// Rewrites PCRE string anchors to their V8 equivalents. `\A`/`\Z` occur OUTSIDE
// character classes in audit-signals.json (a `\A` inside a class would be
// rejected by PCRE2 itself, so the naive rewrite cannot misfire on this file);
// every other PCRE construct the entries use (lookaheads, tempered windows, the
// `\1` backreference) is native to V8's RegExp.
function pcreToJs(source) {
  return source.replace(/\\A/g, '^').replace(/\\Z/g, '$');
}

// A signal that fails to compile carries `error` and is skipped by the scan —
// reported as uncompiled, never a scan failure.
function compileSignals(signals) {
  return signals.map((signal) => {
    let gateRe;
    let re;
    let error = null;
    try {
      gateRe = new RegExp(signal.coOccursWith ?? '');
      // Not `g`: a global RegExp carries lastIndex from one file's hit into the
      // next file's exec, which then starts mid-file and can miss.
      re = new RegExp(pcreToJs(signal.regex));
    } catch (err) {
      error = `${signal.id}: ${err.message}`;
    }
    return { signal, gateRe, re, error };
  });
}

const lineOf = (src, index) => src.slice(0, index).split('\n').length;

// --- scan ---------------------------------------------------------------------
// Per file: each signal whose gate (coOccursWith) matches the whole file content
// is tested with its regex; the FIRST match's line is recorded. A signal may
// hit a file at most once — the unit of counting is a candidate surface (a
// file), not a match, so a page with three hand-rolled columns is one
// kanban-handrolled-columns candidate, the same way the rg -l fleet runs count
// files, not lines. Returns one entry per compiled signal, in order: the hit
// `{ file, line }`, or null.
function scanSource(rel, src, compiled) {
  return compiled.map((c) => {
    if (c.error) return null; // carried through uncompiled; not a scan failure
    if (!c.gateRe.test(src)) return null; // does not adopt the gated archetype
    const m = c.re.exec(src); // single exec: the first (and only counted) match
    return m ? { file: rel, line: lineOf(src, m.index) } : null;
  });
}

// --- brand tokens (ADR-0007) --------------------------------------------------
// The `brandTokens` entries run against every `tokens.css` (the project-owned
// brand file; the donor-owned `tokens.layer.css` never matches the name). A
// `regex` entry runs multiline over the file; a `check` entry is one of the
// named computations below — hue math a regex cannot do. A signals file without
// the array (an older vendored snapshot) measures nothing here.

// `--primary: H S% L%` triplets in file order — the first is the light
// (`:root`) value, the second the `.dark` one. The lookbehind keeps
// `--sidebar-primary` out; `\s*:` keeps `--primary-foreground` out.
const PRIMARY_RE = /(?<![\w-])--primary\s*:\s*(-?[\d.]+)(?:deg)?\s+([\d.]+)%\s+([\d.]+)%/g;
const BRAND_CHECKS = {
  'dark-primary-hue'(src, { maxHueDelta = 10, minSaturation = 30 }) {
    const [light, dark] = [...src.matchAll(PRIMARY_RE)];
    if (!light || !dark) return null; // no dark override: nothing to compare
    const delta = Math.abs(Number(light[1]) - Number(dark[1])) % 360;
    const hueOff = Math.min(delta, 360 - delta) > maxHueDelta;
    return hueOff || Number(dark[2]) < minSaturation ? dark.index : null;
  },
};

// Each brand signal becomes `{ signal, test, error }`, where `test(src)` returns
// the hit's index or null.
function compileBrandSignals(brandSignals) {
  return brandSignals.map((signal) => {
    let test = null;
    let error = null;
    if (signal.check) {
      const fn = BRAND_CHECKS[signal.check];
      if (fn) test = (src) => fn(src, signal);
      else error = `${signal.id}: unknown check "${signal.check}"`;
    } else {
      try {
        const re = new RegExp(pcreToJs(signal.regex), 'm');
        test = (src) => src.match(re)?.index ?? null;
      } catch (err) {
        error = `${signal.id}: ${err.message}`;
      }
    }
    return { signal, test, error };
  });
}

// --- shadowed baseline files ----------------------------------------------------
// A consumer resolves baseline components through a tsconfig `paths` fallback
// (`"@/components/ui/*": ["./src/components/ui/*", "./node_modules/design-baseline/src/components/ui/*"]`);
// a local file with the baseline's name wins silently, so the consumer keeps an
// old copy while the package moves on. Not a per-file regex: it needs the
// tsconfig and the installed package, so it is its own pass. Two hit kinds —
// `same-name` (a local file under the aliased local dir whose basename the
// baseline ships in the aliased dir) and `adopted-header` (any scanned file
// whose head says "Adopted from design-baseline", wherever it lives). Both
// require at least one `paths` fallback into the baseline. A candidate, never a verdict.
const BASELINE_SRC = 'node_modules/design-baseline/src/';
const ADOPTED_HEADER_RE = /Adopted from design-baseline/;
const SOURCE_FILE_RE = /\.[cm]?[jt]sx?$/;

// Drops `//` and `/* */` comments and trailing commas, skipping "string" literals
// (the `/*` in a `paths` key like "@/components/ui/*" is not a comment).
const STRING_RE = '"(?:[^"\\\\]|\\\\.)*"';
const stripJsonc = (raw) =>
  raw
    .replace(new RegExp(`${STRING_RE}|//[^\\n]*|/\\*[\\s\\S]*?\\*/`, 'g'), (m) => (m[0] === '"' ? m : ''))
    .replace(new RegExp(`${STRING_RE}|,(\\s*[}\\]])`, 'g'), (m, tail) => (m[0] === '"' ? m : tail));

// Parses one config and follows relative `extends` (string or array; later wins) and
// `references`. Returns `{ baseUrl, paths: { key: { targets, dir } }, refs }`: `paths`
// merges key-wise with the nearer config winning, `baseUrl` is the nearest one resolved
// against the config declaring it, and `dir` is the declaring config's directory
// (TS resolves `paths` against it when no `baseUrl` is set). `refs` are the resolved
// project configs — each is its own compilation, so they are not merged in here.
function loadTsconfig(file, seen = new Set()) {
  const out = { baseUrl: null, paths: {}, refs: [] };
  if (seen.has(file) || !existsSync(file)) return out;
  seen.add(file);
  let cfg;
  try {
    cfg = JSON.parse(stripJsonc(readFileSync(file, 'utf8')));
  } catch {
    return out;
  }
  const dir = dirname(file);
  const find = (spec, relOnly, ...exts) => {
    if (typeof spec !== 'string') return null;
    if (relOnly && !/^\.\.?[\\/]/.test(spec)) return null; // package `extends` live in node_modules: skipped; reference paths need no `./`
    return [spec, ...exts.map((e) => join(spec, e)), `${spec}.json`].map((c) => resolve(dir, c)).find((c) => existsSync(c) && !isDir(c));
  };
  for (const spec of [].concat(cfg.extends ?? [])) {
    const base = find(spec, true);
    if (!base) continue;
    const parent = loadTsconfig(base, new Set(seen)); // per-chain cycle guard: siblings may share a base
    out.baseUrl = parent.baseUrl ?? out.baseUrl;
    Object.assign(out.paths, parent.paths);
  }
  const opts = cfg.compilerOptions ?? {};
  if (opts.baseUrl != null) out.baseUrl = resolve(dir, opts.baseUrl);
  if (opts.paths) { // a child's `paths` replaces the parent's wholesale (TS semantics)
    out.paths = {};
    for (const [key, targets] of Object.entries(opts.paths)) out.paths[key] = { targets, dir };
  }
  for (const ref of cfg.references ?? []) {
    const refFile = find(ref?.path, false, 'tsconfig.json');
    if (refFile) out.refs.push(refFile);
  }
  return out;
}

const isDir = (p) => statSync(p).isDirectory();

// `[{ targets, base }]` over the root config and every referenced project config;
// null when there is no `<root>/tsconfig.json`.
function readTsconfigPaths(root) {
  const file = join(root, 'tsconfig.json');
  if (!existsSync(file)) return null;
  const seen = new Set(); // visited reference projects only
  const entries = [];
  const visit = (f) => {
    if (seen.has(f)) return;
    seen.add(f);
    const cfg = loadTsconfig(f);
    for (const { targets, dir } of Object.values(cfg.paths)) entries.push({ targets, base: cfg.baseUrl ?? dir });
    cfg.refs.forEach(visit);
  };
  visit(file);
  return entries;
}

const listSources = (dir) =>
  existsSync(dir) ? readdirSync(dir, { recursive: true }).filter((f) => SOURCE_FILE_RE.test(f)).map(String) : [];

// `files` are the already-walked `{ rel, abs }` sources. Returns `[{ file, line, kind }]`.
function scanShadowedBaseline(root, files, excludes = classifyExcludes([])) {
  const tsconfig = readTsconfigPaths(root);
  if (!tsconfig) return [];
  const hits = new Map();
  let hasFallback = false;
  for (const { targets, base } of tsconfig) {
    const baseline = targets.find((t) => t.includes(BASELINE_SRC));
    if (!baseline || !targets.every((t) => t.endsWith('*'))) continue; // exact-match entries name a file, not a dir
    hasFallback = true;
    const dirOf = (t) => resolve(base, t.replace(/\/?\*$/, ''));
    // Subpath minus extension: `button.ts` shadows `button.tsx`, `forms/button.tsx` shadows nothing.
    const noExt = (f) => f.replace(SOURCE_FILE_RE, '');
    const shipped = new Set(listSources(dirOf(baseline)).map(noExt));
    for (const local of targets.slice(0, targets.indexOf(baseline))) { // only targets ahead of the baseline win resolution
      const localDir = dirOf(local);
      for (const f of listSources(localDir)) {
        if (!shipped.has(noExt(f))) continue;
        const file = relative(root, join(localDir, f)).split(/[\\/]/).join('/');
        if (isExcluded(file, excludes)) continue;
        hits.set(file, { file, line: 1, kind: 'same-name' });
      }
    }
  }
  if (!hasFallback) return [];
  for (const { rel, abs } of files) {
    const head = readFileSync(abs, 'utf8').split('\n').slice(0, 20).join('\n');
    const m = ADOPTED_HEADER_RE.exec(head);
    if (m) hits.set(rel, { file: rel, line: lineOf(head, m.index), kind: 'adopted-header' });
  }
  return [...hits.values()].sort((a, b) => a.file.localeCompare(b.file));
}

// --- summary ------------------------------------------------------------------
// `entries` / `brandResults` are the report's `signals` / `brandTokens` arrays;
// the counts are the walked file totals.
function summarize({ entries, brandResults, shadowedHits = [], files, brandFiles }) {
  return {
    files,
    signals: entries.length,
    uncompiled: entries.filter((e) => e.error).length,
    signalsWithHits: entries.filter((e) => e.hitCount > 0).length,
    totalHits: entries.reduce((n, e) => n + e.hitCount, 0),
    redHits: entries.reduce((n, e) => n + (e.tier === 'red' ? e.hitCount : 0), 0),
    yellowHits: entries.reduce((n, e) => n + (e.tier === 'yellow' ? e.hitCount : 0), 0),
    brandTokenFiles: brandFiles,
    brandTokenHits: brandResults.reduce((n, e) => n + e.hitCount, 0),
    shadowedBaselineHits: shadowedHits.length,
  };
}

function loadSignals(signalsPath) {
  let signalsDoc;
  try {
    signalsDoc = JSON.parse(readFileSync(signalsPath, 'utf8'));
  } catch (err) {
    throw new ConfigError(`cannot read signals file ${signalsPath}: ${err.message}`);
  }
  if (!Array.isArray(signalsDoc.adoptionQuality) || signalsDoc.adoptionQuality.length === 0) {
    throw new ConfigError(`${signalsPath} carries no adoptionQuality array — nothing to measure`);
  }
  return signalsDoc;
}

function main() {
  let opts;
  let signalsDoc;
  try {
    opts = parseArgs(process.argv.slice(2), process.cwd());
    signalsDoc = loadSignals(opts.signalsPath);
  } catch (err) {
    if (!(err instanceof ConfigError)) throw err;
    console.error(`scan:adoption-quality — ${err.message}`);
    process.exit(2);
  }
  const { jsonMode, rootResolved, signalsPath, targets } = opts;

  const fileSuffixes = (signalsDoc.globs?.length
    ? signalsDoc.globs
    : ['*.tsx', '*.ts']
  ).map((g) => g.replace(/^\*+/, ''));
  const excludes = signalsDoc.exclude ?? [];
  const classified = classifyExcludes(excludes);

  // --- walk ------------------------------------------------------------------
  // One globSync per target. The header globs select the file names (each is
  // descended from the target root, so `**` prefixes every one); the excludes
  // carry dot-directories plus every header entry that names a whole directory
  // segment. A target naming a missing dir yields [] rather than throwing
  // (globSync skips non-matching patterns), so a consumer missing any target
  // root is skipped silently — the contract `walk`'s `catch` provided. Dotfiles
  // are still pruned: the `**/.*/**` exclude mirrors the walk's dot-skip (glob
  // patterns match hidden files by default), so a `.next`/`.git` build tree is
  // never descended.
  const WALK_EXCLUDES = ['**/.*/**', ...classified.names.map((n) => `**/${n}/**`)];
  const walk = (patterns) =>
    targets
      .flatMap((t) =>
        globSync(patterns, { cwd: join(rootResolved, t), exclude: WALK_EXCLUDES }).map((rel) => ({
          rel: join(t, rel).split(/[\\/]/).join('/'),
          abs: join(rootResolved, t, rel),
        })),
      )
      .filter(({ rel }) => !isExcluded(rel, classified))
      .sort((a, b) => a.rel.localeCompare(b.rel));

  const files = walk(fileSuffixes.map((s) => `**/*${s}`));
  const compiled = compileSignals(signalsDoc.adoptionQuality);
  const results = compiled.map((c) => ({ ...c, hits: [] }));
  for (const { rel, abs } of files) {
    scanSource(rel, readFileSync(abs, 'utf8'), compiled).forEach((hit, i) => {
      if (hit) results[i].hits.push(hit);
    });
  }

  const brandFiles = walk('**/tokens.css');
  const brandResults = compileBrandSignals(signalsDoc.brandTokens ?? []).map(({ signal, test, error }) => {
    const hits = [];
    if (test) {
      for (const { rel, abs } of brandFiles) {
        const src = readFileSync(abs, 'utf8');
        const index = test(src);
        if (index !== null) hits.push({ file: rel, line: lineOf(src, index) });
      }
    }
    return { id: signal.id, tier: signal.tier, ...(error ? { error } : {}), hits, hitCount: hits.length };
  });

  const entries = results.map((r) => ({
    id: r.signal.id,
    tier: r.signal.tier,
    coOccursWith: r.signal.coOccursWith,
    ...(r.error ? { error: r.error } : {}),
    hits: r.hits,
    hitCount: r.hits.length,
  }));

  const shadowedSignal = signalsDoc.shadowedBaseline ?? { id: 'shadowed-baseline-file', tier: 'yellow' };
  const shadowedHits = scanShadowedBaseline(rootResolved, files, classified);
  const shadowed = { id: shadowedSignal.id, tier: shadowedSignal.tier, hits: shadowedHits, hitCount: shadowedHits.length };

  const summary = summarize({ entries, brandResults, shadowedHits, files: files.length, brandFiles: brandFiles.length });

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
      brandTokens: brandResults,
      shadowedBaseline: shadowed,
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
    if (brandResults.length) {
      console.log(`  brand tokens — ${summary.brandTokenFiles} tokens.css file(s), ${summary.brandTokenHits} hit(s)`);
      for (const e of brandResults) {
        if (e.error) {
          console.log(`  ??     ${e.id.padEnd(40)}  (skipped — ${e.error})`);
          continue;
        }
        console.log(`  ${e.tier.padEnd(6)} ${e.id.padEnd(40)}  ${String(e.hitCount).padEnd(3)} ${e.hits.map((h) => `${h.file}:${h.line}`).join(', ')}`);
      }
    }
  }

  if (!jsonMode) {
    console.log(`  ${shadowed.tier.padEnd(6)} ${shadowed.id.padEnd(40)}  ${String(shadowed.hitCount).padEnd(3)} ${shadowedHits.map((h) => `${h.file}:${h.line}`).join(', ')}`);
  }

  // Radar, not gate: a completed scan is a clean hand-off to whoever reads the
  // counts (the dashboard hub, a CI job, the acceptance-gate walk). Findings —
  // red or yellow — change nothing here.
  process.exit(0);
}

// Node resolves the main module (import.meta.url) to its realpath, so a
// symlinked invocation must resolve process.argv[1] the same way or this
// guard silently never fires (ADR-0005 consumers vendor the runner via a
// symlink).
if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
  main();
}

export { parseArgs, classifyExcludes, isExcluded, pcreToJs, compileSignals, scanSource, scanShadowedBaseline, compileBrandSignals, summarize, ConfigError };
