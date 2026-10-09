// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { labelsEn } from "./labels";

// Class-level sweep: no English default string from the preset may be re-inlined
// as a literal in a component — every default reads the provider.
// `completed`/`current`/`upcoming` are also state enum values, so they are skipped.
const SKIP = new Set(["completed", "current", "upcoming", "pagination"]);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.tsx?$/.test(n) && !/\.test\.tsx?$/.test(n) ? [p] : [];
  });
}

describe("label sweep", () => {
  it("no component inlines a preset English default", () => {
    const literals = Object.values(labelsEn)
      .flatMap((v) => (typeof v === "string" ? [v] : Array.isArray(v) ? [...v] : []))
      .filter((v) => !SKIP.has(v));
    const hits: string[] = [];
    for (const file of walk(join(process.cwd(), "src/components"))) {
      const code = readFileSync(file, "utf8")
        .split("\n")
        .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l));
      for (const line of code) {
        for (const lit of literals) {
          if (line.includes(`"${lit}"`) || line.includes(`'${lit}'`)) hits.push(`${file}: ${lit}`);
        }
      }
    }
    expect(hits).toEqual([]);
  });
});
