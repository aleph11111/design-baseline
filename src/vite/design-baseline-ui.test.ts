// @vitest-environment node
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { designBaselineLayout, designBaselineUi } from "./design-baseline-ui.mjs";

const pkgComponents = fileURLToPath(new URL("../components", import.meta.url));

function resolve(plugin: ReturnType<typeof designBaselineUi>, id: string) {
  return (plugin.resolveId as (id: string) => string | null)(id);
}

describe("project-first resolvers", () => {
  const root = mkdtempSync(path.join(tmpdir(), "db-vite-"));
  mkdirSync(path.join(root, "src/components/layout"), { recursive: true });
  writeFileSync(path.join(root, "src/components/layout/Header.tsx"), "");

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

  it("each resolver only claims its own kind", () => {
    expect(resolve(designBaselineLayout(root), "@/components/ui/button")).toBeNull();
    expect(resolve(designBaselineUi(root), "@/components/layout/StatTile")).toBeNull();
    expect(resolve(designBaselineUi(root), "@/components/ui/button")).toBe(
      path.join(pkgComponents, "ui/button.tsx"),
    );
  });
});
