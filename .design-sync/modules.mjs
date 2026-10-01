// The barrel module list, derived from src/components. Shared by build-pkg.mjs (bundle
// barrel) and scripts/design-sync-entry.test.mjs (guards typecheck-entry.ts against drift).
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// ui: each primitive .tsx. layout + each archetype: a curated index barrel.
// Returns [{ rel: './components/...' re-export specifier, srcFile: module to read exports from }].
export function listModules(SRC) {
  const uiFiles = readdirSync(join(SRC, 'components/ui'))
    .filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, '')).sort();
  const archetypeDirs = readdirSync(join(SRC, 'components/archetypes'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(SRC, 'components/archetypes', d.name, 'index.ts')))
    .map((d) => d.name).sort();
  return [
    ...uiFiles.map((n) => ({ rel: `./components/ui/${n}`, srcFile: join(SRC, `components/ui/${n}.tsx`) })),
    { rel: './components/layout', srcFile: join(SRC, 'components/layout/index.ts') },
    ...archetypeDirs.map((n) => ({
      rel: `./components/archetypes/${n}`,
      srcFile: join(SRC, `components/archetypes/${n}/index.ts`),
    })),
  ];
}
