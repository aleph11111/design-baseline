// One baseline per kind:page archetype per device (playwright.config.mjs).
import fs from "node:fs";
import { expect, test } from "@playwright/test";

const manifest = JSON.parse(fs.readFileSync(new URL("../docs/archetypes/MANIFEST.json", import.meta.url), "utf8"));

for (const { slug } of manifest.archetypes.filter((a) => a.kind === "page")) {
  test(slug, async ({ page }) => {
    // demos derive "today" from the clock; pin it so baselines don't move daily
    await page.clock.setFixedTime(new Date("2026-10-29T10:00:00Z"));
    await page.goto(`/#/a/${slug}`);
    await page.waitForSelector(".db-content-column h1");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    // pixel budget, not a ratio: a ratio gives the 390x844 phone only ~330 px, below CI's
    // run-to-run noise there (352-610 px, runs 40859802818..40860402722); floor it at 1500
    const { width, height } = page.viewportSize();
    await expect(page).toHaveScreenshot(`${slug}.png`, { maxDiffPixels: Math.max(1500, Math.round(width * height * 0.001)) });
  });
}
