// @vitest-environment node
//
// Guards the hand-maintained `.design-sync/typecheck-entry.ts` (previews typecheck against it)
// against drifting from the barrel `build-pkg.mjs` bundles — both derive from src/components via
// `.design-sync/modules.mjs`. Also checks config.json's componentSrcMap paths still exist.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { describe, expect, it } from "vitest";
import { listModules } from "../.design-sync/modules.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (p) => readFileSync(join(root, p), "utf8");

describe("design-sync module lists", () => {
  it("typecheck-entry.ts exports exactly the modules build-pkg.mjs bundles", () => {
    const want = listModules(join(root, "src")).map((m) => m.rel.replace("./components", "@/components")).sort();
    const have = [...read(".design-sync/typecheck-entry.ts").matchAll(/^export \* from "([^"]+)";$/gm)]
      .map((m) => m[1]).sort();
    expect(have).toEqual(want);
  });

  it("config.json componentSrcMap points at existing files", () => {
    const { componentSrcMap } = JSON.parse(read(".design-sync/config.json"));
    for (const p of Object.values(componentSrcMap)) expect(existsSync(join(root, p)), p).toBe(true);
  });
});
