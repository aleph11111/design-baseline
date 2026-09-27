// @vitest-environment node
//
// ADR-0007 §8: the chart palette is fixed by wiring. chart-1 follows the brand
// accent; chart-2..6 read the donor's `--db-chart-*` in both themes, and nothing
// in the layer reads a brand `--chart-*`, so a brand-file declaration is dead.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layer = readFileSync(new URL("./tokens.layer.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const block = (selector: string) => layer.match(new RegExp(`^${selector} \\{([^}]*)\\}`, "m"))?.[1] ?? "";

describe("tokens.layer.css chart palette", () => {
  it("wires chart-1 to --primary and chart-2..6 to --db-chart-*", () => {
    expect(layer).toContain("--color-chart-1: hsl(var(--primary));");
    for (let n = 2; n <= 6; n++) expect(layer).toContain(`--color-chart-${n}: var(--db-chart-${n});`);
  });

  it("declares --db-chart-2..6 for both themes", () => {
    for (const selector of [":root", "\\.dark"]) {
      for (let n = 2; n <= 6; n++) expect(block(selector)).toMatch(new RegExp(`--db-chart-${n}:\\s*hsl\\(`));
    }
  });

  it("never reads a brand --chart-* variable", () => {
    expect(layer).not.toMatch(/var\(--chart-/);
  });
});
