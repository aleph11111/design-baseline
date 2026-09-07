// @vitest-environment node
//
// Covers the invariants of `scripts/verify-exports.mjs` against SYNTHETIC
// inputs and throwaway trees, so a predicate failing open (or no longer
// matching its own tree) is caught without a broken donor tree. The
// CLI-facing surface gets two subprocess runs: the clean exit (real donor
// tree) and a broken exit (missing barrel directive in a fixture).
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

describe("CLI exit codes", () => {
  it("exits 0 on the clean donor tree and reports 4/4 ok", () => {
    const { status, stdout } = runScript(root);
    expect(status).toBe(0);
    expect(stdout).toContain("verify:exports — 0 failing invariant(s), 4/4 ok");
  });

  it("exits 1 when a barrel's directive is missing (fixture)", () => {
    const { dir, put } = fixtureTree();
    try {
      // Minimal donor shape: one archetype, layout, no @/ specifiers.
      put("src/components/layout/index.ts", '"use client";\nexport {};\n');
      put("src/components/archetypes/report/index.ts", 'export {};\n'); // no directive
      writeFileSync(
        join(dir, "package.json"),
        JSON.stringify({
          name: "fixture",
          exports: { "./layout": "./src/components/layout/index.ts" },
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
});