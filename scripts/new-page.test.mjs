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

  // Page archetypes deliberately shipped without a template yet: no package
  // consumer imports them today, so a template is added on first need. A new
  // page archetype must land here or in templates/ — the test below fails
  // otherwise, so a missing template is a reviewed decision, never silent.
  const NO_TEMPLATE_YET = [
    "calendar",
    "kanban-board",
    "report",
    "settings-table",
    "statement-with-filters",
    "tabbed-settings",
  ];

  it("templates and the no-template allowlist cover exactly the page archetypes", () => {
    const pages = MANIFEST.archetypes.filter((a) => a.kind === "page").map((a) => a.slug);
    for (const slug of archetypes) expect(pages).toContain(slug);
    for (const slug of NO_TEMPLATE_YET) expect(archetypes).not.toContain(slug);
    expect([...archetypes, ...NO_TEMPLATE_YET].sort()).toEqual([...pages].sort());
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
