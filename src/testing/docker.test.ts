import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// through the package's own export, as a consumer imports it
import { PLAYWRIGHT_IMAGE, PLAYWRIGHT_VERSION, assertInPlaywrightImage } from "design-baseline/testing/docker";

// vitest runs from the repo root; jsdom's import.meta.url is not a file URL
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("pinned Playwright image", () => {
  it("is the image of the pinned Playwright version", () => {
    expect(PLAYWRIGHT_IMAGE).toMatch(
      new RegExp(`^mcr\\.microsoft\\.com/playwright:v${PLAYWRIGHT_VERSION.replace(/\./g, "\\.")}-noble@sha256:[0-9a-f]{64}$`),
    );
  });

  it("names the same digest-pinned image everywhere the tag appears", () => {
    const tagged = /mcr\.microsoft\.com\/playwright:\S+/g;
    for (const f of [".github/workflows/check.yml", "docs/STYLE.md"]) {
      const refs = (read(f).match(tagged) ?? []).map((r) => r.replace(/[`,.)]+$/, ""));
      expect(refs.length, f).toBeGreaterThan(0);
      for (const r of refs) expect(r, f).toBe(PLAYWRIGHT_IMAGE);
    }
  });

  it("mounts .git read-only in the wrapper", () => {
    expect(read("bin/design-baseline-playwright.mjs")).toContain(`/work/.git:ro`);
  });

  it("matches the exact Playwright pins and the CI screenshot job", () => {
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.devDependencies["@playwright/test"]).toBe(PLAYWRIGHT_VERSION);
    expect(pkg.devDependencies["playwright-core"]).toBe(PLAYWRIGHT_VERSION);
    expect(read(".github/workflows/check.yml")).toContain(`image: ${PLAYWRIGHT_IMAGE}`);
  });

  it("refuses to run outside the image, naming the wrapper", () => {
    const prev = process.env.PLAYWRIGHT_BROWSERS_PATH;
    delete process.env.PLAYWRIGHT_BROWSERS_PATH;
    try {
      expect(() => assertInPlaywrightImage()).toThrow(/design-baseline-playwright/);
    } finally {
      if (prev !== undefined) process.env.PLAYWRIGHT_BROWSERS_PATH = prev;
    }
  });
});
