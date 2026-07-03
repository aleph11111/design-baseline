#!/usr/bin/env node
// design-sync: build a conventional package layout for the converter's happy path.
//
// This repo is a typecheck-only source tree (no dist, no .d.ts). The converter
// wants a built package: a bundleable entry + a real .d.ts tree, with src/ for
// JSDoc/grouping enrichment. We assemble that into .design-sync/.cache/pkg/,
// SELF-CONTAINED so the converter's PKG_DIR-relative config paths resolve:
//   - barrel.ts        : bundle entry — `export *` so EVERY export (incl. shadcn
//                        subparts) lands on window.DesignBaseline for the agent.
//   - types/**         : real .d.ts (tsc emit + tsc-alias rewrites @/ → relative)
//   - types/index.d.ts : the barrel .d.ts the converter reads for the CARDED set —
//                        PRIMARIES only (within-module subparts pruned), so the
//                        DS pane isn't 225 cards of mostly compound subparts.
//                        Subparts stay importable via the bundle namespace.
//   - tsconfig.json    : baseUrl=., paths @/*→src/* so esbuild resolves @/ here
//   - styles.css       : compiled Tailwind (copied in by cfg.buildCmd after this)
//   - package.json     : name/version/types/module → PKG_DIR + findTypesRoot land here
//   - src -> ../../../src symlink : source-kit enrichment (group, JSDoc)
//
// Deterministic + reproducible: this is (part of) cfg.buildCmd, re-run every sync.

import {
  mkdirSync, rmSync, writeFileSync, readdirSync, existsSync, symlinkSync, cpSync,
} from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));           // repo root
const SRC = join(REPO, 'src');
const CACHE = join(REPO, '.design-sync', '.cache');
const PKG = join(CACHE, 'pkg');
const TYPES = join(PKG, 'types');
const TSALIAS = join(REPO, '.ds-sync', 'node_modules', '.bin', 'tsc-alias');
// ts-morph lives in the isolated converter deps, not repo node_modules.
const require = createRequire(join(REPO, '.ds-sync', 'package.json'));
const { Project, Node } = require('ts-morph');

// ── 0. the barrel modules (bundle + list share these) ──────────────────────
// ui: each primitive .tsx. layout + each archetype: a curated index barrel.
const uiFiles = readdirSync(join(SRC, 'components/ui'))
  .filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, '')).sort();
const archetypeDirs = readdirSync(join(SRC, 'components/archetypes'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(SRC, 'components/archetypes', d.name, 'index.ts')))
  .map((d) => d.name).sort();

// { rel: re-export specifier (./-form), srcFile: module to read exports from }
const modules = [
  ...uiFiles.map((n) => ({ rel: `./components/ui/${n}`, srcFile: join(SRC, `components/ui/${n}.tsx`) })),
  { rel: './components/layout', srcFile: join(SRC, 'components/layout/index.ts') },
  ...archetypeDirs.map((n) => ({
    rel: `./components/archetypes/${n}`,
    srcFile: join(SRC, `components/archetypes/${n}/index.ts`),
  })),
];

// ── 1. reset scratch pkg ────────────────────────────────────────────────────
rmSync(PKG, { recursive: true, force: true });
mkdirSync(TYPES, { recursive: true });

// ── 2. carded PRIMARY set (per module: PascalCase value exports, minus the
//      within-module subparts whose name is prefixed by another export) ──────
// Not a component: *Props/*Context, ALLCAPS constants, use* hooks.
const isComponentName = (n) =>
  /^[A-Z][A-Za-z0-9]*$/.test(n) && !n.endsWith('Props') && !/^[A-Z][A-Z0-9_]+$/.test(n) &&
  !/(?:Manager|Placements|Context|Provider)$/.test(n) && !/^use[A-Z]/.test(n);

const proj = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { jsx: 4 /* ReactJSX */, allowJs: true, skipLibCheck: true },
});
const seen = new Set();       // global dedupe: a name is carded from one module only
const byModule = [];          // [{ rel, names: [...] }]
for (const m of modules) {
  const sf = proj.addSourceFileAtPathIfExists(m.srcFile);
  if (!sf) { console.error(`[build-pkg] WARN missing module ${m.srcFile}`); continue; }
  const values = [];
  for (const [name, decls] of sf.getExportedDeclarations()) {
    if (!isComponentName(name)) continue;
    const isValue = decls.some((d) =>
      Node.isVariableDeclaration(d) || Node.isFunctionDeclaration(d) || Node.isClassDeclaration(d));
    if (isValue) values.push(name);
  }
  // Prune subparts: drop a name if another (shorter) export name in THIS module
  // is a strict prefix of it (Card←CardHeader, Dialog←DialogContent, StatTile←StatTileRow).
  const primaries = values.filter(
    (n) => !values.some((o) => o !== n && o.length < n.length && n.startsWith(o)),
  );
  const kept = primaries.filter((n) => !seen.has(n));
  kept.forEach((n) => seen.add(n));
  if (kept.length) byModule.push({ rel: m.rel, names: kept.sort() });
}

// ── 3. barrel.ts — bundle entry. `export *` puts every export (incl. subparts)
//      on the global; the explicit primary re-exports AFTER it win over any
//      ambiguous star collision (e.g. Toaster exported by both sonner+toaster),
//      guaranteeing every carded primary resolves on window.DesignBaseline. ───
const atAlias = (rel) => JSON.stringify(rel.replace('./components', '@/components'));
writeFileSync(
  join(PKG, 'barrel.ts'),
  modules.map((m) => `export * from ${atAlias(m.rel)};`).join('\n') + '\n' +
    byModule.map((g) => `export { ${g.names.join(', ')} } from ${atAlias(g.rel)};`).join('\n') + '\n',
);

// ── 4. emit the real .d.ts tree with tsc, then rewrite @/ → relative ─────────
const buildTsconfig = join(CACHE, 'tsconfig.build.json');
writeFileSync(buildTsconfig, JSON.stringify({
  extends: join(REPO, 'tsconfig.json'),
  compilerOptions: {
    noEmit: false, declaration: true, emitDeclarationOnly: true,
    outDir: TYPES, rootDir: SRC, baseUrl: REPO, paths: { '@/*': ['src/*'] },
    noUnusedLocals: false, noUnusedParameters: false, skipLibCheck: true,
  },
  include: [join(SRC, '**/*.ts'), join(SRC, '**/*.tsx')],
  exclude: [join(SRC, 'examples/**'), join(REPO, 'node_modules')],
}, null, 2));

console.error('[build-pkg] tsc --emitDeclarationOnly …');
execFileSync('npx', ['tsc', '-p', buildTsconfig], { cwd: REPO, stdio: 'inherit' });
console.error('[build-pkg] tsc-alias (rewrite @/ → relative in .d.ts) …');
execFileSync(TSALIAS, ['-p', buildTsconfig], { cwd: REPO, stdio: 'inherit' });

// ── 5. types/index.d.ts — carded barrel: primaries only, grouped by module ───
writeFileSync(
  join(TYPES, 'index.d.ts'),
  byModule.map((g) => `export { ${g.names.join(', ')} } from ${JSON.stringify(g.rel)};`).join('\n') + '\n',
);

// ── 6. self-contained tsconfig for esbuild @/ resolution (via src symlink) ───
writeFileSync(
  join(PKG, 'tsconfig.json'),
  JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@/*': ['src/*'] }, jsx: 'react-jsx' } }, null, 2),
);

// ── 7. package.json + src symlink ────────────────────────────────────────────
const repoPkg = require(join(REPO, 'package.json'));
writeFileSync(
  join(PKG, 'package.json'),
  JSON.stringify(
    { name: 'design-baseline', version: repoPkg.version || '0.1.0', types: 'types/index.d.ts', module: 'barrel.ts' },
    null, 2,
  ),
);
symlinkSync(relative(PKG, SRC), join(PKG, 'src'));

// ── 8. ship the house-style fonts (bounded to PKG_DIR for cfg.extraFonts) ────
const fontsSrc = join(REPO, '.design-sync', 'fonts');
if (existsSync(join(fontsSrc, 'plex.css'))) cpSync(fontsSrc, join(PKG, 'fonts'), { recursive: true });
else console.error('[build-pkg] WARN .design-sync/fonts/plex.css missing — run fetch-fonts.mjs');

const total = byModule.reduce((n, g) => n + g.names.length, 0);
const dtsCount = readdirSync(TYPES, { recursive: true }).filter((f) => String(f).endsWith('.d.ts')).length;
console.error(`[build-pkg] done: ${total} carded primaries across ${byModule.length} modules, ${dtsCount} .d.ts → ${relative(REPO, PKG)}`);
