import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// through the package's own export, as a consumer imports it
import { PLAYWRIGHT_IMAGE, PLAYWRIGHT_VERSION, assertInPlaywrightImage } from "design-baseline/testing/docker";

// vitest runs from the repo root; jsdom's import.meta.url is not a file URL
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("pinned Playwright image", () => {
  it("is the image of the pinned Playwright version", () => {
    expect(PLAYWRIGHT_IMAGE).toBe(`mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble`);
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
