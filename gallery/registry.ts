import * as React from "react";
import manifest from "../docs/archetypes/MANIFEST.json";

/**
 * Gallery registry — the single mapping from a baseline archetype to its
 * rendered demo. Everything archetype-specific derives from
 * `docs/archetypes/MANIFEST.json` + two conventions (documented in
 * docs/archetypes/README.md), so promoting a new archetype needs **no edit
 * here**:
 *
 *   1. demo module — the entry's `example` path (always
 *      `src/examples/<slug>-demo.tsx`), resolved against the glob of the
 *      demo directory;
 *   2. demo export — `PascalCase(slug) + "Demo"` (`form-page` → `FormPageDemo`).
 *
 * `kind`, key, slug, displayName, version, spec all come straight from the
 * MANIFEST entry — there is no gallery-local copy of any per-archetype
 * literal.
 *
 * A MANIFEST entry whose demo module or export is missing is NOT dropped:
 * it stays in `ARCHETYPES` with a visible broken-demo card (and a
 * `console.error`), so a promoted archetype can never silently vanish from
 * the gallery.
 *
 * (No JSX in this file — it stays `.ts` so the registry keeps the file name
 * the contract docs reference; the broken card is built with
 * `React.createElement`.)
 */

// Lazily-loaded demo modules: one glob over the conventionally named demo
// files (`src/examples/*-demo.tsx`), each demo still code-splits into its own
// chunk per route.
const demoModules = import.meta.glob("../src/examples/*-demo.tsx", { eager: false });

export type ArchetypeEntry = {
  key: string;
  slug: string;
  displayName: string;
  version: string;
  spec: string;
  kind: string;
  /** Present when the demo module/export could not be resolved; the entry
   *  renders a broken-demo card instead of a demo. */
  broken?: string;
  Demo: React.ComponentType;
};

export type ManifestArchetype = {
  key: string;
  slug: string;
  displayName?: string;
  version: string;
  spec: string;
  kind?: string;
  example?: string;
};

/** The named export every demo file must provide. */
export function demoExportName(slug: string): string {
  return slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("") + "Demo";
}

/** Convention 1 — the demo module for a MANIFEST entry's `example` path,
 *  matched by file name against the glob of the demo directory. */
function demoModuleFor(example: string | undefined): (() => Promise<Record<string, unknown>>) | undefined {
  if (!example) return undefined;
  const base = example.split("/").pop() ?? example;
  const key = Object.keys(demoModules).find((k) => k.endsWith("/" + base) || k.endsWith("\\" + base));
  return key ? (demoModules[key] as () => Promise<Record<string, unknown>>) : undefined;
}

/** Loud-failure card for a MANIFEST entry whose demo can't be rendered. */
function brokenDemo(expectedFile: string, expectedExport: string): React.ComponentType {
  function BrokenDemoCard(): React.ReactElement {
    return React.createElement(
      "div",
      {
        role: "alert",
        className: "m-6 max-w-prose rounded-lg border border-destructive/40 bg-destructive/10 p-6",
      },
      React.createElement(
        "div",
        { className: "text-sm font-semibold text-destructive" },
        `Demo unavailable — ${expectedFile}`,
      ),
      React.createElement(
        "p",
        { className: "mt-2 text-sm text-muted-foreground" },
        "The MANIFEST points at this archetype, but the demo could not be loaded. Fix the demo file or the MANIFEST entry's `example`.",
      ),
      React.createElement(
        "code",
        { className: "mt-3 block text-xs text-muted-foreground" },
        `expected PascalCase export "${expectedExport}"`,
      ),
    );
  }
  return BrokenDemoCard;
}

/** Build the gallery's archetype routes from manifest data alone (against the
 *  glob of the demo directory). Exported so the join — including the
 *  loud-failure cases — is testable against synthetic entries without
 *  touching the real MANIFEST. */
export function buildArchetypes(entries: ManifestArchetype[]): ArchetypeEntry[] {
  return entries.map((a) => {
    const entry = {
      key: a.key,
      slug: a.slug,
      displayName: a.displayName ?? a.slug,
      version: a.version,
      spec: a.spec,
      kind: a.kind ?? "unknown",
    };
    const expectedFile = a.example ?? `src/examples/${a.slug}-demo.tsx`;
    const expectedExport = demoExportName(a.slug);
    const mod = demoModuleFor(a.example);
    if (!mod) {
      console.error(
        `gallery registry: MANIFEST entry "${a.slug}" has no resolvable demo module — expected ${expectedFile}. The entry renders a broken-demo card instead of vanishing.`,
      );
      return {
        ...entry,
        broken: "demo module missing",
        Demo: brokenDemo(expectedFile, expectedExport),
      };
    }
    return {
      ...entry,
      Demo: React.lazy(async () => {
        const m = await mod();
        const comp = m[expectedExport];
        if (!comp) {
          console.error(
            `gallery registry: demo module ${expectedFile} does not export "${expectedExport}" (the PascalCase(slug) + "Demo" convention). The entry renders a broken-demo card instead of vanishing.`,
          );
          return { default: brokenDemo(expectedFile, expectedExport) } as {
            default: React.ComponentType;
          };
        }
        return { default: comp as React.ComponentType };
      }),
    };
  });
}

export const ARCHETYPES: ArchetypeEntry[] = buildArchetypes(
  manifest.archetypes as ManifestArchetype[],
);

export function findArchetype(slug: string | undefined): ArchetypeEntry | undefined {
  return ARCHETYPES.find((a) => a.slug === slug);
}
