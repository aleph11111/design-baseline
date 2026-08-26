/**
 * The gallery registry derives its routes from the MANIFEST + two naming
 * conventions (file and export) — nothing per-archetype is hand-listed here.
 * These tests pin the join:
 *
 *  - the healthy join against the real MANIFEST (every entry resolves its
 *    demo module + conventional export; every MANIFEST slug appears);
 *  - the unclaimed-demo set: `-demo` files no MANIFEST entry claims are
 *    exactly the layout demo — `section-nav-demo` is excluded from the
 *    archetype list by the join itself, not by a name filter;
 *  - the loud failure: a MANIFEST entry whose demo module or export is
 *    missing renders a visible broken-demo card instead of vanishing, and
 *    logs a console.error.
 *
 * Broken entries are built straight into `buildArchetypes` (the same join
 * the real ARCHETYPES uses) from synthetic entries, so the real MANIFEST is
 * never touched. The missing-EXPORT case renders through @testing-library/react
 * (client-side, jsdom) — the gallery's actual runtime — because React's client
 * reconciler suspends and then resolves the lazy component; console.error is
 * captured BEFORE `mockRestore()` (restore clears the recorded calls).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { ARCHETYPES, buildArchetypes, demoExportName, type ManifestArchetype } from "./registry";
import manifestJson from "../docs/archetypes/MANIFEST.json";

type ManifestShape = {
  archetypes: { slug: string; example?: string }[];
};

// The real MANIFEST — a static import (not require) so the registry's own JSON
// import is exercised and no Node global is needed.
const manifest = manifestJson as unknown as ManifestShape;

// One glob (the same `*-demo` pattern the registry uses), shared by the
// registry under test and this suite. (import.meta.glob requires a string
// literal — no concatenation.)
const demoModules = import.meta.glob("../src/examples/*-demo.tsx", { eager: false });

/** A demo file's glob loader, resolved from a MANIFEST `example` the same way
 *  the registry does (file-name match against the glob of the demo dir). */
function demoModuleFor(example: string | undefined): (() => Promise<Record<string, unknown>>) | undefined {
  if (!example) return undefined;
  const base = example.split("/").pop();
  const key = Object.keys(demoModules).find((k) => k.endsWith("/" + base) || k.endsWith("\\" + base));
  return key ? (demoModules[key] as () => Promise<Record<string, unknown>>) : undefined;
}

afterEach(() => {
  cleanup();
});

describe("healthy join (real MANIFEST)", () => {
  it("resolves every MANIFEST archetype — nothing is silently dropped", () => {
    expect(ARCHETYPES).toHaveLength(manifest.archetypes.length);
    expect(new Set(ARCHETYPES.map((a) => a.slug))).toEqual(new Set(manifest.archetypes.map((x) => x.slug)));
  });

  it("carries kind from the MANIFEST entry — no entry is broken or unknown", () => {
    for (const a of ARCHETYPES) {
      expect(a.broken, `${a.slug} is marked broken`).toBeUndefined();
      expect(["page", "dialog", "component"], `${a.slug} kind`).toContain(a.kind);
    }
  });

  it("resolves the conventional export in every demo module", async () => {
    for (const entry of manifest.archetypes) {
      const a = ARCHETYPES.find((x) => x.slug === entry.slug);
      expect(a, `${entry.slug} is in ARCHETYPES`).toBeDefined();
      const mod = demoModuleFor(entry.example);
      expect(mod !== undefined, `${entry.slug}: demo module resolvable`).toBe(true);
      const modRecord = await (mod as () => Promise<Record<string, unknown>>)();
      expect(modRecord[demoExportName(entry.slug)], `${entry.slug}: export present`).toBeDefined();
    }
  }, 30_000);
});

describe("demo file/export convention", () => {
  it("PascalCase(slug) + 'Demo' for the documented slugs", () => {
    expect(demoExportName("raw-input")).toBe("RawInputDemo");
    expect(demoExportName("form-page")).toBe("FormPageDemo");
    expect(demoExportName("statement-with-filters")).toBe("StatementWithFiltersDemo");
    expect(demoExportName("list-with-detail")).toBe("ListWithDetailDemo");
  });

  it("every demo file a MANIFEST entry claims is named <slug>-demo.tsx", () => {
    for (const m of manifest.archetypes) {
      expect(m.example?.split("/").pop(), `${m.slug} example suffix`).toBe(`${m.slug}-demo.tsx`);
    }
  });
});

describe("unclaimed demo files (layout demos excluded by the join, not by name)", () => {
  it("the unclaimed set is exactly section-nav-demo.tsx", () => {
    const claimedBases = new Set(
      manifest.archetypes.map((x) => (x.example ? x.example.split("/").pop() : undefined)),
    );
    const unclaimed = Object.keys(demoModules)
      .map((k) => k.split("/").pop() as string)
      .filter((f) => !claimedBases.has(f));
    expect(unclaimed).toEqual(["section-nav-demo.tsx"]);
    expect(ARCHETYPES.some((a) => a.slug === "section-nav")).toBe(false);
  });
});

// Three synthetic MANIFEST entries: one pointing at a real, correctly-named
// demo; one pointing at a module that does not exist; and one pointing at a
// real module whose conventional export is missing. No new demo files created,
// so the healthy-join invariant (unclaimed set == section-nav) is untouched.
const SYNTHETIC_ENTRIES: ManifestArchetype[] = [
  {
    key: "H1",
    slug: "raw-input",
    displayName: "Raw input (healthy synthetic)",
    kind: "component",
    version: "1.0",
    spec: "docs/archetypes/raw-input.md",
    example: "src/examples/raw-input-demo.tsx", // real file, real export RawInputDemo
  },
  {
    key: "G1",
    slug: "ghost-arch",
    displayName: "Ghost",
    kind: "page",
    version: "1.0",
    spec: "docs/archetypes/ghost-arch.md",
    example: "src/examples/ghost-arch-demo.tsx", // does not exist in src/examples
  },
  {
    key: "X1",
    slug: "raw-inputs", // plural — the conventional export is RawInputsDemo
    displayName: "Misnamed",
    kind: "component",
    version: "1.0",
    spec: "docs/archetypes/raw-inputs.md",
    // resolvable module (matches the *-demo glob) but it exports RawInputDemo,
    // not RawInputsDemo, so the join's missing-export branch fires.
    example: "src/examples/raw-input-demo.tsx",
  },
];

describe("loud failure (synthetic MANIFEST entries)", () => {
  // console.error logs one template string per call; capture the raw calls
  // BEFORE mockRestore (which clears mock.calls) so both the slug and reason
  // can be asserted against a single joined string.
  function errorLogs(spy: ReturnType<typeof vi.spyOn>): string[] {
    return spy.mock.calls.map((a: unknown[]) => a.map(String).join(" "));
  }

  it("missing demo module: stays in the list, broken card + console.error (sync)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const entries = buildArchetypes(SYNTHETIC_ENTRIES);
    const logs = errorLogs(spy);
    spy.mockRestore();

    const ghost = entries.find((a) => a.slug === "ghost-arch");
    expect(ghost, "ghost entry is present (not dropped)").toBeDefined();
    expect(ghost?.broken, "ghost entry is flagged broken").toBeTruthy();
    expect(logs.some((l) => l.includes("ghost-arch") && l.includes("no resolvable demo module"))).toBe(true);
    expect(renderToStaticMarkup(React.createElement(ghost!.Demo))).toContain("Demo unavailable");
  });

  it("missing demo export: lazily resolves to the broken card + console.error", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const entries = buildArchetypes(SYNTHETIC_ENTRIES);
    const broken = entries.find((a) => a.slug === "raw-inputs");
    expect(broken, "entry is present (not dropped)").toBeDefined();
    expect(broken?.broken).toBeUndefined(); // only known once the module loads

    // Client-side render (the gallery's real runtime): React suspends, the
    // lazy loader imports the real module, finds no RawInputsDemo, logs,
    // and renders the broken card. findByText awaits that resolve.
    const Demo = broken!.Demo;
    render(
      <React.Suspense fallback={<div>fb</div>}>
        <Demo />
      </React.Suspense>,
    );
    const card = (await screen.findByText(/Demo unavailable/, undefined, { timeout: 5000 })).closest('[role="alert"]');
    const logs = errorLogs(spy);
    spy.mockRestore();
    expect(card, "card is inside the role=alert wrapper").toBeTruthy();
    expect(
      logs.some(
        (l) =>
          l.includes("raw-input-demo.tsx") &&
          l.includes("does not export") &&
          l.includes("RawInputsDemo"),
      ),
      "missing-export log names the demo file and the expected export",
    ).toBe(true);
  });

  it("healthy synthetic entry (raw-input) resolves its conventional export", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const entries = buildArchetypes(SYNTHETIC_ENTRIES);
    spy.mockRestore();
    const page = entries.find((a) => a.slug === "raw-input");
    expect(page?.broken).toBeUndefined();
    expect(page?.kind).toBe("component");
    const mod = (await import("../src/examples/raw-input-demo")) as Record<string, unknown>;
    expect(typeof mod.RawInputDemo, "RawInputDemo is a component").toBe("function");
  });
});
