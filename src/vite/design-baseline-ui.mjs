/**
 * Vite wiring for the project-first `ui/` and `layout/` arrays (PACKAGE.md wiring line 2) and
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
 * The package location is derived from this file's OWN location
 * (`import.meta.url`), never from `<root>/node_modules/design-baseline`: the
 * helper ships inside the package (`src/vite/`), so its own path *is* the
 * installed package's path under every layout — flat npm, hoisted workspaces
 * (the package lives in the workspace root's `node_modules`, not the
 * package's own), pnpm (the real dir is under `.pnpm/`), and symlink installs
 * (Node resolves ESM imports to realpath, so the derived path cannot diverge
 * from the package's own internal relative resolution — which is what a
 * divergent two-copy of a context-carrying leaf would be).
 *
 * Provenance: ported from the brickshop-manager cutover
 * (`scripts/lib/design-baseline-ui.ts`, branch
 * `feat/design-baseline-package-cutover`, 2026-09-25) — the first measured
 * greenfield `vite dev` run under this package.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXTS = ['.tsx', '.ts', '/index.tsx', '/index.ts'];

/** The installed package's `src/components` dir, from this file's location. */
const PACKAGE_COMPONENTS_DIR = fileURLToPath(new URL('../components', import.meta.url));

/**
 * Project-first resolver for `@/components/<kind>/*`: a consumer copy under
 * `src/components/<kind>/` wins, anything else resolves to the installed
 * package's copy; `null` for every other id.
 */
function projectFirst(root, kind) {
  const dirs = [
    path.join(root, 'src/components', kind),
    path.join(PACKAGE_COMPONENTS_DIR, kind),
  ];
  const re = new RegExp(`^@/components/${kind}/([^?]+)(\\?.*)?$`);
  return {
    name: `design-baseline-${kind}`,
    enforce: 'pre',
    resolveId(id) {
      const m = re.exec(id);
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
 * Project-first resolver for `@/components/ui/*` (PACKAGE.md wiring line 2).
 * A consumer copy under `src/components/ui/` wins (how a kept fork or a
 * consumer-only file shadows the package); anything else resolves to the
 * installed package's copy. Returns `null` for every other id, so coexists
 * with the consumer's normal `@` alias, which must be written so it does NOT
 * match `@/components/ui/` (it runs before every plugin, including this one).
 *
 * @param {string} root the consumer's project root (its `import.meta.dirname`
 *   / `process.cwd()`).
 */
export function designBaselineUi(root) {
  return projectFirst(root, 'ui');
}

/**
 * The same project-first resolver for `@/components/layout/*` — the layout
 * half of the tsconfig `paths` array. Opt-in: only a consumer whose `@` alias
 * also carves out `@/components/layout/` needs it (an alias that matches it
 * resolves first and this plugin never sees the id).
 *
 * @param {string} root the consumer's project root.
 */
export function designBaselineLayout(root) {
  return projectFirst(root, 'layout');
}

/**
 * The package's runtime deps, for `optimizeDeps.include`, in the nested
 * `<package> > <dep>` form — the bare-name form breaks under pnpm's strict
 * layout, where a dep is not resolvable from the consumer's own
 * `node_modules`. The package is excluded from pre-bundling (it is source —
 * pre-bundling an archetype entry would inline a second copy of the package's
 * `ui/` leaves, duplicate React contexts), so Vite never crawls it and would
 * serve its Radix/cmdk/day-picker imports un-bundled — their CJS
 * `react/jsx-runtime` import then breaks every page in dev. Read from the
 * installed `package.json` (via this file's own location) so a tag bump that
 * adds a dep needs no edit. `tw-animate-css` is CSS-only and must not be
 * pre-bundled as a JS dep.
 *
 * @returns {string[]}
 */
export function designBaselineDeps() {
  const manifest = JSON.parse(
    fs.readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8')
  );
  return Object.keys(manifest.dependencies ?? {})
    .filter((d) => d !== 'tw-animate-css')
    .map((d) => `${manifest.name} > ${d}`);
}
