// @vitest-environment node
import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { listArchetypes, parseArgs, renderPage } from "../bin/new-page.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BIN = join(ROOT, "bin/new-page.mjs");
const MANIFEST = JSON.parse(readFileSync(join(ROOT, "docs/archetypes/MANIFEST.json"), "utf8"));

// The temp dir must sit inside the package: the generated pages import
// `design-baseline/archetypes/<slug>`, which tsc resolves through the
// package's own `exports` (self-reference) exactly as a consumer resolves it
// through node_modules.
function withTempDir(fn) {
  const dir = mkdtempSync(join(ROOT, ".new-page-test-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function runBin(args, cwd) {
  return spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: "utf8" });
}

describe("new-page templates", () => {
  const archetypes = listArchetypes();

  // Two-way: a new page archetype cannot land without a template.
  it("templates cover exactly the MANIFEST page archetypes", () => {
    const pages = MANIFEST.archetypes.filter((a) => a.kind === "page").map((a) => a.slug);
    expect([...archetypes].sort()).toEqual([...pages].sort());
  });

  // Own archetype subpath only, plus the consumer-local seams every package
  // consumer has: its `@/components/ui/*` alias (docs/PACKAGE.md wiring line 2)
  // and react / react-hook-form.
  it.each(archetypes)("%s imports only its own archetype subpath and consumer-local paths", (slug) => {
    const source = renderPage(slug, "Widget");
    expect(source).not.toContain("__Name__");
    expect(source).toContain(`from "design-baseline/archetypes/${slug}"`);
    const specifiers = [...source.matchAll(/from "([^"]+)"/g)].map((m) => m[1]);
    for (const spec of specifiers) {
      const allowed = ["react", "react-hook-form", `design-baseline/archetypes/${slug}`];
      if (!allowed.includes(spec)) expect(spec).toMatch(/^@\/components\/ui\/[a-z-]+$/);
    }
  });

  // Every template renders the loading, error and empty planes, through the
  // shell's state props or StateView, unless its contract puts that plane
  // somewhere else. Each exemption names that contract reason; docs/PACKAGE.md
  // mirrors this list.
  const PLANES = {
    loading: /isLoading=\{|variant="loading"/,
    error: /\berror=\{|variant="error"|setError\(|role="alert"/,
    empty: /isEmpty=\{|emptyMessage=|emptyStateMessage=|emptyState=|\bempty=\{|variant="empty"/,
  };
  const EXEMPT = {
    "detail-overview": {
      loading: "route-owned (contract Layer 7)",
      error: "route-owned (contract Layer 7)",
      empty: "a missing entity is the route's notFound() (contract Layer 7)",
    },
    "matrix-grid": {
      loading: "route-owned (README Layer 7: M delegates it)",
      error: "route-owned (README Layer 7: M delegates it)",
    },
    "form-page": {
      loading: "initial values resolve before the form renders (contract Layer 7)",
      empty: "a form has no empty plane",
    },
    "import-wizard": {
      loading: "no page-level fetch; the wizard starts from user input",
      empty: "no page-level fetch; the wizard starts from user input",
    },
    calendar: { empty: "an empty day renders emptyDayLabel; an empty range is still the grid (contract)" },
  };

  it("every exemption names a template", () => {
    for (const slug of Object.keys(EXEMPT)) expect(archetypes).toContain(slug);
  });

  it.each(archetypes)("%s renders every state plane its contract gives the page", (slug) => {
    const source = renderPage(slug, "Widget");
    for (const [plane, marker] of Object.entries(PLANES)) {
      if (EXEMPT[slug]?.[plane]) continue;
      expect(source, `${slug} renders no ${plane} plane`).toMatch(marker);
    }
  });

  it("every generated page passes tsc against the package", () => {
    withTempDir((dir) => {
      for (const slug of archetypes) {
        const result = runBin([slug, "Widget", "--out", join(dir, slug)], ROOT);
        expect(result.status, result.stderr).toBe(0);
      }
      writeFileSync(
        join(dir, "tsconfig.json"),
        JSON.stringify({ extends: "../tsconfig.json", compilerOptions: { baseUrl: ".." }, include: ["./**/*.tsx"] }),
      );
      const tsc = spawnSync(process.execPath, [join(ROOT, "node_modules/typescript/bin/tsc"), "--noEmit", "-p", dir], {
        encoding: "utf8",
      });
      expect(tsc.status, tsc.stdout + tsc.stderr).toBe(0);
    });
  }, 120_000);
});

describe("new-page cli", () => {
  it("parses the bin form and rejects bad input", () => {
    expect(parseArgs(["new-page", "form-page", "Supplier"])).toMatchObject({
      archetype: "form-page",
      name: "Supplier",
      out: ".",
    });
    expect(parseArgs(["nope", "Supplier"]).error).toMatch(/unknown archetype/);
    expect(parseArgs(["form-page", "supplier"]).error).toMatch(/PascalCase/);
    expect(parseArgs(["form-page"]).error).toMatch(/expected/);
    expect(parseArgs(["form-page", "Supplier", "--out"]).error).toMatch(/needs a value/);
  });

  it("refuses to overwrite and runs --register with the page env", () => {
    withTempDir((dir) => {
      const log = join(dir, "register.log");
      const register = `node -e "require('fs').writeFileSync('${log}', [process.env.DESIGN_BASELINE_PAGE_ARCHETYPE, process.env.DESIGN_BASELINE_PAGE_NAME, process.env.DESIGN_BASELINE_PAGE_FILE].join(' '))"`;
      const first = runBin(["form-page", "Supplier", "--register", register], dir);
      expect(first.status, first.stderr).toBe(0);
      const file = join(dir, "SupplierPage.tsx");
      expect(existsSync(file)).toBe(true);
      expect(readFileSync(log, "utf8")).toBe(`form-page Supplier ${file}`);

      const second = runBin(["form-page", "Supplier"], dir);
      expect(second.status).toBe(1);
      expect(second.stderr).toMatch(/already exists/);
    });
  });

  it("propagates a failing --register command and removes the page so a re-run works", () => {
    withTempDir((dir) => {
      const result = runBin(["form-page", "Supplier", "--register", "exit 3"], dir);
      expect(result.status).toBe(3);
      expect(existsSync(join(dir, "SupplierPage.tsx"))).toBe(false);
      const retry = runBin(["form-page", "Supplier", "--register", "true"], dir);
      expect(retry.status, retry.stderr).toBe(0);
    });
  });
});
