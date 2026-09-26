/**
 * Vite wiring for the project-first `ui/` array (PACKAGE.md wiring line 2) and
 * the package's `optimizeDeps` include list — the dev-server half of the Vite
 * consumer setup that tsconfig `paths` cannot express.
 *
 * Ships as plain `.mjs` (Node ESM), not `.ts` source: a Vite 8 consumer loads
 * `vite.config.ts` through Node's native config loader, which imports this
 * module straight out of `node_modules` — and Node refuses to strip types of
 * any file under `node_modules` (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`).
 * It is Node tooling (it lives in the consumer's `vite.config.ts`), never part
 * of the consumer's browser module graph, so it does not ride the package's
 * "ships React source" rule. No `"use client"` either: that invariant covers
 * React source consumed from the app build, not Node config tooling.
 *
 * Provenance: ported from the brickshop-manager cutover
 * (`scripts/lib/design-baseline-ui.ts`, branch
 * `feat/design-baseline-package-cutover`, 2026-09-25) — the first measured
 * greenfield `vite dev` run under this package.
 */
import fs from 'node:fs';
import path from 'node:path';

const EXTS = ['.tsx', '.ts', '/index.tsx', '/index.ts'];

/**
 * Project-first resolver for `@/components/ui/*` (PACKAGE.md wiring line 2).
 * A consumer copy under `src/components/ui/` wins (how a kept fork or a
 * consumer-only file shadows the package); anything else resolves to the
 * installed package's copy. Returns `null` for every other id, so coexists
 * with the consumer's normal `@` alias, which must be written so it does NOT
 * match `@/components/ui/` (it runs before every plugin, including this one).
 *
 * @param {string} root the consumer's project root (its `__dirname` / `process.cwd()`).
 */
export function designBaselineUi(root) {
  const dirs = [
    path.join(root, 'src/components/ui'),
    path.join(root, 'node_modules/design-baseline/src/components/ui'),
  ];
  return {
    name: 'design-baseline-ui',
    enforce: 'pre',
    resolveId(id) {
      const m = /^@\/components\/ui\/([^?]+)(\?.*)?$/.exec(id);
      if (!m) return null;
      const [, rel, query = ''] = m;
      for (const dir of dirs) {
        // Bare path first, so an id that already names its extension resolves.
        for (const ext of ['', ...EXTS]) {
          const file = path.join(dir, rel + ext);
          if (fs.existsSync(file) && fs.statSync(file).isFile()) return file + query;
        }
      }
      return null;
    },
  };
}

/**
 * The package's runtime deps, for `optimizeDeps.include`. The package is
 * excluded from pre-bundling (it is source — pre-bundling an archetype entry
 * would inline a second copy of the package's `ui/` leaves, duplicate React
 * contexts), so Vite never crawls it and would serve its Radix/cmdk/day-picker
 * imports un-bundled — their CJS `react/jsx-runtime` import then breaks every
 * page in dev. Read from the installed `package.json` so a tag bump that adds
 * a dep needs no edit. `tw-animate-css` is CSS-only and must not be
 * pre-bundled as a JS dep.
 *
 * @param {string} root the consumer's project root.
 * @returns {string[]}
 */
export function designBaselineDeps(root) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, 'node_modules/design-baseline/package.json'), 'utf8')
  );
  return Object.keys(manifest.dependencies ?? {}).filter((d) => d !== 'tw-animate-css');
}
