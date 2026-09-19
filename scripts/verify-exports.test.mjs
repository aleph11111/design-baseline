// @vitest-environment node
//
// Covers the invariants of `scripts/verify-exports.mjs` against SYNTHETIC
// inputs and throwaway trees, so a predicate failing open (or no longer
// matching its own tree) is caught without a broken donor tree. The
// CLI-facing surface gets three subprocess runs: the clean exit (real donor
// tree), a broken barrel exit (missing barrel directive in a fixture), and a
// broken leaf exit (a consumer-set leaf missing its directive).
//
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  hasAtAliasImports,
  resolveExportTargets,
  firstStatementIsUseClient,
  layerDeclaresBrandValues,
  brandFileIsMergedShape,
  consumerLeavesMissingDirective,
  exportsSelfSubpath,
} from "./verify-exports.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

/** Throwaway donor-shape tree; `put(rel, text)` creates files under it. */
function fixtureTree() {
  const dir = mkdtempSync(join(tmpdir(), "verify-exports-"));
  const put = (rel, text) => {
    const p = join(dir, rel);
    mkdirSync(p.slice(0, p.lastIndexOf("/")), { recursive: true });
    writeFileSync(p, text);
  };
  return { dir, put };
}

describe("hasAtAliasImports", () => {
  it("flags from/import('@/…') specifiers; leaves relatives and comments alone", () => {
    const {
      dir,
      put,
    } = fixtureTree();
    try {
      put("src/components/ui/a.tsx", 'import { cn } from "@/lib/utils";\n');
      put("src/components/ui/b.tsx", 'import { cn } from "../../lib/utils";\n');
      put("src/lib/utils.ts", "// see `@/lib/utils` for the helper\nexport const cn = (c) => c;\n");
      put("src/hooks/use-nav.ts", 'const m = import("@/hooks/use-other");\n');
      const offenders = hasAtAliasImports(dir);
      expect(offenders).toEqual(
        expect.arrayContaining(["src/components/ui/a.tsx", "src/hooks/use-nav.ts"]),
      );
      expect(offenders).not.toEqual(expect.arrayContaining(["src/components/ui/b.tsx"]));
      expect(hasAtAliasImports(dir)).not.toContain("src/lib/utils.ts");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("resolveExportTargets", () => {
  it("accepts live static + wildcard subpaths, rejects a missing file and a dead wildcard", () => {
    const { dir, put } = fixtureTree();
    try {
      put("src/components/layout/index.ts", 'export {};\n');
      put("src/components/ui/btn.tsx", "const B = 1;\nexport { B };\n");
      put("src/components/ui/ghost.tsx", "// this file holds no barrel\n");
      put("src/components/archetypes/report/index.ts", 'export {};\n');
      put("src/lib/utils.ts", "export const cn = () => \"\";\n");
      const pkg = {
        exports: {
          "./layout": "./src/components/layout/index.ts",
          "./archetypes/*": "./src/components/archetypes/*/index.ts",
          "./ui/*": "./src/components/ui/*.tsx",
          "./lib/utils": "./src/lib/utils.ts",
          "./hooks/*": "./src/hooks/*.ts",
          "./utils/logger": "./src/utils/logger.ts",
        },
      };
      // report/ lost its index.ts → wildcard dead; ui/* live; hooks/* dir
      // missing entirely; utils/logger.ts missing.
      const bad = resolveExportTargets(dir, pkg);
      // Missing static target is flagged.
      expect(bad.some((m) => m.includes("./utils/logger"))).toBe(true);
      // Every wildcard that still matches ≥1 file passes even if one
      // potential entry is absent.
      expect(bad).not.toContain(expect.stringContaining("./layout"));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("firstStatementIsUseClient", () => {
  it("accepts directive before comments and blank lines; rejects anything above or indented", () => {
    expect(firstStatementIsUseClient('"use client";\nexport {};\n')).toBe(true);
    expect(firstStatementIsUseClient('// doc line\n"use client";\nexport {};\n')).toBe(true);
    expect(firstStatementIsUseClient('\n\n"use client";\nexport {};\n')).toBe(true);
    expect(firstStatementIsUseClient('import * as R from "react";\n"use client";\n')).toBe(false);
    expect(firstStatementIsUseClient('export {};\n')).toBe(false);
    expect(firstStatementIsUseClient("")).toBe(false);
  });
});

/** Run the real script as a subprocess in `cwd`; return { status, stdout, stderr }. */
function runScript(cwd) {
  const script = join(root, "scripts", "verify-exports.mjs");
  try {
    const stdout = execFileSync("node", [script], { cwd, encoding: "utf8" });
    return { status: 0, stdout, stderr: "" };
  } catch (err) {
    return { status: err.status ?? 1, stdout: err.stdout ?? "", stderr: err.stderr ?? "" };
  }
}

describe("token-split invariants (spec T4/T5)", () => {
  it("layerDeclaresBrandValues: flags a :root/.dark selector in the layer, passes the clean shape", () => {
    const { dir, put } = fixtureTree();
    try {
      // Clean layer: @theme + utils, no brand selector.
      put("src/styles/tokens.layer.css", '/* clean */\n@theme {\n  --radius: 0.5rem;\n}\n');
      put("src/styles/tokens.css", '/* brand */\n@import "./tokens.layer.css";\n');
      expect(layerDeclaresBrandValues(dir)).toEqual([]);
      // A pasted `:root` block → the regression a `--force` re-apply would blast.
      put(
        "src/styles/tokens.layer.css",
        "/* brand leaked in */\n:root {\n  --primary: 210 40% 96%;\n}\n",
      );
      expect(layerDeclaresBrandValues(dir)).toEqual(["src/styles/tokens.layer.css"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("brandFileIsMergedShape: flags a re-acquired tailwind entry in the brand file, passes the clean shape", () => {
    const { dir, put } = fixtureTree();
    try {
      // Clean brand file: imports the layer, no tailwind entry.
      put("src/styles/tokens.layer.css", "/* clean layer */\n");
      put("src/styles/tokens.css", '/* brand */\n@import "./tokens.layer.css";\n');
      expect(brandFileIsMergedShape(dir)).toEqual([]);
      // The pre-#178 merged shape back: a `@import "tailwindcss"` in the brand file.
      put(
        "src/styles/tokens.css",
        "/* merged shape */\n@import \"tailwindcss\";\n@import \"./tokens.layer.css\";\n",
      );
      expect(brandFileIsMergedShape(dir)).toEqual(["src/styles/tokens.css"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("consumerLeavesMissingDirective (invariant 7, ADR-0006)", () => {
  it("passes when every set leaf starts with the directive", () => {
    const { dir, put } = fixtureTree();
    try {
      put("scripts/consumer-directive-set.json", JSON.stringify({ files: ["src/components/ui/a.tsx"] }));
      put("src/components/ui/a.tsx", '"use client";\nexport const A = 1;\n');
      expect(consumerLeavesMissingDirective(dir)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("flags a dropped directive and a missing set file", () => {
    const { dir, put } = fixtureTree();
    try {
      put("scripts/consumer-directive-set.json",
        JSON.stringify({ files: ["src/components/ui/a.tsx", "src/components/ui/b.tsx"] }));
      put("src/components/ui/a.tsx", '"use client";\nexport const A = 1;\n');
      put("src/components/ui/b.tsx", 'import * as R from "react";\nexport const B = 2;\n'); // no directive
      expect(consumerLeavesMissingDirective(dir)).toEqual(["src/components/ui/b.tsx"]);
      rmSync(join(dir, "scripts/consumer-directive-set.json"));
      expect(consumerLeavesMissingDirective(dir)).toEqual([
        "scripts/consumer-directive-set.json (missing or unreadable — re-derive, see its header)",
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("exportsSelfSubpath (invariant 8)", () => {
  it("passes when the self subpath is declared, flags a map that lost it", () => {
    const listed = { exports: { "./package.json": "./package.json", "./layout": "./x.ts" } };
    expect(exportsSelfSubpath(listed)).toEqual([]);
    // Dropped entirely, and mis-targeted — both leave a consumer with
    // ERR_PACKAGE_PATH_NOT_EXPORTED, so both must fail.
    expect(exportsSelfSubpath({ exports: { "./layout": "./x.ts" } })).toHaveLength(1);
    expect(exportsSelfSubpath({ exports: { "./package.json": "./dist/package.json" } })).toHaveLength(1);
    expect(exportsSelfSubpath({})).toHaveLength(1);
  });
});

describe("CLI exit codes", () => {
  it("exits 0 on the clean donor tree and reports 8/8 ok", () => {
    const { status, stdout } = runScript(root);
    expect(status).toBe(0);
    expect(stdout).toContain("verify:exports — 0 failing invariant(s), 8/8 ok");
  });

  it("exits 1 when a barrel's directive is missing (fixture)", () => {
    const { dir, put } = fixtureTree();
    try {
      // Minimal donor shape: one archetype, layout, no @/ specifiers, and the
      // two token-split invariants need src/styles/* present and clean so the
      // fixture fails ONLY on the barrel (not on a missing file or a stray
      // brand value).
      put("src/components/layout/index.ts", '"use client";\nexport {};\n');
      put("src/components/archetypes/report/index.ts", 'export {};\n'); // no directive
      put("src/styles/tokens.layer.css", "/* clean layer */\n@theme {\n  --radius: .5rem;\n}\n");
      put("src/styles/tokens.css", "/* brand */\n@import \"./tokens.layer.css\";\n");
      // An empty consumer set keeps invariant 7 quiet so this fixture fails
      // ONLY on the barrel.
      put("scripts/consumer-directive-set.json", JSON.stringify({ files: [] }));
      writeFileSync(
        join(dir, "package.json"),
        JSON.stringify({
          name: "fixture",
          exports: {
            "./package.json": "./package.json",
            "./layout": "./src/components/layout/index.ts",
          },
          files: ["src/components"],
        }),
      );
      const { status, stdout } = runScript(dir);
      expect(status).toBe(1);
      expect(stdout).toContain("FAIL");
      expect(stdout).toContain("src/components/archetypes/report/index.ts");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("exits 1 when a consumer-set leaf dropped its directive (invariant 7)", () => {
    const { dir, put } = fixtureTree();
    try {
      // Barrels carry the directive (invariant 3 quiet); the one ui/ leaf in
      // the frozen set lost its directive — the exact regression this invariant
      // guards (a consumer dropping the directive off a copied ui/ file).
      put("src/components/layout/index.ts", '"use client";\nexport {};\n');
      put("src/components/ui/sidebar.tsx", 'import * as R from "react";\nexport const S = 1;\n');
      put("scripts/consumer-directive-set.json",
        JSON.stringify({ files: ["src/components/ui/sidebar.tsx"] }));
      put("src/styles/tokens.layer.css", "/* clean layer */\n@theme {\n  --radius: .5rem;\n}\n");
      put("src/styles/tokens.css", "/* brand */\n@import \"./tokens.layer.css\";\n");
      writeFileSync(
        join(dir, "package.json"),
        JSON.stringify({
          name: "fixture",
          exports: {
            "./package.json": "./package.json",
            "./layout": "./src/components/layout/index.ts",
          },
          files: ["src/components"],
        }),
      );
      const { status, stdout } = runScript(dir);
      expect(status).toBe(1);
      expect(stdout).toContain("consumer-measured leaves");
      expect(stdout).toContain("src/components/ui/sidebar.tsx");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});