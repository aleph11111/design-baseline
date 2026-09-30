// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import * as helper from "./design-baseline-ui.mjs";
import { designBaselineLayout, designBaselineUi } from "./design-baseline-ui.mjs";

const pkgComponents = fileURLToPath(new URL("../components", import.meta.url));

function resolve(plugin: ReturnType<typeof designBaselineUi>, id: string) {
  return (plugin.resolveId as (id: string) => string | null)(id);
}

describe("project-first resolvers", () => {
  const root = mkdtempSync(path.join(tmpdir(), "db-vite-"));
  mkdirSync(path.join(root, "src/components/layout"), { recursive: true });
  writeFileSync(path.join(root, "src/components/layout/Header.tsx"), "");
  mkdirSync(path.join(root, "src/components/ui"), { recursive: true });
  writeFileSync(path.join(root, "src/components/ui/button.tsx"), "");

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it("layout: package copy when the consumer has none", () => {
    expect(resolve(designBaselineLayout(root), "@/components/layout/StatTile")).toBe(
      path.join(pkgComponents, "layout/StatTile.tsx"),
    );
  });

  it("layout: consumer copy shadows the package", () => {
    expect(resolve(designBaselineLayout(root), "@/components/layout/Header?x")).toBe(
      path.join(root, "src/components/layout/Header.tsx?x"),
    );
  });

  it("ui: consumer copy shadows the package", () => {
    expect(resolve(designBaselineUi(root), "@/components/ui/button?x")).toBe(
      path.join(root, "src/components/ui/button.tsx?x"),
    );
  });

  it("each resolver only claims its own kind", () => {
    expect(resolve(designBaselineLayout(root), "@/components/ui/button")).toBeNull();
    expect(resolve(designBaselineUi(root), "@/components/layout/StatTile")).toBeNull();
    expect(resolve(designBaselineUi(root), "@/components/ui/card")).toBe(
      path.join(pkgComponents, "ui/card.tsx"),
    );
  });
});

// tsc cannot see the .mjs exports (types come from the .d.mts), so the
// drift check is runtime: every .mjs export must be declared in the stub.
describe("design-baseline-ui.d.mts", () => {
  it("declares exactly the exports of design-baseline-ui.mjs", () => {
    const stub = readFileSync(new URL("./design-baseline-ui.d.mts", import.meta.url), "utf8");
    const declared = [...stub.matchAll(/^export (?:declare )?function (\w+)/gm)].map((m) => m[1]);
    expect(declared.sort()).toEqual(Object.keys(helper).sort());
  });
});
